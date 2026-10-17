// Shared computation over browser-measured rectangles, not a platform certification.
const formats = new Set(["infographic", "carousel", "story", "reel"]);
function colorLuminance(hex) {
  if (typeof hex !== "string" || !/^#[0-9a-f]{6}$/i.test(hex)) return null;
  const [r, g, b] = hex
    .slice(1)
    .match(/.{2}/g)
    .map((value) => {
      const channel = parseInt(value, 16) / 255;
      return channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function computePreflight({
  format,
  canvas,
  textBoxes = [],
  obstructionBoxes = [],
  foreground,
  background,
  caption = "",
  captionLimit = 125,
}) {
  if (
    !formats.has(format) ||
    !canvas ||
    !Number.isFinite(canvas.width) ||
    !Number.isFinite(canvas.height) ||
    canvas.width <= 0 ||
    canvas.height <= 0 ||
    canvas.width > 10000 ||
    canvas.height > 10000
  )
    throw new Error("Invalid preflight canvas or format");
  if (
    !Array.isArray(textBoxes) ||
    textBoxes.length > 2000 ||
    textBoxes.some(
      (box) =>
        !box ||
        ["x", "y", "width", "height"].some(
          (key) => !Number.isFinite(box[key]),
        ) ||
        box.width < 0 ||
        box.height < 0,
    )
  )
    throw new Error("Invalid preflight text rectangles");
  if (
    !Array.isArray(obstructionBoxes) ||
    obstructionBoxes.length > 40 ||
    obstructionBoxes.some(
      (box) =>
        !box ||
        ["x", "y", "width", "height"].some(
          (key) => !Number.isFinite(box[key]),
        ) ||
        box.width < 0 ||
        box.height < 0,
    )
  )
    throw new Error("Invalid preflight obstruction rectangles");
  if (
    typeof caption !== "string" ||
    caption.length > 20000 ||
    !Number.isInteger(captionLimit) ||
    captionLimit < 40 ||
    captionLimit > 500
  )
    throw new Error("Invalid preflight caption settings");
  const { width, height } = canvas;
  const vertical = format === "story" || format === "reel";
  const zones = vertical
    ? [
        { x: 0, y: 0, width, height: height * 0.14 },
        { x: 0, y: height * 0.82, width, height: height * 0.18 },
        ...(format === "reel"
          ? [{ x: width * 0.82, y: 0, width: width * 0.18, height }]
          : []),
      ]
    : [];
  const occludedElementsCount = textBoxes.filter((box) =>
    [...zones, ...obstructionBoxes].some(
      (zone) =>
        box.x < zone.x + zone.width &&
        box.x + box.width > zone.x &&
        box.y < zone.y + zone.height &&
        box.y + box.height > zone.y,
    ),
  ).length;
  const overflowElementsCount = textBoxes.filter(
    (box) =>
      box.x < -1 ||
      box.y < -1 ||
      box.x + box.width > width + 1 ||
      box.y + box.height > height + 1,
  ).length;
  const base = colorLuminance(background);
  const contrasts = textBoxes
    .map((box) => colorLuminance(box.foreground || foreground))
    .filter((value) => value !== null)
    .map((value) =>
      base === null
        ? null
        : (Math.max(value, base) + 0.05) / (Math.min(value, base) + 0.05),
    )
    .filter((value) => value !== null);
  const unmeasuredColorCount = textBoxes.filter(
    (box) =>
      colorLuminance(box.foreground || foreground) === null || base === null,
  ).length;
  const contrastRatio = contrasts.length
    ? Math.round(Math.min(...contrasts) * 100) / 100
    : null;
  const firstLookCharacters = Math.min(captionLimit, caption.length);
  const firstLookContainsHardNumber = /\$\d|\d%/.test(
    caption.slice(0, captionLimit),
  );
  const measurable = textBoxes.length > 0;
  const expectedRatio = vertical ? 9 / 16 : 4 / 5;
  const actualRatio = width / height;
  const aspectRatioDeviation =
    Math.abs(actualRatio - expectedRatio) / expectedRatio;
  const metrics = {
    obstructionElementsCount: obstructionBoxes.length,
    unmeasuredColorCount,
    expectedAspectRatio: vertical ? "9:16" : "4:5",
    actualAspectRatio: Math.round(actualRatio * 10000) / 10000,
    aspectRatioDeviation,
    artworkWidth: width,
    artworkHeight: height,
    textElementsCount: textBoxes.length,
    occludedElementsCount,
    overflowElementsCount,
    contrastRatio,
    captionCharacters: caption.length,
    firstLookCharacters,
    firstLookContainsHardNumber,
    safeZoneRegions: {
      top: vertical ? 0.14 : 0,
      bottom: vertical ? 0.18 : 0,
      right: format === "reel" ? 0.18 : 0,
    },
  };
  return {
    simulation: true,
    measurementMethod: "client-svg-text-rectangles",
    requiresReview: true,
    metrics,
    checks: [
      {
        id: "aspect-ratio",
        status: aspectRatioDeviation <= 0.01 ? "pass" : "warning",
        measured: actualRatio,
        limit: expectedRatio,
        message:
          "Rendered artwork ratio compared with the intended 4:5 or 9:16 export; 1% layout tolerance.",
      },
      {
        id: "safe-zones",
        status: measurable
          ? occludedElementsCount
            ? "warning"
            : "pass"
          : "unmeasured",
        measured: measurable ? occludedElementsCount : null,
        limit: 0,
        message:
          "Text rectangles intersecting measured native chrome/stickers or approximate chrome zones; actual Instagram layout can vary.",
      },
      {
        id: "artwork-overflow",
        status: measurable
          ? overflowElementsCount
            ? "warning"
            : "pass"
          : "unmeasured",
        measured: measurable ? overflowElementsCount : null,
        limit: 0,
        message: "Text rectangles outside the rendered artwork.",
      },
      {
        id: "contrast",
        status:
          contrastRatio === null || unmeasuredColorCount > 0
            ? "unmeasured"
            : contrastRatio >= 4.5
              ? "pass"
              : "warning",
        measured: contrastRatio,
        limit: 4.5,
        message:
          "Minimum text fill contrast against the supplied base background, without image/gradient analysis.",
      },
      {
        id: "caption-fold",
        status: caption.length > captionLimit ? "warning" : "pass",
        measured: caption.length,
        limit: captionLimit,
        message:
          "Configurable approximate caption fold; not an official platform guarantee.",
      },
    ],
  };
}
