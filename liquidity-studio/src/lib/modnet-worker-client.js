/** One inference at a time. Aborting terminates this owned worker, including an
 * executing WASM kernel; late events cannot publish a result into a new job. */
export function createModnetWorkerClient({
  createWorker,
  loadModel,
  timeoutMs = 60_000,
}) {
  let worker = null,
    pending = null,
    disposed = false;
  let sequence = 0;
  function finish(error, value, terminate = false) {
    const job = pending;
    if (!job) return;
    pending = null;
    clearTimeout(job.timer);
    job.signal?.removeEventListener("abort", job.abort);
    if (terminate) {
      worker?.terminate();
      worker = null;
    }
    if (error) job.reject(error);
    else job.resolve(value);
  }
  function abortError() {
    return new DOMException("Background removal canceled.", "AbortError");
  }
  return {
    async remove(image, onProgress = () => {}, signal) {
      if (disposed) throw new Error("Background remover is closed.");
      if (signal?.aborted) throw abortError();
      if (pending)
        throw new Error(
          "Finish or cancel the current background removal first.",
        );
      const id = ++sequence;
      return new Promise((resolve, reject) => {
        const abort = () => finish(abortError(), null, true);
        pending = {
          id,
          resolve,
          reject,
          signal,
          abort,
          timer: setTimeout(
            () =>
              finish(
                new Error(
                  "Background removal timed out; the original image is unchanged.",
                ),
                null,
                true,
              ),
            timeoutMs,
          ),
        };
        signal?.addEventListener("abort", abort, { once: true });
        (async () => {
          try {
            onProgress("downloading", 0);
            const model = await loadModel(signal);
            if (!pending || pending.id !== id) return;
            onProgress("downloading", 100);
            worker ||= createWorker();
            const owned = worker;
            owned.onmessage = ({ data }) => {
              if (owned !== worker || pending?.id !== id || data?.id !== id)
                return;
              if (data.type === "progress")
                onProgress("processing", data.percent);
              else if (data.type === "result") finish(null, data.image);
              else if (data.type === "error")
                finish(
                  new Error(
                    "Background removal failed; the original image is unchanged.",
                  ),
                  null,
                  true,
                );
            };
            owned.onerror = () => {
              if (owned === worker && pending?.id === id)
                finish(
                  new Error("Background removal worker failed."),
                  null,
                  true,
                );
            };
            owned.postMessage({ id, image, model });
          } catch (error) {
            if (pending?.id === id) finish(error, null, true);
          }
        })();
      });
    },
    dispose() {
      disposed = true;
      if (pending) finish(abortError(), null, true);
      worker?.terminate();
      worker = null;
    },
  };
}
