import { createHash } from "node:crypto";
import { accountPortableJson } from "./portable-json-accounting.js";
import { fail } from "./auth.js";
import { validateHostedDocument } from "./native-editor.js";
import { projectPreparedHistory, restorePreparedHistory } from "./editor-pack-prepared.js";
import { nativeFontCatalog } from "./native-editor-fonts.js";
export const PACK_VERSION = 2;
export const PACK_LIMITS = Object.freeze({
  bytes: 48 * 1024 * 1024,
  files: 1024,
  documents: 100,
  assets: 100,
  history: 100,
  fileBytes: 4 * 1024 * 1024,
});
export const digest = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");
export const jsonDigest = (value) =>
  createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
const formats = new Set(["infographic", "carousel", "story", "reel"]);
const secretKeys = new Set([
  "__proto__",
  "prototype",
  "constructor",
  "authorization",
  "cookie",
  "password",
  "passwordhash",
  "accesstoken",
  "refreshtoken",
  "idtoken",
  "privatekey",
  "clientsecret",
  "credentials",
  "sessions",
  "memberships",
]);
export function exact(value, fields) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !fields.includes(key))
  )
    throw fail(422, "Unsupported editor pack fields");
}
export function scanPortable(value) {
  let nodes = 0;
  function visit(value, depth = 0) {
    if (++nodes > 500000 || depth > 40)
      throw fail(413, "Editor pack complexity limit");
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (secretKeys.has(key.toLowerCase()))
          throw fail(
            422,
            "Credentials or execution authority are not portable",
          );
        visit(child, depth + 1);
      }
    }
  }
  visit(value);
}
function validatePortability(value) {
  if (value === undefined) return;
  exact(value, [
    "authority",
    "sourceScope",
    "sourceAssetId",
    "sourceDocumentId",
    "sourceCreatedBy",
    "sourceUpdatedBy",
    "sourceOrigin",
    "restorations",
  ]);
  if (
    value.authority !== "historical-only" ||
    !Array.isArray(value.restorations) ||
    value.restorations.length > 100
  )
    throw fail(422, "Invalid historical portability provenance");
  exact(value.sourceScope, ["organizationId", "brandId"]);
  for (const item of value.restorations) {
    exact(item, [
      "fromScope",
      "toScope",
      "restoredBy",
      "restoredAt",
      "packSha256",
    ]);
    exact(item.fromScope, ["organizationId", "brandId"]);
    exact(item.toScope, ["organizationId", "brandId"]);
    if (
      typeof item.restoredBy !== "string" ||
      !Number.isFinite(Date.parse(item.restoredAt)) ||
      !/^[a-f0-9]{64}$/.test(item.packSha256)
    )
      throw fail(422, "Invalid restoration provenance");
  }
}
const fileBudgets = new WeakMap();
export function createPackFileCollection(limits = PACK_LIMITS) {
  for (const name of ["bytes", "files", "fileBytes"])
    if (!Number.isSafeInteger(limits[name]) || limits[name] < 1 || limits[name] > PACK_LIMITS[name])
      throw fail(413, "Invalid portable file budget");
  const files = [];
  const bounded = Object.freeze({bytes:limits.bytes,files:limits.files,fileBytes:limits.fileBytes});
  fileBudgets.set(files, { limits:bounded, encodedBytes: 2 });
  return files;
}
export function addFile(files, bytes, kind) {
  const length = typeof bytes === "string" ? Buffer.byteLength(bytes) : bytes.byteLength;
  const budget = fileBudgets.get(files) || { limits: PACK_LIMITS, encodedBytes: Buffer.byteLength(JSON.stringify(files)) };
  if (!Number.isSafeInteger(length) || length > budget.limits.fileBytes)
    throw fail(413, "Editor pack per-file byte limit");
  const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes), sha256 = digest(buffer);
  if (files.some(file => file.sha256 === sha256)) return sha256;
  if (files.length >= budget.limits.files) throw fail(413, "Editor pack file count limit");
  // Base64 uses only ASCII: calculate its exact JSON size before allocating it.
  const overhead = Buffer.byteLength(JSON.stringify({ sha256, size: buffer.length, kind, base64: "" }));
  const encodedBytes = budget.encodedBytes + overhead + 4 * Math.ceil(buffer.length / 3) + (files.length ? 1 : 0);
  if (encodedBytes > budget.limits.bytes) throw fail(413, "Editor pack encoded byte budget exceeded");
  files.push({ sha256, size: buffer.length, kind, base64: buffer.toString("base64") });
  fileBudgets.set(files, { limits: budget.limits, encodedBytes });
  return sha256;
}
/** No extraction paths, URLs, executable code, storage references, sessions or live approval grants. */
export function validateEditorPack(input) {
  const accounting = accountPortableJson(input, { omitRootKeys: ["sha256"] });
  exact(input, [
    "schemaVersion",
    "kind",
    "scope",
    "exportedAt",
    "repository",
    "documents",
    "assets",
    "fonts",
    "files",
    "sha256",
    "preparedHistory",
  ]);
  if (![1,2].includes(input.schemaVersion) || input.kind !== "studio-native-editor-pack")
    throw fail(422, "Unsupported editor pack version");
  const { sha256, ...content } = input;
  if (sha256 !== accounting.contentSha256)
    throw fail(422, "Editor pack checksum mismatch");
  exact(input.scope, ["organizationId", "brandId"]);
  if (!input.scope.organizationId || !input.scope.brandId)
    throw fail(422, "Editor pack source scope required");
  scanPortable(content);
  for (const [name, limit] of [
    ["documents", PACK_LIMITS.documents],
    ["assets", PACK_LIMITS.assets],
    ["files", PACK_LIMITS.files],
    ["fonts", 16],
  ])
    if (!Array.isArray(input[name]) || input[name].length > limit)
      throw fail(413, "Editor pack entry limit");
  const files = new Map();
  for (const file of input.files) {
    exact(file, ["sha256", "size", "kind", "base64"]);
    if (
      !/^[a-f0-9]{64}$/.test(file.sha256) ||
      files.has(file.sha256) ||
      !Number.isSafeInteger(file.size) ||
      file.size < 0 ||
      file.size > PACK_LIMITS.fileBytes ||
      typeof file.base64 !== "string" ||
      ![
        "document",
        "image",
        "font",
        "license",
        "repository",
        "history",
        "final-png",
      ].includes(file.kind)
    )
      throw fail(422, "Invalid editor pack file");
    const bytes = Buffer.from(file.base64, "base64");
    if (
      bytes.toString("base64") !== file.base64 ||
      bytes.length !== file.size ||
      digest(bytes) !== file.sha256
    )
      throw fail(422, "Editor pack file integrity mismatch");
    files.set(file.sha256, bytes);
  }
  const used = new Set();
  const bytes = (hash) => {
    if (!files.has(hash)) throw fail(422, "Missing editor pack bytes");
    used.add(hash);
    return files.get(hash);
  };
  const json = (hash) => {
    try {
      const v = JSON.parse(bytes(hash).toString("utf8"));
      scanPortable(v);
      return v;
    } catch (error) {
      if (error.status) throw error;
      throw fail(422, "Malformed editor pack JSON");
    }
  };
  const repository = json(input.repository);
  if (
    repository.schemaVersion !== 1 ||
    jsonDigest(repository.data) !== repository.sha256 ||
    JSON.stringify(repository.scope) !== JSON.stringify(input.scope)
  )
    throw fail(422, "Repository manifest scope or integrity mismatch");
  if (!Array.isArray(repository.data?.backlog) || !repository.data.brandProfile)
    throw fail(422, "Repository data required");
  const repositoryFields = new Set([
    "schemaVersion",
    "brandProfile",
    "backlog",
    "telemetry",
    "jobs",
    "assets",
    "preflights",
    "usage",
    "gatewayConfig",
    "discovery",
    "operationalEvents",
    "workspace",
  ]);
  if (Object.keys(repository.data).some((key) => !repositoryFields.has(key)))
    throw fail(
      422,
      "Unsupported repository extension; use a compatible editor pack version",
    );
  const stories = new Set(repository.data.backlog.map((story) => story.id));
  if (stories.size !== repository.data.backlog.length)
    throw fail(422, "Duplicate story identities");
  const assetIds = new Set();
  for (const asset of input.assets) {
    exact(asset, ["id", "metadata", "file"]);
    if (!/^[a-f0-9]{32}$/.test(asset.id) || assetIds.has(asset.id))
      throw fail(422, "Invalid editor asset identity");
    assetIds.add(asset.id);
    scanPortable(asset.metadata);
    validatePortability(asset.metadata.portableHistory);
    exact(asset.metadata, [
      "id",
      "name",
      "contentType",
      "size",
      "width",
      "height",
      "sha256",
      "rightsDeclaration",
      "consent",
      "createdBy",
      "createdAt",
      "lineage",
      "portableHistory",
    ]);
    if (
      asset.metadata.size > 512 * 1024 ||
      asset.metadata.id !== asset.id ||
      asset.metadata.sha256 !== asset.file ||
      asset.metadata.size !== bytes(asset.file).length ||
      !["image/png", "image/jpeg", "image/webp"].includes(
        asset.metadata.contentType,
      ) ||
      !["confirmed", "not_personal_data"].includes(asset.metadata.consent) ||
      typeof asset.metadata.rightsDeclaration !== "string" ||
      !asset.metadata.rightsDeclaration.trim()
    )
      throw fail(422, "Invalid portable image rights or bytes");
  }
  for (const asset of input.assets)
    if (asset.metadata.lineage) {
      const lineage = asset.metadata.lineage;
      exact(lineage, [
        "kind",
        "execution",
        "serverValidation",
        "inputAssetId",
        "inputSha256",
        "modelSha256",
        "processorVersion",
        "outputPolicy",
        "documentId",
        "nativeRevision",
        "intentId",
        "actorId",
      ]);
      const original = input.assets.find(
        (item) => item.id === lineage.inputAssetId,
      );
      if (
        !original ||
        lineage.kind !== "background-removal" ||
        lineage.execution !== "browser_reported" ||
        lineage.inputSha256 !== original.file ||
        !/^[a-f0-9]{64}$/.test(lineage.modelSha256) ||
        asset.metadata.width !== original.metadata.width ||
        asset.metadata.height !== original.metadata.height
      )
        throw fail(422, "Foreign or inconsistent cutout input reference");
    }
  const ids = new Set();
  for (const doc of input.documents) {
    exact(doc, ["metadata", "current", "initial", "history", "reviewHistory", "finalExports"]);
    const m = doc.metadata;
    validatePortability(m?.portableHistory);
    exact(m, [
      "schemaVersion",
      "id",
      "organizationId",
      "brandId",
      "storyId",
      "format",
      "revision",
      "title",
      "origin",
      "status",
      "createdBy",
      "updatedBy",
      "createdAt",
      "updatedAt",
      "portableHistory",
    ]);
    if (
      !/^[a-f0-9-]{36}$/.test(m.id) ||
      ids.has(m.id) ||
      m.organizationId !== input.scope.organizationId ||
      m.brandId !== input.scope.brandId ||
      !stories.has(m.storyId) ||
      !formats.has(m.format) ||
      !Number.isSafeInteger(m.revision) ||
      m.revision < 1 ||
      m.status !== "proposal"
    )
      throw fail(422, "Foreign or invalid native document");
    ids.add(m.id);
    if (
      m.origin?.scope?.organizationId !== input.scope.organizationId ||
      m.origin?.scope?.brandId !== input.scope.brandId ||
      m.origin?.storyId !== m.storyId
    )
      throw fail(422, "Foreign native origin reference");
    if (!Array.isArray(doc.history) || doc.history.length > PACK_LIMITS.history)
      throw fail(413, "Native history limit");
    const validate = (hash) => {
      const document = json(hash);
      const supported = new Set(nativeFontCatalog().map(font => font.family));
      const supplied = new Set(input.fonts.map(font => font.family));
      const visit = value => {
        if (!value || typeof value !== "object") return;
        if (Object.hasOwn(value, "fontFamily")) {
          // The pinned adapter uses a quoted primary family and a generic fallback.
          const family = typeof value.fontFamily === "string"
            ? value.fontFamily.match(/^"([^"\n]+)", (?:sans-serif|serif)$/)?.[1] || value.fontFamily
            : null;
          if (!supported.has(family) || !supplied.has(family))
            throw fail(422, "Native document uses a font not included in the supported licensed pack fonts");
        }
        for (const child of Object.values(value)) visit(child);
      };
      visit(document);
      return validateHostedDocument(document, {
        assets: input.assets.map((a) => a.metadata),
        pageIds: m.origin.pageIds,
      });
    };
    validate(doc.current);
    validate(doc.initial);
    for (const snapshot of doc.history) {
      exact(snapshot, [
        "document",
        "revision",
        "title",
        "updatedBy",
        "updatedAt",
      ]);
      validate(snapshot.document);
    }
    if (doc.reviewHistory !== null) json(doc.reviewHistory);
    if (doc.finalExports !== undefined) {
      if (input.schemaVersion < 2 || !Array.isArray(doc.finalExports) || doc.finalExports.length > 256)
        throw fail(422, "Invalid historical final exports");
      const events = new Set();
      for (const item of doc.finalExports) {
        exact(item, ["authority","receipt","nativeRevision","width","height","file"]);
        exact(item.receipt, ["eventId","artifactId","nativeId","reviewRevision","sha256","size","mime","pageIndex","exportedAt","signedOffBy","completedBy"]);
        if (item.authority !== "historical-only" || item.receipt.nativeId !== m.id || events.has(item.receipt.eventId) ||
            item.file !== item.receipt.sha256 || bytes(item.file).length !== item.receipt.size ||
            item.receipt.mime !== "image/png" || item.width !== 1080 || item.height !== (["story","reel"].includes(m.format)?1920:1350))
          throw fail(422, "Invalid historical final export binding");
        events.add(item.receipt.eventId);
      }
    }
  }
  for (const asset of input.assets)
    if (
      asset.metadata.lineage?.documentId &&
      !ids.has(asset.metadata.lineage.documentId)
    )
      throw fail(422, "Foreign cutout document reference");
  for (const font of input.fonts) {
    exact(font, [
      "family",
      "filename",
      "file",
      "licenseFile",
      "license",
      "licenseFilename",
    ]);
    if (
      font.license !== "OFL-1.1" ||
      !/^[A-Za-z0-9.-]+\.(ttf|otf)$/.test(font.filename) ||
      !/^[A-Za-z0-9.-]+\.txt$/.test(font.licenseFilename)
    )
      throw fail(422, "Unsupported font license or name");
    bytes(font.file);
    bytes(font.licenseFile);
  }
  if (input.preparedHistory !== undefined && input.preparedHistory !== null) {
    if (input.schemaVersion < 2) throw fail(422, "Prepared history requires editor pack version 2");
    const history = json(input.preparedHistory);
    const restored = restorePreparedHistory(history,{scope:input.scope,sourceScope:input.scope,packSha256:input.sha256});
    if (restored.some(entry=>!stories.has(entry.candidate.storyId))) throw fail(422,"Foreign prepared story association");
    projectPreparedHistory(restored,input.scope);
  }
  if (used.size !== files.size)
    throw fail(422, "Unreferenced editor pack bytes");
  // Metadata and containers must detach from the caller before any async use.
  // File records have exactly these four validated primitive fields; new records
  // can share immutable string/number values without cloning the base64 payloads.
  // Replacing the value preserves the original top-level key order/checksum.
  const pack = structuredClone({ ...input, files: [] });
  pack.files = input.files.map((file) => ({ ...file }));
  return { pack, files, repository, json, bytes };
}
export function sealEditorPack(content) {
  const pack = { ...content, sha256: jsonDigest(content) };
  validateEditorPack(pack);
  return pack;
}
