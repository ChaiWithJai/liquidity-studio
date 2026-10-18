import { randomUUID } from "node:crypto";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TAGS = new Set(["text", "tspan"]);
class Keyword {
  constructor(value) {
    this.value = value;
  }
}
class NativeUUID {
  constructor(value) {
    this.value = value;
  }
}
const fail = (code) => {
  throw new Error(code);
};
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function normalizeContent(value, depth = 0) {
  if (depth > 32) fail("SVG_CONTENT_TOO_DEEP");
  if (typeof value === "string") return value;
  if (Array.isArray(value))
    return value.map((child) => normalizeContent(child, depth + 1));
  if (!object(value)) fail("INVALID_SVG_CONTENT");
  if (
    Object.keys(value).some((key) => !["tag", "attrs", "content"].includes(key))
  )
    fail("UNSUPPORTED_SVG_CONTENT_FIELD");
  if (typeof value.tag !== "string" || !TAGS.has(value.tag))
    fail("UNSUPPORTED_RAW_SVG_TAG");
  if (value.attrs !== undefined && !object(value.attrs))
    fail("INVALID_SVG_ATTRIBUTES");
  for (const [key, attr] of Object.entries(value.attrs || {})) {
    if (
      /^on/i.test(key) ||
      /^(href|xlink:href|src)$/i.test(key) ||
      typeof attr !== "string" ||
      /url\s*\(/i.test(attr)
    )
      fail("UNSUPPORTED_SVG_ATTRIBUTE");
  }
  return {
    tag: new Keyword(value.tag),
    ...(value.attrs !== undefined ? { attrs: value.attrs } : {}),
    ...(value.content !== undefined
      ? { content: normalizeContent(value.content, depth + 1) }
      : {}),
  };
}

// Minimal write-only Transit representation: no cache, evaluation or remote code.
function transit(value) {
  if (value instanceof Keyword) return `~:${value.value}`;
  if (value instanceof NativeUUID) return `~u${value.value}`;
  if (Array.isArray(value)) return value.map(transit);
  if (object(value))
    return [
      "^ ",
      ...Object.entries(value).flatMap(([key, item]) => [
        `~:${key}`,
        transit(item),
      ]),
    ];
  if (typeof value === "string" && /^[~^`]/.test(value)) return `~${value}`;
  return value;
}

/** Compile only; caller must separately authorize target, current owner and revision. */
export function compilePenpotSvgRestoreRepair({
  file,
  nativeVersion,
  expectedRevision,
  sessionId = randomUUID(),
}) {
  if (nativeVersion !== "2.18.3") fail("UNSUPPORTED_NATIVE_VERSION");
  if (
    !object(file) ||
    !UUID.test(file.id) ||
    !UUID.test(file.projectId) ||
    !UUID.test(sessionId)
  )
    fail("INVALID_NATIVE_IDENTITY");
  if (
    !Number.isSafeInteger(expectedRevision) ||
    expectedRevision < 0 ||
    expectedRevision !== file.revn
  )
    fail("STALE_NATIVE_REVISION");
  if (!Number.isSafeInteger(file.vern) || file.vern < 0)
    fail("INVALID_NATIVE_VERSION");
  if (Buffer.byteLength(JSON.stringify(file), "utf8") > 2 * 1024 * 1024)
    fail("NATIVE_REPAIR_TOO_LARGE");
  const data = file.data;
  if (
    !object(data) ||
    !Array.isArray(data.pages) ||
    !object(data.pagesIndex) ||
    data.pages.length > 20 ||
    new Set(data.pages).size !== data.pages.length
  )
    fail("INVALID_NATIVE_PAGES");
  const changes = [],
    changedShapes = [];
  let count = 0;
  for (const pageId of data.pages) {
    const page = data.pagesIndex[pageId];
    if (
      !UUID.test(pageId) ||
      !object(page) ||
      page.id !== pageId ||
      !object(page.objects)
    )
      fail("INVALID_NATIVE_PAGE");
    for (const [id, shape] of Object.entries(page.objects)) {
      if (++count > 2048) fail("NATIVE_REPAIR_TOO_MANY_SHAPES");
      if (!UUID.test(id) || !object(shape) || shape.id !== id)
        fail("INVALID_NATIVE_SHAPE");
      if (shape.type !== "svg-raw" || typeof shape.content === "string")
        continue;
      const content = normalizeContent(shape.content);
      changedShapes.push({ pageId, shapeId: id, tag: shape.content.tag });
      changes.push({
        type: new Keyword("mod-obj"),
        "page-id": new NativeUUID(pageId),
        id: new NativeUUID(id),
        operations: [
          {
            type: new Keyword("set"),
            attr: new Keyword("content"),
            val: content,
          },
        ],
      });
    }
  }
  if (!changes.length) fail("NO_SUPPORTED_RAW_SVG_CONTENT");
  const body = {
    id: new NativeUUID(file.id),
    "session-id": new NativeUUID(sessionId),
    revn: expectedRevision,
    vern: file.vern,
    changes,
  };
  return {
    kind: "penpot-svg-tag-repair",
    schemaVersion: 1,
    nativeVersion,
    fileId: file.id,
    projectId: file.projectId,
    expectedRevision,
    changedShapes,
    transitBody: JSON.stringify(transit(body)),
    limits: [
      "text/tspan only",
      "post-import type normalization, not upstream importer repair",
      "no asset/font/token authorization",
      "reimport requires the same explicit normalization",
    ],
  };
}
