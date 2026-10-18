import { createHash } from 'node:crypto';
import { fail } from './auth.js';
// Only explicitly non-content fields are omitted. New/unknown fields invalidate
// content conservatively until their semantics are deliberately classified.
const metadata=new Set(['revision','contentRevision','status','scheduledDay','scheduleSchemaVersion','updatedAt','assigneeId','exportedAt','exportedRevision',
 'preparationStatus','preparationJobId','preparedCandidateId','preparationUpdatedAt','preparationErrorCode']);
function sorted(value) {
 if(Array.isArray(value))return value.map(sorted);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,sorted(value[key])]));
 return value;
}
export function storyContentDigest(story) {
 const content=Object.fromEntries(Object.entries(story).filter(([key])=>!metadata.has(key)));
 return createHash('sha256').update(JSON.stringify(sorted(content))).digest('hex');
}
export function captureContentRevisions(state) {
 return new Map(state.backlog.map(story=>[story.id,{digest:storyContentDigest(story),revision:story.contentRevision||1}]));
}
export function applyContentRevisions(state,before) {
 for(const story of state.backlog){
  const prior=before.get(story.id);
  const changed=prior&&prior.digest!==storyContentDigest(story);
  const revision=prior?prior.revision+(changed?1:0):1;
  if(!Number.isSafeInteger(revision)||revision<1)throw fail(409,'Content revision capacity reached; reconcile this story before editing');
  story.contentRevision=revision;
 }
 return state;
}
