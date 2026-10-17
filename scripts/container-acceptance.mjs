import assert from 'node:assert/strict';
import fs from 'node:fs';
const [mode, recordFile] = process.argv.slice(2);
const base = `http://127.0.0.1:${process.env.STUDIO_LOCAL_PORT || 3001}`;
const scope = '?organizationId=org_default&brandId=brand_default';
let cookie = '';
async function request(route, body, anonymous = false) {
  return fetch(base + route, { method: body ? 'POST' : 'GET', signal: AbortSignal.timeout(15000), headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(!anonymous && cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
}
async function login(username, password) {
  const response = await request('/api/auth/login', { username, password }, true);
  assert.equal(response.status, 200); const value = response.headers.get('set-cookie');
  assert.ok(value?.includes('HttpOnly')); cookie = value.split(';')[0]; return response.json();
}
for (const route of ['/', '/healthz', '/readyz']) assert.equal((await request(route)).status, 200);
assert.equal((await request('/api/studio/bootstrap' + scope, null, true)).status, 401);
await login(process.env.STUDIO_FOUNDER_USERNAME || 'founder', process.env.STUDIO_FOUNDER_PASSWORD);
if (mode === 'prepare') {
  const claim = { id: 'container-fixture', text: 'This is a synthetic container acceptance fixture.', sourceUrl: 'https://example.org/container-fixture', status: 'approved' };
  const created = await request('/api/studio/backlog' + scope, { title: 'Container acceptance fixture', category: 'Test fixture', sourceClaims: [claim] });
  assert.equal(created.status, 201); const story = (await created.json()).story;
  const generated = await request('/api/studio/generate-campaign' + scope, { storyId: story.id });
  assert.equal(generated.status, 200); const draft = await generated.json(); assert.equal(draft.campaign.provenance.mode, 'synthetic');
  const content = { ...draft.campaign.infographic, headline: 'A PERSISTED CONTAINER DRAFT' };
  assert.equal((await request('/api/studio/save-edit' + scope, { storyId: story.id, format: 'infographic', content, expectedRevision: draft.story.revision })).status, 200);
  assert.equal((await request('/api/studio/schedule' + scope, { storyId: story.id, scheduledDay: 'Friday', status: 'Scheduled' })).status, 200);
  const exported = await request('/api/studio/export-asset' + scope, { storyId: story.id, format: 'infographic' });
  assert.equal(exported.status, 201); const asset = await exported.json();
  const download = await request(asset.downloadUrl); assert.equal(download.status, 200); const bytes = Buffer.from(await download.arrayBuffer());
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG'); assert.equal(bytes.readUInt32BE(16), 1080); assert.equal(bytes.readUInt32BE(20), 1350);
  assert.ok([403, 404].includes((await request(asset.downloadUrl.replace('brand_default', 'brand_vedic'))).status));
  fs.writeFileSync(recordFile, JSON.stringify({ storyId: story.id, downloadUrl: asset.downloadUrl }), { mode: 0o600 });
  await login(process.env.STUDIO_MARKETER_USERNAME || 'marketer', process.env.STUDIO_MARKETER_PASSWORD);
  assert.equal((await request('/api/admin/overview' + scope)).status, 403);
  console.log('Container sign-in, isolation, generation, edit, calendar and actual PNG download passed.');
} else if (mode === 'after-restart') {
  const record = JSON.parse(fs.readFileSync(recordFile, 'utf8'));
  const bootstrap = await (await request('/api/studio/bootstrap' + scope)).json(); const story = bootstrap.backlog.find(story => story.id === record.storyId);
  assert.equal(story?.campaignDraft?.infographic?.headline, 'A PERSISTED CONTAINER DRAFT'); assert.equal(story.scheduledDay, 'Friday');
  assert.equal((await request(record.downloadUrl)).status, 200);
  const ejected = await request('/api/admin/eject' + scope); assert.equal(ejected.status, 200); assert.ok((await ejected.json()).data.assets.length > 0);
  console.log('Recreated container retained drafts, calendar and downloadable artifacts; ejection succeeded.');
} else throw new Error('Use prepare or after-restart with a private temporary record path');
