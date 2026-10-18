// C2: current paired-human admission preparation. C3 live fencing is mandatory
// before any governed editing can be enabled. No native ACL is changed here.
import {fail} from './auth.js';
import {createHash} from 'node:crypto';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const scopeEqual=(a,b)=>a?.organizationId===b?.organizationId&&a?.brandId===b?.brandId;
const sameWorkspace=(a,b)=>['nativeInstanceId','teamId','projectId','operatorProfileId'].every(key=>a?.[key]===b?.[key]);
function memberEditor(member){return member?.isActive===true&&member.canEdit===true&&member.isOwner===false&&member.isAdmin===false;}
export class PenpotBrandAccess {
 constructor({store,identity,pairing,scope,workspaceFor,rpc,reconcileMembership,now=()=>Date.now()}){
  if(!pairing||!UUID.test(pairing.nativeInstanceId||'')||typeof pairing.pairKey!=='function'||typeof pairing.profileKey!=='function'||typeof pairing.check!=='function'||typeof workspaceFor!=='function'||typeof rpc!=='function'||!scope?.organizationId||!scope?.brandId)throw Error('Current paired native workspace dependencies required');
  Object.assign(this,{store,identity,pairing,scope:{organizationId:scope.organizationId,brandId:scope.brandId},workspaceFor,rpc,reconcileMembership,now});
  this.key=`penpot-brand-access:${scope.organizationId}:${scope.brandId}`;this.teamsKey=`penpot-brand-teams:${pairing.nativeInstanceId}`;
 }
 current(identity,actorId,founder=false){
  const actor=identity?.users?.find(x=>x.id===actorId),org=identity?.organizations?.find(x=>x.id===this.scope.organizationId);
  if(!actor||actor.disabled===true||!org?.brands?.some(x=>x.id===this.scope.brandId)||!identity.memberships?.some(x=>x.userId===actorId&&x.organizationId===this.scope.organizationId&&x.brandIds.includes(this.scope.brandId))||(founder&&actor.role!=='founder'))throw fail(403,'Current Studio brand permission required');return actor;
 }
 async nativeWorkspace(actor){
  await this.identity.authorize(actor,this.scope.organizationId,this.scope.brandId);
  const workspace=await this.workspaceFor(actor,this.scope);
  if(![workspace?.ownerPrincipal,workspace?.projectId,workspace?.teamId].every(x=>UUID.test(x||'')))throw fail(503,'Verified native brand workspace required');
  const profile=await this.rpc(workspace,'get-profile',{}),project=await this.rpc(workspace,'get-project',{id:workspace.projectId}),team=await this.rpc(workspace,'get-team',{id:workspace.teamId}),members=await this.rpc(workspace,'get-team-members',{'team-id':workspace.teamId});
  if(profile?.id!==workspace.ownerPrincipal||project?.id!==workspace.projectId||project.teamId!==workspace.teamId||team?.id!==workspace.teamId||!Array.isArray(members))throw fail(403,'Current native workspace identity did not match');
  const owner=members.filter(x=>x.id===workspace.ownerPrincipal);if(owner.length!==1||owner[0].isActive!==true||owner[0].isOwner!==true)throw fail(403,'Explicit administrative native owner required');
  return {workspace,mapping:{nativeInstanceId:this.pairing.nativeInstanceId,teamId:workspace.teamId,projectId:workspace.projectId,operatorProfileId:workspace.ownerPrincipal},members};
 }
 dto(record,grant){return {state:record?'pending':'not-configured',nativeTeamId:record?.teamId||null,grantState:grant?.state||'not-paired',actingNativeProfileId:grant?.nativeProfileId||null,editingEnabled:false,reason:'Native sharing policy and live access fencing must be verified before editing.'};}
 async registerWorkspace(actor,input={}){
  if(!input||Object.keys(input).length)throw fail(400,'Native workspace registration has no browser-supplied IDs');this.identity.requireFounder(actor);this.current(await this.store.get('identity'),actor.id,true);
  const snapshot=await this.nativeWorkspace(actor);let result;
  await this.store.transact(['identity',this.key,this.teamsKey],([identity,record,registry])=>{
   this.current(identity,actor.id,true);registry=registry||{teams:[]};const reused=registry.teams.find(x=>x.teamId===snapshot.mapping.teamId);
   if(reused&&!scopeEqual(reused.scope,this.scope))throw fail(409,'Each governed brand requires a separate native team');
   if(record&&!sameWorkspace(record,snapshot.mapping))throw fail(409,'Existing native brand mapping is immutable; preserve its work');
   record=record||{...snapshot.mapping,scope:this.scope,epoch:1,createdAt:this.now(),state:'pending',sharingPolicy:'unverified',liveFence:'unverified',grants:[]};
   if(!reused)registry.teams.push({teamId:record.teamId,scope:this.scope});result=this.dto(record);return [identity,record,registry];
  });return result;
 }
 /** Uses actual pairing and native membership; never substitutes operator identity. */
 async inspect(actor,sessionContext){
  const paired=await this.pairing.status(actor,this.scope,sessionContext),snapshot=await this.nativeWorkspace(actor);
  if(!paired.connection)throw fail(409,'Connect your own native account first');
  const profileId=paired.connection.nativeProfileId;if(profileId===snapshot.mapping.operatorProfileId)throw fail(403,'Administrative native ownership is separate from your editing identity');
  const matches=snapshot.members.filter(x=>x.id===profileId);if(matches.length>1)throw fail(403,'Ambiguous native membership');const member=matches[0];let result;
  await this.store.transact(['identity',this.key,this.pairing.pairKey(actor.id),this.pairing.profileKey(profileId),...(this.identity.mode==='password'?[`session:${sessionContext}`]:[])],values=>{
   const [identity,record,pair,owner]=values;this.pairing.check(identity,actor.id,this.scope,sessionContext,values.at(-1));this.current(identity,actor.id);if(!record||!sameWorkspace(record,snapshot.mapping))throw fail(409,'Register this separate brand workspace before admitting editors');
   if(!pair?.connection||pair.connection.nativeProfileId!==profileId||owner?.actorId!==actor.id||owner.revokedAt!==null||owner.epoch!==pair.epoch)throw fail(403,'Current native pairing changed');
   const nextState=memberEditor(member)?'pending-native-policy':'pending-native-membership';
   const existing=record.grants.find(x=>x.actorId===actor.id),changed=existing?.nativeProfileId!==profileId||existing?.pairingEpoch!==pair.epoch||existing?.state!==nextState;
   const grant={actorId:actor.id,nativeProfileId:profileId,pairingEpoch:pair.epoch,epoch:(existing?.epoch||0)+(changed?1:0),state:nextState,observedAt:this.now()};
   if(member&&(member.isOwner===true||member.isAdmin===true))throw fail(403,'Ordinary Studio editors cannot use native owner or admin fallback');
   record.grants=record.grants.filter(x=>x.actorId!==actor.id);record.grants.push(grant);result=this.dto(record,grant);return [identity,record,pair,owner,...values.slice(4)];
  });return result;
 }
 /** One durable exact intent is saved BEFORE the native side effect. Pending/unknown
  * retries reuse the same payload and key; no email or arbitrary native IDs. */
 async reconcile(actor,{actorId,idempotencyKey}={}){
  if(!UUID.test(actorId||'')||!UUID.test(idempotencyKey||''))throw fail(400,'Current Studio person and reconciliation key required');
  if(typeof this.reconcileMembership!=='function')throw fail(503,'Native membership hook is unavailable');
  this.identity.requireFounder(actor);this.current(await this.store.get('identity'),actor.id,true);
  const native=await this.nativeWorkspace(actor);let command;
  const targetPairKey=this.pairing.pairKey(actorId);
  await this.store.transact(['identity',this.key,targetPairKey],([identity,record,pair])=>{
   this.current(identity,actor.id,true);if(!record||!sameWorkspace(record,native.mapping))throw fail(409,'Native workspace changed');
   if(record.grants.some(x=>x.actorId!==actorId&&x.reconciliation?.id===idempotencyKey))throw fail(409,'Reconciliation key belongs to another Studio person');
   const existing=record.grants.find(x=>x.actorId===actorId),connected=pair?.connection;
   const present=Boolean(identity.users.some(x=>x.id===actorId&&!x.disabled)&&identity.memberships.some(x=>x.userId===actorId&&x.organizationId===this.scope.organizationId&&x.brandIds.includes(this.scope.brandId))&&connected);
   const nativeProfileId=present?connected.nativeProfileId:existing?.nativeProfileId;if(!UUID.test(nativeProfileId||'')||nativeProfileId===record.operatorProfileId)throw fail(403,'Distinct paired human required');
   // No native membership grant can enable a bypass before C3 policy acceptance.
   if(present&&(record.state!=='current'||record.sharingPolicy!=='disabled'||record.liveFence!=='current'))throw fail(503,'Native policy and live fencing must be accepted before granting membership');
   const oldIntent=existing?.reconciliation;
   if(oldIntent?.id===idempotencyKey){if(oldIntent.initiator!==actor.id||oldIntent.nativeProfileId!==nativeProfileId||oldIntent.present!==present||oldIntent.pairingEpoch!==(pair?.epoch||0))throw fail(409,'Reconciliation intent changed; preserve the existing request');command=structuredClone(oldIntent);return [identity,record,pair];}
   if(oldIntent?.state==='pending')throw fail(409,'Preserve the unresolved native reconciliation intent');
   const intent={id:idempotencyKey,initiator:actor.id,actorId,nativeProfileId,present,pairingEpoch:pair?.epoch||0,workspaceEpoch:record.epoch,expectedEpoch:existing?.nativeEpoch||0,grantEpoch:(existing?.nativeEpoch||0)+1,state:'pending'};
   const grant={...(existing||{actorId,nativeProfileId,epoch:0}),nativeProfileId,pairingEpoch:intent.pairingEpoch,epoch:(existing?.epoch||0)+1,state:'pending-reconciliation',reconciliation:intent};record.grants=record.grants.filter(x=>x.actorId!==actorId);record.grants.push(grant);command=structuredClone(intent);return [identity,record,pair];
  });
  const payload={'team-id':native.mapping.teamId,'member-id':command.nativeProfileId,'intent-id':command.id,'expected-epoch':command.expectedEpoch,'grant-epoch':command.grantEpoch,present:command.present};
  if(command.state!=='acknowledged'){
   const ack=await this.reconcileMembership(native.workspace,payload);
   if(!ack?.acknowledged||ack.teamId!==payload['team-id']||ack.memberId!==payload['member-id']||ack.intentId!==command.id||ack.grantEpoch!==command.grantEpoch||ack.present!==command.present)throw fail(502,'Native membership acknowledgement did not match; preserve intent');
  }
  await this.store.transact(['identity',this.key,targetPairKey],([identity,record,pair])=>{
   this.current(identity,actor.id,true);const grant=record?.grants.find(x=>x.actorId===actorId),intent=grant?.reconciliation;
   if(!record||!sameWorkspace(record,native.mapping)||record.epoch!==command.workspaceEpoch||!intent||hash({...intent,state:'pending'})!==hash({...command,state:'pending'})||pair?.epoch!==command.pairingEpoch)throw fail(409,'Native reconciliation changed; preserve the accepted native receipt');
   const stillGranted=Boolean(identity.users.some(x=>x.id===actorId&&!x.disabled)&&identity.memberships.some(x=>x.userId===actorId&&x.organizationId===this.scope.organizationId&&x.brandIds.includes(this.scope.brandId))&&pair?.connection?.nativeProfileId===command.nativeProfileId);
   if(stillGranted!==command.present)throw fail(409,'Studio membership changed before native acknowledgement');
   intent.state='acknowledged';grant.nativeEpoch=command.grantEpoch;grant.state=command.present?'pending-native-policy':'revoked';return [identity,record,pair];
  });return {acknowledged:true,editingEnabled:false,nativeProfileId:command.nativeProfileId,present:command.present,grantEpoch:command.grantEpoch};
 }
 /** Private native callback authorization; root authenticates its transport before calling. */
 async authorizeReconciliation(input){
  const record=await this.store.get(this.key),grant=record?.grants.find(x=>x.reconciliation?.id===input.intentId),intent=grant?.reconciliation;
  if(!intent||record.teamId!==input.nativeTeamId||record.operatorProfileId!==input.nativeOperatorProfileId||intent.nativeProfileId!==input.nativeMemberId||intent.expectedEpoch!==input.expectedEpoch||intent.grantEpoch!==input.grantEpoch||intent.present!==input.present)throw fail(403,'Exact current native reconciliation intent required');
  await this.store.transact(['identity',this.key,this.pairing.pairKey(grant.actorId)],([identity,current,pair])=>{
   this.current(identity,intent.initiator,true);const live=current?.grants.find(x=>x.actorId===grant.actorId)?.reconciliation;
   if(!live||hash(live)!==hash(intent)||current.epoch!==intent.workspaceEpoch||pair?.epoch!==intent.pairingEpoch)throw fail(403,'Native reconciliation intent changed');
   const present=Boolean(identity.users.some(x=>x.id===grant.actorId&&!x.disabled)&&identity.memberships.some(x=>x.userId===grant.actorId&&x.organizationId===this.scope.organizationId&&x.brandIds.includes(this.scope.brandId))&&pair?.connection?.nativeProfileId===intent.nativeProfileId);
   if(present!==intent.present||(present&&(current.state!=='current'||current.sharingPolicy!=='disabled'||current.liveFence!=='current')))throw fail(403,'Current native membership or fencing changed');return [identity,current,pair];
  });return {authorized:true};
 }
 guardKeys(snapshot){return [this.key,this.pairing.pairKey(snapshot.actorId),this.pairing.profileKey(snapshot.nativeProfileId),...(this.identity.mode==='password'?[`session:${snapshot.sessionDigest}`]:[])];}
 /** Synchronous guard for the caller's existing atomic write; never nests transactions. */
 assertCurrent({identity,brandAccess:record,pair,profileOwner,session},snapshot){
  if(!scopeEqual(snapshot.scope,this.scope)||snapshot.nativeInstanceId!==this.pairing.nativeInstanceId)throw fail(403,'Native grant scope changed');
  this.pairing.check(identity,snapshot.actorId,this.scope,snapshot.sessionDigest,session);this.current(identity,snapshot.actorId);
  const grant=record?.grants?.find(x=>x.actorId===snapshot.actorId);
  if(!record||record.epoch!==snapshot.workspaceEpoch||record.teamId!==snapshot.nativeTeamId||record.projectId!==snapshot.projectId||record.operatorProfileId!==snapshot.operatorProfileId||record.operatorProfileId===snapshot.nativeProfileId||!pair?.connection||pair.connection.nativeProfileId!==snapshot.nativeProfileId||pair.epoch!==snapshot.pairingEpoch||profileOwner?.actorId!==snapshot.actorId||profileOwner.revokedAt!==null||profileOwner.epoch!==pair.epoch||!grant||grant.nativeProfileId!==snapshot.nativeProfileId||grant.epoch!==snapshot.grantEpoch||grant.pairingEpoch!==pair.epoch)throw fail(403,'Current paired native brand grant changed');
  if(record.state!=='current'||record.sharingPolicy!=='disabled'||record.liveFence!=='current'||grant.state!=='current')throw fail(503,'Native policy and live fencing are not ready for editing');
 }
 async require(actor,scope,sessionContext){
  if(!scopeEqual(scope,this.scope))throw fail(403,'Native grant belongs to another brand');
  const paired=await this.pairing.status(actor,this.scope,sessionContext);if(!paired.connection)throw fail(409,'Connect your own native account first');
  const nativeProfileId=paired.connection.nativeProfileId,snapshot=await this.nativeWorkspace(actor),record=await this.store.get(this.key),grant=record?.grants?.find(x=>x.actorId===actor.id);
  if(!record||!sameWorkspace(record,snapshot.mapping)||!grant)throw fail(503,'Native brand admission is pending');
  const grantSnapshot={actorId:actor.id,nativeInstanceId:this.pairing.nativeInstanceId,nativeProfileId,nativeTeamId:record.teamId,projectId:record.projectId,operatorProfileId:record.operatorProfileId,workspaceEpoch:record.epoch,grantEpoch:grant.epoch,pairingEpoch:grant.pairingEpoch,sessionDigest:sessionContext,scope:this.scope};
  await this.store.transact(['identity',...this.guardKeys(grantSnapshot)],values=>{const [identity,brandAccess,pair,profileOwner,session]=values;this.assertCurrent({identity,brandAccess,pair,profileOwner,session},grantSnapshot);return values;});
  // Native owner/configuration stays identical across acting humans and never
  // changes the existing compiler/design authority identity.
  return {workspace:snapshot.workspace,grantSnapshot};
 }
 /** Constructor-only native hook entry: profile comes from authenticated native middleware.
  * Even a prepared member is denied until C3 supplies verified live enforcement. */
 async admission({nativeProfileId,nativeTeamId,operation,nativeSession}={}){
  if(nativeTeamId===undefined||!UUID.test(nativeTeamId)||!nativeSession||nativeSession.profileId!==nativeProfileId||typeof nativeSession.id!=='string'||!UUID.test(nativeSession.id))throw fail(403,'Actual native team and authenticated session required');
  if(!UUID.test(nativeProfileId||'')||!['read','write','tokens','comment','subscribe','pointer','asset','export'].includes(operation))throw fail(403,'Unsupported governed native operation');
  const owner=await this.store.get(this.pairing.profileKey(nativeProfileId));if(!owner||owner.revokedAt!==null)throw fail(403,'Current native pairing required');let result;
  await this.store.transact(['identity',this.key,this.pairing.pairKey(owner.actorId),this.pairing.profileKey(nativeProfileId)],([identity,record,pair,currentOwner])=>{
   this.current(identity,owner.actorId);const grant=record?.grants?.find(x=>x.actorId===owner.actorId);
   if(!record||record.teamId!==nativeTeamId||record.operatorProfileId===nativeProfileId||!pair?.connection||pair.connection.nativeProfileId!==nativeProfileId||pair.epoch!==grant?.pairingEpoch||grant.nativeProfileId!==nativeProfileId||currentOwner?.actorId!==owner.actorId||currentOwner.revokedAt!==null||currentOwner.epoch!==pair.epoch)throw fail(403,'Current native brand grant required');
   result={allowed:false,editingEnabled:false,reason:'live-fence-required',grantEpoch:grant.epoch,workspaceEpoch:record.epoch};return [identity,record,pair,currentOwner];
  });return result;
 }
}

/** Fixed private native membership transport; no caller URL or operator cookie. */
export function createPenpotMembershipReconciler({sessions,transportMode='loopback',grantKey,fetchImpl=fetch}={}){
 const origin={loopback:'http://localhost:39008','docker-host':'http://host.docker.internal:39008'}[transportMode];if(!origin||typeof grantKey!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(grantKey))throw Error('Fixed private native grant transport required');
 return async(workspace,payload)=>{
  const cookie=sessions.get(workspace.operatorProfileId||workspace.ownerPrincipal)?.cookie;if(!cookie)throw fail(403,'Administrative native session unavailable');
  const response=await fetchImpl(origin+'/api/rpc/command/studio-reconcile-team-member',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',Cookie:cookie,Origin:'http://localhost:39008','X-Studio-Native-Grant-Key':grantKey},body:JSON.stringify(payload),redirect:'error',signal:AbortSignal.timeout(10000)});
  if(response.status!==200){await response.body?.cancel().catch(()=>{});throw fail([401,403,409].includes(response.status)?response.status:502,'Native membership was not acknowledged; preserve intent');}
  const reader=response.body?.getReader();if(!reader)throw fail(502,'Native membership acknowledgement missing');const chunks=[];let bytes=0,done=false;
  try{for(;;){const part=await reader.read();if(part.done){done=true;break;}bytes+=part.value.byteLength;if(bytes>4096)throw fail(502,'Native acknowledgement exceeds its bound');chunks.push(part.value);}}finally{if(!done)await reader.cancel().catch(()=>{});reader.releaseLock();}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail(502,'Native membership acknowledgement invalid');}
 };
}
