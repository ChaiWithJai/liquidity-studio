import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { fail } from "./auth.js";
import { getApprovedClaims, validateCampaign } from "./source-integrity.js";

export const EDITOR_SCHEMA_VERSION = 1;
export const NATIVE_TARGETS = Object.freeze({
  doory: {
    documentType: "DooryDocument",
    schemaVersion: 1,
    sourceCommit: "27b6f68221fdbf1ef1bedc182e303210ca9e39f5",
  },
  penpot: {
    editorVersion: "2.18.3",
    archiveType: "penpot/export-files",
    archiveVersion: 1,
  },
});
export const STABLE_LAYER_IDS = Object.freeze([
  "subject_cutout_layer",
  "brand_pill_badge",
  "headline_layer",
  "metric_card_1",
  "metric_card_2",
  "metric_card_3",
]);
const FORMATS = ["infographic", "carousel", "story", "reel"];
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  return value;
}
export function brandRevision(profile) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(profile)))
    .digest("hex");
}
function reject(status, code, message) {
  const error = fail(status, message);
  error.code = code;
  throw error;
}
export function migrateEditorContract(value, targetVersion = 1) {
  if (value?.schemaVersion !== 1 || targetVersion !== 1)
    reject(
      422,
      "UNSUPPORTED_SCHEMA_VERSION",
      "No migration exists for this editor schema version",
    );
  return structuredClone(value);
}
function sourceFieldMappings(value, sourcePath, destinationPath) {
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      sourceFieldMappings(
        child,
        `${sourcePath}.${key}`,
        `${destinationPath}.${key}`,
      ),
    );
  }
  return [{ sourcePath, destinationPath }];
}
function frozenSnapshot(value) {
  const copy = structuredClone(value);
  const freeze = (item) => {
    if (item && typeof item === "object") {
      for (const child of Object.values(item)) freeze(child);
      Object.freeze(item);
    }
    return item;
  };
  return freeze(copy);
}
function page(format, index, campaign, brandProfile) {
  const timing = [
    [0, 3],
    [3, 15],
    [15, 30],
  ][index];
  const item =
    format === "carousel"
      ? campaign.carousel.slides[index]
      : format === "reel"
        ? campaign.reel.beats[index]
        : campaign[format];
  const headline =
    format === "infographic"
      ? item.headline
      : format === "carousel"
        ? item.title
        : format === "story"
          ? item.hookBanner
          : item.onScreenText;
  const metrics =
    format === "infographic"
      ? item.statRows
      : format === "carousel"
        ? [item.bodyMetric]
        : format === "story"
          ? [item.keyStatHighlight]
          : [item.voiceover];
  return {
    id: `${format}_page_${index + 1}`,
    semanticContent: {
      format: structuredClone(campaign[format]),
      page: structuredClone(item),
      sourcePagePath:
        format === "carousel"
          ? `carousel.slides.${index}`
          : format === "reel"
            ? `reel.beats.${index}`
            : format,
      executionStatus: "proposal_only",
    },
    sourceFieldMappings: sourceFieldMappings(
      campaign[format],
      format,
      "semanticContent.format",
    ),
    width: 1080,
    height: ["story", "reel"].includes(format) ? 1920 : 1350,
    ...(format === "reel"
      ? {
          timecode: { startSeconds: timing[0], endSeconds: timing[1] },
          sourceBeatTimecode: item.timecode,
        }
      : {}),
    layers: [
      {
        id: "subject_cutout_layer",
        type: "asset-placeholder",
        assetId: null,
        backgroundRemoval: {
          requested: true,
          executed: false,
          engine: "unselected",
        },
      },
      {
        id: "brand_pill_badge",
        type: "text-proposal",
        text: brandProfile.logoText || brandProfile.brandName,
        curvedText: { requested: true, implemented: false },
      },
      { id: "headline_layer", type: "text-proposal", text: headline },
      ...[0, 1, 2].map((i) => ({
        id: `metric_card_${i + 1}`,
        type: "text-proposal",
        text: metrics[i] || "",
        empty: !metrics[i],
      })),
    ],
    animationProposal: {
      implemented: false,
      staggerMilliseconds: 120,
      layerOrder: [...STABLE_LAYER_IDS],
    },
  };
}
/** Hexagonal port: inspection only. Future adapters must implement their own native validation. */
export class MultimodalCanvasPort {
  compileMultimodalBundle() {
    reject(501, "UNIMPLEMENTED_EDITOR_PORT", "Editor port is not implemented");
  }
}
export class SpecificationMultimodalCanvasAdapter extends MultimodalCanvasPort {
  compileMultimodalBundle(input) {
    return compileMultimodalBundle(input);
  }
}
export function compileMultimodalBundle({
  scope,
  brandProfile,
  story,
  request,
}) {
  if (request.schemaVersion !== 1)
    reject(
      422,
      "UNSUPPORTED_SCHEMA_VERSION",
      "Only editor specification schema version 1 is supported",
    );
  if (
    !scope?.organizationId ||
    !scope?.brandId ||
    story?.id !== request.storyId
  )
    reject(
      404,
      "SCOPE_OR_STORY_MISMATCH",
      "Story not found in authorized scope",
    );
  if (
    !Number.isInteger(request.expectedRevision) ||
    request.expectedRevision !== story.revision
  )
    reject(409, "STALE_STORY_REVISION", "Draft revision changed");
  if (
    !story.generationId ||
    request.generationId !== story.generationId ||
    story.campaignDraft?.provenance?.generationId !== story.generationId
  )
    reject(
      409,
      "GENERATION_MISMATCH",
      "A matching persisted campaign generation is required",
    );
  const revision = brandRevision(brandProfile);
  if (request.expectedBrandRevision !== revision)
    reject(
      409,
      "STALE_BRAND_REVISION",
      "Brand revision changed; reload bootstrap",
    );
  if (request.format !== undefined && !FORMATS.includes(request.format))
    reject(400, "UNSUPPORTED_FORMAT", "Unsupported format");
  if (
    request.nativeTargets !== undefined &&
    !isDeepStrictEqual(request.nativeTargets, NATIVE_TARGETS)
  )
    reject(
      422,
      "UNSUPPORTED_NATIVE_VERSION",
      "Unsupported native target versions",
    );
  if (
    !Array.isArray(request.requiredCapabilities) ||
    request.requiredCapabilities.length
  )
    reject(
      422,
      "UNSUPPORTED_CAPABILITY",
      "Native editor capabilities are unavailable; no flattening fallback exists",
    );
  const sourceApprovals = getApprovedClaims(story);
  validateCampaign(story.campaignDraft, story);
  const formats = request.format ? [request.format] : FORMATS;
  return {
    schemaVersion: 1,
    kind: "multimodal-spec",
    integrationStatus: "not_integrated",
    scope: { organizationId: scope.organizationId, brandId: scope.brandId },
    storyId: story.id,
    storyRevision: story.revision,
    generationId: story.generationId,
    sourceApprovals: structuredClone(sourceApprovals),
    sourceCampaign: frozenSnapshot(story.campaignDraft),
    brandRevision: revision,
    tokens: {
      authority: "studio",
      colors: structuredClone(brandProfile.colors),
      fonts: structuredClone(brandProfile.fonts),
      externalChanges: "proposal_requires_studio_approval",
    },
    nativeTargets: structuredClone(NATIVE_TARGETS),
    nativeDocuments: { doory: null, penpot: null },
    capabilities: {
      nativeText: "unsupported",
      tokenBinding: "unsupported",
      cutout: "unsupported",
      animation: "unsupported",
      nativeExport: "unsupported",
    },
    assets: [],
    formats: Object.fromEntries(
      formats.map((format) => [
        format,
        {
          pages: Array.from(
            { length: format === "carousel" ? 4 : format === "reel" ? 3 : 1 },
            (_, index) =>
              page(format, index, story.campaignDraft, brandProfile),
          ),
        },
      ]),
    ),
    workflow: {
      optionalParallelGovernance: ["source-review", "brand-review"],
      orderedFinishing: [
        "proposed-editor-edit",
        "studio-revalidation",
        "final-human-signoff",
      ],
      finalSignoff: "not_granted",
      clinicalApproval: "never_automatic",
    },
  };
}
