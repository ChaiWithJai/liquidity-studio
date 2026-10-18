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
    Buffer.byteLength(JSON.stringify(document)) > 1024 * 1024 ||
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
  }
  async authorize(actor) {
    if (!actor?.id) throw fail(401, "Sign in required");
    await this.identity.authorize(
      actor,
      this.scope.organizationId,
      this.scope.brandId,
    );
  }
  async read(actor, id) {
    await this.authorize(actor);
    const value = (await this.repo.read()).nativeEditor?.documents?.find(
      (item) => item.id === id,
    );
    if (!value) throw fail(404, "Native document not found");
    return clone(value);
  }
  async write(actor, operation, input, apply) {
    await this.authorize(actor);
    text(input.idempotencyKey, "idempotency key", 100);
    if (!/^[a-zA-Z0-9_-]{16,100}$/.test(input.idempotencyKey))
      throw fail(400, "Invalid idempotency key");
    const fingerprint = hash({ operation, input });
    let result;
    await this.repo.mutate((state) => {
      const editor = (state.nativeEditor ||= {
        schemaVersion: 1,
        documents: [],
        receipts: [],
      });
      const key = `${actor.id}:${input.idempotencyKey}`;
      const receipt = editor.receipts.find((item) => item.key === key);
      if (receipt) {
        if (receipt.fingerprint !== fingerprint)
          throw fail(409, "Idempotency key was used for different content");
        result = clone(receipt.result);
        return state;
      }
      result = apply(state, editor);
      editor.receipts.push({ key, fingerprint, result: clone(result) });
      editor.receipts = editor.receipts.slice(-100);
      return state;
    });
    return clone(result);
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
    const id = randomUUID();
    return this.write(actor, "create", input, (state, editor) => {
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
      const record = {
        schemaVersion: 1,
        id,
        organizationId: this.scope.organizationId,
        brandId: this.scope.brandId,
        storyId: story.id,
        format: input.format,
        revision: 1,
        title: `${story.title || "Campaign"} — ${input.format}`,
        document: native.document,
        origin: native.manifest,
        status: "proposal",
        createdBy: actor.id,
        updatedBy: actor.id,
        createdAt: this.now(),
        updatedAt: this.now(),
      };
      editor.documents.push(record);
      return record;
    });
  }
  async save(actor, id, input) {
    exact(input, ["expectedRevision", "title", "document", "idempotencyKey"]);
    revision(input.expectedRevision);
    text(input.title, "native title");
    return this.write(actor, `save:${id}`, input, (state, editor) => {
      const record = editor.documents.find((item) => item.id === id);
      if (!record) throw fail(404, "Native document not found");
      if (record.revision !== input.expectedRevision)
        throw fail(
          409,
          "Native document changed; preserve local work and reload explicitly",
        );
      const story = state.backlog.find((item) => item.id === record.storyId);
      if (
        !story ||
        story.revision !== record.origin.storyRevision ||
        story.generationId !== record.origin.generationId ||
        brandRevision(state.brandProfile) !== record.origin.brandRevision ||
        hash(story.campaignDraft) !== record.origin.sourceCampaignSha256 ||
        hash(story.sourceClaims) !== hash(record.origin.sourceApprovals)
      )
        throw fail(409, "Native source or brand changed; review before saving");
      record.document = validateHostedDocument(input.document, {
        assets: state.assets,
        pageIds: record.origin.pageIds,
      });
      record.title = input.title;
      record.revision++;
      record.updatedBy = actor.id;
      record.updatedAt = this.now();
      return record;
    });
  }
}
