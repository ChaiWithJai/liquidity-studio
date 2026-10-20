import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefiantUnifiedData } from './defiant-unified-data.js';
// Fictional contract fixture, unrelated to any supplied artist or financial record.
const fixture = () => ({
  dataset: { id: 'fictional', label: 'Fictional reference', provenance: 'synthetic', asOf: null },
  artists: [{ id: 'artist:a', name: 'Example Artist', privateSecret: 'not-public' }],
  tracks: [{ id: 'track:a', artistId: 'artist:a', title: 'Example Recording', rightsStatus: 'cleared' }],
  sources: [{ id: 'source:a', title: 'Example Source', trackIds: ['track:a'], url: 'https://example.com/reference' }],
  campaigns: [{ id: 'campaign:a', title: 'Example Plan', sourceIds: ['source:a'], trackId: 'track:a', scenario: { spend: 10, roas: 4, actualRevenue: 900 } }],
  opportunities: [{ id: 'opportunity:a', title: 'Review potential match', trackId: 'track:a', sourceIds: ['source:a'], campaignId: 'campaign:a', score: 50, reasons: ['Supplied thematic match; not verified'] }]
});
test('requires current scoped authority on every read, with no actor fallback', async () => {
  let allowed = true; const calls = [];
  const service = createDefiantUnifiedData({ dataset: fixture(), organizationId: 'org:a', authorize: (actor, scope) => { calls.push([actor, scope]); return allowed; } });
  await service.read('person:a'); allowed = false;
  await assert.rejects(service.read('person:a'), { status: 403 });
  assert.deepEqual(calls, [['person:a', { organizationId: 'org:a' }], ['person:a', { organizationId: 'org:a' }]]);
  assert.throws(() => createDefiantUnifiedData({ dataset: fixture(), organizationId: 'org:a' }), { status: 500 });
});
test('allowlisted detached projection never upgrades rights, financial scenarios or missing ledgers', async () => {
  const dataset = fixture();
  const service = createDefiantUnifiedData({ dataset, organizationId: 'org:a', authorize: () => true });
  dataset.tracks[0].title = 'Later caller mutation';
  const first = await service.read('person:a');
  assert.equal(first.tracks[0].title, 'Example Recording');
  assert.equal(first.tracks[0].rightsStatus, 'unknown');
  assert.equal(first.artists[0].privateSecret, undefined);
  assert.deepEqual(first.campaigns[0].scenario, { method: 'scenario', spend: 10, roas: 4 });
  assert.equal(first.opportunities[0].method, 'scenario');
  first.tracks[0].title = 'Response mutation';
  assert.equal((await service.read('person:a')).tracks[0].title, 'Example Recording');
  for (const resource of ['demand', 'royalties']) {
    const result = await service.read('person:a', { resource });
    assert.equal(result.available, false); assert.deepEqual(result.items, []);
  }
});
test('bounded search, pagination, exact resource and explanation contract', async () => {
  const dataset = fixture(); dataset.artists.push({ id: 'artist:b', name: 'Second Example' });
  const service = createDefiantUnifiedData({ dataset, organizationId: 'org:a', authorize: () => true });
  const page = await service.read('person:a', { resource: 'artists', query: 'example', limit: 1 });
  assert.equal(page.total, 2); assert.equal(page.nextCursor, '1');
  assert.equal((await service.read('person:a', { resource: 'artists', cursor: page.nextCursor, limit: 1 })).items[0].id, 'artist:b');
  for (const request of [{ resource: 'sql' }, { resource: 'sources', limit: 101 }, { resource: 'sources', cursor: '-1' }, { raw: true }, { resource: 'manifest', query: 'example' }]) await assert.rejects(service.read('person:a', request), { status: 400 });
  dataset.opportunities[0].score = Infinity;
  assert.throws(() => createDefiantUnifiedData({ dataset, organizationId: 'org:a', authorize: () => true }), { status: 400 });
});
test('rejects dangling references, duplicate IDs, executable and credential-bearing URLs', () => {
  for (const alter of [data => { data.tracks[0].artistId = 'missing'; }, data => { data.sources.push({ ...data.sources[0] }); }, data => { data.sources[0].url = 'javascript:alert(1)'; }, data => { data.sources[0].url = 'https://user:password@example.com'; }]) {
    const dataset = fixture(); alter(dataset);
    assert.throws(() => createDefiantUnifiedData({ dataset, organizationId: 'org:a', authorize: () => true }), { status: 400 });
  }
});
test('snapshot revision changes with served facts but ignores dropped private fields', async()=>{
 const read=dataset=>createDefiantUnifiedData({dataset,organizationId:'org:a',authorize:()=>true}).read('person:a');
 const before=fixture(),same=fixture();same.artists[0].privateSecret='different';
 const first=await read(before),second=await read(same);assert.match(first.dataset.revision,/^[a-f0-9]{64}$/);assert.equal(first.dataset.revision,second.dataset.revision);
 same.tracks[0].title='Changed served recording';assert.notEqual(first.dataset.revision,(await read(same)).dataset.revision);
});
