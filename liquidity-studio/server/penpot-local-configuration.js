import { lstat, readFile } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { validateEditorTargets } from "./editor-boundary.js";

const uuid = (value) =>
  typeof value === "string" &&
  /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(value);
const exact = (value, fields) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).every((key) => fields.includes(key));
/** Explicit operator-only local endpoint configuration. No URL or credential enters browser DTOs. */
export async function loadPenpotLocalConfiguration(path, env = process.env) {
  if (
    env.K_SERVICE ||
    env.STUDIO_PENPOT_ENABLED !== "true" ||
    !isAbsolute(path || "")
  )
    throw new Error(
      "Penpot requires explicit local operator configuration; Cloud Run is unsupported",
    );
  const info = await lstat(path);
  if (!info.isFile() || (info.mode & 0o077) !== 0 || info.size > 1024 * 1024)
    throw new Error(
      "Penpot operator configuration must be a bounded private regular file",
    );
  return validatePenpotLocalConfiguration(
    JSON.parse(await readFile(path, "utf8")),
    env,
  );
}

/** Trusted server-only values use the same schema and local admission gates. */
export function validatePenpotLocalConfiguration(value, env = process.env) {
  if (env.K_SERVICE || env.STUDIO_PENPOT_ENABLED !== "true")
    throw new Error(
      "Penpot requires explicit local operator configuration; Cloud Run is unsupported",
    );
  if (
    !exact(value, [
      "version",
      "targets",
      "sessions",
      "manifests",
      "transportMode",
      "legacyMedia",
    ]) ||
    value.version !== 1 ||
    !Array.isArray(value.sessions) ||
    !Array.isArray(value.manifests) ||
    value.sessions.length > 20 ||
    value.manifests.length > 50
  )
    throw new Error("Invalid local Penpot configuration");
  const transportMode = value.transportMode || "loopback";
  if (!["loopback", "docker-host"].includes(transportMode))
    throw new Error("Unsupported fixed native transport mode");
  const targets = validateEditorTargets(value.targets);
  if (!targets.length || targets.some((target) => target.adapter !== "penpot"))
    throw new Error("Only pinned Penpot targets are supported");
  const sessions = new Map();
  for (const session of value.sessions) {
    if (
      !exact(session, ["ownerPrincipal", "cookie"]) ||
      !uuid(session.ownerPrincipal) ||
      typeof session.cookie !== "string" ||
      !session.cookie.length ||
      session.cookie.length > 4096 ||
      /[\r\n]/.test(session.cookie) ||
      sessions.has(session.ownerPrincipal)
    )
      throw new Error("Invalid private native owner session");
    sessions.set(session.ownerPrincipal, { cookie: session.cookie });
  }
  const manifests = new Map();
  for (const entry of value.manifests) {
    if (
      !exact(entry, ["targetId", "teamId", "manifest"]) ||
      !uuid(entry.teamId) ||
      manifests.has(entry.targetId)
    )
      throw new Error("Invalid local native manifest mapping");
    const target = targets.find((target) => target.id === entry.targetId);
    const manifest = entry.manifest;
    if (
      !target ||
      !manifest ||
      manifest.ownerPrincipal !== target.ownerPrincipal ||
      manifest.projectId !== target.nativeProjectId ||
      !uuid(manifest.fileId) ||
      !target.resources.some(
        (resource) =>
          resource.kind === "tokens" && resource.nativeId === manifest.fileId,
      ) ||
      !sessions.has(target.ownerPrincipal) ||
      !Array.isArray(manifest.layers) ||
      !manifest.layers.length ||
      manifest.layers.length > 1000 ||
      !Array.isArray(manifest.tokens) ||
      manifest.tokens.length !== 4 ||
      !manifest.fonts ||
      !manifest.sourceApprovals ||
      typeof manifest.storyId !== "string" ||
      typeof manifest.generationId !== "string" ||
      !Number.isInteger(manifest.storyRevision)
    )
      throw new Error(
        "Native manifest must match the operator target and verified source",
      );
    manifests.set(entry.targetId, structuredClone(entry));
  }
  if (targets.some((target) => !manifests.has(target.id)))
    throw new Error("Every native target needs its private verified manifest");
  const legacyMedia = value.legacyMedia || [];
  if (!Array.isArray(legacyMedia) || legacyMedia.length > 100)
    throw new Error("Bounded native legacy image inventory required");
  const seenLegacy = new Set();
  for (const entry of legacyMedia) {
    if (
      !exact(entry, [
        "targetId",
        "resourceId",
        "fileMediaId",
        "objectId",
        "sha256",
        "rightsDeclaration",
        "consent",
      ])
    )
      throw new Error("Unknown native legacy image inventory field");
    const target = targets.find((target) => target.id === entry.targetId);
    const resource = target?.resources.find(
      (resource) =>
        resource.id === entry.resourceId && resource.kind === "document",
    );
    const key = `${entry.targetId}:${entry.fileMediaId}`;
    if (
      !target ||
      !resource ||
      !uuid(resource.nativeId) ||
      !uuid(entry.fileMediaId) ||
      (entry.objectId !== null && !uuid(entry.objectId)) ||
      !/^[a-f0-9]{64}$/.test(entry.sha256) ||
      typeof entry.rightsDeclaration !== "string" ||
      !entry.rightsDeclaration.trim() ||
      entry.rightsDeclaration.length > 500 ||
      !["confirmed", "not_personal_data"].includes(entry.consent) ||
      seenLegacy.has(key)
    )
      throw new Error(
        "Legacy image must bind exact registered file, media, rights and hash",
      );
    seenLegacy.add(key);
  }
  return {
    targets,
    sessions,
    manifests,
    transportMode,
    legacyMedia: structuredClone(legacyMedia),
  };
}
