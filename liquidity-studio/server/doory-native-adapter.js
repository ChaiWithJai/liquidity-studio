import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { fail } from "./auth.js";
import {
  NATIVE_TARGETS,
  STABLE_LAYER_IDS,
  brandRevision as hashBrandRevision,
} from "./multimodal-contract.js";
import { getApprovedClaims, validateCampaign } from "./source-integrity.js";

const FORMATS = { infographic: 1, carousel: 4, story: 1, reel: 3 };
const sha = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const family = (value) =>
  String(value || "")
    .split(/[\/,]/)[0]
    .replaceAll('"', "")
    .trim();
function reject(message) {
  throw fail(422, message);
}
function registeredFont(name, registry) {
  const entry = registry.find((item) => item.family === family(name));
  if (!entry || !/^[a-f0-9]{64}$/.test(entry.sha256 || ""))
    reject(`Missing verified font: ${family(name)}`);
  return {
    family: entry.family,
    sha256: entry.sha256,
    license: entry.license || "unverified",
    source:
      typeof entry.source === "string"
        ? entry.source.slice(0, 240)
        : "operator registry",
    ...(Array.isArray(entry.verifiedCodepoints)
      ? {
          verifiedCodepoints: entry.verifiedCodepoints.filter(
            (value) =>
              typeof value === "string" && /^U\+[0-9A-F]{4,6}$/.test(value),
          ),
        }
      : {}),
  };
}
function tokens(profile, registry) {
  const colors = profile.colors;
  if (
    !Array.isArray(colors) ||
    colors.length < 4 ||
    colors.some((c) => !/^#[a-f0-9]{6}$/i.test(c.hex))
  )
    reject("Four valid Studio palette colors are required");
  return {
    background: colors[0].hex,
    accent: colors[1].hex,
    text: colors[3].hex,
    heading: registeredFont(profile.fonts?.heading, registry),
    body: registeredFont(profile.fonts?.body, registry),
  };
}
function textbox(id, text, y, size, width, fill, font, height = size * 2.4) {
  return {
    id,
    type: "textbox",
    name: id,
    text,
    originX: "center",
    originY: "center",
    left: 540,
    top: y + height / 2,
    width,
    height,
    fontFamily: `"${font}", sans-serif`,
    fontSize: size,
    fontWeight: id === "headline_layer" ? 700 : 400,
    fill,
    textAlign: "left",
    lineHeight: 1.16,
    splitByGrapheme: false,
    strokeUniform: true,
  };
}
function additionalCopy(format, source, index) {
  // Art direction stays in semantic page notes, not in customer-facing artwork.
  if (format === "infographic")
    return [source.bottomTakeaway, source.caption].filter(Boolean).join("\n\n");
  if (format === "carousel")
    return [source.coverHook, source.caption]
      .filter(Boolean)
      .join("\n\n");
  if (format === "story") return source.interactiveStickerPrompt || "";
  return [
    index === 0 ? source.spokenHook0to3s : "",
    index === 2 ? source.closingCta : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
/** Native schema v1 at pinned Doory, not a generic Fabric canvas or rendered-image wrapper.
 * Native serialization source: https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/serialization.ts
 */
function fieldMappings(value, sourcePath, destinationPath) {
  if (value !== null && typeof value === "object")
    return Object.entries(value).flatMap(([key, child]) =>
      fieldMappings(child, `${sourcePath}.${key}`, `${destinationPath}.${key}`),
    );
  return [{ sourcePath, destinationPath }];
}
function validateSourcePage(page, index, format, campaign, brandProfile) {
  const height = ["story", "reel"].includes(format) ? 1920 : 1350;
  if (
    page.id !== `${format}_page_${index + 1}` ||
    page.width !== 1080 ||
    page.height !== height
  )
    reject("SOURCE_PAGE_DIMENSION_OR_ID_MISMATCH");
  const source = campaign[format];
  const item =
    format === "carousel"
      ? source.slides[index]
      : format === "reel"
        ? source.beats[index]
        : source;
  const sourcePath =
    format === "carousel"
      ? `carousel.slides.${index}`
      : format === "reel"
        ? `reel.beats.${index}`
        : format;
  if (
    !isDeepStrictEqual(page.semanticContent, {
      format: source,
      page: item,
      sourcePagePath: sourcePath,
      executionStatus: "proposal_only",
    }) ||
    !isDeepStrictEqual(
      page.sourceFieldMappings,
      fieldMappings(source, format, "semanticContent.format"),
    )
  )
    reject("SOURCE_PAGE_MISMATCH");
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
  const expectedLayers = [
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
  ];
  if (
    !Array.isArray(page.layers) ||
    !isDeepStrictEqual(
      page.layers.map((layer) => layer.id),
      STABLE_LAYER_IDS,
    ) ||
    !isDeepStrictEqual(page.layers, expectedLayers)
  )
    reject("SOURCE_LAYER_MISMATCH");
  if (format === "reel") {
    const times = [
      [0, 3],
      [3, 15],
      [15, 30],
    ][index];
    if (
      !isDeepStrictEqual(page.timecode, {
        startSeconds: times[0],
        endSeconds: times[1],
      }) ||
      page.sourceBeatTimecode !== item.timecode
    )
      reject("SOURCE_TIMING_MISMATCH");
  } else if (
    page.timecode !== undefined ||
    page.sourceBeatTimecode !== undefined
  )
    reject("SOURCE_TIMING_MISMATCH");
}
export function compileDooryDocument({
  spec,
  brandProfile,
  format,
  availableFonts = [],
}) {
  if (
    spec?.kind !== "multimodal-spec" ||
    spec.schemaVersion !== 1 ||
    !FORMATS[format] ||
    !isDeepStrictEqual(spec.nativeTargets?.doory, NATIVE_TARGETS.doory)
  )
    reject("Unsupported Doory specification/version/format");
  if (
    !spec.scope?.organizationId ||
    !spec.scope?.brandId ||
    !spec.generationId ||
    !spec.brandRevision ||
    spec.sourceCampaign?.provenance?.generationId !== spec.generationId
  )
    reject("Incomplete scoped generation provenance");
  if (
    !brandProfile ||
    hashBrandRevision(brandProfile) !== spec.brandRevision ||
    spec.tokens?.authority !== "studio" ||
    spec.tokens.externalChanges !== "proposal_requires_studio_approval" ||
    !isDeepStrictEqual(spec.tokens.colors, brandProfile.colors) ||
    !isDeepStrictEqual(spec.tokens.fonts, brandProfile.fonts)
  )
    reject("SOURCE_BRAND_MISMATCH");
  const story = { sourceClaims: spec.sourceApprovals };
  getApprovedClaims(story);
  validateCampaign(spec.sourceCampaign, story);
  const pages = spec.formats?.[format]?.pages;
  if (pages?.length !== FORMATS[format]) reject("Unexpected format page count");
  const palette = tokens(spec.tokens, availableFonts);
  const badgeText = brandProfile.logoText || brandProfile.brandName;
  const badgeFont = badgeText.includes("ॐ")
    ? registeredFont("Noto Sans Devanagari", availableFonts)
    : palette.body;
  if (
    badgeText.includes("ॐ") &&
    ![
      ...new Set(
        [...badgeText].map(
          (char) =>
            `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
        ),
      ),
    ].every((code) => badgeFont.verifiedCodepoints?.includes(code))
  )
    reject("Missing verified badge glyph coverage");
  const bindings = [];
  const document = {
    schemaVersion: 1,
    width: 1080,
    height: ["story", "reel"].includes(format) ? 1920 : 1350,
    unit: "px",
    pages: [],
  };
  for (const [index, page] of pages.entries()) {
    validateSourcePage(page, index, format, spec.sourceCampaign, brandProfile);
    const layers = page.layers;
    const get = (id) => layers.find((layer) => layer.id === id);
    if (
      !get("headline_layer") ||
      !get("brand_pill_badge") ||
      !get("subject_cutout_layer")
    )
      reject("Required stable layers missing");
    const objects = [
      {
        id: "subject_cutout_layer",
        type: "rect",
        name: "Missing subject asset · not a cutout",
        // Upstream renderableObjects omits unfilled placeholders from static/video output.
        // Keep this editing aid visible/selectable and serializable in the native canvas.
        isPlaceholder: true,
        originX: "center",
        originY: "center",
        left: 540,
        top: 105,
        width: 900,
        height: 90,
        fill: "transparent",
        stroke: palette.accent,
        strokeWidth: 2,
        strokeDashArray: [8, 8],
      },
      textbox(
        "brand_pill_badge",
        get("brand_pill_badge").text,
        210,
        28,
        900,
        palette.accent,
        badgeFont.family,
      ),
      textbox(
        "headline_layer",
        get("headline_layer").text,
        310,
        46,
        900,
        palette.text,
        palette.heading.family,
      ),
      ...[0, 1, 2].map((i) =>
        textbox(
          `metric_card_${i + 1}`,
          get(`metric_card_${i + 1}`)?.text || "",
          530 + i * 150,
          28,
          900,
          palette.text,
          palette.body.family,
        ),
      ),
      textbox(
        "source_context_layer",
        additionalCopy(format, spec.sourceCampaign[format], index),
        1000,
        24,
        900,
        palette.text,
        palette.body.family,
        230,
      ),
    ];
    const notes = JSON.stringify({
      sourcePagePath: page.semanticContent.sourcePagePath,
      semanticContent: page.semanticContent,
      sourceFieldMappings: page.sourceFieldMappings,
      ...(page.timecode ? { timecode: page.timecode } : {}),
    });
    if (notes.length > 5000)
      reject(
        "Native page notes exceed supported 5000-character limit; split content explicitly",
      );
    for (const object of objects)
      bindings.push({
        pageId: page.id,
        objectId: object.id,
        fill:
          object.id === "subject_cutout_layer"
            ? null
            : object.id === "brand_pill_badge"
              ? "accent"
              : "text",
        ...(object.id === "subject_cutout_layer"
          ? { stroke: "accent" }
          : {
              font:
                object.id === "headline_layer"
                  ? "heading"
                  : object.id === "brand_pill_badge"
                    ? "badge"
                    : "body",
            }),
      });
    document.pages.push({
      id: page.id,
      name: `${format} ${index + 1}`,
      background: { type: "solid", color: palette.background },
      objects,
      notes,
      ...(format === "reel"
        ? { durationSec: page.timecode.endSeconds - page.timecode.startSeconds }
        : {}),
    });
  }
  return {
    document,
    manifest: {
      adapter: "doory",
      nativeTarget: structuredClone(NATIVE_TARGETS.doory),
      scope: structuredClone(spec.scope),
      storyId: spec.storyId,
      storyRevision: spec.storyRevision,
      generationId: spec.generationId,
      brandRevision: spec.brandRevision,
      sourceCampaign: structuredClone(spec.sourceCampaign),
      sourceCampaignSha256: sha(spec.sourceCampaign),
      sourceApprovals: structuredClone(spec.sourceApprovals),
      fontProvenance: {
        heading: palette.heading,
        body: palette.body,
        badge: badgeFont,
      },
      layerTokenBindings: bindings,
      pageIds: document.pages.map((p) => p.id),
      limitations: [
        "missing_subject_asset",
        "no_background_removal",
        "no_curved_badge",
        "no_rendered_animation_or_media",
        "no_portable_asset_archive",
      ],
      documentSha256: sha(document),
      externalChanges: "proposal_requires_studio_review",
      finalSignoff: "not_granted",
    },
  };
}
/** Apply only registered token properties. Native human text, geometry, IDs and notes stay unchanged. */
export function applyDooryBrandTokens({
  document,
  manifest,
  tokens: nextTokens,
  expectedBrandRevision,
  brandRevision,
  availableFonts = [],
}) {
  if (
    manifest?.adapter !== "doory" ||
    manifest.brandRevision !== expectedBrandRevision ||
    !brandRevision ||
    !isDeepStrictEqual(manifest.nativeTarget, NATIVE_TARGETS.doory)
  )
    reject("Stale or unsupported token binding");
  if (manifest.sourceCampaignSha256 !== sha(manifest.sourceCampaign))
    reject("Source snapshot checksum mismatch");
  if (
    !isDeepStrictEqual(
      document.pages?.map((page) => page.id),
      manifest.pageIds,
    )
  )
    reject("Native page identity changed; reconcile explicitly");
  const palette = tokens(nextTokens, availableFonts);
  palette.badge = registeredFont(
    manifest.fontProvenance.badge.family,
    availableFonts,
  );
  for (const code of manifest.fontProvenance.badge.verifiedCodepoints || [])
    if (!palette.badge.verifiedCodepoints?.includes(code))
      reject("Missing verified badge glyph coverage");
  const copy = structuredClone(document);
  for (const page of copy.pages)
    page.background = { type: "solid", color: palette.background };
  for (const binding of manifest.layerTokenBindings) {
    const page = copy.pages.find((p) => p.id === binding.pageId);
    const matches = page.objects.filter((o) => o.id === binding.objectId);
    if (matches.length !== 1)
      reject("Native layer missing or duplicate; reconcile explicitly");
    const object = matches[0];
    if (binding.fill) object.fill = palette[binding.fill];
    if (binding.stroke) object.stroke = palette[binding.stroke];
    if (binding.font)
      object.fontFamily = `"${palette[binding.font].family}", sans-serif`;
  }
  return {
    document: copy,
    manifest: {
      ...structuredClone(manifest),
      brandRevision,
      fontProvenance: {
        heading: palette.heading,
        body: palette.body,
        badge: palette.badge,
      },
      documentSha256: sha(copy),
    },
  };
}
