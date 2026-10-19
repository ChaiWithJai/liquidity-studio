// Technical readiness for the configured managed deployment. This is not human
// acceptance or measured revocation, and does not replace owned-QA provenance.
import {randomUUID} from 'node:crypto';
import {fail} from './auth.js';
import {nativePublicOrigin,nativeRpcOrigin} from './penpot-origins.js';
const PIN='ff7a66f51938b2293260ea27a64e2c4e0833b5e3';
const keys=['nativeInstanceId','teamId','projectId','operatorProfileId'];
const same=(a,b)=>keys.every(k=>a?.[k]===b?.[k]);
export function createManagedStatusReader({sessions,grantKey,nativeOrigin,rpcOrigin,fetchImpl=fetch}){
 const publicOrigin=nativePublicOrigin(nativeOrigin),origin=nativeRpcOrigin(rpcOrigin);
 return async workspace=>{
  const cookie=sessions.get(workspace.ownerPrincipal)?.cookie;if(!cookie)throw fail(503,'Native operator session unavailable');
  const response=await fetchImpl(origin+'/api/rpc/command/studio-access-status',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',Origin:publicOrigin,Cookie:cookie,'X-Studio-Native-Grant-Key':grantKey},body:JSON.stringify({'team-id':workspace.teamId}),redirect:'error',signal:AbortSignal.timeout(10000)});
  if(response.status!==200){await response.body?.cancel().catch(()=>{});throw fail(503,'Native deployment readiness is unavailable');}
  let size=0;const chunks=[];for await(const chunk of response.body){size+=chunk.length;if(size>4096)throw fail(502,'Native readiness response exceeds its bound');chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail(502,'Native readiness response is invalid');}
 };
}
export function installManagedAdmission(access,{readNativeStatus,now=()=>Date.now()}){
 if(typeof readNativeStatus!=='function')throw Error('Private native status reader required');
 access.setupCurrent=async(actor,sessionContext)=>{
  const paired=await access.pairing.status(actor,access.scope,sessionContext);
  if(!paired.connection)throw fail(409,'Connect your Penpot account first');
  // Constructor-owned workspace verification; the browser supplies no native IDs.
  await access.registerCurrentWorkspace(actor);
  const native=await access.nativeWorkspace(actor);
  if(paired.connection.nativeProfileId===native.mapping.operatorProfileId)throw fail(403,'Connect an editing account rather than the administrative owner');
  const status=await readNativeStatus(native.workspace);
  if(status?.nativePin!==PIN||status.teamId!==native.mapping.teamId||status.operatorProfileId!==native.mapping.operatorProfileId||!['rpcPolicy','session','live','assets'].every(k=>status.installedFeatures?.[k]==='v1')||status.measuredRevocationProof!==false)throw fail(503,'Native deployment hooks are not ready');
  const pairKey=access.pairing.pairKey(actor.id),sessionKeys=access.identity.mode==='password'?[`session:${sessionContext}`]:[];
  await access.store.transact(['identity',access.key,pairKey,...sessionKeys],([identity,record,pair,...sessions])=>{
   access.pairing.check(identity,actor.id,access.scope,sessionContext,sessions[0]);access.current(identity,actor.id);
   if(!pair?.connection||pair.connection.nativeProfileId!==paired.connection.nativeProfileId||!record||!same(record,native.mapping))throw fail(409,'Current native workspace or connection changed');
   if(record.policyAcceptance?.kind==='owned-qa'){
    if(record.state!=='current'||record.liveFence!=='current'||record.sharingPolicy!=='disabled')throw fail(409,'Preserve existing owned-QA readiness');
   }else if(record.policyAcceptance&&record.policyAcceptance.kind!=='managed-deployment')throw fail(409,'Preserve existing native policy provenance');
   else if(!record.policyAcceptance){
    record.epoch++;record.state='current';record.sharingPolicy='disabled';record.liveFence='current';
    record.policyAcceptance={kind:'managed-deployment',nativePin:PIN,installedFeatures:structuredClone(status.installedFeatures),workspace:structuredClone(native.mapping),checkedBy:actor.id,checkedAt:now(),humanAcceptance:false,measuredRevocation:false};
   }
   return [identity,record,pair,...sessions];
  });
  await access.inspect(actor,sessionContext);
  const record=await access.store.get(access.key),grant=record.grants.find(g=>g.actorId===actor.id);
  // Retain a pending/acknowledged intent across a lost reply; never create a new
  // native side effect merely because the client retries this empty-body action.
  if(grant?.state!=='current')await access.reconcileCurrent(actor,grant?.reconciliation?.pairingEpoch===grant?.pairingEpoch?grant.reconciliation.id:randomUUID());
  await access.inspect(actor,sessionContext);
  return {...await access.pairing.status(actor,access.scope,sessionContext),...await access.connectionStatus(actor,sessionContext),setupAvailable:true};
 };
 return access;
}
