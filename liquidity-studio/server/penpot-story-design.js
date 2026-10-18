import {randomUUID} from 'node:crypto';
import {fail} from './auth.js';
import {compileMultimodalBundle,brandRevision} from './multimodal-contract.js';
import {compilePenpotNative} from './penpot-native.js';
import {storyContentDigest} from './story-content-revision.js';
import {assertRestoreAvailable} from './restore-gate.js';
import {penpotActionDigest as hash} from './penpot-action-ledger.js';
const formats=new Set(['infographic','carousel','story','reel']);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(x);
function query(input){if(!input||Object.keys(input).some(k=>!['storyId','format'].includes(k))||typeof input.storyId!=='string'||!input.storyId.length||input.storyId.length>200||!formats.has(input.format))throw fail(400,'Select a saved story and format');}
function command(input){query({storyId:input?.storyId,format:input?.format});if(!input||Object.keys(input).sort().join(',')!=='expectedRevision,format,generationId,idempotencyKey,storyId'||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<1||typeof input.generationId!=='string'||!input.generationId.length||input.generationId.length>200||!uuid(input.idempotencyKey))throw fail(400,'Saved story revision, generation and operation key required');}
function normalized(value,depth=0){if(depth>64)throw fail(502,'Native document nesting exceeds its bound');if(Array.isArray(value))return value.map(x=>normalized(x,depth+1));if(value&&typeof value==='object'){const result=Object.create(null);for(const [key,item]of Object.entries(value)){const name=key.replace(/-([a-z])/g,(_,x)=>x.toUpperCase());if(Object.hasOwn(result,name))throw fail(502,'Native response has ambiguous fields');result[name]=normalized(item,depth+1);}return result;}return value;}
function contains(actual,expected){if(Array.isArray(expected))return Array.isArray(actual)&&actual.length===expected.length&&expected.every((x,i)=>contains(actual[i],x));if(expected&&typeof expected==='object')return actual&&typeof actual==='object'&&Object.entries(expected).every(([k,v])=>Object.hasOwn(actual,k)&&contains(actual[k],v));return actual===expected;}
/** Does not claim pixel or export proof. Refuses to replace a nonempty changed file. */
export function verifyPenpotStoryFile(file,compiled,projectId){
 if(file?.id!==compiled.fileId||file.projectId!==projectId||!Number.isSafeInteger(file.revn)||!file.data?.pagesIndex)throw fail(409,'Native file identity changed; existing design is preserved');
 const ids=file.data.pages;if(!Array.isArray(ids)||ids.length!==compiled.pages.length||compiled.pages.some((p,i)=>ids[i]!==p.id))return false;
 for(const page of compiled.pages){const objects=file.data.pagesIndex[page.id]?.objects,frame=objects?.[page.frameId];if(!frame||frame.type!=='frame'||frame.width!==page.width||frame.height!==page.height)return false;}
 for(const page of compiled.pages){const allowed=new Set(['00000000-0000-0000-0000-000000000000',...compiled.changes.filter(c=>c.type==='add-obj'&&c['page-id']===page.id).map(c=>c.id)]);if(Object.keys(file.data.pagesIndex[page.id].objects).some(id=>!allowed.has(id)))return false;}
 const components=compiled.changes.filter(c=>c.type==='add-component');if(Object.keys(file.data.components||{}).length!==components.length||components.some(c=>!contains(normalized(file.data.components[c.id]),normalized(Object.fromEntries(Object.entries(c).filter(([k])=>k!=='type'))))))return false;
 if(!contains(file.data.tokensLib?.$metadata,{activeSets:['Studio'],activeThemes:['Studio/Brand']}))return false;
 for(const {attrs:token} of compiled.changes.filter(c=>c.type==='set-token')){const native=file.data.tokensLib?.Studio?.studio?.[token.name.split('.').at(-1)];if(native?.$value!==token.value||native?.$type!=='color')return false;}
 for(const change of compiled.changes.filter(c=>c.type==='add-obj')){const actual=file.data.pagesIndex[change['page-id']]?.objects?.[change.id],expected=change.obj;if(!actual||actual.type!==expected.type)return false;const fields=Object.fromEntries(['id','type','x','y','width','height','parent-id','frame-id','fills','applied-tokens','content','svg-content','svg-attrs','plugin-data','component-id','component-file','component-root','main-instance'].filter(k=>expected[k]!==undefined).map(k=>[k,expected[k]]));if(!contains(normalized(actual),normalized(fields)))return false;}
 return true;
}
function compileStory(bundle,options){try{return compilePenpotNative(bundle,{...options,explicitOm:true});}catch(error){if(error.message==='OM_FONT_NOT_VERIFIED')throw fail(422,'This workspace needs the verified Noto Sans Devanagari font for the Om badge');if(error.message==='FONT_NOT_VERIFIED')throw fail(422,'The native workspace fonts do not match the saved Brand Kit');if(error.message==='OM_GLYPH_OUTSIDE_BADGE')throw fail(422,'Explicit Om font binding currently supports the brand badge only');throw error;}}
/** Workspace authority and RPC are constructor-only. No owner/session/project URL from HTTP. */
export class PenpotStoryDesigns{
 constructor({store,identity,scope,repo,workspaceFor,rpc,brandAccess=null,now=()=>Date.now()}){Object.assign(this,{store,identity,scope,repo,workspaceFor,rpc,brandAccess,now});this.key=`penpot-story-designs:${scope.organizationId}:${scope.brandId}`;}
 async context(actor,storyId,sessionContext){
  await this.identity.authorize(actor,this.scope.organizationId,this.scope.brandId);
  let workspace,grantSnapshot;
  if(this.brandAccess){
   ({workspace,grantSnapshot}=await this.brandAccess.require(actor,this.scope,sessionContext));
  }else{
   this.identity.requireFounder(actor);
   const currentActor=(await this.store.get('identity'))?.users?.find(x=>x.id===actor.id);
   if(currentActor?.role!=='founder')throw fail(403,'Current founder permission required');
   workspace=await this.workspaceFor(actor,this.scope);
  }
  const state=await this.repo.read();assertRestoreAvailable(state);
  const liveIdentity=await this.store.get('identity');if((!this.brandAccess&&liveIdentity?.users?.find(x=>x.id===actor.id)?.role!=='founder')||!liveIdentity.memberships?.some(x=>x.userId===actor.id&&x.organizationId===this.scope.organizationId&&x.brandIds.includes(this.scope.brandId)))throw fail(403,'Current design permission or brand membership changed');
  const story=state.backlog.find(x=>x.id===storyId);if(!story)throw fail(404,'Saved story not found');
  if(!story.campaignDraft||!story.generationId)throw fail(422,'Review and hand off the saved campaign before creating its Penpot design');
  const bundle=compileMultimodalBundle({scope:this.scope,brandProfile:state.brandProfile,story,request:{schemaVersion:1,storyId:story.id,expectedRevision:story.revision,generationId:story.generationId,expectedBrandRevision:brandRevision(state.brandProfile),requiredCapabilities:[]}});
  const authority={targetId:workspace.targetId,bindingId:workspace.bindingId,bindingEpoch:workspace.bindingEpoch,ownerPrincipal:workspace.ownerPrincipal,projectId:workspace.projectId,teamId:workspace.teamId,fonts:workspace.fonts};
  if(![workspace.ownerPrincipal,workspace.projectId,workspace.teamId].every(uuid)||!Array.isArray(workspace.fonts))throw fail(503,'Verified native workspace and fonts are unavailable');
  const identity={storyId:story.id,generationId:story.generationId,contentRevision:story.contentRevision||1,contentSha256:storyContentDigest(story),brandRevision:bundle.brandRevision,authoritySha256:hash(authority)};
  return {story,bundle,workspace,grantSnapshot,identity,designKey:hash(identity)};
 }
 dto(record,format,actor){const page=record.pages?.find(p=>p.format===format);return {id:record.id,status:record.status,storyId:record.identity.storyId,generationId:record.identity.generationId,fileId:record.fileId,nativeRevision:record.nativeRevision??null,nativeUrl:record.status==='ready'?`http://localhost:39008/#/workspace?team-id=${record.teamId}&file-id=${record.fileId}${page?'&page-id='+page.id:''}`:null,...(record.actorId===actor.id&&record.status==='pending'?{retry:{...record.input}}:{}),limitations:['Native Reel pages are static boards, not rendered video.','Source review and publication approval are separate.']};}
 async designs(actor,input,sessionContext){query(input);try{const context=await this.context(actor,input.storyId,sessionContext);compileStory(context.bundle,{fileId:'00000000-0000-4000-8000-000000000001',fonts:context.workspace.fonts});const state=await this.store.get(this.key);let record=state?.designs.find(x=>x.designKey===context.designKey);if(record?.status==='ready'){const file=await this.rpc(context.workspace,'get-file',{id:record.fileId});if(file.id!==record.fileId||file.projectId!==context.workspace.projectId||!Number.isSafeInteger(file.revn)||file.revn<0)throw fail(403,'Current native design access is unavailable');record={...record,nativeRevision:file.revn};}return {available:true,reason:null,design:record?this.dto(record,input.format,actor):null};}catch(error){if([409,422,503].includes(error.status))return {available:false,reason:error.message,design:null};throw error;}}
 async createDesign(actor,input,sessionContext){
  command(input);const requestHash=hash({actorId:actor.id,input});let context=await this.context(actor,input.storyId,sessionContext),record;
  await this.store.update(this.key,old=>{const state=old||{designs:[],intents:[]};const prior=state.intents.find(x=>x.key===input.idempotencyKey);if(prior){if(prior.actorId!==actor.id||prior.requestHash!==requestHash)throw fail(409,'Operation key belongs to another design request');record=state.designs.find(x=>x.id===prior.designId);if(!record||record.designKey!==context.designKey)throw fail(409,'Source or workspace changed; original native design is preserved');return state;}
   if(input.expectedRevision!==context.story.revision||input.generationId!==context.story.generationId)throw fail(409,'Saved story changed; refresh before creating a design');
   if(state.intents.length>=128)throw fail(429,'Native design operation capacity reached');
   record=state.designs.find(x=>x.designKey===context.designKey);
   if(record?.status==='pending'&&record.actorId!==actor.id)throw fail(409,'Another operator has a pending native design; preserve its operation');
   if(!record){if(state.designs.length>=64)throw fail(429,'Native design capacity reached');record={id:randomUUID(),fileId:randomUUID(),actorId:actor.id,input:structuredClone(input),identity:context.identity,designKey:context.designKey,teamId:context.workspace.teamId,status:'pending',createdAt:this.now()};state.designs.push(record);}
   state.intents.push({key:input.idempotencyKey,actorId:actor.id,requestHash,designId:record.id});return state;
  });
  // Every remote side effect and read is preceded by fresh current scope/source/native authority.
  const revalidate=async()=>{const current=await this.context(actor,input.storyId,sessionContext);if(current.designKey!==record.designKey)throw fail(409,'Source or native authority changed; existing design is preserved');context=current;};
  const call=async(name,body)=>{await revalidate();return this.rpc(context.workspace,name,body);};
  const compiled=compileStory(context.bundle,{fileId:record.fileId,fonts:context.workspace.fonts});
  if(record.status==='ready'){const current=await call('get-file',{id:record.fileId});if(current.id!==record.fileId||current.projectId!==context.workspace.projectId||!Number.isSafeInteger(current.revn)||current.revn<0)throw fail(403,'Current native design access is unavailable');return this.dto({...record,nativeRevision:current.revn},input.format,actor);}
  let file;try{file=await call('get-file',{id:record.fileId});}catch(error){if(error.status!==404)throw error;await call('create-file',{id:record.fileId,name:`Studio · ${context.story.title}`.slice(0,200),'project-id':context.workspace.projectId});file=await call('get-file',{id:record.fileId});}
  if(file.id!==record.fileId||file.projectId!==context.workspace.projectId||!Number.isSafeInteger(file.revn)||!Number.isSafeInteger(file.vern))throw fail(409,'Native workspace changed; no existing design is replaced');
  if(!verifyPenpotStoryFile(file,compiled,context.workspace.projectId)){
   if(file.revn!==0)throw fail(409,'Native file has changed; preserve it and recover the original operation');
   const changes=[...compiled.changes,...(file.data?.pages||[]).map(id=>({type:'del-page',id}))];
   await call('update-file',{id:record.fileId,'session-id':record.id,revn:file.revn,vern:file.vern,changes});file=await call('get-file',{id:record.fileId});
   if(!verifyPenpotStoryFile(file,compiled,context.workspace.projectId))throw fail(502,'Native save readback did not match the compiled design');
  }
  await revalidate();
  const guardKeys=this.brandAccess?this.brandAccess.guardKeys(context.grantSnapshot):[];
  await this.store.transact([this.key,this.repo.key,'identity',`editor-security:${this.scope.organizationId}:${this.scope.brandId}`,...guardKeys],values=>{
   const [state,scoped,identity,security,...guardValues]=values;
   if(this.brandAccess)this.brandAccess.assertCurrent({identity,brandAccess:guardValues[0],pair:guardValues[1],profileOwner:guardValues[2],session:guardValues[3]},context.grantSnapshot);
   assertRestoreAvailable(scoped);const currentStory=scoped?.backlog?.find(x=>x.id===input.storyId),currentActor=identity?.users?.find(x=>x.id===actor.id),binding=security?.bindings?.find(x=>x.id===context.workspace.bindingId);
   if((!this.brandAccess&&currentActor?.role!=='founder')||!identity.memberships?.some(x=>x.userId===actor.id&&x.organizationId===this.scope.organizationId&&x.brandIds.includes(this.scope.brandId))||!binding||binding.revokedAt||binding.epoch!==context.workspace.bindingEpoch||binding.ownerPrincipal!==context.workspace.ownerPrincipal||binding.nativeProjectId!==context.workspace.projectId)throw fail(403,'Current native registration or membership changed');
   if(!currentStory||currentStory.generationId!==record.identity.generationId||(currentStory.contentRevision||1)!==record.identity.contentRevision||storyContentDigest(currentStory)!==record.identity.contentSha256||brandRevision(scoped.brandProfile)!==record.identity.brandRevision)throw fail(409,'Source changed before native registration; original file is preserved');
   const current=state.designs.find(x=>x.id===record.id);if(!current||current.designKey!==context.designKey)throw fail(409,'Native operation changed');current.status='ready';current.nativeRevision=file.revn;current.pages=compiled.pages.map(({id,format})=>({id,format}));current.completedAt=this.now();record=structuredClone(current);return [state,scoped,identity,security,...guardValues];
  });
  return this.dto(record,input.format,actor);
 }
}

/** Exact pinned local RPC surface, with private operator owner cookies only. */
export function createPenpotStoryRpc({sessions,transportMode='loopback',grantKey=null,fetchImpl=fetch}){
 const origin=({loopback:'http://localhost:39008','docker-host':'http://host.docker.internal:39008'})[transportMode];if(!origin)throw Error('Fixed local native transport required');
 if(grantKey!==null&&(typeof grantKey!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(grantKey)))throw Error('Private native grant key required');
 return async(workspace,operation,body)=>{
  if(!['get-profile','get-project','get-team','get-team-members','get-font-variants','get-file','create-file','update-file'].includes(operation))throw fail(400,'Unsupported native design operation');
  const session=sessions.get(workspace.ownerPrincipal);if(!session?.cookie)throw fail(403,'Registered native owner session unavailable');
  const payload=JSON.stringify(body);if(Buffer.byteLength(payload)>2*1024*1024)throw fail(413,'Native design exceeds the bounded RPC request');
  const actingHeaders=grantKey?{'X-Studio-Native-Grant-Key':grantKey,...(uuid(workspace.actingNativeProfileId)?{'X-Studio-Acting-Profile':workspace.actingNativeProfileId}:{})}:{};
  const response=await fetchImpl(`${origin}/api/rpc/command/${operation}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',Origin:'http://localhost:39008',Cookie:session.cookie,...actingHeaders},body:payload,redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok){await response.body?.cancel().catch(()=>{});throw fail(response.status===404?404:[401,403].includes(response.status)?403:response.status===409?409:502,'Native design request did not complete; preserve the operation key');}
  let size=0;const chunks=[];for await(const chunk of response.body){size+=chunk.length;if(size>2*1024*1024){await response.body.cancel?.().catch(()=>{});throw fail(502,'Native design readback exceeds the bounded response');}chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail(502,'Native design response was not valid JSON');}
 };
}
