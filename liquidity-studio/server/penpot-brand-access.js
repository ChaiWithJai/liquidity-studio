// C2: current paired-human admission preparation. C3 live fencing is mandatory
// before any governed editing can be enabled. No native ACL is changed here.
import {fail} from './auth.js';
const UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const scopeEqual=(a,b)=>a?.organizationId===b?.organizationId&&a?.brandId===b?.brandId;
const sameWorkspace=(a,b)=>['nativeInstanceId','teamId','projectId','operatorProfileId'].every(key=>a?.[key]===b?.[key]);
function memberEditor(member){return member?.isActive===true&&member.canEdit===true&&member.isOwner===false&&member.isAdmin===false;}
export class PenpotBrandAccess {
 constructor({store,identity,pairing,scope,workspaceFor,rpc,now=()=>Date.now()}){
  if(!pairing||!UUID.test(pairing.nativeInstanceId||'')||typeof pairing.pairKey!=='function'||typeof pairing.profileKey!=='function'||typeof pairing.check!=='function'||typeof workspaceFor!=='function'||typeof rpc!=='function'||!scope?.organizationId||!scope?.brandId)throw Error('Current paired native workspace dependencies required');
  Object.assign(this,{store,identity,pairing,scope:{organizationId:scope.organizationId,brandId:scope.brandId},workspaceFor,rpc,now});
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
  return {mapping:{nativeInstanceId:this.pairing.nativeInstanceId,teamId:workspace.teamId,projectId:workspace.projectId,operatorProfileId:workspace.ownerPrincipal},members};
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
 /** Constructor-only native hook entry: profile comes from authenticated native middleware.
  * Even a prepared member is denied until C3 supplies verified live enforcement. */
 async admission(nativeProfileId,operation){
  if(!UUID.test(nativeProfileId||'')||!['read','write','tokens','comment','subscribe','pointer','asset','export'].includes(operation))throw fail(403,'Unsupported governed native operation');
  const owner=await this.store.get(this.pairing.profileKey(nativeProfileId));if(!owner||owner.revokedAt!==null)throw fail(403,'Current native pairing required');let result;
  await this.store.transact(['identity',this.key,this.pairing.pairKey(owner.actorId),this.pairing.profileKey(nativeProfileId)],([identity,record,pair,currentOwner])=>{
   this.current(identity,owner.actorId);const grant=record?.grants?.find(x=>x.actorId===owner.actorId);
   if(!record||record.operatorProfileId===nativeProfileId||!pair?.connection||pair.connection.nativeProfileId!==nativeProfileId||pair.epoch!==grant?.pairingEpoch||grant.nativeProfileId!==nativeProfileId||currentOwner?.actorId!==owner.actorId||currentOwner.revokedAt!==null||currentOwner.epoch!==pair.epoch)throw fail(403,'Current native brand grant required');
   result={allowed:false,editingEnabled:false,reason:'live-fence-required',grantEpoch:grant.epoch,workspaceEpoch:record.epoch};return [identity,record,pair,currentOwner];
  });return result;
 }
}
