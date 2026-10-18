import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { fail } from "./auth.js";
import { brandRevision } from "./multimodal-contract.js";
export const PREPARATION_PURPOSE = "source-preparation";
export function preparationInput(story) {
  return {
    title: story.title,
    sourceClaims: story.sourceClaims || [],
    contentRevision: story.contentRevision || 1,
  };
}
export function preparationFingerprint(story) {
  return createHash("sha256")
    .update(JSON.stringify(preparationInput(story)))
    .digest("hex");
}
export function preparationUrls(story) {
  const urls = [
    ...new Set(
      (story.sourceClaims || [])
        .map((claim) => claim.sourceUrl)
        .filter(Boolean),
    ),
  ];
  if (!urls.length || urls.length > 2)
    throw fail(
      422,
      "Preparation requires one or two source URLs; review the source selection",
    );
  return urls;
}
function excerptsFor(evidence) {
  return evidence
    .flatMap((snapshot) =>
      snapshot.text
        .split("\n")
        .filter((text) => text.length >= 40)
        .slice(0, 3)
        .map((text) => {
          const excerpt = text.slice(0, 400);
          return {
            evidenceId: snapshot.id,
            sourceUrl: snapshot.sourceUrl,
            text: excerpt,
            startOffset: snapshot.text.indexOf(excerpt),
            status: "unreviewed",
            clinicalReview: null,
          };
        }),
    )
    .slice(0, 3);
}
export function candidateArtwork(excerpts) {
  const texts = excerpts.map((excerpt) => excerpt.text),
    first = texts[0];
  return {
    infographic: {
      headline: "Source excerpts · review required",
      statRows: texts,
      bottomTakeaway: "Machine preparation has not approved these excerpts.",
      caption: "Inspect the retrieved evidence before adopting a claim.",
    },
    carousel: {
      coverHook: "Retrieved source excerpts",
      slides: texts.map((text, index) => ({
        slideNumber: index + 1,
        title: "Unreviewed excerpt",
        bodyMetric: text,
        visualNote: "Source excerpt text card",
      })),
    },
    story: {
      hookBanner: "Source review candidate",
      keyStatHighlight: first,
      interactiveStickerPrompt: "What needs further verification?",
    },
    reel: {
      spokenHook0to3s: "Source review candidate.",
      beats: texts.map((text, index) => ({
        timecode: ["0:00-0:05", "0:05-0:15", "0:15-0:30"][index],
        voiceover: text,
        onScreenText: text,
        bRollDirection: "Unreviewed source excerpt text card",
      })),
      closingCta: "Verify the original evidence before sharing.",
    },
  };
}
export function buildPreparedCandidate({
  id,
  scope,
  story,
  brandProfile,
  evidence,
  jobId,
  itemId,
  attemptId,
  createdAt,
}) {
  if (
    !id ||
    !scope?.organizationId ||
    !scope?.brandId ||
    !Array.isArray(evidence) ||
    !evidence.length ||
    evidence.length > 2
  )
    throw fail(422, "Invalid preparation evidence");
  for (const snapshot of evidence) {
    if (
      !snapshot.id ||
      snapshot.status !== "unreviewed" ||
      snapshot.approval !== "none" ||
      typeof snapshot.text !== "string" ||
      snapshot.textSha256 !==
        createHash("sha256").update(snapshot.text).digest("hex")
    )
      throw fail(422, "Preparation evidence integrity failed");
  }
  const excerpts = excerptsFor(evidence);
  if (!excerpts.length)
    throw fail(422, "No usable source excerpts were retrieved");
  return {
    schemaVersion: 1,
    id,
    ...scope,
    storyId: story.id,
    contentRevision: story.contentRevision || 1,
    inputFingerprint: preparationFingerprint(story),
    brandRevision: brandRevision(brandProfile),
    jobId,
    itemId,
    attemptId,
    createdAt,
    excerpts,
    artwork: candidateArtwork(excerpts),
    provenance: {
      purpose: PREPARATION_PURPOSE,
      mode: "extractive-unreviewed",
      humanApproval: "none",
      requiresReview: true,
      provider: "none",
      modelCalls: 0,
      evidenceIds: evidence.map((snapshot) => snapshot.id),
    },
  };
}
export function validatePreparedCandidate(candidate, evidence) {
  if (
    candidate?.provenance?.purpose !== PREPARATION_PURPOSE ||
    candidate.provenance.mode !== "extractive-unreviewed" ||
    candidate.provenance.humanApproval !== "none" ||
    candidate.provenance.requiresReview !== true ||
    candidate.provenance.provider !== "none" ||
    candidate.provenance.modelCalls !== 0
  )
    throw fail(422, "Candidate cannot claim human approval or model execution");
  const excerpts = excerptsFor(evidence);
  if (
    !isDeepStrictEqual(candidate.excerpts, excerpts) ||
    !isDeepStrictEqual(candidate.artwork, candidateArtwork(excerpts)) ||
    !isDeepStrictEqual(
      candidate.provenance.evidenceIds,
      evidence.map((snapshot) => snapshot.id),
    )
  )
    throw fail(422, "Candidate must preserve the retrieved excerpts exactly");
  return true;
}
