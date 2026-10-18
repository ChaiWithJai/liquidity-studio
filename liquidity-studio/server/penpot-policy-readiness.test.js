import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {PenpotBrandAccess} from './penpot-brand-access.js';
import {PenpotPolicyReadiness} from './penpot-policy-readiness.js';
const id=n=>`${n.repeat(8)}-${n.repeat(4)}-4${n.repeat(3)}-8${n.repeat(3)}-${n.repeat(12)}`;
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const scope={organizationId:'org_default',brandId:'brand_vedic'},operator=id('2'),teamId=id('3'),projectId=id('4');
async function fixture(t){
 const store=new DurableStore(':memory:'),identity=new IdentityService(store);t.after(()=>store.close());
 await identity.provision({username:'founder',password:'private-owned-qa-test-password',role:'founder'});
 const actor=(await identity.login('founder','private-owned-qa-test-password')).user;
 const pairing={nativeInstanceId:id('1'),pairKey:()=>'',profileKey:()=>'',check:()=>{}};
 const file={id:id('5'),projectId,revn:3,data:{humanText:'Keep this exact work'}};
 const workspace={ownerPrincipal:operator,projectId,teamId,fonts:[]};
 const rpc=async(_workspace,command)=>{
  switch(command){case 'get-profile':return {id:operator};case 'get-project':return {id:projectId,teamId};case 'get-team':return {id:teamId};case 'get-team-members':return [{id:operator,isOwner:true,isActive:true}];case 'get-file':return structuredClone(file);default:throw Error('Unexpected native write');}
 };
 const access=new PenpotBrandAccess({store,identity,pairing,scope,workspaceFor:async()=>workspace,rpc});
 await access.registerWorkspace(actor,{});
 const receipt={kind:'owned-qa',ownedQa:true,customerAccepted:false,nativePin:'ff7a66f51938b2293260ea27a64e2c4e0833b5e3',scope,workspace:{nativeInstanceId:id('1'),operatorProfileId:operator,teamId,projectId},workspaceEpoch:1,sourceSha:'a'.repeat(40),compileManifestSha256:'b'.repeat(64),nativeArtifactSha256:'c'.repeat(64),sourceFiles:[{fileId:file.id,revision:3,dataSha256:digest(file.data)}]};
 const status={nativePin:receipt.nativePin,teamId:teamId,operatorProfileId:operator,installedFeatures:{rpcPolicy:'v1',session:'v1',live:'v1',assets:'v1'},measuredRevocationProof:false};
 const make=(overrides={})=>new PenpotPolicyReadiness({access,receipt,receiptSha256:digest(receipt),readNativeStatus:async()=>structuredClone(status),...overrides});
 return {store,identity,actor,access,receipt,status,file,make};
}
test('fixed owned-QA receipt permits bootstrap without claiming customer or revocation acceptance',async t=>{
 const f=await fixture(t);f.store.update('preservation',()=>({text:'unchanged'}));
 const helper=f.make(),result=await helper.acceptOwnedQa(f.actor);
 assert.equal(result.kind,'owned-qa');assert.equal(result.customerAccepted,false);assert.equal(result.measuredRevocation,false);
 const record=f.store.get(f.access.key);assert.equal(record.epoch,2);assert.equal(record.state,'current');assert.equal(record.sharingPolicy,'disabled');assert.equal(record.liveFence,'current');assert.equal(record.policyAcceptance.customerAccepted,false);assert.deepEqual(record.grants,[]);
 assert.deepEqual(await helper.acceptOwnedQa(f.actor),result);assert.deepEqual(f.store.get('preservation'),{text:'unchanged'});
});
test('missing hook, foreign operator, or unavailable private native status leaves workspace pending',async t=>{
 for(const alter of [s=>{s.installedFeatures.assets=false;},s=>{s.operatorProfileId=id('9');},s=>{s.nativePin='unknown';}]){
  const f=await fixture(t),before=f.store.get(f.access.key);alter(f.status);
  await assert.rejects(f.make().acceptOwnedQa(f.actor),{status:503});assert.deepEqual(f.store.get(f.access.key),before);
 }
 const f=await fixture(t);await assert.rejects(f.make({readNativeStatus:async()=>{throw Error('Native unavailable');}}).acceptOwnedQa(f.actor),/Native unavailable/);assert.equal(f.store.get(f.access.key).state,'pending');
});
test('source drift, concurrent workspace epoch and current founder revocation fail before acceptance',async t=>{
 const f=await fixture(t);f.file.data.humanText='New native edit';await assert.rejects(f.make().acceptOwnedQa(f.actor),{status:409});assert.equal(f.store.get(f.access.key).state,'pending');
 const g=await fixture(t);await assert.rejects(g.make({readNativeStatus:async()=>{g.store.update(g.access.key,r=>({...r,epoch:r.epoch+1}));return g.status;}}).acceptOwnedQa(g.actor),{status:409});assert.equal(g.store.get(g.access.key).state,'pending');
 const h=await fixture(t);await assert.rejects(h.make({readNativeStatus:async()=>{h.store.update('identity',i=>{i.memberships=[];return i;});return h.status;}}).acceptOwnedQa(h.actor),{status:403});assert.equal(h.store.get(h.access.key).state,'pending');
});
test('receipt integrity, customer generalization and another scope reject at construction',async t=>{
 const f=await fixture(t);
 assert.throws(()=>f.make({receiptSha256:'0'.repeat(64)}),/Exact private/);
 for(const change of [{kind:'customer',customerAccepted:true},{ownedQa:false},{scope:{...scope,brandId:'brand_default'}}]){
  const receipt={...f.receipt,...change};assert.throws(()=>f.make({receipt,receiptSha256:digest(receipt)}));
 }
});
