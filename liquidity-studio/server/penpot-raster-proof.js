import { penpotActionDigest } from "./penpot-action-ledger.js";
import { fail } from "./auth.js";

function protectedValue(value) {
  if (Array.isArray(value)) return value.map(protectedValue);
  if (!value || typeof value !== "object") return value;
  // Native layout cache is renderer-owned; child lists legitimately gain the new
  // image. All existing shape content, font, transform and paint remain bound.
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !["positionData", "shapes"].includes(key))
      .map(([key, child]) => [key, protectedValue(child)]),
  );
}

export function penpotRasterProof(file, command, expected = null) {
  const page = file.data?.pagesIndex?.[command.pageId];
  const frame = page?.objects?.[command.frameId];
  if (
    !frame ||
    frame.type !== "frame" ||
    !Array.isArray(file.data.pages) ||
    ![frame.x, frame.y, frame.width, frame.height].every(Number.isFinite) ||
    frame.width <= 0 ||
    frame.height <= 0
  )
    throw fail(409, "Registered native image board unavailable");
  const { x, y, width, height } = command.placement;
  if (
    x < frame.x ||
    y < frame.y ||
    x + width > frame.x + frame.width ||
    y + height > frame.y + frame.height
  )
    throw fail(422, "Saved image placement must fit the registered board");
  const protectedObjects = {};
  protectedObjects["@page-order"] = penpotActionDigest(file.data.pages);
  for (const [pageId, entry] of Object.entries(file.data.pagesIndex)) {
    for (const [id, shape] of Object.entries(entry.objects || {}))
      protectedObjects[`${pageId}:${id}`] = penpotActionDigest(
        protectedValue(shape),
      );
  }
  if (!expected)
    return { protectedObjects, imageMatches: false, originalsPreserved: false };
  const matches = Object.values(page.objects).filter(
    (shape) => shape.name === `studio-private-raster:${expected.receiptId}`,
  );
  const shape = matches.length === 1 ? matches[0] : null;
  const image = shape?.fills?.[0]?.fillImage;
  const imageMatches = Boolean(
    shape &&
      shape.type === "rect" &&
      shape.parentId === command.frameId &&
      shape.frameId === command.frameId &&
      shape.fills.length === 1 &&
      shape.fills[0].fillOpacity === 1 &&
      image?.id === expected.media.id &&
      image.width === expected.media.width &&
      image.height === expected.media.height &&
      image.mtype === expected.media.mtype &&
      ["x", "y", "width", "height"].every(
        (key) =>
          Number.isFinite(shape[key]) &&
          Math.abs(shape[key] - command.placement[key]) <= 0.01,
      ),
  );
  const originalsPreserved = Boolean(
    expected.protectedObjects &&
      Object.keys(expected.protectedObjects).length > 0 &&
      Object.entries(expected.protectedObjects).every(
        ([key, hash]) => protectedObjects[key] === hash,
      ),
  );
  return {
    protectedObjects,
    imageMatches,
    originalsPreserved,
    nativeShapeId: imageMatches ? shape.id : null,
  };
}
