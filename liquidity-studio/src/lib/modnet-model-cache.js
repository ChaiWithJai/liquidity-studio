import { MODNET_MODEL_SHA256, MODNET_MODEL_BYTES, MODNET_MODEL_CHUNK_SIZE, MODNET_MODEL_CHUNKS } from "./modnet-processor.js";
const SIZE = MODNET_MODEL_BYTES;
const CACHE_NAME = "studio-modnet-fp32-v1";
const CACHE_KEY = `/__studio_owned_model_cache__/${MODNET_MODEL_SHA256}`;
async function valid(bytes) {
  if (bytes.byteLength !== SIZE) return false;
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
  return hash === MODNET_MODEL_SHA256;
}
/** No network URL. Every chunk comes from the captured authenticated broker;
 * origin-local cache bytes are untrusted until the entire digest is verified. */
export function createModnetModelLoader({
  request,
  cacheStorage = globalThis.caches,
  onProgress = () => {},
}) {
  let memory = null;
  function check(signal) {
    if (signal?.aborted) throw new DOMException("Canceled.", "AbortError");
  }
  return async function load(signal) {
    check(signal);
    // Recheck authorization even when the immutable checkpoint is cached.
    const manifest = await request("/api/studio/native-editor/cutout/model");
    check(signal);
    if (
      manifest.sha256 !== MODNET_MODEL_SHA256 ||
      manifest.size !== SIZE ||
      manifest.chunkSize !== MODNET_MODEL_CHUNK_SIZE ||
      manifest.chunks !== MODNET_MODEL_CHUNKS
    )
      throw Error("Background-removal model configuration is invalid.");
    if (memory) return memory;
    let cache, cachedBytes;
    // Storage availability is optional, but authorization and whole-model
    // integrity are mandatory. A blocked cache never selects another origin.
    try {
      cache = await cacheStorage?.open(CACHE_NAME);
      const hit = await cache?.match(CACHE_KEY);
      if (hit) cachedBytes = new Uint8Array(await hit.arrayBuffer());
    } catch {}
    check(signal);
    if (cachedBytes) {
      if (await valid(cachedBytes)) {
        check(signal);
        memory = cachedBytes;
        return cachedBytes;
      }
      try {
        await cache?.delete(CACHE_KEY);
      } catch {}
      check(signal);
    }
    const bytes = new Uint8Array(SIZE);
    for (let index = 0; index < manifest.chunks; index++) {
      check(signal);
      const chunk = await request(
        `/api/studio/native-editor/cutout/model/${index}`,
      );
      check(signal);
      if (
        chunk.index !== index ||
        chunk.sha256 !== MODNET_MODEL_SHA256 ||
        typeof chunk.base64 !== "string" ||
        chunk.base64.length > 350_000
      )
        throw Error("Invalid model chunk.");
      const value = Uint8Array.from(atob(chunk.base64), (c) => c.charCodeAt(0));
      if (
        value.length !==
        Math.min(manifest.chunkSize, SIZE - index * manifest.chunkSize)
      )
        throw Error("Invalid model chunk size.");
      bytes.set(value, index * manifest.chunkSize);
      onProgress(Math.round(((index + 1) / manifest.chunks) * 100));
    }
    if (!(await valid(bytes)))
      throw Error("Background-removal model integrity check failed.");
    check(signal);
    // Cache persistence is optional; unavailable/full storage must not corrupt the
    // verified in-memory checkpoint or turn into an unrelated network fallback.
    try {
      await cache?.put(CACHE_KEY, new Response(bytes));
    } catch {}
    check(signal);
    memory = bytes;
    return bytes;
  };
}
