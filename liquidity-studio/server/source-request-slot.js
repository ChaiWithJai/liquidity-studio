import { performance } from "node:perf_hooks";
import { fail } from "./auth.js";
// One in-process queue, not a distributed/IP-wide rate-limit guarantee.
let queue = Promise.resolve(), lastStart = -Infinity;
function wait(promise, signal) {
  if (signal.aborted) return Promise.reject(fail(504, "Source retrieval cancelled"));
  return new Promise((resolve, reject) => {
    const abort = () => reject(fail(504, "Source retrieval cancelled"));
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}
export async function serialSourceRequest(signal, work) {
  const previous = queue;
  let release;
  queue = new Promise(resolve => { release = resolve; });
  try {
    await wait(previous, signal);
    while (1000 - (performance.now() - lastStart) > 0) {
      const delay = Math.ceil(1000 - (performance.now() - lastStart));
      let timer;
      try { await wait(new Promise(resolve => { timer = setTimeout(resolve, Math.max(1, delay)); }), signal); }
      finally { clearTimeout(timer); }
    }
    if (signal.aborted) throw fail(504, "Source retrieval cancelled");
    lastStart = performance.now();
    return await wait(Promise.resolve().then(work), signal);
  } finally {
    // An aborted queued request cannot release its successor ahead of the prior owner.
    previous.then(release, release);
  }
}
