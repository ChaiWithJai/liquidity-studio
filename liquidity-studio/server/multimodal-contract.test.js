import test from "node:test";
import assert from "node:assert/strict";
import { BRAND_PRESETS } from "./domain.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import {
  brandRevision,
  compileMultimodalBundle,
  migrateEditorContract,
  NATIVE_TARGETS,
  STABLE_LAYER_IDS,
} from "./multimodal-contract.js";
function fixture(preset = "vedic_dharma") {
  const brandProfile = structuredClone(BRAND_PRESETS[preset]);
  const story = {
    id: "story",
    revision: 2,
    generationId: "gen",
    sourceClaims: [
      {
        id: "claim",
        text: "An explicitly reviewed source excerpt.",
        sourceUrl: "https://example.com/source",
        kind: "general",
        status: "approved",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: "gen", mode: "synthetic" },
  };
  return {
    scope: { organizationId: "org", brandId: preset },
    brandProfile,
    story,
    request: {
      schemaVersion: 1,
      storyId: story.id,
      expectedRevision: 2,
      generationId: "gen",
      expectedBrandRevision: brandRevision(brandProfile),
      requiredCapabilities: [],
    },
  };
}
test("both presets preserve source review, all stable layers and exact four-format proposed pages without native payloads", () => {
  for (const preset of ["liquidity_desk", "vedic_dharma"]) {
    const input = fixture(preset);
    const snapshot = structuredClone(input);
    const spec = compileMultimodalBundle(input);
    assert.deepEqual(input, snapshot);
    assert.equal(spec.integrationStatus, "not_integrated");
    assert.deepEqual(spec.sourceApprovals, input.story.sourceClaims);
    assert.deepEqual(spec.nativeTargets, NATIVE_TARGETS);
    assert.deepEqual(spec.nativeDocuments, { doory: null, penpot: null });
    assert.deepEqual(
      Object.values(spec.formats).map((item) => item.pages.length),
      [1, 4, 1, 3],
    );
    assert.deepEqual(
      spec.formats.reel.pages.map((item) => [
        item.timecode.startSeconds,
        item.timecode.endSeconds,
      ]),
      [
        [0, 3],
        [3, 15],
        [15, 30],
      ],
    );
    for (const item of Object.values(spec.formats))
      for (const page of item.pages)
        assert.deepEqual(
          page.layers.map((layer) => layer.id),
          STABLE_LAYER_IDS,
        );
    assert.equal(spec.workflow.finalSignoff, "not_granted");
    if (preset === "vedic_dharma") {
      assert.deepEqual(
        spec.tokens.colors.map((item) => item.hex),
        ["#0B101B", "#E85D04", "#219EBC", "#E5E7EB"],
      );
      assert.deepEqual(spec.tokens.fonts, {
        heading: "Mona Sans",
        body: "Inter",
      });
    }
  }
});
test("scope, generation, revisions, source review and unknown versions/capabilities fail explicitly", () => {
  const cases = [
    (input) => (input.request.schemaVersion = 2),
    (input) => (input.request.storyId = "foreign"),
    (input) => (input.request.expectedRevision = 1),
    (input) => (input.request.generationId = "other"),
    (input) => (input.story.campaignDraft.provenance.generationId = "other"),
    (input) => (input.request.expectedBrandRevision = "old"),
    (input) => (input.brandProfile.colors[0].hex = "#ffffff"),
    (input) => (input.request.nativeTargets = { doory: { schemaVersion: 6 } }),
    (input) => (input.request.requiredCapabilities = ["nativeText"]),
    (input) => (input.request.format = "mp4"),
    (input) => (input.story.sourceClaims[0].status = "unreviewed"),
    (input) => (input.story.sourceClaims[0].kind = "clinical"),
    (input) =>
      (input.story.campaignDraft.infographic.statRows[0] =
        "Invented clinical fact"),
  ];
  for (const mutate of cases) {
    const input = fixture();
    mutate(input);
    assert.throws(() => compileMultimodalBundle(input));
  }
  assert.throws(
    () => migrateEditorContract({ schemaVersion: 0 }),
    /No migration/,
  );
  assert.throws(
    () => migrateEditorContract({ schemaVersion: 1 }, 2),
    /No migration/,
  );
  const spec = compileMultimodalBundle(fixture());
  assert.deepEqual(migrateEditorContract(spec), spec);
});
test("brand revisions are stable across object key order but change with actual token changes", () => {
  assert.equal(
    brandRevision({ a: 1, b: { c: 2 } }),
    brandRevision({ b: { c: 2 }, a: 1 }),
  );
  assert.notEqual(
    brandRevision({ colors: ["#000000"] }),
    brandRevision({ colors: ["#ffffff"] }),
  );
});

test("actual HTTP inspection uses authenticated scoped snapshot, supports DI, and remains absent when disabled", async (t) => {
  const { DurableStore } = await import("./storage.js");
  const { createPlatform } = await import("./platform.js");
  const { createHttpServer } = await import("./index.js");
  const store = new DurableStore(":memory:");
  const platform = createPlatform({ store, authMode: "password" });
  await platform.identity.provision({
    username: "founder",
    password: "test-editor-contract-password",
    role: "founder",
  });
  await platform.ready;
  const scope = { organizationId: "org_default", brandId: "brand_default" };
  const app = await platform.forScope(scope);
  const input = fixture("liquidity_desk");
  await app.ports.repo.mutate((state) => ({
    ...state,
    backlog: [input.story],
  }));
  const servers = [];
  t.after(async () => {
    for (const server of servers)
      await new Promise((resolve) => server.close(resolve));
    store.close();
  });
  async function start(enabled) {
    const server = createHttpServer(null, {
      platform,
      editorContractEnabled: enabled,
    });
    servers.push(server);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    return `http://127.0.0.1:${server.address().port}`;
  }
  const base = await start(true);
  const params = new URLSearchParams({
    ...scope,
    schemaVersion: "1",
    storyId: "story",
    expectedRevision: "2",
    generationId: "gen",
  });
  const path = "/api/studio/multimodal-spec?";
  assert.equal((await fetch(base + path + params)).status, 401);
  const login = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "founder",
      password: "test-editor-contract-password",
    }),
  });
  assert.equal(login.status, 200);
  const headers = { Cookie: login.headers.get("set-cookie").split(";")[0] };
  const bootstrap = await (
    await fetch(base + "/api/studio/bootstrap?" + new URLSearchParams(scope), {
      headers,
    })
  ).json();
  assert.equal(bootstrap.brandRevision, brandRevision(bootstrap.brandProfile));
  params.set("expectedBrandRevision", bootstrap.brandRevision);
  const response = await fetch(base + path + params, { headers });
  assert.equal(response.status, 200);
  const spec = await response.json();
  assert.equal(spec.kind, "multimodal-spec");
  assert.deepEqual(spec.scope, scope);
  const foreign = new URLSearchParams(params);
  foreign.set("organizationId", "foreign");
  assert.equal((await fetch(base + path + foreign, { headers })).status, 403);
  const foreignStory = new URLSearchParams(params);
  foreignStory.set("storyId", "not_in_this_brand");
  assert.equal(
    (await fetch(base + path + foreignStory, { headers })).status,
    404,
  );
  const unsupported = new URLSearchParams(params);
  unsupported.set("requiredCapabilities", JSON.stringify(["nativeText"]));
  assert.equal(
    (await fetch(base + path + unsupported, { headers })).status,
    422,
  );
  const arbitrary = new URLSearchParams(params);
  arbitrary.set("endpoint", "https://example.com");
  assert.equal((await fetch(base + path + arbitrary, { headers })).status, 400);
  const duplicate = new URLSearchParams(params);
  duplicate.append("storyId", "foreign");
  assert.equal((await fetch(base + path + duplicate, { headers })).status, 400);
  const disabled = await start(false);
  assert.equal(
    (await fetch(disabled + path + params, { headers })).status,
    404,
  );
  const { createAppContainer } = await import("./container.js");
  const injected = { compileMultimodalBundle: () => ({ custom: true }) };
  assert.equal(
    createAppContainer({ multimodalCanvas: injected }).ports.multimodalCanvas,
    injected,
  );
});

test("complete persisted campaign and every format source field survive independent immutable snapshots", () => {
  const input = fixture();
  const original = structuredClone(input);
  const spec = compileMultimodalBundle(input);
  assert.deepEqual(spec.sourceCampaign, input.story.campaignDraft);
  assert.notEqual(spec.sourceCampaign, input.story.campaignDraft);
  assert.equal(Object.isFrozen(spec.sourceCampaign.reel.beats[0]), true);
  assert.throws(() => {
    spec.sourceCampaign.reel.closingCta = "mutated";
  }, TypeError);
  const atPath = (root, path) =>
    path.split(".").reduce((value, key) => value[key], root);
  for (const [format, bundle] of Object.entries(spec.formats)) {
    for (const page of bundle.pages) {
      assert.deepEqual(
        page.semanticContent.format,
        input.story.campaignDraft[format],
      );
      assert.deepEqual(
        page.semanticContent.page,
        atPath(input.story.campaignDraft, page.semanticContent.sourcePagePath),
      );
      for (const mapping of page.sourceFieldMappings) {
        assert.deepEqual(
          atPath(input.story.campaignDraft, mapping.sourcePath),
          atPath(page, mapping.destinationPath),
        );
      }
      assert.equal(page.semanticContent.executionStatus, "proposal_only");
    }
  }
  assert.equal(
    spec.formats.infographic.pages[0].semanticContent.format.bottomTakeaway,
    input.story.campaignDraft.infographic.bottomTakeaway,
  );
  assert.equal(
    spec.formats.carousel.pages[0].semanticContent.page.visualNote,
    input.story.campaignDraft.carousel.slides[0].visualNote,
  );
  assert.equal(
    spec.formats.story.pages[0].semanticContent.format.interactiveStickerPrompt,
    input.story.campaignDraft.story.interactiveStickerPrompt,
  );
  assert.equal(
    spec.formats.reel.pages[2].semanticContent.format.spokenHook0to3s,
    input.story.campaignDraft.reel.spokenHook0to3s,
  );
  assert.equal(
    spec.formats.reel.pages[2].semanticContent.format.closingCta,
    input.story.campaignDraft.reel.closingCta,
  );
  spec.formats.reel.pages[0].semanticContent.format.closingCta =
    "external proposal";
  assert.deepEqual(input, original);
  assert.equal(
    spec.sourceCampaign.reel.closingCta,
    original.story.campaignDraft.reel.closingCta,
  );
});
