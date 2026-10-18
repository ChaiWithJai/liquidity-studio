import {AUDIO_LIMITS,inspectPcmWav,validateAudioTracks,audioSource} from './native-audio.js';
import { planHistoricalRebind, rebindHistorical } from './native-historical-rebind.js';
import { assertRestoreAvailable } from "./restore-gate.js";
import { createHash, randomUUID } from "node:crypto";
import { fail } from "./auth.js";
import {
  compileMultimodalBundle,
  brandRevision,
} from "./multimodal-contract.js";
import {
  compileDooryDocument,
  applyDooryBrandTokens,
} from "./doory-native-adapter.js";
import { getApprovedClaims } from "./source-integrity.js";

let activeImageDecodes = 0;
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
    ![1, 3, 4].includes(document.pages.length)
  )
    throw fail(422, "Unsupported native document structure");
  const assetIds = new Set(assets.filter(asset=>asset.kind!=="audio").map((asset) => asset.id));
  const audioIds = new Set(assets.filter(asset=>asset.kind==="audio").map(asset=>asset.id));
  validateAudioTracks(document.audioTracks,{assets,pageIds:document.pages.map(p=>p.id)});
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
      if (
        ["fill", "stroke", "backgroundColor"].includes(key) &&
        typeof child === "string" &&
        /url\s*\(/i.test(child)
      )
        throw fail(422, "External native paint references are unavailable");
      if (["src", "docSrc"].includes(key)) {
        const match =
          typeof child === "string" &&
          /^studio-asset:([a-zA-Z0-9_-]{1,100})$/.exec(child);
        const audioMatch=typeof child==="string"&&/^\/__studio_native_audio\/([a-f0-9]{32})$/.exec(child);
        if ((!match || !assetIds.has(match[1])) && (!audioMatch||!audioIds.has(audioMatch[1])))
          throw fail(422, "Native asset is not owned by this scope");
      }
      // Fabric pattern sources resolve relative URLs too; no arbitrary source/url field
      // is part of this host's opaque private-image contract.
      if (["source", "url"].includes(key))
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
    if (this.repo.key)
      assertRestoreAvailable(await this.store.get(this.repo.key));
  }
  key(id) {
    if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id))
      throw fail(404, "Native document not found");
    return `${this.prefix}document:${id}`;
  }
  async commitScoped(key, mutate, origin) {
    if (!this.repo.key) return this.store.update(key, mutate);
    const result = await this.store.transact(
      [this.repo.key, key],
      ([source, current]) => {
        assertRestoreAvailable(source);
        if (origin) this.assertCurrent(source, origin);
        return [source, mutate(current)];
      },
    );
    return result[1];
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
    await this.commitScoped(key, () => ({
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
    const { receipts, documentRef, initialDocumentRef, restoredExports, ...result } = {
      ...record,
      ...snapshot,
    };
    return { ...clone(result), document: clone(document) };
  }
  async list(actor, { storyId, format }) {
    await this.authorize(actor);
    text(storyId, "story ID");
    if (!FORMATS.has(format)) throw fail(400, "Invalid native format");
    const keys = await this.store.keys(`${this.prefix}document:`);
    if (keys.length > 1000)
      throw fail(413, "Native proposal history exceeds the bounded host limit");
    const records = await Promise.all(keys.map((key) => this.store.get(key)));
    await this.authorize(actor);
    return {
      documents: records
        .filter(
          (record) => record.storyId === storyId && record.format === format,
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((record) => ({
          id: record.id,
          revision: record.revision,
          title: record.title,
          updatedAt: record.updatedAt,
          storyRevision: record.origin.storyRevision,
          ...(record.origin.sourceContentRevision === undefined
            ? {}
            : { sourceContentRevision: record.origin.sourceContentRevision }),
          generationId: record.origin.generationId,
          brandRevision: record.origin.brandRevision,
          requiresSourceReview: record.origin.requiresSourceReview === true,
        })),
    };
  }
  async publicRecord(actor, record, snapshot = record) {
    const dto = await this.hydrate(record, snapshot);
    await this.authorize(actor);
    return dto;
  }
  async read(actor, id) {
    await this.authorize(actor);
    const value = await this.store.get(this.key(id));
    if (!value) throw fail(404, "Native document not found");
    const state = await this.repo.read();
    let sourceState = value.origin.requiresSourceReview === true ? "historical" : "current";
    try {
      this.assertCurrent(state, value.origin);
    } catch (error) {
      if ([409, 422].includes(error.status)) sourceState = value.origin.requiresSourceReview === true ? "historical" : "changed";
      else throw error;
    }
    return {
      ...(await this.publicRecord(actor, value)),
      sourceState,
      currentBrandRevision: brandRevision(state.brandProfile),
    };
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
    this.assertSourceCurrent(state, origin);
    if (brandRevision(state.brandProfile) !== origin.brandRevision)
      throw fail(409, "Native source or brand changed; review before saving");
  }
  assertSourceCurrent(state, origin) {
    assertRestoreAvailable(state);
    if (origin.requiresSourceReview === true) throw fail(409,"Restored layout is historical; establish a new reviewed source binding before editing");
    const story = state.backlog.find((item) => item.id === origin.storyId);
    if (
      !story ||
      (origin.sourceContentRevision === undefined
        ? story.revision !== origin.storyRevision
        : !Number.isSafeInteger(origin.sourceContentRevision) ||
          origin.sourceContentRevision < 1 ||
          (story.contentRevision || 1) !== origin.sourceContentRevision) ||
      story.generationId !== origin.generationId ||
      hash(story.campaignDraft) !== origin.sourceCampaignSha256 ||
      hash(getApprovedClaims(story)) !== hash(origin.sourceApprovals)
    )
      throw fail(409, "Native source or brand changed; review before saving");
  }
  async rebindPlan(actor, id) { return planHistoricalRebind(this, actor, id, validateHostedDocument); }
  async rebind(actor, id, input) { return rebindHistorical(this, actor, id, input, validateHostedDocument); }
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
    if (replay) return this.publicRecord(actor, prior, replay);
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
    const origin = {
      ...native.manifest,
      sourceContentRevision: story.contentRevision || 1,
    };
    const documentRef = await this.persistDocument(native.document);
    let retained = false;
    try {
      await this.authorize(actor);
      this.assertCurrent(await this.repo.read(), origin);
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
        initialDocumentRef: documentRef,
        origin,
        status: "proposal",
        createdBy: actor.id,
        updatedBy: actor.id,
        createdAt: this.now(),
        updatedAt: this.now(),
      };
      let snapshot;
      const saved = await this.commitScoped(
        key,
        (current) => {
          snapshot = this.replay(current, intent);
          if (snapshot) return current;
          if (current) throw fail(409, "Native create collision");
          const { origin, ...receiptSnapshot } = record;
          snapshot = receiptSnapshot;
          return { ...record, receipts: [{ ...intent, snapshot }] };
        },
        origin,
      );
      retained =
        saved.documentRef.key === documentRef.key &&
        saved.documentRef.artifact?.object === documentRef.artifact?.object;
      return await this.publicRecord(actor, saved, snapshot);
    } finally {
      if (!retained) await this.discardPayload(documentRef);
    }
  }
  async listAssets(actor,kind="image") {
    if(!["image","audio"].includes(kind))throw fail(400,"Choose image or audio assets");
    await this.authorize(actor);
    const keys = await this.store.keys(`${this.prefix}asset:`);
    if (keys.length > 1000)
      throw fail(413, "Native image library exceeds the bounded host limit");
    const assets = (await Promise.all(keys.map((key) => this.store.get(key)))).filter(asset=>(asset.kind||"image")===kind);
    await this.authorize(actor);
    return {
      count: assets.length,
      next: null,
      previous: null,
      results: assets.map((asset) => ({
        id: asset.id,
        kind: asset.kind||"image",
        duration_ms:asset.durationMs,
        name: asset.name,
        url: asset.kind==="audio"?audioSource(asset.id):`studio-asset:${asset.id}`,
        thumb_url: `studio-asset:${asset.id}`,
        width: asset.width,
        height: asset.height,
        size: asset.size,
        mime: asset.contentType,
        tags: [],
        attribution: null,
        created_at: asset.createdAt,
      })),
    };
  }
  async uploadAsset(actor, input, commitGuard = null) {
    exact(input, [
      "name",
      "contentType",
      "base64",
      "rightsDeclaration",
      "consent",
      "idempotencyKey",
    ]);
    await this.authorize(actor);
    text(input.name, "asset name", 120);
    text(input.rightsDeclaration, "asset rights declaration", 500);
    if (
      !["confirmed", "not_personal_data"].includes(input.consent) ||
      !["image/png", "image/jpeg", "image/webp","audio/wav"].includes(input.contentType) ||
      typeof input.base64 !== "string" ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(input.base64)
    )
      throw fail(
        422,
        "PNG, JPEG, WebP or PCM WAV, with rights and consent declaration, is required",
      );
    const bytes = Buffer.from(input.base64, "base64");
    if (
      !bytes.length ||
      bytes.length > (input.contentType==="audio/wav"?AUDIO_LIMITS.bytes:512*1024) ||
      bytes.toString("base64") !== input.base64
    )
      throw fail(
        413,
        input.contentType==="audio/wav"?"PCM WAV audio must be at most 6 MiB":"Images must be at most 512 KiB",
      );
    let metadata;
    if(input.contentType==='audio/wav')metadata={...inspectPcmWav(bytes),width:0,height:0};
    else {
      const sharp = (await import("sharp")).default;
      if (activeImageDecodes >= 2)
        throw fail(429, "Image decoding is busy; retry this upload shortly");
      activeImageDecodes++;
      try {
        metadata = await sharp(bytes, {
          limitInputPixels: 4000000,
          animated: false,
        }).metadata();
        // Decode validation produces a tiny sample, never a full uncompressed raster buffer.
        await sharp(bytes, { limitInputPixels: 4000000, animated: false })
          .resize(1, 1)
          .raw()
          .toBuffer();
      } catch {
        throw fail(
          422,
          "Image could not be safely decoded; use an image up to four megapixels",
        );
      } finally {
        activeImageDecodes--;
      }
      if (
        { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" }[
          metadata.format
        ] !== input.contentType ||
        !metadata.width ||
        !metadata.height ||
        metadata.pages > 1
      )
        throw fail(422, "Image MIME or animation mismatch");
    }
    const intent = this.request(actor, "upload", input);
    const id = hash({
      scope: this.scope,
      actor: actor.id,
      key: input.idempotencyKey,
    }).slice(0, 32);
    const key = `${this.prefix}asset:${id}`;
    const current = await this.store.get(key);
    if (current) {
      if (current.fingerprint !== intent.fingerprint)
        throw fail(409, "Upload key was used for different content");
      if (commitGuard) {
        const checked = await this.commitGuardedAsset(
          key,
          current,
          commitGuard,
        );
        await this.authorize(actor);
        return this.assetDto(checked);
      }
      return this.assetDto(current);
    }
    const asset = {
      id,
      name: input.name,
      contentType: input.contentType,
      ...(input.contentType==="audio/wav"?{kind:"audio",durationMs:metadata.durationMs,channels:metadata.channels,sampleRate:metadata.sampleRate}:{}),
      width: metadata.width,
      height: metadata.height,
      size: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      rightsDeclaration: input.rightsDeclaration,
      consent: input.consent,
      createdBy: actor.id,
      createdAt: this.now(),
      fingerprint: intent.fingerprint,
    };
    const storageId = randomUUID();
    if (this.store.uploadArtifact)
      asset.artifactRef = await this.store.uploadArtifact(
        this.scope,
        storageId,
        bytes,
        input.contentType,
      );
    else if(asset.kind==="audio"&&bytes.length>512*1024)asset.bytesKeys=await this.stageAudioBytes(bytes);
    else asset.base64 = input.base64;
    let retained = false;
    try {
      await this.authorize(actor);
      const saved = commitGuard
        ? await this.commitGuardedAsset(key, asset, commitGuard)
        : await this.commitScoped(key, (prior) => {
            if (prior && prior.fingerprint !== intent.fingerprint)
              throw fail(409, "Upload key was used for different content");
            return prior || asset;
          });
      retained = asset.artifactRef
        ? asset.artifactRef.object === saved.artifactRef?.object
        : asset.bytesKeys ? hash(asset.bytesKeys)===hash(saved.bytesKeys) : true;
      return this.assetDto(saved);
    } finally {
      if (!retained && asset.artifactRef)
        await this.store.deleteArtifact?.(this.scope, asset.artifactRef);
      if(!retained&&asset.bytesKeys){
        // An ambiguous storage reply must not delete bytes referenced by a committed asset.
        const committed=await this.store.get(key);
        if(hash(committed?.bytesKeys||[])!==hash(asset.bytesKeys))for(const chunkKey of asset.bytesKeys)await this.discardPayload({key:chunkKey});
      }
    }
  }
  async stageAudioBytes(bytes) {
    const id=randomUUID(),keys=[];
    try {
      for(let offset=0,index=0;offset<bytes.length;offset+=1024*1024,index++){
        const chunk=bytes.subarray(offset,offset+1024*1024),key=`${this.prefix}payload:audio-${id}-${index}`;
        await this.store.update(key,prior=>{if(prior)throw fail(409,'Audio staging collision');return {kind:'native-audio-bytes',base64:chunk.toString('base64'),sha256:createHash('sha256').update(chunk).digest('hex')};});keys.push(key);
      }
      return keys;
    }catch(error){for(const key of keys)await this.discardPayload({key});throw error;}
  }
  // Internal-only atomic guard, never populated from request JSON.
  async commitGuardedAsset(key, asset, guard) {
    const result = await this.store.transact(
      [key, ...guard.keys],
      ([prior, ...states]) => {
        if (prior && prior.fingerprint !== asset.fingerprint)
          throw fail(409, "Upload key was used for different content");
        const committed = guard.validate(states, prior || asset);
        return [committed, ...states];
      },
    );
    return result[0];
  }
  assetDto(asset) {
    const { artifactRef, base64, bytesKeys, fingerprint, ...dto } = asset;
    return clone(dto);
  }
  async asset(actor, id, withBytes = true) {
    await this.authorize(actor);
    if (typeof id !== "string" || !/^[a-f0-9]{32}$/.test(id))
      throw fail(404, "Native asset not found");
    const asset = await this.store.get(`${this.prefix}asset:${id}`);
    if (!asset) throw fail(404, "Native asset not found");
    const dto = this.assetDto(asset);
    if (!withBytes) return dto;
    let bytes;
    if(asset.artifactRef)bytes=await this.store.downloadArtifact(this.scope,asset.artifactRef);
    else if(asset.bytesKeys){
      if(asset.kind!=='audio'||!Array.isArray(asset.bytesKeys)||!asset.bytesKeys.length||asset.bytesKeys.length>6||new Set(asset.bytesKeys).size!==asset.bytesKeys.length||asset.bytesKeys.some(key=>typeof key!=='string'||!key.startsWith(`${this.prefix}payload:audio-`)))throw fail(500,'Native audio payload ownership mismatch');
      const chunks=[];
      for(const key of asset.bytesKeys){const payload=await this.store.get(key),chunk=Buffer.from(payload?.base64||'','base64');if(payload?.kind!=='native-audio-bytes'||!chunk.length||chunk.length>1024*1024||createHash('sha256').update(chunk).digest('hex')!==payload.sha256)throw fail(500,'Native audio chunk integrity mismatch');chunks.push(chunk);}
      bytes=Buffer.concat(chunks);
    }else bytes=Buffer.from(asset.base64,'base64');
    if(bytes.length!==asset.size)throw fail(500,'Native asset length mismatch');
    if (createHash("sha256").update(bytes).digest("hex") !== asset.sha256)
      throw fail(500, "Native asset integrity mismatch");
    await this.authorize(actor);
    return { ...dto, base64: bytes.toString("base64") };
  }
  /** Trusted adapter-only transfer DTO. Storage references and credentials stay
   * private; the immutable storage generation is bound independently of bytes.
   * This method is not an HTTP route and does not expand asset access.
   */
  async assetForNativeTransfer(actor, id, withBytes = true) {
    const dto = await this.asset(actor, id, withBytes);
    const asset = await this.store.get(`${this.prefix}asset:${id}`);
    if (!asset || asset.sha256 !== dto.sha256)
      throw fail(409, "Private asset changed during native transfer");
    const generation = asset.artifactRef
      ? asset.artifactRef.generation
      : `local:${asset.sha256}`;
    if (typeof generation !== "string" || !generation.length || generation.length > 200)
      throw fail(422, "Private asset storage generation is unavailable");
    await this.authorize(actor);
    return { ...dto, generation };
  }
  async resolveAsset(actor, id, input) {
    exact(input, ["intent", "documentId", "expectedNativeRevision", "generationId"]);
    if (!["library-preview", "document-usage"].includes(input.intent))
      throw fail(400, "Choose a supported private asset intent");
    await this.authorize(actor);
    const key = this.key(input.documentId);
    const record = await this.store.get(key);
    if (!record) throw fail(404, "Native document not found");
    if (record.revision !== input.expectedNativeRevision ||
        record.origin.generationId !== input.generationId)
      throw fail(409, "Native asset context changed; reopen explicitly");
    this.assertCurrent(await this.repo.read(), record.origin);
    if (input.intent === "document-usage") {
      const native = await this.hydrate(record);
      const references = await this.documentAssets(actor, native.document);
      if (!references.some((asset) => asset.id === id))
        throw fail(422, "Asset is not referenced by this saved native document");
    }
    const asset = await this.asset(actor, id);
    const latest = await this.store.get(key);
    if (!latest || latest.revision !== record.revision ||
        hash(latest.origin) !== hash(record.origin))
      throw fail(409, "Native asset context changed during retrieval");
    this.assertCurrent(await this.repo.read(), latest.origin);
    await this.authorize(actor);
    return { ...asset, manifest: {
      schemaVersion: 1,
      asset: { id: asset.id, organizationId: this.scope.organizationId,
        brandId: this.scope.brandId, sha256: asset.sha256,
        mime: asset.contentType, size: asset.size, width: asset.width, height: asset.height,
        ownership: "immutable-brand-upload" },
      usage: { intent: input.intent, documentId: record.id,
        nativeRevision: record.revision, generationId: record.origin.generationId },
      delivery: { transport: "studio-authenticated-proxy", publicShare: false,
        authorization: "current-membership-per-retrieval", cacheLifetime: "editor-session" },
    } };
  }
  async documentAssets(actor, document) {
    const ids = new Set();
    let count = 0;
    function visit(value, depth = 0) {
      if (++count > 50000 || depth > 32)
        throw fail(422, "Native document is too complex");
      if (!value || typeof value !== "object") return;
      if (typeof value.assetId === "string") ids.add(value.assetId);
      for (const field of ["src", "docSrc"]) {
        const match =
          typeof value[field] === "string" &&
          /^studio-asset:([a-f0-9]{32})$/.exec(value[field]);
        if (match) ids.add(match[1]);
      }
      for (const child of Object.values(value))
        if (child && typeof child === "object") visit(child, depth + 1);
    }
    visit(document);
    if (ids.size > 250) throw fail(422, "Too many native image references");
    return Promise.all([...ids].map((id) => this.asset(actor, id, false)));
  }
  async refreshBrandTokens(actor, id, input) {
    exact(input, [
      "expectedRevision",
      "expectedOldBrandRevision",
      "expectedBrandRevision",
      "idempotencyKey",
    ]);
    revision(input.expectedRevision);
    if (
      ![input.expectedOldBrandRevision, input.expectedBrandRevision].every(
        (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value),
      )
    )
      throw fail(
        400,
        "Expected saved and current brand revisions are required",
      );
    await this.authorize(actor);
    const intent = this.request(actor, `brand-tokens:${id}`, input),
      key = this.key(id);
    const original = await this.store.get(key);
    if (!original) throw fail(404, "Native document not found");
    const replay = this.replay(original, intent);
    if (replay) return this.publicRecord(actor, original, replay);
    const state = await this.repo.read();
    this.assertSourceCurrent(state, original.origin);
    if (
      original.revision !== input.expectedRevision ||
      original.origin.brandRevision !== input.expectedOldBrandRevision ||
      brandRevision(state.brandProfile) !== input.expectedBrandRevision
    )
      throw fail(409, "Native document or brand changed; reload explicitly");
    if (input.expectedOldBrandRevision === input.expectedBrandRevision)
      throw fail(409, "Saved native styles already use this brand revision");
    const story = state.backlog.find((row) => row.id === original.storyId);
    compileMultimodalBundle({
      scope: this.scope,
      brandProfile: state.brandProfile,
      story,
      request: {
        schemaVersion: 1,
        storyId: story.id,
        expectedRevision: story.revision,
        generationId: story.generationId,
        expectedBrandRevision: input.expectedBrandRevision,
        requiredCapabilities: [],
      },
    });
    const hydrated = await this.hydrate(original);
    const refreshed = applyDooryBrandTokens({
      document: hydrated.document,
      manifest: original.origin,
      tokens: state.brandProfile,
      expectedBrandRevision: input.expectedOldBrandRevision,
      brandRevision: input.expectedBrandRevision,
      availableFonts: this.availableFonts,
    });
    const document = validateHostedDocument(refreshed.document, {
      assets: await this.documentAssets(actor, refreshed.document),
      pageIds: original.origin.pageIds,
    });
    const origin = {
      ...refreshed.manifest,
      ...(original.origin.sourceContentRevision === undefined
        ? {}
        : { sourceContentRevision: original.origin.sourceContentRevision }),
    };
    const documentRef = await this.persistDocument(document);
    let retained = false;
    try {
      const identitySnapshot = await this.store.get("identity");
      if (!identitySnapshot?.users.some((user) => user.id === actor.id))
        throw fail(403, "Current principal is unavailable");
      await this.authorize(actor);
      let snapshot;
      const keys = [this.repo.key, key, "identity"];
      const values = await this.store.transact(
        keys,
        ([source, current, identity]) => {
          if (hash(identity) !== hash(identitySnapshot))
            throw fail(
              409,
              "Membership changed; retry in the current workspace",
            );
          this.assertCurrent(source, origin);
          if (!current) throw fail(404, "Native document not found");
          snapshot = this.replay(current, intent);
          if (snapshot) return [source, current, identity];
          if (
            current.revision !== input.expectedRevision ||
            current.origin.brandRevision !== input.expectedOldBrandRevision ||
            hash(current.origin) !== hash(original.origin)
          )
            throw fail(
              409,
              "Native document changed; preserve local work and reload explicitly",
            );
          snapshot = {
            documentRef,
            origin,
            revision: current.revision + 1,
            updatedBy: actor.id,
            updatedAt: this.now(),
          };
          return [
            source,
            {
              ...current,
              ...snapshot,
              receipts: [...current.receipts, { ...intent, snapshot }].slice(
                -100,
              ),
            },
            identity,
          ];
        },
      );
      const saved = values[1];
      retained =
        saved.documentRef.key === documentRef.key &&
        saved.documentRef.artifact?.object === documentRef.artifact?.object;
      return await this.publicRecord(actor, saved, snapshot);
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
    if (replay) return this.publicRecord(actor, original, replay);
    const state = await this.repo.read();
    this.assertCurrent(state, original.origin);
    if (original.revision !== input.expectedRevision)
      throw fail(
        409,
        "Native document changed; preserve local work and reload explicitly",
      );
    const document = validateHostedDocument(input.document, {
      assets: await this.documentAssets(actor, input.document),
      pageIds: original.origin.pageIds,
    });
    const documentRef = await this.persistDocument(document);
    let retained = false;
    try {
      await this.authorize(actor);
      this.assertCurrent(await this.repo.read(), original.origin);
      let snapshot;
      const updatedAt = this.now();
      const saved = await this.commitScoped(
        key,
        (current) => {
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
            updatedAt,
          };
          return {
            ...current,
            ...snapshot,
            receipts: [...current.receipts, { ...intent, snapshot }].slice(
              -100,
            ),
          };
        },
        original.origin,
      );
      retained =
        saved.documentRef.key === documentRef.key &&
        saved.documentRef.artifact?.object === documentRef.artifact?.object;
      return await this.publicRecord(actor, saved, snapshot);
    } finally {
      if (!retained) await this.discardPayload(documentRef);
    }
  }
}
