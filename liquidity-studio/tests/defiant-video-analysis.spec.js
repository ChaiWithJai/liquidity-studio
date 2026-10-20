// Hosted-only real UI/store path. The model HTTP boundary is a constructor fixture, never a live call.
import {test,expect} from '@playwright/test';
import {randomBytes,randomUUID} from 'node:crypto';
import {createPlatform} from '../server/platform.js';
import {DurableStore} from '../server/storage.js';
import {createHttpServer} from '../server/index.js';
import {DefiantStrategyService} from '../server/defiant-strategy.js';
import {AIGateway} from '../server/gateway.js';
test('manager analyzes a source without files, saves an addressable moment and retains it in a campaign brief',async({page})=>{
 const platform=createPlatform({store:new DurableStore(':memory:'),authMode:'password'});await platform.ready;
 const password=randomBytes(24).toString('base64url');await platform.identity.provision({username:'moment-founder',password,role:'founder'});
 const actor=(await platform.identity.login('moment-founder',password)).user,org=await platform.identity.createOrganization(actor,'Video moment practice');
 const strategy=new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:org.id});await strategy.enable(actor,{});
 const input=value=>({expectedRevision:platform.store.get(strategy.key).revision,idempotencyKey:randomUUID(),...value});
 const preview=await strategy.previewInbox(actor,{kind:'nipsey-example'});await strategy.importInbox(actor,input({kind:preview.kind,previewDigest:preview.previewDigest}));
 const box=platform.store.get(strategy.key).inbox,source=box.sources[0],recording=box.recordings[0];let calls=0;
 platform.videoAnalysisGateway=new AIGateway({provider:'gcp-vertex',model:'gemini-fixture',projectId:'hosted-fixture-project',location:'global',accessTokenProvider:async()=> 'hosted-fixture-token',fetch:async(url,options)=>{
  calls++;expect(String(url)).toContain(':generateContent');const sent=JSON.parse(options.body);expect(sent.contents[0].parts[0].fileData.fileUri).toBe(source.sourceUrl);expect(sent.contents[0].parts[0].videoMetadata).toEqual({startOffset:'0s',endOffset:'60s'});
  return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({moments:[{startSeconds:8,endSeconds:22,context:'Proposed source context, check the full video.',recordingId:recording.id,recordingFit:'Possible thematic fit, not a verified match.'}]})}]}}],usageMetadata:{promptTokenCount:20,candidatesTokenCount:30,totalTokenCount:50}}),{status:200,headers:{'Content-Type':'application/json'}});
 }});
 const server=createHttpServer(null,{platform});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  await page.goto(base+`/?org=${org.id}&tab=strategy&view=inbox&source=${encodeURIComponent(source.id)}`);
  await page.getByLabel('Username',{exact:true}).fill('moment-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →',exact:true}).click();
  const detail=page.getByRole('complementary',{name:'Source inspector'}),analysis=detail.getByRole('region',{name:'Analyze source video'});
  await analysis.getByRole('button',{name:'Analyze YouTube source',exact:true}).click();await expect(analysis).toContainText('Analysis ready. Review the proposed moments.');
  await analysis.getByLabel('Proposed in (seconds)',{exact:true}).fill('9');await analysis.getByLabel('Moment context',{exact:true}).fill('Manager revised context for later verification.');
  await expect(analysis.getByRole('link',{name:'Open source at proposed time ↗'})).toHaveAttribute('href',source.sourceUrl+'&t=9s');
  await expect(analysis.getByRole('button',{name:'Use saved moment in clip settings'})).toBeDisabled();
  await analysis.getByRole('button',{name:'Save proposed moment',exact:true}).click();await expect(analysis.getByText('Proposed moment saved',{exact:true})).toBeVisible();await expect(page).toHaveURL(/moment=/);const momentUrl=page.url();
  await page.reload();await expect(page).toHaveURL(momentUrl);await expect(analysis.getByLabel('Moment context',{exact:true})).toHaveValue('Manager revised context for later verification.');await expect(analysis.getByLabel('Proposed in (seconds)',{exact:true})).toHaveValue('9');expect(calls).toBe(1);
  await analysis.getByRole('button',{name:'Use saved moment in clip settings'}).click();const clip=detail.getByRole('group',{name:'Create a source clip'});
  await expect(clip.getByLabel('Start (seconds)',{exact:true})).toHaveValue('9');await expect(clip.getByRole('button',{name:'Save segment',exact:true})).toBeDisabled();
  await clip.getByRole('button',{name:'Discard segment changes',exact:true}).click();
  await detail.getByLabel('Report title',{exact:true}).fill('A proposed video moment');await detail.getByRole('button',{name:'Add source to report',exact:true}).click();
  const planning=page.getByRole('region',{name:'Shared planning'});await expect(planning.getByRole('region',{name:'Retained proposed moments'})).toContainText('Manager revised context for later verification.');
  await planning.getByText('Create a draft from this report',{exact:true}).click();await planning.getByText('Create a separate draft destination',{exact:true}).click();await planning.getByLabel('Destination name',{exact:true}).fill('Moment proposals');await planning.getByRole('button',{name:'Create draft destination',exact:true}).click();await planning.getByLabel('Objective',{exact:true}).fill('Review the proposed source moment');await planning.getByLabel('Proposed deliverables, one per line (up to 16)',{exact:true}).fill('Source-led segment brief');await planning.getByRole('button',{name:'Create review-required draft',exact:true}).click();await planning.getByRole('link',{name:'Open draft in Campaign Studio →'}).click();
  const brief=page.getByRole('region',{name:'Strategy draft brief'});await expect(brief.getByRole('region',{name:'Retained proposed moments'})).toContainText('9–22 seconds');await page.reload();await expect(brief).toContainText('Manager revised context for later verification.');expect(calls).toBe(1);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await platform.store.close();}
});
