import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  buildPreparedCandidate,
  validatePreparedCandidate,
  preparationFingerprint,
  preparationUrls,
} from "./prepared-source-candidate.js";
const text =
  "A retrieved primary source excerpt with enough material for an operator to inspect.";
const evidence = [
  {
    id: "evidence",
    text,
    textSha256: createHash("sha256").update(text).digest("hex"),
    sourceUrl: "https://source.example/a",
    status: "unreviewed",
    approval: "none",
  },
];
const story = {
  id: "story",
  title: "Owner topic is not itself evidence",
  sourceClaims: [
    {
      text: "Unverified input",
      sourceUrl: "https://source.example/a",
      status: "unreviewed",
    },
  ],
  revision: 1,
};
test("prepared artwork is extractive, explicitly unreviewed and separate from approved campaign", () => {
  const candidate = buildPreparedCandidate({
    id: "candidate",
    scope: { organizationId: "org", brandId: "brand" },
    story,
    brandProfile: {},
    evidence,
    jobId: "job",
    itemId: "item",
    attemptId: "attempt",
    createdAt: "now",
  });
  assert.equal(validatePreparedCandidate(candidate, evidence), true);
  assert.equal(candidate.artwork.story.keyStatHighlight, text);
  assert.equal(candidate.excerpts[0].clinicalReview, null);
  assert.equal(story.campaignDraft, undefined);
  assert.equal(story.sourceClaims[0].status, "unreviewed");
  for (const modify of [
    (copy) => (copy.provenance.humanApproval = "approved"),
    (copy) => (copy.artwork.story.keyStatHighlight = "Invented medical claim"),
    (copy) => (copy.excerpts[0].text = "Invented fact"),
  ]) {
    const copy = structuredClone(candidate);
    modify(copy);
    assert.throws(() => validatePreparedCandidate(copy, evidence));
  }
});
test("preparation fingerprint fences content while allowing planning metadata and deduplicates source URLs", () => {
  const before = preparationFingerprint(story);
  assert.equal(
    preparationFingerprint({
      ...story,
      revision: 5,
      status: "Scheduled",
      scheduledDay: "Tuesday",
      assigneeId: "other",
    }),
    before,
  );
  assert.notEqual(
    preparationFingerprint({ ...story, contentRevision: 2 }),
    before,
  );
  assert.notEqual(
    preparationFingerprint({
      ...story,
      sourceClaims: [{ ...story.sourceClaims[0], text: "Changed evidence" }],
    }),
    before,
  );
  assert.deepEqual(
    preparationUrls({
      ...story,
      sourceClaims: [...story.sourceClaims, ...story.sourceClaims],
    }),
    ["https://source.example/a"],
  );
  assert.throws(
    () => preparationUrls({ ...story, sourceClaims: [] }),
    /source URLs/,
  );
});
test("operator catalog prepares existing Huda topic without changing unsourced legacy claims or trusting other preset IDs", () => {
  const huda = {
    id: "story_huda_buyback",
    title: "How Huda Kattan Bought Back 100% of Huda Beauty",
    sourceClaims: [
      {
        id: "legacy",
        text: "2024 and margin estimates remain unverified",
        sourceUrl: null,
        status: "unreviewed",
      },
    ],
  };
  const scope = {
    organizationId: "org",
    brandId: "brand",
    preset: "liquidity_desk",
  };
  assert.ok(preparationUrls(huda, scope)[0].includes("huda-beauty-reclaims"));
  assert.throws(() =>
    preparationUrls(huda, { ...scope, preset: "vedic_dharma" }),
  );
  assert.equal(huda.sourceClaims[0].sourceUrl, null);
  assert.equal(huda.sourceClaims[0].status, "unreviewed");
  assert.notEqual(
    preparationFingerprint(huda, scope),
    preparationFingerprint(huda, { ...scope, preset: "vedic_dharma" }),
  );
});
test("every prepared format uses the canonical renderer without invented filler or long title overflow", async () => {
  const { renderSvg } = await import("./artwork.js");
  const longText = Array.from(
    { length: 3 },
    (_, i) =>
      `Source paragraph ${i}: ` + "An exact source word sequence. ".repeat(30),
  ).join("\n");
  const snapshots = [
    {
      ...evidence[0],
      text: longText,
      textSha256: createHash("sha256").update(longText).digest("hex"),
    },
  ];
  const candidate = buildPreparedCandidate({
    id: "candidate",
    scope: { organizationId: "org", brandId: "brand" },
    story,
    brandProfile: {},
    evidence: snapshots,
  });
  for (const format of ["infographic", "carousel", "story", "reel"])
    assert.ok(
      renderSvg({
        campaign: candidate.artwork,
        brandProfile: {},
        format,
        slideIndex: 0,
      }).startsWith("<svg"),
    );
  assert.ok(candidate.excerpts.every((excerpt) => excerpt.text.length <= 220));
});

test("numbered primary-text verse keeps its meaningful sentence rather than only the verse number", () => {
  const text =
    "29. The eight means of Yoga are: the Commandments, the Rules, right Poise, right Control of the life-force, Withdrawal, Attention, Meditation, Contemplation.";
  const snapshots = [
    {
      ...evidence[0],
      text,
      textSha256: createHash("sha256").update(text).digest("hex"),
    },
  ];
  const candidate = buildPreparedCandidate({
    id: "verse-candidate",
    scope: { organizationId: "org", brandId: "brand" },
    story,
    brandProfile: {},
    evidence: snapshots,
  });
  assert.equal(
    candidate.artwork.infographic.headline,
    "The eight means of Yoga",
  );
  assert.match(candidate.excerpts[0].text, /29\. The eight means of Yoga/);
  assert.ok(text.includes(candidate.artwork.infographic.headline));
});
