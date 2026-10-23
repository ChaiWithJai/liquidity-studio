import test from 'node:test';
import assert from 'node:assert/strict';
import {createSemanticSessions} from './defiant-semantic-sessions.js';
import {normalizeSemanticIndex,retainedSemanticDocuments,SEMANTIC_MODEL,sha256} from './defiant-semantic-index.js';
import {searchRetainedSources} from './defiant-retained-sources.js';
const actor={id:'reader',uid:'google_reader'},revision='a'.repeat(64),org='invented_org';
const vector=()=>[1,...Array(767).fill(0)];
function fixture(){
 const root=(id,filename,periods)=>({id,sourceId:id,filename,format:'csv',bytes:10,sha256:(id==='dated'?'b':'c').repeat(64),generation:'1',retentionVerification:{size:true,crc32c:null,md5:null},memberInventory:{status:'not-enumerated',scope:'Authored fixture'},periods});
 const register={schemaVersion:1,scopeDescription:'Invented metadata only',capturedAt:'2026-10-01T00:00:00Z',provenance:{manifestSha256:'d'.repeat(64),memberInventorySha256:'e'.repeat(64)},roots:[root('dated','invented_sales_period-03-2025.csv',[{month:'2025-03',periodKind:'sales',basis:'filename-declared',sourceText:'invented_sales_period-03-2025.csv'}]),root('undated','invented.csv',[])],members:[]};
 const projection=retainedSemanticDocuments(register),raw={schemaVersion:1,organizationId:org,registerSha256:projection.registerSha256,...SEMANTIC_MODEL,task:'RETRIEVAL_DOCUMENT',corpusPackSha256:'f'.repeat(64),entries:projection.documents.map(r=>({id:r.id,inputSha256:r.inputSha256,resultSha256:'1'.repeat(64),vector:vector()}))};
 const index=normalizeSemanticIndex(raw,{organizationId:org,register}),snapshot={organizationId:org,revision,retainedSourceRegister:register,months:[],receipts:[],selections:[]};
 let allowed=true,time=1_800_000_000_000,calls=0,hook=async()=>{},contextHook=async()=>{},transactionHook=()=>{},currentRevision=revision;
 const data=new Map(),strategy={organizationId:org,key:'strategy',assertCurrent(){if(!allowed)throw Object.assign(new Error('Revoked'),{status:403});}};
 let queue=Promise.resolve();const store={transact(keys,callback){const pending=queue.then(()=>{const before=keys.map(k=>structuredClone(data.get(k)));callback(structuredClone(before));const after=callback(structuredClone(before));after.forEach((v,i)=>data.set(keys[i],structuredClone(v)));transactionHook();return after;});queue=pending.catch(()=>{});return pending;}};
 const service=createSemanticSessions({store,strategy,now:()=>time,readContext:async a=>{await contextHook();if(!allowed)throw Object.assign(new Error('Revoked'),{status:403});return {actor:a,snapshot:{...snapshot,revision:currentRevision},index};},embed:async query=>{calls++;await hook();return {...SEMANTIC_MODEL,task:'RETRIEVAL_QUERY',inputSha256:sha256(query),vector:vector(),tokenCount:5,truncated:false};}});
 return {service,raw,register,snapshot,data,calls:()=>calls,revoke:()=>{allowed=false;},setHook:v=>{hook=v;},setContextHook:v=>{contextHook=v;},setTransactionHook:v=>{transactionHook=v;},advance:()=>{time+=900001;},changeRevision:()=>{currentRevision='2'.repeat(64);}};
}
const input={revision,query:'Monthly file',filters:{},idempotencyKey:'one'};
test('canonical register ignores object insertion order, rejects changed exact render and malformed vectors',()=>{
 const f=fixture();assert.equal(retainedSemanticDocuments({...f.register,roots:[...f.register.roots].reverse()}).registerSha256,f.raw.registerSha256);
 const altered=structuredClone(f.raw);altered.entries[0].vector[0]=0.99;assert.throws(()=>normalizeSemanticIndex(altered,{organizationId:org,register:f.register}),{status:503});
 const changed=structuredClone(f.register);changed.scopeDescription='Changed scope';assert.throws(()=>normalizeSemanticIndex(f.raw,{organizationId:org,register:changed}),{status:503});
});
test('exact undated filter and session paging require no second query; callback retry does not double-reserve',async()=>{
 const f=fixture(),result=await f.service.start(actor,{...input,filters:{periodPresence:'undated'}});assert.deepEqual(result.items.map(r=>r.id),['undated']);assert.equal(f.calls(),1);
 const page=await f.service.page(actor,{sessionId:result.sessionId,revision,offset:0,limit:1});assert.equal(page.items[0].id,'undated');assert.equal(f.calls(),1);
 assert.equal(f.data.get('defiant-semantic:v1:pilot-budget').reservations,1);
 assert.equal(searchRetainedSources(f.snapshot,{periodPresence:'dated'}).items[0].id,'dated');
});
test('simultaneous same key has one provider owner and immutable replay, changed payload conflicts',async()=>{
 const f=fixture();let release,entered;const gate=new Promise(r=>{release=r;}),started=new Promise(r=>{entered=r;});f.setHook(async()=>{entered();await gate;});
 const first=f.service.start(actor,input);await started;await assert.rejects(f.service.start(actor,input),{status:409});assert.equal(f.calls(),1);release();const result=await first;
 assert.deepEqual(await f.service.start(actor,input),result);await assert.rejects(f.service.start(actor,{...input,query:'Different'}),{status:409});assert.equal(f.calls(),1);
});
test('provider failure is durably non-retryable and cap blocks before provider',async()=>{
 const f=fixture();f.setHook(async()=>{throw Object.assign(new Error('Provider failed'),{status:503});});await assert.rejects(f.service.start(actor,input),{status:503});await assert.rejects(f.service.start(actor,input),{status:409});assert.equal(f.calls(),1);
 f.data.set('defiant-semantic:v1:pilot-budget',{schemaVersion:1,reservations:100});await assert.rejects(f.service.start(actor,{...input,idempotencyKey:'two'}),{status:409});assert.equal(f.calls(),1);
});
test('revoked or changed revision after provider never releases metadata; expired session cannot run again',async()=>{
 const f=fixture();f.setHook(async()=>f.revoke());await assert.rejects(f.service.start(actor,input),{status:403});assert.equal(f.calls(),1);
 const g=fixture();g.setHook(async()=>g.changeRevision());await assert.rejects(g.service.start(actor,input),{status:409});assert.equal(g.calls(),1);
 const h=fixture(),r=await h.service.start(actor,input);h.advance();await assert.rejects(h.service.page(actor,{sessionId:r.sessionId,revision}),{status:409});assert.equal(h.calls(),1);
});
test('session is actor bound and raw query/vector is not persisted',async()=>{
 const f=fixture(),r=await f.service.start(actor,input);await assert.rejects(f.service.page({id:'other',uid:'other_uid'},{sessionId:r.sessionId,revision}),{status:404});
 const record=f.data.get(`defiant-semantic:v1:${org}:${r.sessionId}`);assert.equal(JSON.stringify(record).includes(input.query),false);assert.equal(Object.hasOwn(record,'vector'),false);
});
test('index exact occurrence/input hash/org/register binding and full precision are preserved',()=>{
 const f=fixture();
 for(const change of [r=>{r.organizationId='other';},r=>{r.registerSha256='9'.repeat(64);},r=>{r.entries[0].inputSha256='8'.repeat(64);},r=>{r.entries[0].id='unknown';},r=>{r.entries.pop();},r=>{r.entries[1]=structuredClone(r.entries[0]);}]){const raw=structuredClone(f.raw);change(raw);assert.throws(()=>normalizeSemanticIndex(raw,{organizationId:org,register:f.register}),{status:503});}
 const raw=structuredClone(f.raw),x=0.12345678901234567;raw.entries[0].vector=[x,Math.sqrt(1-x*x),...Array(766).fill(0)];const normalized=normalizeSemanticIndex(raw,{organizationId:org,register:f.register});assert.equal(normalized.entries[0].vector[0],x);assert.deepEqual(normalized.entries[0].vector,raw.entries[0].vector);
});
test('completed replay rechecks authority/revision after storage and mutable caller cannot change reserved identity',async()=>{
 const f=fixture();await f.service.start(actor,input);f.setTransactionHook(()=>f.revoke());await assert.rejects(f.service.start(actor,input),{status:403});assert.equal(f.calls(),1);
 const g=fixture();await g.service.start(actor,input);g.setTransactionHook(()=>g.changeRevision());await assert.rejects(g.service.start(actor,input),{status:409});assert.equal(g.calls(),1);
 const h=fixture(),mutable={...actor};h.setContextHook(async()=>{mutable.id='changed';mutable.uid='changed_uid';});const result=await h.service.start(mutable,input),record=h.data.get(`defiant-semantic:v1:${org}:${result.sessionId}`);assert.equal(record.actorId,actor.id);assert.equal(record.actorUid,actor.uid);
});
