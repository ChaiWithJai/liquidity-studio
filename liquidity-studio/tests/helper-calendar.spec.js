import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { DurableStore } from '../server/storage.js';
import { createPlatform } from '../server/platform.js';
import { createHttpServer } from '../server/index.js';
let directory, store, platform, server, base, password, helperId, fixtureStoryId;
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'helper-calendar-'));
  password = randomBytes(24).toString('base64url');
  process.env.AI_ALLOW_SYNTHETIC = 'true';
  store = new DurableStore(join(directory, 'fixture.sqlite'));
  platform = createPlatform({ store, authMode: 'password' }); await platform.ready;
  for (const [username, role] of [['browser-owner', 'founder'], ['browser-helper', 'marketer']]) await platform.identity.provision({ username, role, password });
  helperId = (await store.get('identity')).users.find(user => user.username === 'browser-helper').id;
  server = createHttpServer(null, { platform, helperControlEnabled: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); base = `http://127.0.0.1:${server.address().port}`;
  const login = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'browser-owner', password }) });
  const headers = { 'Content-Type': 'application/json', Cookie: login.headers.get('set-cookie').split(';')[0] };
  const added = await fetch(base + '/api/studio/backlog' + scope, { method: 'POST', headers, body: JSON.stringify({ title: 'Calendar shared-control QA fixture', category: 'Calendar QA', sourceClaims: [{ id: 'calendar-source', text: 'The source describes a signed media agreement.', sourceUrl: 'https://example.org/calendar-fixture', kind: 'general', status: 'approved' }] }) });
  expect(added.status).toBe(201); fixtureStoryId = (await added.json()).story.id;
  const generated = await fetch(base + '/api/studio/generate-campaign' + scope, { method: 'POST', headers, body: JSON.stringify({ storyId: fixtureStoryId }) }); expect(generated.status).toBe(200);
});
test.afterAll(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); store.close(); rmSync(directory, { recursive: true, force: true }); });
async function openFixture(page) {
  await page.getByLabel('Search stories', { exact: true }).fill('Calendar shared-control QA fixture');
  await expect(page.locator('.story-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Open draft ↗', exact: true }).click();
  await expect(page.getByLabel('Headline', { exact: true })).toBeVisible();
  await page.getByText('Shared control · bounded proposals', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Shared control', exact: true })).toBeVisible();
}
async function login(page, username) {
  expect((await page.request.post(base + '/api/auth/login', { data: { username, password } })).status()).toBe(200);
  await page.goto(base); await openFixture(page);
}
const scope = '?organizationId=org_default&brandId=brand_default';
async function refresh(page) { await page.getByRole('button', { name: 'Refresh shared control', exact: true }).click(); }
async function actors(browser) {
  const ownerContext = await browser.newContext(), helperContext = await browser.newContext();
  const owner = await ownerContext.newPage(), helper = await helperContext.newPage();
  await login(owner, 'browser-owner'); await login(helper, 'browser-helper');
  return { owner, helper, close: async () => { await ownerContext.close(); await helperContext.close(); } };
}
async function grantCalendar(owner, helper) {
  await owner.getByLabel('Proposal operator', { exact: true }).selectOption(helperId);
  await owner.getByLabel('Allowed proposal types', { exact: true }).selectOption('calendar');
  const response = owner.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/control/grants'));
  await owner.getByRole('button', { name: 'Grant calendar proposals for 10 minutes', exact: true }).click();
  const grant = await (await response).json();
  await refresh(helper);
  const article = grantArticle(helper, grant.id);
  await expect(article).toBeVisible();
  return grant;
}
async function observation(helper, { action = 'assignment.place', unit = 'campaign', format = 'infographic', date = '2026-11-01', zone = 'America/New_York' } = {}) {
  await helper.getByLabel('Proposal action', { exact: true }).selectOption(action);
  await helper.getByLabel('Planning unit', { exact: true }).selectOption(unit);
  if (unit === 'format') await helper.getByLabel('Planning format', { exact: true }).selectOption(format);
  if (action === 'assignment.place') {
    await helper.getByLabel('Proposed date', { exact: true }).fill(date);
    await helper.getByLabel('Calendar timezone', { exact: true }).fill(zone);
  }
  await helper.getByRole('button', { name: 'Load calendar observation', exact: true }).click();
  await expect(helper.getByRole('status').filter({ hasText: /^Observed / })).toBeVisible();
}
function grantArticle(page, id) { return page.getByRole('article', { name: `Grant ${id}`, exact: true }); }
async function proposeAndApprove(owner, helper, grant, remove = false) {
  const response = helper.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/control/proposals'));
  await grantArticle(helper, grant.id).getByRole('button', { name: remove ? 'Propose calendar removal' : 'Propose calendar placement', exact: true }).click();
  const res = await response;
  expect(res.status(), await res.text()).toBe(201);
  const proposal = await res.json();
  await refresh(owner);
  const section = owner.locator(`section[aria-label="Proposal ${proposal.id}"]`);
  await section.getByRole('button', { name: 'Approve exact proposal', exact: true }).click();
  await refresh(helper);
  await expect(helper.getByRole('button', { name: 'Apply approved proposal', exact: true }).last()).toBeVisible();
  return proposal;
}
async function state() { return (await (await platform.forScope({ organizationId: 'org_default', brandId: 'brand_default' })).ports.repo.read()); }
async function apply(helper, proposal) {
  const response = helper.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith(`/proposals/${proposal.id}/apply`));
  await helper.locator(`section[aria-label="Proposal ${proposal.id}"]`).getByRole('button', { name: 'Apply approved proposal', exact: true }).click();
  const result = await response; expect(result.status(), await result.text()).toBe(200);
}
test('calendar UI captures explicit revisions; campaign and format placement, cross-zone move, removal and compensating undo persist', async ({ browser }) => {
  const { owner, helper, close } = await actors(browser);
  try {
    const grant = await grantCalendar(owner, helper);
    await observation(helper);
    // Changed settings cannot silently use the prior destination bucket.
    await helper.getByLabel('Proposed date', { exact: true }).fill('2026-11-02');
    await expect(grantArticle(helper, grant.id).getByRole('button', { name: 'Propose calendar placement', exact: true })).toBeDisabled();
    await observation(helper, { date: '2026-11-02' });
    let proposal = await proposeAndApprove(owner, helper, grant);
    expect(proposal.changes[0]).toMatchObject({ kind: 'assignment.place', unit: 'campaign', date: '2026-11-02', timeZone: 'America/New_York', targetBucketRevision: 0 });
    await apply(helper, proposal);
    let saved = await state();
    const id = proposal.changes[0].storyId;
    expect(saved.workspace.assignments.filter(a => a.storyId === id && !a.deletedAt)).toHaveLength(1);
    for (const format of ['infographic', 'carousel', 'story', 'reel']) {
      await observation(helper, { unit: 'format', format, date: '2026-11-03', zone: 'Asia/Kolkata' });
      proposal = await proposeAndApprove(owner, helper, grant); await apply(helper, proposal);
    }
    await observation(helper, { unit: 'format', format: 'reel', date: '2026-11-04', zone: 'Europe/London' });
    proposal = await proposeAndApprove(owner, helper, grant);
    expect(proposal.changes[0]).toMatchObject({ unit: 'format', format: 'reel', date: '2026-11-04', timeZone: 'Europe/London', expectedAssignmentRevision: 1, sourceBucketRevision: 4 });
    await apply(helper, proposal);
    await observation(helper, { action: 'assignment.remove', unit: 'format', format: 'reel' });
    proposal = await proposeAndApprove(owner, helper, grant, true); await apply(helper, proposal);
    saved = await state();
    expect(saved.workspace.assignments.filter(a => a.storyId === id && !a.deletedAt && a.unit === 'format' && a.format === 'reel')).toHaveLength(0);
    const section = helper.locator(`section[aria-label="Proposal ${proposal.id}"]`);
    await section.getByRole('button', { name: 'Undo accepted changes', exact: true }).click();
    await expect.poll(async () => (await state()).workspace.assignments.filter(a => a.storyId === id && !a.deletedAt && a.unit === 'format' && a.format === 'reel').length).toBe(1);
    await helper.reload();
    await expect(helper.getByLabel('Headline', { exact: true })).toBeVisible();
    await helper.getByRole('button', { name: 'Return to backlog', exact: true }).click();
    await openFixture(helper);
    await expect(helper.getByRole('heading', { name: /Proposal · applied/ })).toHaveCount(7);
  } finally { await close(); }
});
for (const transition of ['Pause', 'Take over']) test(`actual ${transition} UI fences an approved calendar apply held before dispatch`, async ({ browser }) => {
  const { owner, helper, close } = await actors(browser);
  try {
    const grant = await grantCalendar(owner, helper);
    await observation(helper, { unit: 'format', format: transition === 'Pause' ? 'story' : 'carousel', date: '2026-11-06' });
    const proposal = await proposeAndApprove(owner, helper, grant);
    const before = await state();
    let release, entered;
    const held = new Promise(resolve => { entered = resolve; }), resume = new Promise(resolve => { release = resolve; });
    const pattern = `**/control/proposals/${proposal.id}/apply?*`;
    await helper.route(pattern, async route => { entered(); await resume; await route.continue(); });
    const response = helper.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith(`/proposals/${proposal.id}/apply`));
    await helper.locator(`section[aria-label="Proposal ${proposal.id}"]`).getByRole('button', { name: 'Apply approved proposal', exact: true }).click();
    await held;
    await owner.getByLabel('Headline', { exact: true }).fill('Keep unfinished human work');
    await grantArticle(owner, grant.id).getByRole('button', { name: transition, exact: true }).click();
    await expect(grantArticle(owner, grant.id)).toContainText(transition === 'Pause' ? 'paused · epoch' : 'stopped · epoch');
    await owner.getByLabel('Headline', { exact: true }).focus();
    release();
    expect((await response).status()).toBe(409);
    await helper.unroute(pattern);
    const after = await state();
    expect(after.workspace?.assignments || []).toEqual(before.workspace?.assignments || []);
    expect(after.backlog.find(s => s.id === proposal.changes[0].storyId).revision).toBe(before.backlog.find(s => s.id === proposal.changes[0].storyId).revision);
    await expect(owner.getByLabel('Headline', { exact: true })).toHaveValue('Keep unfinished human work');
    await expect(owner.getByLabel('Headline', { exact: true })).toBeFocused();
    if (transition === 'Pause') {
      await grantArticle(owner, grant.id).getByRole('button', { name: 'Resume', exact: true }).click();
      await refresh(helper);
      await expect(helper.locator(`section[aria-label="Proposal ${proposal.id}"]`).getByRole('button', { name: 'Apply approved proposal', exact: true })).toHaveCount(0);
      await observation(helper, { unit: 'format', format: 'story', date: '2026-11-06' });
      const fresh = await proposeAndApprove(owner, helper, grant);
      expect(fresh.epoch).toBeGreaterThan(proposal.epoch);
      await apply(helper, fresh);
    } else {
      await refresh(helper);
      await expect(grantArticle(helper, grant.id).getByRole('button', { name: /Propose calendar/ })).toHaveCount(0);
    }
  } finally { await close(); }
});
test('an intervening destination edit rejects a frozen calendar observation until explicitly reloaded', async ({ browser }) => {
  const { owner, helper, close } = await actors(browser);
  try {
    const grant = await grantCalendar(owner, helper);
    await observation(helper, { unit: 'format', format: 'infographic', date: '2026-12-01' });
    const rows = (await (await owner.request.post(base + '/api/studio/workspace/query' + scope, { data: {} })).json()).rows;
    const other = rows.find(row => row.id !== fixtureStoryId);
    const human = await owner.request.post(base + '/api/studio/workspace/mutations' + scope, { data: { idempotencyKey: crypto.randomUUID(), changes: [{ kind: 'assignment.place', storyId: other.id, expectedRevision: other.revision, unit: 'format', format: 'infographic', date: '2026-12-01', timeZone: 'America/New_York', targetBucketRevision: 0, beforeAssignmentId: null }] } });
    expect(human.status(), await human.text()).toBe(200);
    const response = helper.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/control/proposals'));
    await grantArticle(helper, grant.id).getByRole('button', { name: 'Propose calendar placement', exact: true }).click();
    expect((await response).status()).toBe(409);
    await expect(helper.getByRole('alert')).toBeVisible();
    expect((await state()).operatorControl.proposals.filter(p => p.grantId === grant.id)).toHaveLength(0);
    await observation(helper, { unit: 'format', format: 'infographic', date: '2026-12-01' });
    const proposal = await proposeAndApprove(owner, helper, grant);
    expect(proposal.changes[0].targetBucketRevision).toBe(1);
    await apply(helper, proposal);
    const calendar = await (await helper.request.get(base + '/api/studio/workspace/calendar' + scope + '&startDate=2026-12-01&endDate=2026-12-01&timeZone=America%2FNew_York')).json();
    const bucket = Object.values(calendar.buckets).find(b => b.date === '2026-12-01');
    expect(bucket.assignmentIds.map(id => calendar.assignments.find(a => a.id === id).storyId)).toEqual([other.id, proposal.changes[0].storyId]);
  } finally { await close(); }
});
