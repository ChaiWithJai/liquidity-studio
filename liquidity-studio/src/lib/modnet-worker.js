// Original Studio worker. This file is reachable only from the held local editor
// build, never from the default application bundle.
import * as ort from "onnxruntime-web/wasm";
import wasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";
import {
  prepareModnetInput,
  applyModnetMatte,
  MODNET_MODEL_SHA256,
} from "./modnet-processor.js";
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;
ort.env.wasm.wasmPaths = { wasm: wasmUrl };
let session;
self.onmessage = async ({ data }) => {
  const { id, image, model } = data;
  try {
    if (!(image instanceof Blob) || !(model instanceof Uint8Array))
      throw new Error("Invalid worker input.");
    if (!session) {
      const hash = [
        ...new Uint8Array(await crypto.subtle.digest("SHA-256", model)),
      ]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("");
      if (hash !== MODNET_MODEL_SHA256)
        throw new Error("Model integrity check failed.");
      session = await ort.InferenceSession.create(model, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
    }
    const bitmap = await createImageBitmap(image, {
      premultiplyAlpha: "none",
      colorSpaceConversion: "none",
    });
    let rgba, width, height;
    try {
      width = bitmap.width;
      height = bitmap.height;
      // Validate dimensions before allocating the original raster.
      const { modelDimensions } = await import("./modnet-processor.js");
      modelDimensions(width, height);
      const canvas = new OffscreenCanvas(width, height),
        context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(bitmap, 0, 0);
      rgba = context.getImageData(0, 0, width, height).data;
    } finally {
      bitmap.close();
    }
    const input = prepareModnetInput(rgba, width, height);
    self.postMessage({ id, type: "progress", percent: 30 });
    const result = await session.run({
      [session.inputNames[0]]: new ort.Tensor(
        "float32",
        input.data,
        input.dims,
      ),
    });
    const output = result[session.outputNames[0]];
    if (
      output.dims.length !== 4 ||
      output.dims[0] !== 1 ||
      output.dims[1] !== 1 ||
      output.dims[2] !== input.dims[2] ||
      output.dims[3] !== input.dims[3]
    )
      throw new Error("Unexpected model output.");
    const processed = applyModnetMatte(
      rgba,
      width,
      height,
      output.data,
      input.dims[3],
      input.dims[2],
    );
    const canvas = new OffscreenCanvas(width, height);
    canvas
      .getContext("2d")
      .putImageData(new ImageData(processed, width, height), 0, 0);
    const png = await canvas.convertToBlob({ type: "image/png" });
    if (png.size > 512 * 1024) {
      self.postMessage({ id, type: "error", code: "OUTPUT_TOO_LARGE" });
      return;
    }
    self.postMessage({ id, type: "progress", percent: 100 });
    self.postMessage({ id, type: "result", image: png });
  } catch {
    self.postMessage({ id, type: "error", code: "PROCESSING_FAILED" });
  }
};
