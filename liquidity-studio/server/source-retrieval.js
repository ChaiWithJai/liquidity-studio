import https from "node:https";
import dns from "node:dns/promises";
import net from "node:net";
import { createHash } from "node:crypto";
import { fail } from "./auth.js";
import { pinnedLookup } from "./discovery.js";
import { DEFAULT_SOURCE_HOSTS } from "./source-catalog.js";
import { serialSourceRequest } from "./source-request-slot.js";
import { ncbiRequest, extractNcbiAbstract, NCBI_EXTRACTION, NCBI_SELECTION, ncbiSelectionDigest, assertNcbiDescriptor } from "./ncbi-pubmed-source.js";

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
export function extractSourceText(body, contentType, query = "", passage) {
  const type = contentType.split(";")[0].trim().toLowerCase();
  if (!["text/plain", "text/html", "application/xhtml+xml"].includes(type))
    throw fail(422, "Source must return HTML or plain text");
  const afterHeading = passage?.mode === "after-heading-prefix";
  if (passage?.mode !== undefined && !afterHeading)
    throw fail(422, "Unknown source passage mode");
  if (passage?.lineBreakParagraphs !== undefined &&
      (!afterHeading || typeof passage.lineBreakParagraphs !== "boolean"))
    throw fail(422, "Invalid source line-break paragraph option");
  if (afterHeading && (
    type === "text/plain" || Buffer.byteLength(body, "utf8") > MAX_BYTES ||
    typeof passage.section !== "string" || !passage.section.trim() ||
    !Array.isArray(passage.paragraphPrefixes) || !passage.paragraphPrefixes.length ||
    passage.paragraphPrefixes.length > 8 ||
    passage.paragraphPrefixes.some(prefix => typeof prefix !== "string" || !prefix.trim()) ||
    new Set(passage.paragraphPrefixes).size !== passage.paragraphPrefixes.length
  )) throw fail(422, "Invalid bounded after-heading source passage");
  let text = body;
  const heading =
    type === "text/plain"
      ? ""
      : entities(
          (body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/i)?.[1] || "").replace(
            /<[^>]*>/g,
            " ",
          ),
        )
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 180);
  if (type !== "text/plain") {
    if (passage) {
      // Match actual section headings, not duplicate table-of-contents links.
      const headings = [...text.matchAll(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]\s*>/gi)].map((match) => ({
        text: entities(match[0].replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim(),
        start: match.index,
        end: match.index + match[0].length,
      }));
      const starts = headings.filter((item) => item.text === passage.section);
      const ends = headings.filter((item) => item.text === passage.nextSection);
      if (starts.length !== 1 || (!afterHeading &&
        (ends.length !== 1 || starts[0].start >= ends[0].start)))
        throw fail(422, "Selected source passage boundaries are missing or ambiguous; source research required");
      text = text.slice(starts[0].start, afterHeading ? undefined : ends[0].end);
    }
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
      .replace(/<br\b[^>]*>/gi, match => afterHeading && passage.lineBreakParagraphs === true ? "\n" : match)
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
  if (passage) {
    const starts = paragraphs.flatMap((line, index) => line === passage.section ? [index] : []);
    const ends = paragraphs.flatMap((line, index) => line === passage.nextSection ? [index] : []);
    if (starts.length !== 1 || (!afterHeading && (ends.length !== 1 || ends[0] <= starts[0])))
      throw fail(422, "Selected source passage boundaries are missing or ambiguous; source research required");
    const section = paragraphs.slice(starts[0] + 1, afterHeading ? undefined : ends[0]);
    const selected = passage.paragraphPrefixes.map((prefix) => {
      const matches = section.filter((line) => line.startsWith(`${prefix} `));
      if (matches.length !== 1)
        throw fail(422, "Selected source passage is missing or ambiguous; source research required");
      return matches[0];
    });
    if (afterHeading && new Set(selected).size !== selected.length)
      throw fail(422, "Selected source paragraphs overlap; source research required");
    const selectedText = selected.join("\n");
    if (selectedText.length < 40 || selectedText.length > MAX_TEXT)
      throw fail(422, "Selected source passage exceeds readable evidence bounds");
    return selectedText;
  }
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
  if (heading)
    paragraphs = [
      heading,
      ...paragraphs.filter((paragraph) => paragraph !== heading),
    ];
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
    passage,
    retrieval: requestedRetrieval, // Trusted catalog descriptor; never supplied by an HTTP body.
  } = {},
) {
  const retrieval = requestedRetrieval === undefined ? undefined : structuredClone(assertNcbiDescriptor(requestedRetrieval));
  const citationUrl = validateSourceUrl(value, hosts);
  const url = retrieval === undefined ? citationUrl : validateSourceUrl(ncbiRequest(value, retrieval).href, "eutils.ncbi.nlm.nih.gov");
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
    const work = serialSourceRequest(controller.signal, async () => {
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
              Accept: retrieval === undefined ? "text/html, text/plain" : "application/xml, text/xml",
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
                Object.assign(fail(502, "Source response is unavailable or unsupported"), {
                  upstreamStatus: Number.isInteger(res.statusCode) && res.statusCode >= 100 && res.statusCode <= 599 ? res.statusCode : 0,
                  sourceEncodingCategory: res.headers["content-encoding"] === undefined ? "absent"
                    : ["identity", "gzip", "deflate", "br"].includes(res.headers["content-encoding"]) ? res.headers["content-encoding"] : "other",
                }),
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
      let text;
      if (retrieval !== undefined) {
        let xml;
        try { xml = new TextDecoder("utf-8", { fatal: true }).decode(response.bytes); }
        catch { throw fail(422, "NCBI response is not valid UTF-8"); }
        text = extractNcbiAbstract(xml, response.type, retrieval);
      } else text = extractSourceText(response.bytes.toString("utf8"), response.type, query, passage);
      return {
        schemaVersion: 1,
        requestedUrl: url.href,
        sourceUrl: citationUrl.href,
        retrievedAt: now(),
        contentType: response.type.slice(0, 200),
        responseSha256: sha(response.bytes),
        responseBytes: response.bytes.length,
        ...(retrieval === undefined ? {} : { retrieval: structuredClone(retrieval) }),
        extractionVersion: retrieval === undefined ? "plain-excerpts-v1" : NCBI_EXTRACTION,
        selectionMethod: retrieval !== undefined ? NCBI_SELECTION : passage ? "operator-selected-passage-v1" : query
          ? "topic-keyword-overlap-v1"
          : "document-order-v1",
        selectionQuerySha256: retrieval !== undefined ? ncbiSelectionDigest(retrieval) : sha(passage ? JSON.stringify({ query, passage }) : String(query)),
        text,
        textSha256: sha(text),
        status: "unreviewed",
        approval: "none",
      };
    });
    return await Promise.race([work, aborted]);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
    controller.signal.removeEventListener("abort", abortListener);
  }
}
