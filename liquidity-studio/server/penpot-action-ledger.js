import { createHash, randomUUID } from "node:crypto";
import { fail } from "./auth.js";

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  return value;
}
export const penpotActionDigest = (value) =>
  createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
const hash = penpotActionDigest;
const identifier = (value) =>
  typeof value === "string" && /^[\w-]{1,200}$/.test(value);
const commandFields = [
  "operation",
  "storyId",
  "expectedRevision",
  "generationId",
  "expectedBrandRevision",
  "expectedNativeRevision",
];
export const penpotRasterFields = [
  ...commandFields,
  "assetId",
  "assetSha256",
  "assetGeneration",
  "pageId",
  "frameId",
  "placement",
];
export function validatePenpotRasterCommand(command) {
  if (
    !/^[a-f0-9]{32}$/.test(command.assetId) ||
    !/^[a-f0-9]{64}$/.test(command.assetSha256) ||
    typeof command.assetGeneration !== "string" ||
    !command.assetGeneration.length ||
    command.assetGeneration.length > 200 ||
    ![command.pageId, command.frameId].every(
      (value) =>
        typeof value === "string" &&
        /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(value),
    ) ||
    !command.placement ||
    Array.isArray(command.placement) ||
    Object.keys(command.placement).sort().join() !== "height,width,x,y" ||
    !Object.values(command.placement).every(Number.isFinite) ||
    command.placement.width <= 0 ||
    command.placement.height <= 0 ||
    command.placement.width > 4096 ||
    command.placement.height > 4096
  )
    throw fail(400, "Invalid registered raster placement or asset identity");
}
/** Security/operation state deliberately lives outside portable ScopedRepository data.
 * Callbacks are trusted server dependencies, never supplied by an HTTP command.
 */
export class PenpotActionLedger {
  constructor({ store, scope, authorize, now = () => Date.now() }) {
    if (
      !store ||
      typeof authorize !== "function" ||
      !identifier(scope.organizationId) ||
      !identifier(scope.brandId)
    )
      throw new Error("Invalid native action ledger configuration");
    this.store = store;
    this.scope = structuredClone(scope);
    this.authorize = authorize;
    this.now = now;
    this.key = `penpot-action-security:${scope.organizationId}:${scope.brandId}`;
  }
  async permitted(actor) {
    if (!identifier(actor?.id))
      throw fail(401, "Current native action actor required");
    await this.authorize(actor, this.scope);
  }
  row(state, actor, id) {
    const row = state?.actions?.find(
      (item) => item.id === id && item.actorId === actor.id,
    );
    if (!row) throw fail(404, "Native action not found");
    return row;
  }
  async create(actor, { bindingId, resourceId, command, idempotencyKey }) {
    await this.permitted(actor);
    const raster = command?.operation === "import-private-raster";
    const fields = raster ? penpotRasterFields : commandFields;
    if (
      ![bindingId, resourceId, idempotencyKey].every(identifier) ||
      !command ||
      Array.isArray(command) ||
      Object.keys(command).length !== fields.length ||
      Object.keys(command).some((key) => !fields.includes(key)) ||
      !["refresh-brand-tokens", "import-private-raster"].includes(
        command.operation,
      ) ||
      !identifier(command.storyId) ||
      !identifier(command.generationId) ||
      !Number.isInteger(command.expectedRevision) ||
      command.expectedRevision < 1 ||
      !Number.isInteger(command.expectedNativeRevision) ||
      command.expectedNativeRevision < 0 ||
      typeof command.expectedBrandRevision !== "string" ||
      !/^[a-f0-9]{64}$/.test(command.expectedBrandRevision)
    )
      throw fail(400, "Invalid durable native action intent");
    if (raster) validatePenpotRasterCommand(command);
    const fingerprint = hash({ bindingId, resourceId, command });
    let result;
    await this.store.update(this.key, (current) => {
      const state = current || { actions: [] };
      const prior = state.actions.find(
        (item) =>
          item.actorId === actor.id && item.idempotencyKey === idempotencyKey,
      );
      if (prior) {
        if (prior.fingerprint !== fingerprint)
          throw fail(
            409,
            "Native action request key was reused with different content",
          );
        result = { created: false, action: structuredClone(prior) };
        return state;
      }
      // Bounded authority history is never silently evicted, including uncertain actions.
      if (state.actions.length >= 1000)
        throw fail(429, "Native action history requires operator archival");
      const action = {
        id: randomUUID(),
        actorId: actor.id,
        organizationId: this.scope.organizationId,
        brandId: this.scope.brandId,
        bindingId,
        resourceId,
        command: structuredClone(command),
        idempotencyKey,
        fingerprint,
        status: "preparing-native-action",
        createdAt: new Date(this.now()).toISOString(),
        updatedAt: new Date(this.now()).toISOString(),
        verification: null,
      };
      state.actions.push(action);
      result = { created: true, action: structuredClone(action) };
      return state;
    });
    return result;
  }
  async bind(actor, id, execution) {
    await this.permitted(actor);
    if (
      !execution ||
      !identifier(execution.fileId) ||
      !Number.isInteger(execution.bindingEpoch) ||
      execution.bindingEpoch < 1 ||
      typeof execution.manifestHash !== "string" ||
      !/^[a-f0-9]{64}$/.test(execution.manifestHash)
    )
      throw new Error("Invalid server native registration snapshot");
    let result;
    await this.store.update(this.key, (state) => {
      const row = this.row(state, actor, id);
      const snapshot = {
        fileId: execution.fileId,
        bindingEpoch: execution.bindingEpoch,
        manifestHash: execution.manifestHash,
      };
      if (row.execution && hash(row.execution) !== hash(snapshot))
        throw fail(409, "Native action registration changed");
      row.execution = snapshot;
      result = structuredClone(row);
      return state;
    });
    return result;
  }
  async reserveMedia(actor, id, snapshot) {
    await this.permitted(actor);
    if (
      !snapshot.protectedObjects ||
      !Object.keys(snapshot.protectedObjects).length
    )
      throw fail(409, "Saved native content proof is unavailable");
    let result;
    await this.store.update(this.key, (state) => {
      const row = this.row(state, actor, id);
      if (row.command.operation !== "import-private-raster")
        throw fail(409, "Raster action required");
      if (!row.media)
        row.media = {
          mediaId: randomUUID(),
          assetId: row.command.assetId,
          sha256: row.command.assetSha256,
          generation: row.command.assetGeneration,
          protectedObjects: structuredClone(snapshot.protectedObjects),
        };
      result = structuredClone(row.media);
      return state;
    });
    return result;
  }
  async issued(actor, id, expiresAt) {
    await this.permitted(actor);
    if (
      !Number.isFinite(expiresAt) ||
      expiresAt <= this.now() ||
      expiresAt > this.now() + 60_000
    )
      throw new Error("Invalid native action expiry");
    await this.store.update(this.key, (state) => {
      const row = this.row(state, actor, id);
      if (row.status === "native-state-verified")
        throw fail(409, "Native action already verified");
      row.status = "pending-native-action";
      row.expiresAt = expiresAt;
      row.updatedAt = new Date(this.now()).toISOString();
      return state;
    });
  }
  async retainMedia(actor, id, media) {
    await this.permitted(actor);
    let pointer;
    await this.store.update(this.key, (state) => {
      const row = this.row(state, actor, id);
      if (!row.media || row.media.mediaId !== media.id)
        throw fail(409, "Reserved native media changed");
      if (row.media.descriptor && hash(row.media.descriptor) !== hash(media))
        throw fail(409, "Native media descriptor changed");
      row.media.descriptor = structuredClone(media);
      pointer = {
        organizationId: row.organizationId,
        brandId: row.brandId,
        actorId: row.actorId,
        actionId: row.id,
        bindingId: row.bindingId,
        resourceId: row.resourceId,
        bindingEpoch: row.execution.bindingEpoch,
        fileId: media.provenance.fileId,
        projectId: media.provenance.projectId,
        ownerPrincipal: media.provenance.ownerPrincipal,
        fileMediaId: media.id,
        objectId: media.provenance.mediaObjectId,
      };
      return state;
    });
    // A locator is not authority. Every read verifies the current ledger action,
    // binding epoch, asset generation, actor and native file ACL again.
    for (const [kind, nativeId] of [
      ["by-id", pointer.objectId],
      ["by-file-media-id", pointer.fileMediaId],
    ]) {
      await this.store.update(
        `penpot-media-security:${kind}:${nativeId}`,
        (current) => {
          const entries = current || [];
          const prior = entries.find(
            (entry) =>
              entry.actionId === pointer.actionId &&
              entry.brandId === pointer.brandId &&
              entry.organizationId === pointer.organizationId,
          );
          if (prior && hash(prior) !== hash(pointer))
            throw fail(409, "Native media locator changed");
          if (!prior) {
            if (entries.length >= 50)
              throw fail(429, "Native media copy registry requires archival");
            entries.push(pointer);
          }
          return entries;
        },
      );
    }
  }
  async list(actor) {
    await this.permitted(actor);
    return ((await this.store.get(this.key))?.actions || [])
      .filter((item) => item.actorId === actor.id)
      .map((item) => structuredClone(item));
  }
  async get(actor, id) {
    await this.permitted(actor);
    return structuredClone(this.row(await this.store.get(this.key), actor, id));
  }
  async transition(actor, id, status, verification = null) {
    await this.permitted(actor);
    if (
      ![
        "pending-native-action",
        "reconciliation-required",
        "native-state-verified",
      ].includes(status)
    )
      throw new Error("Invalid internal native action transition");
    if (
      status === "native-state-verified" &&
      (!verification ||
        !Number.isInteger(verification.nativeRevision) ||
        verification.nativeRevision < 0 ||
        !["acknowledgement", "read-only-reconciliation"].includes(
          verification.method,
        ) ||
        typeof verification.bindingEpoch !== "number" ||
        !Number.isInteger(verification.bindingEpoch) ||
        verification.bindingEpoch < 1)
    )
      throw new Error("Verified native snapshot required");
    let result;
    await this.store.update(this.key, (state) => {
      const row = this.row(state, actor, id);
      // A completed historical snapshot cannot regress because a reply was lost.
      if (row.status === "native-state-verified") {
        result = structuredClone(row);
        return state;
      }
      row.status = status;
      row.updatedAt = new Date(this.now()).toISOString();
      if (verification)
        row.verification = {
          nativeRevision: verification.nativeRevision,
          bindingEpoch: verification.bindingEpoch,
          method: verification.method,
          observedAt: row.updatedAt,
          pixelsVerified: false,
          publicationApproved: false,
        };
      result = structuredClone(row);
      return state;
    });
    return result;
  }
}
