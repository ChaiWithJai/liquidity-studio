import test from "node:test";
import assert from "node:assert/strict";
import { BRAND_PRESETS } from "./domain.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import {
  brandRevision,
  compileMultimodalBundle,
} from "./multimodal-contract.js";
import {
  compileDooryDocument,
  applyDooryBrandTokens,
} from "./doory-native-adapter.js";
import {
  validateDooryDocument,
  DooryLocalTransport,
} from "./doory-local-transport.js";
const availableFonts = [
  "Instrument Serif",
  "Mona Sans",
  "Inter",
  "Noto Sans Devanagari",
].map((family) => ({
  family,
  sha256: "a".repeat(64),
  source: "unit registry, not rendered font proof",
  verifiedCodepoints: [
    "U+0043",
    "U+0057",
    "U+004A",
    "U+0020",
    "U+002F",
    "U+0950",
  ],
}));
function fixture(preset) {
  const profile = structuredClone(BRAND_PRESETS[preset]);
  const story = {
    id: "reviewed-story",
    revision: 2,
    generationId: "g1",
    sourceClaims: [
      {
        id: "c1",
        text: "An approved source excerpt for a controlled integration fixture.",
        sourceUrl: "https://example.org/source",
        kind: "general",
        status: "approved",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: "g1", mode: "synthetic" },
  };
  return {
    profile,
    spec: compileMultimodalBundle({
      scope: { organizationId: "org", brandId: preset },
      brandProfile: profile,
      story,
      request: {
        schemaVersion: 1,
        storyId: story.id,
        expectedRevision: 2,
        generationId: "g1",
        expectedBrandRevision: brandRevision(profile),
        requiredCapabilities: [],
      },
    }),
  };
}
test("both brands all formats preserve full source, native text/stableIDs and three reel durations", () => {
  for (const brand of ["liquidity_desk", "vedic_dharma"])
    for (const [format, count, height] of [
      ["infographic", 1, 1350],
      ["carousel", 4, 1350],
      ["story", 1, 1920],
      ["reel", 3, 1920],
    ]) {
      const { spec, profile } = fixture(brand),
        before = structuredClone(spec);
      const result = compileDooryDocument({
        spec,
        brandProfile: profile,
        format,
        availableFonts,
      });
      assert.deepEqual(spec, before);
      assert.deepEqual(validateDooryDocument(result.document), result.document);
      assert.equal(result.document.pages.length, count);
      assert.equal(result.document.height, height);
      assert.deepEqual(result.manifest.sourceCampaign, spec.sourceCampaign);
      for (const page of result.document.pages) {
        assert.equal(
          page.objects.find((o) => o.id === "headline_layer").type,
          "textbox",
        );
        assert.equal(page.objects.length, 7);
        const placeholder = page.objects.find(object => object.id === "subject_cutout_layer");
        assert.equal(placeholder.isPlaceholder, true);
        assert.equal(placeholder.type, "rect");
        assert.ok(page.objects.filter(object => object.id !== placeholder.id).every(object => object.isPlaceholder === undefined));
        const invalid = structuredClone(result.document);
        invalid.pages[0].objects[0].isPlaceholder = "true";
        assert.throws(() => validateDooryDocument(invalid), /placeholder marker/);
        assert.deepEqual(
          JSON.parse(page.notes).semanticContent.format,
          spec.sourceCampaign[format],
        );
      }
      if (format === "reel")
        assert.deepEqual(
          result.document.pages.map((p) => p.durationSec),
          [3, 12, 15],
        );
    }
});
test("token refresh preserves human native text/IDs/geometry/source while changing saved colors/fonts", () => {
  const { spec, profile } = fixture("vedic_dharma");
  const result = compileDooryDocument({
    spec,
    brandProfile: profile,
    format: "carousel",
    availableFonts,
  });
  result.document.pages[0].objects.find((o) => o.id === "headline_layer").text =
    "Human edited heading";
  const before = structuredClone(result.document);
  const next = structuredClone(profile);
  next.colors[0].hex = "#112233";
  next.colors[1].hex = "#55aa66";
  next.fonts.heading = "Inter";
  const updated = applyDooryBrandTokens({
    ...result,
    tokens: next,
    expectedBrandRevision: spec.brandRevision,
    brandRevision: brandRevision(next),
    availableFonts,
  });
  assert.deepEqual(result.document, before);
  assert.equal(updated.document.pages[0].background.color, "#112233");
  assert.equal(
    updated.document.pages[0].objects.find((o) => o.id === "brand_pill_badge")
      .fill,
    "#55aa66",
  );
  assert.equal(
    updated.document.pages[0].objects.find((o) => o.id === "headline_layer")
      .text,
    "Human edited heading",
  );
  assert.deepEqual(
    updated.document.pages.map((p) =>
      p.objects.map((o) => [o.id, o.left, o.top]),
    ),
    before.pages.map((p) => p.objects.map((o) => [o.id, o.left, o.top])),
  );
  assert.deepEqual(
    updated.manifest.sourceCampaign,
    result.manifest.sourceCampaign,
  );
});
test("missing fonts, unapproved claims, unsupported version and stale bindings reject visibly", () => {
  const { spec, profile } = fixture("vedic_dharma");
  assert.throws(
    () =>
      compileDooryDocument({ spec, brandProfile: profile, format: "story" }),
    /Missing verified font/,
  );
  const incompatible = structuredClone(spec);
  incompatible.nativeTargets.doory.schemaVersion = 2;
  assert.throws(
    () =>
      compileDooryDocument({
        spec: incompatible,
        brandProfile: profile,
        format: "story",
        availableFonts,
      }),
    /Unsupported Doory/,
  );
  const bad = structuredClone(spec);
  bad.sourceApprovals[0].status = "unreviewed";
  assert.throws(() =>
    compileDooryDocument({
      spec: bad,
      brandProfile: profile,
      format: "story",
      availableFonts,
    }),
  );
  const result = compileDooryDocument({
    spec,
    brandProfile: profile,
    format: "story",
    availableFonts,
  });
  assert.throws(() =>
    applyDooryBrandTokens({
      ...result,
      tokens: profile,
      expectedBrandRevision: "stale",
      brandRevision: "next",
      availableFonts,
    }),
  );
  result.document.pages[0].objects = [];
  assert.throws(() =>
    applyDooryBrandTokens({
      ...result,
      tokens: profile,
      expectedBrandRevision: spec.brandRevision,
      brandRevision: "next",
      availableFonts,
    }),
  );
});
test("local transport rejects caller endpoints, bad identities, unversioned writes before I/O", async () => {
  let calls = 0;
  const transport = new DooryLocalTransport({
    sessions: new Map([["owner", { cookie: "unit", csrf: "unit" }]]),
    fetchImpl: async () => {
      calls++;
      throw Error("unexpected");
    },
  });
  const binding = {
      adapter: "doory",
      nativeDocumentVersion: "1",
      editorVersion: "27b6f68221fdbf1ef1bedc182e303210ca9e39f5",
      ownerPrincipal: "owner",
    },
    resource = {
      kind: "document",
      nativeId: "11111111-1111-4111-8111-111111111111",
    };
  const { spec, profile } = fixture("vedic_dharma");
  const { document } = compileDooryDocument({
    spec,
    brandProfile: profile,
    format: "story",
    availableFonts,
  });
  for (const command of [
    {
      operation: "patch",
      document,
      expectedNativeRevision: 1,
      url: "https://example.org",
    },
    { operation: "patch", document },
    { operation: "create", document, expectedNativeRevision: 1 },
  ])
    await assert.rejects(
      transport.execute({ binding, resource, action: "write", command }),
    );
  await assert.rejects(
    transport.execute({
      binding,
      resource: { ...resource, nativeId: "../foreign" },
      action: "read",
    }),
  );
  assert.equal(calls, 0);
  const bad = structuredClone(document);
  bad.pages[0].objects[0].src = "http://internal";
  assert.throws(() => validateDooryDocument(bad));
});

test("registered writes reject missing target fonts and recheck membership immediately before fetch", async () => {
  const { spec, profile } = fixture("vedic_dharma");
  const { document } = compileDooryDocument({
    spec,
    brandProfile: profile,
    format: "story",
    availableFonts,
  });
  const binding = {
    adapter: "doory",
    nativeVersionKind: "document-schema",
    nativeDocumentVersion: "1",
    editorVersion: "27b6f68221fdbf1ef1bedc182e303210ca9e39f5",
    ownerPrincipal: "owner",
  };
  const resource = {
    kind: "document",
    nativeId: "11111111-1111-4111-8111-111111111111",
  };
  let calls = 0;
  const transport = new DooryLocalTransport({
    sessions: new Map([["owner", { cookie: "unit", csrf: "unit" }]]),
    fontFamiliesByOwner: new Map([
      ["owner", ["Mona Sans", "Inter", "Noto Sans Devanagari"]],
    ]),
    fetchImpl: async () => {
      calls++;
      throw Error("unexpected I/O");
    },
  });
  const command = { operation: "patch", document, expectedNativeRevision: 1 };
  const missing = structuredClone(command);
  missing.document.pages[0].objects.find(
    (o) => o.type === "textbox",
  ).fontFamily = '"Missing Brand Font", sans-serif';
  await assert.rejects(
    transport.execute({
      binding,
      resource,
      action: "write",
      command: missing,
      reauthorize: async () => {},
    }),
    /Missing verified target font/,
  );
  await assert.rejects(
    transport.execute({
      binding,
      resource,
      action: "write",
      command,
      reauthorize: async () => {
        throw Error("membership revoked");
      },
    }),
    /membership revoked/,
  );
  await assert.rejects(
    transport.execute({ binding, resource, action: "read" }),
    /reauthorization required/,
  );
  assert.equal(calls, 0);
});

test("actual pinned browser serialization defaults survive token refresh without accepting nested remote paints", async () => {
  const { readFileSync } = await import("node:fs");
  const serialized = JSON.parse(
    readFileSync(
      new URL(
        "../../scripts/investigations/doory-fabric7-textbox.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const { spec, profile } = fixture("vedic_dharma");
  const compiled = compileDooryDocument({
    spec,
    brandProfile: profile,
    format: "story",
    availableFonts,
  });
  const index = compiled.document.pages[0].objects.findIndex(
    (o) => o.id === "headline_layer",
  );
  compiled.document.pages[0].objects[index] = serialized;
  assert.deepEqual(validateDooryDocument(compiled.document), compiled.document);
  const refreshed = applyDooryBrandTokens({
    ...compiled,
    tokens: profile,
    expectedBrandRevision: spec.brandRevision,
    brandRevision: "reviewed-new-revision",
    availableFonts,
  });
  assert.deepEqual(
    validateDooryDocument(refreshed.document),
    refreshed.document,
  );
  assert.equal(
    refreshed.document.pages[0].objects[index].text,
    serialized.text,
  );
  for (const property of ["fill", "stroke", "backgroundColor"]) {
    const nested = structuredClone(compiled.document);
    nested.pages[0].objects[index][property] = {
      type: "pattern",
      source: "http://untrusted.invalid/private",
    };
    assert.throws(() => validateDooryDocument(nested), /solid colors/);
  }
});

test("initial compile rejects coherent rendered-copy tampering, malformed stable layers and source geometry/timing", () => {
  const { spec, profile } = fixture("vedic_dharma");
  const changes = [
    (b) => {
      b.formats.infographic.pages[0].layers[2].text = "Unsupported assertion";
    },
    (b) => {
      b.formats.infographic.pages[0].layers[3].text = "Unsupported metric";
    },
    (b) => {
      const p = b.formats.infographic.pages[0];
      p.semanticContent.format.headline = "Unsupported assertion";
      p.semanticContent.page.headline = "Unsupported assertion";
      p.layers[2].text = "Unsupported assertion";
    },
    (b) => {
      b.formats.infographic.pages[0].layers[1].text = "False brand label";
    },
    (b) => {
      b.formats.infographic.pages[0].layers[3].id = "headline_layer";
    },
    (b) => {
      b.formats.infographic.pages[0].layers.push(
        b.formats.infographic.pages[0].layers[2],
      );
    },
    (b) => {
      b.formats.infographic.pages[0].width = 999;
    },
    (b) => {
      b.formats.infographic.pages[0].id = "other-page";
    },
    (b) => {
      b.formats.infographic.pages[0].sourceFieldMappings = [];
    },
    (b) => {
      b.tokens.colors[0].hex = "#ffffff";
    },
  ];
  for (const change of changes) {
    const bad = structuredClone(spec);
    change(bad);
    assert.throws(
      () =>
        compileDooryDocument({
          spec: bad,
          brandProfile: profile,
          format: "infographic",
          availableFonts,
        }),
      /SOURCE_/,
    );
  }
  for (const change of [
    (b) => {
      b.formats.reel.pages[0].timecode.endSeconds = 4;
    },
    (b) => {
      b.formats.reel.pages[1].sourceBeatTimecode = "fabricated";
    },
  ]) {
    const bad = structuredClone(spec);
    change(bad);
    assert.throws(
      () =>
        compileDooryDocument({
          spec: bad,
          brandProfile: profile,
          format: "reel",
          availableFonts,
        }),
      /SOURCE_TIMING_MISMATCH/,
    );
  }
});

test("CWJ badge preserves exact Sanskrit codepoint and requires verified explicit Noto glyph coverage", () => {
  const { spec, profile } = fixture("vedic_dharma");
  const input = {
    spec,
    brandProfile: profile,
    format: "infographic",
    availableFonts,
  };
  const compiled = compileDooryDocument(input),
    badge = compiled.document.pages[0].objects.find(
      (o) => o.id === "brand_pill_badge",
    );
  assert.equal(badge.text, "CWJ // ॐ");
  assert.equal([...badge.text].at(-1).codePointAt(0), 0x0950);
  assert.equal(badge.fontFamily, '"Noto Sans Devanagari", sans-serif');
  assert.equal(
    compiled.manifest.fontProvenance.badge.family,
    "Noto Sans Devanagari",
  );
  assert.throws(
    () =>
      compileDooryDocument({
        ...input,
        availableFonts: availableFonts.filter(
          (f) => f.family !== "Noto Sans Devanagari",
        ),
      }),
    /Missing verified font/,
  );
  const missing = structuredClone(availableFonts);
  missing.find((f) => f.family === "Noto Sans Devanagari").verifiedCodepoints =
    [];
  assert.throws(
    () => compileDooryDocument({ ...input, availableFonts: missing }),
    /glyph coverage/,
  );
  const privateRegistry = availableFonts.map((f) => ({
    ...f,
    secretSession: "must never enter manifest",
  }));
  assert.ok(
    !JSON.stringify(
      compileDooryDocument({ ...input, availableFonts: privateRegistry })
        .manifest,
    ).includes("must never"),
  );
});
