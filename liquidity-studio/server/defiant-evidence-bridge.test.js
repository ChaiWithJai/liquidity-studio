import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,chmod,rm,rename,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createPrivateEvidenceBridge} from './defiant-evidence-bridge.js';
const revision='a'.repeat(64);
async function fixture(t,fetchImpl){
 const dir=await mkdtemp(join(tmpdir(),'evidence-bridge-'));await chmod(dir,0o700);t.after(()=>rm(dir,{recursive:true,force:true}));
 const config=join(dir,'config'),credential=join(dir,'credential');
 const c={version:1,organizationId:'example_org',origin:'https://studio.chaiwithjai.com',credentialFile:credential};
 await writeFile(config,JSON.stringify(c),{mode:0o600});
 const token=async(value='a')=>writeFile(credential,JSON.stringify({version:2,organizationId:'example_org',accessToken:'ea.'+'1'.repeat(32)+'.'+value.repeat(43),renewalToken:'er.'+'1'.repeat(32)+'.'+'z'.repeat(43),accessExpiresAt:1000000+300000,expiresAt:1000000+28800000}),{mode:0o600});await token();
 return {dir,config,credential,c,token,bridge:await createPrivateEvidenceBridge({configurationPath:config,fetchImpl,now:()=>1000000})};
}
const response=(more={})=>Response.json({scope:{organizationId:'example_org'},revision,...more});
test('bridge rereads credentials and preserves exact origin, route and pinned revision',async t=>{
 const calls=[];const f=await fixture(t,async(url,init)=>{calls.push({url:String(url),init});return response({receipt:{cells:{Amount:'-0.000001'}}});});
 await f.bridge.service.read(f.bridge.actor,{resource:'receipt',receiptId:'row_2',revision});await f.token('d');
 const result=await f.bridge.service.read(f.bridge.actor,{resource:'receipt',receiptId:'row_2',revision});
 assert.equal(result.receipt.cells.Amount,'-0.000001');assert.equal(calls[0].init.headers.Authorization,'Bearer ea.'+'1'.repeat(32)+'.'+'a'.repeat(43));assert.equal(calls[1].init.headers.Authorization,'Bearer ea.'+'1'.repeat(32)+'.'+'d'.repeat(43));assert.equal(calls[0].init.redirect,'error');assert.equal(calls[0].init.cache,'no-store');assert.equal(new URL(calls[0].url).pathname,'/api/studio/defiant-evidence/example_org/receipt');
 await assert.rejects(f.bridge.service.read({}, {resource:'manifest'}),{status:403});await assert.rejects(f.bridge.service.read(f.bridge.actor,{resource:'manifest',url:'https://other.invalid'}),{status:400});assert.equal(calls.length,2);
});
test('configuration replacement and unsafe credential permissions fail before network',async t=>{
 let calls=0;const f=await fixture(t,async()=>{calls++;return response();});
 await chmod(f.credential,0o644);await assert.rejects(f.bridge.service.read(f.bridge.actor,{resource:'manifest'}));assert.equal(calls,0);await chmod(f.credential,0o600);
 const next=join(f.dir,'next');await writeFile(next,JSON.stringify(f.c),{mode:0o600});await rename(next,f.config);await assert.rejects(f.bridge.service.read(f.bridge.actor,{resource:'manifest'}));assert.equal(calls,0);
});
test('scope, revision, invalid encoding and upstream error bodies never leak',async t=>{
 for(const make of [()=>response({scope:{organizationId:'other'}}),()=>response({revision:'b'.repeat(64)}),()=>new Response(new Uint8Array([255]),{headers:{'content-type':'application/json'}}),()=>new Response('private detail',{status:403})]){
  const f=await fixture(t,async()=>make());await assert.rejects(f.bridge.service.read(f.bridge.actor,{resource:'manifest',revision}),e=>e.message==='Private evidence unavailable'&&!e.message.includes('private detail'));
 }
});
test('response size ceiling and post-response configuration mutation fail closed',async t=>{
 const large=await fixture(t,async()=>new Response(new Uint8Array(4*1024*1024+1),{headers:{'content-type':'application/json'}}));await assert.rejects(large.bridge.service.read(large.bridge.actor,{resource:'manifest'}));
 let f;f=await fixture(t,async()=>{await chmod(f.config,0o644);return response();});await assert.rejects(f.bridge.service.read(f.bridge.actor,{resource:'manifest'}));
});

test('actual SDK discovers nineteen real-evidence tools and carries receipt plus denial through HTTP bridge',async t=>{
 const {Client,StreamableHTTPClientTransport}=await import('@modelcontextprotocol/client');
 const {createMcpHandler}=await import('@modelcontextprotocol/server');let calls=0,denied=false;
 const f=await fixture(t,async(url,init)=>{calls++;assert.equal(init.headers.Authorization,'Bearer ea.'+'1'.repeat(32)+'.'+'a'.repeat(43));if(denied)return new Response('private denied detail',{status:403});const parsed=new URL(url);if(parsed.pathname.endsWith('/selection-reconciliation')){assert.equal(parsed.searchParams.get('selectionId'),'selection_a');assert.equal(parsed.searchParams.get('revision'),revision);return response({available:false,reason:'not-prepared'});}if(parsed.pathname.endsWith('/store-coverage')){assert.equal(parsed.searchParams.get('storeCoverageId'),'coverage_one');assert.equal(parsed.searchParams.get('revision'),revision);return response({product:{id:'coverage_one',expectedDelivery:'unknown'}});}if(parsed.pathname.endsWith('/june-review')){assert.equal(parsed.pathname,'/api/studio/defiant-evidence/example_org/june-review');assert.equal(parsed.searchParams.get('selectionId'),'selection_a');assert.equal(parsed.searchParams.get('revision'),revision);assert.equal(parsed.searchParams.get('offset'),'1');assert.equal(parsed.searchParams.get('limit'),'1');return response({purpose:'factual-period-brief',readiness:'qualified',lineage:{sourceRecords:[5]},followUp:{resource:'selection-receipts',selectionId:'selection_a',revision,offset:1,limit:1},commercialReadiness:{readiness:'not-ready'}});}return response(parsed.pathname.endsWith('/receipt')?{receipt:{record:2,cells:{Amount:'-0.000001'}}}:{counts:{months:1}});});
 const handler=createMcpHandler(()=>f.bridge.createServer(),{responseMode:'json'});
 const client=new Client({name:'bridge-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});
 t.after(async()=>{await client.close();await handler.close();});
 await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 const tools=(await client.listTools()).tools;assert.equal(tools.length,19);assert.ok(tools.some(x=>x.name==='defiant_discover_served_evidence'));assert.ok(tools.some(x=>x.name==='defiant_june_factual_review'));assert.ok(tools.some(x=>x.name==='defiant_read_audience_cells'));
 const manifest=await client.callTool({name:'defiant_evidence_manifest',arguments:{organizationId:'example_org'}});assert.equal(manifest.structuredContent.revision,revision);
 const receipt=await client.callTool({name:'defiant_show_receipt',arguments:{organizationId:'example_org',revision,receiptId:'row_2'}});assert.equal(receipt.structuredContent.receipt.cells.Amount,'-0.000001');
 const june=await client.callTool({name:'defiant_june_factual_review',arguments:{organizationId:'example_org',revision,selectionId:'selection_a',offset:1,limit:1}});assert.equal(june.isError,undefined);assert.equal(june.structuredContent.purpose,'factual-period-brief');assert.deepEqual(june.structuredContent.lineage.sourceRecords,[5]);assert.equal(june.structuredContent.followUp.revision,revision);assert.equal(june.structuredContent.commercialReadiness.readiness,'not-ready');
 const storeCoverage=await client.callTool({name:'defiant_store_period_coverage',arguments:{organizationId:'example_org',revision,storeCoverageId:'coverage_one'}});assert.equal(storeCoverage.structuredContent.product.expectedDelivery,'unknown');
 const reconciliation=await client.callTool({name:'defiant_selection_reconciliation',arguments:{organizationId:'example_org',revision,selectionId:'selection_a'}});assert.equal(reconciliation.structuredContent.available,false);assert.equal(reconciliation.structuredContent.reason,'not-prepared');
 const before=calls;assert.equal((await client.callTool({name:'defiant_evidence_manifest',arguments:{organizationId:'other'}})).isError,true);assert.equal(calls,before);
 denied=true;const result=await client.callTool({name:'defiant_evidence_manifest',arguments:{organizationId:'example_org'}});assert.equal(result.isError,true);assert.equal(result.structuredContent,undefined);assert.equal(JSON.stringify(result).includes('private denied detail'),false);
});

test('deadline aborts a stalled HTTP request without retry',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let ready;const started=new Promise(resolve=>ready=resolve);let calls=0;
 const f=await fixture(t,async(_url,{signal})=>{calls++;ready();return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('private transport detail')),{once:true}));});
 const pending=assert.rejects(f.bridge.service.read(f.bridge.actor,{resource:'manifest'}),{message:'Private evidence unavailable'});await started;t.mock.timers.tick(30000);await pending;assert.equal(calls,1);
});


test('expired and excessive lifetime credentials fail before dispatch; invalidation during response blocks return',async t=>{
 let calls=0;const f=await fixture(t,async()=>{calls++;return response();});
 for(const expiresAt of [1000000,1000000+28860001]){await writeFile(f.credential,JSON.stringify({version:2,organizationId:'example_org',accessToken:'ea.'+'1'.repeat(32)+'.'+'a'.repeat(43),renewalToken:'er.'+'1'.repeat(32)+'.'+'z'.repeat(43),accessExpiresAt:1300000,expiresAt}));await assert.rejects(f.bridge.service.read(f.bridge.actor,{resource:'manifest'}),{status:401});}assert.equal(calls,0);
 let g;g=await fixture(t,async()=>{await writeFile(g.credential,JSON.stringify({version:2,organizationId:'example_org',accessToken:'ea.'+'1'.repeat(32)+'.'+'a'.repeat(43),renewalToken:'er.'+'1'.repeat(32)+'.'+'z'.repeat(43),accessExpiresAt:999999,expiresAt:999999}));return response();});await assert.rejects(g.bridge.service.read(g.bridge.actor,{resource:'manifest'}),{status:401});
});
test('file and immediate parent symlinks are rejected without network',async t=>{
 let calls=0;const f=await fixture(t,async()=>{calls++;return response();});
 const actual=join(f.dir,'actual');await rename(f.credential,actual);await symlink(actual,f.credential);await assert.rejects(f.bridge.service.read(f.bridge.actor,{resource:'manifest'}));
 const parent=join(f.dir,'alias');await symlink(f.dir,parent);await assert.rejects(createPrivateEvidenceBridge({configurationPath:join(parent,'config'),fetchImpl:async()=>{calls++;return response();}}));assert.equal(calls,0);
});
test('excess empty response chunks are bounded and consumption is canceled',async t=>{
 let canceled=false;const f=await fixture(t,async()=>({ok:true,headers:new Headers({'content-type':'application/json'}),body:{getReader:()=>({read:async()=>({done:false,value:new Uint8Array(0)}),cancel:async()=>{canceled=true;}})}}));
 await assert.rejects(f.bridge.service.read(f.bridge.actor,{resource:'manifest'}));assert.equal(canceled,true);
});

test('actual SDK forwards bounded coverage query and period filters without truncation or scope escape',async t=>{
 const {Client,StreamableHTTPClientTransport}=await import('@modelcontextprotocol/client');
 const {createMcpHandler}=await import('@modelcontextprotocol/server');
 const seen=[];const prefix='June & source / café? ';const query=prefix+'x'.repeat(200-prefix.length);
 assert.equal(query.length,200);
 const f=await fixture(t,async(url)=>{const parsed=new URL(url);seen.push(parsed);assert.equal(parsed.origin,'https://studio.chaiwithjai.com');assert.equal(parsed.pathname,'/api/studio/defiant-evidence/example_org/coverage');return response({coverageKind:'served-evidence-coverage',inventoryComplete:false,filters:{query:parsed.searchParams.get('query'),fromMonth:parsed.searchParams.get('fromMonth'),toMonth:parsed.searchParams.get('toMonth')},items:[]});});
 const handler=createMcpHandler(()=>f.bridge.createServer(),{responseMode:'json'});
 const client=new Client({name:'coverage-bridge-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});
 t.after(async()=>{await client.close();await handler.close();});
 await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 const args={organizationId:'example_org',revision,query,fromMonth:'2025-06',toMonth:'2025-06',offset:1,limit:2};
 const result=await client.callTool({name:'defiant_discover_served_evidence',arguments:args});
 assert.equal(result.isError,undefined);assert.equal(result.structuredContent.filters.query,query);assert.equal(result.structuredContent.inventoryComplete,false);
 assert.deepEqual(Object.fromEntries(seen[0].searchParams),{revision,query,fromMonth:'2025-06',toMonth:'2025-06',offset:'1',limit:'2'});
 const empty=await client.callTool({name:'defiant_discover_served_evidence',arguments:{organizationId:'example_org',query:''}});assert.equal(empty.isError,undefined);assert.equal(seen[1].searchParams.get('query'),'');
 const before=seen.length;
 for(const extra of [{query:'x'.repeat(201)},{query:'bad\nquery'},{organizationId:'other'}]){
  const denied=await client.callTool({name:'defiant_discover_served_evidence',arguments:{...args,...extra}});assert.equal(denied.isError,true);
 }
 assert.equal(seen.length,before);
});

test('actual SDK forwards all retained register filters through scoped bridge and blocks arbitrary extra fields',async t=>{
 const {Client,StreamableHTTPClientTransport}=await import('@modelcontextprotocol/client');const {createMcpHandler}=await import('@modelcontextprotocol/server');const seen=[];
 const f=await fixture(t,async url=>{const u=new URL(url);seen.push(u);assert.equal(u.pathname,'/api/studio/defiant-evidence/example_org/retained-sources');return response({availability:false,globalCounts:null,matchingCounts:null,items:[]});});
 const handler=createMcpHandler(()=>f.bridge.createServer(),{responseMode:'json'}),client=new Client({name:'register-bridge',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 const args={organizationId:'example_org',revision,query:'folder / café',sourceId:'source_one',format:'csv',kind:'member',sourceHash:'b'.repeat(64),fromMonth:'2025-06',toMonth:'2025-06',offset:2,limit:3};const result=await client.callTool({name:'defiant_search_retained_sources',arguments:args});assert.equal(result.isError,undefined);assert.equal(result.structuredContent.globalCounts,null);const {organizationId,...filters}=args;assert.deepEqual(Object.fromEntries(seen[0].searchParams),Object.fromEntries(Object.entries(filters).map(([k,v])=>[k,String(v)])));
 for(const extra of [{organizationId:'other'},{path:'/private'},{sourceHash:'b'.repeat(64)+'\n'},{fromMonth:'2025-06\u2028'}])assert.equal((await client.callTool({name:'defiant_search_retained_sources',arguments:{...args,...extra}})).isError,true);assert.equal(seen.length,1);
});
