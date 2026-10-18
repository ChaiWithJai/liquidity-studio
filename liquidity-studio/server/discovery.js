import https from "node:https";
import dns from "node:dns/promises";
import net from "node:net";
import { fail } from "./auth.js";
function publicAddress(address) {
  if (net.isIP(address) === 6) return /^[23]/.test(address);
  const p = address.split(".").map(Number);
  return (
    net.isIP(address) === 4 &&
    p[0] !== 0 &&
    p[0] !== 10 &&
    p[0] !== 127 &&
    p[0] < 224 &&
    !(p[0] === 169 && p[1] === 254) &&
    !(p[0] === 172 && p[1] >= 16 && p[1] <= 31) &&
    !(p[0] === 192 && p[1] === 168) &&
    !(p[0] === 100 && p[1] >= 64 && p[1] <= 127) &&
    !(p[0] === 198 && [18, 19].includes(p[1]))
  );
}
export function validateFeedUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw fail(400, "Invalid feed URL");
  }
  const allowed = (process.env.STUDIO_DISCOVERY_HOSTS || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    !allowed.includes(url.hostname) ||
    net.isIP(url.hostname)
  )
    throw fail(400, "Feed host is not allowed");
  return url;
}
// Node22 auto-family lookup asks for an array when options.all is true.
export function pinnedLookup(address) {
  return (_host, options, callback) =>
    options?.all
      ? callback(null, [{ address: address.address, family: address.family }])
      : callback(null, address.address, address.family);
}
export async function fetchFeed(value) {
  const url = validateFeedUrl(value);
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (
    !addresses.length ||
    addresses.some((item) => !publicAddress(item.address))
  )
    throw fail(400, "Feed resolves to a private address");
  const address = addresses[0];
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        lookup: pinnedLookup(address),
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(fail(502, "Feed request failed"));
          return;
        }
        let size = 0;
        const chunks = [];
        res.on("data", (chunk) => {
          size += chunk.length;
          if (size > 1048576) {
            req.destroy();
            reject(fail(502, "Feed response too large"));
          } else chunks.push(chunk);
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString()));
          } catch {
            reject(fail(502, "Feed returned invalid JSON"));
          }
        });
        res.on("error", () => reject(fail(502, "Feed response failed")));
      },
    );
    req.setTimeout(5000, () => {
      req.destroy();
      reject(fail(504, "Feed timeout"));
    });
    req.on("error", () => reject(fail(502, "Feed unavailable")));
  });
}
export function normalizeFeed(payload) {
  if (!Array.isArray(payload?.items) || payload.items.length > 100)
    throw fail(400, "Feed items must be an array of up to 100 stories");
  return payload.items.map((item) => {
    if (
      typeof item.sourceId !== "string" ||
      !item.sourceId ||
      item.sourceId.length > 256 ||
      typeof item.title !== "string" ||
      !item.title.trim() ||
      item.title.length > 300 ||
      !Array.isArray(item.sourceClaims) ||
      !item.sourceClaims.length ||
      item.sourceClaims.length > 30
    )
      throw fail(400, "Invalid feed story");
    return {
      sourceId: item.sourceId,
      title: item.title,
      sourceClaims: item.sourceClaims.map((claim, index) => {
        let url;
        try {
          url = new URL(claim.sourceUrl);
        } catch {
          throw fail(400, "Invalid feed source URL");
        }
        if (
          url.protocol !== "https:" ||
          typeof claim.text !== "string" ||
          !claim.text ||
          claim.text.length > 3000
        )
          throw fail(400, "Invalid feed claim");
        return {
          id: String(index),
          text: claim.text,
          sourceUrl: url.href,
          status: "unreviewed",
          ...(claim.kind ? { kind: claim.kind } : {}),
        };
      }),
    };
  });
}
export async function discoverInto(repo, fetcher = fetchFeed) {
  const config = (await repo.read()).discovery;
  if (!config?.feedUrl) return { added: 0, configured: false };
  const stories = normalizeFeed(await fetcher(config.feedUrl));
  return { added: await repo.ingestStories(stories), configured: true };
}
