import { SaxesParser } from "saxes";
import { createHash } from "node:crypto";
import { fail } from "./auth.js";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const UUID = "[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}";
const RESOURCE = new RegExp(
  `^(?:http://(?:localhost:39008|penpot-frontend:8080))?(/assets/(?:by-id|by-file-media-id)/${UUID})$`,
);
const TAGS = new Set([
  "svg",
  "g",
  "defs",
  "style",
  "image",
  "rect",
  "text",
  "tspan",
  "path",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "clipPath",
  "pattern",
  "linearGradient",
  "radialGradient",
  "stop",
]);
const STYLE = new Set([
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "font-family",
  "font-style",
  "font-weight",
  "font-size",
  "text-decoration",
  "text-transform",
  "text-anchor",
  "direction",
  "letter-spacing",
  "word-spacing",
  "white-space",
  "opacity",
  "dominant-baseline",
  "paint-order",
  "mix-blend-mode",
  "isolation",
]);
const reject = () => {
  throw fail(422, "Native SVG contains unsupported content or resources");
};
const fragment = (value) => /^#[A-Za-z_][\w.:-]*$/.test(value);

/** Strict inspection plus source-offset replacement. No XML reserialization:
 * original text, numeric attributes and native font/layout styles stay exact.
 * The injected resource reader owns authorization and immutable byte checks.
 */
export async function embedPenpotSvg(bytes, readResource, expected = null) {
  if (
    !Buffer.isBuffer(bytes) ||
    bytes.length > 1024 * 1024 ||
    !bytes.length ||
    typeof readResource !== "function"
  )
    reject();
  const source = bytes.toString("utf8");
  if (
    !Buffer.from(source).equals(bytes) ||
    /<!DOCTYPE|<!ENTITY|<!\[CDATA\[|<\?/i.test(source)
  )
    reject();
  const parser = new SaxesParser({ xmlns: true, position: true });
  const replacements = [],
    resources = new Map();
  let depth = 0,
    nodes = 0,
    root = false,
    styleCount = 0;
  const add = (url, kind, start, end) => {
    const match = RESOURCE.exec(url);
    if (!match) reject();
    const path = match[1];
    const existing = resources.get(path);
    if (existing && existing.kind !== kind) reject();
    resources.set(path, { path, kind });
    if (resources.size > 8) reject();
    replacements.push({ start, end, path });
  };
  parser.on("error", reject);
  parser.on("doctype", reject);
  parser.on("processinginstruction", reject);
  parser.on("cdata", reject);
  parser.on("opentag", (tag) => {
    if (
      ++nodes > 10000 ||
      ++depth > 64 ||
      !TAGS.has(tag.local) ||
      tag.uri !== "http://www.w3.org/2000/svg"
    )
      reject();
    if (!root) {
      if (tag.local !== "svg") reject();
      root = true;
    }
    if (tag.local === "style") styleCount++;
    if (Object.keys(tag.attributes).length > 64) reject();
    if (
      Object.values(tag.attributes).filter(
        (attribute) => attribute.local === "href",
      ).length > 1
    )
      reject();
    const end = parser.position;
    const start = source.lastIndexOf("<", end - 1);
    const raw = source.slice(start, end);
    if (!raw.endsWith(">")) reject();
    for (const attribute of Object.values(tag.attributes)) {
      const name = attribute.local,
        value = attribute.value;
      if (
        /^on/i.test(name) ||
        name === "base" ||
        /[\\\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)
      )
        reject();
      if (attribute.name === "xmlns" || attribute.prefix === "xmlns") {
        if (
          ![
            "http://www.w3.org/2000/svg",
            "http://www.w3.org/1999/xlink",
          ].includes(value)
        )
          reject();
        continue;
      }
      if (
        attribute.uri &&
        attribute.uri !== "http://www.w3.org/1999/xlink" &&
        attribute.uri !== "http://www.w3.org/XML/1998/namespace"
      )
        reject();
      if (name === "href") {
        if (tag.local !== "image") reject();
        // Resource URLs contain no entities/quotes. Match the exact raw value
        // only inside this validated start tag, never a text node elsewhere.
        const escapedName = attribute.name.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        const match = new RegExp(
          `\\s${escapedName}\\s*=\\s*(["'])([^"']*)\\1`,
          "g",
        );
        const hits = [...raw.matchAll(match)];
        if (hits.length !== 1 || hits[0][2] !== value) reject();
        const offset = hits[0].index + hits[0][0].indexOf(value);
        add(value, "image", start + offset, start + offset + value.length);
      } else {
        if (name === "style") {
          const seen = new Set();
          for (const row of value
            .split(";")
            .map((row) => row.trim())
            .filter(Boolean)) {
            const colon = row.indexOf(":"),
              key = row.slice(0, colon).trim();
            if (colon < 1 || !STYLE.has(key) || seen.has(key)) reject();
            seen.add(key);
          }
        }
        if (
          /javascript:|data:|https?:|\/\//i.test(value) ||
          /@import|expression\s*\(/i.test(value)
        )
          reject();
        for (const match of value.matchAll(/url\(\s*([^)]*)\s*\)/gi))
          if (!fragment(match[1].trim())) reject();
        if (/url/i.test(value.replace(/url\(\s*#[A-Za-z_][\w.:-]*\s*\)/gi, "")))
          reject();
      }
    }
  });
  parser.on("closetag", () => {
    depth--;
  });
  parser.write(source).close();
  if (!root || depth !== 0) reject();
  const styles = [...source.matchAll(/<style>([\s\S]*?)<\/style>/g)];
  if (styles.length !== styleCount) reject();
  for (const style of styles) {
    const css = style[1];
    if (/[\\<&]|@import|expression|javascript:/i.test(css)) reject();
    const blocks = [...css.matchAll(/@font-face\s*\{([^{}]*)\}/g)];
    if (css.replace(/@font-face\s*\{[^{}]*\}/g, "").trim()) reject();
    for (const block of blocks) {
      const body = block[1];
      const properties = body
        .split(";")
        .map((row) => row.trim())
        .filter(Boolean);
      const seen = new Set();
      for (const property of properties) {
        const split = property.indexOf(":");
        if (split < 1) reject();
        const key = property.slice(0, split).trim(),
          value = property.slice(split + 1).trim();
        if (
          seen.has(key) ||
          ![
            "font-family",
            "font-style",
            "font-weight",
            "font-display",
            "src",
          ].includes(key)
        )
          reject();
        seen.add(key);
        if (key !== "src") {
          if (!/^[\w '"-]{1,120}$/.test(value)) reject();
          continue;
        }
        const match =
          /^url\(([^\s()'";]+)\)\s+format\('(woff2?|truetype|opentype)'\)$/.exec(
            value,
          );
        if (!match) reject();
        const fullStart =
          style.index +
          "<style>".length +
          block.index +
          block[0].indexOf(body) +
          body.indexOf(property) +
          property.indexOf(match[1]);
        add(match[1], "font", fullStart, fullStart + match[1].length);
      }
      if (
        ![
          "font-family",
          "font-style",
          "font-weight",
          "font-display",
          "src",
        ].every((key) => seen.has(key))
      )
        reject();
    }
  }
  let decodedBytes = 0;
  const inventory = [];
  for (const [path, resource] of resources) {
    const value = await readResource(resource);
    if (
      !Buffer.isBuffer(value?.bytes) ||
      value.bytes.length > 512 * 1024 ||
      !value.bytes.length ||
      !/^[a-f0-9]{64}$/.test(value.sha256 || "") ||
      hash(value.bytes) !== value.sha256
    )
      reject();
    if (
      resource.kind === "image"
        ? !["image/png", "image/jpeg", "image/webp"].includes(value.contentType)
        : !["font/woff", "font/woff2", "font/ttf", "font/otf"].includes(
            value.contentType,
          )
    )
      reject();
    decodedBytes += value.bytes.length;
    if (decodedBytes > 2 * 1024 * 1024) reject();
    resource.data = `data:${value.contentType};base64,${value.bytes.toString("base64")}`;
    inventory.push({
      path,
      kind: resource.kind,
      contentType: value.contentType,
      size: value.bytes.length,
      sha256: value.sha256,
    });
  }
  if (expected && JSON.stringify(inventory) !== JSON.stringify(expected))
    reject();
  let result = source;
  for (const replacement of replacements.sort((a, b) => b.start - a.start))
    result =
      result.slice(0, replacement.start) +
      resources.get(replacement.path).data +
      result.slice(replacement.end);
  const embedded = Buffer.from(result);
  if (embedded.length > 6 * 1024 * 1024) reject();
  return { bytes: embedded, resources: inventory, decodedBytes };
}
