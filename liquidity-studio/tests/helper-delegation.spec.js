import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { DurableStore } from '../server/storage.js';
import { createPlatform } from '../server/platform.js';
import { createHttpServer } from '../server/index.js';
let directory, store, platform, server, base, password, helperId, fixtureStoryId, delegatedStoryId, founderId;
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'helper-delegation-'));
  password = randomBytes(24).toString('base64url');
  process.env.AI_ALLOW_SYNTHETIC = 'true';
  store = new DurableStore(join(directory, 'fixture.sqlite'));
  platform = createPlatform({ store, authMode: 'password' }); await platform.ready;
  for (const [username, role] of [['browser-owner', 'founder'], ['browser-helper', 'marketer']]) await platform.identity.provision({ username, role, password });
  const users=(await store.get('identity')).users; helperId=users.find(user=>user.username==='browser-helper').id; founderId=users.find(user=>user.username==='browser-owner').id;
  server = createHttpServer(null, { platform, helperControlEnabled: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); base = `http://127.0.0.1:${server.address().port}`;
  const login = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'browser-owner', password }) });
  const headers = { 'Content-Type': 'application/json', Cookie: login.headers.get('set-cookie').split(';')[0] };
  const added = await fetch(base + '/api/studio/backlog' + scope, { method: 'POST', headers, body: JSON.stringify({ title: 'Human unfinished workflow fixture', category: 'Calendar QA', sourceClaims: [{ id: 'calendar-source', text: 'The source describes a signed media agreement.', sourceUrl: 'https://example.org/calendar-fixture', kind: 'general', status: 'approved' }] }) });
  expect(added.status).toBe(201); fixtureStoryId = (await added.json()).story.id;
  const delegated = await fetch(base + '/api/studio/backlog' + scope, { method: 'POST', headers, body: JSON.stringify({ title: 'Delegated backlog workflow fixture', category: 'Original delegated category', sourceClaims: [{ id: 'delegation-source', text: 'Controlled unreviewed editorial test excerpt.', sourceUrl: 'https://example.org/delegation-fixture', kind: 'general', status: 'unreviewed' }] }) });
  expect(delegated.status).toBe(201); delegatedStoryId = (await delegated.json()).story.id;
  const generated = await fetch(base + '/api/studio/generate-campaign' + scope, { method: 'POST', headers, body: JSON.stringify({ storyId: fixtureStoryId }) }); expect(generated.status).toBe(200);
});
test.afterAll(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); store.close(); rmSync(directory, { recursive: true, force: true }); });
async function openStory(page, title) {
  await page.getByLabel('Search stories', { exact: true }).fill(title);
  await expect(page.locator('.story-row')).toHaveCount(1);
  await page.locator('.story-row').getByRole('button', { name: /Open (draft|story) ↗/ }).click();
  await expect(page.locator('.workflow-context')).toContainText(title);
  await page.getByText('Assistant actions', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Shared control', exact: true })).toBeVisible();
}
async function login(page, username) {
  expect((await page.request.post(base + '/api/auth/login', { data: { username, password } })).status()).toBe(200);
  await page.goto(base); await expect(page.locator('.story-row').first()).toBeVisible();
}
const scope = '?organizationId=org_default&brandId=brand_default';
async function refreshed(page) { await page.getByRole('button', { name: 'Refresh shared control', exact: true }).click(); }
function grantRegion(page,id) { return page.getByRole('article', {name:`Grant ${id}`,exact:true}); }
async function lookup(page, title) {
  await page.getByLabel('Grant target',{exact:true}).selectOption('other');
  await page.getByLabel('Find story for delegation',{exact:true}).fill(title);
  await page.getByRole('button',{name:'Search stories for delegation',exact:true}).click();
  await expect(page.getByLabel('Story to delegate',{exact:true})).toBeVisible();
}
for(const humanRole of ['founder','marketer']) test(`${humanRole} keeps dirty Reel A while another operator applies a scoped plan for undrafted B`,async({browser},info)=>{
 const ownerContext=await browser.newContext({viewport:{width:1280,height:720},timezoneId:'America/New_York'}), helperContext=await browser.newContext({viewport:{width:1280,height:720},timezoneId:'America/New_York'});
 const owner=await ownerContext.newPage(), helper=await helperContext.newPage();
 async function capture(name,page){if(!process.env.STUDIO_CAPTURE_HELPER_DELIVERY_DIR)return;mkdirSync(process.env.STUDIO_CAPTURE_HELPER_DELIVERY_DIR,{recursive:true});await page.screenshot({path:join(process.env.STUDIO_CAPTURE_HELPER_DELIVERY_DIR,`${name}-${humanRole}.png`)});}
 try{
  const humanUser=humanRole==='founder'?'browser-owner':'browser-helper', helperUser=humanRole==='founder'?'browser-helper':'browser-owner', delegateId=humanRole==='founder'?helperId:founderId;
  await login(owner,humanUser);await openStory(owner,'Human unfinished workflow fixture');
  await owner.getByRole('button',{name:'Reel 30s script',exact:true}).click();
  const headline=owner.getByLabel('Beat 1 On-screen text',{exact:true});await headline.fill('HUMAN UNSAVED A MUST REMAIN');
  const planDate=await owner.evaluate(()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()));
  const originalRevision=(await owner.locator('.workflow-context').innerText()).match(/· revision (\d+)/)[1];
  await owner.getByLabel('Proposal operator',{exact:true}).selectOption(delegateId);
  await lookup(owner,'Delegated backlog workflow fixture');await owner.getByLabel('Story to delegate',{exact:true}).selectOption(delegatedStoryId);
  await owner.getByLabel('Allowed proposal types',{exact:true}).selectOption('calendar');
  const granting=owner.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname.endsWith('/control/grants'));
  await owner.getByRole('button',{name:'Grant calendar proposals for 10 minutes',exact:true}).click();
  const response=await granting;expect(response.status()).toBe(201);const grant=await response.json();
  expect(grant.storyIds).toEqual([delegatedStoryId]);
  await expect(headline).toHaveValue('HUMAN UNSAVED A MUST REMAIN');await expect(owner.locator('.workflow-context')).toContainText('Human unfinished workflow fixture');
  await capture('S16-human-grant-B',owner);
  await login(helper,helperUser);await openStory(helper,'Delegated backlog workflow fixture');
  await expect(helper.getByRole('button',{name:'Generate four-format draft',exact:true})).toBeDisabled();
  await helper.getByLabel('Proposal action',{exact:true}).selectOption('assignment.place');
  await helper.getByLabel('Proposed date',{exact:true}).fill(planDate);
  await helper.getByRole('button',{name:'Load calendar observation',exact:true}).click();
  await expect(helper.getByRole('status').filter({hasText:/^Observed /})).toBeVisible();
  const proposing=helper.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname.endsWith('/control/proposals'));
  await grantRegion(helper,grant.id).getByRole('button',{name:'Propose calendar placement',exact:true}).click();
  const proposalResponse=await proposing;expect(proposalResponse.status()).toBe(201);const proposal=await proposalResponse.json();
  await refreshed(owner);const proposalRegion=owner.locator(`section[aria-label="Proposal ${proposal.id}"]`);
  await proposalRegion.getByRole('button',{name:'Approve exact proposal',exact:true}).click();
  await refreshed(helper);await headline.focus();
  await helper.locator(`section[aria-label="Proposal ${proposal.id}"]`).getByRole('button',{name:'Apply approved proposal',exact:true}).click();
  await expect(grantRegion(owner,grant.id).getByRole('heading',{name:/Proposal · applied/})).toBeVisible({timeout:12000});
  await expect(headline).toHaveValue('HUMAN UNSAVED A MUST REMAIN');await expect(headline).toBeFocused();
  await expect(owner.locator('.workflow-context')).toContainText(`revision ${originalRevision}`);
  await capture('S16-human-after-helper',owner);await capture('S23-helper-applied-B',helper);
  const bootstrap=await(await owner.request.get(base+'/api/studio/bootstrap'+scope)).json();
  const a=bootstrap.backlog.find(s=>s.id===fixtureStoryId), b=bootstrap.backlog.find(s=>s.id===delegatedStoryId);
  expect(a.revision).toBe(Number(originalRevision));expect(b.campaignDraft).toBeFalsy();expect(b.sourceClaims[0].status).toBe('unreviewed');
  expect(b.revision).toBe(proposal.changes[0].expectedRevision+1);
  await helper.reload();await expect(helper.locator('.workflow-context')).toContainText('Delegated backlog workflow fixture');await helper.getByRole('button',{name:'Return to backlog',exact:true}).click();await openStory(helper,'Delegated backlog workflow fixture');await expect(grantRegion(helper,grant.id).getByRole('heading',{name:/Proposal · applied/})).toBeVisible();
  await owner.getByRole('button',{name:'Return to backlog',exact:true}).click();
  await owner.getByLabel('Search stories',{exact:true}).fill('Delegated backlog workflow fixture');
  await expect(owner.locator(`.story-row[data-story-id="${delegatedStoryId}"]`)).toHaveAttribute('data-story-revision',String(b.revision));
  await expect(owner.locator(`.story-row[data-story-id="${delegatedStoryId}"]`)).toContainText('Scheduled');
  await owner.getByRole('button',{name:'Content calendar',exact:true}).click();await expect(owner.getByRole('region',{name:`Plans for ${planDate}`,exact:true})).toContainText('Delegated backlog workflow fixture');await capture('S23-human-calendar-result',owner);
  await owner.getByRole('button',{name:'Campaign Studio',exact:true}).click();await expect(headline).toHaveValue('HUMAN UNSAVED A MUST REMAIN');
  await capture('S04-unfinished-return',owner);
  const report={humanRole,proposalOperatorRole:humanRole==='founder'?'marketer':'founder',scenario:'Authenticated semantic helper; no model inference',viewport:{width:1280,height:720,deviceScaleFactor:1},planDate,storyAId:fixtureStoryId,storyBId:delegatedStoryId,grantId:grant.id,proposalId:proposal.id,revisionA:a.revision,revisionB:b.revision,sourceReviewB:b.sourceClaims[0].status,campaignB:b.campaignDraft||null,unsavedA:await headline.inputValue(),focusRetainedAfterHelper:true};
  await info.attach('performed-helper-journey',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  if(process.env.STUDIO_CAPTURE_HELPER_DELIVERY_DIR)writeFileSync(join(process.env.STUDIO_CAPTURE_HELPER_DELIVERY_DIR,`journey-${humanRole}.json`),JSON.stringify(report,null,2)+'\n');
 }finally{await ownerContext.close();await helperContext.close();}
});
test('delegation picker clears stale choices, reports failed searches and fences a late response after scope change',async({page})=>{
 await login(page,'browser-owner');await openStory(page,'Human unfinished workflow fixture');
 await page.getByLabel('Proposal operator',{exact:true}).selectOption(helperId);await lookup(page,'Delegated backlog workflow fixture');
 await page.getByLabel('Story to delegate',{exact:true}).selectOption(delegatedStoryId);
 await page.getByLabel('Find story for delegation',{exact:true}).fill('Different search');
 await expect(page.getByLabel('Story to delegate',{exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Grant metadata proposals for 10 minutes',exact:true})).toBeDisabled();
 const pattern='**/workspace/query?*';
 await page.route(pattern,route=>route.request().method()==='POST'&&route.request().postDataJSON()?.filters?.search==='Different search'?route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Controlled lookup outage'})}):route.continue());
 await page.getByRole('button',{name:'Search stories for delegation',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'Controlled lookup outage'})).toBeVisible();
 await expect(page.getByText('No matching stories in this brand.',{exact:false})).toHaveCount(0);await page.unroute(pattern);
 await lookup(page,'Delegated backlog workflow fixture');
 let release,entered,finished;const held=new Promise(r=>release=r),seen=new Promise(r=>entered=r),done=new Promise(r=>finished=r);
 await page.route(pattern,async route=>{if(new URL(route.request().url()).searchParams.get('brandId')!=='brand_default'||route.request().postDataJSON()?.filters?.search!=='Delegated backlog workflow fixture')return route.continue();const response=await route.fetch();entered();await held;try{await route.fulfill({response});}finally{finished();}});
 await page.getByRole('button',{name:'Search stories for delegation',exact:true}).click();await seen;
 await page.getByLabel('Brand',{exact:true}).selectOption('brand_vedic');await expect(page.locator('.story-row')).toHaveCount(5);
 release();await done;await page.unroute(pattern);
 await page.locator('.story-row').first().getByRole('button',{name:/Open story ↗/}).click();
 await page.getByText('Assistant actions',{exact:true}).click();await page.getByLabel('Grant target',{exact:true}).selectOption('other');
 await expect(page.getByLabel('Find story for delegation',{exact:true})).toHaveValue('');await expect(page.getByLabel('Story to delegate',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('article')).toHaveCount(0);
});
test('a late delegation lookup cannot repopulate a replacement authenticated session',async({page})=>{
 await login(page,'browser-owner');await openStory(page,'Human unfinished workflow fixture');
 await lookup(page,'Delegated backlog workflow fixture');
 let release,entered,finished;const held=new Promise(r=>release=r),seen=new Promise(r=>entered=r),done=new Promise(r=>finished=r);
 const pattern='**/workspace/query?*';
 await page.route(pattern,async route=>{if(route.request().postDataJSON()?.filters?.search!=='Delegated backlog workflow fixture')return route.continue();const response=await route.fetch();entered();await held;try{await route.fulfill({response});}finally{finished();}});
 try{
  await page.getByRole('button',{name:'Search stories for delegation',exact:true}).click();await seen;
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.getByLabel('Username',{exact:true})).toBeVisible();
  release();await done;await page.unroute(pattern);await login(page,'browser-helper');await openStory(page,'Human unfinished workflow fixture');
  await page.getByLabel('Grant target',{exact:true}).selectOption('other');
  await expect(page.getByLabel('Find story for delegation',{exact:true})).toHaveValue('');await expect(page.getByLabel('Story to delegate',{exact:true})).toHaveCount(0);
  await expect(page.getByLabel('Proposal operator',{exact:true})).toHaveValue('');
 }finally{release?.();await page.unroute(pattern);}
});
