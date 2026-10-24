import test from 'node:test';
import assert from 'node:assert/strict';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {createDefiantEvidenceMcpHandler,registerDefiantEvidenceTools} from './defiant-evidence-mcp.js';
import {createMcpHandler,McpServer} from '@modelcontextprotocol/server';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
import {retainedSemanticDocuments,SEMANTIC_MODEL,sha256} from './defiant-semantic-index.js';
const h=n=>n.repeat(64),vector=[1,...Array(767).fill(0)],actor={id:'owner',uid:'owner_uid'},org='fixture_org';
test('actual SDK explicit semantic search and HTTP session page share results without another call; twenty-two tools include source receipt handoff',async t=>{
 const register={schemaVersion:1,scopeDescription:'Authored fixture metadata',capturedAt:'2026-01-01T00:00:00Z',provenance:{manifestSha256:h('a'),memberInventorySha256:h('b')},roots:[{id:'one',sourceId:'one',filename:'Invented.csv',format:'csv',bytes:10,sha256:h('c'),generation:'1',retentionVerification:{size:true,crc32c:null,md5:null},memberInventory:{status:'not-enumerated',scope:'Invented standalone file'},periods:[]}],members:[]};
 const projection=retainedSemanticDocuments(register),index={schemaVersion:1,organizationId:org,registerSha256:projection.registerSha256,...SEMANTIC_MODEL,task:'RETRIEVAL_DOCUMENT',corpusPackSha256:h('d'),entries:projection.documents.map(d=>({id:d.id,inputSha256:d.inputSha256,resultSha256:h('e'),vector}))};
 const raw={schemaVersion:1,organizationId:org,coverage:'Invented scoped metadata',months:[],receipts:[],retainedSourceRegister:register},records=new Map();let calls=0,allowed=true;
 const service=createDefiantEvidenceService({organizationId:org,authorize:a=>allowed&&a.id===actor.id,loadSnapshot:async()=>raw,loadSemanticIndex:async()=>index,semanticDependencies:{store:{transact:async(keys,callback)=>{const after=callback(keys.map(k=>records.get(k)));after.forEach((v,i)=>records.set(keys[i],v));return after;}},strategy:{organizationId:org,key:'strategy',assertCurrent(){if(!allowed)throw Object.assign(Error('Denied'),{status:403});}},embed:async query=>{calls++;return {...SEMANTIC_MODEL,task:'RETRIEVAL_QUERY',inputSha256:sha256(query),vector,tokenCount:3,truncated:false};}}});
 const manifest=await service.read(actor);await service.read(actor,{resource:'retained-sources',periodPresence:'undated'});assert.equal(calls,0);
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId})=>{if(organizationId!==org)throw Object.assign(Error('Denied'),{status:403});return {organizationId,actor,service};}}),client=new Client({name:'semantic-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 assert.equal((await client.listTools()).tools.length,22);
 const args={organizationId:org,revision:manifest.revision,mode:'semantic',query:'Authored file discovery',idempotencyKey:'manual-one',periodPresence:'undated'};
 const response=await client.callTool({name:'defiant_search_retained_sources',arguments:args});assert.notEqual(response.isError,true);assert.equal(response.structuredContent.items[0].id,'one');assert.equal(calls,1);
 const url=new URL(`https://fixture.invalid/api/studio/defiant-evidence/${org}/retained-sources`);for(const [k,v] of Object.entries({mode:'semantic-page',revision:manifest.revision,sessionId:response.structuredContent.sessionId}))url.searchParams.set(k,v);
 const page=await defiantEvidenceRequest({service,user:actor,route:url.pathname,method:'GET',url});assert.deepEqual(page,response.structuredContent);assert.equal(calls,1);
 const again=await client.callTool({name:'defiant_search_retained_sources',arguments:args});assert.deepEqual(again.structuredContent,page);assert.equal(calls,1);
 assert.equal((await client.callTool({name:'defiant_search_retained_sources',arguments:{...args,organizationId:'other'}})).isError,true);allowed=false;assert.equal((await client.callTool({name:'defiant_search_retained_sources',arguments:{...args,idempotencyKey:'new'}})).isError,true);assert.equal(calls,1);
});
test('explicit semantic start with empty filters returns25 then pages and replays one26-row session',async t=>{
 const register={schemaVersion:1,scopeDescription:'Authored fixture metadata',capturedAt:'2026-01-01T00:00:00Z',provenance:{manifestSha256:h('a'),memberInventorySha256:h('b')},roots:[{id:'one',sourceId:'one',filename:'Invented.csv',format:'csv',bytes:10,sha256:h('c'),generation:'1',retentionVerification:{size:true,crc32c:null,md5:null},memberInventory:{status:'not-enumerated',scope:'Invented standalone file'},periods:[]}],members:[]};
 register.roots=Array.from({length:26},(_,i)=>({...register.roots[0],id:i===0?'one':`root_${String(i).padStart(2,'0')}`,sourceId:`source_${i}`}));
 const projection=retainedSemanticDocuments(register),index={schemaVersion:1,organizationId:org,registerSha256:projection.registerSha256,...SEMANTIC_MODEL,task:'RETRIEVAL_DOCUMENT',corpusPackSha256:h('d'),entries:projection.documents.map(d=>({id:d.id,inputSha256:d.inputSha256,resultSha256:h('e'),vector}))};
 const raw={schemaVersion:1,organizationId:org,coverage:'Invented scoped metadata',months:[],receipts:[],retainedSourceRegister:register},records=new Map();let calls=0,allowed=true;
 const service=createDefiantEvidenceService({organizationId:org,authorize:a=>allowed&&a.id===actor.id,loadSnapshot:async()=>raw,loadSemanticIndex:async()=>index,semanticDependencies:{store:{transact:async(keys,callback)=>{const after=callback(keys.map(k=>records.get(k)));after.forEach((v,i)=>records.set(keys[i],v));return after;}},strategy:{organizationId:org,key:'strategy',assertCurrent(){if(!allowed)throw Object.assign(Error('Denied'),{status:403});}},embed:async query=>{calls++;return {...SEMANTIC_MODEL,task:'RETRIEVAL_QUERY',inputSha256:sha256(query),vector,tokenCount:3,truncated:false};}}});
 const manifest=await service.read(actor);await service.read(actor,{resource:'retained-sources',periodPresence:'undated'});assert.equal(calls,0);
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId})=>{if(organizationId!==org)throw Object.assign(Error('Denied'),{status:403});return {organizationId,actor,service};}}),client=new Client({name:'semantic-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 assert.equal((await client.listTools()).tools.length,22);
 const args={organizationId:org,revision:manifest.revision,query:'Authored file discovery',idempotencyKey:'manual-one'};
 const response=await client.callTool({name:'defiant_start_semantic_source_search',arguments:args});assert.notEqual(response.isError,true);assert.equal(response.structuredContent.items[0].id,'one');assert.equal(calls,1);assert.equal(response.structuredContent.total,26);assert.equal(response.structuredContent.items.length,25);assert.deepEqual(response.structuredContent.filters,{});
 const second=await client.callTool({name:'defiant_page_semantic_source_search',arguments:{organizationId:org,revision:manifest.revision,sessionId:response.structuredContent.sessionId,offset:25,limit:25}});assert.notEqual(second.isError,true);assert.equal(second.structuredContent.items.length,1);assert.equal(second.structuredContent.offset,25);assert.equal(second.structuredContent.sessionId,response.structuredContent.sessionId);assert.equal(calls,1);
 const url=new URL(`https://fixture.invalid/api/studio/defiant-evidence/${org}/retained-sources`);for(const [k,v] of Object.entries({mode:'semantic-page',revision:manifest.revision,sessionId:response.structuredContent.sessionId}))url.searchParams.set(k,v);
 const page=await defiantEvidenceRequest({service,user:actor,route:url.pathname,method:'GET',url});assert.deepEqual(page,response.structuredContent);assert.equal(calls,1);
 const again=await client.callTool({name:'defiant_start_semantic_source_search',arguments:args});assert.deepEqual(again.structuredContent,page);assert.equal(calls,1);
 const explicit=await client.callTool({name:'defiant_search_retained_sources',arguments:{...args,mode:'semantic'}});assert.deepEqual(explicit.structuredContent,response.structuredContent);const explicitPage=await client.callTool({name:'defiant_page_semantic_source_search',arguments:{organizationId:org,revision:manifest.revision,sessionId:response.structuredContent.sessionId,offset:25,limit:25}});assert.deepEqual(explicitPage.structuredContent,second.structuredContent);assert.equal(calls,1);
 assert.equal((await client.callTool({name:'defiant_start_semantic_source_search',arguments:{...args,organizationId:'other'}})).isError,true);allowed=false;assert.equal((await client.callTool({name:'defiant_start_semantic_source_search',arguments:{...args,idempotencyKey:'new'}})).isError,true);assert.equal(calls,1);
});
test('absent optional index preserves normalized revision and keyword reads, semantic unavailable',async()=>{
 const raw={schemaVersion:1,organizationId:org,coverage:'Invented',months:[],receipts:[]},service=createDefiantEvidenceService({organizationId:org,authorize:()=>true,loadSnapshot:async()=>raw}),manifest=await service.read(actor);
 assert.equal(manifest.revision,sha256(JSON.stringify({...raw,selections:[]})));
 assert.equal((await service.read(actor,{resource:'retained-sources'})).availability,false);
 await assert.rejects(service.read(actor,{resource:'retained-sources',mode:'semantic',revision:manifest.revision,query:'Authored query',idempotencyKey:'one'}),{status:503});
});


test('actual SDK explicit semantic tools expose ordinary objects and reject invalid inputs before resolving authority',async t=>{
 for(const bound of [false,true]){
  let resolutions=0,reads=0;
  const handler=createMcpHandler(()=>{
   const server=new McpServer({name:'semantic-mode-contract',version:'1.0.0'});
   registerDefiantEvidenceTools(server,{
    ...(bound?{boundOrganizationId:org}:{}),
    resolveEvidence:async({organizationId})=>{
     resolutions++;if(organizationId!==org)throw Object.assign(Error('Denied'),{status:403});
     return {organizationId,actor,service:{read:async(_actor,request)=>{
      reads++;return {scope:{organizationId:org},request};
     }}};
    }
   });
   return server;
  },{responseMode:'json'});
  const client=new Client({name:'semantic-shape-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
  const tools=(await client.listTools()).tools;assert.equal(tools.length,22);
  const start=tools.find(x=>x.name==='defiant_start_semantic_source_search'),page=tools.find(x=>x.name==='defiant_page_semantic_source_search');
  for(const tool of [start,page]){const schema=tool.inputSchema;assert.equal(schema.type,'object');assert.equal(schema.anyOf,undefined);assert.equal(schema.oneOf,undefined);assert.equal(schema.additionalProperties,false);assert.equal(schema.required.includes('organizationId'),!bound);}
  for(const field of ['revision','query','idempotencyKey'])assert.ok(start.inputSchema.required.includes(field));
  for(const field of ['mode','offset','limit','sessionId'])assert.equal(Object.hasOwn(start.inputSchema.properties,field),false);
  for(const field of ['revision','sessionId','offset','limit'])assert.ok(page.inputSchema.required.includes(field));
  for(const field of ['mode','query','idempotencyKey','sourceId','format','kind','sourceHash','fromMonth','toMonth','periodPresence'])assert.equal(Object.hasOwn(page.inputSchema.properties,field),false);
  assert.equal(page.inputSchema.properties.offset.maximum,256);
  const scope=bound?{}:{organizationId:org},valid={...scope,revision:h('a'),query:'Invented metadata question',idempotencyKey:'stable-start'},validPage={...scope,revision:h('a'),sessionId:h('b'),offset:25,limit:25};
  const invalidStart=[...['revision','query','idempotencyKey'].map(key=>{const input={...valid};delete input[key];return input;}),{...valid,query:'   '},{...valid,offset:0},{...valid,limit:25},{...valid,sessionId:h('b')},{...valid,mode:'semantic'},{...valid,filters:{}},{...valid,unknown:'value'}];
  const invalidPage=[...['revision','sessionId','offset','limit'].map(key=>{const input={...validPage};delete input[key];return input;}),{...validPage,query:''},{...validPage,idempotencyKey:'key'},{...validPage,kind:'root'},{...validPage,mode:'semantic-page'},{...validPage,offset:257}];
  for(const [tool,inputs] of [[start,invalidStart],[page,invalidPage]])for(const input of inputs){const result=await client.callTool({name:tool.name,arguments:input});assert.equal(result.isError,true);assert.equal(result.structuredContent,undefined);}
  assert.equal(resolutions,0);assert.equal(reads,0);
  for(const [tool,input,mode] of [[start,valid,'semantic'],[page,validPage,'semantic-page']]){
   const result=await client.callTool({name:tool.name,arguments:input});assert.notEqual(result.isError,true);assert.equal(result.structuredContent.request.resource,'retained-sources');assert.equal(result.structuredContent.request.mode,mode);
   const denied=await client.callTool({name:tool.name,arguments:{...input,organizationId:'other'}});assert.equal(denied.isError,true);
  }
  assert.equal(reads,2);assert.equal(resolutions,bound?2:4);
 }
});
