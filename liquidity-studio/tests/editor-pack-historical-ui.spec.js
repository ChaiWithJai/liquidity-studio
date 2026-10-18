import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {build} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {DurableStore} from '../server/storage.js';
import {createPlatform} from '../server/platform.js';
import {createHttpServer} from '../server/index.js';
import {campaignFromApprovedClaims} from '../server/source-integrity.js';
import {brandRevision} from '../server/multimodal-contract.js';
let server,store,output,base,record,query;
const password=randomBytes(24).toString('base64url');
test.beforeAll(async()=>{
 store=new DurableStore(':memory:');const platform=createPlatform({store,authMode:'password'});await platform.ready;
 await platform.identity.provision({username:'historical-founder',password,role:'founder'});
 const actor=(await store.get('identity')).users[0],scope=await platform.identity.authorize(actor,'org_default','brand_default'),container=await platform.forScope(scope),repo=container.ports.repo;
 const story={id:'historical-source-fixture',title:'Historical-only UI contract',revision:1,generationId:'fixture-generation',sourceClaims:[{id:'claim',text:'A disposable controlled excerpt for the historical recovery UI contract.',sourceUrl:'https://example.org/historical',kind:'general',status:'approved'}]};
 story.campaignDraft={...campaignFromApprovedClaims(story),provenance:{generationId:story.generationId,mode:'synthetic'}};
 await repo.mutate(state=>({...state,backlog:[story]}));
 const native=platform.nativeEditor(scope,repo);
 record=await native.create(actor,{storyId:story.id,format:'infographic',expectedRevision:1,generationId:story.generationId,expectedBrandRevision:brandRevision(await repo.getBrandProfile()),idempotencyKey:'historical_ui_contract_creation'});
 // Trusted persistence fixture mirrors the marker computed by portable installation.
 await store.update(native.key(record.id),value=>({...value,origin:{...value.origin,requiresSourceReview:true}}));
 query='organizationId=org_default&brandId=brand_default';
 const root=fileURLToPath(new URL('..',import.meta.url));output=mkdtempSync(path.join(tmpdir(),'liquidity-historical-ui-'));
 const prior=process.env.NODE_ENV;
 try{await build({root,configFile:false,plugins:[svelte()],logLevel:'error',build:{target:'esnext',outDir:output,emptyOutDir:true,rollupOptions:{input:path.join(root,'tests/fixtures/native-editor-host.html')}}});}
 finally{if(prior===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=prior;}
 const api=createHttpServer(null,{platform,nativeEditorEnabled:true});
 server=createServer((req,res)=>{
  const route=req.url.split('?')[0];if(route.startsWith('/api/'))return api.emit('request',req,res);
  if(route==='/fixture-config'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify([{id:record.id,brandId:'brand_default',label:'Historical layout'}]));}
  const file=path.resolve(output,'.'+route);if(!file.startsWith(output+path.sep)){res.statusCode=404;return res.end();}
  try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'application/javascript');res.end(readFileSync(file));}catch{res.statusCode=404;res.end();}
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{if(server)await new Promise(resolve=>server.close(resolve));if(output)rmSync(output,{recursive:true,force:true});store?.close();});
test('historical native recovery shows its reason without writable frame, broker, approval, cutout or export initialization',async({page})=>{
 const calls=[];page.on('request',request=>{if(request.url().startsWith(base))calls.push(new URL(request.url()).pathname);});
 await page.request.post(`${base}/api/auth/login`,{data:{username:'historical-founder',password}});
 const url=`${base}/tests/fixtures/native-editor-host.html`;
 for(let attempt=0;attempt<2;attempt++){
  if(attempt)await page.reload();else await page.goto(url);
  await expect(page.getByRole('status').filter({hasText:'This restored layout is historical evidence'})).toBeVisible();
  await expect(page.getByTitle('Native Doory design canvas')).toHaveCount(0);
  await expect(page.getByRole('region',{name:'Saved layout review'})).toHaveCount(0);
  await expect(page.locator('.native-tools > details[data-native-tool="images"]')).toHaveCount(0);
  await expect(page.getByRole('button',{name:/stage|sign off|approve/i})).toHaveCount(0);
 }
 expect(calls.some(route=>route==='/native-editor-frame.html'||route.includes('/review')||route.includes('/exports')||route.includes('/cutout'))).toBe(false);
 const endpoint=`${base}/api/studio/native-editor/documents/${record.id}?${query}`;
 const read=await page.request.get(endpoint);expect(read.status()).toBe(200);expect((await read.json()).sourceState).toBe('historical');
 const save=await page.request.post(endpoint,{data:{expectedRevision:1,title:record.title,document:record.document,idempotencyKey:'historical_ui_write_denial'}});expect(save.status()).toBe(409);
 await page.screenshot({path:test.info().outputPath('historical-layout-read-only.png'),fullPage:true});
});
