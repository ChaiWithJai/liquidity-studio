// Explicit manager selections. Never creates an AI analysis, provider trace or budget reservation.
import {randomUUID} from 'node:crypto';
import {fail} from './auth.js';
const clone=value=>structuredClone(value);
const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value);
const exact=(value,keys)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!keys.includes(key)))throw fail(400,'Unsupported human moment fields');};
const text=(value,name,max,empty=false)=>{if(typeof value!=='string'||value.length>max||!empty&&!value.trim())throw fail(422,`Invalid moment ${name}`);return value.trim();};
export function readManualMoments(state,sourceId){
 if(!state.inbox?.sources.some(source=>source.id===sourceId))throw fail(404,'Select a current inbox source');
 return {revision:state.revision,sourceId,moments:clone((state.inbox.manualMoments||[]).filter(moment=>moment.sourceId===sourceId))};
}
export function saveManualMoment(state,input,actor,at){
 exact(input.moment,['id','title','startSeconds','endSeconds','context','recordingId','recordingFit']);
 if(!Number.isSafeInteger(input.expectedSourceRevision)||input.expectedSourceRevision<1)throw fail(400,'Retain the current source revision');
 const source=state.inbox?.sources.find(source=>source.id===input.sourceId);if(!source||source.revision!==input.expectedSourceRevision)throw fail(409,'Selected source changed; keep your moment wording');
 const rows=state.inbox.manualMoments||[],old=input.moment.id?rows.find(moment=>moment.id===input.moment.id&&moment.sourceId===source.id):null;
 if(input.moment.id&&(!uuid(input.moment.id)||!old))throw fail(409,'Saved human moment is unavailable');
 if(old?input.expectedMomentRevision!==old.revision:input.expectedMomentRevision!==undefined)throw fail(409,'Saved human moment changed; keep your working values');
 if(!old&&(rows.length>=64||rows.filter(moment=>moment.sourceId===source.id).length>=16))throw fail(429,'Saved human moment capacity reached; existing selections are retained');
 const {startSeconds,endSeconds,recordingId}=input.moment;
 if(!Number.isFinite(startSeconds)||!Number.isFinite(endSeconds)||startSeconds<0||endSeconds>86400||endSeconds<=startSeconds||endSeconds-startSeconds>30)throw fail(422,'Choose a source interval of at most 30 seconds');
 if(recordingId!==null&&!state.inbox.recordings.some(recording=>recording.id===recordingId))throw fail(422,'Choose a current recording or leave it unselected');
 const moment={id:old?.id||randomUUID(),sourceId:source.id,sourceUrl:source.sourceUrl,sourceRevision:source.revision,title:text(input.moment.title,'title',200),startSeconds,endSeconds,context:text(input.moment.context,'context',2000),recordingId,recordingFit:text(input.moment.recordingFit,'recording fit',2000,true),method:'human-selected',verification:'user-reported',revision:(old?.revision||0)+1,createdAt:old?.createdAt||at,createdBy:old?.createdBy||actor.id,savedAt:at,savedBy:actor.id};
 state.inbox.manualMoments=[...rows.filter(row=>row.id!==moment.id),moment];return {moment:clone(moment)};
}
export function manualMomentSnapshot(state,ref,sourceRefs){
 exact(ref,['kind','momentId','revision']);if(ref.kind!=='human-selected')throw fail(422,'Unsupported moment origin');
 const moment=state.inbox?.manualMoments?.find(moment=>moment.id===ref.momentId),source=state.inbox?.sources.find(source=>source.id===moment?.sourceId);
 if(!moment||moment.revision!==ref.revision||!source||source.revision!==moment.sourceRevision)throw fail(409,'Save and reload the current human moment before adding it to a report');
 if(!sourceRefs.includes(moment.sourceId))throw fail(422,'Include the human moment source in the report');
 return {kind:'human-selected',sourceId:moment.sourceId,sourceUrl:moment.sourceUrl,moment:clone(moment),recording:clone(state.inbox.recordings.find(recording=>recording.id===moment.recordingId)||null),timestamps:'user-selected-unverified'};
}
