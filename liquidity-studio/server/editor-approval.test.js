import test from 'node:test';
import assert from 'node:assert/strict';
import { DurableStore } from './storage.js';
import { EditorApprovalService } from './editor-approval.js';
const founder={id:'founder',role:'founder'}, marketer={id:'marketer',role:'marketer'};
function fixture() {
 const store=new DurableStore(':memory:');
 store.update('identity',()=>({users:[founder,marketer],memberships:[{userId:'founder',brandIds:['b']},{userId:'marketer',brandIds:['b']}]}));
 store.update('scope:o:b',()=>({backlog:[{id:'story',revision:1}]}));
 store.update('native:doc',()=>({id:'doc',organizationId:'o',brandId:'b',storyId:'story',revision:1,origin:{storyId:'story',storyRevision:1,generationId:'gen',brandRevision:'brand'},documentRef:{key:'immutable',sha256:'a'.repeat(64)}}));
 const identity={authorize:async actor=>{if(!store.get('identity').memberships.some(m=>m.userId===actor.id&&m.brandIds.includes('b')))throw Object.assign(new Error('denied'),{status:403});}};
 const native={key:id=>{if(id!=='doc')throw Object.assign(new Error('missing'),{status:404});return 'native:doc';},assertCurrent:(state,origin)=>{if(state.backlog[0].revision!==origin.storyRevision)throw Object.assign(new Error('source changed'),{status:409});}};
 const service=new EditorApprovalService({repo:{store,key:'scope:o:b',ready:Promise.resolve()},identity,native,scope:{organizationId:'o',brandId:'b'},now:()=> '2026-10-18T03:20:00.000Z'});
 let sequence=0;
 const call=(actor,action,expectedRevision,expectedNativeRevision=1,key)=>service.transition(actor,'doc',{action,expectedRevision,expectedNativeRevision,idempotencyKey:key||`review_action_${++sequence}_unique`});
 return {store,service,call};
}
test('two roles review exact revisions; only founder approval, attributed immutable receipts',async()=>{
 const f=fixture();try{
  assert.equal((await f.call(marketer,'create',0)).stage,'DraftReady');
  assert.equal((await f.call(marketer,'start',1)).stage,'InPostProd');
  assert.equal((await f.call(marketer,'submit',2)).stage,'FinalLayout');
  await assert.rejects(f.call(marketer,'approve',3),{status:403});
  const approval=await f.call(founder,'approve',3);
  assert.equal(approval.stage,'Approved');assert.equal(approval.revision,4);assert.equal(approval.actorId,'founder');
  const current=await f.service.read(marketer,'doc');assert.equal(current.stale,false);assert.equal(current.approval.nativeRevision,1);assert.equal(current.approval.documentSha256,'a'.repeat(64));
 }finally{f.store.close();}
});
test('idempotency survives later stages; changed replay and stale writers cannot overwrite',async()=>{
 const f=fixture();try{
  const first=await f.call(marketer,'create',0,1,'same_create_key_123');
  await f.call(marketer,'start',1);
  assert.deepEqual(await f.call(marketer,'create',0,1,'same_create_key_123'),first);
  await assert.rejects(f.call(marketer,'submit',2,1,'same_create_key_123'),{status:409});
  await assert.rejects(f.call(founder,'submit',1),{status:409});
  assert.equal((await f.service.read(founder,'doc')).revision,2);
 }finally{f.store.close();}
});
test('changed native or source invalidates approval; explicit restart binds new native revision',async()=>{
 const f=fixture();try{
  await f.call(founder,'create',0);await f.call(founder,'start',1);await f.call(founder,'submit',2);await f.call(founder,'approve',3);
  f.store.update('native:doc',v=>({...v,revision:2,documentRef:{...v.documentRef,sha256:'b'.repeat(64)}}));
  assert.equal((await f.service.read(founder,'doc')).stale,true);
  await assert.rejects(f.call(founder,'approve',4,2),{status:409});
  const restart=await f.call(founder,'restart',4,2);assert.equal(restart.stage,'DraftReady');
  f.store.update('scope:o:b',v=>({...v,backlog:[{id:'story',revision:2}]}));
  assert.equal((await f.service.read(founder,'doc')).stale,true);
  await assert.rejects(f.call(founder,'start',5,2),{status:409});
 }finally{f.store.close();}
});
test('current membership and current role gate replay and transition',async()=>{
 const f=fixture();try{
  await f.call(founder,'create',0,1,'founder_create_key_123');
  f.store.update('identity',v=>({...v,users:v.users.map(u=>u.id==='founder'?{...u,role:'marketer'}:u)}));
  await f.call(founder,'start',1);await f.call(founder,'submit',2);
  await assert.rejects(f.call(founder,'approve',3),{status:403});
  f.store.update('identity',v=>({...v,memberships:v.memberships.filter(m=>m.userId!=='founder')}));
  await assert.rejects(f.call(founder,'create',0,1,'founder_create_key_123'),{status:403});
 }finally{f.store.close();}
});

test('competing actors cannot both commit the same observed review revision',async()=>{
 const f=fixture();try{
  await f.call(founder,'create',0);
  const results=await Promise.allSettled([f.call(founder,'start',1),f.call(marketer,'start',1)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
  const review=await f.service.read(founder,'doc');
  assert.equal(review.revision,2);assert.equal(review.history.length,2);
 }finally{f.store.close();}
});

test('membership changed during authorization and client role/scope overrides fail closed',async()=>{
 const f=fixture();try{
  const authorize=f.service.identity.authorize;
  f.service.identity.authorize=async actor=>{
   await authorize(actor);
   f.store.update('identity',value=>({...value,memberships:value.memberships.filter(m=>m.userId!==actor.id)}));
  };
  await assert.rejects(f.call(founder,'create',0),{status:409});
  assert.equal(f.store.get('editor-review:o:b:doc'),null);
  await assert.rejects(f.service.transition(marketer,'doc',{action:'create',expectedRevision:0,expectedNativeRevision:1,idempotencyKey:'override_test_key_123',role:'founder'}),{status:400});
 }finally{f.store.close();}
});

test('only approval authority can reject final layout or reopen a current approved layout',async()=>{
 const f=fixture();try{
  await f.call(marketer,'create',0);await f.call(marketer,'start',1);await f.call(marketer,'submit',2);
  await assert.rejects(f.call(marketer,'reject',3),{status:403});
  await f.call(founder,'approve',3);
  await assert.rejects(f.call(marketer,'reject',4),{status:403});
  await assert.rejects(f.call(marketer,'restart',4),{status:403});
  assert.equal((await f.service.read(founder,'doc')).stage,'Approved');
  f.store.update('native:doc',v=>({...v,revision:2}));
  assert.equal((await f.call(marketer,'restart',4,2)).stage,'DraftReady');
 }finally{f.store.close();}
});

test('designated approval permission is explicit and bound to the current organization and brand',async()=>{
 const f=fixture();try{
  await f.call(marketer,'create',0);await f.call(marketer,'start',1);await f.call(marketer,'submit',2);
  f.store.update('identity',v=>({...v,memberships:v.memberships.map(m=>m.userId==='marketer'?{...m,organizationId:'foreign',approvalBrandIds:['b']}:m)}));
  await assert.rejects(f.call(marketer,'approve',3),{status:403});
  f.store.update('identity',v=>({...v,memberships:v.memberships.map(m=>m.userId==='marketer'?{...m,organizationId:'o',approvalBrandIds:['b']}:m)}));
  assert.equal((await f.service.read(marketer,'doc')).canApprove,true);
  assert.equal((await f.call(marketer,'approve',3)).stage,'Approved');
  assert.equal((await f.call(marketer,'reject',4)).stage,'InPostProd');
 }finally{f.store.close();}
});
