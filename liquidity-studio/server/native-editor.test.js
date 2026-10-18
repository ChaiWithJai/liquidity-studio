import test from "node:test";
import assert from "node:assert/strict";
import {
  NativeEditorService,
  validateHostedDocument,
} from "./native-editor.js";
import { BRAND_PRESETS } from "./domain.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import { brandRevision } from "./multimodal-contract.js";

function fixture(preset = "liquidity_desk") {
  const actor = { id: "operator" };
  const story = {
    id: "story",
    title: "Controlled source fixture",
    revision: 2,
    generationId: "gen",
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
    provenance: { generationId: "gen", mode: "synthetic" },
  };
  let state = {
    brandProfile: structuredClone(BRAND_PRESETS[preset]),
    backlog: [story],
    assets: [],
  };
  let allowed = true;
  const repo = {
    read: async () => structuredClone(state),
    mutate: async (fn) => {
      const next = fn(structuredClone(state));
      state = next;
      return structuredClone(state);
    },
  };
  const service = new NativeEditorService({
    repo,
    scope: { organizationId: "org", brandId: preset },
    identity: {
      authorize: async () => {
        if (!allowed)
          throw Object.assign(new Error("Forbidden"), { status: 403 });
      },
    },
    availableFonts: [
      "Instrument Serif",
      "Mona Sans",
      "Inter",
      "Noto Sans Devanagari",
    ].map((family) => ({
      family,
      sha256: "a".repeat(64),
      verifiedCodepoints: [
        "U+0043",
        "U+0057",
        "U+004A",
        "U+0020",
        "U+002F",
        "U+0950",
      ],
    })),
  });
  const create = (format, suffix = format) =>
    service.create(actor, {
      storyId: story.id,
      format,
      expectedRevision: story.revision,
      generationId: story.generationId,
      expectedBrandRevision: brandRevision(state.brandProfile),
      idempotencyKey: `create_native_${suffix}`,
    });
  return {
    actor,
    service,
    create,
    state: () => state,
    revoke: () => {
      allowed = false;
    },
  };
}

test("both brands and all formats retain immutable origin through native edit/save/reload", async () => {
  for (const preset of ["liquidity_desk", "vedic_dharma"]) {
    const f = fixture(preset);
    const original = structuredClone(f.state().backlog);
    for (const format of ["infographic", "carousel", "story", "reel"]) {
      const native = await f.create(format);
      const document = structuredClone(native.document);
      document.pages[0].objects.find((o) => o.id === "headline_layer").text =
        "Human native proposal";
      const saved = await f.service.save(f.actor, native.id, {
        expectedRevision: 1,
        title: native.title,
        document,
        idempotencyKey: `save_native_${format}`,
      });
      assert.equal(saved.revision, 2);
      assert.equal(saved.status, "proposal");
      assert.deepEqual(
        (await f.service.read(f.actor, native.id)).document,
        document,
      );
      assert.deepEqual(f.state().backlog, original);
    }
  }
});

test("stale and uncertain writes preserve opening revision and idempotency intent", async () => {
  const f = fixture();
  const native = await f.create("infographic");
  assert.equal((await f.create("infographic")).id, native.id);
  const input = {
    expectedRevision: 1,
    title: "Human proposal",
    document: native.document,
    idempotencyKey: "save_native_same_key",
  };
  assert.equal((await f.service.save(f.actor, native.id, input)).revision, 2);
  assert.equal((await f.service.save(f.actor, native.id, input)).revision, 2);
  await assert.rejects(
    f.service.save(f.actor, native.id, { ...input, title: "Changed" }),
    { status: 409 },
  );
  await assert.rejects(
    f.service.save(f.actor, native.id, {
      ...input,
      idempotencyKey: "another_native_save",
    }),
    { status: 409 },
  );
  const second = await f.create("story");
  await assert.rejects(f.service.save(f.actor, second.id, input), {
    status: 409,
  });
});

test("revoked membership and another scoped repository cannot read native records", async () => {
  const f = fixture();
  const native = await f.create("story");
  await assert.rejects(
    fixture("vedic_dharma").service.read(f.actor, native.id),
    { status: 404 },
  );
  f.revoke();
  await assert.rejects(f.service.read(f.actor, native.id), { status: 403 });
  await assert.rejects(
    f.service.save(f.actor, native.id, {
      expectedRevision: 1,
      title: "Forbidden",
      document: native.document,
      idempotencyKey: "revoked_native_save",
    }),
    { status: 403 },
  );
});

test("native resource validator rejects foreign fetches and accepts only owned image references", async () => {
  const f = fixture();
  const { document } = await f.create("story");
  document.pages[0].objects.push({
    id: "image",
    type: "image",
    assetId: "owned",
    src: "studio-asset:owned",
  });
  assert.doesNotThrow(() =>
    validateHostedDocument(document, { assets: [{ id: "owned" }] }),
  );
  assert.throws(() => validateHostedDocument(document), { status: 422 });
  for (const src of [
    "https://foreign.example/photo.png",
    "//foreign.example/photo.png",
    "data:image/png;base64,AAAA",
    "blob:local",
    "/api/private-other-brand",
  ]) {
    document.pages[0].objects.at(-1).src = src;
    assert.throws(
      () => validateHostedDocument(document, { assets: [{ id: "owned" }] }),
      { status: 422 },
    );
  }
});

test("source and palette drift do not silently replace or rebase native proposals", async () => {
  for (const change of [
    (s) => s.backlog[0].revision++,
    (s) => (s.brandProfile.colors[0].hex = "#123456"),
    (s) => (s.backlog[0].sourceClaims[0].text = "Changed approval"),
  ]) {
    const f = fixture();
    const native = await f.create("story");
    change(f.state());
    await assert.rejects(
      f.service.save(f.actor, native.id, {
        expectedRevision: 1,
        title: native.title,
        document: native.document,
        idempotencyKey: "source_drift_save",
      }),
      { status: 409 },
    );
    assert.equal((await f.service.read(f.actor, native.id)).revision, 1);
  }
});
