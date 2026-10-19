import {timingSafeEqual} from 'node:crypto';

const routes = new Set(['/api/native/penpot/access/admission', '/api/native/penpot/access/reconciliation']);
const failure = (status, message) => Object.assign(new Error(message), {status, safe: true});
function jsonObject(bytes) {
  let value;
  try { value = JSON.parse(bytes.toString('utf8')); } catch { throw failure(400, 'A JSON object is required'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw failure(400, 'A JSON object is required');
  return value;
}
function readBody(req, signal) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    const cleanup = () => { req.off('data', data); req.off('end', end); req.off('error', error); req.off('aborted', aborted); signal.removeEventListener('abort', aborted); };
    const error = cause => { cleanup(); req.pause(); reject(cause?.safe ? cause : failure(400, 'Native authority request was interrupted')); };
    const aborted = () => error(failure(504, 'Native authority request timed out'));
    const data = chunk => { size += chunk.length; if (size > 4096) error(failure(413, 'Native authority request is too large')); else chunks.push(chunk); };
    const end = () => { cleanup(); resolve(Buffer.concat(chunks)); };
    req.on('data', data); req.once('end', end); req.once('error', error); req.once('aborted', aborted); signal.addEventListener('abort', aborted, {once: true});
    if (signal.aborted) aborted();
  });
}

/** Fixed local native→Studio authority transport, not an RPC/WS relay. */
export function createPenpotNativeAccessForwarder({studioOrigin, grantKey, authorityTimeoutMs = 800, fetchImpl = fetch} = {}) {
  if(![800,2500].includes(authorityTimeoutMs))throw Error('Fixed native authority timeout required');
  const studio = new URL(studioOrigin);
  if (!(studio.protocol === 'https:' || (studio.protocol === 'http:' && ['127.0.0.1','localhost'].includes(studio.hostname))) || studio.origin !== studioOrigin || studio.username || studio.password || studio.pathname !== '/' || studio.search || studio.hash || (studio.protocol==='http:'&&(!Number.isInteger(Number(studio.port)) || Number(studio.port) < 1024 || Number(studio.port) > 65535)) || !/^[A-Za-z0-9_-]{43}$/.test(grantKey || '') || typeof fetchImpl !== 'function') throw Error('Fixed private local authority configuration required');
  const expected = Buffer.from(grantKey);
  return async (req, res) => {
    if (!req.url?.startsWith('/api/native/penpot/access/')) return false;
    const reply = (status, bytes) => { res.writeHead(status, {'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Connection': 'close'}); res.end(bytes); };
    let timer; const controller = new AbortController();
    try {
      const actual = req.headers['x-studio-native-grant-key'];
      if (typeof actual !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(actual) || !timingSafeEqual(Buffer.from(actual), expected)) throw failure(403, 'Private native authority key required');
      if (!routes.has(req.url)) throw failure(404, 'Native authority route not found');
      if (req.method !== 'POST') throw failure(405, 'Native authority POST required');
      if (req.headers['content-type'] !== 'application/json') throw failure(415, 'Native authority JSON required');
      if (req.headers['content-length'] && (!/^\d+$/.test(req.headers['content-length']) || Number(req.headers['content-length']) > 4096)) throw failure(413, 'Native authority request is too large');
      const deadline = new Promise((_, reject) => { timer = setTimeout(() => { reject(failure(504, 'Native authority request timed out')); controller.abort(); }, authorityTimeoutMs); });
      const operation = (async () => {
        const body = await readBody(req, controller.signal); jsonObject(body);
        const response = await fetchImpl(studioOrigin + req.url, {method: 'POST', redirect: 'error', signal: controller.signal,
          headers: {'Content-Type': 'application/json', Accept: 'application/json', 'X-Studio-Native-Grant-Key': grantKey}, body});
        if (controller.signal.aborted) { try { await response.body?.cancel(); } catch {} throw failure(504, 'Native authority request timed out'); }
        if (response.status < 200 || response.status >= 600 || (response.status >= 300 && response.status < 400)) throw failure(502, 'Studio authority response was rejected');
        let size = 0; const chunks = [];
        if (!response.body) throw failure(502, 'Studio authority response was empty');
        const reader = response.body.getReader();
        const cancel = () => { void reader.cancel().catch(() => {}); };
        controller.signal.addEventListener('abort', cancel, {once: true});
        try {
          while (true) {
            const {done, value} = await reader.read(); if (done) break;
            size += value.length;
            if (size > 4096) { await reader.cancel(); throw failure(502, 'Studio authority response is too large'); }
            chunks.push(value);
          }
        } finally { controller.signal.removeEventListener('abort', cancel); reader.releaseLock(); }
        const bytes = Buffer.concat(chunks);
        try { jsonObject(bytes); } catch { throw failure(502, 'Studio authority response was invalid'); }
        return {status: response.status, bytes};
      })();
      const result = await Promise.race([operation, deadline]);
      reply(result.status, result.bytes);
    } catch (error) {
      if (!req.readableEnded) res.once('finish', () => req.destroy());
      if (!res.headersSent && !res.destroyed) reply(error.safe ? error.status : 502, JSON.stringify({error: error.safe ? error.message : 'Native authority is unavailable'}));
    } finally { clearTimeout(timer); controller.abort(); }
    return true;
  };
}
