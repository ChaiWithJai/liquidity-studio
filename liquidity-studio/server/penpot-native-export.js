import { embedPenpotSvg } from "./penpot-svg-embed.js";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { fail } from "./auth.js";
import { penpotPresentedSession } from "./penpot-media-authorization.js";

const UUID = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const hash = (value) => createHash("sha256").update(value).digest("hex");
const exact = (value, keys) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).sort().join("|") === [...keys].sort().join("|");
const nativeUuid = (value) =>
  typeof value === "string" &&
  value.startsWith("~u") &&
  UUID.test(value.slice(2))
    ? value.slice(2)
    : null;
const asciiJson = (value) =>
  JSON.stringify(value).replace(
    /[\u007f-\uffff]/g,
    (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );

/** Pinned 2.18.3 JSON-verbose Transit DTO, NOT a general Transit decoder.
 * The actual native UI emits these exact tagged JSON keys. Cached/compact maps,
 * custom tags, async jobs, multiple objects, share links and arbitrary URLs fail.
 */
export function parsePenpotSingleExport(body, contentType) {
  if (
    contentType !== "application/transit+json" ||
    !Buffer.isBuffer(body) ||
    body.length > 8192
  )
    throw fail(415, "Only bounded native JSON-verbose export is supported");
  let value;
  try {
    value = JSON.parse(body.toString("utf8"));
  } catch {
    throw fail(400, "Malformed native export request");
  }
  if (
    !exact(value, [
      "~:wait",
      "~:exports",
      "~:profile-id",
      "~:cmd",
      "~:is-wasm",
    ]) ||
    value["~:wait"] !== true ||
    value["~:is-wasm"] !== false ||
    value["~:cmd"] !== "~:export-shapes" ||
    !Array.isArray(value["~:exports"]) ||
    value["~:exports"].length !== 1
  )
    throw fail(422, "Only one synchronous saved native object is supported");
  const item = value["~:exports"][0];
  if (
    !exact(item, [
      "~:type",
      "~:suffix",
      "~:scale",
      "~:page-id",
      "~:file-id",
      "~:name",
      "~:object-id",
    ]) ||
    !["~:png", "~:svg"].includes(item["~:type"]) ||
    item["~:suffix"] !== "" ||
    item["~:scale"] !== 1 ||
    typeof item["~:name"] !== "string" ||
    !item["~:name"].trim() ||
    item["~:name"].length > 160 ||
    /[\r\n\x00-\x1f]/.test(item["~:name"])
  )
    throw fail(422, "Only 1x PNG or SVG native export is supported");
  const request = {
    profileId: nativeUuid(value["~:profile-id"]),
    fileId: nativeUuid(item["~:file-id"]),
    pageId: nativeUuid(item["~:page-id"]),
    objectId: nativeUuid(item["~:object-id"]),
    format: item["~:type"].slice(2),
    name: item["~:name"],
  };
  if (
    ![
      request.profileId,
      request.fileId,
      request.pageId,
      request.objectId,
    ].every(Boolean)
  )
    throw fail(400, "Native export identifiers invalid");
  const canonicalBody = asciiJson(value);
  if (Buffer.byteLength(canonicalBody) > 2048)
    throw fail(413, "Native export envelope exceeds its bound");
  return { request, canonicalBody };
}

function parseResponse(bytes, type, request) {
  if (type !== "application/transit+json" || bytes.length > 32768)
    throw fail(502, "Native export response invalid");
  let value;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw fail(502, "Native export response malformed");
  }
  const contentType = request.format === "png" ? "image/png" : "image/svg+xml";
  if (
    !exact(value, ["~:mtype", "~:name", "~:filename", "~:id", "~:uri"]) ||
    value["~:mtype"] !== contentType ||
    value["~:name"] !== request.name ||
    !nativeUuid(value["~:id"]) ||
    typeof value["~:filename"] !== "string" ||
    value["~:filename"].length > 220 ||
    /[\r\n\x00-\x1f\/\\]/.test(value["~:filename"]) ||
    !exact(value["~:uri"], ["~#uri"])
  )
    throw fail(502, "Native export response differs from its request");
  const uri = value["~:uri"]["~#uri"];
  const match =
    typeof uri === "string" &&
    /^http:\/\/localhost:39008\/assets\/by-id\/([a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12})$/.exec(
      uri,
    );
  if (!match)
    throw fail(502, "Native export returned an unsupported output URI");
  return { objectId: match[1], contentType, filename: value["~:filename"] };
}

async function bounded(response, max) {
  if (!response.body) throw fail(502, "Native export response was empty");
  if (Number(response.headers.get("content-length")) > max) {
    await response.body.cancel().catch(() => {});
    throw fail(502, "Native export output exceeds its bound");
  }
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0,
    completed = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        completed = true;
        break;
      }
      size += value.byteLength;
      if (size > max) throw fail(502, "Native export output exceeds its bound");
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally {
    if (!completed) await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function readPenpotExportBody(req) {
  if (Number(req.headers["content-length"]) > 8192)
    throw fail(413, "Native export request exceeds its bound");
  const chunks = [];
  let size = 0;
  const deadline = setTimeout(() => req.destroy(), 5000);
  try {
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 8192)
        throw fail(413, "Native export request exceeds its bound");
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } finally {
    clearTimeout(deadline);
  }
}

/** Existing native exporter relay. No cookies, capabilities or role snapshots
 * enter storage. Pending outputs never enter the ordinary media allow registry.
 */
export function createPenpotNativeExports({
  store,
  authorizeContext,
  reauthorizeContext,
  resolveSvgResource,
  transportMode = "loopback",
  fetchImpl = fetch,
  now = Date.now,
}) {
  const origin = {
    loopback: "http://localhost:39008",
    "docker-host": "http://host.docker.internal:39008",
  }[transportMode];
  if (
    !origin ||
    typeof authorizeContext !== "function" ||
    typeof reauthorizeContext !== "function"
  )
    throw Error("Fixed governed native export dependencies required");
  const capabilities = new Map();
  let active = 0;
  const receiptKey = "penpot-export-security:receipts";
  const readRecord = async (id) =>
    (await store.get(receiptKey))?.records.find(
      (record) => record.objectId === id,
    );
  async function changeRecord(id, change, create = false) {
    const observedAt = now();
    return store.update(receiptKey, (state) => {
      const records = (state?.records || []).filter(
        (record) => record.expiresAt > observedAt,
      );
      const index = records.findIndex((record) => record.objectId === id);
      if (index < 0 && !create)
        throw fail(404, "Native export receipt unavailable");
      if (index < 0 && records.length >= 100)
        throw fail(429, "Native export receipt capacity reached");
      const result = change(index < 0 ? null : records[index]);
      if (index < 0) records.push(result);
      else records[index] = result;
      return { version: 1, records };
    });
  }
  function issue(kind, cookie, context, extra = {}) {
    for (const [id, entry] of capabilities)
      if (entry.expiresAt <= now()) capabilities.delete(id);
    if (capabilities.size >= 8) throw fail(503, "Native export relay is busy");
    const token = randomBytes(32).toString("hex");
    capabilities.set(hash(token), {
      kind,
      cookieHash: hash(cookie),
      context,
      expiresAt: now() + 30_000,
      ...extra,
    });
    return token;
  }
  async function authorizeRelay({
    capability,
    cookie,
    method,
    path,
    contentType,
    bodyHash,
  }) {
    const session = penpotPresentedSession(cookie);
    if (typeof capability !== "string" || !/^[a-f0-9]{64}$/.test(capability))
      throw fail(403, "Native export relay denied");
    const id = hash(capability),
      entry = capabilities.get(id);
    // Consume once before any asynchronous authority lookup, even on denial.
    capabilities.delete(id);
    if (
      !entry ||
      entry.expiresAt <= now() ||
      entry.cookieHash !== hash(session)
    )
      throw fail(403, "Native export relay expired or changed");
    if (entry.kind === "render") {
      if (
        method !== "POST" ||
        path !== "/__studio_native_export" ||
        contentType !== "application/transit+json" ||
        bodyHash !== hash(entry.canonicalBody)
      )
        throw fail(403, "Native export relay envelope changed");
    } else if (entry.kind === "output") {
      if (
        method !== "GET" ||
        path !== `/__studio_native_export_output/${entry.objectId}` ||
        contentType ||
        bodyHash
      )
        throw fail(403, "Native export output relay changed");
      const record = await readRecord(entry.objectId);
      if (
        !record ||
        record.id !== entry.receiptId ||
        record.status !== (entry.expectedStatus || "pending") ||
        !isDeepStrictEqual(record.context, entry.context) ||
        record.expiresAt <= now()
      )
        throw fail(403, "Native export output is not pending");
    } else throw fail(403, "Native export relay kind unsupported");
    const current = await authorizeContext(session, entry.context.request);
    if (!isDeepStrictEqual(current, entry.context))
      throw fail(409, "Native export authority changed");
    return { body: entry.kind === "render" ? entry.canonicalBody : null };
  }
  async function authorizeRecord(record) {
    if (
      !record ||
      record.kind !== "native-export" ||
      record.status !== "verified" ||
      record.expiresAt <= now() ||
      record.expiresAt > record.createdAt + 600_000 ||
      !/^[a-f0-9]{64}$/.test(record.sha256 || "")
    )
      throw fail(403, "Native export receipt unavailable");
    await reauthorizeContext(record.context);
  }
  async function embed(bytes, session, context, expected = null) {
    if (typeof resolveSvgResource !== "function")
      throw fail(422, "Portable native SVG resources are not configured");
    return embedPenpotSvg(
      bytes,
      async (resource) => {
        const before = await authorizeContext(session, context.request);
        if (!isDeepStrictEqual(before, context))
          throw fail(409, "Native SVG source changed");
        const descriptor = await resolveSvgResource({
          resource,
          context,
          cookie: session,
        });
        const response = await fetchImpl(`${origin}${resource.path}`, {
          headers: { Cookie: session },
          redirect: "error",
          signal: AbortSignal.timeout(15000),
          cache: "no-store",
        });
        if (!response.ok)
          throw fail(403, "Registered native SVG resource unavailable");
        const resourceBytes = await bounded(response, 512 * 1024);
        if (hash(resourceBytes) !== descriptor.sha256)
          throw fail(409, "Native SVG resource bytes changed");
        const after = await authorizeContext(session, context.request);
        if (!isDeepStrictEqual(after, context))
          throw fail(409, "Native SVG authority changed");
        return { ...descriptor, bytes: resourceBytes };
      },
      expected,
    );
  }
  return {
    authorizeRelay,
    authorizeRecord,
    async resolve(requested, ownerPrincipal) {
      if (requested.kind !== "by-id" || requested.thumbnail) return null;
      const record = await readRecord(requested.id);
      if (!record || record.ownerPrincipal !== ownerPrincipal) return null;
      if (record.embeddedSvg) return null;
      await authorizeRecord(record);
      return record;
    },
    async readEmbedded({ id, cookie }) {
      if (!UUID.test(id || "")) throw fail(404, "Native SVG unavailable");
      if (active >= 1) throw fail(503, "Native export relay is busy");
      active++;
      try {
        const session = penpotPresentedSession(cookie),
          record = await readRecord(id);
        if (!record?.embeddedSvg) throw fail(404, "Native SVG unavailable");
        await authorizeRecord(record);
        const current = await authorizeContext(session, record.context.request);
        if (!isDeepStrictEqual(current, record.context))
          throw fail(409, "Native SVG context changed");
        const probe = issue("output", session, record.context, {
          objectId: id,
          receiptId: record.id,
          expectedStatus: "verified",
        });
        const response = await fetchImpl(
          `${origin}/__studio_native_export_output/${id}`,
          {
            headers: { Cookie: session, "X-Studio-Export-Relay": probe },
            redirect: "error",
            signal: AbortSignal.timeout(30000),
            cache: "no-store",
          },
        );
        if (
          !response.ok ||
          response.headers.get("content-type")?.split(";")[0] !==
            "image/svg+xml"
        )
          throw fail(502, "Original native SVG unavailable");
        const original = await bounded(response, 1024 * 1024);
        if (hash(original) !== record.originalSha256)
          throw fail(409, "Original native SVG changed");
        const result = await embed(
          original,
          session,
          record.context,
          record.resources,
        );
        if (
          hash(result.bytes) !== record.sha256 ||
          result.bytes.length !== record.size
        )
          throw fail(409, "Embedded native SVG changed");
        const final = await authorizeContext(session, record.context.request);
        if (!isDeepStrictEqual(final, record.context))
          throw fail(409, "Native SVG changed before delivery");
        await authorizeRecord(await readRecord(id));
        return { bytes: result.bytes, filename: record.filename };
      } finally {
        active--;
      }
    },
    async execute({ body, contentType, cookie, origin: presentedOrigin }) {
      if (presentedOrigin !== "http://localhost:39008")
        throw fail(403, "Native export origin denied");
      if (active >= 1) throw fail(503, "Native export relay is busy");
      active++;
      let record;
      try {
        const session = penpotPresentedSession(cookie);
        const { request, canonicalBody } = parsePenpotSingleExport(
          body,
          contentType,
        );
        const context = await authorizeContext(session, request);
        const token = issue("render", session, context, { canonicalBody });
        const response = await fetchImpl(`${origin}/__studio_native_export`, {
          method: "POST",
          headers: {
            "Content-Type": "application/transit+json",
            Cookie: session,
            "X-Studio-Export-Relay": token,
            "X-Studio-Export-Body-Sha256": hash(canonicalBody),
          },
          body: canonicalBody,
          redirect: "error",
          signal: AbortSignal.timeout(90_000),
        });
        if (!response.ok)
          throw fail(502, "Native export render was not confirmed");
        const responseBytes = await bounded(response, 32768);
        const output = parseResponse(
          responseBytes,
          response.headers.get("content-type"),
          request,
        );
        const final = await authorizeContext(session, request);
        if (!isDeepStrictEqual(final, context))
          throw fail(409, "Native source changed during export");
        const createdAt = now();
        record = {
          id: randomUUID(),
          kind: "native-export",
          status: "pending",
          createdAt,
          expiresAt: createdAt + 600_000,
          ...output,
          ...context,
          context,
        };
        await changeRecord(
          output.objectId,
          (existing) => {
            if (existing)
              throw fail(409, "Native export output already registered");
            return record;
          },
          true,
        );
        const probe = issue("output", session, context, {
          objectId: output.objectId,
          receiptId: record.id,
        });
        const bytesResponse = await fetchImpl(
          `${origin}/__studio_native_export_output/${output.objectId}`,
          {
            headers: { Cookie: session, "X-Studio-Export-Relay": probe },
            redirect: "error",
            signal: AbortSignal.timeout(30_000),
            cache: "no-store",
          },
        );
        if (
          !bytesResponse.ok ||
          bytesResponse.headers.get("content-type")?.split(";")[0] !==
            output.contentType ||
          !bytesResponse.headers
            .get("content-disposition")
            ?.startsWith("attachment")
        )
          throw fail(502, "Owned native export output was not confirmed");
        let bytes = await bounded(bytesResponse, 6 * 1024 * 1024);
        const originalSha256 = hash(bytes);
        let embedding = null;
        if (!bytes.length) throw fail(502, "Native export output was empty");
        if (
          request.format === "png" &&
          !bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        )
          throw fail(502, "Native PNG signature invalid");
        if (
          request.format === "svg" &&
          !/<svg(?:\s|>)/.test(bytes.subarray(0, 2048).toString("utf8"))
        )
          throw fail(502, "Native SVG root invalid");
        if (request.format === "svg") {
          embedding = await embed(bytes, session, context);
          bytes = embedding.bytes;
        }
        const checked = await authorizeContext(session, request);
        if (!isDeepStrictEqual(checked, context))
          throw fail(409, "Native source changed before export delivery");
        await changeRecord(output.objectId, (current) => {
          if (
            current?.id !== record.id ||
            current.status !== "pending" ||
            current.expiresAt <= now()
          )
            throw fail(409, "Native export receipt changed");
          return {
            ...current,
            status: "verified",
            size: bytes.length,
            sha256: hash(bytes),
            ...(embedding
              ? {
                  embeddedSvg: true,
                  originalSha256,
                  resources: embedding.resources,
                  decodedBytes: embedding.decodedBytes,
                }
              : {}),
          };
        });
        if (embedding) {
          const dto = JSON.parse(responseBytes.toString("utf8"));
          dto["~:uri"]["~#uri"] =
            `http://localhost:39008/__studio_native_embedded_svg/${output.objectId}`;
          return {
            body: Buffer.from(JSON.stringify(dto)),
            contentType: "application/transit+json",
          };
        }
        return { body: responseBytes, contentType: "application/transit+json" };
      } catch (error) {
        if (record) {
          try {
            await changeRecord(record.objectId, (current) =>
              current?.id === record.id
                ? { ...current, status: "failed" }
                : current,
            );
          } catch {
            /* Pending remains non-readable if storage is unavailable. */
          }
        }
        throw error;
      } finally {
        active--;
      }
    },
  };
}

// Shared bounded pinned DTO readers for the same-file customer SVG download.
export {parseResponse as parsePenpotExportResponse, bounded as readBoundedPenpotExportResponse};
