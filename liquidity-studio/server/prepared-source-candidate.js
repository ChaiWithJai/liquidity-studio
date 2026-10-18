import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { fail } from "./auth.js";
import { brandRevision } from "./multimodal-contract.js";
import { renderSvg } from "./artwork.js";
import {storyContentDigest} from "./story-content-revision.js";
import { catalogForStory, SOURCE_CATALOG_REVISION } from "./source-catalog.js";
export const PREPARATION_PURPOSE = "source-preparation";
export function preparationInput(story, scope) {
  return {
    title: story.title,
    contentDigest: storyContentDigest(story),
    sourceClaims: story.sourceClaims || [],
    contentRevision: story.contentRevision || 1,
    catalog: catalogForStory(story, scope),
    catalogRevision: SOURCE_CATALOG_REVISION,
  };
}
export function preparationFingerprint(story, scope) {
  return createHash("sha256")
    .update(JSON.stringify(preparationInput(story, scope)))
    .digest("hex");
}
export function preparationUrls(story, scope) {
  let urls = [
    ...new Set(
      (story.sourceClaims || [])
        .map((claim) => claim.sourceUrl)
        .filter(Boolean),
    ),
  ];
  if (!urls.length)
    urls = catalogForStory(story, scope).map((entry) => entry.sourceUrl);
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
          const excerpt = text.slice(0, 140);
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
  const [first, second = first, third = first] = excerpts.map(
    (excerpt) => excerpt.text,
  );
  const texts = [first, second, third];
  return {
    infographic: {
      headline: "Source excerpts · review required",
      statRows: texts,
      bottomTakeaway: "Machine preparation has not approved these excerpts.",
      caption: "Inspect the retrieved evidence before adopting a claim.",
    },
    carousel: {
      coverHook: "Retrieved source excerpts",
      slides: [
        ...texts.map((text, index) => ({
          slideNumber: index + 1,
          title: "Unreviewed excerpt",
          bodyMetric: text,
          visualNote: "Source excerpt text card",
        })),
        {
          slideNumber: 4,
          title: "Review the evidence",
          bodyMetric:
            "Inspect the original source before approving this draft.",
          visualNote: "Editorial review step; no factual assertion",
        },
      ],
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
        voiceover: text.slice(0,100),
        onScreenText: "Unreviewed source excerpt",
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
    inputFingerprint: preparationFingerprint(story, scope),
    brandRevision: brandRevision(brandProfile),
    jobId,
    itemId,
    attemptId,
    createdAt,
    excerpts,
    sourceSelection: catalogForStory(story, scope).filter((entry) =>
      evidence.some((snapshot) => snapshot.sourceUrl === entry.sourceUrl),
    ),
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

export function validateCandidateLayout(artwork, brandProfile = {}) {
  try {
    for (const format of ["infographic", "carousel", "story", "reel"]) {
      const count =
        format === "carousel"
          ? artwork.carousel.slides.length
          : format === "reel"
            ? artwork.reel.beats.length
            : 1;
      for (let slideIndex = 0; slideIndex < count; slideIndex++)
        renderSvg({ campaign: artwork, brandProfile, format, slideIndex });
    }
  } catch {
    throw fail(
      422,
      "Candidate copy does not fit the artwork; shorten it and preserve local edits",
    );
  }
  return true;
}
