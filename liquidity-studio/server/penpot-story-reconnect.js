import {createHash,randomUUID} from 'node:crypto';
import {fail} from './auth.js';
import {assertRestoreAvailable} from './restore-gate.js';
import {storyContentDigest} from './story-content-revision.js';
import {brandRevision} from './multimodal-contract.js';
import {penpotActionDigest as digest} from './penpot-action-ledger.js';
const UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
const formats=['infographic','carousel','story','reel'];
const sorted=x=>Array.isArray(x)?x.map(sorted):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sorted(x[k])])):x;
/** Only rendered format copy: no source/destination IDs, provenance or authority. */
export function portableCampaignFingerprint(campaign){
 if(!campaign||formats.some(k=>!campaign[k]))throw fail(422,'Saved four-format copy is required');
 return {version:1,sha256:createHash('sha256').update(JSON.stringify(sorted(Object.fromEntries(formats.map(k=>[k,campaign[k]]))))).digest('hex')};
}
function fileFromUrl(value,origin){let url;try{url=new URL(value);}catch{throw fail(400,'Paste the imported Penpot workspace link');}
 if(url.origin!==origin||url.username||url.password||url.search||!url.hash.startsWith('#/workspace?'))throw fail(400,'Use this installation’s Penpot workspace link');
 const params=new URLSearchParams(url.hash.slice('#/workspace?'.length)),id=params.get('file-id');if(!UUID.test(id||''))throw fail(400,'Imported native file ID unavailable');return id;
}
export class PenpotStoryReconnect{
 constructor(designs){this.designs=designs;}
 async inspect(actor,input,session){
 if(!input||typeof input.storyId!=='string'||input.storyId.length>200||!formats.includes(input.format)||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<1||typeof input.generationId!=='string'||input.generationId.length>200||typeof input.nativeUrl!=='string'||input.nativeUrl.length>2048||JSON.stringify(input.manifest||{}).length>32768)throw fail(400,'Saved campaign and bounded recovery manifest required');
 const d=this.designs,c=await d.context(actor,input.storyId,session);
 if(c.story.revision!==input.expectedRevision||c.story.generationId!==input.generationId)throw fail(409,'Saved copy changed; reload before reconnecting');
 const m=input.manifest;if(!m||m.kind!=='studio-registered-penpot-recovery'||m.schemaVersion!==2||m.editorVersion!=='2.18.3'||m.portableContent?.version!==1||m.portableContent.sha256!==portableCampaignFingerprint(c.bundle.sourceCampaign).sha256||!/^[a-f0-9]{64}$/.test(m.archiveSha256||''))throw fail(422,'Use a version 2 Penpot kit matching this saved four-format copy; older kits are not matched automatically');
 const fileId=fileFromUrl(input.nativeUrl,d.nativeOrigin),file=await d.rpc(c.workspace,'get-file',{id:fileId});
 if(file.id!==fileId||file.projectId!==c.workspace.projectId||!Number.isSafeInteger(file.revn)||!Array.isArray(file.data?.pages)||!file.data.pages.length||file.data.pages.length>32)throw fail(409,'Imported file must belong to the currently registered project');
 const allowedFonts=new Set(c.workspace.fonts.map(f=>f.fontId));let count=0;const pending=[file.data];
 while(pending.length){const value=pending.pop();if(!value||typeof value!=='object')continue;if(++count>100000)throw fail(413,'Imported design is too complex');for(const [key,child]of Object.entries(value)){if(['fontId','font-id'].includes(key)&&typeof child==='string'&&!allowedFonts.has(child))throw fail(422,'Restore and verify the imported file fonts in this workspace first');if(child&&typeof child==='object')pending.push(child);}}
 const pages=file.data.pages.map(id=>{const page=file.data.pagesIndex?.[id];if(!UUID.test(id)||!page)throw fail(422,'Imported page unavailable');return {id,name:String(page.name||'Untitled page').slice(0,160)};});
 return {context:c,file,pages,fileSha256:digest(file.data),source:{scope:m.scope,storyId:m.storyId,fileId:m.fileId,archiveSha256:m.archiveSha256,portableContent:m.portableContent}};
 }
 async preview(actor,input,session){const x=await this.inspect(actor,input,session);return {fileId:x.file.id,nativeRevision:x.file.revn,fileSha256:x.fileSha256,pages:x.pages,destination:{teamId:x.context.workspace.teamId,projectId:x.context.workspace.projectId,profileId:x.context.workspace.actingNativeProfileId||x.context.workspace.ownerPrincipal},source:x.source};}
 async reconnect(actor,input,session){
 if(!UUID.test(input.idempotencyKey||'')||!Array.isArray(input.pages)||input.pages.length!==4||formats.some(f=>input.pages.filter(p=>p.format===f).length!==1))throw fail(400,'Choose a page for each format and retain the operation key');
 const d=this.designs,x=await this.inspect(actor,input,session),c=x.context;
 if(x.file.revn!==input.expectedNativeRevision||x.fileSha256!==input.fileSha256||input.pages.some(p=>!x.pages.some(page=>page.id===p.id)))throw fail(409,'Imported design changed; inspect it again');
 const requestHash=digest({actorId:actor.id,input});let record;
 const guardKeys=d.brandAccess?d.brandAccess.guardKeys(c.grantSnapshot):[];
 await d.store.transact([d.key,d.repo.key,'identity',`editor-security:${d.scope.organizationId}:${d.scope.brandId}`,...guardKeys],values=>{
 const [old,scoped,identity,security,...guards]=values,state=old||{designs:[],intents:[]};
 if(d.brandAccess)d.brandAccess.assertCurrent({identity,brandAccess:guards[0],pair:guards[1],profileOwner:guards[2],session:guards[3]},c.grantSnapshot);
 assertRestoreAvailable(scoped);const story=scoped?.backlog?.find(s=>s.id===input.storyId),binding=security?.bindings?.find(b=>b.id===c.workspace.bindingId);
 if((!d.brandAccess&&identity?.users?.find(u=>u.id===actor.id)?.role!=='founder')||!identity?.memberships?.some(m=>m.userId===actor.id&&m.organizationId===d.scope.organizationId&&m.brandIds.includes(d.scope.brandId))||!binding||binding.revokedAt||binding.epoch!==c.workspace.bindingEpoch||binding.nativeProjectId!==c.workspace.projectId||binding.ownerPrincipal!==c.workspace.ownerPrincipal)throw fail(403,'Current workspace authority changed');
 if(!story||story.revision!==input.expectedRevision||story.generationId!==input.generationId||storyContentDigest(story)!==c.identity.contentSha256||brandRevision(scoped.brandProfile)!==c.identity.brandRevision)throw fail(409,'Saved copy changed before reconnection');
 const prior=state.intents.find(i=>i.key===input.idempotencyKey);if(prior){if(prior.actorId!==actor.id||prior.requestHash!==requestHash)throw fail(409,'Operation key belongs to another reconnection');record=state.designs.find(r=>r.id===prior.designId);return [state,scoped,identity,security,...guards];}
 if(state.intents.length>=128||state.designs.length>=64)throw fail(429,'Saved design capacity reached');
 record={id:randomUUID(),fileId:x.file.id,actorId:actor.id,identity:c.identity,designKey:c.designKey,teamId:c.workspace.teamId,status:'ready',nativeRevision:x.file.revn,pages:input.pages.map(({id,format})=>({id,format})),createdAt:d.now(),completedAt:d.now(),recovery:{source:x.source,registeredBy:actor.id,registeredAt:d.now(),importedFileSha256:x.fileSha256,authorityRestored:false}};
 state.designs.push(record);state.intents.push({key:input.idempotencyKey,actorId:actor.id,requestHash,designId:record.id});return [state,scoped,identity,security,...guards];
 });return d.dto(record,input.format,actor,c.identity.brandRevision);
 }
}
