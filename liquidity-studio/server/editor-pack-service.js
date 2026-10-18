import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { ScopedRepository, scopeKey } from './repository.js';
import { BRAND_PRESETS } from './domain.js';
import { fail } from './auth.js';
import { addFile, sealEditorPack, validateEditorPack, jsonDigest, exact } from './editor-pack.js';
import { nativeFontCatalog } from './native-editor-fonts.js';
const sourceDirectory=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public/fonts');
const fontDirectory=fs.existsSync(sourceDirectory)?sourceDirectory:'/usr/local/share/fonts/liquidity';
export function checkRestoreCapacity(requiredBytes, directory=process.env.STUDIO_DATABASE_PATH ? path.dirname(path.resolve(process.env.STUDIO_DATABASE_PATH)) : process.cwd()) {
  while(!fs.existsSync(directory)) { const parent=path.dirname(directory);if(parent===directory)throw fail(507,'Restore capacity cannot be established');directory=parent; }
  const stats=fs.statfsSync(directory,{bigint:true});
  if(stats.bavail*stats.bsize<BigInt(requiredBytes+64*1024*1024))throw fail(507,'Insufficient restore disk headroom');
}
const copy=value=>structuredClone(value);
const portableAssetFields=['id','name','contentType','size','width','height','sha256','rightsDeclaration','consent','createdBy','createdAt','lineage'];
const portableDocumentFields=['schemaVersion','id','organizationId','brandId','storyId','format','revision','title','origin','status','createdBy','updatedBy','createdAt','updatedAt'];
const pick=(value,fields)=>Object.fromEntries(fields.filter(field=>value[field]!==undefined).map(field=>[field,copy(value[field])]));
/** Separate from database recovery: no principal/session/permit/lease restoration. */
export class EditorPackService {
  constructor({native,now=()=>new Date().toISOString(),capacityCheck=checkRestoreCapacity}){Object.assign(this,{native,now,capacityCheck});this.repo=native.repo;this.store=native.store;this.scope=native.scope;this.identity=native.identity;this.journalKey=`editor-restore:${this.scope.organizationId}:${this.scope.brandId}`;}
  async principal(actor){
    if(!actor?.id)throw fail(401,'Sign in required');
    const identity=await this.store.get('identity'), current=identity?.users?.find(user=>user.id===actor.id);
    if(!current || current.role!=='founder')throw fail(403,'Current founder access required');
    await this.identity.authorize(current,this.scope.organizationId,this.scope.brandId);
    return {actor:current,identityHash:jsonDigest(identity)};
  }
  async export(actor){
    await this.principal(actor);await this.native.authorize(actor);
    const repository=await this.repo.exportData(), sourceFingerprint=jsonDigest(await this.repo.read());
    const files=[],documents=[],assets=[],fonts=[];
    const nativeKeys=await this.store.keys(this.native.prefix);
    const documentKeys=nativeKeys.filter(key=>key.startsWith(`${this.native.prefix}document:`));
    const assetKeys=nativeKeys.filter(key=>key.startsWith(`${this.native.prefix}asset:`));
    if(documentKeys.length>100 || assetKeys.length>100)throw fail(413,'Editor pack collection limit');
    for(const key of assetKeys){const raw=await this.store.get(key),asset=await this.native.asset(actor,raw.id);assets.push({id:asset.id,metadata:pick(asset,portableAssetFields),file:addFile(files,Buffer.from(asset.base64,'base64'),'image')});}
    const captured=[];
    for(const key of documentKeys){
      const record=await this.store.get(key);captured.push([key,jsonDigest(record)]);
      const scene=async reference=>addFile(files,Buffer.from(JSON.stringify((await this.native.hydrate(record,{documentRef:reference})).document)),'document');
      const history=[];
      for(const snapshot of record.restoredHistory || [])history.push({...pick(snapshot,['revision','title','updatedBy','updatedAt']),document:await scene(snapshot.documentRef)});
      for(const receipt of record.receipts || []){const s=receipt.snapshot;history.push({document:await scene(s.documentRef),revision:s.revision,title:s.title,updatedBy:s.updatedBy,updatedAt:s.updatedAt});}
      const review=await this.store.get(`editor-review:${this.scope.organizationId}:${this.scope.brandId}:${record.id}`);
      if(review)delete review.journal;
      documents.push({metadata:pick(record,portableDocumentFields),current:await scene(record.documentRef),initial:await scene(record.initialDocumentRef),history,reviewHistory:review?addFile(files,Buffer.from(JSON.stringify({authority:'historical-only',record:review})),'history'):null});
    }
    for(const font of nativeFontCatalog())for(const variant of font.variants){
      const filename=path.basename(variant.url),licenseFilename=path.basename(font.license_url);
      fonts.push({family:font.family,filename,file:addFile(files,fs.readFileSync(path.join(fontDirectory,filename)),'font'),licenseFile:addFile(files,fs.readFileSync(path.join(fontDirectory,licenseFilename)),'license'),license:'OFL-1.1',licenseFilename});
    }
    const pack=sealEditorPack({schemaVersion:1,kind:'studio-native-editor-pack',scope:{organizationId:this.scope.organizationId,brandId:this.scope.brandId},exportedAt:this.now(),repository:addFile(files,Buffer.from(JSON.stringify(repository)),'repository'),documents,assets,fonts,files});
    if(sourceFingerprint!==jsonDigest(await this.repo.read()))throw fail(409,'Source changed during editor ejection');
    for(const [key,fingerprint] of captured)if(fingerprint!==jsonDigest(await this.store.get(key)))throw fail(409,'Native document changed during editor ejection');
    await this.principal(actor);return pack;
  }
  validateTarget(pack,input,actor){
    exact(input,['target','principalRemap','sourceReviewAcknowledged','idempotencyKey']);
    exact(input.target,['organizationId','brandId']);
    if(jsonDigest(input.target)!==jsonDigest({organizationId:this.scope.organizationId,brandId:this.scope.brandId}))throw fail(403,'Explicit current destination scope required');
    if(!input.principalRemap || Object.values(input.principalRemap).some(id=>id!==actor.id) || !/^[A-Za-z0-9_-]{16,100}$/.test(input.idempotencyKey || ''))throw fail(422,'Explicit owner remap and restore key required');
    const principals=new Set();
    for(const doc of pack.documents){for(const key of ['createdBy','updatedBy'])if(doc.metadata[key])principals.add(doc.metadata[key]);for(const s of doc.history)if(s.updatedBy)principals.add(s.updatedBy);}
    for(const asset of pack.assets)if(asset.metadata.createdBy)principals.add(asset.metadata.createdBy);
    for(const id of principals)if(input.principalRemap[id]!==actor.id)throw fail(403,'Every native owner requires explicit principal mapping');
    if(input.sourceReviewAcknowledged!==true)throw fail(422,'Current owner source review acknowledgement required');
  }
  async install(actor,pack,input){
    const validated=validateEditorPack(pack), principal=await this.principal(actor);this.validateTarget(pack,input,principal.actor);
    // Verify fonts already installed by the operator. Import never writes executable/font paths.
    const approvedFonts=nativeFontCatalog().flatMap(font=>font.variants.map(variant=>({family:font.family,filename:path.basename(variant.url),licenseFilename:path.basename(font.license_url)})));
    for(const font of pack.fonts){if(!approvedFonts.some(entry=>entry.family===font.family && entry.filename===font.filename && entry.licenseFilename===font.licenseFilename) || !fs.readFileSync(path.join(fontDirectory,font.filename)).equals(validated.bytes(font.file)) || !fs.readFileSync(path.join(fontDirectory,font.licenseFilename)).equals(validated.bytes(font.licenseFile)))throw fail(422,'Install the exact licensed pack fonts before restoration');}
    let validatedState;
    await ScopedRepository.prototype.importData.call({scope:this.scope,key:'validation',store:{update:async(_key,callback)=>{validatedState=callback(null);}}},copy(validated.repository),{remapScope:true});
    for(const asset of pack.assets){const image=sharp(validated.bytes(asset.file),{limitInputPixels:4_000_000});const info=await image.metadata();if(info.width!==asset.metadata.width || info.height!==asset.metadata.height || info.pages>1 || `image/${info.format}`!==asset.metadata.contentType)throw fail(422,'Invalid portable image dimensions or encoding');await image.resize(1,1).raw().toBuffer();}
    await this.capacityCheck(Buffer.byteLength(JSON.stringify(pack))*3);
    const existing=await this.store.get(this.journalKey);
    if(existing?.status==='completed' && existing.key===input.idempotencyKey && existing.packSha256===pack.sha256)return copy(existing.result);
    if(existing)throw fail(409,'Recover the existing installation before another restore');
    const before=await this.repo.read();
    // Only a deliberately empty brand is eligible; default research seeds are not disposable user data.
    if(before.backlog.length || before.assets.length || (await this.store.keys(this.native.prefix)).length)throw fail(409,'Restore requires an empty destination brand');
    const identity=await this.store.get('identity');if(jsonDigest(identity)!==principal.identityHash)throw fail(409,'Membership changed before installation');
    const planned=[],state=validatedState,id=randomUUID(),at=this.now();
    delete state.operatorJobs;delete state.operatorJobScope;delete state.operatorControl;
    // Native review and receipt authority starts again; exact imported evidence remains in the archive.
    for(const story of state.backlog){delete story.assigneeId;for(const claim of story.sourceClaims || []){if(claim.status==='approved' && claim.kind==='clinical')throw fail(422,'Clinical source approval must be re-established before import');if(claim.status==='approved'){claim.reviewedBy=actor.id;claim.reviewedAt=at;}delete claim.clinicalReview;}}
    const remap=value=>{if(!value || typeof value!=='object')return;for(const [key,child] of Object.entries(value)){if(key==='organizationId')value[key]=this.scope.organizationId;else if(key==='brandId' && child===pack.scope.brandId)value[key]=this.scope.brandId;else if(['createdBy','updatedBy','actorId','userId','reviewerId','reviewedBy'].includes(key) && input.principalRemap[child])value[key]=actor.id;else remap(child);}};
    remap(state);if(state.workspace)delete state.workspace.receipts;
    const payload=hash=>{const key=`${this.native.prefix}payload:${id}-${hash}`;if(!planned.some(item=>item.key===key))planned.push({key,value:{document:validated.json(hash),sha256:hash}});return {key,sha256:hash};};
    for(const asset of pack.assets){const metadata=copy(asset.metadata);remap(metadata);planned.push({key:`${this.native.prefix}asset:${asset.id}`,value:{...metadata,base64:validated.bytes(asset.file).toString('base64'),fingerprint:jsonDigest({restore:id,asset:asset.id})}});}
    for(const doc of pack.documents){const record=copy(doc.metadata);remap(record);record.status='proposal';record.documentRef=payload(doc.current);record.initialDocumentRef=payload(doc.initial);record.receipts=[];
      // Retain history as non-replayable snapshots, not source actor idempotency receipts.
      record.restoredHistory=doc.history.map(snapshot=>({...copy(snapshot),documentRef:payload(snapshot.document),authority:'historical-only'}));
      record.portableHistory={sourceScope:pack.scope,sourceDocumentId:record.id,reviewHistory:doc.reviewHistory?validated.json(doc.reviewHistory):null,packSha256:pack.sha256,restoredBy:actor.id,restoredAt:at};
      const story=state.backlog.find(item=>item.id===record.storyId);record.origin.sourceApprovals=copy(story.sourceClaims.filter(c=>c.status==='approved'));
      planned.push({key:this.native.key(record.id),value:record});}
    const journal={schemaVersion:1,id,status:'installing',key:input.idempotencyKey,actorId:actor.id,identityHash:principal.identityHash,packSha256:pack.sha256,before,plannedKeys:planned.map(p=>p.key),createdAt:at};
    await this.store.transact(['identity',this.repo.key,this.journalKey],([currentIdentity,current,prior])=>{if(prior || jsonDigest(currentIdentity)!==principal.identityHash || jsonDigest(current)!==jsonDigest(before))throw fail(409,'Restore destination changed');return [currentIdentity,{...current,editorRestore:{id,status:'installing'}},journal];});
    try{
      for(const entry of planned){await this.principal(actor);await this.store.update(entry.key,current=>{if(current!==null)throw fail(409,'Restore key collision');return {...entry.value,restoreInstallationId:id};});}
      const result={restored:true,packSha256:pack.sha256,documents:pack.documents.length,assets:pack.assets.length,reviewAuthority:'not-restored'};
      await this.store.transact(['identity',this.repo.key,this.journalKey],([currentIdentity,current,currentJournal])=>{if(jsonDigest(currentIdentity)!==principal.identityHash || current?.editorRestore?.id!==id || currentJournal?.id!==id)throw fail(409,'Restore authorization or reservation changed');return [currentIdentity,state,{...currentJournal,status:'completed',result}];});
      return result;
    }catch(error){try{await this.rollback(actor,{idempotencyKey:input.idempotencyKey});}catch(recoveryError){error.restoreRecoveryRequired=true;error.recoveryStatus=recoveryError.status || 500;}throw error;}
  }
  async rollback(actor,{idempotencyKey}){
    // Operator recovery requires current founder authority; a revoked initiating owner cannot continue.
    await this.principal(actor);const journal=await this.store.get(this.journalKey);
    if(!journal || journal.key!==idempotencyKey || journal.status!=='installing')throw fail(409,'No matching interrupted installation');
    for(const key of journal.plannedKeys){if(!key.startsWith(this.native.prefix))throw fail(500,'Invalid restore journal ownership');const value=await this.store.get(key);if(value?.restoreInstallationId===journal.id)await this.store.delete(key);else if(value)throw fail(409,'Restore key ownership changed; operator inspection required');}
    await this.store.transact([this.repo.key,this.journalKey],([state,current])=>{if(state?.editorRestore?.id!==journal.id || current?.id!==journal.id)throw fail(409,'Restore reservation changed');return [journal.before,null];});
    await this.store.delete(this.journalKey);return {rolledBack:true};
  }
}

/** Creates an explicitly empty destination; never clears seeded or user-edited brands. */
export async function createEditorRestoreDestination({store,identity,actor,organizationId,name,preset}) {
  if(typeof name!=='string' || !name.trim() || name.length>160 || !['liquidity_desk','vedic_dharma'].includes(preset))throw fail(422,'Destination name and supported preset required');
  const snapshot=await store.get('identity'), current=snapshot?.users.find(user=>user.id===actor?.id);
  if(current?.role!=='founder')throw fail(403,'Current founder access required');
  if(!(await identity.organizations(current)).some(org=>org.id===organizationId))throw fail(403,'Current organization access required');
  const brand={id:randomUUID(),name:name.trim(),preset},scope={organizationId,brandId:brand.id,preset};
  const {researchBacklog,...brandProfile}=copy(BRAND_PRESETS[preset]);
  const state={schemaVersion:1,brandProfile,backlog:[],telemetry:{traces:[],batchJobs:[],backpropDataset:[]},jobs:[],assets:[],preflights:[],usage:[]};
  await store.transact(['identity',scopeKey(scope)],([value,prior])=>{
    if(jsonDigest(value)!==jsonDigest(snapshot) || prior)throw fail(409,'Destination identity changed');
    value.organizations.find(org=>org.id===organizationId).brands.push(brand);
    const membership=value.memberships.find(member=>member.organizationId===organizationId && member.userId===actor.id);
    if(!membership)throw fail(403,'Organization membership required');membership.brandIds.push(brand.id);
    return [value,state];
  });
  return {brand,scope};
}
