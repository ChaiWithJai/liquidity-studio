// Supplied media only. No source download, provider, transcoder or publishing.
import {createHash} from 'node:crypto';
import {fail} from './auth.js';
import {inspectPcmWav} from './native-audio.js';
const clone=x=>structuredClone(x),sha=x=>createHash('sha256').update(x).digest('hex'),hash=x=>sha(JSON.stringify(x));
const UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const SHA=/^[a-f0-9]{64}$/;
const exact=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k)))throw fail(400,'Unsupported clip fields');};
const text=(s,label,max)=>{if(typeof s!=='string'||!s.trim()||s.length>max)throw fail(422,`Provide ${label}`);return s.trim();};
const stable=value=>{const h=hash(value);return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;};
export const CLIP_LIMITS=Object.freeze({chunkBytes:262144,videoBytes:20*1024*1024,audioBytes:6*1024*1024,durationSeconds:30,maxAssets:24,maxProposals:32,maxArtifacts:24});
export const clipKey=org=>`defiant-clips:${org}`;
const empty=()=>({revision:0,assets:[],uploads:[],proposals:[],artifacts:[],receipts:[]});
export class DefiantClips {
 constructor(strategy){this.strategy=strategy;this.store=strategy.store;this.key=clipKey(strategy.organizationId);this.scope={kind:'strategy',organizationId:strategy.organizationId};this.base=`/api/studio/strategy/${strategy.organizationId}/inbox/clips`;}
 async authorize(actor){await this.strategy.raw(actor);}
 dto(asset){const {artifactRef,chunkKeys,...dto}=clone(asset);return {...dto,url:`${this.base}/assets/${asset.id}`};}
 async read(actor,sourceId){await this.authorize(actor);const state=await this.store.get(this.key)||empty();await this.authorize(actor);return {clipRevision:state.revision,limits:CLIP_LIMITS,assets:state.assets.filter(a=>!sourceId||a.sourceId===sourceId).map(a=>this.dto(a)),proposals:clone(state.proposals.filter(p=>!sourceId||p.sourceId===sourceId)),artifacts:clone(state.artifacts.filter(a=>!sourceId||a.sourceId===sourceId))};}
 async change(actor,input,operation,fn,extraKeys=[]){
  if(!UUID.test(input?.idempotencyKey||''))throw fail(400,'Retain a clip request key');await this.authorize(actor);const requestHash=hash({operation,input});let result;
  await this.store.transact(['identity',this.strategy.key,this.key,...extraKeys],([identity,strategy,state,...extra])=>{
   this.strategy.assertCurrent(identity,strategy,actor);state=state||empty();const prior=state.receipts.find(r=>r.id===input.idempotencyKey);
   if(prior){if(prior.actorId!==actor.id||prior.requestHash!==requestHash)throw fail(409,'Clip request key belongs to different content');result=clone(prior.result);return [identity,strategy,state,...extra];}
   if(input.expectedRevision!==undefined&&input.expectedRevision!==state.revision)throw fail(409,'Clip workspace changed; retain your working selection');
   if(state.receipts.length>=128)throw fail(429,'Clip history capacity reached');const value=fn(state,strategy,extra);state.revision++;result={clipRevision:state.revision,...value};state.receipts.push({id:input.idempotencyKey,actorId:actor.id,requestHash,result:clone(result)});if(Buffer.byteLength(JSON.stringify(state))>2*1024*1024)throw fail(413,'Clip metadata capacity reached');return [identity,strategy,state,...extra];
  });return result;
 }
 async begin(actor,input){
  exact(input,['idempotencyKey','kind','name','contentType','bytes','sha256','rightsDeclaration','sourceId','recordingId','proposalId','proposalRevision','inputHashes']);
  if(!['source','audio','render'].includes(input.kind)||!SHA.test(input.sha256||'')||!Number.isSafeInteger(input.bytes)||input.bytes<1||input.bytes>(input.kind==='audio'?CLIP_LIMITS.audioBytes:CLIP_LIMITS.videoBytes)||input.contentType!==(input.kind==='audio'?'audio/wav':'video/mp4'))throw fail(422,'Choose MP4 up to20MiB or PCM WAV up to6MiB');
  const name=text(input.name,'a media name',160),rightsDeclaration=text(input.rightsDeclaration,'the supplied media permission declaration',1000);
  return this.change(actor,input,'upload', (state,strategy)=>{
   if(!strategy.inbox?.sources.some(s=>s.id===input.sourceId))throw fail(404,'Select a saved source');if(input.recordingId&&!strategy.inbox?.recordings.some(r=>r.id===input.recordingId))throw fail(422,'Choose a saved recording');
   if(state.uploads.filter(u=>u.status==='pending').length>=8||state.assets.length>=CLIP_LIMITS.maxAssets)throw fail(429,'Media capacity reached');
   if(input.kind==='render')this.renderInputs(state,input);
   const id=stable({org:this.strategy.organizationId,actor:actor.id,key:input.idempotencyKey}),chunkCount=Math.ceil(input.bytes/CLIP_LIMITS.chunkBytes);
   state.uploads.push({...clone(input),id,name,rightsDeclaration,createdBy:actor.id,createdAt:this.strategy.now(),status:'pending'});
   return {uploadId:id,chunkBytes:CLIP_LIMITS.chunkBytes,chunkCount};
  });
 }
 renderInputs(state,input){
  const p=state.proposals.find(p=>p.id===input.proposalId);if(!p||p.revision!==input.proposalRevision||p.sourceId!==input.sourceId||p.recordingId!==input.recordingId)throw fail(409,'Clip selection changed; retain this rendered file');
  const source=state.assets.find(a=>a.id===p.sourceAssetId),audio=p.audioAssetId?state.assets.find(a=>a.id===p.audioAssetId):null;
  exact(input.inputHashes,['source','audio']);
  if(!source||source.kind!=='source'||(p.audioAssetId&&(!audio||audio.kind!=='audio'))||input.inputHashes.source!==source.sha256||input.inputHashes.audio!==(audio?.sha256||null))throw fail(409,'Rendered input hashes do not match the saved selection');return {p,source,audio};
 }
 upload(state,id,actor){const u=state?.uploads.find(u=>u.id===id);if(!u||u.createdBy!==actor.id)throw fail(404,'Media upload unavailable');return u;}
 chunkKey(id,index){return `${this.key}:upload:${id}:chunk:${index}`;}
 async chunk(actor,id,index,bytes){
  await this.authorize(actor);if(!UUID.test(id)||!Number.isSafeInteger(index)||index<0||!Buffer.isBuffer(bytes)||!bytes.length||bytes.length>CLIP_LIMITS.chunkBytes)throw fail(400,'Invalid media chunk');
  const key=this.chunkKey(id,index),digest=sha(bytes);let result;
  await this.store.transact(['identity',this.strategy.key,this.key,key],([identity,strategy,state,chunk])=>{
   this.strategy.assertCurrent(identity,strategy,actor);const u=this.upload(state,id,actor),count=Math.ceil(u.bytes/CLIP_LIMITS.chunkBytes),expected=index===count-1?u.bytes-index*CLIP_LIMITS.chunkBytes:CLIP_LIMITS.chunkBytes;
   if(index>=count||bytes.length!==expected||u.status!=='pending')throw fail(409,'Media chunk does not match this pending upload');if(chunk&&chunk.sha256!==digest)throw fail(409,'Media chunk differs; retain original upload');
   result={uploadId:id,index,sha256:digest,received:true};return [identity,strategy,state,chunk||{kind:'defiant-clip-bytes',sha256:digest,base64:bytes.toString('base64')}];
  });return result;
 }
 async complete(actor,id){
  await this.authorize(actor);let state=await this.store.get(this.key),u=this.upload(state,id,actor);
  if(u.status==='complete')return {clipRevision:state.revision,asset:this.dto(state.assets.find(a=>a.id===id)),...(state.artifacts.some(a=>a.id===id)?{artifact:clone(state.artifacts.find(a=>a.id===id))}:{})};
  const chunkKeys=[],parts=[];
  for(let index=0;index<Math.ceil(u.bytes/CLIP_LIMITS.chunkBytes);index++){const key=this.chunkKey(id,index),part=await this.store.get(key),bytes=Buffer.from(part?.base64||'','base64');if(part?.kind!=='defiant-clip-bytes'||sha(bytes)!==part.sha256)throw fail(409,'Media upload is incomplete; retain its request');chunkKeys.push(key);parts.push(bytes);}
  const bytes=Buffer.concat(parts);if(bytes.length!==u.bytes||sha(bytes)!==u.sha256)throw fail(422,'Media bytes do not match the declared size and hash');
  if(u.kind==='audio')inspectPcmWav(bytes);else if(bytes.length<16||bytes.toString('ascii',4,8)!=='ftyp')throw fail(422,'Choose an actual MP4 file');
  let artifactRef;if(this.store.uploadArtifact)artifactRef=await this.store.uploadArtifact(this.scope,id,bytes,u.contentType);
  let result,retained=false;
  try{
   await this.store.transact(['identity',this.strategy.key,this.key],([identity,strategy,current])=>{
    this.strategy.assertCurrent(identity,strategy,actor);if(!strategy.inbox?.sources.some(s=>s.id===u.sourceId))throw fail(409,'Saved source changed');const live=this.upload(current,id,actor);if(hash({...live,status:'pending'})!==hash({...u,status:'pending'}))throw fail(409,'Media intent changed');
    if(live.status==='complete'){const saved=current.assets.find(a=>a.id===id);retained=!artifactRef||saved.artifactRef?.object===artifactRef.object;result={clipRevision:current.revision,asset:this.dto(saved),...(current.artifacts.some(a=>a.id===id)?{artifact:clone(current.artifacts.find(a=>a.id===id))}:{})};return [identity,strategy,current];}
    const asset={id,kind:u.kind,name:u.name,sourceId:u.sourceId,recordingId:u.recordingId||null,contentType:u.contentType,bytes:u.bytes,sha256:u.sha256,rightsDeclaration:u.rightsDeclaration,createdBy:actor.id,createdAt:this.strategy.now(),...(artifactRef?{artifactRef}:{chunkKeys})};
    current.assets.push(asset);let rendered;
    if(u.kind==='render'){const {p,source,audio}=this.renderInputs(current,u);if(current.artifacts.length>=CLIP_LIMITS.maxArtifacts)throw fail(429,'Rendered clip capacity reached');rendered={id,assetId:id,url:`${this.base}/assets/${id}`,sha256:u.sha256,bytes:u.bytes,contentType:u.contentType,sourceId:u.sourceId,recordingId:u.recordingId,proposalId:p.id,proposalRevision:p.revision,proposal:clone(p),inputHashes:clone(u.inputHashes),inputAssets:[this.dto(source),...(audio?[this.dto(audio)]:[])],createdBy:actor.id,createdAt:asset.createdAt};current.artifacts.push(rendered);}
    live.status='complete';current.revision++;retained=true;result={clipRevision:current.revision,asset:this.dto(asset),...(rendered?{artifact:clone(rendered)}:{})};return [identity,strategy,current];
   });
  }finally{if(!retained&&artifactRef){const current=await this.store.get(this.key);if(!current?.assets.some(a=>a.artifactRef?.object===artifactRef.object))await this.store.deleteArtifact?.(this.scope,artifactRef);}}
  if(artifactRef)for(const key of chunkKeys)await this.store.delete(key);
  return result;
 }
 async propose(actor,input){
  exact(input,['idempotencyKey','expectedRevision','proposal']);const p=input.proposal;exact(p,['id','expectedProposalRevision','sourceId','recordingId','sourceAssetId','audioAssetId','startSeconds','endSeconds','cropX','cropY','caption','videoGain','audioGain']);
  if(![p.startSeconds,p.endSeconds,p.cropX,p.cropY,p.videoGain,p.audioGain].every(Number.isFinite)||p.startSeconds<0||p.endSeconds<=p.startSeconds||p.endSeconds-p.startSeconds>30||p.endSeconds>3600||p.cropX<0||p.cropX>1||p.cropY<0||p.cropY>1||p.videoGain<0||p.videoGain>2||p.audioGain<0||p.audioGain>2||typeof p.caption!=='string'||p.caption.length>300)throw fail(422,'Choose a segment up to30seconds, crop and audio levels');
  return this.change(actor,input,'proposal',(state,strategy)=>{
   const source=state.assets.find(a=>a.id===p.sourceAssetId),audio=p.audioAssetId?state.assets.find(a=>a.id===p.audioAssetId):null;if(!source||source.kind!=='source'||source.sourceId!==p.sourceId||p.audioAssetId&&(!audio||audio.kind!=='audio'||audio.sourceId!==p.sourceId)||!strategy.inbox.recordings.some(r=>r.id===p.recordingId))throw fail(422,'Choose the saved source file and catalog recording');
   const old=p.id?state.proposals.find(a=>a.id===p.id):null;if(p.id&&(!old||old.revision!==p.expectedProposalRevision))throw fail(409,'Clip selection changed; keep your working settings');if(!old&&state.proposals.length>=32)throw fail(429,'Clip selection capacity reached');const {expectedProposalRevision,...fields}=clone(p),proposal={...fields,id:old?.id||stable({org:this.strategy.organizationId,actor:actor.id,key:input.idempotencyKey}),revision:(old?.revision||0)+1,createdBy:old?.createdBy||actor.id,createdAt:old?.createdAt||this.strategy.now(),updatedBy:actor.id,updatedAt:this.strategy.now()};state.proposals=state.proposals.filter(p=>p.id!==proposal.id);state.proposals.push(proposal);return {proposal:clone(proposal)};
  });
 }
 async asset(actor,id){await this.authorize(actor);const state=await this.store.get(this.key),asset=state?.assets.find(a=>a.id===id);if(!asset)throw fail(404,'Media asset unavailable');let bytes;
  if(asset.artifactRef)bytes=await this.store.downloadArtifact(this.scope,asset.artifactRef);else {const parts=[];for(const key of asset.chunkKeys){if(!key.startsWith(this.key+':upload:'))throw fail(500,'Media ownership mismatch');const part=await this.store.get(key),buffer=Buffer.from(part?.base64||'','base64');if(part?.kind!=='defiant-clip-bytes'||sha(buffer)!==part.sha256)throw fail(500,'Media integrity mismatch');parts.push(buffer);}bytes=Buffer.concat(parts);}
  if(bytes.length!==asset.bytes||sha(bytes)!==asset.sha256)throw fail(500,'Media integrity mismatch');await this.authorize(actor);return {asset:this.dto(asset),bytes};
 }
}
