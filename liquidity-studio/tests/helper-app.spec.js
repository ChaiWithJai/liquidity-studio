import {test,expect} from '@playwright/test';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {createPlatform} from '../server/platform.js';
import {createHttpServer} from '../server/index.js';
import {DurableStore} from '../server/storage.js';
let directory,platform,server,base,helperId,storyId;
const password=randomBytes(24).toString('base64url');
const scope='?organizationId=org_default&brandId=brand_default';
test.beforeAll(async()=>{
 directory=mkdtempSync(join(tmpdir(),'helper-mounted-'));
 process.env.AI_ALLOW_SYNTHETIC='true';
 platform=createPlatform({authMode:'password',store:new DurableStore(join(directory,'studio.sqlite'))});await platform.ready;
 for(const [username,role] of [['mounted-owner','founder'],['mounted-helper','marketer']])await platform.identity.provision({username,role,password});
 helperId=(await platform.store.get('identity')).users.find(u=>u.username==='mounted-helper').id;
 server=createHttpServer(null,{platform,helperControlEnabled:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));await platform.store.close();rmSync(directory,{recursive:true,force:true});});
async function login(page,username){await page.goto(base);await page.getByLabel('Username',{exact:true}).fill(username);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →'}).click();await expect(page.locator('.story-row').first()).toBeVisible();}
async function openFixture(page){await page.getByLabel('Search stories',{exact:true}).fill('Mounted shared fixture');await expect(page.locator('.story-row')).toHaveCount(1);await page.getByRole('button',{name:'Open draft ↗',exact:true}).click();await expect(page.getByLabel('Headline',{exact:true})).toBeVisible();await page.getByText('Assistant actions',{exact:true}).click();await expect(page.getByRole('heading',{name:'Shared control',exact:true})).toBeVisible();}
async function seed(page){const added=await page.request.post(base+'/api/studio/backlog'+scope,{data:{title:'Mounted shared fixture',category:'Original mounted category',sourceClaims:[{id:'mounted-source',text:'The source describes a signed media agreement.',sourceUrl:'https://example.org/source',kind:'general',status:'approved'}]}});expect(added.status()).toBe(201);const data=await added.json();storyId=data.story.id;const generated=await page.request.post(base+'/api/studio/generate-campaign'+scope,{data:{storyId}});expect(generated.ok()).toBeTruthy();await page.reload();}
async function grantAndPropose(owner,helper,category){await owner.getByLabel('Proposal operator',{exact:true}).selectOption(helperId);await owner.getByRole('button',{name:'Grant metadata proposals for 10 minutes',exact:true}).click();await helper.getByRole('button',{name:'Refresh shared control',exact:true}).click();await expect(helper.getByRole('article')).toHaveCount(1);await helper.getByLabel('Proposed category',{exact:true}).fill(category);await helper.getByRole('button',{name:'Propose category change',exact:true}).click();await owner.getByRole('button',{name:'Refresh shared control',exact:true}).click();await owner.getByRole('button',{name:'Approve exact proposal',exact:true}).click();await helper.getByRole('button',{name:'Refresh shared control',exact:true}).click();}

test('mounted two-actor helper receipt refresh preserves human dirty buffers, base and focus',async({browser})=>{
 const oc=await browser.newContext(),hc=await browser.newContext();const owner=await oc.newPage(),helper=await hc.newPage();
 try{
  await login(owner,'mounted-owner');await seed(owner);await login(helper,'mounted-helper');await openFixture(owner);await openFixture(helper);
  await grantAndPropose(owner,helper,'Helper committed category');
  const headline=owner.getByLabel('Headline',{exact:true});await headline.fill('HUMAN UNSAVED WORDING');await headline.focus();
  const before=await owner.locator('.workflow-context').innerText();
  const applyKeys=[];helper.on('request',request=>{if(request.method()==='POST'&&/\/proposals\/[^/]+\/apply/.test(request.url()))applyKeys.push(request.postDataJSON().idempotencyKey);});
  const applyPattern='**/workspace/control/proposals/*/apply?*';
  await helper.route(applyPattern,async route=>{await route.fetch();await route.abort('failed');});
  await helper.getByRole('button',{name:'Apply approved proposal',exact:true}).click();
  await expect(helper.getByRole('button',{name:'Retry same application',exact:true})).toBeVisible();
  await expect(owner.getByRole('alert').filter({hasText:'A newer saved revision'})).toBeVisible({timeout:12000});
  await expect(headline).toHaveValue('HUMAN UNSAVED WORDING');await expect(headline).toBeFocused();await expect(owner.locator('.workflow-context')).toContainText('Unsaved artwork changes');
  await helper.getByRole('button',{name:'Refresh shared control',exact:true}).click();
  await expect(helper.getByRole('button',{name:'Retry same application',exact:true})).toBeVisible();
  await helper.unroute(applyPattern);await helper.getByRole('button',{name:'Retry same application',exact:true}).click();await expect(helper.getByRole('button',{name:'Retry same application',exact:true})).toHaveCount(0);
  expect(applyKeys).toHaveLength(2);expect(applyKeys[0]).toBe(applyKeys[1]);
  const current=await(await owner.request.get(base+'/api/studio/bootstrap'+scope)).json();const story=current.backlog.find(s=>s.id===storyId);expect(story.category).toBe('Helper committed category');expect(story.revision).toBe(Number(before.match(/· revision (\d+)/)[1])+1);
  // The old optimistic base still rejects a save rather than overwriting the helper's metadata.
  await owner.getByRole('button',{name:'Save changes',exact:true}).click();await expect(owner.getByRole('alert').filter({hasText:'Draft changed'})).toBeVisible();await expect(headline).toHaveValue('HUMAN UNSAVED WORDING');
  await owner.getByRole('button',{name:'Discard local edits and load saved story',exact:true}).click();
  await owner.getByRole('button',{name:'Review sources',exact:true}).click();
  const claim=owner.getByLabel('Claim text',{exact:true});await claim.fill('HUMAN UNSAVED SOURCE REVIEW');
  await helper.getByLabel('Proposed category',{exact:true}).fill('Second helper category');await helper.getByRole('button',{name:'Propose category change',exact:true}).click();
  await owner.getByRole('button',{name:'Refresh shared control',exact:true}).click();await owner.getByRole('button',{name:'Approve exact proposal',exact:true}).click();await helper.getByRole('button',{name:'Refresh shared control',exact:true}).click();await claim.focus();
  await helper.getByRole('button',{name:'Apply approved proposal',exact:true}).click();
  await expect(owner.getByRole('alert').filter({hasText:'A newer saved revision'})).toBeVisible({timeout:12000});await expect(claim).toHaveValue('HUMAN UNSAVED SOURCE REVIEW');await expect(claim).toBeFocused();await expect(owner.locator('.workflow-context')).toContainText('Unsaved source review');
  await owner.getByRole('button',{name:'Save source review',exact:true}).click();await expect(owner.getByRole('alert').filter({hasText:'Story changed'})).toBeVisible();await expect(claim).toHaveValue('HUMAN UNSAVED SOURCE REVIEW');

 }finally{await oc.close();await hc.close();}
});

test('mounted helper state cannot return after brand/session switch and disabled capability hides control',async({browser})=>{
 const context=await browser.newContext();const page=await context.newPage();let release;
 try{
  await login(page,'mounted-helper');await openFixture(page);
  await page.getByLabel('Proposed category',{exact:true}).fill('Private old-session buffer');
  let captured,completed;const seen=new Promise(r=>captured=r);const gate=new Promise(r=>release=r);const finished=new Promise(r=>completed=r);
  await page.route('**/workspace/control?*',async route=>{if(route.request().method()!=='GET')return route.continue();const response=await route.fetch();captured();await gate;try{await route.fulfill({response});}finally{completed();}});
  await page.getByRole('button',{name:'Refresh shared control',exact:true}).click();await seen;
  await page.getByLabel('Brand',{exact:true}).selectOption('brand_vedic');await expect(page.getByLabel('Search stories',{exact:true})).toHaveValue('');await expect(page.locator('.story-row')).toHaveCount(5);
  release();await finished;await page.unroute('**/workspace/control?*');
  await page.locator('.story-row').first().getByRole('button',{name:'Open story ↗',exact:true}).click();await page.getByText('Assistant actions',{exact:true}).click();await expect(page.getByRole('article')).toHaveCount(0);await expect(page.getByLabel('Proposed category',{exact:true})).toHaveCount(0);await expect(page.getByText('Proposal inputs appear when you receive an active grant for this story.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.getByLabel('Username',{exact:true})).toBeVisible();await login(page,'mounted-owner');await expect(page.getByRole('heading',{name:'Shared control',exact:true})).toHaveCount(0);await openFixture(page);await expect(page.getByLabel('Proposed category',{exact:true})).toHaveCount(0);await expect(page.getByText('Proposal inputs appear when you receive an active grant for this story.',{exact:true})).toBeVisible();await expect(page.getByLabel('Proposal operator',{exact:true})).toHaveValue('');
  // Rejoin the original active incoming grant as the same existing helper:
  // the previously typed private buffer must actually be empty when fields return.
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.getByLabel('Username',{exact:true})).toBeVisible();await login(page,'mounted-helper');await openFixture(page);await expect(page.getByLabel('Proposed category',{exact:true})).toHaveValue('');
  // A separate default-off HTTP service serves the same real App build.
  const off=createHttpServer(null,{platform,helperControlEnabled:false});await new Promise(r=>off.listen(0,'127.0.0.1',r));
  const offContext=await browser.newContext();const offPage=await offContext.newPage();
  try{const offBase=`http://127.0.0.1:${off.address().port}`;await offPage.goto(offBase);await offPage.getByLabel('Username',{exact:true}).fill('mounted-owner');await offPage.getByLabel('Password',{exact:true}).fill(password);await offPage.getByRole('button',{name:'Sign in →'}).click();await expect(offPage.locator('.story-row').first()).toBeVisible();await offPage.locator('.story-row').first().getByRole('button',{name:/Open (story|draft)/}).click();await expect(offPage.locator('.workflow-context')).toBeVisible();await expect(offPage.getByText('Assistant actions',{exact:true})).toHaveCount(0);}
  finally{await offContext.close();off.closeAllConnections();await new Promise(r=>off.close(r));}
 }finally{release?.();await context.close();}
});
