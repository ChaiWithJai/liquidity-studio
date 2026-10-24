import test from 'node:test';
import assert from 'node:assert/strict';
import {createJevDecisionAdapter,jevEvaluationConfigurationSha256} from './defiant-jev-evaluation.js';
const limits={timeoutMs:15000,maxRequests:1,maxInputBytes:16384,maxResponseBytes:65536};
test('legacy historical fingerprint stays fixed while explicit semantics have a distinct bound identity',()=>{
 assert.equal(jevEvaluationConfigurationSha256(limits,'historical-store-period-comparability-v1','a'.repeat(64)),'a1d2592bd0bea0a2841d7952cee85fd31d22825f7c0aad334f87d2416f8dcc2d');
 assert.notEqual(jevEvaluationConfigurationSha256(limits,'historical-store-period-comparability-v2','a'.repeat(64)),jevEvaluationConfigurationSha256(limits,'historical-store-period-comparability-v1','a'.repeat(64)));
 assert.notEqual(jevEvaluationConfigurationSha256(limits,'historical-store-period-comparability-v2','a'.repeat(64)),jevEvaluationConfigurationSha256(limits,'historical-store-period-comparability-v2','b'.repeat(64)));
});
test('explicit serializer preflights exact byte envelope without credentials/network and preserves dispatch bytes',async()=>{
 let credentials=0,calls=0,body;
 const adapter=createJevDecisionAdapter({enabled:true,deterministicVersion:'historical-store-period-comparability-v2',...limits,getCredential:()=>{credentials++;return 'invented';},fetch:async(url,request)=>{calls++;body=request.body;return new Response('',{status:502});}});
 const state={claim:'An invented bounded comparability claim.',evidence:'x'.repeat(12000)};adapter.validateInput(state);assert.equal(credentials,0);assert.equal(calls,0);
 const result=await adapter.decide(state);assert.equal(result.reason,'provider-http');assert.ok(Buffer.byteLength(body)<=16384);assert.deepEqual(JSON.parse(body).state,state);assert.match(JSON.parse(body).questions.support.instructions,/not-established.*not evidence of inequality/);
 assert.throws(()=>adapter.validateInput({claim:state.claim,evidence:'"'.repeat(12000)}));assert.throws(()=>adapter.validateInput({claim:'x'.repeat(4096),evidence:'x'.repeat(12000)}));assert.equal(credentials,1);assert.equal(calls,1);
});

test('largest allowed month lists and escaped store identity produce a valid pinned explicit envelope',async()=>{
 const {historicalFixture}=await import('./historical-jev-fixture.js');const {createHash}=await import('node:crypto');
 const f=historicalFixture({version:'historical-store-period-comparability-v2'}),before=Array.from({length:12},(_,i)=>`2024-${String(i+1).padStart(2,'0')}`),after=before.map(m=>m.replace('2024','2025')),storeKey='"'.repeat(200);
 const observations=[...before,...after].map((month,i)=>({month,sourceHash:(i<12?'b':'c').repeat(64),rowCount:2,postingWindow:{first:'2026-01-01',last:'2026-12-31'}}));
 Object.assign(f.snapshot.storePeriodCoverage[0],{storeKey,observations});Object.assign(f.snapshot.comparisons[0],{beforeMonths:before,afterMonths:after,groups:[{id:'group',key:storeKey}],sourceReferences:observations.map(({month,sourceHash})=>({month,sourceHash}))});Object.assign(f.state.evidence,{storeKey,beforeMonths:before,afterMonths:after,observations});
 const pin=bytes=>({sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});f.artifacts.snapshot=Buffer.from(JSON.stringify(f.snapshot));f.artifacts.state=Buffer.from(JSON.stringify(f.state));f.row.historicalSnapshot=pin(f.artifacts.snapshot);f.row.state=pin(f.artifacts.state);Object.assign(f.binding.historicalSnapshot,pin(f.artifacts.snapshot));f.binding.neutralState=pin(f.artifacts.state);
 assert.ok(f.artifacts.state.length<=12000);const prepared=await f.make().resolve({},'observed');let reads=0;const adapter=createJevDecisionAdapter({enabled:true,deterministicVersion:'historical-store-period-comparability-v2',...limits,getCredential:()=>{reads++;return 'never';},fetch:async()=>{throw Error('never');}});adapter.validateInput({claim:prepared.state.claim,evidence:prepared.state.evidence});assert.equal(reads,0);
});
