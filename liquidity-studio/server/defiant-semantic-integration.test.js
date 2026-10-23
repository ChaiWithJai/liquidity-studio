import test from 'node:test';
import assert from 'node:assert/strict';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {createDefiantEvidenceMcpHandler} from './defiant-evidence-mcp.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
import {retainedSemanticDocuments,SEMANTIC_MODEL,sha256} from './defiant-semantic-index.js';
const h=n=>n.repeat(64),vector=[1,...Array(767).fill(0)],actor={id:'owner',uid:'owner_uid'},org='fixture_org';
test('actual SDK explicit semantic search and HTTP session page share results without another call; twenty tools include source receipt handoff',async t=>{
 const register={schemaVersion:1,scopeDescription:'Authored fixture metadata',capturedAt:'2026-01-01T00:00:00Z',provenance:{manifestSha256:h('a'),memberInventorySha256:h('b')},roots:[{id:'one',sourceId:'one',filename:'Invented.csv',format:'csv',bytes:10,sha256:h('c'),generation:'1',retentionVerification:{size:true,crc32c:null,md5:null},memberInventory:{status:'not-enumerated',scope:'Invented standalone file'},periods:[]}],members:[]};
 const projection=retainedSemanticDocuments(register),index={schemaVersion:1,organizationId:org,registerSha256:projection.registerSha256,...SEMANTIC_MODEL,task:'RETRIEVAL_DOCUMENT',corpusPackSha256:h('d'),entries:projection.documents.map(d=>({id:d.id,inputSha256:d.inputSha256,resultSha256:h('e'),vector}))};
 const raw={schemaVersion:1,organizationId:org,coverage:'Invented scoped metadata',months:[],receipts:[],retainedSourceRegister:register},records=new Map();let calls=0,allowed=true;
 const service=createDefiantEvidenceService({organizationId:org,authorize:a=>allowed&&a.id===actor.id,loadSnapshot:async()=>raw,loadSemanticIndex:async()=>index,semanticDependencies:{store:{transact:async(keys,callback)=>{const after=callback(keys.map(k=>records.get(k)));after.forEach((v,i)=>records.set(keys[i],v));return after;}},strategy:{organizationId:org,key:'strategy',assertCurrent(){if(!allowed)throw Object.assign(Error('Denied'),{status:403});}},embed:async query=>{calls++;return {...SEMANTIC_MODEL,task:'RETRIEVAL_QUERY',inputSha256:sha256(query),vector,tokenCount:3,truncated:false};}}});
 const manifest=await service.read(actor);await service.read(actor,{resource:'retained-sources',periodPresence:'undated'});assert.equal(calls,0);
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId})=>{if(organizationId!==org)throw Object.assign(Error('Denied'),{status:403});return {organizationId,actor,service};}}),client=new Client({name:'semantic-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 assert.equal((await client.listTools()).tools.length,20);
 const args={organizationId:org,revision:manifest.revision,mode:'semantic',query:'Authored file discovery',idempotencyKey:'manual-one',periodPresence:'undated'};
 const response=await client.callTool({name:'defiant_search_retained_sources',arguments:args});assert.notEqual(response.isError,true);assert.equal(response.structuredContent.items[0].id,'one');assert.equal(calls,1);
 const url=new URL(`https://fixture.invalid/api/studio/defiant-evidence/${org}/retained-sources`);for(const [k,v] of Object.entries({mode:'semantic-page',revision:manifest.revision,sessionId:response.structuredContent.sessionId}))url.searchParams.set(k,v);
 const page=await defiantEvidenceRequest({service,user:actor,route:url.pathname,method:'GET',url});assert.deepEqual(page,response.structuredContent);assert.equal(calls,1);
 const again=await client.callTool({name:'defiant_search_retained_sources',arguments:args});assert.deepEqual(again.structuredContent,page);assert.equal(calls,1);
 assert.equal((await client.callTool({name:'defiant_search_retained_sources',arguments:{...args,organizationId:'other'}})).isError,true);allowed=false;assert.equal((await client.callTool({name:'defiant_search_retained_sources',arguments:{...args,idempotencyKey:'new'}})).isError,true);assert.equal(calls,1);
});
test('absent optional index preserves normalized revision and keyword reads, semantic unavailable',async()=>{
 const raw={schemaVersion:1,organizationId:org,coverage:'Invented',months:[],receipts:[]},service=createDefiantEvidenceService({organizationId:org,authorize:()=>true,loadSnapshot:async()=>raw}),manifest=await service.read(actor);
 assert.equal(manifest.revision,sha256(JSON.stringify({...raw,selections:[]})));
 assert.equal((await service.read(actor,{resource:'retained-sources'})).availability,false);
 await assert.rejects(service.read(actor,{resource:'retained-sources',mode:'semantic',revision:manifest.revision,query:'Authored query',idempotencyKey:'one'}),{status:503});
});
