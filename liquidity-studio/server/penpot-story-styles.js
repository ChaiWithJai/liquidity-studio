import {randomUUID} from 'node:crypto';
import {fail} from './auth.js';
import {penpotColorIdentity} from './penpot-native.js';
import {PenpotTokenRefreshTransport} from './penpot-token-refresh.js';
import {createPenpotLocalSnapshot} from './penpot-local-snapshot.js';
import {penpotActionDigest as hash} from './penpot-action-ledger.js';
import {assertRestoreAvailable} from './restore-gate.js';
import {brandRevision} from './multimodal-contract.js';
import {storyContentDigest} from './story-content-revision.js';
const clone=x=>structuredClone(x);
const fields=['storyId','format','expectedRevision','generationId','expectedBrandRevision','expectedNativeRevision','idempotencyKey'];
const stable=identity=>{const {brandRevision,...rest}=identity;return rest;};
/** Same-file color refresh: current editor propagation is exclusively the existing plugin action. */
export class PenpotStoryStyles {
 constructor({designs,sessions,grantKey=null,fetchImpl=fetch,now=Date.now}){
  Object.assign(this,{designs,sessions,grantKey,fetchImpl,now});this.capabilities=new Map();this.preparing=new Map();
  this.transport=new PenpotTokenRefreshTransport({now,
   authorizeActor:actor=>designs.identity.authorize(actor,designs.scope.organizationId,designs.scope.brandId),
   resolveContext:async input=>{const current=await this.resolve(input.actor,input.styleAction,input.sessionContext);return {bundle:current.context.bundle,manifest:current.manifest};},
   nativeSnapshot:(input,options)=>this.snapshot(input,options),
   onIssued:async({input,receipt,context})=>{await this.update(input.styleAction.id,row=>{if(row.manifestHash!==hash(context.manifest))throw fail(409,'Saved style action changed');row.expiresAt=receipt.expiresAt;});},
   onVerified:async({input,nativeRevision})=>this.commit(input.actor,input.styleAction,input.sessionContext,nativeRevision,'acknowledgement'),
  });
 }
 async update(id,change){await this.designs.store.update(this.designs.key,state=>{const row=state.styleActions?.find(a=>a.id===id);if(!row)throw fail(404,'Saved style action unavailable');change(row);return state;});}
 async resolve(actor,action,sessionContext){
  const context=await this.designs.context(actor,action.input.storyId,sessionContext),state=await this.designs.store.get(this.designs.key),record=state?.designs.find(d=>d.id===action.designId&&d.status==='ready');
  if(!record||hash(stable(record.identity))!==context.designKey||context.story.revision!==action.input.expectedRevision||context.story.generationId!==action.input.generationId||context.identity.brandRevision!==action.input.expectedBrandRevision)throw fail(409,'Saved source or Brand Kit changed; the existing design is preserved');
  let mapping=action.colorMapping||record.colorMapping;
  if(!mapping){
   // Older ready records predate saved color mappings. Read their existing bindings,
   // never reconstruct their typography from today's Brand Kit.
   const file=await this.designs.rpc(context.workspace,'get-file',{id:record.fileId});
   if(file.id!==record.fileId||file.projectId!==context.workspace.projectId||!Array.isArray(file.data?.pages)||file.data.pages.length!==record.pages.length||record.pages.some((page,i)=>file.data.pages[i]!==page.id))throw fail(409,'Saved native pages changed; check this design before refreshing colors');
   if([0,1,2,3].some(i=>{const token=file.data.tokensLib?.Studio?.studio?.['color'+i];return token?.$type!=='color'||!/^#[a-f0-9]{6}$/i.test(token.$value);})||!file.data.tokensLib?.$metadata?.activeThemes?.includes('Studio/Brand'))throw fail(409,'Saved Studio color tokens or active theme are unavailable');
   const identity=penpotColorIdentity(context.bundle),names=new Set(identity.tokens.map(t=>t.name)),layers=[],savedFonts=new Map();
   const visit=(value,depth=0)=>{if(depth>64)throw fail(502,'Native font metadata exceeds its bound');if(!value||typeof value!=='object')return;const id=value.fontId||value['font-id'],family=value.fontFamily||value['font-family'];if(id)savedFonts.set(id,{fontId:id,...(family?{fontFamily:family}:{})});for(const child of Object.values(value))if(child&&typeof child==='object')visit(child,depth+1);};
   for(const page of record.pages)for(const [nativeId,shape]of Object.entries(file.data.pagesIndex?.[page.id]?.objects||{})){const tokenName=shape.appliedTokens?.fill||shape['applied-tokens']?.fill;if(names.has(tokenName))layers.push({pageId:page.id,nativeId,tokenName});visit(shape.content);}
   if(!layers.length)throw fail(409,'This saved design has no bound Brand Kit colors');
   mapping={...identity,layers,fonts:{savedNativeFonts:[...savedFonts.values()].sort((a,b)=>a.fontId.localeCompare(b.fontId))}};
  }
  action.colorMapping=clone(mapping);
  // The transport compares mapping metadata, but only current authoritative colors
  // are sent to its token setters. No font field is sent to the native writer.
  context.bundle=clone(context.bundle);context.bundle.tokens.fonts=clone(mapping.fonts);
  const workspace=context.workspace,{tokens,layers,themeId}=mapping;
  const manifest={fileId:record.fileId,projectId:workspace.projectId,ownerPrincipal:workspace.ownerPrincipal,...(workspace.actingNativeProfileId?{pluginPrincipal:workspace.actingNativeProfileId}:{}),bindingEpoch:workspace.bindingEpoch,storyId:context.bundle.storyId,storyRevision:context.bundle.storyRevision,generationId:context.bundle.generationId,sourceApprovals:clone(context.bundle.sourceApprovals),fonts:clone(context.bundle.tokens.fonts),themeId,tokens,layers};
  if(action.manifestHash&&action.manifestHash!==hash(manifest))throw fail(409,'Saved native style mapping changed');return {context,record,manifest};
 }
 async input(actor,action,sessionContext){
  const {context,manifest}=await this.resolve(actor,action,sessionContext),workspace=context.workspace;
  return {actor:{id:actor.id,role:actor.role},styleAction:action,sessionContext,authorizedAt:action.createdAt,
   binding:{id:workspace.bindingId,adapter:'penpot',editorVersion:'2.18.3',nativeVersionKind:'archive',nativeDocumentVersion:'1',organizationId:this.designs.scope.organizationId,brandId:this.designs.scope.brandId,ownerPrincipal:workspace.ownerPrincipal,nativeProjectId:workspace.projectId,epoch:workspace.bindingEpoch},
   resource:{id:'story-tokens-'+action.designId,kind:'tokens',nativeId:manifest.fileId},action:'write',
   command:{operation:'refresh-brand-tokens',storyId:action.input.storyId,expectedRevision:action.input.expectedRevision,generationId:action.input.generationId,expectedBrandRevision:action.input.expectedBrandRevision,expectedNativeRevision:action.input.expectedNativeRevision},
   reauthorize:()=>this.resolve(actor,action,sessionContext),
  };
 }
 async snapshot(input,options){
  const {context}=await this.resolve(input.actor,input.styleAction,input.sessionContext),workspace=context.workspace;
  const fetchImpl=(url,init)=>this.fetchImpl(url,{...init,headers:{...init.headers,...(this.grantKey?{'X-Studio-Native-Grant-Key':this.grantKey,...(workspace.actingNativeProfileId?{'X-Studio-Acting-Profile':workspace.actingNativeProfileId}:{})}:{})}});
  return createPenpotLocalSnapshot({sessions:this.sessions,fetchImpl,transportMode:'loopback'})(input,options);
 }
 dto(action){return {id:action.id,status:action.status,brandRevision:action.input.expectedBrandRevision,nativeRevision:action.nativeRevision??null,pluginManifestUrl:'http://localhost:39039/manifest.json',retry:clone(action.input),pixelsVerified:false};}
 async prepare(actor,input,sessionContext){
  if(!input||Object.keys(input).sort().join(',')!==[...fields].sort().join(',')||!['infographic','carousel','story','reel'].includes(input.format)||!Number.isSafeInteger(input.expectedNativeRevision)||input.expectedNativeRevision<0||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<1||!(/^[a-f0-9]{64}$/i.test(input.expectedBrandRevision))||!(/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(input.idempotencyKey)))throw fail(400,'Current saved source, Brand Kit and native revision are required');
  const context=await this.designs.context(actor,input.storyId,sessionContext),state=await this.designs.store.get(this.designs.key),record=(state?.designs||[]).filter(d=>d.status==='ready'&&hash(stable(d.identity))===context.designKey).at(-1);if(!record)throw fail(404,'Create this campaign design before refreshing its colors');if(context.story.revision!==input.expectedRevision||context.story.generationId!==input.generationId||context.identity.brandRevision!==input.expectedBrandRevision)throw fail(409,'Saved source or Brand Kit changed; check the current design before preparing colors');
  const requestHash=hash({actorId:actor.id,input});let action;
  await this.designs.store.update(this.designs.key,state=>{state.styleActions||=[];action=state.styleActions.find(a=>a.input.idempotencyKey===input.idempotencyKey&&a.actorId===actor.id);if(action){if(action.requestHash!==requestHash)throw fail(409,'Style request key belongs to different content');return state;}if(state.styleActions.length>=100)throw fail(429,'Saved style action capacity reached');action={id:randomUUID(),actorId:actor.id,designId:record.id,input:clone(input),requestHash,status:'pending-native-action',createdAt:new Date(this.now()).toISOString()};state.styleActions.push(action);return state;});
  const existing=this.preparing.get(action.id);if(existing)return existing;
  const issuing=(async()=>{
   const nativeInput=await this.input(actor,action,sessionContext),current=await this.resolve(actor,action,sessionContext);
   if(action.status==='native-state-verified')return this.dto(action);
   if(!action.manifestHash){action.manifestHash=hash(current.manifest);await this.update(action.id,row=>{row.manifestHash=action.manifestHash;row.colorMapping=clone(action.colorMapping);});}
   const retained=this.capabilities.get(action.id);if(retained&&retained.expiresAt>this.now())return {...this.dto(action),nativeActionCapability:retained.capability};
   const result=await this.transport.execute(nativeInput);for(const [id,row]of this.capabilities)if(row.expiresAt<=this.now())this.capabilities.delete(id);this.capabilities.set(action.id,{capability:result.nativeActionCapability,expiresAt:result.expiresAt});
   return {...this.dto(action),nativeActionCapability:result.nativeActionCapability};
  })();this.preparing.set(action.id,issuing);try{return await issuing;}finally{this.preparing.delete(action.id);}
 }
 async reconcile(actor,id,sessionContext){
  const action=(await this.designs.store.get(this.designs.key))?.styleActions?.find(a=>a.id===id&&a.actorId===actor.id);if(!action)throw fail(404,'Saved style action unavailable');const input=await this.input(actor,action,sessionContext);if(action.status==='native-state-verified')return this.dto(action);
  const context=await this.transport.context(input),snapshot=await this.transport.snapshot(input,context.manifest,context.colors);
  if(snapshot.revision>action.input.expectedNativeRevision&&snapshot.boundPaintsMatch===true&&JSON.stringify(snapshot.tokenValues)===JSON.stringify(context.colors.map(c=>c.hex)))await this.commit(actor,action,sessionContext,snapshot.revision,'read-only-reconciliation');
  const saved=(await this.designs.store.get(this.designs.key)).styleActions.find(a=>a.id===id);return this.dto(saved);
 }
 async commit(actor,action,sessionContext,nativeRevision,method){
  const {context,manifest}=await this.resolve(actor,action,sessionContext),service=this.designs,guardKeys=service.brandAccess?service.brandAccess.guardKeys(context.grantSnapshot):[];
  await service.store.transact([service.key,service.repo.key,'identity',`editor-security:${service.scope.organizationId}:${service.scope.brandId}`,...guardKeys],values=>{
   const [state,scoped,identity,security,...guards]=values;if(service.brandAccess)service.brandAccess.assertCurrent({identity,brandAccess:guards[0],pair:guards[1],profileOwner:guards[2],session:guards[3]},context.grantSnapshot);assertRestoreAvailable(scoped);
   const user=identity.users.find(u=>u.id===actor.id),story=scoped.backlog.find(s=>s.id===action.input.storyId),binding=security?.bindings?.find(b=>b.id===context.workspace.bindingId),row=state.styleActions?.find(a=>a.id===action.id&&a.actorId===actor.id),record=state.designs.find(d=>d.id===action.designId);
   if(!user||user.disabled||!service.brandAccess&&user.role!=='founder'||!identity.memberships.some(m=>m.userId===actor.id&&m.organizationId===service.scope.organizationId&&m.brandIds.includes(service.scope.brandId))||!binding||binding.revokedAt||binding.epoch!==context.workspace.bindingEpoch||binding.ownerPrincipal!==context.workspace.ownerPrincipal||binding.nativeProjectId!==context.workspace.projectId)throw fail(403,'Current native design permission changed');
   if(!row||!record||row.manifestHash!==hash(manifest)||!story||storyContentDigest(story)!==context.identity.contentSha256||story.generationId!==action.input.generationId||story.revision!==action.input.expectedRevision||brandRevision(scoped.brandProfile)!==action.input.expectedBrandRevision)throw fail(409,'Source or saved style action changed');
   row.status='native-state-verified';row.nativeRevision=nativeRevision;row.verification={method,bindingEpoch:binding.epoch};record.appliedBrandRevision=action.input.expectedBrandRevision;record.nativeRevision=nativeRevision;return values;
  });this.capabilities.delete(action.id);
 }
}
export function storyStylePluginTransport(services){
 function transport(capability){for(const service of services.values()){try{service.styles?.transport.lookup(capability);if(service.styles)return service.styles.transport;}catch(error){if(![403,410].includes(error.status))throw error;}}throw fail(410,'Native action expired or unavailable');}
 return {claim:(capability,context)=>transport(capability).claim(capability,context),acknowledge:(capability,ack)=>transport(capability).acknowledge(capability,ack)};
}
