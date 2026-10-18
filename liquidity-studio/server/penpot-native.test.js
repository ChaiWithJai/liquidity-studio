import test from "node:test";
import assert from "node:assert/strict";
import { BRAND_PRESETS } from "./domain.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import {
  compileMultimodalBundle,
  brandRevision,
} from "./multimodal-contract.js";
import { compilePenpotNative } from "./penpot-native.js";
const fileId = "11111111-1111-4111-8111-111111111111";
const fonts = [
  ["Mona Sans", 400],
  ["Mona Sans", 700],
  ["Inter", 400],
  ["Instrument Serif", 400],
].map(([family, weight], i) => ({
  family,
  weight,
  fontId: `custom-00000000-0000-4000-8000-00000000000${i}`,
  sha256: "a".repeat(64),
  license: "OFL-1.1",
}));
function fixture(preset = "vedic_dharma") {
  const brandProfile = structuredClone(BRAND_PRESETS[preset]);
  const story = {
    id: "original",
    revision: 1,
    generationId: "generation",
    sourceClaims: [
      {
        id: "claim",
        text: "Original fixture source excerpt.",
        sourceUrl: "https://example.com/source",
        kind: "general",
        status: "approved",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: story.generationId, mode: "synthetic" },
  };
  return compileMultimodalBundle({
    scope: { organizationId: "org", brandId: preset },
    brandProfile,
    story,
    request: {
      schemaVersion: 1,
      storyId: story.id,
      expectedRevision: 1,
      generationId: story.generationId,
      expectedBrandRevision: brandRevision(brandProfile),
      requiredCapabilities: [],
    },
  });
}
test("two brands compile every native static page, main components, active bound tokens and full semantic provenance without mutation", () => {
  for (const preset of ["liquidity_desk", "vedic_dharma"]) {
    const input = fixture(preset),
      before = structuredClone(input);
    const out = compilePenpotNative(input, { fileId, fonts });
    assert.deepEqual(input, before);
    assert.equal(out.pages.length, 9);
    assert.deepEqual(
      out.pages.filter((p) => p.format === "reel").map((p) => p.timecode),
      [
        { startSeconds: 0, endSeconds: 3 },
        { startSeconds: 3, endSeconds: 15 },
        { startSeconds: 15, endSeconds: 30 },
      ],
    );
    assert.equal(
      out.changes.filter((c) => c.type === "add-component").length,
      9,
    );
    assert.equal(
      out.changes.some((c) => c.obj?.type === "svg-raw"),
      false,
    );
    const frames = out.changes.filter((c) => c.obj?.type === "frame");
    for (const c of frames) {
      assert.ok(c.obj["applied-tokens"].fill);
      assert.deepEqual(
        JSON.parse(c.obj["plugin-data"].studio["source-campaign"]),
        input.sourceCampaign,
      );
    }
    for (const c of out.changes.filter((c) => c.obj?.type === "text")) {
      assert.ok(c.obj["applied-tokens"].fill);
      assert.match(
        c.obj.content.children[0].children[0]["font-id"],
        /^custom-/,
      );
    }
    assert.deepEqual(out.provenance.sourceCampaign, input.sourceCampaign);
    assert.equal(out.capabilities.video, false);
    assert.equal(out.capabilities.cutout, false);
  }
});
test("invalid versions, missing fonts/provenance, unsupported assets/motion and malformed pages fail closed", () => {
  for (const mutate of [
    (b) => (b.schemaVersion = 2),
    (b) => (b.nativeTargets.penpot.editorVersion = "future"),
    (b) => delete b.sourceApprovals,
    (b) => delete b.sourceCampaign,
    (b) => delete b.formats.story.pages[0].semanticContent,
    (b) => (b.formats.reel.pages[0].timecode.endSeconds = 30),
    (b) => b.formats.carousel.pages.pop(),
    (b) => (b.formats.story.pages[0].width = 1),
    (b) => (b.formats.infographic.pages[0].layers[0].assetId = "foreign"),
  ]) {
    const b = structuredClone(fixture());
    mutate(b);
    assert.throws(() => compilePenpotNative(b, { fileId, fonts }));
  }
  assert.throws(() => compilePenpotNative(fixture(), { fileId, fonts: [] }));
  assert.throws(
    () =>
      compilePenpotNative(fixture(), {
        fileId,
        fonts,
        requiredCapabilities: ["animation"],
      }),
    /UNSUPPORTED_CAPABILITY/,
  );
});
test("palette revisions preserve native layer identity but update bound resolved fills and source revision", () => {
  const first = fixture();
  const changed = structuredClone(first);
  changed.tokens.colors[1].hex = "#123456";
  changed.brandRevision = "new-approval-revision";
  const a = compilePenpotNative(first, { fileId, fonts }),
    b = compilePenpotNative(changed, { fileId, fonts });
  assert.deepEqual(a.pages, b.pages);
  const old = a.changes.find((c) => c.obj?.name === "brand_pill_badge"),
    now = b.changes.find((c) => c.obj?.name === "brand_pill_badge");
  assert.equal(old.id, now.id);
  assert.equal(
    now.obj.content.children[0].children[0].fills[0]["fill-color"],
    "#123456",
  );
  assert.equal(now.obj["applied-tokens"].fill, "studio.color1");
  assert.equal(b.provenance.brandRevision, "new-approval-revision");
});

test("coherent imported bundle tampering cannot replace source-approved copy or approval/generation checks", () => {
  const forged = structuredClone(fixture());
  forged.sourceCampaign.infographic.headline = "Invented unsupported claim";
  for (const page of forged.formats.infographic.pages) {
    page.semanticContent.format = structuredClone(
      forged.sourceCampaign.infographic,
    );
    page.semanticContent.page = structuredClone(
      forged.sourceCampaign.infographic,
    );
    page.layers.find((l) => l.id === "headline_layer").text =
      forged.sourceCampaign.infographic.headline;
  }
  assert.throws(() => compilePenpotNative(forged, { fileId, fonts }));
  const layerForged = structuredClone(fixture());
  layerForged.formats.infographic.pages[0].layers[2].text =
    "Invented layer claim";
  assert.throws(
    () => compilePenpotNative(layerForged, { fileId, fonts }),
    /SOURCE_LAYER_MISMATCH/,
  );
  const unreviewed = structuredClone(fixture());
  unreviewed.sourceApprovals[0].status = "unreviewed";
  assert.throws(() => compilePenpotNative(unreviewed, { fileId, fonts }));
  const wrongGeneration = structuredClone(fixture());
  wrongGeneration.sourceCampaign.provenance.generationId = "foreign";
  assert.throws(
    () => compilePenpotNative(wrongGeneration, { fileId, fonts }),
    /GENERATION_MISMATCH/,
  );
});
