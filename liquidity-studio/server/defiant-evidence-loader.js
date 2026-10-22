import {createHash} from 'node:crypto';
const unavailable = () => Object.assign(new Error('Evidence artifact unavailable'), {status: 503});
/** openObject is server-owned and must open the exact generation, never latest. */
export function createDefiantEvidenceLoader({organizationId, object, openObject} = {}) {
  if (typeof organizationId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(organizationId) || typeof openObject !== 'function' || !object || typeof object.key !== 'string' || !object.key || object.key.length > 1000 || typeof object.generation !== 'string' || !/^[1-9]\d{0,29}$/.test(object.generation) || typeof object.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(object.sha256) || !Number.isSafeInteger(object.bytes) || object.bytes < 1 || object.bytes > 8 * 1024 * 1024) throw new TypeError('Pinned bounded evidence artifact required');
  const pinned = Object.freeze({key: object.key, generation: object.generation, sha256: object.sha256, bytes: object.bytes});
  return async scope => {
    if (scope?.organizationId !== organizationId) throw unavailable();
    let stream;
    try {
      const opened = await openObject(pinned);
      stream = opened?.stream;
      if (opened?.generation !== pinned.generation || !stream?.[Symbol.asyncIterator]) throw unavailable();
      const chunks = []; const digest = createHash('sha256'); let size = 0;
      for await (const chunk of stream) {
        if (!(chunk instanceof Uint8Array)) throw unavailable();
        size += chunk.byteLength;
        if (size > pinned.bytes) throw unavailable();
        const copy = Buffer.from(chunk); chunks.push(copy); digest.update(copy);
      }
      if (size !== pinned.bytes || digest.digest('hex') !== pinned.sha256) throw unavailable();
      const text = new TextDecoder('utf-8', {fatal: true}).decode(Buffer.concat(chunks, size));
      const snapshot = JSON.parse(text);
      if (!snapshot || snapshot.organizationId !== organizationId) throw unavailable();
      return snapshot;
    } catch { throw unavailable(); }
    finally { if (typeof stream?.destroy === 'function') stream.destroy(); }
  };
}
