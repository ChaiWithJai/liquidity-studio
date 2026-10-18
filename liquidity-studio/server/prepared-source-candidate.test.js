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
