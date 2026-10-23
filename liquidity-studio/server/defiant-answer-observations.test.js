import test from 'node:test';
import assert from 'node:assert/strict';
import {DurableStore} from './storage.js';
import {createPlatform} from './platform.js';
import {DefiantStrategyService} from './defiant-strategy.js';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {createAnswerObservations} from './defiant-answer-observations.js';
async function fixture(t){
 const store=new DurableStore(':memory:'),platform=createPlatform({store,authMode:'password'});await platform.ready;t.after(()=>store.close());
 await platform.identity.provision({username:'observer',password:'invented-hosted-password',role:'founder'});const user=(await platform.identity.login('observer','invented-hosted-password')).user,actor={...user,uid:'fixture-managed-uid'};
 const org=await platform.identity.createOrganization(actor,'Invented observation');const strategy=new DefiantStrategyService({store,identity:platform.identity,organizationId:org.id});await strategy.enable(actor,{});
 let revoked=false,reads=0;const snapshot={schemaVersion:1,organizationId:org.id,coverage:'Invented source',months:[{month:'2025-06',amount:'-10.000000000001',currency:'USD',metric:'source-total-earned',sourceHash:'a'.repeat(64),receiptIds:['r']}],receipts:[{id:'r',sourceHash:'a'.repeat(64),member:'invented.csv',record:2,cells:{Amount:'-10.000000000001'}}],selections:[{id:'s',label:'Invented selection',sourceHash:'a'.repeat(64),amount:'-10.000000000001',currency:'USD',sourceRecords:[2]}]};
 const evidence=createDefiantEvidenceService({organizationId:org.id,authorize:async a=>{await strategy.raw(a);return true;},loadSnapshot:async()=>{reads++;return snapshot;}});
 const revision=(await evidence.read(actor,{resource:'manifest'})).revision;
 const service=createAnswerObservations({store,strategy,evidence,authorizeCurrent:async a=>{if(revoked)throw Object.assign(new Error('Denied'),{status:403});return a;}});
 const input={observedAt:null,hostLabel:null,modelId:null,idempotencyKey:'capture-one',question:'What was reported?',answer:'Reported -10.000000000001 USD.',revision,assertions:[{kind:'selection',value:'-10.000000000001',currency:'USD',span:{start:9,end:25,text:'-10.000000000001'},reference:{selectionId:'s'},receipt:{receiptId:'r',cell:'Amount'}}]};
 return {store,actor,strategy,evidence,service,input,org,disable:()=>revoked=true,reads:()=>reads};
}
test('actual scoped service persists immutable decimal evidence and one separately attributed correction',async t=>{
 const f=await fixture(t),saved=await f.service.capture(f.actor,f.input);assert.equal(saved.observation.results[0].amountCheck,'match');assert.equal(saved.observation.results[0].period,null);assert.equal(saved.observation.results[0].receipt.exists,true);assert.match(saved.observation.results[0].receipt.qualification,/Curated/);assert.equal(saved.observation.semanticSupport,'unknown');assert.equal(saved.observation.modelExecutionVerified,false);
 assert.deepEqual(await f.service.capture(f.actor,f.input),saved);assert.equal((await f.service.list(f.actor)).items.length,1);
 const corrected=await f.service.correct(f.actor,saved.observation.observationId,{comment:'Check the reporting window before interpretation.'});assert.deepEqual(corrected.observation,saved.observation);assert.equal(corrected.correction.actorUid,f.actor.uid);await assert.rejects(f.service.correct(f.actor,saved.observation.observationId,{comment:'Second'}),{status:409});assert.deepEqual(await f.service.detail(f.actor,saved.observation.observationId),corrected);
 await assert.rejects(f.service.capture(f.actor,{...f.input,answer:'Changed answer'}),{status:400});f.disable();await assert.rejects(f.service.detail(f.actor,saved.observation.observationId),{status:403});
});
test('exact mismatch, currency mismatch and unknown missing earnings stay distinct',async t=>{
 const f=await fixture(t);let input=structuredClone(f.input);input.assertions[0].value='-10.000000000002';input.assertions[0].currency='EUR';const result=await f.service.capture(f.actor,input);assert.equal(result.observation.results[0].amountCheck,'mismatch');assert.equal(result.observation.results[0].currencyCheck,'mismatch');
 input=structuredClone(f.input);input.idempotencyKey='missing-period';input.assertions[0].kind='earnings';input.assertions[0].reference={month:'2025-05'};input.assertions[0].receipt=null;const absent=await f.service.capture(f.actor,input);assert.equal(absent.observation.results[0].amountCheck,'unknown');assert.equal(absent.observation.results[0].fact,null);
 await assert.rejects(f.service.capture(f.actor,{...f.input,revision:'b'.repeat(64)}),{status:409});
});
test('scope revocation at persistence prevents recording even after successful evidence reads',async t=>{
 const f=await fixture(t);let calls=0;const service=createAnswerObservations({store:f.store,strategy:f.strategy,evidence:f.evidence,authorizeCurrent:async a=>{if(++calls===2)await f.store.update('identity',state=>({...state,memberships:state.memberships.filter(m=>m.organizationId!==f.org.id)}));return a;}});
 await assert.rejects(service.capture(f.actor,f.input),{status:403});assert.equal((await f.store.keys('defiant-answer-observations:')).length,0);
});
test('invalid origin, more than5claims and altered spans cannot become observations',async t=>{
 const f=await fixture(t),before=f.reads();for(const input of [{...f.input,origin:'app-generated'},{...f.input,assertions:Array(6).fill(f.input.assertions[0])},{...f.input,assertions:[{...f.input.assertions[0],span:{start:0,end:3,text:'bad'}}]}])await assert.rejects(f.service.capture(f.actor,input),{status:400});assert.equal(f.reads(),before);
});

test('concurrent capture creates one immutable record and altered payload cannot reuse its key',async t=>{
 const f=await fixture(t);const [a,b]=await Promise.all([f.service.capture(f.actor,f.input),f.service.capture(f.actor,f.input)]);assert.deepEqual(a,b);assert.equal((await f.service.list(f.actor)).items.length,1);const changed=structuredClone(f.input);changed.assertions[0].value='1';await assert.rejects(f.service.capture(f.actor,changed),{status:409});
});

test('abort before transaction callback writes no observation and callback retries preserve generated identity',async t=>{
 const f=await fixture(t),controller=new AbortController(),transact=f.store.transact.bind(f.store);let callbacks=0;
 const aborting={get:key=>f.store.get(key),transact:(keys,callback)=>{controller.abort();return transact(keys,callback);}};
 const stopped=createAnswerObservations({store:aborting,strategy:f.strategy,evidence:f.evidence,signal:controller.signal,authorizeCurrent:async a=>a});await assert.rejects(stopped.capture(f.actor,f.input),{status:408});assert.equal(f.store.keys('defiant-answer-observations:').length,0);
 const retrying={get:key=>f.store.get(key),transact:(keys,callback)=>{callback(keys.map(key=>f.store.get(key)));callbacks++;return transact(keys,callback);}};let times=0;
 const retried=createAnswerObservations({store:retrying,strategy:f.strategy,evidence:f.evidence,authorizeCurrent:async a=>a,now:()=>{times++;return '2026-01-01T00:00:00.000Z';}});const saved=await retried.capture(f.actor,f.input);assert.equal(callbacks,1);assert.equal(times,1);assert.equal((await f.service.list(f.actor)).items.length,1);assert.deepEqual(await f.service.detail(f.actor,saved.observation.observationId),saved);
});
test('abort after persistence cannot promise rollback; same-key retry retrieves committed original',async t=>{
 const f=await fixture(t),controller=new AbortController(),transact=f.store.transact.bind(f.store);
 const delayed={get:key=>f.store.get(key),transact:async(keys,callback)=>{const committed=transact(keys,callback);controller.abort();await Promise.resolve();return committed;}};
 const service=createAnswerObservations({store:delayed,strategy:f.strategy,evidence:f.evidence,signal:controller.signal,authorizeCurrent:async a=>a});const original=await service.capture(f.actor,f.input);assert.deepEqual(await f.service.capture(f.actor,f.input),original);assert.equal((await f.service.list(f.actor)).items.length,1);
});
