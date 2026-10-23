import test from 'node:test';
import assert from 'node:assert/strict';
import {DurableStore} from './storage.js';
import {createPlatform} from './platform.js';
import {DefiantStrategyService} from './defiant-strategy.js';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {createAnswerObservations} from './defiant-answer-observations.js';
import {createEvidenceHypotheses} from './defiant-evidence-hypotheses.js';
async function fixture(t){
 const store=new DurableStore(':memory:'),platform=createPlatform({store,authMode:'password'});await platform.ready;t.after(()=>store.close());await platform.identity.provision({username:'reviewer',password:'invented-hosted-password',role:'founder'});const actor={...(await platform.identity.login('reviewer','invented-hosted-password')).user,uid:'invented-managed-uid'};
 const org=await platform.identity.createOrganization(actor,'Invented hypotheses'),strategy=new DefiantStrategyService({store,identity:platform.identity,organizationId:org.id});await strategy.enable(actor,{});
 let time='2026-10-23T12:00:00.000Z',broken=false,revoked=false,reads=0;
 const snapshot={schemaVersion:1,organizationId:org.id,coverage:'Invented known evidence',months:[{month:'2025-06',amount:'-10.000000000001',currency:'USD',metric:'source-total-earned',sourceHash:'a'.repeat(64),receiptIds:[]}],receipts:[]};
 const evidence=createDefiantEvidenceService({organizationId:org.id,authorize:async a=>{await strategy.raw(a);return true;},loadSnapshot:async()=>{reads++;if(broken)throw Error('Unavailable');return snapshot;}});
 const authorizeCurrent=async a=>{if(revoked)throw Object.assign(Error('Denied'),{status:403});return a;};
 const create=(extra={})=>createEvidenceHypotheses({store,strategy,evidence,authorizeCurrent,now:()=>time,...extra});const service=create(),revision=(await evidence.read(actor,{resource:'manifest'})).revision;
 const input={idempotencyKey:'register-one',mode:'analysis-expectation',question:'What amount will the next analysis return?',expectation:'The selected reported amount meets the frozen threshold.',priorKnowledge:'This baseline has already been inspected.',baseline:{revision,month:'2025-06',currency:'USD'},target:{month:'2025-06',currency:'USD',metric:'source-total-earned'},criterion:{metric:'source-total-earned',currency:'USD',operator:'eq',threshold:'-10.000000000001'},supersedesHypothesisId:null};
 return {store,strategy,actor,org,evidence,snapshot,service,create,input,revision,authorizeCurrent,reads:()=>reads,setTime:v=>time=v,setBroken:()=>broken=true,revoke:()=>revoked=true};
}
const link=revision=>({idempotencyKey:'outcome-one',kind:'evidence-fact',reference:{revision},observedAt:null});
test('registration, exact rule, immutable outcome/correction and provider-down replay preserve original criteria',async t=>{
 const f=await fixture(t),r=await f.service.register(f.actor,f.input),id=r.hypothesis.hypothesisId;assert.equal(r.hypothesis.evaluatorVersion,'absolute-source-total-earned-v1');assert.match(r.hypothesis.questionHash,/^[a-f0-9]{64}$/);assert.equal(r.hypothesis.baseline.amount,'-10.000000000001');
 const saved=await f.service.link(f.actor,id,link(f.revision));assert.equal(saved.outcome.evaluation.result,'criterion-met');assert.equal(saved.outcome.evidenceReuse,'reused-known-evidence');assert.equal(saved.outcome.revisionChanged,false);
 const corrected=await f.service.correct(f.actor,id,{idempotencyKey:'correction-one',comment:'Known evidence, not a blind prediction.'});assert.deepEqual(corrected.hypothesis,r.hypothesis);assert.deepEqual(corrected.outcome,saved.outcome);assert.deepEqual(await f.service.correct(f.actor,id,{idempotencyKey:'correction-one',comment:'Known evidence, not a blind prediction.'}),corrected);
 f.setBroken();const before=f.reads();assert.deepEqual(await f.service.register(f.actor,f.input),corrected);assert.deepEqual(await f.service.link(f.actor,id,link(f.revision)),corrected);assert.equal(f.reads(),before);assert.equal((await f.service.list(f.actor)).items.length,1);
 await assert.rejects(f.service.register(f.actor,{...f.input,criterion:{...f.input.criterion,threshold:'0'}}),{status:409});await assert.rejects(f.service.correct(f.actor,id,{idempotencyKey:'other',comment:'Replace'}),{status:409});f.revoke();await assert.rejects(f.service.detail(f.actor,id),{status:403});
});
test('historical analysis remains explicit; future business outcome stays unavailable and cosmetic revision is not new evidence',async t=>{
 const f=await fixture(t),r=await f.service.register(f.actor,f.input);f.snapshot.coverage='Changed presentation only';const revision=(await f.evidence.read(f.actor,{resource:'manifest'})).revision;const out=await f.service.link(f.actor,r.hypothesis.hypothesisId,link(revision));assert.equal(out.outcome.revisionChanged,true);assert.equal(out.outcome.sourceHashChanged,false);assert.equal(out.outcome.evidenceReuse,'reused-known-evidence');
 const future={...f.input,idempotencyKey:'future',mode:'future-period-outcome',baseline:{...f.input.baseline,revision},target:{...f.input.target,month:'2027-01'}};const registered=await f.service.register(f.actor,future);f.setTime('2027-02-02T00:00:00.000Z');f.snapshot.months.push({...f.snapshot.months[0],month:'2027-01',sourceHash:'b'.repeat(64)});const next=(await f.evidence.read(f.actor,{resource:'manifest'})).revision;const outcome=await f.service.link(f.actor,registered.hypothesis.hypothesisId,link(next));assert.equal(outcome.outcome.evaluation.result,'unavailable');assert.equal(outcome.outcome.evaluation.reason,'business-series-unverified');assert.equal(outcome.outcome.evaluation.meaning,'future-business-evaluation-unavailable');
});
test('absent, ambiguous and incompatible facts cannot become supported outcomes; provider errors stay errors',async t=>{
 for(const [total,items,reason] of [[0,[],'evidence-missing'],[2,[{month:'2025-06',amount:'0',currency:'USD',metric:'source-total-earned',sourceHash:'b'.repeat(64)}],'evidence-ambiguous'],[1,[{month:'2025-06',amount:'0',currency:'EUR',metric:'source-total-earned',sourceHash:'b'.repeat(64)}],'currency-incompatible']]){
  const f=await fixture(t),r=await f.service.register(f.actor,f.input);const service=f.create({evidence:{read:async()=>({schemaVersion:1,scope:{organizationId:f.org.id},revision:f.revision,total,items})}});const out=await service.link(f.actor,r.hypothesis.hypothesisId,link(f.revision));assert.equal(out.outcome.evaluation.result,'unavailable');assert.equal(out.outcome.evaluation.reason,reason);
 }
 const f=await fixture(t),r=await f.service.register(f.actor,f.input);f.setBroken();await assert.rejects(f.service.link(f.actor,r.hypothesis.hypothesisId,link(f.revision)),{status:503});assert.equal((await f.service.detail(f.actor,r.hypothesis.hypothesisId)).outcome,null);
});
test('saved answer assertion retains exact checks and retrospective provenance rather than claiming business success',async t=>{
 const f=await fixture(t),observations=createAnswerObservations({store:f.store,strategy:f.strategy,evidence:f.evidence,authorizeCurrent:f.authorizeCurrent,now:()=> '2026-10-22T00:00:00.000Z'});const saved=await observations.capture(f.actor,{idempotencyKey:'answer',question:'Amount?',answer:'0',revision:f.revision,observedAt:null,hostLabel:null,modelId:null,assertions:[{kind:'earnings',value:'0',currency:'USD',span:{start:0,end:1,text:'0'},reference:{month:'2025-06'},receipt:null}]});
 const r=await f.service.register(f.actor,f.input),out=await f.service.link(f.actor,r.hypothesis.hypothesisId,{idempotencyKey:'link-answer',kind:'answer-assertion',reference:{observationId:saved.observation.observationId,assertionIndex:0},observedAt:null});assert.equal(out.outcome.observation.selectedResult.amountCheck,'mismatch');assert.equal(out.outcome.observation.assertion.value,'0');assert.equal(out.outcome.fact.amount,'-10.000000000001');assert.match(out.outcome.temporalQualification,/retrospective/);assert.equal(out.outcome.evaluation.meaning,'answer-assertion-evidence');assert.match(out.outcome.observation.selectedResultHash,/^[a-f0-9]{64}$/);
});
test('concurrent registration/link commits once, retry callbacks remain stable, revocation and abort prevent writes',async t=>{
 const f=await fixture(t),[a,b]=await Promise.all([f.service.register(f.actor,f.input),f.service.register(f.actor,f.input)]);assert.deepEqual(a,b);const id=a.hypothesis.hypothesisId;const [x,y]=await Promise.all([f.service.link(f.actor,id,link(f.revision)),f.service.link(f.actor,id,link(f.revision))]);assert.deepEqual(x,y);
 const controller=new AbortController();controller.abort();await assert.rejects(f.create({signal:controller.signal}).register(f.actor,{...f.input,idempotencyKey:'aborted'}),{status:408});
 const store={get:key=>f.store.get(key),transact:(keys,callback)=>f.store.transact(keys,values=>{const first=callback(structuredClone(values)),second=callback(structuredClone(values));assert.deepEqual(first,second);return second;})};const retry=await f.create({store}).register(f.actor,{...f.input,idempotencyKey:'retry'});assert.equal(retry.hypothesis.registeredAt,a.hypothesis.registeredAt);
 let calls=0;const revoked=f.create({authorizeCurrent:async actor=>{if(++calls===2)await f.store.update('identity',state=>({...state,memberships:state.memberships.filter(m=>m.organizationId!==f.org.id)}));return actor;}});await assert.rejects(revoked.register(f.actor,{...f.input,idempotencyKey:'revoked'}),{status:403});
});
test('clock rollback, invalid months, self supersedes and stale revision cannot persist misleading records',async t=>{
 const f=await fixture(t),r=await f.service.register(f.actor,f.input);f.setTime('2020-01-01T00:00:00.000Z');await assert.rejects(f.service.link(f.actor,r.hypothesis.hypothesisId,link(f.revision)),{status:503});
 for(const input of [{...f.input,idempotencyKey:'bad-month',target:{...f.input.target,month:'2025-13'}},{...f.input,supersedesHypothesisId:r.hypothesis.hypothesisId},{...f.input,idempotencyKey:'stale',baseline:{...f.input.baseline,revision:'b'.repeat(64)}}])await assert.rejects(f.service.register(f.actor,input));assert.equal((await f.service.list(f.actor)).items.length,1);
});
test('future target boundary is checked after baseline and again in transaction retry; malformed empty page is not absence',async t=>{
 const f=await fixture(t);f.setTime('2026-12-31T23:59:59.000Z');const input={...f.input,mode:'future-period-outcome',target:{...f.input.target,month:'2027-01'}};
 const slow=f.create({evidence:{read:async(...args)=>{const response=await f.evidence.read(...args);f.setTime('2027-01-01T00:00:00.000Z');return response;}}});await assert.rejects(slow.register(f.actor,input),{status:400});assert.equal((await f.service.list(f.actor)).items.length,0);
 f.setTime('2026-12-31T23:59:59.000Z');const store={get:k=>f.store.get(k),transact:(keys,callback)=>f.store.transact(keys,values=>{callback(structuredClone(values));f.setTime('2027-01-01T00:00:00.000Z');return callback(values);})};await assert.rejects(f.create({store}).register(f.actor,input),{status:400});assert.equal((await f.service.list(f.actor)).items.length,0);
 const malformed=f.create({evidence:{read:async()=>({schemaVersion:1,scope:{organizationId:f.org.id},revision:f.revision,total:0,items:[{}]})}});await assert.rejects(malformed.register(f.actor,f.input),{status:503});
});
test('baseline resolution and strict scalar boundaries reject unavailable or ambiguous registration without a record',async t=>{
 for(const [total,items,status] of [[0,[],404],[2,[{month:'2025-06',amount:'0',currency:'USD',sourceHash:'a'.repeat(64),metric:'source-total-earned'}],409],[1,[{month:'2025-06',amount:'0',currency:'USD',sourceHash:'a'.repeat(64)}],409]]){const f=await fixture(t),service=f.create({evidence:{read:async()=>({schemaVersion:1,scope:{organizationId:f.org.id},revision:f.revision,total,items})}});await assert.rejects(service.register(f.actor,f.input),{status});assert.equal((await f.service.list(f.actor)).items.length,0);}
 const f=await fixture(t);for(const suffix of ['\n','\r','\u2028'])await assert.rejects(f.service.register(f.actor,{...f.input,criterion:{...f.input.criterion,threshold:'0'+suffix}}),{status:400});
});
test('future registration rejects clock rollback between frozen registration time and fresh window guard',async t=>{
 const f=await fixture(t),times=['2027-01-01T00:00:01.000Z','2026-12-31T23:59:59.000Z'];let calls=0;const service=f.create({now:()=>times[Math.min(calls++,1)]});await assert.rejects(service.register(f.actor,{...f.input,mode:'future-period-outcome',target:{...f.input.target,month:'2027-01'}}),{status:503});assert.equal((await f.service.list(f.actor)).items.length,0);
});
