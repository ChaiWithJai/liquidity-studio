import {test,expect} from '@playwright/test';
import {mkdtempSync,rmSync,writeFileSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {createPlatform} from '../server/platform.js';
import {createHttpServer} from '../server/index.js';
import {DurableStore} from '../server/storage.js';
import {campaignFromApprovedClaims} from '../server/source-integrity.js';
const out='/tmp/liquidity-calendar-canonical-output';
test.use({viewport:{width:1280,height:720},timezoneId:'America/New_York'});
test('canonical S22 stacked campaigns to S23 existing Reel assignment control',async({page})=>{
 const directory=mkdtempSync(join(tmpdir(),'calendar-canonical-')),password=randomBytes(24).toString('base64url');
 const platform=createPlatform({authMode:'password',store:new DurableStore(join(directory,'fixture.sqlite'))});await platform.ready;
 await platform.identity.provision({username:'calendar-evidence-founder',password,role:'founder'});
 const app=await platform.forScope({organizationId:'org_default',brandId:'brand_default'});
 await app.ports.repo.mutate(state=>({...state,backlog:[]}));
 const server=createHttpServer(null,{platform});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`,scope='?organizationId=org_default&brandId=brand_default';
 const captures=[],fixtures=[];let scheduleSubmissions=0;
 page.on('request',request=>{if(request.url().includes('/api/studio/schedule')&&request.method()==='POST')scheduleSubmissions++;});
 async function capture(step,action){const png=await page.screenshot({path:join(out,step+'.png'),fullPage:false});captures.push({step,action,recordedAt:new Date().toISOString(),viewport:page.viewportSize(),screenshot:step+'.png',sha256:createHash('sha256').update(png).digest('hex')});}
 try{
  await page.goto(base);await page.getByLabel('Username',{exact:true}).fill('calendar-evidence-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →'}).click();await expect(page.getByRole('heading',{name:'Good stories, next up.',exact:true})).toBeVisible();
  for(const title of ['Fixture campaign A','Fixture campaign B']){
   const created=await page.request.post(base+'/api/studio/backlog'+scope,{data:{title,category:'Controlled scheduling fixture',scheduledDay:'Monday',sourceClaims:[{id:randomUUID(),text:'Controlled editorial fixture text for examining scheduling controls.',sourceUrl:'https://example.org/controlled-scheduling-fixture',kind:'general',status:'approved'}]}});expect(created.status()).toBe(201);const story=(await created.json()).story;
   const generationId=randomUUID();await app.ports.repo.saveCampaignDraft(story.id,{...campaignFromApprovedClaims(story),provenance:{mode:'synthetic',generationId}});
   const current=await(await page.request.get(base+'/api/studio/workspace/stories/'+story.id+scope)).json();
   const calendar=await(await page.request.get(base+'/api/studio/workspace/calendar'+scope+'&startDate=2026-10-19&endDate=2026-10-25&timeZone=America%2FNew_York')).json();
   const target=Object.values(calendar.buckets).find(bucket=>bucket.date==='2026-10-19'&&bucket.timeZone==='America/New_York');
   const placed=await page.request.post(base+'/api/studio/workspace/mutations'+scope,{data:{idempotencyKey:randomUUID(),changes:[{kind:'assignment.place',storyId:story.id,expectedRevision:current.row.revision,unit:'campaign',date:'2026-10-19',timeZone:'America/New_York',targetBucketRevision:target?.revision||0}]}});expect(placed.ok()).toBeTruthy();const receipt=await placed.json();expect(receipt.outcomes[0].status).toBe('applied');fixtures.push({storyId:story.id,title,generationId,revision:receipt.outcomes[0].row.revision,assignment:receipt.outcomes[0].row.assignments[0],synthetic:true,providerInvoked:false});
  }
  await page.reload();await page.getByRole('button',{name:'Content calendar',exact:true}).click();await page.getByLabel('Calendar start date').fill('2026-10-19');await page.getByLabel('Calendar end date').fill('2026-10-25');await page.getByRole('button',{name:'Reload calendar',exact:true}).click();
  const monday=page.getByRole('region',{name:'Plans for 2026-10-19',exact:true});await expect(monday.locator('.workspace-story-button')).toHaveCount(2);await expect(page.getByRole('region',{name:'Plans for 2026-10-25',exact:true})).toBeVisible();
  await monday.evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
  const visibleCards=await monday.locator('.calendar-plan').evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect();return {top:box.top,bottom:box.bottom,inViewport:box.top>=0&&box.bottom<=innerHeight};}));expect(visibleCards.every(card=>card.inViewport)).toBeTruthy();
  await capture('S22','Return to the actual dated calendar: two controlled synthetic campaigns stack on Monday October 19; all seven dates remain visible.');
  await monday.getByRole('button',{name:fixtures[0].title,exact:true}).click();await expect(page.getByRole('heading',{name:fixtures[0].title,exact:true})).toBeVisible();await page.getByRole('button',{name:'Reel 30s script',exact:true}).click();
  const assignment=page.getByRole('button',{name:'Assign to calendar',exact:true});await page.getByLabel('Assigned day',{exact:true}).focus();await page.keyboard.press('Tab');await expect(assignment).toBeFocused();await expect(assignment).toBeVisible();
  await capture('S23','Open the existing Monday campaign, choose Reel, and keyboard-focus its compatibility assignment button without submitting; this retains the historical path for comparison with direct Move.');
  expect(scheduleSubmissions).toBe(0);
  const calendar=await(await page.request.get(base+'/api/studio/workspace/calendar'+scope+'&startDate=2026-10-19&endDate=2026-10-25&timeZone=America%2FNew_York')).json();expect(calendar.assignments).toHaveLength(2);expect(calendar.assignments.every(item=>item.date==='2026-10-19')).toBeTruthy();
  writeFileSync(join(out,'capture.json'),JSON.stringify({schemaVersion:1,sourceCommit:'c5844c1d00fb40fae65200319e87bfd96528b031',functionalSourceCommit:'32eec4652c3d35e2b4d2f1a955182742fdc1ccb6',auth:'isolated test-only password fixture; production remains Google-only',organization:'org_default',brand:'brand_default',fixtureSetup:'Fresh local SQLite repository; two API-created source records, pure synthetic excerpt drafts and two real typed dated-placement API mutations. No provider calls.',fixtures,captures,visibleCards,scheduleSubmissions,postCaptureAssignments:calendar.assignments,compiledIndexSha256:createHash('sha256').update(readFileSync(new URL('../dist/index.html',import.meta.url))).digest('hex')},null,2)+'\n');
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await platform.store.close();rmSync(directory,{recursive:true,force:true});}
});
