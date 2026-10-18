import { createHash, randomUUID } from "node:crypto";
import { fail } from "./auth.js";
import {
  compileMultimodalBundle,
  brandRevision,
} from "./multimodal-contract.js";
import { compileDooryDocument } from "./doory-native-adapter.js";

const FORMATS = new Set(["infographic", "carousel", "story", "reel"]);
const TYPES = new Set([
  "textbox",
  "itext",
  "rect",
  "ellipse",
  "circle",
  "triangle",
  "polygon",
  "polyline",
  "path",
  "image",
  "group",
  "doryline",
]);
const clone = (value) => structuredClone(value);
const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
function exact(value, keys) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !keys.includes(key))
  )
    throw fail(400, "Unsupported native editor fields");
}
function text(value, name, max = 160) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw fail(400, `Invalid ${name}`);
  return value;
}
function revision(value) {
  if (!Number.isSafeInteger(value) || value < 1)
    throw fail(400, "Invalid native revision");
}

/** Validate native data before it reaches Fabric. No resource URL is executable document data. */
export function validateHostedDocument(
  document,
  { assets = [], pageIds } = {},
) {
  exact(document, [
    "schemaVersion",
    "width",
    "height",
    "unit",
    "pages",
    "audioTracks",
    "meta",
  ]);
  if (
    Buffer.byteLength(JSON.stringify(document)) > 512 * 1024 ||
    document.schemaVersion !== 1 ||
    document.width !== 1080 ||
    ![1350, 1920].includes(document.height) ||
    document.unit !== "px" ||
    !Array.isArray(document.pages) ||
    ![1, 3, 4].includes(document.pages.length) ||
    (document.audioTracks?.length || 0) !== 0
  )
    throw fail(422, "Unsupported native document structure");
  const assetIds = new Set(assets.map((asset) => asset.id));
  const ids = new Set();
  let nodes = 0;
  function walk(value, depth = 0) {
    if (++nodes > 50000 || depth > 32)
      throw fail(422, "Native document is too complex");
    if (
      typeof value === "number" &&
      (!Number.isFinite(value) || Math.abs(value) > 10000000)
    )
      throw fail(422, "Invalid native numeric value");
    if (typeof value === "string" && value.length > 32000)
      throw fail(422, "Native text is too long");
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value))
      return value.forEach((item) => walk(item, depth + 1));
    for (const [key, child] of Object.entries(value)) {
      if (
        [
          "__proto__",
          "constructor",
          "prototype",
          "crossOrigin",
          "clipPath",
          "reviver",
        ].includes(key)
      )
        throw fail(422, "Unsupported native executable or resource field");
      if (["src", "docSrc"].includes(key)) {
        const match =
          typeof child === "string" &&
          /^studio-asset:([a-zA-Z0-9_-]{1,100})$/.exec(child);
        if (!match || !assetIds.has(match[1]))
          throw fail(422, "Native asset is not owned by this scope");
      }
      if (
        ["source", "url"].includes(key) &&
        typeof child === "string" &&
        /^(?:https?:|\/\/|data:|blob:|javascript:)/i.test(child)
      )
        throw fail(422, "External native resources are unavailable");
      walk(child, depth + 1);
    }
  }
  function objects(items) {
    if (!Array.isArray(items) || items.length > 250)
      throw fail(422, "Too many native objects");
    for (const object of items) {
      if (
        !object ||
        !TYPES.has(object.type) ||
        typeof object.id !== "string" ||
        object.id.length > 160 ||
        ids.has(object.id)
      )
        throw fail(422, "Invalid native object identity");
      ids.add(object.id);
      if (object.type === "image") {
        if (
          !assetIds.has(object.assetId) ||
          ![object.src, object.docSrc]
            .filter(Boolean)
            .every((src) => src === `studio-asset:${object.assetId}`)
        )
          throw fail(422, "Image requires an owned immutable asset");
        if (!object.src && !object.docSrc)
          throw fail(422, "Image source is required");
      }
      if (object.objects) objects(object.objects);
    }
  }
  const pages = new Set();
  for (const page of document.pages) {
    if (!page || typeof page.id !== "string" || pages.has(page.id))
      throw fail(422, "Invalid native page identity");
    pages.add(page.id);
    ids.clear();
    objects(page.objects);
  }
  if (
    pageIds &&
    (pageIds.length !== pages.size ||
      pageIds.some((id, index) => document.pages[index]?.id !== id))
  )
    throw fail(422, "Source page identity/order must be preserved");
  walk(document);
  return clone(document);
}

export class NativeEditorService {
  constructor({
    repo,
    identity,
    scope,
    availableFonts = [],
    now = () => new Date().toISOString(),
  }) {
    Object.assign(this, { repo, identity, scope, availableFonts, now });
    this.store = repo.store;
    this.prefix = `native-editor:${scope.organizationId}:${scope.brandId}:`;
  }
  async authorize(actor) {
    if (!actor?.id) throw fail(401, "Sign in required");
    await this.identity.authorize(
      actor,
      this.scope.organizationId,
      this.scope.brandId,
    );
  }
  key(id) {
    if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id))
      throw fail(404, "Native document not found");
    return `${this.prefix}document:${id}`;
  }
  async persistDocument(document) {
    const bytes = Buffer.from(JSON.stringify(document));
    const id = randomUUID();
    if (this.store.uploadArtifact)
      return {
        artifact: await this.store.uploadArtifact(
          this.scope,
          id,
          bytes,
          "application/json",
        ),
      };
    const key = `${this.prefix}payload:${id}`;
    await this.store.update(key, () => ({
      document: clone(document),
      sha256: hash(document),
    }));
    return { key, sha256: hash(document) };
  }
  async discardPayload(reference) {
    if (reference.artifact)
      await this.store.deleteArtifact?.(this.scope, reference.artifact);
    else await this.store.delete(reference.key);
  }
  async hydrate(record, snapshot = record) {
    const reference = snapshot.documentRef;
    let document;
    if (reference.artifact)
      document = JSON.parse(
        (
          await this.store.downloadArtifact(this.scope, reference.artifact)
        ).toString("utf8"),
      );
    else {
      if (!reference.key?.startsWith(`${this.prefix}payload:`))
        throw fail(500, "Native payload ownership mismatch");
      const payload = await this.store.get(reference.key);
      if (!payload || hash(payload.document) !== reference.sha256)
        throw fail(500, "Native payload integrity mismatch");
      document = payload.document;
    }
    const { receipts, documentRef, ...result } = { ...record, ...snapshot };
    return { ...clone(result), document: clone(document) };
  }
  async read(actor, id) {
    await this.authorize(actor);
    const value = await this.store.get(this.key(id));
    if (!value) throw fail(404, "Native document not found");
    return this.hydrate(value);
  }
  request(actor, operation, input) {
    text(input.idempotencyKey, "idempotency key", 100);
    if (!/^[a-zA-Z0-9_-]{16,100}$/.test(input.idempotencyKey))
      throw fail(400, "Invalid idempotency key");
    return {
      key: `${actor.id}:${input.idempotencyKey}`,
      fingerprint: hash({ operation, input }),
    };
  }
  replay(record, intent) {
    const receipt = record?.receipts?.find((item) => item.key === intent.key);
    if (receipt && receipt.fingerprint !== intent.fingerprint)
      throw fail(409, "Idempotency key was used for different content");
    return receipt?.snapshot;
  }
  assertCurrent(state, origin) {
    const story = state.backlog.find((item) => item.id === origin.storyId);
    if (
      !story ||
      story.revision !== origin.storyRevision ||
      story.generationId !== origin.generationId ||
      brandRevision(state.brandProfile) !== origin.brandRevision ||
      hash(story.campaignDraft) !== origin.sourceCampaignSha256 ||
      hash(story.sourceClaims) !== hash(origin.sourceApprovals)
    )
      throw fail(409, "Native source or brand changed; review before saving");
  }
  async create(actor, input) {
    exact(input, [
      "storyId",
      "format",
      "expectedRevision",
      "generationId",
      "expectedBrandRevision",
      "idempotencyKey",
    ]);
    if (!FORMATS.has(input.format)) throw fail(400, "Invalid native format");
    revision(input.expectedRevision);
    await this.authorize(actor);
    const intent = this.request(actor, "create", input);
    // Deterministic scoped ID makes a lost create response safely retryable without a global index.
    const digest = hash({
      scope: this.scope,
      actor: actor.id,
      key: input.idempotencyKey,
    });
    const id = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-${digest.slice(12, 16)}-${digest.slice(16, 20)}-${digest.slice(20, 32)}`;
    const key = this.key(id);
    const prior = await this.store.get(key);
    const replay = this.replay(prior, intent);
    if (replay) return this.hydrate(prior, replay);
    const state = await this.repo.read();
    const story = state.backlog.find((item) => item.id === input.storyId);
    if (!story) throw fail(404, "Story not found");
    const spec = compileMultimodalBundle({
      scope: this.scope,
      brandProfile: state.brandProfile,
      story,
      request: { schemaVersion: 1, ...input, requiredCapabilities: [] },
    });
    const native = compileDooryDocument({
      spec,
      brandProfile: state.brandProfile,
      format: input.format,
      availableFonts: this.availableFonts,
    });
    const documentRef = await this.persistDocument(native.document);
    let retained = false;
    try {
      await this.authorize(actor);
      this.assertCurrent(await this.repo.read(), native.manifest);
      const record = {
        schemaVersion: 1,
        id,
        organizationId: this.scope.organizationId,
        brandId: this.scope.brandId,
        storyId: story.id,
        format: input.format,
        revision: 1,
        title: `${story.title || "Campaign"} — ${input.format}`,
        documentRef,
        origin: native.manifest,
        status: "proposal",
        createdBy: actor.id,
        updatedBy: actor.id,
        createdAt: this.now(),
        updatedAt: this.now(),
      };
      let snapshot;
      const saved = await this.store.update(key, (current) => {
        snapshot = this.replay(current, intent);
        if (snapshot) return current;
        if (current) throw fail(409, "Native create collision");
        const { origin, ...receiptSnapshot } = record;
        snapshot = receiptSnapshot;
        return { ...record, receipts: [{ ...intent, snapshot }] };
      });
      retained =
        saved.documentRef.key === documentRef.key &&
        saved.documentRef.artifact?.object === documentRef.artifact?.object;
      return await this.hydrate(saved, snapshot);
    } finally {
      if (!retained) await this.discardPayload(documentRef);
    }
  }
  async save(actor, id, input) {
    exact(input, ["expectedRevision", "title", "document", "idempotencyKey"]);
    revision(input.expectedRevision);
    text(input.title, "native title");
    await this.authorize(actor);
    const intent = this.request(actor, `save:${id}`, input);
    const key = this.key(id);
    const original = await this.store.get(key);
    if (!original) throw fail(404, "Native document not found");
    const replay = this.replay(original, intent);
    if (replay) return this.hydrate(original, replay);
    const state = await this.repo.read();
    this.assertCurrent(state, original.origin);
    if (original.revision !== input.expectedRevision)
      throw fail(
        409,
        "Native document changed; preserve local work and reload explicitly",
      );
    const document = validateHostedDocument(input.document, {
      assets: state.assets,
      pageIds: original.origin.pageIds,
    });
    const documentRef = await this.persistDocument(document);
    let retained = false;
    try {
      await this.authorize(actor);
      this.assertCurrent(await this.repo.read(), original.origin);
      let snapshot;
      const saved = await this.store.update(key, (current) => {
        if (!current) throw fail(404, "Native document not found");
        snapshot = this.replay(current, intent);
        if (snapshot) return current;
        if (current.revision !== input.expectedRevision)
          throw fail(
            409,
            "Native document changed; preserve local work and reload explicitly",
          );
        snapshot = {
          documentRef,
          title: input.title,
          revision: current.revision + 1,
          updatedBy: actor.id,
          updatedAt: this.now(),
        };
        return {
          ...current,
          ...snapshot,
          receipts: [...current.receipts, { ...intent, snapshot }].slice(-100),
        };
      });
      retained =
        saved.documentRef.key === documentRef.key &&
        saved.documentRef.artifact?.object === documentRef.artifact?.object;
      return await this.hydrate(saved, snapshot);
    } finally {
      if (!retained) await this.discardPayload(documentRef);
    }
  }
}
