import { createHash } from 'node:crypto';
import { validatePenpotFontPack } from './penpot-font-pack.js';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const fail = (status, message) => Object.assign(new Error(message), { status });
const key = font => `${font.oldFontId}:${font.weight}:${font.style || 'normal'}`;
const field = (row, camel, kebab) => row[camel] ?? row[kebab];

/** A fixed destination, not a browser-selected native authority bridge.
 * Journal callbacks must durably replace one private record before returning.
 * No native archive import, document mutation or font-ID remapping occurs here.
 */
export class PenpotFontRecovery {
  constructor({ pack, profileId, teamId, projectId, rpc, readAsset, readJournal, writeJournal }) {
    validatePenpotFontPack(pack);
    if (![profileId, teamId, projectId].every(v => uuid.test(v)) ||
        ![rpc, readAsset, readJournal, writeJournal].every(v => typeof v === 'function')) {
      throw fail(422, 'Invalid fixed font recovery destination');
    }
    this.pack = structuredClone(pack);
    this.packSha256 = sha(Buffer.from(JSON.stringify(this.pack)));
    this.target = Object.freeze({ profileId, teamId, projectId });
    Object.assign(this, { rpc, readAsset, readJournal, writeJournal });
    this.busy = false;
  }

  export() { return structuredClone(this.pack); }
  archive() { return Buffer.from(this.pack.archive.bytes, 'base64'); }

  async context() {
    const profile = await this.rpc('get-profile', {});
    if (profile.id !== this.target.profileId) throw fail(403, 'Configured native account changed');
    const project = await this.rpc('get-project', { id: this.target.projectId });
    if (project.id !== this.target.projectId || field(project, 'teamId', 'team-id') !== this.target.teamId ||
        project.permissions?.canEdit === false || project.permissions?.['can-edit'] === false) {
      throw fail(403, 'Configured native project is unavailable');
    }
    // A readable project is not proof of edit permission. The official write API
    // independently enforces current team edit ACL on every variant creation.
    const variants = await this.rpc('get-font-variants', { 'team-id': this.target.teamId });
    if (!Array.isArray(variants) || variants.length > 1024) throw fail(502, 'Invalid native font inventory');
    return variants;
  }

  async journal() {
    const journal = await this.readJournal();
    if (!journal) return null;
    if (journal.packSha256 !== this.packSha256 || JSON.stringify(journal.target) !== JSON.stringify(this.target) ||
        !uuid.test(journal.intentId) || !journal.items || typeof journal.items !== 'object' || Array.isArray(journal.items)) {
      throw fail(409, 'Journal belongs to another pack or destination');
    }
    return journal;
  }

  ownedRow(variants, font) {
    const id = font.oldFontId.slice(7);
    return variants.filter(v => field(v, 'fontId', 'font-id') === id);
  }

  async verify(row, font) {
    const ext = font.sourceName.endsWith('.ttf') ? 'ttf' : 'otf';
    const assetId = field(row, `${ext}FileId`, `${ext}-file-id`);
    if (!uuid.test(row.id) || field(row, 'teamId', 'team-id') !== this.target.teamId ||
        field(row, 'fontFamily', 'font-family') !== font.family ||
        Number(field(row, 'fontWeight', 'font-weight')) !== font.weight ||
        field(row, 'fontStyle', 'font-style') !== (font.style || 'normal') || !uuid.test(assetId)) {
      throw fail(409, 'Restored native font metadata does not match the sidecar');
    }
    const bytes = await this.readAsset(assetId);
    if (!Buffer.isBuffer(bytes) || bytes.length !== Buffer.from(font.sourceBytes, 'base64').length || sha(bytes) !== font.sourceSha256) {
      throw fail(409, 'Stored original font bytes do not match the sidecar');
    }
    return { variantId: row.id, fontId: font.oldFontId, weight: font.weight, style: font.style || 'normal',
      sourceSha256: font.sourceSha256, licenseSha256: font.licenseSha256, originalAssetId: assetId,
      formats: Object.fromEntries(['ttf', 'otf', 'woff1', 'woff2'].map(k => [k, field(row, `${k}FileId`, `${k}-file-id`)]).filter(([, v]) => v)) };
  }

  preflight(variants, journal) {
    for (const font of this.pack.fonts) {
      const rows = this.ownedRow(variants, font);
      // Previously completed variants of this SAME intent/family are allowed;
      // pre-existing families, including unrelated weights, never are.
      for (const row of rows) {
        const tracked = Object.values(journal?.items || {}).some(item => {
          const pending = this.pack.fonts.find(f => key(f) === item.key);
          return item.receipt?.variantId === row.id || (item.phase === 'create-pending' && pending &&
            pending.oldFontId === font.oldFontId &&
            Number(field(row, 'fontWeight', 'font-weight')) === pending.weight &&
            field(row, 'fontStyle', 'font-style') === (pending.style || 'normal'));
        });
        if (!tracked) throw fail(409, 'A required font UUID already exists. Use a fresh destination; no fonts were overwritten');
      }
    }
  }

  async status() {
    const variants = await this.context(), journal = await this.journal();
    this.preflight(variants, journal);
    if (journal?.completed) {
      for (const font of this.pack.fonts) {
        const saved = journal.items[key(font)];
        const row = variants.find(v => v.id === saved?.receipt?.variantId);
        if (saved?.phase !== 'verified' || !row) throw fail(409, 'A previously restored font is missing');
        await this.verify(row, font);
      }
      await this.context();
    }
    return { packSha256: this.packSha256, target: this.target, archiveSha256: this.pack.archive.sha256,
      fonts: this.pack.fonts.map(f => ({ family: f.family, weight: f.weight, style: f.style || 'normal',
        sourceName: f.sourceName, sourceSha256: f.sourceSha256, licenseSha256: f.licenseSha256 })),
      intentId: journal?.intentId || null, completed: journal?.completed === true,
      phases: Object.values(journal?.items || {}).map(i => ({ key: i.key, phase: i.phase })),
      archiveImported: false, authorityRestored: false };
  }

  async restore({ packSha256, destinationAcknowledged, intentId }) {
    if (this.busy) throw fail(409, 'Font recovery is already running');
    if (packSha256 !== this.packSha256 || destinationAcknowledged !== this.target.teamId || !uuid.test(intentId)) {
      throw fail(422, 'Confirm the displayed fixed destination and exact pack');
    }
    this.busy = true;
    try {
      let variants = await this.context(), journal = await this.journal();
      if (journal && journal.intentId !== intentId) throw fail(409, 'Resume the original recovery intent');
      this.preflight(variants, journal); // ALL UUID conflicts checked before first upload.
      if (!journal) {
        journal = { intentId, target: this.target, packSha256: this.packSha256, items: {}, completed: false };
        await this.writeJournal(journal);
      }
      for (const font of this.pack.fonts) {
        const k = key(font);
        let item = journal.items[k];
        variants = await this.context();
        this.preflight(variants, journal);
        const matches = this.ownedRow(variants, font).filter(v =>
          Number(field(v, 'fontWeight', 'font-weight')) === font.weight && field(v, 'fontStyle', 'font-style') === (font.style || 'normal'));
        if (matches.length > 1) throw fail(409, 'Duplicate native variants require operator inspection');
        if (matches.length) {
          if (!item || !['create-pending', 'verified'].includes(item.phase)) throw fail(409, 'Unexpected font appeared');
          const receipt = await this.verify(matches[0], font);
          if (item.receipt && item.receipt.variantId !== receipt.variantId) throw fail(409, 'Previously restored variant changed');
          journal.items[k] = { key: k, phase: 'verified', receipt };
          await this.writeJournal(journal);
          continue;
        }
        if (item) throw fail(409, 'Previous upload outcome is unresolved; preserve the journal and inspect it before continuing');
        item = journal.items[k] = { key: k, phase: 'session-pending' };
        await this.writeJournal(journal);
        const session = await this.rpc('create-upload-session', { 'total-chunks': 1 });
        const sessionId = field(session, 'sessionId', 'session-id');
        if (!uuid.test(sessionId)) throw fail(502, 'Invalid native upload session');
        item.sessionId = sessionId;
        item.phase = 'chunk-pending';
        await this.writeJournal(journal);
        await this.context();
        const bytes = Buffer.from(font.sourceBytes, 'base64');
        await this.rpc('upload-chunk', { 'session-id': sessionId, index: 0, content: bytes,
          filename: font.sourceName, mime: font.sourceName.endsWith('.ttf') ? 'font/ttf' : 'font/otf' });
        item.phase = 'create-pending';
        await this.writeJournal(journal);
        variants = await this.context();
        this.preflight(variants, journal);
        if (this.ownedRow(variants, font).some(v => Number(field(v, 'fontWeight', 'font-weight')) === font.weight)) {
          throw fail(409, 'Font appeared before creation; inspect this intent without overwriting');
        }
        await this.rpc('create-font-variant', { 'team-id': this.target.teamId, 'font-id': font.oldFontId.slice(7),
          'font-family': font.family, 'font-weight': font.weight, 'font-style': font.style || 'normal',
          uploads: { [font.sourceName.endsWith('.ttf') ? 'font/ttf' : 'font/otf']: sessionId } });
        variants = await this.context();
        const created = this.ownedRow(variants, font).filter(v => Number(field(v, 'fontWeight', 'font-weight')) === font.weight &&
          field(v, 'fontStyle', 'font-style') === (font.style || 'normal'));
        if (created.length !== 1) throw fail(409, 'Created native font could not be verified');
        item.receipt = await this.verify(created[0], font);
        item.phase = 'verified';
        await this.writeJournal(journal);
      }
      await this.context();
      journal.completed = true;
      await this.writeJournal(journal);
      return { completed: true, intentId, packSha256: this.packSha256,
        fonts: Object.values(journal.items).map(i => i.receipt), archiveImported: false, authorityRestored: false };
    } finally { this.busy = false; }
  }
}

/** Fixed pinned native transport. Cookies never enter the operator page or pack. */
export function createPenpotFontRecoveryTransport({ cookie, fetchImpl = fetch }) {
  if (typeof cookie !== 'string' || !cookie.length || /[\r\n]/.test(cookie)) throw fail(422, 'Invalid private native session');
  const origin = 'http://localhost:39008';
  async function request(path, options, limit) {
    const response = await fetchImpl(origin + path, { ...options, redirect: 'error',
      signal: AbortSignal.timeout(30000), headers: { ...options.headers, Cookie: cookie, Origin: origin } });
    const chunks = []; let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > limit) throw fail(502, 'Native response exceeds the font recovery bound');
      chunks.push(chunk);
    }
    if (!response.ok) throw fail(response.status >= 500 ? 502 : response.status, 'Native font recovery request was rejected');
    return Buffer.concat(chunks);
  }
  return {
    async rpc(operation, body) {
      if (!['get-profile', 'get-project', 'get-font-variants', 'create-upload-session', 'upload-chunk', 'create-font-variant'].includes(operation)) {
        throw fail(422, 'Unsupported native font operation');
      }
      let payload, headers;
      if (operation === 'upload-chunk') {
        payload = new FormData();
        payload.set('session-id', body['session-id']); payload.set('index', String(body.index));
        payload.set('content', new Blob([body.content], { type: body.mime }), body.filename);
      } else { payload = JSON.stringify(body); headers = { 'Content-Type': 'application/json' }; }
      const bytes = await request(`/api/rpc/command/${operation}`, { method: 'POST', headers: { ...headers, Accept: 'application/json' }, body: payload }, 2 * 1024 * 1024);
      try { return JSON.parse(bytes.toString('utf8')); } catch { throw fail(502, 'Invalid native JSON response'); }
    },
    async readAsset(id) {
      if (!uuid.test(id)) throw fail(422, 'Invalid original font asset');
      return request(`/assets/by-id/${id}`, { method: 'GET', headers: {} }, 3 * 1024 * 1024);
    },
  };
}
