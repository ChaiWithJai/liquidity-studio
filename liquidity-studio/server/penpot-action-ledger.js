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
    if (
      ![bindingId, resourceId, idempotencyKey].every(identifier) ||
      !command ||
      Array.isArray(command) ||
      Object.keys(command).length !== commandFields.length ||
      Object.keys(command).some((key) => !commandFields.includes(key)) ||
      command.operation !== "refresh-brand-tokens" ||
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
