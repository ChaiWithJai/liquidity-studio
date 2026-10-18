import { randomUUID, randomBytes, createHash } from "node:crypto";
import { fail } from "./auth.js";

const KINDS = [
  "document",
  "tokens",
  "comment",
  "room",
  "cache",
  "artifact",
  "recovery",
];
const ACTIONS = {
  document: ["read", "write", "export", "recover"],
  tokens: ["read", "write"],
  comment: ["read", "write"],
  room: ["read", "join"],
  cache: ["read", "write"],
  artifact: ["read", "export"],
  recovery: ["read", "recover"],
};
const MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/zip",
  "text/plain; charset=utf-8",
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const identifier = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_.:@-]{1,200}$/.test(value);
function exact(value, fields) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !fields.includes(key))
  )
    throw fail(400, "Unknown editor boundary field");
}
/** Only operator-supplied mappings enter this registry. No transport URL or credential is accepted. */
export function validateEditorTargets(targets) {
  if (!Array.isArray(targets) || targets.length > 50)
    throw new Error("Invalid operator editor target configuration");
  const ids = new Set();
  for (const target of targets) {
    exact(target, [
      "id",
      "organizationId",
      "brandId",
      "adapter",
      "ownerPrincipal",
      "nativeProjectId",
      "nativeRoomId",
      "nativeDocumentVersion",
      "editorVersion",
      "resources",
    ]);
    if (
      !["doory", "penpot"].includes(target.adapter) ||
      ![
        "id",
        "organizationId",
        "brandId",
        "ownerPrincipal",
        "nativeProjectId",
        "nativeRoomId",
        "nativeDocumentVersion",
        "editorVersion",
      ].every((key) => identifier(target[key])) ||
      ids.has(target.id) ||
      !Array.isArray(target.resources) ||
      target.resources.length > 200
    )
      throw new Error("Invalid operator editor target configuration");
    if (
      target.nativeDocumentVersion !== "1" ||
      (target.adapter === "penpot" && target.editorVersion !== "2.18.3") ||
      (target.adapter === "doory" &&
        target.editorVersion !== "27b6f68221fdbf1ef1bedc182e303210ca9e39f5")
    )
      throw new Error("Unsupported operator native target version");
    ids.add(target.id);
    const resources = new Set();
    for (const resource of target.resources) {
      exact(resource, ["id", "kind", "nativeId", "nativeParentId"]);
      if (
        !identifier(resource.id) ||
        !identifier(resource.nativeId) ||
        !KINDS.includes(resource.kind) ||
        resource.nativeParentId !== target.nativeProjectId ||
        resources.has(resource.id)
      )
        throw new Error("Invalid operator-owned native resource mapping");
      resources.add(resource.id);
    }
  }
  return structuredClone(targets);
}
export class EditorTransportPort {
  validateCommand() {
    throw fail(501, "External editor transport is not configured or accepted");
  }
  async execute() {
    throw fail(501, "External editor transport is not configured or accepted");
  }
}
/** Authorization records are deliberately outside scope:* portable repository state. */
export class EditorBoundary {
  constructor({
    store,
    scope,
    identity,
    repo,
    targets = [],
    transport = new EditorTransportPort(),
    now = () => Date.now(),
  }) {
    this.store = store;
    this.scope = scope;
    this.identity = identity;
    this.repo = repo;
    this.targets = validateEditorTargets(targets);
    this.transport = transport;
    this.now = now;
    this.key = `editor-security:${scope.organizationId}:${scope.brandId}`;
  }
  async authorize(actor) {
    return this.identity.authorize(
      actor,
      this.scope.organizationId,
      this.scope.brandId,
    );
  }
  async read() {
    return (await this.store.get(this.key)) || { bindings: [], grants: [] };
  }
  async update(callback) {
    return this.store.update(this.key, (state) =>
      callback(state || { bindings: [], grants: [] }),
    );
  }
  binding(state, id) {
    const binding = state.bindings.find((item) => item.id === id);
    if (
      !binding ||
      binding.revokedAt ||
      binding.organizationId !== this.scope.organizationId ||
      binding.brandId !== this.scope.brandId
    )
      throw fail(404, "Editor binding not found");
    const target = this.targets.find((item) => item.id === binding.targetId);
    if (!target || hash(JSON.stringify(target)) !== binding.targetHash)
      throw fail(409, "Operator editor target changed; register a new binding");
    return binding;
  }
  async register(actor, input) {
    await this.authorize(actor);
    this.identity.requireFounder(actor);
    exact(input, ["targetId"]);
    const target = this.targets.find(
      (item) =>
        item.id === input.targetId &&
        item.organizationId === this.scope.organizationId &&
        item.brandId === this.scope.brandId,
    );
    if (!target)
      throw fail(
        403,
        "Operator-approved editor target not available for this scope",
      );
    const binding = {
      id: randomUUID(),
      organizationId: this.scope.organizationId,
      brandId: this.scope.brandId,
      targetId: target.id,
      targetHash: hash(JSON.stringify(target)),
      adapter: target.adapter,
      ownerPrincipal: target.ownerPrincipal,
      nativeProjectId: target.nativeProjectId,
      nativeRoomId: target.nativeRoomId,
      nativeDocumentVersion: target.nativeDocumentVersion,
      editorVersion: target.editorVersion,
      resources: structuredClone(target.resources),
      epoch: 1,
      registeredBy: actor.id,
      registeredAt: new Date(this.now()).toISOString(),
      revokedAt: null,
    };
    await this.update((state) => {
      state.bindings.push(binding);
      return state;
    });
    return binding;
  }
  async list(actor) {
    await this.authorize(actor);
    return (await this.read()).bindings
      .filter((item) => !item.revokedAt)
      .map(({ targetHash, ...binding }) => binding);
  }
  async revoke(actor, id) {
    await this.authorize(actor);
    this.identity.requireFounder(actor);
    await this.update((state) => {
      const binding = this.binding(state, id);
      binding.revokedAt = new Date(this.now()).toISOString();
      binding.epoch++;
      return state;
    });
    return { revoked: true };
  }
  async execute(actor, bindingId, input, { roomGrantValidated = false } = {}) {
    await this.authorize(actor);
    exact(input, ["resourceId", "kind", "action", "command"]);
    if (input.action === "join" && !roomGrantValidated)
      throw fail(403, "A live single-use room grant is required");
    if (
      !KINDS.includes(input.kind) ||
      !ACTIONS[input.kind]?.includes(input.action)
    )
      throw fail(400, "Unsupported editor operation");
    const binding = this.binding(await this.read(), bindingId);
    const resource = binding.resources.find(
      (item) =>
        item.id === input.resourceId &&
        item.kind === input.kind &&
        item.nativeParentId === binding.nativeProjectId,
    );
    if (!resource) throw fail(404, "Editor resource not found in binding");
    if (
      input.action === "join" &&
      (input.kind !== "room" || resource.nativeId !== binding.nativeRoomId)
    )
      throw fail(403, "Room is not bound to this project");
    const command = await this.transport.validateCommand({
      binding: structuredClone(binding),
      resource: structuredClone(resource),
      action: input.action,
      command: input.command,
    });
    // A transport gets trusted mappings only; request metadata never selects native identity.
    const result = await this.transport.execute({
      binding: structuredClone(binding),
      resource: structuredClone(resource),
      actor: { id: actor.id, role: actor.role },
      action: input.action,
      command,
      cacheKey: `${this.scope.organizationId}:${this.scope.brandId}:${binding.id}:${binding.epoch}:${resource.kind}:${resource.id}`,
    });
    await this.authorize(actor);
    const current = this.binding(await this.read(), bindingId);
    if (current.epoch !== binding.epoch)
      throw fail(403, "Editor binding changed during operation");
    return result;
  }
  async asset(actor, input) {
    const asset = await this.repo.getAsset(input.assetId);
    if (
      !asset ||
      asset.organizationId !== this.scope.organizationId ||
      asset.brandId !== this.scope.brandId
    )
      throw fail(404, "Private asset not found");
    const bytes = Buffer.from(asset.base64, "base64");
    if (
      !identifier(input.expectedGenerationId) ||
      asset.generationId !== input.expectedGenerationId ||
      input.expectedSha256 !== asset.sha256 ||
      hash(bytes) !== asset.sha256
    )
      throw fail(409, "Private asset generation or checksum mismatch");
    if (
      !MIME.includes(asset.contentType) ||
      !bytes.length ||
      bytes.length > 20 * 1024 * 1024
    )
      throw fail(422, "Private asset MIME or size is unsupported");
    return { asset, bytes };
  }
  async grantAsset(actor, bindingId, input) {
    await this.authorize(actor);
    exact(input, [
      "assetId",
      "expectedGenerationId",
      "expectedSha256",
      "ttlSeconds",
    ]);
    const ttl = input.ttlSeconds ?? 60;
    if (!Number.isInteger(ttl) || ttl < 1 || ttl > 300)
      throw fail(400, "Asset grant TTL must be 1 to 300 seconds");
    const { asset, bytes } = await this.asset(actor, input);
    const token = randomBytes(32).toString("base64url");
    const expiresAt = this.now() + ttl * 1000;
    await this.update((state) => {
      const binding = this.binding(state, bindingId);
      state.grants = state.grants.filter(
        (item) => item.expiresAt > this.now() && !item.usedAt,
      );
      state.grants.push({
        type: "asset",
        tokenHash: hash(token),
        bindingId,
        epoch: binding.epoch,
        actorId: actor.id,
        assetId: asset.id,
        expectedGenerationId: asset.generationId,
        expectedSha256: asset.sha256,
        expiresAt,
        usedAt: null,
      });
      return state;
    });
    return {
      token,
      expiresAt: new Date(expiresAt).toISOString(),
      manifest: {
        assetId: asset.id,
        organizationId: this.scope.organizationId,
        brandId: this.scope.brandId,
        generationId: asset.generationId,
        sha256: asset.sha256,
        contentType: asset.contentType,
        size: bytes.length,
      },
      delivery: "authenticated_single_use_header",
      publicShare: false,
    };
  }
  async grantRoom(actor, bindingId, input) {
    await this.authorize(actor);
    exact(input, ["resourceId", "ttlSeconds"]);
    const ttl = input.ttlSeconds ?? 60;
    if (!Number.isInteger(ttl) || ttl < 1 || ttl > 300)
      throw fail(400, "Room grant TTL must be 1 to 300 seconds");
    const token = randomBytes(32).toString("base64url");
    const expiresAt = this.now() + ttl * 1000;
    await this.update((state) => {
      const binding = this.binding(state, bindingId);
      const resource = binding.resources.find(
        (item) =>
          item.id === input.resourceId &&
          item.kind === "room" &&
          item.nativeId === binding.nativeRoomId &&
          item.nativeParentId === binding.nativeProjectId,
      );
      if (!resource) throw fail(404, "Room not found in binding");
      state.grants = state.grants.filter(
        (item) => item.expiresAt > this.now() && !item.usedAt,
      );
      state.grants.push({
        type: "room",
        tokenHash: hash(token),
        bindingId,
        epoch: binding.epoch,
        actorId: actor.id,
        resourceId: resource.id,
        expiresAt,
        usedAt: null,
      });
      return state;
    });
    return {
      token,
      expiresAt: new Date(expiresAt).toISOString(),
      publicShare: false,
    };
  }
  async joinRoom(actor, bindingId, input) {
    await this.authorize(actor);
    exact(input, ["token"]);
    if (typeof input.token !== "string" || !/^[\w-]{43}$/.test(input.token))
      throw fail(403, "Invalid room grant");
    let resourceId;
    await this.update((state) => {
      const binding = this.binding(state, bindingId);
      const grant = state.grants.find(
        (item) => item.tokenHash === hash(input.token),
      );
      if (
        !grant ||
        grant.type !== "room" ||
        grant.actorId !== actor.id ||
        grant.bindingId !== bindingId ||
        grant.epoch !== binding.epoch ||
        grant.usedAt ||
        grant.expiresAt <= this.now()
      )
        throw fail(403, "Room grant expired, revoked or consumed");
      grant.usedAt = this.now();
      resourceId = grant.resourceId;
      return state;
    });
    return this.execute(
      actor,
      bindingId,
      { resourceId, kind: "room", action: "join" },
      { roomGrantValidated: true },
    );
  }
  async consumeAsset(actor, bindingId, token) {
    await this.authorize(actor);
    if (typeof token !== "string" || !/^[\w-]{43}$/.test(token))
      throw fail(403, "Invalid asset grant");
    let selected;
    await this.update((state) => {
      const binding = this.binding(state, bindingId);
      const grant = state.grants.find((item) => item.tokenHash === hash(token));
      if (
        !grant ||
        grant.type !== "asset" ||
        grant.actorId !== actor.id ||
        grant.bindingId !== bindingId ||
        grant.epoch !== binding.epoch ||
        grant.usedAt ||
        grant.expiresAt <= this.now()
      )
        throw fail(403, "Asset grant expired, revoked or consumed");
      grant.usedAt = this.now();
      selected = structuredClone(grant);
      return state;
    });
    const result = await this.asset(actor, selected);
    await this.authorize(actor);
    this.binding(await this.read(), bindingId);
    return result;
  }
}
