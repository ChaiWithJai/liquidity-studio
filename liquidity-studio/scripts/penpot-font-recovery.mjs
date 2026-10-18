#!/usr/bin/env node
import { createServer } from 'node:http';
import { lstat, readFile, writeFile, rename, open, unlink } from 'node:fs/promises';
import { dirname, isAbsolute } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createPenpotFontPack, validatePenpotFontPack } from '../server/penpot-font-pack.js';
import { PenpotFontRecovery, createPenpotFontRecoveryTransport } from '../server/penpot-font-recovery.js';

// Explicit operator process. Never imported by the production server or normal dev launcher.
if (process.env.K_SERVICE || process.argv.length !== 4 || process.argv[2] !== '--config' || !isAbsolute(process.argv[3])) {
  throw new Error('Usage: node scripts/penpot-font-recovery.mjs --config /absolute/private/config.json (local only)');
}
async function privateFile(path, limit) {
  if (!isAbsolute(path)) throw new Error('Private recovery paths must be absolute');
  const s = await lstat(path);
  if (!s.isFile() || s.isSymbolicLink() || s.uid !== process.getuid() || (s.mode & 0o077) || s.size > limit) {
    throw new Error('Expected bounded owner-only private recovery file');
  }
  return readFile(path);
}
async function sourceFile(path, limit) {
  if (!isAbsolute(path)) throw new Error('Source paths must be absolute');
  const s = await lstat(path);
  if (!s.isFile() || s.isSymbolicLink() || s.size > limit) throw new Error('Invalid bounded font source');
  return readFile(path);
}
const config = JSON.parse((await privateFile(process.argv[3], 64 * 1024)).toString('utf8'));
const allowed = ['packPath', 'archivePath', 'fonts', 'profileId', 'teamId', 'projectId', 'cookieFile', 'journalPath'];
if (Object.keys(config).some(k => !allowed.includes(k)) ||
    (config.packPath ? (config.archivePath !== undefined || config.fonts !== undefined) :
      (!Array.isArray(config.fonts) || config.fonts.length > 8))) {
  throw new Error('Invalid fixed recovery configuration');
}
const fonts = [];
for (const font of config.fonts || []) {
  if (Object.keys(font).some(k => !['sourcePath', 'licensePath', 'family', 'weight', 'style', 'oldFontId', 'sourceName'].includes(k))) {
    throw new Error('Invalid fixed font source');
  }
  fonts.push({ family: font.family, weight: font.weight, style: font.style, oldFontId: font.oldFontId,
    sourceName: font.sourceName, bytes: await sourceFile(font.sourcePath, 3 * 1024 * 1024),
    licenseBytes: await sourceFile(font.licensePath, 100 * 1024) });
}
const pack = config.packPath
  ? validatePenpotFontPack(JSON.parse((await sourceFile(config.packPath, 28 * 1024 * 1024)).toString('utf8')))
  : createPenpotFontPack({ archive: await sourceFile(config.archivePath, 10 * 1024 * 1024), fonts });
if (!isAbsolute(config.journalPath)) throw new Error('Journal path must be absolute');
const parent = await lstat(dirname(config.journalPath));
if (!parent.isDirectory() || parent.isSymbolicLink() || parent.uid !== process.getuid() || (parent.mode & 0o077)) {
  throw new Error('Journal parent must be an existing owner-only private directory');
}
const lock = config.journalPath + '.lock';
const lockHandle = await open(lock, 'wx', 0o600); // No two operator processes may own the same intent.
let server;
try {
  const cookie = (await privateFile(config.cookieFile, 8192)).toString('utf8').trim();
  const transport = createPenpotFontRecoveryTransport({ cookie });
  const service = new PenpotFontRecovery({ pack, profileId: config.profileId, teamId: config.teamId,
    projectId: config.projectId, ...transport,
    async readJournal() {
      try { return JSON.parse((await privateFile(config.journalPath, 64 * 1024)).toString('utf8')); }
      catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    },
    async writeJournal(value) {
      const tmp = config.journalPath + '.' + randomBytes(8).toString('hex') + '.tmp';
      await writeFile(tmp, JSON.stringify(value) + '\n', { mode: 0o600, flag: 'wx' });
      const file = await open(tmp, 'r'); try { await file.sync(); } finally { await file.close(); }
      await rename(tmp, config.journalPath);
      const directory = await open(dirname(config.journalPath), 'r');
      try { await directory.sync(); } finally { await directory.close(); }
    },
  });
  const origin = 'http://127.0.0.1:39045';
  const nonce = randomBytes(24).toString('base64');
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Restore Penpot fonts</title>
<style nonce="${nonce}">body{font:17px system-ui;max-width:760px;margin:48px auto;padding:0 24px;color:#17212b}button,a{font:inherit;margin:8px 12px 8px 0}pre{white-space:pre-wrap;background:#f3f5f7;padding:16px}label{display:block;margin:20px 0}#message{white-space:pre-wrap}</style>
<h1>Restore Penpot fonts</h1><p>Download the licensed font sidecar, then restore its fonts into the configured fresh native workspace. Your design archive is included in the download; this action does not import or edit it.</p>
<p><a href="/export" download="penpot-font-sidecar.json">Download font sidecar</a><a href="/archive" download="restored-design.penpot">Download original native archive</a></p><h2>Destination and fonts</h2><pre id="summary">Reading native account…</pre>
<label><input id="ack" type="checkbox"> I confirm this is the intended fresh destination.</label><button id="restore" disabled>Restore fonts</button><button id="check">Check saved recovery</button><p id="message" role="status"></p>
<script nonce="${nonce}">let state;const summary=document.querySelector('#summary'),message=document.querySelector('#message'),restore=document.querySelector('#restore'),ack=document.querySelector('#ack');let busy=false;
function enabled(){restore.disabled=busy||!state||!ack.checked||state.completed;}
async function check(){try{const r=await fetch('/status');const x=await r.json();if(!r.ok)throw Error(x.error);state=x;summary.textContent=JSON.stringify(x,null,2);restore.textContent=x.intentId?'Resume saved font recovery':'Restore fonts';message.textContent=x.completed?'Fonts verified. Import the included native archive through Penpot next.':'';}catch(e){state=null;message.textContent=e.message;}enabled();}
ack.onchange=enabled;document.querySelector('#check').onclick=check;restore.onclick=async()=>{if(!state||busy)return;busy=true;enabled();message.textContent='Restoring and checking original font bytes…';const intentId=state.intentId||crypto.randomUUID();state.intentId=intentId;try{const r=await fetch('/restore',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({packSha256:state.packSha256,destinationAcknowledged:state.target.teamId,intentId})});const x=await r.json();if(!r.ok)throw Error(x.error);message.textContent='Fonts verified. Import the included native archive through Penpot next.';await check();}catch(e){message.textContent=e.message+' No existing font was overwritten. Keep the saved recovery intent; check it before continuing.';}finally{busy=false;enabled();}};check();</script></html>`;
  server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`);
    const allowedPeer = ['127.0.0.1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
    if (!allowedPeer || req.headers.host !== '127.0.0.1:39045' ||
        Object.keys(req.headers).some(k => k.startsWith('x-forwarded-') || k === 'forwarded') ||
        (req.headers.origin && req.headers.origin !== origin) ||
        (req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site']))) {
      res.writeHead(403); res.end(); return;
    }
    try {
      if (req.method === 'GET' && req.url === '/') { res.setHeader('Content-Type', 'text/html;charset=utf-8'); res.end(html); return; }
      if (req.method === 'GET' && req.url === '/export') {
        await service.context();
        res.setHeader('Content-Type', 'application/json'); res.setHeader('Content-Disposition', 'attachment; filename="penpot-font-sidecar.json"');
        res.end(JSON.stringify(service.export())); return;
      }
      if (req.method === 'GET' && req.url === '/archive') {
        await service.context();
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename="restored-design.penpot"');
        res.end(service.archive()); return;
      }
      let value;
      if (req.method === 'GET' && req.url === '/status') value = await service.status();
      else if (req.method === 'POST' && req.url === '/restore' && req.headers.origin === origin && req.headers['content-type'] === 'application/json') {
        let body = ''; for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 1024) throw Object.assign(new Error('Recovery request too large'), { status: 413 }); }
        const input = JSON.parse(body);
        if (!input || Object.keys(input).some(k => !['packSha256', 'destinationAcknowledged', 'intentId'].includes(k))) throw Object.assign(new Error('Invalid recovery request'), { status: 422 });
        value = await service.restore(input);
      } else { res.writeHead(404); res.end(); return; }
      res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value));
    } catch (error) {
      res.writeHead(error.status || 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.status ? error.message : 'Font recovery stopped. Preserve the journal and inspect the private operator process.' }));
    }
  });
  server.requestTimeout = 90000; server.headersTimeout = 10000; server.maxConnections = 4;
  await new Promise((yes, no) => { server.once('error', no); server.listen(39045, '127.0.0.1', yes); });
  console.log('Font recovery operator: http://127.0.0.1:39045 (fixed private destination; no archive import)');
  await new Promise(resolve => { process.once('SIGINT', resolve); process.once('SIGTERM', resolve); });
  await new Promise(resolve => server.close(resolve));
} finally {
  if (server?.listening) await new Promise(resolve => server.close(resolve));
  await lockHandle.close(); await unlink(lock);
}
