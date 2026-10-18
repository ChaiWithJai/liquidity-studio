import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { DurableStore } from '../server/storage.js';
import { createPlatform } from '../server/platform.js';
import { createHttpServer } from '../server/index.js';
import { BRAND_PRESETS } from '../server/domain.js';
import { campaignFromApprovedClaims } from '../server/source-integrity.js';
import { brandRevision } from '../server/multimodal-contract.js';
let server, store, output, base, config;
const password=randomBytes(24).toString('base64url');
test.beforeAll(async()=>{
 store=new DurableStore(':memory:');const platform=createPlatform({store,authMode:'password'});await platform.ready;
 await platform.identity.provision({username:'review-founder',password,role:'founder'});
 const scope={organizationId:'org_default',brandId:'brand_default',preset:'liquidity_desk'};
 const container=await platform.forScope(scope), repo=container.ports.repo;
 const story={id:'review-story',title:'Original review contract',revision:1,generationId:'review-generation',sourceClaims:[{id:'claim',text:'A controlled approved source excerpt for review integration.',sourceUrl:'https://example.org/review-fixture',status:'approved',kind:'general'}]};
 story.campaignDraft={...campaignFromApprovedClaims(story),provenance:{generationId:story.generationId,mode:'synthetic'}};
 const profile=structuredClone(BRAND_PRESETS.liquidity_desk);
 await repo.mutate(state=>({...state,backlog:[story],brandProfile:profile}));
 const user=(await store.get('identity')).users[0];
 const native=await platform.nativeEditor(scope,repo).create(user,{storyId:story.id,format:'infographic',expectedRevision:1,generationId:story.generationId,expectedBrandRevision:brandRevision(profile),idempotencyKey:'original_review_fixture'});
 config={...scope,id:native.id};
 const root=fileURLToPath(new URL('..',import.meta.url));output=mkdtempSync(path.join(tmpdir(),'liquidity-original-review-'));
 const priorNodeEnv=process.env.NODE_ENV;
 try {
  await build({root,configFile:false,plugins:[svelte()],logLevel:'error',build:{target:'esnext',outDir:output,emptyOutDir:true,rollupOptions:{input:path.join(root,'tests/fixtures/editor-review.html')}}});
 } finally { if(priorNodeEnv===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=priorNodeEnv; }
 const api=createHttpServer(null,{platform,nativeEditorEnabled:true});
 server=createServer((req,res)=>{
  const route=req.url.split('?')[0];if(route.startsWith('/api/'))return api.emit('request',req,res);
  if(route==='/fixture-config'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(config));}
  const file=path.resolve(output,'.'+route);if(!file.startsWith(output+path.sep)){res.statusCode=404;return res.end();}
  try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'application/javascript');res.end(readFileSync(file));}catch{res.statusCode=404;res.end();}
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{if(server)await new Promise(resolve=>server.close(resolve));if(output)rmSync(output,{recursive:true,force:true});store?.close();});
test('original review panel commits once after lost response and rejects a changed native version',async({page})=>{
 await page.request.post(`${base}/api/auth/login`,{data:{username:'review-founder',password}});
 await page.goto(`${base}/tests/fixtures/editor-review.html`);
 const panel=page.getByRole('region',{name:'Saved layout review',exact:true});let calls=0;const keys=[];
 await page.route('**/api/studio/native-editor/documents/*/review?*',async route=>{
  if(route.request().method()!=='POST')return route.continue();
  keys.push(route.request().postDataJSON().idempotencyKey);
  if(++calls===1){await route.fetch();return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Controlled lost response'})});}
  return route.continue();
 });
 await panel.getByRole('button',{name:'Begin review',exact:true}).click();await expect(panel.getByRole('alert')).toContainText('Retry the same action');
 await panel.getByRole('button',{name:'Begin review',exact:true}).click();expect(keys[0]).toBe(keys[1]);
 await panel.getByRole('button',{name:'Start post-production',exact:true}).click();await panel.getByRole('button',{name:'Submit final layout',exact:true}).click();await panel.getByRole('button',{name:'Approve saved layout',exact:true}).click();await expect(panel.getByRole('status')).toContainText('Approved');
 const endpoint=`${base}/api/studio/native-editor/documents/${config.id}?organizationId=${config.organizationId}&brandId=${config.brandId}`;
 const saved=await(await page.request.get(endpoint)).json();
 const changed=await page.request.post(endpoint,{data:{expectedRevision:saved.revision,document:saved.document,title:'Concurrent native title change',idempotencyKey:'concurrent_native_review_change'}});expect(changed.status()).toBe(200);
 await panel.getByRole('button',{name:'Reload review',exact:true}).click();await expect(panel.getByRole('alert')).toContainText('previous approval is historical');
 await panel.getByRole('button',{name:'Restart review for saved version',exact:true}).click();await expect(panel.getByRole('alert').filter({hasText:'Reload review'})).toContainText('Reload review');
 await page.getByRole('button',{name:'Reload saved native fixture',exact:true}).click();await panel.getByRole('button',{name:'Restart review for saved version',exact:true}).click();await expect(panel.getByRole('status')).toContainText('Draft ready');
 const review=await(await page.request.get(`${base}/api/studio/native-editor/documents/${config.id}/review?organizationId=${config.organizationId}&brandId=${config.brandId}`)).json();expect(review.revision).toBe(5);expect(review.history).toHaveLength(5);expect(review.approval).toBe(null);
});
