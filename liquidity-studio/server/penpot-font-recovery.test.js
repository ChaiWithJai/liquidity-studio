import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createPenpotFontPack, validatePenpotFontPack } from './penpot-font-pack.js';
import { PenpotFontRecovery, createPenpotFontRecoveryTransport } from './penpot-font-recovery.js';

const ids = {
  profile: '11111111-1111-4111-8111-111111111111', team: '22222222-2222-4222-8222-222222222222',
  project: '33333333-3333-4333-8333-333333333333', font: '44444444-4444-4444-8444-444444444444',
  intent: '55555555-5555-4555-8555-555555555555', session: '66666666-6666-4666-8666-666666666666',
};
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function pack() {
  return createPenpotFontPack({ archive: Buffer.from('controlled original archive bytes'), fonts: [400, 700].map(weight => ({
    family: 'Mona Sans', weight, oldFontId: 'custom-' + ids.font,
    sourceName: weight === 400 ? 'MonaSans-Regular.otf' : 'MonaSans-Bold.otf',
    bytes: readFileSync(new URL(`../public/fonts/MonaSans-${weight === 400 ? 'Regular' : 'Bold'}.otf`, import.meta.url)),
    licenseBytes: readFileSync(new URL('../public/fonts/MonaSans-OFL.txt', import.meta.url)),
  })) });
}
function fixture() {
  const source = pack(), variants = [], assets = new Map(), calls = [];
  let journal = null, profile = ids.profile, chunk, lostCreate = false;
  const service = new PenpotFontRecovery({ pack: source, profileId: ids.profile, teamId: ids.team, projectId: ids.project,
    readJournal: async () => structuredClone(journal), writeJournal: async value => { journal = structuredClone(value); },
    readAsset: async id => assets.get(id),
    rpc: async (op, body) => {
      calls.push({ op, body });
      if (op === 'get-profile') return { id: profile };
      if (op === 'get-project') return { id: ids.project, teamId: ids.team };
      if (op === 'get-font-variants') return structuredClone(variants);
      if (op === 'create-upload-session') { assert.equal(body['total-chunks'], 1); return { sessionId: ids.session }; }
      if (op === 'upload-chunk') { assert.equal(body.index, 0); chunk = body.content; return {}; }
      if (op === 'create-font-variant') {
        const font = source.fonts.find(f => f.weight === body['font-weight']);
        assert.equal(body['font-id'], ids.font); assert.equal(body['font-style'], 'normal');
        assert.equal(body.uploads['font/otf'], ids.session);
        assert.equal(sha(chunk), font.sourceSha256);
        const id = `${String(font.weight).padStart(8, '0')}-7777-4777-8777-777777777777`;
        const asset = `${String(font.weight).padStart(8, '0')}-8888-4888-8888-888888888888`;
        variants.push({ id, fontId: ids.font, teamId: ids.team, fontFamily: 'Mona Sans',
          fontWeight: String(font.weight), fontStyle: 'normal', otfFileId: asset });
        assets.set(asset, chunk);
        if (lostCreate) { lostCreate = false; throw new Error('Original native creation reply lost'); }
        return variants.at(-1);
      }
      throw Error('Unexpected operation');
    },
  });
  return { source, service, calls, variants, assets, getJournal: () => journal,
    loseCreate: () => { lostCreate = true; }, changeProfile: () => { profile = ids.team; } };
}
const input = service => ({ packSha256: service.packSha256, destinationAcknowledged: ids.team, intentId: ids.intent });

test('font sidecar roundtrip preserves original bytes/notices; fresh restore preserves family UUID and verifies both original variants', async () => {
  const f = fixture();
  validatePenpotFontPack(JSON.parse(JSON.stringify(f.service.export())));
  assert.equal(sha(f.service.archive()), f.source.archive.sha256);
  const result = await f.service.restore(input(f.service));
  assert.equal(result.completed, true); assert.equal(result.archiveImported, false); assert.equal(result.authorityRestored, false);
  assert.equal(result.fonts.length, 2);
  assert.deepEqual(result.fonts.map(x => x.sourceSha256), f.source.fonts.map(x => x.sourceSha256));
  assert.deepEqual(result.fonts.map(x => x.licenseSha256), f.source.fonts.map(x => x.licenseSha256));
  assert.ok(result.fonts.every(x => x.fontId === 'custom-' + ids.font));
  await f.service.restore(input(f.service));
  assert.equal(f.calls.filter(c => c.op === 'create-font-variant').length, 2);
});

test('all UUID conflicts are rejected before any upload, even when later family is the conflicting one', async () => {
  const f = fixture();
  f.variants.push({ id: ids.intent, fontId: ids.font, fontWeight: '900', fontStyle: 'normal' });
  await assert.rejects(f.service.restore(input(f.service)), /already exists/);
  assert.equal(f.calls.filter(c => c.op.includes('upload') || c.op === 'create-font-variant').length, 0);
  assert.equal(f.getJournal(), null);
});

test('lost creation response reconciles exact same intent/bytes without another create; another intent rejects', async () => {
  const f = fixture(); f.loseCreate();
  await assert.rejects(f.service.restore(input(f.service)), /reply lost/);
  assert.equal(f.getJournal().items[`custom-${ids.font}:400:normal`].phase, 'create-pending');
  await assert.rejects(f.service.restore({ ...input(f.service), intentId: ids.profile }), /original recovery intent/);
  const result = await f.service.restore(input(f.service));
  assert.equal(result.completed, true);
  assert.equal(f.calls.filter(c => c.op === 'create-font-variant').length, 2);
});

test('current native profile mismatch and tampered original readback fail closed, never report complete', async () => {
  const a = fixture(); a.changeProfile();
  await assert.rejects(a.service.restore(input(a.service)), /account changed/);
  assert.equal(a.getJournal(), null);
  const b = fixture(); b.loseCreate();
  await assert.rejects(b.service.restore(input(b.service)), /reply lost/);
  for (const id of b.assets.keys()) b.assets.set(id, Buffer.from('tampered'));
  await assert.rejects(b.service.restore(input(b.service)), /original font bytes/);
  assert.equal(b.getJournal().completed, false);
});

test('fixed transport sends official chunked multipart and rejects unrecognized operations/redirects, without exposing session', async () => {
  const requests = [];
  const t = createPenpotFontRecoveryTransport({ cookie: 'owned-private-cookie', fetchImpl: async (url, options) => {
    requests.push({ url, options }); return new Response(JSON.stringify({ 'session-id': ids.session }), { status: 200 });
  } });
  await t.rpc('upload-chunk', { 'session-id': ids.session, index: 0, content: Buffer.from('owned'), filename: 'font.ttf', mime: 'font/ttf' });
  const r = requests[0];
  assert.equal(r.url, 'http://localhost:39008/api/rpc/command/upload-chunk');
  assert.equal(r.options.redirect, 'error'); assert.equal(r.options.headers.Origin, 'http://localhost:39008');
  assert.equal(r.options.body.get('session-id'), ids.session); assert.equal(r.options.body.get('index'), '0');
  assert.equal(await r.options.body.get('content').text(), 'owned');
  await assert.rejects(t.rpc('delete-font', {}), /Unsupported/);
  await assert.rejects(t.readAsset('../foreign'), /Invalid/);
});
