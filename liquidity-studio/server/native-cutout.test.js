import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { DurableStore } from "./storage.js";
import { NativeEditorService } from "./native-editor.js";
import { NativeCutoutService } from "./native-cutout.js";
import { nativeFontRegistry } from "./native-editor-fonts.js";
import { BRAND_PRESETS } from "./domain.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import { brandRevision } from "./multimodal-contract.js";
async function fixture() {
  const store = new DurableStore(":memory:"),
    actor = { id: "operator" },
    scope = { organizationId: "org", brandId: "liquidity_desk" };
  await store.update("identity", () => ({
    users: [actor],
    organizations: [{ id: "org", brands: [{ id: scope.brandId }] }],
    memberships: [
      { userId: actor.id, organizationId: "org", brandIds: [scope.brandId] },
    ],
  }));
  const story = {
    id: "story",
    title: "Controlled fixture",
    revision: 1,
    generationId: "generation",
    sourceClaims: [
      {
        id: "claim",
        text: "An approved source excerpt for a controlled integration fixture.",
        sourceUrl: "https://example.org/source",
        kind: "general",
        status: "approved",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: story.generationId, mode: "synthetic" },
  };
  const repo = {
    store,
    key: "scope:org:liquidity_desk",
    read: async () => store.get(repo.key),
  };
  await store.update(repo.key, () => ({
    brandProfile: structuredClone(BRAND_PRESETS.liquidity_desk),
    backlog: [story],
    assets: [],
  }));
  const identity = {
    authorize: async () => {
      if (!store.get("identity").memberships.length)
        throw Object.assign(Error("Forbidden"), { status: 403 });
    },
  };
  const native = new NativeEditorService({
    repo,
    scope,
    identity,
    availableFonts: nativeFontRegistry(),
  });
  let record = await native.create(actor, {
    storyId: story.id,
    format: "infographic",
    expectedRevision: 1,
    generationId: story.generationId,
    expectedBrandRevision: brandRevision(BRAND_PRESETS.liquidity_desk),
    idempotencyKey: "create_native_cutout_fixture",
  });
  const bytes = await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 4,
      background: { r: 20, g: 120, b: 100, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  const asset = await native.uploadAsset(actor, {
    name: "Synthetic fixture",
    contentType: "image/png",
    base64: bytes.toString("base64"),
    rightsDeclaration: "Original synthetic non-personal test fixture",
    consent: "not_personal_data",
    idempotencyKey: "upload_cutout_fixture",
  });
  record.document.pages[0].objects.push({
    id: "private-image",
    type: "image",
    assetId: asset.id,
    src: `studio-asset:${asset.id}`,
    docSrc: `studio-asset:${asset.id}`,
    width: 64,
    height: 64,
    left: 10,
    top: 10,
  });
  record = await native.save(actor, record.id, {
    title: record.title,
    document: record.document,
    expectedRevision: record.revision,
    idempotencyKey: "save_native_cutout_fixture",
  });
  const service = new NativeCutoutService({
    native,
    model: { manifest: async () => ({}) },
  });
  const prepare = () =>
    service.prepare(actor, {
      documentId: record.id,
      expectedRevision: record.revision,
      inputAssetId: asset.id,
      idempotencyKey: "prepare_cutout_fixture",
    });
  return { store, native, service, actor, asset, record, bytes, prepare, repo };
}
test("cutout derivative is private, linked and replayable without replacing its original", async () => {
  const f = await fixture();
  try {
    const intent = await f.prepare();
    const input = {
      intentId: intent.id,
      base64: f.bytes.toString("base64"),
      idempotencyKey: "complete_cutout_fixture",
    };
    const output = await f.service.complete(f.actor, input);
    assert.notEqual(output.id, f.asset.id);
    assert.equal(output.lineage.inputAssetId, f.asset.id);
    assert.equal(output.width, 64);
    assert.deepEqual(await f.service.complete(f.actor, input), output);
    assert.equal(
      (await f.native.asset(f.actor, f.asset.id)).sha256,
      f.asset.sha256,
    );
    assert.equal(
      (await f.native.read(f.actor, f.record.id)).document.pages[0].objects.at(
        -1,
      ).assetId,
      f.asset.id,
    );
  } finally {
    f.store.close();
  }
});
test("source revision drift prevents output commit without leaving an asset", async () => {
  const f = await fixture();
  try {
    const intent = await f.prepare();
    const before = f.store.keys(`${f.native.prefix}asset:`);
    f.store.update(f.repo.key, (s) => {
      s.backlog[0].revision++;
      return s;
    });
    await assert.rejects(
      f.service.complete(f.actor, {
        intentId: intent.id,
        base64: f.bytes.toString("base64"),
        idempotencyKey: "complete_cutout_fixture",
      }),
      { status: 409 },
    );
    assert.deepEqual(f.store.keys(`${f.native.prefix}asset:`), before);
  } finally {
    f.store.close();
  }
});
test("revocation and altered output dimensions fail closed", async () => {
  const f = await fixture();
  try {
    const intent = await f.prepare();
    const tiny = await sharp(f.bytes).resize(32, 32).png().toBuffer();
    await assert.rejects(
      f.service.complete(f.actor, {
        intentId: intent.id,
        base64: tiny.toString("base64"),
        idempotencyKey: "complete_cutout_fixture",
      }),
      { status: 422 },
    );
    f.store.update("identity", (s) => ({ ...s, memberships: [] }));
    await assert.rejects(
      f.service.complete(f.actor, {
        intentId: intent.id,
        base64: f.bytes.toString("base64"),
        idempotencyKey: "complete_cutout_fixture",
      }),
      { status: 403 },
    );
  } finally {
    f.store.close();
  }
});

test("unreferenced asset, stale native revision and changed rights cannot produce a derivative", async () => {
  const f = await fixture();
  try {
    await assert.rejects(
      f.service.prepare(f.actor, {
        documentId: f.record.id,
        expectedRevision: f.record.revision,
        inputAssetId: "f".repeat(32),
        idempotencyKey: "unreferenced_image_fixture",
      }),
      { status: 422 },
    );
    const intent = await f.prepare();
    f.store.update(`${f.native.prefix}asset:${f.asset.id}`, (a) => ({
      ...a,
      rightsDeclaration: "Rights withdrawn",
    }));
    await assert.rejects(
      f.service.complete(f.actor, {
        intentId: intent.id,
        base64: f.bytes.toString("base64"),
        idempotencyKey: "complete_cutout_fixture",
      }),
      { status: 409 },
    );
    f.store.update(`${f.native.prefix}asset:${f.asset.id}`, (a) => ({
      ...a,
      rightsDeclaration: f.asset.rightsDeclaration,
    }));
    f.store.update(f.native.key(f.record.id), (a) => ({
      ...a,
      revision: a.revision + 1,
    }));
    await assert.rejects(
      f.service.complete(f.actor, {
        intentId: intent.id,
        base64: f.bytes.toString("base64"),
        idempotencyKey: "complete_cutout_fixture",
      }),
      { status: 409 },
    );
  } finally {
    f.store.close();
  }
});

test("one bounded scoped ledger prunes expired permits and preserves active replay", async () => {
  const f = await fixture();
  try {
    let now = 1000;
    f.service.now = () => now;
    const prepare = (index) =>
      f.service.prepare(f.actor, {
        documentId: f.record.id,
        expectedRevision: f.record.revision,
        inputAssetId: f.asset.id,
        idempotencyKey: `bounded_cutout_intent_${index}`,
      });
    const first = await prepare(0);
    for (let i = 1; i < 128; i++) await prepare(i);
    assert.equal((await prepare(0)).id, first.id);
    await assert.rejects(prepare(128), { status: 429 });
    const keys = f.store.keys(`${f.native.prefix}cutout`);
    assert.deepEqual(keys, [`${f.native.prefix}cutout-intents`]);
    assert.equal(f.store.get(keys[0]).intents.length, 128);
    now += 16 * 60 * 1000;
    const current = await prepare(129);
    assert.deepEqual(f.store.keys(`${f.native.prefix}cutout`), keys);
    assert.equal(f.store.get(keys[0]).intents.length, 1);
    const output = await f.service.complete(f.actor, {
      intentId: current.id,
      base64: f.bytes.toString("base64"),
      idempotencyKey: "bounded_complete_cutout",
    });
    assert.equal(output.lineage.intentId, current.id);
    await assert.rejects(
      f.service.complete(f.actor, {
        intentId: first.id,
        base64: f.bytes.toString("base64"),
        idempotencyKey: "expired_complete_cutout",
      }),
      { status: 404 },
    );
    now += 16 * 60 * 1000;
    await prepare(130);
    assert.equal(
      (await f.native.asset(f.actor, output.id)).sha256,
      output.sha256,
    );
    assert.equal(
      (await f.native.asset(f.actor, f.asset.id)).sha256,
      f.asset.sha256,
    );
  } finally {
    f.store.close();
  }
});
