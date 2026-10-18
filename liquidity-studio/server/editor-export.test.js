import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {DurableStore} from './storage.js';
import {EditorApprovalService} from './editor-approval.js';
import {EditorExportService} from './editor-export.js';
const founder={id:'founder',role:'founder'},marketer={id:'marketer',role:'marketer'};
async function fixture(){
 const store=new DurableStore(':memory:');let at=1792296000000;
 store.update('identity',()=>({users:[founder,marketer],memberships:[{userId:'founder'},{userId:'marketer'}]}));
 store.update('source',()=>({backlog:[{id:'story',contentRevision:1,revision:1}]}));
 store.update('native',()=>({id:'doc',organizationId:'org',brandId:'brand',storyId:'story',revision:1,origin:{storyId:'story',storyRevision:1,sourceContentRevision:1,generationId:'gen',brandRevision:'brand'},documentRef:{sha256:'a'.repeat(64)}}));
 const identity={authorize:async actor=>{if(!store.get('identity').memberships.some(m=>m.userId===actor.id))throw Object.assign(new Error('Revoked'),{status:403});}};
 const native={key:()=> 'native',hydrate:async()=>({document:{height:1350,pages:[{}]}}),assertCurrent:(source,origin)=>{if(source.backlog[0].contentRevision!==origin.sourceContentRevision)throw Object.assign(new Error('Changed'),{status:409});}};
 const approval=new EditorApprovalService({repo:{store,key:'source',ready:Promise.resolve()},scope:{organizationId:'org',brandId:'brand'},identity,native});
 let revision=0;for(const action of ['create','start','submit','approve'])await approval.transition(founder,'doc',{action,expectedRevision:revision++,expectedNativeRevision:1,idempotencyKey:`review_${action}_unique_key`});
 const service=new EditorExportService({approval,now:()=>at});
 const bytes=await sharp({create:{width:1080,height:1350,channels:4,background:'#eebbaa'}}).png().toBuffer();
 const input={expectedReviewRevision:4,expectedNativeRevision:1,pageIndex:0,base64:bytes.toString('base64'),idempotencyKey:'native_export_unique_key'};
 return {store,service,approval,input,bytes,advance:ms=>at+=ms};
}
test('exact private bytes require explicit approval; receipt replay survives service reconstruction and expiry',async()=>{
 const f=await fixture();try{
  const stage=await f.service.stage(marketer,'doc',f.input);assert.equal(stage.signedOff,false);assert.equal(stage.reference,undefined);
  assert.deepEqual((await f.service.bytes(marketer,'doc',stage.artifactId)).bytes,f.bytes);
  await assert.rejects(f.service.signoff(marketer,'doc',stage.artifactId,{sha256:stage.sha256,reviewed:true}),{status:403});
  const envelope=await f.service.signoff(founder,'doc',stage.artifactId,{sha256:stage.sha256,reviewed:true});
  assert.equal(envelope.secret,undefined);const receipt=await f.service.complete(marketer,'doc',envelope);
  f.advance(400000);const reopened=new EditorExportService({approval:f.approval});
  assert.deepEqual(await reopened.complete(founder,'doc',envelope),receipt);assert.equal((await f.approval.read(founder,'doc')).exports.length,1);
 }finally{f.store.close();}
});
test('planning can precede or follow verified export; real content edits invalidate it',async()=>{
 for(const before of [true,false]){const f=await fixture();try{
  const plan=()=>f.store.update('source',s=>{Object.assign(s.backlog[0],{revision:2,status:'Scheduled',scheduledDay:'Tuesday'});return s;});
  if(before)plan();const stage=await f.service.stage(founder,'doc',f.input),envelope=await f.service.signoff(founder,'doc',stage.artifactId,{sha256:stage.sha256,reviewed:true});
  await f.service.complete(founder,'doc',envelope);if(!before)plan();assert.equal((await f.approval.read(founder,'doc')).stale,false);
  f.store.update('source',s=>{s.backlog[0].contentRevision++;return s;});await assert.rejects(f.service.complete(founder,'doc',envelope),{status:409});
 }finally{f.store.close();}}
});
test('forged, expired, wrong-scope and unsigned completions record no export',async()=>{
 const f=await fixture();try{
  const stage=await f.service.stage(founder,'doc',f.input),envelope=await f.service.signoff(founder,'doc',stage.artifactId,{sha256:stage.sha256,reviewed:true});
  for(const change of [{sha256:'b'.repeat(64)},{brandId:'foreign'},{signature:'0'.repeat(64)},{nonce:'other'}])await assert.rejects(f.service.complete(founder,'doc',{...envelope,...change}));
  f.advance(120001);await assert.rejects(f.service.complete(founder,'doc',envelope),{status:403});assert.equal((await f.approval.read(founder,'doc')).exports,undefined);
 }finally{f.store.close();}
});
test('hash corruption and changed idempotency input fail; revoked principal cannot replay receipts',async()=>{
 const f=await fixture();try{
  const stage=await f.service.stage(founder,'doc',f.input);assert.deepEqual(await f.service.stage(founder,'doc',f.input),stage);
  await assert.rejects(f.service.stage(founder,'doc',{...f.input,pageIndex:1}),{status:409});
  const envelope=await f.service.signoff(founder,'doc',stage.artifactId,{sha256:stage.sha256,reviewed:true});await f.service.complete(founder,'doc',envelope);
  const key=f.store.keys('editor-export:org:brand:bytes:')[0];f.store.update(key,p=>({...p,base64:Buffer.from('corrupt').toString('base64')}));
  await assert.rejects(f.service.complete(founder,'doc',envelope),{status:422});
  f.store.update('identity',i=>({...i,memberships:[]}));await assert.rejects(f.service.complete(founder,'doc',envelope),{status:403});
 }finally{f.store.close();}
});
