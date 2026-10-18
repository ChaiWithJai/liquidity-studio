// Private operator bootstrap for disposable QA only. No HTTP/browser activation.
import {createHash} from 'node:crypto';
import {fail} from './auth.js';
const PIN='ff7a66f51938b2293260ea27a64e2c4e0833b5e3';
const UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const SHA=/^[a-f0-9]{64}$/;
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const mappingKeys=['nativeInstanceId','teamId','projectId','operatorProfileId'];
const sameMapping=(a,b)=>mappingKeys.every(key=>a?.[key]===b?.[key]);

/** Receipt and callback are constructor-owned private operator inputs. An owned-QA
 * receipt is NOT customer acceptance, native pairing, or measured revocation.
 * readNativeStatus must invoke the private authenticated studio-access-status RPC;
 * never provide a public feature endpoint or a browser-supplied boolean here. */
export class PenpotPolicyReadiness {
 #receipt;
 #receiptSha256;
 constructor({access,receipt,receiptSha256,readNativeStatus,now=()=>Date.now()}){
  if(!access?.store||typeof access.nativeWorkspace!=='function'||typeof readNativeStatus!=='function')throw Error('Existing native access and private status reader required');
  const r=structuredClone(receipt);
  if(r?.kind!=='owned-qa'||r.ownedQa!==true||r.customerAccepted!==false||r.nativePin!==PIN||!r.scope?.organizationId||!r.scope?.brandId||!mappingKeys.every(k=>UUID.test(r.workspace?.[k]||''))||!Number.isSafeInteger(r.workspaceEpoch)||r.workspaceEpoch<1||!/^[a-f0-9]{40}$/.test(r.sourceSha||'')||!SHA.test(r.compileManifestSha256||'')||!SHA.test(r.nativeArtifactSha256||'')||!Array.isArray(r.sourceFiles)||r.sourceFiles.length>8||!r.sourceFiles.every(f=>UUID.test(f.fileId||'')&&Number.isSafeInteger(f.revision)&&f.revision>=0&&SHA.test(f.dataSha256||''))||new Set(r.sourceFiles.map(f=>f.fileId)).size!==r.sourceFiles.length||!SHA.test(receiptSha256||'')||digest(r)!==receiptSha256)throw Error('Exact private owned-QA acceptance receipt required');
  if(r.scope.organizationId!==access.scope.organizationId||r.scope.brandId!==access.scope.brandId||r.workspace.nativeInstanceId!==access.pairing.nativeInstanceId)throw Error('Owned-QA receipt belongs to another workspace');
  this.#receipt=r;this.#receiptSha256=receiptSha256;
  Object.assign(this,{access,readNativeStatus,now});
 }
 async acceptOwnedQa(actor){
  const a=this.access,r=this.#receipt;
  a.identity.requireFounder(actor);a.current(await a.store.get('identity'),actor.id,true);
  const native=await a.nativeWorkspace(actor);
  if(!sameMapping(native.mapping,r.workspace))throw fail(409,'Owned-QA native workspace changed');
  const status=await this.readNativeStatus(native.workspace);
  // Private operator adapter normalizes the native DTO using the existing
  // transport parser. Never treat an absent loaded hook as supported.
  if(status?.nativePin!==PIN||status.teamId!==r.workspace.teamId||status.operatorProfileId!==r.workspace.operatorProfileId||!['rpcPolicy','session','live','assets'].every(k=>status.installedFeatures?.[k]==='v1')||status.measuredRevocationProof!==false)throw fail(503,'All fixed native policy hooks must be loaded for owned QA');
  for(const expected of r.sourceFiles){
   const file=await a.rpc(native.workspace,'get-file',{id:expected.fileId});
   if(file?.id!==expected.fileId||file.projectId!==r.workspace.projectId||file.revn!==expected.revision||!file.data||digest(file.data)!==expected.dataSha256)throw fail(409,'Owned-QA native source changed; preserve its current work');
  }
  let result;
  await a.store.transact(['identity',a.key],([identity,record])=>{
   a.current(identity,actor.id,true);
   if(!record||!sameMapping(record,r.workspace)||record.scope?.organizationId!==r.scope.organizationId||record.scope?.brandId!==r.scope.brandId)throw fail(409,'Register the exact owned-QA workspace first');
   if(record.policyAcceptance){
    if(record.policyAcceptance.receiptSha256!==this.#receiptSha256||record.policyAcceptance.kind!=='owned-qa'||record.policyAcceptance.customerAccepted!==false||record.epoch!==r.workspaceEpoch+1)throw fail(409,'Preserve the existing native policy acceptance');
   }else{
    if(record.epoch!==r.workspaceEpoch||record.state!=='pending'||record.grants.some(g=>g.reconciliation))throw fail(409,'Owned-QA policy epoch or reconciliation changed');
    record.epoch++;
    record.state='current';record.sharingPolicy='disabled';record.liveFence='current';
    record.policyAcceptance={kind:'owned-qa',ownedQa:true,customerAccepted:false,measuredRevocation:false,nativePin:PIN,receiptSha256:this.#receiptSha256,sourceSha:r.sourceSha,compileManifestSha256:r.compileManifestSha256,nativeArtifactSha256:r.nativeArtifactSha256,sourceFiles:structuredClone(r.sourceFiles),acceptedBy:actor.id,acceptedAt:this.now()};
   }
   result={kind:'owned-qa',customerAccepted:false,measuredRevocation:false,workspaceEpoch:record.epoch,receiptSha256:this.#receiptSha256};
   return [identity,record];
  });
  return result;
 }
}
