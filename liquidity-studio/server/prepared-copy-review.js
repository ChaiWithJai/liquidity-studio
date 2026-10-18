import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { fail } from "./auth.js";
export const REVIEWED_CANDIDATE_MODE = "human-reviewed-prepared-candidate";
const canonical = (value) =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === "object"
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, canonical(value[key])]),
        )
      : value;
export const copyDigest = (copy) =>
  createHash("sha256")
    .update(JSON.stringify(canonical(copy)))
    .digest("hex");
const sha256 = (value) =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
export function reviewedCopyTemplate() {
  return {
    infographic: {
      headline: "",
      statRows: ["", "", ""],
      bottomTakeaway: "",
      caption: "",
    },
    carousel: {
      coverHook: "",
      slides: Array.from({ length: 4 }, (_, i) => ({
        slideNumber: i + 1,
        title: "",
        bodyMetric: "",
        visualNote: "",
      })),
    },
    story: {
      hookBanner: "",
      keyStatHighlight: "",
      interactiveStickerPrompt: "",
    },
    reel: {
      spokenHook0to3s: "",
      beats: ["0:00-0:05", "0:05-0:15", "0:15-0:30"].map((timecode) => ({
        timecode,
        voiceover: "",
        onScreenText: "",
        bRollDirection: "",
      })),
      closingCta: "",
    },
  };
}
export function copyFields(copy, path = []) {
  return Object.entries(copy).flatMap(([key, value]) =>
    typeof value === "string" && key !== "timecode"
      ? [{ fieldPath: [...path, key].join("."), text: value }]
      : value && typeof value === "object"
        ? copyFields(value, [...path, key])
        : [],
  );
}
export function reconstructReviewedCopy(claims, manifest) {
  if (
    manifest?.schemaVersion !== 1 ||
    typeof manifest.candidateId !== "string" ||
    !manifest.candidateId ||
    !Number.isInteger(manifest.candidateRevision) ||
    manifest.candidateRevision < 1 ||
    !sha256(manifest.copySha256) ||
    !Array.isArray(manifest.evidence) ||
    !manifest.evidence.length ||
    manifest.evidence.length > 2 ||
    manifest.evidence.some(
      (evidence) =>
        !evidence ||
        typeof evidence.id !== "string" ||
        typeof evidence.sourceUrl !== "string" ||
        !evidence.sourceUrl.startsWith("https://") ||
        !sha256(evidence.responseSha256) ||
        !sha256(evidence.textSha256),
    ) ||
    new Set(manifest.evidence.map((evidence) => evidence.id)).size !==
      manifest.evidence.length ||
    !Array.isArray(manifest.fieldMappings)
  )
    throw fail(422, "Prepared copy review is incomplete");
  const template = reviewedCopyTemplate(),
    fields = copyFields(template),
    byPath = new Map();
  for (const mapping of manifest.fieldMappings) {
    if (
      !mapping ||
      typeof mapping.fieldPath !== "string" ||
      byPath.has(mapping.fieldPath)
    )
      throw fail(422, "Prepared copy mapping is invalid");
    const claim = claims.find((claim) => claim.id === mapping.claimId);
    if (
      !claim ||
      claim.purpose !== "prepared-copy-review" ||
      claim.fieldPath !== mapping.fieldPath ||
      claim.candidateId !== manifest.candidateId ||
      claim.candidateRevision !== manifest.candidateRevision ||
      claim.role !== "editorial_copy" ||
      claim.status !== "approved" ||
      typeof claim.text !== "string" ||
      claim.text.length > 2000 ||
      typeof claim.reviewedBy !== "string" ||
      !claim.reviewedBy ||
      !Number.isFinite(Date.parse(claim.reviewedAt)) ||
      !manifest.evidence.some(
        (evidence) =>
          evidence.sourceUrl === claim.sourceUrl &&
          evidence.responseSha256 === claim.evidenceResponseSha256 &&
          evidence.textSha256 === claim.evidenceTextSha256,
      )
    )
      throw fail(422, "Prepared copy lacks exact current source review");
    byPath.set(mapping.fieldPath, claim);
  }
  if (
    byPath.size !== fields.length ||
    fields.some((field) => !byPath.has(field.fieldPath))
  )
    throw fail(422, "Every prepared copy field must be reviewed");
  for (const field of fields) {
    let target = template;
    const parts = field.fieldPath.split(".");
    for (const key of parts.slice(0, -1)) target = target[key];
    target[parts.at(-1)] = byPath.get(field.fieldPath).text;
  }
  if (copyDigest(template) !== manifest.copySha256)
    throw fail(422, "Prepared reviewed copy digest changed");
  return template;
}
export function validateReviewedPreparedCopy(copy, claims, manifest) {
  if (!isDeepStrictEqual(copy, reconstructReviewedCopy(claims, manifest)))
    throw fail(
      422,
      "Campaign must preserve the exact human-reviewed prepared copy",
    );
  return true;
}
