/** Original Studio processor for the pinned MODNet ONNX contract.
 * Reference: ZHKKKe/MODNet 28165a4, onnx/inference_onnx.py.
 * This module contains no model bytes or upstream implementation.
 */
export {
  MODNET_PROCESSOR_VERSION,
  MODNET_MODEL_SHA256,
  MODNET_MODEL_BYTES,
  MODNET_MODEL_CHUNK_SIZE,
  MODNET_MODEL_CHUNKS,
} from "../../server/native-cutout-contract.js";

export function modelDimensions(width, height) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 32 ||
    height < 32 ||
    width * height > 4_000_000 ||
    Math.max(width, height) / Math.min(width, height) > 2
  ) {
    throw new Error(
      "Use an image of at least 32 pixels per side, at most 4 megapixels, and an aspect ratio no greater than 2:1.",
    );
  }
  let w = width,
    h = height;
  if (Math.max(w, h) < 512 || Math.min(w, h) > 512) {
    if (w >= h) {
      w = Math.floor((w / h) * 512);
      h = 512;
    } else {
      h = Math.floor((h / w) * 512);
      w = 512;
    }
  }
  return { width: w - (w % 32), height: h - (h % 32) };
}

// Integrate fractional source-pixel coverage instead of interpolating normalized
// values with the browser's unspecified image smoothing implementation.
export function resizeArea(
  input,
  width,
  height,
  outWidth,
  outHeight,
  channels = 1,
) {
  if (input.length !== width * height * channels)
    throw new Error("Invalid raster length.");
  const output = new Float64Array(outWidth * outHeight * channels);
  const sx = width / outWidth,
    sy = height / outHeight;
  for (let y = 0; y < outHeight; y++) {
    const top = y * sy,
      bottom = (y + 1) * sy;
    for (let x = 0; x < outWidth; x++) {
      const left = x * sx,
        right = (x + 1) * sx;
      for (let iy = Math.floor(top); iy < Math.ceil(bottom); iy++) {
        const wy = Math.min(bottom, iy + 1) - Math.max(top, iy);
        for (let ix = Math.floor(left); ix < Math.ceil(right); ix++) {
          const weight =
            (wy * (Math.min(right, ix + 1) - Math.max(left, ix))) / (sx * sy);
          for (let c = 0; c < channels; c++)
            output[(y * outWidth + x) * channels + c] +=
              input[(iy * width + ix) * channels + c] * weight;
        }
      }
    }
  }
  return output;
}

export function prepareModnetInput(rgba, width, height) {
  const shape = modelDimensions(width, height);
  if (
    !(rgba instanceof Uint8Array || rgba instanceof Uint8ClampedArray) ||
    rgba.length !== width * height * 4
  )
    throw new Error("Invalid RGBA image.");
  const rgb = new Float64Array(width * height * 3);
  for (let p = 0; p < width * height; p++)
    for (let c = 0; c < 3; c++)
      rgb[p * 3 + c] = (rgba[p * 4 + c] - 127.5) / 127.5;
  const resized = resizeArea(rgb, width, height, shape.width, shape.height, 3);
  const size = shape.width * shape.height;
  const data = new Float32Array(size * 3);
  for (let p = 0; p < size; p++)
    for (let c = 0; c < 3; c++) data[c * size + p] = resized[p * 3 + c];
  return { data, dims: [1, 3, shape.height, shape.width] };
}

export function applyModnetMatte(
  rgba,
  width,
  height,
  matte,
  matteWidth,
  matteHeight,
) {
  if (
    rgba.length !== width * height * 4 ||
    matte.length !== matteWidth * matteHeight
  )
    throw new Error("Invalid matte dimensions.");
  const quantized = new Uint8Array(matte.length);
  for (let i = 0; i < matte.length; i++) {
    if (!Number.isFinite(matte[i]) || matte[i] < 0 || matte[i] > 1)
      throw new Error("Invalid model alpha output.");
    quantized[i] = Math.trunc(matte[i] * 255);
  }
  const resized = resizeArea(quantized, matteWidth, matteHeight, width, height);
  const output = new Uint8ClampedArray(rgba);
  for (let i = 0; i < width * height; i++)
    output[i * 4 + 3] = Math.min(output[i * 4 + 3], Math.round(resized[i]));
  return output;
}
