import ModnetWorker from "./modnet-worker.js?worker";
import { createModnetWorkerClient } from "./modnet-worker-client.js";
import { createModnetModelLoader } from "./modnet-model-cache.js";
/** Original integration through the exported upstream EditorEngine context and
 * BackgroundRemover seam. No copied engine implementation or private ref access. */
export function createNativeCutoutRemover({
  request,
  adapter,
  getEngine,
  onStatus = () => {},
}) {
  let reportDownload = () => {};
  const loadModel = createModnetModelLoader({
    request,
    onProgress: (percent) => reportDownload("downloading", percent),
  });
  const client = createModnetWorkerClient({
    createWorker: () => new ModnetWorker(),
    loadModel,
  });
  let disposed = false;
  return {
    async remove(image, onProgress, signal) {
      if (disposed) throw Error("Background remover is closed.");
      reportDownload = onProgress || (() => {});
      onStatus("Preparing the selected private image for background removal.");
      const engine = getEngine();
      const selected = () => engine?.activeView()?.selectedObjects()[0];
      const object = selected(),
        assetId = object?.get("assetId");
      if (object?.type !== "image" || !assetId) {
        onStatus(
          "Select a saved private Studio image before background removal.",
        );
        throw Error("Select a private Studio image.");
      }
      const controller = new AbortController();
      const abort = () => controller.abort();
      signal?.addEventListener("abort", abort, { once: true });
      if (signal?.aborted) controller.abort();
      const valid = () =>
        !disposed && selected() === object && object.get("assetId") === assetId;
      const off = engine.store.subscribe(() => {
        if (!valid()) controller.abort();
      });
      try {
        // Use the supported engine persistence command; the server will only issue
        // an intent for the exact image already present in the saved native record.
        const retained = adapter.getCutoutRetry(assetId);
        if (retained) {
          onStatus(
            "Retrying the same uncertain cutout upload; no new inference.",
          );
          return retained;
        }
        await engine.persistence.saveNow();
        if (controller.signal.aborted || !valid())
          throw new DOMException("Canceled.", "AbortError");
        const intent = await adapter.prepareCutout(image, assetId);
        if (controller.signal.aborted || !valid())
          throw new DOMException("Canceled.", "AbortError");
        onStatus(
          "Removing the background without changing the original pixel dimensions.",
        );
        const output = await client.remove(
          image,
          onProgress,
          controller.signal,
        );
        if (controller.signal.aborted || !valid())
          throw new DOMException("Canceled.", "AbortError");
        adapter.retainCutoutOutput(output, intent);
        onStatus(
          "Cutout ready. Review the result; Undo restores the original image.",
        );
        return output;
      } catch (error) {
        onStatus(
          error?.name === "AbortError"
            ? "Background removal canceled; original image unchanged."
            : error.message ||
                "Background removal failed; original image unchanged.",
        );
        throw error;
      } finally {
        off();
        signal?.removeEventListener("abort", abort);
      }
    },
    dispose() {
      disposed = true;
      client.dispose();
    },
  };
}
