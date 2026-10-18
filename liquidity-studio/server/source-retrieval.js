import https from "node:https";
import dns from "node:dns/promises";
import net from "node:net";
import { createHash } from "node:crypto";
import { fail } from "./auth.js";
import { pinnedLookup } from "./discovery.js";
import { DEFAULT_SOURCE_HOSTS } from "./source-catalog.js";

const MAX_BYTES = 512 * 1024;
const MAX_TEXT = 24000;
const DEADLINE_MS = 8000;
const sha = (value) => createHash("sha256").update(value).digest("hex");

export function validateSourceUrl(
  value,
  hosts = process.env.STUDIO_SOURCE_HOSTS || DEFAULT_SOURCE_HOSTS,
) {
  if (typeof value !== "string" || value.length > 2048)
    throw fail(400, "Invalid source URL");
  let url;
  try {
    url = new URL(value);
  } catch {
    throw fail(400, "Invalid source URL");
  }
  const allowed = hosts
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash ||
    (url.port && url.port !== "443") ||
    net.isIP(url.hostname) ||
    !allowed.includes(url.hostname)
  )
    throw fail(400, "Source host is not allowed");
  return url;
}

export function isPublicSourceAddress(address) {
  if (net.isIP(address) === 6) return /^[23]/.test(address);
  if (net.isIP(address) !== 4) return false;
  const [a, b] = address.split(".").map(Number);
  return (
    a !== 0 &&
    a !== 10 &&
    a !== 127 &&
    a < 224 &&
    !(a === 169 && b === 254) &&
    !(a === 172 && b >= 16 && b <= 31) &&
    !(a === 192 && (b === 168 || b === 0)) &&
    !(a === 100 && b >= 64 && b <= 127) &&
    !(a === 198 && [18, 19].includes(b))
  );
}

function entities(text) {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
    (whole, value) => {
      const named = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: '"',
        apos: "'",
        nbsp: " ",
      };
      if (named[value.toLowerCase()]) return named[value.toLowerCase()];
      const number =
        value[1]?.toLowerCase() === "x"
          ? parseInt(value.slice(2), 16)
          : Number(value.slice(1));
      return Number.isInteger(number) &&
        number > 0 &&
        number <= 0x10ffff &&
        !(number >= 0xd800 && number <= 0xdfff)
        ? String.fromCodePoint(number)
        : whole;
    },
  );
}

/** Plain extractive evidence, never markup or an approved factual assertion. */
export function extractSourceText(body, contentType, query = "") {
  const type = contentType.split(";")[0].trim().toLowerCase();
  if (!["text/plain", "text/html", "application/xhtml+xml"].includes(type))
    throw fail(422, "Source must return HTML or plain text");
  let text = body;
  if (type !== "text/plain") {
    const article = text.match(/<article\b[^>]*>([\s\S]*?)<\/article\s*>/i);
    const main = text.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i);
    text = article?.[1] || main?.[1] || text;
    text = text
      .replace(/[\r\n]+/g, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(
        /<(script|style|noscript|svg|nav|header|footer|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
        " ",
      )
      .replace(/<\/(p|div|section|article|li|h[1-6]|tr)\s*>/gi, "\n")
      .replace(/<[^>]*>/g, " ");
    text = entities(text);
  }
  let paragraphs = text
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
  // Retrieval selects source text, not assertions. Every selected word remains an exact excerpt.
  const terms = [
    ...new Set(
      String(query)
        .toLowerCase()
        .match(/[a-z]{4,}/g) || [],
    ),
  ].slice(0, 64);
  if (terms.length) {
    const ranked = paragraphs.map((paragraph, index) => ({
      paragraph,
      index,
      score: terms.filter((term) =>
        new RegExp(`\\b${term.replace(/s$/, "")}s?\\b`, "i").test(paragraph),
      ).length,
    }));
    ranked.sort((a, b) => b.score - a.score || a.index - b.index);
    if (ranked[0]?.score > 0)
      paragraphs = ranked
        .filter((row) => row.paragraph.length >= 40)
        .map((row) => row.paragraph);
  }
  text = paragraphs.join("\n").slice(0, MAX_TEXT).trim();
  if (text.length < 40)
    throw fail(422, "Source returned too little readable text");
  return text;
}

export async function retrieveSource(
  value,
  {
    hosts,
    signal,
    lookup = dns.lookup,
    get = https.get,
    now = () => new Date().toISOString(),
    query = "",
  } = {},
) {
  const url = validateSourceUrl(value, hosts);
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timer = setTimeout(abort, DEADLINE_MS);
  let abortListener;
  const aborted = new Promise((_, reject) => {
    abortListener = () =>
      reject(fail(504, "Source retrieval timed out or was cancelled"));
    controller.signal.addEventListener("abort", abortListener, { once: true });
    if (controller.signal.aborted) abortListener();
  });
  try {
    const work = (async () => {
      const addresses = await lookup(url.hostname, { all: true });
      if (controller.signal.aborted)
        throw fail(504, "Source retrieval cancelled");
      if (
        !addresses.length ||
        addresses.some((item) => !isPublicSourceAddress(item.address))
      )
        throw fail(400, "Source resolves to a private address");
      const address = addresses[0];
      const response = await new Promise((resolve, reject) => {
        const req = get(
          url,
          {
            signal: controller.signal,
            headers: {
              Accept: "text/html, text/plain",
              "Accept-Encoding": "identity",
              "User-Agent": "LiquidityStudio-SourceReview/1",
            },
            lookup: pinnedLookup(address),
          },
          (res) => {
            const type = res.headers["content-type"] || "";
            if (
              res.statusCode !== 200 ||
              (res.headers["content-encoding"] &&
                res.headers["content-encoding"] !== "identity")
            ) {
              res.resume();
              reject(
                fail(502, "Source response is unavailable or unsupported"),
              );
              return;
            }
            let size = 0;
            const chunks = [];
            res.on("data", (chunk) => {
              size += chunk.length;
              if (size > MAX_BYTES) {
                reject(fail(502, "Source response too large"));
                req.destroy();
              } else chunks.push(chunk);
            });
            res.on("end", () =>
              resolve({ bytes: Buffer.concat(chunks), type }),
            );
            res.on("error", () => reject(fail(502, "Source response failed")));
          },
        );
        req.on("error", () => reject(fail(502, "Source unavailable")));
      });
      if (controller.signal.aborted)
        throw fail(504, "Source retrieval cancelled");
      const text = extractSourceText(
        response.bytes.toString("utf8"),
        response.type,
        query,
      );
      return {
        schemaVersion: 1,
        requestedUrl: url.href,
        sourceUrl: url.href,
        retrievedAt: now(),
        contentType: response.type.slice(0, 200),
        responseSha256: sha(response.bytes),
        responseBytes: response.bytes.length,
        extractionVersion: "plain-excerpts-v1",
        selectionMethod: query
          ? "topic-keyword-overlap-v1"
          : "document-order-v1",
        selectionQuerySha256: sha(String(query)),
        text,
        textSha256: sha(text),
        status: "unreviewed",
        approval: "none",
      };
    })();
    return await Promise.race([work, aborted]);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
    controller.signal.removeEventListener("abort", abortListener);
  }
}
