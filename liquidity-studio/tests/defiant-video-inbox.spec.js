// Hosted-only complete inbox-to-existing-editor contract using real auth/API/store.
import {test,expect} from '@playwright/test';
import {randomBytes,randomUUID} from 'node:crypto';
import {DefiantStrategyService} from '../server/defiant-strategy.js';
import {DefiantYouTube} from '../server/defiant-youtube.js';
import {createPlatform} from '../server/platform.js';
import {DurableStore} from '../server/storage.js';
import {createHttpServer} from '../server/index.js';
test('manager imports a source pack and retains the proposed match, note and source-only campaign brief',async({page})=>{
 const platform=createPlatform({store:new DurableStore(':memory:'),authMode:'password'});await platform.ready;const password=randomBytes(24).toString('base64url');await platform.identity.provision({username:'video-founder',password,role:'founder'});const actor=(await platform.identity.login('video-founder',password)).user,org=await platform.identity.createOrganization(actor,'Source-first label'),server=createHttpServer(null,{platform});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  await page.goto(base+`/?org=${org.id}&tab=strategy&view=inbox`);await page.getByLabel('Username',{exact:true}).fill('video-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →',exact:true}).click();await page.getByRole('button',{name:'Enable strategy for this organization',exact:true}).click();
  const inbox=page.getByRole('region',{name:'Creator videos inbox',exact:true});await expect(inbox.getByText('Your source inbox is empty',{exact:true})).toBeVisible();await inbox.getByRole('button',{name:'Preview Nipsey example pack',exact:true}).click();await expect(inbox.getByRole('region',{name:'Source import preview'})).toContainText('sources: 45 new');await inbox.getByRole('button',{name:'Add these sources',exact:true}).click();await expect(inbox).toContainText('45 of 45 sources');
  await inbox.getByRole('combobox',{name:'Reference pack',exact:true}).selectOption('nipsey-historical20');await inbox.getByRole('button',{name:'Preview historical sample pack',exact:true}).click();
  await expect(inbox.getByRole('region',{name:'Source import preview'})).toContainText('sources: 20 new');await expect(inbox).toContainText('45 of 45 sources');
  await inbox.getByRole('button',{name:'Add these sources',exact:true}).click();await expect(inbox).toContainText('65 of 65 sources');
  await inbox.getByRole('combobox',{name:'Cohort',exact:true}).selectOption('historical-sample');await expect(page).toHaveURL(/cohort=historical-sample/);await expect(inbox).toContainText('20 of 65 sources');await page.reload();await expect(inbox.getByRole('combobox',{name:'Cohort',exact:true})).toHaveValue('historical-sample');await expect(inbox).toContainText('20 of 65 sources');
  await inbox.getByRole('button',{name:'Nipsey Hussle at The Breakfast Club Power 105.1 | Breakfast Club Classics',exact:true}).click();const historical=inbox.getByRole('complementary',{name:'Source inspector'});await historical.getByText('Historical sample reference · supplied and unverified',{exact:true}).click();await expect(historical).toContainText('Provided 2026-10-19; observation date unknown.');await historical.getByText('Original supplied proposal',{exact:true}).click();await expect(historical).toContainText('Supplied proposals do not establish clearance.');
  await inbox.getByRole('combobox',{name:'Cohort',exact:true}).selectOption('all');
  await inbox.getByRole('combobox',{name:'Workstream',exact:true}).first().selectOption('nipsey:workstream:3');await inbox.getByRole('button',{name:"Shady Blue Talks About the Shootout at the Beach Nipsey Hussle Rapped About on 'Blue Laces 2'",exact:true}).click();await expect(page).toHaveURL(/source=youtube%3AhHtx_yhEm84/);const detail=inbox.getByRole('complementary',{name:'Source inspector'});await expect(detail.getByRole('link',{name:'Open source on YouTube ↗'})).toHaveAttribute('href','https://www.youtube.com/watch?v=hHtx_yhEm84');await expect(detail).toContainText('Analyze the source link first, or open it on YouTube. Supply permitted files only when you are ready to render.');
  await detail.getByLabel('Why this song fits',{exact:true}).fill('Compare this supplied account with the recording before selecting a moment.');await detail.getByRole('combobox',{name:'Planning stage',exact:true}).selectOption('considering');await detail.getByRole('button',{name:'Save proposed match',exact:true}).click();await expect(inbox.getByText('Proposed match saved',{exact:true})).toBeVisible();await detail.getByLabel('Your note',{exact:true}).fill('Inspect the full source and verify context.');await detail.getByRole('button',{name:'Save source note',exact:true}).click();await expect(inbox).toContainText('Shared note saved');
  await page.reload();await expect(detail.getByLabel('Why this song fits',{exact:true})).toHaveValue('Compare this supplied account with the recording before selecting a moment.');await expect(detail).toContainText('Inspect the full source and verify context.');await detail.getByLabel('Report title',{exact:true}).fill('Our source-to-song brief');await detail.getByRole('button',{name:'Add source to report',exact:true}).click();
  const planning=page.getByRole('region',{name:'Shared planning',exact:true});
  await expect(planning.getByRole('region',{name:'Retained creator sources'})).toContainText('Blue Laces 2');
  await page.setViewportSize({width:1051,height:868});await page.reload();await page.evaluate(()=>window.scrollTo(0,0));
  await expect(planning.getByRole('heading',{name:'Our source-to-song brief',exact:true})).toBeInViewport();
  await expect(page.getByText('Add references',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Your references',exact:true})).toHaveCount(0);
  await page.getByRole('navigation',{name:'Defiant task views'}).getByRole('button',{name:'Explore',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Your references',exact:true})).toBeVisible();
  await page.goBack();await expect(planning.getByRole('heading',{name:'Our source-to-song brief',exact:true})).toBeInViewport();
  await planning.getByText('Create a draft from this report',{exact:true}).click();await planning.getByText('Create a separate draft destination',{exact:true}).click();await planning.getByLabel('Destination name',{exact:true}).fill('Nipsey draft proposals');await planning.getByRole('button',{name:'Create draft destination',exact:true}).click();await expect(planning).toContainText('Draft destination created');await planning.getByLabel('Objective',{exact:true}).fill('Review a possible source-to-song short');await planning.getByLabel('Proposed deliverables, one per line (up to 16)',{exact:true}).fill('Source-led campaign brief');await planning.getByRole('button',{name:'Create review-required draft',exact:true}).click();await planning.getByRole('link',{name:'Open draft in Campaign Studio →',exact:true}).click();
  const brief=page.getByRole('region',{name:'Strategy draft brief',exact:true});await expect(brief).toContainText('Review a possible source-to-song short');await expect(brief).toContainText('Blue Laces 2');await expect(brief).toContainText('Inspect the full source and verify context.');await expect(brief.getByRole('link',{name:'Return to saved report ↗'})).toHaveAttribute('href',/view=report/);await page.reload();await expect(brief).toContainText('Compare this supplied account with the recording before selecting a moment.');
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await platform.store.close();}
});

test('manager saves reactive search queries and reopens them without a configured provider',async({page})=>{
 const platform=createPlatform({store:new DurableStore(':memory:'),authMode:'password'});await platform.ready;
 const password=randomBytes(24).toString('base64url');await platform.identity.provision({username:'query-founder',password,role:'founder'});
 const actor=(await platform.identity.login('query-founder',password)).user,org=await platform.identity.createOrganization(actor,'Manual query practice');
 const server=createHttpServer(null,{platform});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  await page.goto(base+`/?org=${org.id}&tab=strategy&view=inbox`);
  await page.getByLabel('Username',{exact:true}).fill('query-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →',exact:true}).click();
  await page.getByRole('button',{name:'Enable strategy for this organization',exact:true}).click();
  const inbox=page.getByRole('region',{name:'Creator videos inbox',exact:true});
  await inbox.getByText('Find more creator videos',{exact:true}).click();
  await inbox.getByRole('button',{name:'Add query',exact:true}).click();
  await inbox.getByRole('textbox',{name:'Query 1',exact:true}).fill('Nipsey source interview engineering practice');
  const saved=page.waitForResponse(response=>response.url().endsWith('/inbox/discovery/queries')&&response.request().method()==='POST');
  await inbox.getByRole('button',{name:'Save queries',exact:true}).click();expect((await saved).status()).toBe(200);
  await expect(inbox.getByText('Search queries saved',{exact:true})).toBeVisible();
  const before=await (await page.request.get(base+`/api/studio/strategy/${org.id}/inbox/discovery`)).json();
  expect(before.queries).toHaveLength(1);expect(before.queries[0].query).toBe('Nipsey source interview engineering practice');expect(before.configured).toBe(false);
  await page.reload();await inbox.getByText('Find more creator videos',{exact:true}).click();
  await expect(inbox.getByRole('textbox',{name:'Query 1',exact:true})).toHaveValue(before.queries[0].query);
  await expect(inbox.getByRole('button',{name:'Save queries',exact:true})).toBeDisabled();
  await expect(inbox.getByRole('button',{name:'Run search',exact:true})).toBeDisabled();
  await expect(inbox).toContainText('Live search is not configured. You can save queries and work with supplied references.');
  const after=await (await page.request.get(base+`/api/studio/strategy/${org.id}/inbox/discovery`)).json();expect(after.queries).toEqual(before.queries);expect(after.lastRun).toBeNull();
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await platform.store.close();}
});

test('source inspector identifies dated API counts and keeps imported counts separate on reload',async({page})=>{
 const platform=createPlatform({store:new DurableStore(':memory:'),authMode:'password'});await platform.ready;
 const password=randomBytes(24).toString('base64url');await platform.identity.provision({username:'history-founder',password,role:'founder'});
 const actor=(await platform.identity.login('history-founder',password)).user,org=await platform.identity.createOrganization(actor,'Observation history');
 const strategy=new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:org.id});await strategy.enable(actor,{});
 const input=x=>({expectedRevision:platform.store.get(strategy.key).revision,idempotencyKey:randomUUID(),...x});
 const preview=await strategy.previewInbox(actor,{kind:'nipsey-example'});await strategy.importInbox(actor,input({kind:'nipsey-example',previewDigest:preview.previewDigest}));
 const source=platform.store.get(strategy.key).inbox.sources[0];let views=42;
 const service=new DefiantYouTube(strategy,{search:async()=>({items:[{videoId:source.videoId,title:'API refreshed title',creator:'API creator',statistics:{views,likes:3}}],quota:{searchCalls:1,videoListCalls:1}})});
 await service.queries(actor,input({queries:[{id:'history',query:'Source history'}]}));await service.run(actor,input({queryId:'history'}));views=48;await service.run(actor,input({queryId:'history'}));
 const checked=(await service.project(actor,{sourceId:source.id})).selected.liveMetadata.observedAt;
 const server=createHttpServer(null,{platform});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  await page.goto(base+`/?org=${org.id}&tab=strategy&view=inbox&source=${encodeURIComponent(source.id)}`);
  await page.getByLabel('Username',{exact:true}).fill('history-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →',exact:true}).click();
  const detail=page.getByRole('complementary',{name:'Source inspector'});
  await expect(detail).toContainText('API refreshed title');await expect(detail).toContainText(checked);await expect(detail).toContainText('3 · YouTube API');
  await detail.getByText('YouTube observation history (2)',{exact:true}).click();const history=detail.getByRole('table',{name:'YouTube observation history'});
  await expect(history.getByRole('row')).toHaveCount(3);await expect(history).toContainText('Unknown');
  await detail.getByText('Imported counts · observation date unknown',{exact:true}).click();await expect(detail).toContainText('Supplied example, not independently verified');
  await page.reload();await expect(detail).toContainText(checked);await expect(detail).toContainText('YouTube observation history (2)');
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await platform.store.close();}
});
