import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { getApprovedClaims, validateCampaign } from "./source-integrity.js";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const ZERO = "00000000-0000-0000-0000-000000000000";
const MATRIX = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
const FORMATS = new Set(["infographic", "carousel", "story", "reel"]);
const SUPPORTED = new Set([
  "nativeText",
  "tokenBinding",
  "staticBoards",
  "nativeComponents",
]);
function reject(code) {
  throw new Error(code);
}
function uuid(seed) {
  const h = createHash("sha256").update(seed).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
function geometry(x, y, width, height) {
  return {
    x,
    y,
    width,
    height,
    rotation: 0,
    selrect: {
      x,
      y,
      width,
      height,
      x1: x,
      y1: y,
      x2: x + width,
      y2: y + height,
    },
    points: [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ],
    transform: { ...MATRIX },
    "transform-inverse": { ...MATRIX },
  };
}
function fontBinding(fonts, requested, weight) {
  // Brand fallback lists are explicit preference order, not arbitrary substitution.
  const family = requested
    .split("/")
    .map((x) => x.trim())
    .find((name) =>
      fonts.some((f) => f.family === name && f.weight === weight),
    );
  const binding = fonts.find((f) => f.family === family && f.weight === weight);
  if (
    !binding ||
    !binding.fontId?.startsWith("custom-") ||
    !UUID.test(binding.fontId.slice(7)) ||
    !binding.sha256?.match(/^[0-9a-f]{64}$/) ||
    binding.license !== "OFL-1.1"
  )
    reject("FONT_NOT_VERIFIED");
  return {
    family: binding.family,
    weight: binding.weight,
    fontId: binding.fontId,
    sha256: binding.sha256,
    license: binding.license,
  };
}
function textShape({
  id,
  name,
  text,
  x,
  y,
  width,
  height,
  font,
  size,
  weight,
  color,
  token,
  parent,
}) {
  const style = {
    "font-id": font.fontId,
    "font-family": font.family,
    "font-variant-id": `normal-${weight}`,
    "font-size": String(size),
    "font-weight": String(weight),
    "font-style": "normal",
    "line-height": "1.2",
    "text-align": "left",
    "text-direction": "ltr",
    "text-transform": "none",
    "text-decoration": "none",
    "letter-spacing": "0",
    fills: [{ "fill-color": color, "fill-opacity": 1 }],
  };
  return {
    id,
    name,
    type: "text",
    ...geometry(x, y, width, height),
    "parent-id": parent,
    "frame-id": parent,
    "grow-type": "fixed",
    "applied-tokens": { fill: token },
    content: {
      type: "root",
      children: [
        {
          type: "paragraph-set",
          children: [
            { type: "paragraph", ...style, children: [{ ...style, text }] },
          ],
        },
      ],
    },
  };
}
/** Pure native changes. Caller must authorize target file separately; document metadata grants nothing. */
export function compilePenpotNative(
  bundle,
  { fileId, fonts, requiredCapabilities = [] } = {},
) {
  if (bundle?.schemaVersion !== 1 || bundle.kind !== "multimodal-spec")
    reject("UNSUPPORTED_SCHEMA_VERSION");
  if (
    bundle.nativeTargets?.penpot?.editorVersion !== "2.18.3" ||
    bundle.nativeTargets.penpot.archiveVersion !== 1 ||
    bundle.nativeTargets.penpot.archiveType !== "penpot/export-files"
  )
    reject("UNSUPPORTED_NATIVE_VERSION");
  if (!UUID.test(fileId || "")) reject("INVALID_TARGET_FILE");
  if (!bundle.sourceCampaign) reject("MISSING_SOURCE_CAMPAIGN");
  if (
    !bundle.scope?.organizationId ||
    !bundle.scope?.brandId ||
    !bundle.generationId ||
    !bundle.brandRevision ||
    !bundle.sourceApprovals?.length
  )
    reject("MISSING_CONTRACT_PROVENANCE");
  const sourceStory = {
    id: bundle.storyId,
    sourceClaims: bundle.sourceApprovals,
  };
  getApprovedClaims(sourceStory);
  validateCampaign(bundle.sourceCampaign, sourceStory);
  if (bundle.sourceCampaign.provenance?.generationId !== bundle.generationId)
    reject("GENERATION_MISMATCH");
  if (
    bundle.tokens?.authority !== "studio" ||
    bundle.tokens.externalChanges !== "proposal_requires_studio_approval"
  )
    reject("INVALID_TOKEN_AUTHORITY");
  if (
    !Array.isArray(requiredCapabilities) ||
    requiredCapabilities.some((x) => !SUPPORTED.has(x))
  )
    reject("UNSUPPORTED_CAPABILITY");
  if (!Array.isArray(fonts)) reject("FONT_NOT_VERIFIED");
  const colors = bundle.tokens.colors;
  if (
    !Array.isArray(colors) ||
    colors.length !== 4 ||
    colors.some((c) => !/^#[0-9a-f]{6}$/i.test(c.hex) || !c.name)
  )
    reject("INVALID_BRAND_COLORS");
  const scope = `${bundle.scope.organizationId}/${bundle.scope.brandId}`;
  const seed = `${scope}/${bundle.storyId}/${bundle.generationId}`;
  const setId = uuid(`${scope}/tokens`),
    themeId = uuid(`${scope}/theme`);
  const tokens = colors.map((c, i) => ({
    id: uuid(`${scope}/color/${i}`),
    name: `studio.color${i}`,
    type: "color",
    value: c.hex.toLowerCase(),
  }));
  const changes = [
    { type: "set-token-set", id: setId, attrs: { id: setId, name: "Studio" } },
    ...tokens.map((t) => ({
      type: "set-token",
      "set-id": setId,
      "token-id": t.id,
      attrs: t,
    })),
    {
      type: "set-token-theme",
      id: themeId,
      attrs: { id: themeId, name: "Brand", group: "Studio", sets: ["Studio"] },
    },
    { type: "set-active-token-themes", "theme-paths": ["Studio/Brand"] },
  ];
  const headingWeight = bundle.tokens.fonts.heading.includes("Instrument Serif")
    ? 400
    : 700;
  const heading = fontBinding(
      fonts,
      bundle.tokens.fonts.heading,
      headingWeight,
    ),
    body = fontBinding(fonts, bundle.tokens.fonts.body, 400);
  const pages = [];
  for (const [format, spec] of Object.entries(bundle.formats || {})) {
    if (
      !FORMATS.has(format) ||
      !Array.isArray(spec.pages) ||
      spec.pages.length !== ({ carousel: 4, reel: 3 }[format] || 1)
    )
      reject("INVALID_FORMAT_PAGES");
    for (const page of spec.pages) {
      if (
        page.width !== 1080 ||
        page.height !== (["story", "reel"].includes(format) ? 1920 : 1350)
      )
        reject("INVALID_PAGE_DIMENSIONS");
      if (
        !Array.isArray(page.layers) ||
        page.layers.map((l) => l.id).join(",") !==
          "subject_cutout_layer,brand_pill_badge,headline_layer,metric_card_1,metric_card_2,metric_card_3"
      )
        reject("INVALID_LOGICAL_LAYERS");
      if (
        page.layers.some(
          (l) =>
            l.type === "text-proposal" &&
            (typeof l.text !== "string" || l.text.length > 5000),
        )
      )
        reject("INVALID_LAYER_TEXT");
      if (
        !page.semanticContent ||
        !isDeepStrictEqual(
          page.semanticContent.format,
          bundle.sourceCampaign[format],
        ) ||
        !Array.isArray(page.sourceFieldMappings)
      )
        reject("MISSING_SEMANTIC_CONTENT");
      if (format === "reel") {
        const expected = [
          [0, 3],
          [3, 15],
          [15, 30],
        ][pages.filter((p) => p.format === "reel").length];
        if (
          page.timecode?.startSeconds !== expected[0] ||
          page.timecode?.endSeconds !== expected[1]
        )
          reject("INVALID_REEL_TIMING");
      }
      const pageIndex = pages.filter((p) => p.format === format).length;
      const originalFormat = bundle.sourceCampaign[format];
      const originalPage =
        format === "carousel"
          ? originalFormat.slides[pageIndex]
          : format === "reel"
            ? originalFormat.beats[pageIndex]
            : originalFormat;
      if (!isDeepStrictEqual(page.semanticContent.page, originalPage))
        reject("SOURCE_PAGE_MISMATCH");
      const expectedHeadline =
        format === "infographic"
          ? originalPage.headline
          : format === "carousel"
            ? originalPage.title
            : format === "story"
              ? originalPage.hookBanner
              : originalPage.onScreenText;
      const expectedMetrics =
        format === "infographic"
          ? originalPage.statRows
          : format === "carousel"
            ? [originalPage.bodyMetric]
            : format === "story"
              ? [originalPage.keyStatHighlight]
              : [originalPage.voiceover];
      if (
        page.layers[2].text !== expectedHeadline ||
        [0, 1, 2].some(
          (i) => page.layers[i + 3].text !== (expectedMetrics[i] || ""),
        )
      )
        reject("SOURCE_LAYER_MISMATCH");
      const pageId = uuid(`${seed}/${page.id}`),
        frameId = uuid(`${seed}/${page.id}/frame`),
        componentId = uuid(`${seed}/${page.id}/component`);
      const name = `${format} ${pages.filter((p) => p.format === format).length + 1}${page.timecode ? ` [${page.timecode.startSeconds}-${page.timecode.endSeconds}s board]` : ""}`;
      changes.push({ type: "add-page", id: pageId, name });
      const frame = {
        id: frameId,
        name,
        type: "frame",
        ...geometry(0, 0, page.width, page.height),
        "parent-id": ZERO,
        "frame-id": ZERO,
        fills: [{ "fill-color": tokens[0].value, "fill-opacity": 1 }],
        strokes: [],
        shapes: [],
        "applied-tokens": { fill: tokens[0].name },
        "plugin-data": {
          studio: {
            "semantic-content": JSON.stringify(page.semanticContent),
            "source-field-mappings": JSON.stringify(page.sourceFieldMappings),
            "source-campaign": JSON.stringify(bundle.sourceCampaign),
            "brand-revision": bundle.brandRevision,
            "generation-id": bundle.generationId,
          },
        },
        "component-id": componentId,
        "component-file": fileId,
        "component-root": true,
        "main-instance": true,
        "show-content": false,
      };
      changes.push({
        type: "add-obj",
        id: frameId,
        "page-id": pageId,
        "frame-id": ZERO,
        "parent-id": ZERO,
        obj: frame,
      });
      const layers = [];
      for (const [index, layer] of page.layers.entries()) {
        const id = uuid(`${seed}/${page.id}/${layer.id}`);
        layers.push({ logicalId: layer.id, nativeId: id });
        let shape;
        if (index === 0) {
          if (layer.assetId !== null) reject("ASSET_IMPORT_UNSUPPORTED");
          shape = {
            id,
            name: "subject_cutout_layer (unexecuted placeholder)",
            type: "rect",
            ...geometry(900, 60, 80, 80),
            "parent-id": frameId,
            "frame-id": frameId,
            fills: [],
            strokes: [],
            opacity: 0,
          };
        } else {
          const headline = index === 2,
            font = headline ? heading : body,
            weight = headline ? headingWeight : 400;
          shape = textShape({
            id,
            name: layer.id,
            text: layer.text,
            x: 80,
            y: index === 1 ? 70 : index === 2 ? 200 : 540 + (index - 3) * 220,
            width: 920,
            height: headline ? 280 : 180,
            font,
            size: headline ? 56 : index === 1 ? 24 : 32,
            weight,
            color: tokens[index === 1 ? 1 : 3].value,
            token: tokens[index === 1 ? 1 : 3].name,
            parent: frameId,
          });
        }
        changes.push({
          type: "add-obj",
          id,
          "page-id": pageId,
          "frame-id": frameId,
          "parent-id": frameId,
          obj: shape,
        });
      }
      const supplemental =
        format === "infographic"
          ? page.semanticContent.page.bottomTakeaway
          : format === "story"
            ? page.semanticContent.page.interactiveStickerPrompt
            : format === "reel"
              ? [
                  page.semanticContent.format.spokenHook0to3s,
                  page.semanticContent.format.closingCta,
                ]
                  .filter(Boolean)
                  .join(" | ")
              : "";
      if (supplemental) {
        const id = uuid(`${seed}/${page.id}/supplemental_copy`);
        const shape = textShape({
          id,
          name: "supplemental_copy",
          text: supplemental,
          x: 80,
          y: page.height - 160,
          width: 920,
          height: 130,
          font: body,
          size: 24,
          weight: 400,
          color: tokens[2].value,
          token: tokens[2].name,
          parent: frameId,
        });
        changes.push({
          type: "add-obj",
          id,
          "page-id": pageId,
          "frame-id": frameId,
          "parent-id": frameId,
          obj: shape,
        });
        layers.push({ logicalId: "supplemental_copy", nativeId: id });
      }
      changes.push({
        type: "add-component",
        id: componentId,
        name,
        path: "Studio",
        "main-instance-id": frameId,
        "main-instance-page": pageId,
      });
      pages.push({
        id: pageId,
        frameId,
        componentId,
        format,
        width: page.width,
        height: page.height,
        layers,
        timecode: page.timecode || null,
      });
    }
  }
  if (!pages.length) reject("INVALID_FORMAT_PAGES");
  return {
    nativeTarget: {
      editorVersion: "2.18.3",
      archiveType: "penpot/export-files",
      archiveVersion: 1,
    },
    fileId,
    pages,
    changes,
    provenance: {
      scope: structuredClone(bundle.scope),
      storyId: bundle.storyId,
      storyRevision: bundle.storyRevision,
      generationId: bundle.generationId,
      brandRevision: bundle.brandRevision,
      sourceApprovals: structuredClone(bundle.sourceApprovals),
      sourceCampaign: structuredClone(bundle.sourceCampaign),
    },
    capabilities: {
      nativeText: true,
      tokenBinding: true,
      nativeComponents: true,
      staticBoards: true,
      cutout: false,
      curvedText: false,
      animation: false,
      video: false,
    },
    limitations: [
      "Subject cutout is an invisible unexecuted placeholder.",
      "Badge is native straight text; curved text proposal is not executed.",
      "Reel pages are static timecoded boards, not rendered video.",
    ],
    fontBindings: [heading, body],
  };
}
