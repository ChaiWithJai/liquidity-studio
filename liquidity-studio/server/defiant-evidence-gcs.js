/** A server-owned bucket is injected; callers cannot select buckets or credentials. */
export function createDefiantGcsOpener({bucket, timeoutMs = 15000} = {}) {
  if (typeof bucket?.file !== 'function' || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw new TypeError('Bounded GCS reader required');
  return async pinned => {
    if (!pinned || typeof pinned.key !== 'string' || !pinned.key || /[\x00-\x1f\x7f]/.test(pinned.key) || typeof pinned.generation !== 'string' || !/^[1-9]\d{0,29}$/.test(pinned.generation)) throw new TypeError('Pinned object required');
    // The SDK scopes the media request to this generation; never fall back to latest.
    const file = bucket.file(pinned.key, {generation: pinned.generation});
    const stream = file.createReadStream({validation: 'crc32c', decompress: false});
    const timer = setTimeout(() => stream.destroy(new Error('Evidence read deadline exceeded')), timeoutMs);
    const clear = () => clearTimeout(timer);
    stream.once('close', clear); stream.once('end', clear); stream.once('error', clear);
    return {generation: pinned.generation, stream};
  };
}
