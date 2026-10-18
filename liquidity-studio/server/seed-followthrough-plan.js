// Read-only operator planning. No apply/queue endpoint or raw repository replacement.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fail} from './auth.js';
import {assertRestoreAvailable} from './restore-gate.js';
import {existingPreparationPlan} from './run-source-preparation-bootstrap.js';
const registry=JSON.parse(readFileSync(new URL('./seed-followthrough-registry.json',import.meta.url),'utf8'));
function ordered(value){if(Array.isArray(value))return value.map(ordered);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,ordered(value[key])]));return value;}
export const seedPlanHash=value=>createHash('sha256').update(JSON.stringify(ordered(value))).digest('hex');
const bytesHash=value=>createHash('sha256').update(value).digest('hex');
function authority(identity,actorId,scope){
 const actor=identity?.users?.find(user=>user.id===actorId),org=identity?.organizations?.find(org=>org.id===scope.organizationId),brand=org?.brands?.find(brand=>brand.id===scope.brandId);
 if(!actor||actor.role!=='founder'||!brand||brand.preset!==scope.preset||!identity.memberships.some(m=>m.userId===actorId&&m.organizationId===org.id&&m.brandIds.includes(brand.id)))throw fail(403,'Current founder and explicit owned scope required');
 return {principalSha256:seedPlanHash({id:actor.id,role:actor.role}),identitySha256:seedPlanHash(identity)};
}
function references(value,id){
 if(value===id)return true;
 if(Array.isArray(value))return value.some(item=>references(item,id));
 if(value&&typeof value==='object')return Object.entries(value).some(([key,item])=>key===id||references(item,id));
 return false;
}
function relatedWork(state,id,externalKeys){
 const reasons=[];
 const knownScopeFields=new Set(['schemaVersion','brandProfile','backlog','telemetry','jobs','assets','preflights','usage','workspace','operatorControl','operatorJobScope','operatorJobs','preparedSourceCandidates']);
 for(const key of Object.keys(state))if(!knownScopeFields.has(key))reasons.push('UNKNOWN_SCOPE_FIELD_'+key);
 if(state.schemaVersion!==1)reasons.push('UNKNOWN_SCOPE_SCHEMA');
 if(externalKeys.length)reasons.push('EXTERNAL_NATIVE_OR_REVIEW_RECORDS');
 if(state.assets?.length)reasons.push('SCOPED_ASSET_METADATA');
 for(const [key,value] of Object.entries(state)){
  if(['schemaVersion','brandProfile','backlog','assets'].includes(key))continue;
  if(references(value,id))reasons.push('RELATED_'+key);
 }
 return reasons;
}
/** Pure guard for eventual EXISTING WorkspaceService.control.guard composition.
 * Caller must supply current identity/state/inventory from the SAME authoritative
 * transaction. This module deliberately has NO apply until that boundary exists.
 */
export function assertPristineSeedPlanRow({identity,actorId,scope,state,externalKeys,row}){
 assertRestoreAvailable(state);
 const current=authority(identity,actorId,scope),known=registry.rows.find(item=>item.storyId===row.storyId&&item.brandId===scope.brandId&&item.preset===scope.preset),story=state.backlog?.find(item=>item.id===row.storyId);
 if(!known||!story||row.desiredTitle!==known.desiredTitle||row.identitySha256!==current.identitySha256||row.principalSha256!==current.principalSha256||row.scopeSha256!==seedPlanHash(scope)||story.revision!==row.revision||(story.contentRevision||1)!==row.contentRevision||seedPlanHash(story)!==row.fullStorySha256||seedPlanHash(story)!==known.expectedFactorySha256||seedPlanHash(story.sourceClaims||[])!==known.sourceClaimsSha256||bytesHash(story.title)!==row.titleSha256||relatedWork(state,row.storyId,externalKeys).length)throw fail(409,'Seed changed or has work; preserve it for owner choice');
 return true;
}
export function pristineSeedPlan({identity,actorId,scope,state,externalKeys,sourceCommit}){
 if(!/^[a-f0-9]{40}$/.test(sourceCommit))throw fail(400,'Exact source commit required');
 assertRestoreAvailable(state);
 const principal=authority(identity,actorId,scope),official=existingPreparationPlan(state,scope),eligible=new Map(official.eligible.map(item=>[item.storyId,item])),rows=[];
 for(const known of registry.rows.filter(item=>item.preset===scope.preset&&item.brandId===scope.brandId)){
  const story=state.backlog?.find(item=>item.id===known.storyId);
  if(!story){rows.push({storyId:known.storyId,disposition:'missing'});continue;}
  const row={storyId:story.id,desiredTitle:known.desiredTitle,currentTitle:story.title,revision:story.revision,contentRevision:story.contentRevision||1,titleSha256:bytesHash(story.title),sourceClaimsSha256:seedPlanHash(story.sourceClaims||[]),fullStorySha256:seedPlanHash(story),scopeSha256:seedPlanHash(scope),...principal,reasons:relatedWork(state,story.id,externalKeys)};
  try{assertPristineSeedPlanRow({identity,actorId,scope,state,externalKeys,row});row.disposition=story.title===known.desiredTitle?'pristine-no-title-change':'pristine-rename-eligible';}
  catch(error){if(error.status!==409)throw error;row.disposition='needs-owner-choice';if(!row.reasons.length)row.reasons.push('NON_FACTORY_OR_CHANGED_RECORD');}
  row.currentPreparationFingerprint=eligible.get(story.id)?.inputFingerprint||null;
  rows.push(row);
 }
 const catalog=readFileSync(new URL('./source-catalog.js',import.meta.url),'utf8'),registrySource=catalog.slice(catalog.indexOf('const copySelections = ['),catalog.indexOf('export function sourceCopySelection'));
 const plan={schemaVersion:1,meaning:'Read-only snapshot plan, not authority, apply or queue',sourceCommit,scope,...principal,catalogModuleSha256:bytesHash(catalog),copyRegistrySourceSha256:bytesHash(registrySource),legacyFactoryCommit:registry.legacyFactoryCommit,legacyDomainSha256:registry.legacyDomainSha256,externalInventorySha256:seedPlanHash([...externalKeys].sort()),rows};
 return {...plan,planSha256:seedPlanHash(plan)};
}
/** Intersect the EXISTING official dry-run with reviewed four IDs; no dispatch. */
export function plannedSeedQueueIds(plan,state,scope){
 if(seedPlanHash(scope)!==seedPlanHash(plan.scope))throw fail(409,'Plan scope changed');
 const allowed=new Set(registry.rows.filter(row=>row.preset===scope.preset&&row.brandId===scope.brandId).map(row=>row.storyId));
 const reviewed=new Set(plan.rows.filter(row=>['pristine-no-title-change','pristine-rename-eligible'].includes(row.disposition)).map(row=>row.storyId));
 return existingPreparationPlan(state,scope).eligible.filter(row=>allowed.has(row.storyId)&&reviewed.has(row.storyId)).map(row=>row.storyId);
}
