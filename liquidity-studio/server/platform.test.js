import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {DurableStore} from './storage.js';import {createPlatform} from './platform.js';import {createHttpServer} from './index.js';
const password='test-only-password-482!';
async function fixture(t,filename=':memory:'){
 const store=new DurableStore(filename);const platform=createPlatform({store});await platform.identity.provision({username:'founder',password,role:'founder'});await platform.identity.provision({username:'marketer',password,role:'marketer'});
 const server=createHttpServer(null,{platform});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{await new Promise(resolve=>server.close(resolve));store.close();});
 const base=`http://127.0.0.1:${server.address().port}`;let cookie='';
 const api=async(route,body,scope='organizationId=org_default&brandId=brand_default')=>{const response=await fetch(base+route+(route.includes('?')?'&':'?')+scope,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});return response;};
 const login=async(username='founder')=>{const response=await api('/api/auth/login',{username,password});cookie=response.headers.get('set-cookie').split(';')[0];assert.equal(response.status,200);return response.json();};return {store,platform,server,base,api,login};
}
test('default HTTP is private and checks scope, role, bodies, and origins',async t=>{
 const f=await fixture(t);assert.equal((await f.api('/api/admin/overview')).status,401);await f.login('marketer');assert.equal((await f.api('/api/admin/overview')).status,403);assert.equal((await f.api('/api/studio/bootstrap',undefined,'organizationId=other&brandId=brand_default')).status,403);
 assert.equal((await f.api('/api/studio/schedule',{storyId:'missing',scheduledDay:'Neverday'})).status,400);
 const hostile=await fetch(f.base+'/api/auth/login',{method:'POST',headers:{Origin:'https://attacker.example','Content-Type':'application/json'},body:'{}'});assert.equal(hostile.status,403);
 const malformed=await fetch(f.base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(malformed.status,400);
 const huge=await fetch(f.base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(262145)});assert.equal(huge.status,413);
 const traverse=await fetch(f.base+'/%2e%2e%2fpackage.json');assert.equal(traverse.status,400);
});
test('scoped drafts, edits, feedback, calendar and real downloads survive restart and ejection',async t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'liquidity-api-'));t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
 const f=await fixture(t,path.join(directory,'data.sqlite'));await f.login();
 const input={title:'Sourced rights deal',sourceClaims:[{id:'claim1',text:'A $10 million rights deal was reported.',sourceUrl:'https://example.com/report',status:'approved'}]};
 const add=await f.api('/api/studio/backlog',input);assert.equal(add.status,201);const {story}=await add.json();
 process.env.AI_ALLOW_SYNTHETIC='true';t.after(()=>delete process.env.AI_ALLOW_SYNTHETIC);
 const generated=await f.api('/api/studio/generate-campaign',{storyId:story.id});assert.equal(generated.status,200);const output=await generated.json();
 assert.equal(output.campaign.provenance.mode,'synthetic');
 const saved=await f.api('/api/studio/save-edit',{storyId:story.id,format:'reel',content:{...output.campaign.reel,closingCta:'Human approved ending'}});assert.equal(saved.status,200);
 const exported=await f.api('/api/studio/export-asset',{storyId:story.id,format:'reel'});assert.equal(exported.status,201);const artifact=await exported.json();const download=await fetch(f.base+artifact.downloadUrl,{headers:{Cookie:(await f.api('/api/auth/login',{username:'founder',password})).headers.get('set-cookie').split(';')[0]}});assert.equal(download.status,200);assert.match(await download.text(),/Human approved ending/);
 assert.equal((await f.api('/api/studio/bootstrap',undefined,'organizationId=org_default&brandId=brand_vedic')).status,200);assert.equal((await f.api(`/api/studio/assets/${artifact.exportId}`,undefined,'organizationId=org_default&brandId=brand_vedic')).status,404);
 const reopened=new DurableStore(path.join(directory,'data.sqlite'));const platform=createPlatform({store:reopened});const repo=(await platform.forScope({organizationId:'org_default',brandId:'brand_default'})).ports.repo;assert.equal((await repo.listBacklog()).find(row=>row.id===story.id).campaignDraft.reel.closingCta,'Human approved ending');reopened.close();
 const bundle=await (await f.api('/api/admin/eject')).json();assert.equal(bundle.schemaVersion,1);assert.doesNotMatch(JSON.stringify(bundle),/passwordHash|studio_session/);
});
