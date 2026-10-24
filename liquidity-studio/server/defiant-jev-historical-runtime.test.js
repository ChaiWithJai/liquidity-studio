import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createHash} from 'node:crypto';
import {HISTORICAL_COMPARABILITY_VERSION,EXPLICIT_COMPARABILITY_VERSION} from './defiant-jev-historical-case-pack.js';
import {historicalFixture} from './historical-jev-fixture.js';
import {configuredJevEvaluationProvider} from './defiant-jev-runtime.js';
import {transactionValues} from './storage-transaction.js';
const sha=v=>createHash('sha256').update(v).digest('hex');
function runtimeFixture(version=EXPLICIT_COMPARABILITY_VERSION){
 const h=historicalFixture({version}),pack=Buffer.from(JSON.stringify({schemaVersion:2,organizationId:'org',cases:[h.row]}));
 const pin=(name,bytes)=>({key:`defiant-private/derived/source-date=2026-10-21/evidence-v1/historical-jev-evaluation-20261023/${name}/${sha(bytes)}.json`,generation:'1792000000000000',bytes:bytes.length,sha256:sha(bytes)});
 const config={schemaVersion:2,organizationId:'org',projectId:'liquidity-studio-pilot-261017',bucket:'liquidity-studio-pilot-261017-liquidity-assets',accountExperimentId:'historical-separate',casePack:pin('pack',pack),trustedHistoricalBinding:h.binding,artifacts:{answer:pin('answer',h.artifacts.answer),historicalSnapshot:pin('snapshot',h.artifacts.snapshot),neutralState:pin('state',h.artifacts.state)}};
 const objects=new Map([[config.casePack.key,pack],[config.artifacts.answer.key,h.artifacts.answer],[config.artifacts.historicalSnapshot.key,h.artifacts.snapshot],[config.artifacts.neutralState.key,h.artifacts.state]]);let storageCalls=0,credentialCalls=0,providerCalls=0,allowed=true,hook=()=>{};const reads=[];
 const options={
  environment:{STUDIO_DEFIANT_JEV_CONFIGURATION:JSON.stringify(config),STUDIO_PENPOT_MANAGED_CONFIG:'/invented-managed.json'},
  loadCredential:async()=>{credentialCalls++;return null;},
  createStorage:async options=>{
   storageCalls++;assert.deepEqual(options,{projectId:config.projectId});
   return {bucket(name){
    assert.equal(name,config.bucket);
    return {file(key,options){
     assert.deepEqual(options,{generation:'1792000000000000'});
     return {createReadStream(options){
      assert.deepEqual(options,{validation:'crc32c',decompress:false});reads.push(key);hook(key);
      return Readable.from([objects.get(key)]);
     }};
    }};
   }};
  },
  fetch:async()=>{providerCalls++;throw new Error('No external calls');}
 };
 const data=new Map([['identity',{}],['strategy:org',{}]]);let tail=Promise.resolve();
 const store={transact(keys,callback){const operation=tail.then(()=>{const values=callback(keys.map(k=>structuredClone(data.get(k)??null)));transactionValues(values,keys.length).forEach((v,i)=>data.set(keys[i],JSON.parse(v)));return structuredClone(values);});tail=operation.catch(()=>{});return operation;}};
 const actor={id:'owner',uid:'uid'},dependencies={organizationId:'org',store,strategy:{organizationId:'org',key:'strategy:org',raw:async()=>{if(!allowed)throw Object.assign(new Error('Denied'),{status:403});},assertCurrent:()=>{if(!allowed)throw Object.assign(new Error('Denied'),{status:403});}},authorizeCurrent:async a=>allowed?a:null};
 return {h,pack,config,options,objects,reads,data,actor,dependencies,counts:()=>({storageCalls,credentialCalls,providerCalls}),revoke:()=>allowed=false,hook:f=>hook=f};
}
test('configured historical runtime loads generation-bound exact artifacts, saves finite provenance and replays without another read/provider',async()=>{
 const f=runtimeFixture(),provider=await configuredJevEvaluationProvider(f.options);assert.equal(f.reads.length,1);const service=provider(f.dependencies);assert.equal(service.executionAvailable,false);assert.equal(service.cases[0].origin,'observed-answer');
 const record=await service.service.evaluate(f.actor,{caseId:'observed',idempotencyKey:'once'});assert.equal(record.status,'completed');assert.equal(record.evaluation.outcome.reason,'credential-unavailable');assert.equal(record.evaluation.historicalProvenance.neutralState.sha256,f.config.artifacts.neutralState.sha256);assert.equal(record.evaluation.deterministicVersion,'historical-store-period-comparability-v2');assert.equal(f.reads.length,4);assert.equal(f.counts().providerCalls,0);
 assert.deepEqual(await service.service.evaluate(f.actor,{caseId:'observed',idempotencyKey:'once'}),record);assert.equal(f.reads.length,4);assert.deepEqual(await service.service.detail(f.actor,record.recordId),record);
});
test('disabled runtime has no I/O; independent malformed binding/pin mismatch fails before storage or credential reads',async()=>{
 const f=runtimeFixture();assert.equal(await configuredJevEvaluationProvider({...f.options,environment:{}}),null);assert.deepEqual(f.counts(),{storageCalls:0,credentialCalls:0,providerCalls:0});
 for(const change of [c=>c.trustedHistoricalBinding.expectedLabel='PRIVATE',c=>c.trustedHistoricalBinding.historicalSnapshot.sha256='f'.repeat(64),c=>c.artifacts.answer.generation='latest',c=>c.artifacts.neutralState.bytes=12001]){const config=structuredClone(f.config);change(config);await assert.rejects(configuredJevEvaluationProvider({...f.options,environment:{...f.options.environment,STUDIO_DEFIANT_JEV_CONFIGURATION:JSON.stringify(config)}}));assert.deepEqual(f.counts(),{storageCalls:0,credentialCalls:0,providerCalls:0});}
});
test('case pack self-assertion cannot override trusted historical revision; corrupted artifact bytes cannot yield provider state',async()=>{
 const f=runtimeFixture(),changed={schemaVersion:2,organizationId:'org',cases:[{...f.h.row,evidenceRevision:'f'.repeat(64)}]},bytes=Buffer.from(JSON.stringify(changed)),config=structuredClone(f.config);config.casePack.bytes=bytes.length;config.casePack.sha256=sha(bytes);f.objects.set(config.casePack.key,bytes);
 await assert.rejects(configuredJevEvaluationProvider({...f.options,environment:{...f.options.environment,STUDIO_DEFIANT_JEV_CONFIGURATION:JSON.stringify(config)}}));assert.equal(f.counts().credentialCalls,0);
 const g=runtimeFixture(),provider=await configuredJevEvaluationProvider(g.options);g.objects.set(g.config.artifacts.historicalSnapshot.key,Buffer.from('corrupt'));await assert.rejects(provider(g.dependencies).service.evaluate(g.actor,{caseId:'observed',idempotencyKey:'once'}));assert.equal([...g.data.values()].some(v=>v?.status==='reserved'),false);assert.equal(g.counts().providerCalls,0);
});
test('authority revoked at explicit historical preflight denies reservation and provider call',async()=>{
 for(const name of ['answer','historicalSnapshot','neutralState']){const f=runtimeFixture(),provider=await configuredJevEvaluationProvider(f.options);f.hook(key=>{if(key===f.config.artifacts[name].key)f.revoke();});await assert.rejects(provider(f.dependencies).service.evaluate(f.actor,{caseId:'observed',idempotencyKey:'once'}),{status:403});assert.equal(f.counts().providerCalls,0);assert.equal(f.data.get('defiant-evaluations:v1:account:historical-separate'),null);assert.equal([...f.data.values()].some(v=>v?.status==='reserved'),false);}
});
test('configured historical key and fake HTTP evaluate exact neutral state once and persist provenance for reload/replay',async()=>{
 const f=runtimeFixture();let calls=0;
 const provider=await configuredJevEvaluationProvider({...f.options,loadCredential:async()=> 'invented-fixture-key',fetch:async(url,request)=>{
  calls++;assert.equal(url,'https://ai-gateway.vercel.sh/v1/evaluate');assert.equal(request.method,'POST');assert.equal(request.redirect,'error');assert.equal(request.headers.Authorization,'Bearer invented-fixture-key');
  const body=JSON.parse(request.body);assert.equal(body.model,'typesafe-ai/jev');assert.match(body.questions.support.instructions,/not-established.*not evidence of inequality/);assert.equal(JSON.parse(body.state.evidence).settlementComparability.status,'not-established');assert.equal(Object.hasOwn(JSON.parse(body.state.evidence),'settlementMaturityComparable'),false);assert.deepEqual(body.providerOptions,{gateway:{only:['typesafe-ai'],zeroDataRetention:true}});assert.deepEqual(Object.keys(body.state).sort(),['claim','evidence']);assert.equal(body.state.claim,f.h.claim);assert.deepEqual(JSON.parse(body.state.evidence),f.h.state.evidence);
  assert.ok(!request.body.includes('expectedLabel'));assert.ok(!request.body.includes('suggestedCorrection'));assert.equal(Object.hasOwn(JSON.parse(body.state.evidence),'amount'),false);assert.ok(JSON.parse(body.state.evidence).observations.every(o=>!Object.hasOwn(o,'amount')));assert.ok(!request.body.includes(f.h.row.datasetSha256));
  const answers={support:{type:'choice',choice:'insufficient-context',probabilities:{supported:0.1,contradicted:0.1,unsupported:0.1,'insufficient-context':0.7}},causalOverreach:{type:'boolean',probability:0.2},temporalComparability:{type:'boolean',probability:0.1},identityOverreach:{type:'boolean',probability:0.2},citationSufficiency:{type:'boolean',probability:0.5}};
  return new Response(JSON.stringify({model:'typesafe-ai/jev',answers,usage:{inputTokens:100,outputTokens:20},providerMetadata:{gateway:{cost:'0.00001'}}}),{headers:{'content-type':'application/json'}});
 }});
 const service=provider(f.dependencies);assert.equal(service.executionAvailable,true);const request={caseId:'observed',idempotencyKey:'once'};
 const record=await service.service.evaluate(f.actor,request);assert.equal(record.status,'completed');assert.equal(record.evaluation.outcome.status,'observed');assert.equal(record.evaluation.outcome.answers.support.choice,'insufficient-context');assert.equal(record.evaluation.humanLabel,null);assert.equal(record.evaluation.historicalProvenance.answer.sha256,f.config.artifacts.answer.sha256);assert.equal(record.evaluation.case.evidenceRevision,f.h.row.evidenceRevision);assert.equal(record.evaluation.deterministicVersion,'historical-store-period-comparability-v2');assert.equal(calls,1);
 assert.deepEqual(await service.service.detail(f.actor,record.recordId),record);assert.deepEqual(await service.service.evaluate(f.actor,request),record);assert.equal(calls,1);assert.equal(f.reads.length,4);assert.ok(!JSON.stringify(record).includes(f.h.claim));assert.ok(!JSON.stringify(record).includes('invented-fixture-key'));
});

test('representative full-length historical configuration fits the existing 4096-byte startup cap',async()=>{
 const f=runtimeFixture(),serialized=JSON.stringify(f.config);assert.ok(Buffer.byteLength(serialized)>2000);assert.ok(Buffer.byteLength(serialized)<=4096);assert.ok(Object.values(f.config.artifacts).every(p=>p.key.length>150&&p.generation.length===16));assert.equal(typeof await configuredJevEvaluationProvider(f.options),'function');
 const oversized={...f.config,accountExperimentId:'x'.repeat(129)};await assert.rejects(configuredJevEvaluationProvider({...f.options,environment:{...f.options.environment,STUDIO_DEFIANT_JEV_CONFIGURATION:JSON.stringify(oversized)}}));
});


test('legacy configuration remains discoverable with a key but cannot reserve or dispatch a new evaluation',async()=>{
 const f=runtimeFixture(HISTORICAL_COMPARABILITY_VERSION);let providerCalls=0;
 const provider=await configuredJevEvaluationProvider({...f.options,loadCredential:async()=> 'invented-key',fetch:async()=>{providerCalls++;throw Error('must not dispatch');}});
 const binding=provider(f.dependencies);assert.equal(binding.executionAvailable,false);assert.equal(binding.executionUnavailableReason,'ambiguous-evidence-semantics');assert.equal(binding.cases[0].caseId,'observed');const before=JSON.stringify([...f.data]);
 await assert.rejects(binding.service.evaluate(f.actor,{caseId:'observed',idempotencyKey:'new'}),{status:503});assert.equal(JSON.stringify([...f.data]),before);assert.equal(providerCalls,0);assert.equal(f.reads.length,1);
});
