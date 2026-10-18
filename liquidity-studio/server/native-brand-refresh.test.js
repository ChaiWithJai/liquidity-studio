import test from "node:test";
import assert from "node:assert/strict";
import { createPlatform } from "./platform.js";
import { DurableStore } from "./storage.js";
import { BRAND_PRESETS } from "./domain.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import { brandRevision } from "./multimodal-contract.js";
async function fixture() {
  const store = new DurableStore(":memory:"),
    platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "brand-refresh",
    password: "original-fixture-password-long",
    role: "founder",
  });
  const actor = (await store.get("identity")).users.find(
    (u) => u.username === "brand-refresh",
  );
  const scope = {
      organizationId: "org_default",
      brandId: "brand_default",
      preset: "liquidity_desk",
    },
    container = await platform.forScope(scope),
    repo = container.ports.repo;
  const story = {
    id: "refresh-story",
    title: "Original style fixture",
    revision: 1,
    generationId: "refresh-generation",
    sourceClaims: [
      {
        id: "source",
        text: "An approved original source excerpt.",
        sourceUrl: "https://example.org/style-fixture",
        status: "approved",
        kind: "general",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: story.generationId, mode: "synthetic" },
  };
  await repo.mutate((s) => ({
    ...s,
    backlog: [story],
    brandProfile: structuredClone(BRAND_PRESETS.liquidity_desk),
  }));
  return {
    store,
    platform,
    actor,
    scope,
    repo,
    story,
    service: platform.nativeEditor(scope, repo),
  };
}
test("explicit brand-only refresh preserves human text and geometry with one revision-bound receipt", async () => {
  const f = await fixture();
  try {
    const profile = await f.repo.getBrandProfile(),
      oldHash = brandRevision(profile);
    let native = await f.service.create(f.actor, {
      storyId: f.story.id,
      format: "infographic",
      expectedRevision: 1,
      generationId: f.story.generationId,
      expectedBrandRevision: oldHash,
      idempotencyKey: "original_style_create",
    });
    native.document.pages[0].objects.find(
      (o) => o.id === "headline_layer",
    ).text = "Human native copy preserved";
    native = await f.service.save(f.actor, native.id, {
      expectedRevision: 1,
      title: native.title,
      document: native.document,
      idempotencyKey: "original_human_native_edit",
    });
    const before = structuredClone(native.document);
    await f.repo.updateBrandProfile({
      colors: profile.colors.map((c, i) =>
        i === 0 ? { ...c, hex: "#123456" } : c,
      ),
    });
    const newHash = brandRevision(await f.repo.getBrandProfile());
    const input = {
      expectedRevision: 2,
      expectedOldBrandRevision: oldHash,
      expectedBrandRevision: newHash,
      idempotencyKey: "original_style_refresh",
    };
    const result = await f.service.refreshBrandTokens(
      f.actor,
      native.id,
      input,
    );
    assert.equal(result.revision, 3);
    assert.equal(result.origin.brandRevision, newHash);
    assert.equal(
      result.document.pages[0].objects.find((o) => o.id === "headline_layer")
        .text,
      "Human native copy preserved",
    );
    const projection = (d) =>
      d.pages.map((p) => ({
        id: p.id,
        objects: p.objects.map((o) => ({
          id: o.id,
          text: o.text,
          left: o.left,
          top: o.top,
          width: o.width,
          height: o.height,
        })),
      }));
    assert.deepEqual(projection(result.document), projection(before));
    assert.equal(result.document.pages[0].background.color, "#123456");
    assert.equal(
      (await f.service.refreshBrandTokens(f.actor, native.id, input)).revision,
      3,
    );
    await assert.rejects(
      f.service.refreshBrandTokens(f.actor, native.id, {
        ...input,
        expectedRevision: 1,
      }),
      { status: 409 },
    );
    assert.equal(
      (await f.service.read(f.actor, native.id)).sourceState,
      "current",
    );
  } finally {
    f.store.close();
  }
});
