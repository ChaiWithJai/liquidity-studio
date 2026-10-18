// Native profile identity only. No native grants, editing authority or files are changed.
import {createHash,randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import {fail} from './auth.js';
const UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const HEX=/^[a-f0-9]{64}$/;
const SECRET=/^[A-Za-z0-9_-]{43}$/;
const hash=value=>createHash('sha256').update(value,'utf8').digest('hex');
const sameScope=(a,b)=>a?.organizationId===b?.organizationId&&a?.brandId===b?.brandId;
function scopeInput(scope){if(!scope||![scope.organizationId,scope.brandId].every(x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x)))throw fail(400,'Current organization and brand required');return {organizationId:scope.organizationId,brandId:scope.brandId};}
function sessionInput(value){if(typeof value!=='string'||!HEX.test(value))throw fail(401,'Verified Studio session required');return value;}
function empty(actorId,nativeInstanceId){return {actorId,nativeInstanceId,epoch:1,connection:null,pending:[]};}
export class PenpotProfilePairing {
 constructor({store,identity,nativeInstanceId,nativeOrigin='http://localhost:39008',pairingKey,now=()=>Date.now()}){
  if(!UUID.test(nativeInstanceId||'')||nativeOrigin!=='http://localhost:39008'||typeof pairingKey!=='string'||!SECRET.test(pairingKey))throw Error('Fixed private native pairing configuration required');
  Object.assign(this,{store,identity,nativeInstanceId,nativeOrigin,pairingKey,now});
 }
 pairKey(actorId){return `penpot-profile-pair:${hash(JSON.stringify([this.nativeInstanceId,actorId]))}`;}
 profileKey(profileId){return `penpot-profile-owner:${hash(JSON.stringify([this.nativeInstanceId,profileId]))}`;}
 challengeKey(digest){return `penpot-profile-challenge:${digest}`;}
 keys(actorId,sessionDigest,extra=[]){return ['identity',this.pairKey(actorId),...extra,...(this.identity.mode==='password'?[`session:${sessionDigest}`]:[])];}
 check(identity,actorId,scope,sessionDigest,session,authVersion){
  const actor=identity?.users?.find(x=>x.id===actorId),org=identity?.organizations?.find(x=>x.id===scope.organizationId);
  if(!actor||actor.disabled===true||!org?.brands?.some(x=>x.id===scope.brandId)||!identity.memberships?.some(x=>x.userId===actorId&&x.organizationId===scope.organizationId&&x.brandIds.includes(scope.brandId)))throw fail(403,'Current Studio brand membership required');
  if(authVersion!==undefined&&(actor.authVersion||0)!==authVersion)throw fail(401,'Studio credentials changed; reconnect');
  if(this.identity.mode==='password'&&(!session||session.userId!==actorId||!Number.isFinite(session.expiresAt)||session.expiresAt<=this.now()||(session.authVersion||0)!==(actor.authVersion||0)))throw fail(401,'Current Studio session required');
  return actor;
 }
 dto(pair,scope,sessionDigest){
  const challenge=pair.pending.filter(x=>sameScope(x.scope,scope)&&x.sessionDigest===sessionDigest).at(-1);
  const state=pair.connection?'connected':challenge?(challenge.expiresAt<=this.now()?'expired':challenge.status):'not-connected';
  return {state,connection:pair.connection?{nativeProfileId:pair.connection.nativeProfileId,...(pair.connection.nativeProfileName?{nativeProfileName:pair.connection.nativeProfileName}:{}),verifiedAt:pair.connection.verifiedAt}:null,challenge:challenge?{id:challenge.id,status:challenge.expiresAt<=this.now()?'expired':challenge.status,expiresAt:challenge.expiresAt,...(challenge.nativeProfileName?{nativeProfileName:challenge.nativeProfileName}:{})}:null,editingEnabled:false};
 }
 async context(actor,scope,sessionContext){scope=scopeInput(scope);sessionContext=sessionInput(sessionContext);if(!actor?.id)throw fail(401,'Sign in required');await this.identity.authorize(actor,scope.organizationId,scope.brandId);return {scope,sessionDigest:sessionContext};}
 async status(actor,scope,sessionContext){
  const context=await this.context(actor,scope,sessionContext);let result;
  await this.store.transact(this.keys(actor.id,context.sessionDigest),values=>{const [identity,stored]=values;this.check(identity,actor.id,context.scope,context.sessionDigest,values.at(-1));const pair=stored||empty(actor.id,this.nativeInstanceId);result=this.dto(pair,context.scope,context.sessionDigest);return [identity,pair,...values.slice(2)];});return result;
 }
 async issue(actor,scope,sessionContext){
  const context=await this.context(actor,scope,sessionContext),challenge=randomBytes(32).toString('base64url'),digest=hash(challenge),id=randomUUID(),expiresAt=this.now()+120000;let result;
  await this.store.transact(this.keys(actor.id,context.sessionDigest,[this.challengeKey(digest)]),values=>{
   const [identity,stored,existing]=values,current=this.check(identity,actor.id,context.scope,context.sessionDigest,values.at(-1));if(existing)throw fail(409,'Connection request already exists');const pair=stored||empty(actor.id,this.nativeInstanceId);
   if(pair.connection)throw fail(409,'Disconnect your current native account before connecting another');
   const active=pair.pending.filter(x=>x.expiresAt>this.now()&&['pending','native-confirmed'].includes(x.status));if(active.length>=2)throw fail(429,'Finish or disconnect your pending native connection first');
   const record={id,tokenSha256:digest,actorId:actor.id,nativeInstanceId:this.nativeInstanceId,scope:context.scope,sessionDigest:context.sessionDigest,authVersion:current.authVersion||0,status:'pending',issuedAt:this.now(),expiresAt,epoch:pair.epoch};
   pair.pending=[...active,structuredClone(record)];result={id,expiresAt,nativeConnectUrl:`${this.nativeOrigin}/studio-connect?challenge=${challenge}`};return [identity,pair,record,...values.slice(3)];
  });return result;
 }
 async receiveProof(presentedKey,input){
  if(typeof presentedKey!=='string'||!SECRET.test(presentedKey)||!timingSafeEqual(Buffer.from(presentedKey),Buffer.from(this.pairingKey)))throw fail(403,'Private native pairing proof required');
  if(!input||Object.keys(input).some(k=>!['challenge','nativeInstanceId','nativeProfileId','nativeProfileName'].includes(k))||typeof input.challenge!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(input.challenge)||input.nativeInstanceId!==this.nativeInstanceId||!UUID.test(input.nativeProfileId||'')||input.nativeProfileId==='00000000-0000-0000-0000-000000000000'||(input.nativeProfileName!==undefined&&(typeof input.nativeProfileName!=='string'||!input.nativeProfileName.trim()||input.nativeProfileName.length>120||/[\x00-\x1f\x7f]/.test(input.nativeProfileName))))throw fail(400,'Native profile proof invalid');
  const digest=hash(input.challenge),key=this.challengeKey(digest),prior=await this.store.get(key);if(!prior)throw fail(410,'Connection request expired or unavailable');
  await this.store.transact(this.keys(prior.actorId,prior.sessionDigest,[key]),values=>{
   const [identity,pair,record]=values;this.check(identity,prior.actorId,prior.scope,prior.sessionDigest,values.at(-1),prior.authVersion);
   this.live(record,pair,prior.actorId,prior.scope,prior.sessionDigest,digest);
   if(record.status==='native-confirmed'){if(record.nativeProfileId!==input.nativeProfileId)throw fail(409,'This request already verified another native account');return values;}
   if(record.status!=='pending')throw fail(409,'Connection request is no longer pending');
   Object.assign(record,{status:'native-confirmed',nativeProfileId:input.nativeProfileId,...(input.nativeProfileName?{nativeProfileName:input.nativeProfileName.trim()}:{}),nativeVerifiedAt:this.now()});
   const pending=pair.pending.find(x=>x.id===record.id);Object.assign(pending,structuredClone(record));return [identity,pair,record,...values.slice(3)];
  });return {recorded:true};
 }
 live(record,pair,actorId,scope,sessionDigest,digest){
  if(!record||record.tokenSha256!==digest||record.actorId!==actorId||record.nativeInstanceId!==this.nativeInstanceId||record.sessionDigest!==sessionDigest||!sameScope(record.scope,scope)||!pair||pair.actorId!==actorId||pair.nativeInstanceId!==this.nativeInstanceId||pair.epoch!==record.epoch||!pair.pending.some(x=>x.id===record.id&&x.tokenSha256===digest))throw fail(409,'Connection request does not match this Studio session and brand');
  if(record.expiresAt<=this.now())throw fail(410,'Connection request expired');
 }
 async complete(actor,scope,sessionContext,input){
  const context=await this.context(actor,scope,sessionContext);if(!input||Object.keys(input).join(',')!=='challengeId'||!UUID.test(input.challengeId||''))throw fail(400,'Connection request ID required');
  const prior=await this.store.get(this.pairKey(actor.id)),pending=prior?.pending.find(x=>x.id===input.challengeId);if(!pending||pending.status!=='native-confirmed'||!UUID.test(pending.nativeProfileId||''))throw fail(409,'This session has no verified native connection request');let result;
  await this.store.transact(this.keys(actor.id,context.sessionDigest,[this.challengeKey(pending.tokenSha256),this.profileKey(pending.nativeProfileId)]),values=>{
   const [identity,pair,record,owner]=values;this.check(identity,actor.id,context.scope,context.sessionDigest,values.at(-1),record?.authVersion);this.live(record,pair,actor.id,context.scope,context.sessionDigest,pending.tokenSha256);
   if(record.nativeProfileId!==pending.nativeProfileId)throw fail(409,'Native profile changed');
   if(owner&&owner.revokedAt===null&&owner.actorId!==actor.id)throw fail(409,'This native account is already connected to another Studio person');
   if(pair.connection||record.status!=='native-confirmed')throw fail(409,'Verify your native account before completing this connection');
   pair.connection={nativeProfileId:record.nativeProfileId,...(record.nativeProfileName?{nativeProfileName:record.nativeProfileName}:{}),verifiedAt:this.now(),epoch:pair.epoch};
   record.status='completed';pair.pending=[];result=this.dto(pair,context.scope,context.sessionDigest);return [identity,pair,record,{actorId:actor.id,nativeInstanceId:this.nativeInstanceId,nativeProfileId:record.nativeProfileId,epoch:pair.epoch,revokedAt:null},...values.slice(4)];
  });return result;
 }
 async disconnect(actor,scope,sessionContext,input){
  const context=await this.context(actor,scope,sessionContext);if(!input||Object.keys(input).length)throw fail(400,'Disconnect takes no account or file arguments');let result;
  const before=await this.store.get(this.pairKey(actor.id)),profileId=before?.connection?.nativeProfileId;
  await this.store.transact(this.keys(actor.id,context.sessionDigest,profileId?[this.profileKey(profileId)]:[]),values=>{
   const [identity,stored]=values;this.check(identity,actor.id,context.scope,context.sessionDigest,values.at(-1));const pair=stored||empty(actor.id,this.nativeInstanceId);
   if(pair.connection?.nativeProfileId!==profileId)throw fail(409,'Native connection changed; reload before disconnecting');
   if(profileId){const owner=values[2];if(owner&&owner.actorId!==actor.id)throw fail(409,'Native profile ownership changed');if(owner)owner.revokedAt=this.now();}
   pair.epoch++;pair.connection=null;pair.pending=[];result=this.dto(pair,context.scope,context.sessionDigest);return [identity,pair,...values.slice(2)];
  });return result;
 }
}
