// Explicit internal SQLite operator composition. No HTTP route or Firestore claim.
import {DurableStore} from './storage.js';
import {fail} from './auth.js';
import {brandRevision} from './multimodal-contract.js';
import {preparationFingerprint} from './prepared-source-candidate.js';
import {captureContentRevisions,applyContentRevisions} from './story-content-revision.js';
import {seedPlanHash,pristineSeedPlan,assertPristineSeedPlanRow,plannedSeedQueueIds} from './seed-followthrough-plan.js';

function inventory(store,scope,key){return store.keys('').filter(item=>item!==key&&(item.includes(`:${scope.organizationId}:${scope.brandId}:`)||item.endsWith(`:${scope.organizationId}:${scope.brandId}`)));}
function queueStateHash(state){const copy=structuredClone(state);for(const receipt of copy.workspace?.receipts||[])delete receipt.seedFollowthrough;return seedPlanHash(copy);}
function same(actual,expected){if(seedPlanHash(actual)!==seedPlanHash(expected))throw fail(409,'Reviewed seed binding changed; preserve current work');}
function currentPlan(store,scope,key,actorId,state,sourceCommit){return pristineSeedPlan({identity:store.get('identity'),actorId,scope,state,externalKeys:inventory(store,scope,key),sourceCommit});}

/** The supplied plan must be freshly reviewed; sourceCommit comes from the pinned
 * operator assembly, never from a request body. Queue uses the receipt's fixed
 * post-title revision/fingerprint, not createForIngestion's later story read.
 */
export async function applyPristineSeedFollowthrough({store,workspace,jobs,actor,scope,plan,sourceCommit,titleIdempotencyKey,jobIdempotencyKey}){
 if(!(store instanceof DurableStore)||workspace.store!==store||workspace.repo?.store!==store||jobs.repo?.store!==store||jobs.repo.key!==workspace.repo.key)throw fail(400,'Same-connection SQLite operator composition required');
 same(workspace.repo.scope,scope);same(jobs.repo.scope,scope);
 same(scope,plan.scope);
 if(sourceCommit!==plan.sourceCommit)throw fail(409,'Reviewed source commit changed');
 const {planSha256,...body}=plan;
 if(seedPlanHash(body)!==planSha256)throw fail(409,'Reviewed plan fingerprint changed');
 const rows=plan.rows.filter(row=>['pristine-no-title-change','pristine-rename-eligible'].includes(row.disposition));
 if(!rows.length||rows.length>4||rows.length!==plan.rows.length)throw fail(409,'All scoped target rows must be pristine');
 let capturedContentRevisions;
 const binding={purpose:'pristine-seed-followthrough',planSha256,sourceCommit};
 const result=await workspace.mutate(actor,{idempotencyKey:titleIdempotencyKey,changes:rows.filter(row=>row.disposition==='pristine-rename-eligible').map(row=>({kind:'story.patch',storyId:row.storyId,expectedRevision:row.revision,patch:{title:row.desiredTitle}}))},{binding,
  guard(state,prior){
   // This callback executes synchronously inside DurableStore BEGIN IMMEDIATE.
   const observed=currentPlan(store,scope,workspace.repo.key,actor.id,state,sourceCommit);
   same(observed.identitySha256,plan.identitySha256);same(observed.principalSha256,plan.principalSha256);
   same(observed.catalogModuleSha256,plan.catalogModuleSha256);same(observed.copyRegistrySourceSha256,plan.copyRegistrySourceSha256);
   if(prior){if(!prior.seedFollowthrough||prior.seedFollowthrough.planSha256!==planSha256)throw fail(409,'Earlier receipt belongs to another seed operation');return;}
   same(observed,plan);
   capturedContentRevisions=captureContentRevisions(state);
   for(const row of rows)assertPristineSeedPlanRow({identity:store.get('identity'),actorId:actor.id,scope,state,externalKeys:inventory(store,scope,workspace.repo.key),row});
  },
  committed(state,receiptResult){
   if(receiptResult.outcomes.some(outcome=>outcome.status!=='applied'))throw fail(409,'All reviewed title changes must commit together');
   // Compute precisely the same content epoch that the repository wrapper assigns
   // after this callback, without a later read that could adopt a human edit.
   const projected=applyContentRevisions(structuredClone(state),capturedContentRevisions);
   const ids=plannedSeedQueueIds(plan,projected,scope);
   const queue={planSha256,scopeStateSha256:queueStateHash(projected),brandRevision:brandRevision(projected.brandProfile),items:ids.map(storyId=>{const story=projected.backlog.find(item=>item.id===storyId);return {storyId,storyRevision:story.revision,inputFingerprint:preparationFingerprint(story,scope),fullStorySha256:seedPlanHash(story)};})};
   if(ids.length!==rows.length)throw fail(409,'Every reviewed target must have an official bounded source selection');
   const receipt=state.workspace.receipts.find(item=>item.idempotencyKey===titleIdempotencyKey);
   receipt.seedFollowthrough=queue;
  }
 });
 // A receipt is authoritative only for the original post-title intent. Read it
 // without substituting current revisions, then recheck it in job creation's tx.
 const accepted=store.get(workspace.repo.key).workspace.receipts.find(item=>item.idempotencyKey===titleIdempotencyKey)?.seedFollowthrough;
 if(!accepted)throw fail(409,'Title receipt is unavailable; no job was queued');
 const input={purpose:'source-preparation',idempotencyKey:jobIdempotencyKey,reviewed:true,brandRevision:accepted.brandRevision,items:accepted.items.map(({storyId,storyRevision})=>({storyId,storyRevision}))};
 const job=await jobs.create(actor,input,'operator-plan',{binding,guard(state,prior){
  const observed=currentPlan(store,scope,workspace.repo.key,actor.id,state,sourceCommit);
  same(observed.identitySha256,plan.identitySha256);same(observed.principalSha256,plan.principalSha256);
  same(observed.catalogModuleSha256,plan.catalogModuleSha256);same(observed.copyRegistrySourceSha256,plan.copyRegistrySourceSha256);
  const receipt=state.workspace?.receipts.find(item=>item.idempotencyKey===titleIdempotencyKey)?.seedFollowthrough;same(receipt,accepted);
  if(prior)return; // Existing job receipt replay never creates fresh work.
  same(queueStateHash(state),accepted.scopeStateSha256);
  if(inventory(store,scope,workspace.repo.key).length||state.assets?.length)throw fail(409,'Scoped assets or native work appeared; preserve it');
  for(const expected of accepted.items){const story=state.backlog.find(item=>item.id===expected.storyId);if(!story||seedPlanHash(story)!==expected.fullStorySha256||preparationFingerprint(story,scope)!==expected.inputFingerprint)throw fail(409,'Story changed after title correction; no source job queued');}
 }});
 return {titleOperation:result,job};
}
