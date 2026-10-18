import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {fail} from './auth.js';
import {newCompletionKey,signCompletion,verifyCompletion} from './editor-completion-envelope.js';
const digest=value=>createHash('sha256').update(Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
const copy=value=>structuredClone(value);
function exact(value,fields){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!fields.includes(key))||fields.some(key=>!Object.hasOwn(value,key)))throw fail(400,'Invalid native export fields');
}
/** Private PNG staging is deliberately separate from human approval of its exact bytes. */
export class EditorExportService {
 constructor({approval,now=()=>Date.now(),enabled=true}){
  Object.assign(this,{approval,now,enabled});this.store=approval.store;this.scope=approval.scope;
  this.prefix=`editor-export:${this.scope.organizationId}:${this.scope.brandId}:`;
  this.keyring='editor-export-signing-keys';
 }
 keys(id,artifactId){return [...this.approval.keys(id),this.prefix+artifactId,this.keyring,this.prefix+'events:'+id,this.prefix+'staging:'+id];}
 checked(values,principal,id){
  const [identity,source,native,review]=values;
  if(digest(identity)!==principal.identityHash)throw fail(409,'Membership changed; reload export');
  this.approval.scoped(native);this.approval.native.assertCurrent(source,native.origin);
  if(!review||review.stage!=='Approved'||this.approval.stale(source,native,review))throw fail(409,'Approve the current saved layout before exporting');
  if(native.id!==id)throw fail(404,'Native document not found');
  return {identity,source,native,review};
 }
 binding(id,review){return digest({scope:this.scope,nativeId:id,reviewRevision:review.revision,binding:review.binding});}
 async stage(actor,id,input){
  exact(input,['expectedReviewRevision','expectedNativeRevision','pageIndex','base64','idempotencyKey']);
  if(!Number.isSafeInteger(input.expectedReviewRevision)||input.expectedReviewRevision<1||!Number.isSafeInteger(input.expectedNativeRevision)||input.expectedNativeRevision<1||!Number.isSafeInteger(input.pageIndex)||input.pageIndex<0||typeof input.idempotencyKey!=='string'||!/^[A-Za-z0-9_-]{16,100}$/.test(input.idempotencyKey)||typeof input.base64!=='string'||input.base64.length>5592408||! /^[A-Za-z0-9+/]+={0,2}$/.test(input.base64))throw fail(400,'Invalid native export request');
  const bytes=Buffer.from(input.base64,'base64');
  if(!bytes.length||bytes.length>4*1024*1024||bytes.toString('base64')!==input.base64)throw fail(413,'Export PNG must be at most four MiB');
  const image=sharp(bytes,{limitInputPixels:4_000_000}),info=await image.metadata();
  if(info.format!=='png'||info.pages>1||info.width!==1080||![1350,1920].includes(info.height))throw fail(422,'Export requires a full-size single-page PNG');
  await image.resize(1,1).raw().toBuffer();
  const principal=await this.approval.principal(actor),artifactId=digest({actor:principal.actor.id,key:input.idempotencyKey,id});
  const fingerprint=digest({...input,base64:undefined,sha256:digest(bytes)}),keys=this.keys(id,artifactId);
  let captured,replay;
  await this.store.transact(keys,values=>{
   const {native,review}=this.checked(values,principal,id);const prior=values[4];
   if(prior){if(prior.fingerprint!==fingerprint)throw fail(409,'Export idempotency key changed');replay=this.dto(prior);return values;}
   if(review.revision!==input.expectedReviewRevision||native.revision!==input.expectedNativeRevision)throw fail(409,'Review or native document changed');
   if((values[6]?.events.length||0)>=256)throw fail(409,'Export receipt capacity reached; reconcile with operator');
   captured={native:copy(native),review:copy(review)};return values;
  });
  if(replay)return replay;
  const hydrated=await this.approval.native.hydrate(captured.native);
  if(input.pageIndex>=hydrated.document.pages.length||info.height!==hydrated.document.height)throw fail(422,'Export page does not match the saved document');
  // Reserve before any payload write. Failed/crashed reservations stay bounded
  // and require operator reconciliation rather than unbounded orphan uploads.
  await this.store.transact(keys,values=>{
   const {review}=this.checked(values,principal,id);
   if(this.binding(id,review)!==this.binding(id,captured.review))throw fail(409,'Saved layout changed before staging PNG');
   const index=values[7]||{entries:[]},prior=index.entries.find(entry=>entry.artifactId===artifactId);
   if(prior&&prior.fingerprint!==fingerprint)throw fail(409,'Export idempotency key changed');
   if(!prior){if(index.entries.length>=32)throw fail(409,'Export staging capacity reached; reconcile retained artifacts with operator');index.entries.push({artifactId,fingerprint});}
   values[7]=index;return values;
  });
  // Payload is immutable and outside the bounded approval/receipt transaction.
  // A crash may leave an unreferenced private payload, never an Exported fact.
  let reference;
  if(this.store.uploadArtifact)reference={artifact:await this.store.uploadArtifact(this.scope,artifactId,bytes,'image/png')};
  else {reference={key:this.prefix+'bytes:'+artifactId};await this.store.update(reference.key,prior=>{
   if(prior&&prior.sha256!==digest(bytes))throw fail(409,'Staged export bytes changed');
   return {sha256:digest(bytes),base64:bytes.toString('base64')};
  });}
  let result;
  await this.store.transact(keys,values=>{
   const {native,review}=this.checked(values,principal,id);
   if(values[4]){if(values[4].fingerprint!==fingerprint)throw fail(409,'Export idempotency key changed');result=this.dto(values[4]);return values;}
   if(review.revision!==input.expectedReviewRevision||native.revision!==input.expectedNativeRevision||this.binding(id,review)!==this.binding(id,captured.review))throw fail(409,'Saved layout changed while staging PNG');
   values[4]={artifactId,nativeId:id,actorId:principal.actor.id,fingerprint,reference,bindingId:this.binding(id,review),reviewRevision:review.revision,nativeRevision:native.revision,pageIndex:input.pageIndex,sha256:digest(bytes),size:bytes.length,mime:'image/png',stagedAt:this.now(),signoff:null};
   result=this.dto(values[4]);return values;
  });return result;
 }
 dto(stage){const {reference,fingerprint,signoff,...publicFields}=stage;return {...copy(publicFields),signedOff:!!signoff};}
 async list(actor,id){
  const principal=await this.approval.principal(actor),keys=[...this.approval.keys(id),this.prefix+'staging:'+id];let captured;
  await this.store.transact(keys,values=>{
   const [identity,source,native,review,index]=values;
   if(digest(identity)!==principal.identityHash)throw fail(409,'Membership changed; reload exports');
   this.approval.scoped(native);this.approval.native.assertCurrent(source,native.origin);
   captured={binding:review?.stage==='Approved'&&!this.approval.stale(source,native,review)?this.binding(id,review):null,entries:copy(index?.entries||[])};return values;
  });
  if(!captured.binding)return [];
  const stages=await Promise.all(captured.entries.map(entry=>this.store.get(this.prefix+entry.artifactId)));
  const currentPrincipal=await this.approval.principal(actor);
  await this.store.transact(keys,values=>{const {review}=this.checked(values,currentPrincipal,id);if(this.binding(id,review)!==captured.binding)throw fail(409,'Review changed while listing exports');return values;});
  return stages.filter(stage=>stage?.nativeId===id&&stage.bindingId===captured.binding).map(stage=>this.dto(stage));
 }
 async bytes(actor,id,artifactId){
  if(typeof artifactId!=='string'||!/^[a-f0-9]{64}$/.test(artifactId))throw fail(404,'Staged export not found');
  const principal=await this.approval.principal(actor);let stage;
  await this.store.transact(this.keys(id,artifactId),values=>{const {review}=this.checked(values,principal,id);stage=copy(values[4]);if(!stage||stage.nativeId!==id)throw fail(404,'Staged export not found');if(stage.bindingId!==this.binding(id,review))throw fail(409,'Staged PNG belongs to a previous layout review');return values;});
  const bytes=stage.reference.artifact?await this.store.downloadArtifact(this.scope,stage.reference.artifact):Buffer.from((await this.store.get(stage.reference.key))?.base64||'','base64');
  if(bytes.length!==stage.size||digest(bytes)!==stage.sha256)throw fail(422,'Private export bytes failed integrity verification');
  const currentPrincipal=await this.approval.principal(actor);
  await this.store.transact(this.keys(id,artifactId),values=>{
   const {review}=this.checked(values,currentPrincipal,id);
   if(stage.bindingId!==this.binding(id,review))throw fail(409,'Review changed during export retrieval');
   if(digest(values[4])!==digest(stage))throw fail(409,'Export staging changed during retrieval');
   return values;
  });
  return {stage,bytes};
 }
 async signoff(actor,id,artifactId,input){
  exact(input,['sha256','reviewed']);if(input.reviewed!==true)throw fail(400,'Review the exact staged PNG before signing off');
  const {stage}=await this.bytes(actor,id,artifactId),principal=await this.approval.principal(actor);let result;
  await this.store.transact(this.keys(id,artifactId),values=>{
   const {identity,native,review}=this.checked(values,principal,id),current=values[4];
   if(!this.approval.canApprove(identity,principal.actor))throw fail(403,'Approval authority required for export sign-off');
   if(!current||current.sha256!==input.sha256||digest(current)!==digest(stage)||current.bindingId!==this.binding(id,review))throw fail(409,'Staged export changed; review it again');
   if(current.signoff){result=copy(current.signoff.envelope);return values;}
   const at=this.now();let ring=values[5];
   if(!ring||at-ring.rotatedAt>=86400000)ring={rotatedAt:at,keys:[newCompletionKey(),...(ring?.keys||[]).slice(0,1)]};
   const envelope=signCompletion(ring.keys[0],{bindingId:current.bindingId,organizationId:this.scope.organizationId,brandId:this.scope.brandId,nativeId:id,artifactId,storyId:native.storyId,generationId:native.origin.generationId,expectedReviewRevision:review.revision,expectedNativeRevision:native.revision,sha256:current.sha256,size:current.size,mime:current.mime,requestDigest:current.fingerprint},{now:at});
   current.signoff={actorId:principal.actor.id,at,envelope};values[5]=ring;result=copy(envelope);return values;
  });return result;
 }
 async complete(actor,id,envelope){
  if(!this.enabled)throw fail(503,'Editor export completion is disabled');
  // Resolve only server-selected keys after validating the envelope's bounded identifiers.
  if(!envelope||typeof envelope.artifactId!=='string'||!/^[a-f0-9]{64}$/.test(envelope.artifactId))throw fail(400,'Invalid export artifact');
  const {stage}=await this.bytes(actor,id,envelope.artifactId),principal=await this.approval.principal(actor);let result;
  await this.store.transact(this.keys(id,envelope.artifactId),values=>{
   const {review}=this.checked(values,principal,id),current=values[4],ledger=values[6]||{events:[]};
   if(!current||digest(current)!==digest(stage))throw fail(409,'Export staging changed');
   const previous=ledger.events.find(event=>event.eventId===envelope.eventId);
   if(previous){if(previous.envelopeDigest!==digest(envelope))throw fail(409,'Export event replay changed');result=copy(previous.receipt);return values;}
   verifyCompletion(values[5]?.keys||[],envelope,{now:this.now()});
   if(envelope.organizationId!==this.scope.organizationId||envelope.brandId!==this.scope.brandId||envelope.nativeId!==id||envelope.bindingId!==this.binding(id,review)||!current.signoff||digest(current.signoff.envelope)!==digest(envelope))throw fail(409,'Export completion does not match current reviewed bytes');
   if(ledger.events.length>=256||ledger.events.some(event=>event.nonce===envelope.nonce))throw fail(409,'Export nonce reused or receipt journal full');
   result={eventId:envelope.eventId,artifactId:envelope.artifactId,nativeId:id,reviewRevision:review.revision,sha256:stage.sha256,size:stage.size,mime:stage.mime,pageIndex:stage.pageIndex,exportedAt:this.now(),signedOffBy:current.signoff.actorId,completedBy:principal.actor.id};
   ledger.events.push({eventId:envelope.eventId,nonce:envelope.nonce,envelopeDigest:digest(envelope),receipt:copy(result)});values[6]=ledger;
   review.exports=[...(review.exports||[]),copy(result)];return values;
  });return result;
 }
}
