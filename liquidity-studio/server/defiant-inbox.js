// Metadata-only source inbox. No provider fetch, media ingestion or rights transition.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fail} from './auth.js';
const exact=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k)))throw fail(400,'Unsupported inbox fields');};
const example=JSON.parse(readFileSync(new URL('./defiant-nipsey-example.json',import.meta.url),'utf8'));
const clone=x=>structuredClone(x),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const inboxStages=['new','considering','selected','parked'];
export const emptyInbox=()=>({sources:[],recordings:[],workstreams:[],matches:[],imports:[]});
const text=(v,n,max=2000)=>{if(typeof v!=='string'||!v.trim()||v.length>max)throw fail(422,`Invalid ${n}`);return v.trim();};
const date=v=>v===null||typeof v==='string'&&Number.isFinite(Date.parse(v));
export function inboxInput(input){
 exact(input,['kind']);if(input.kind!=='nipsey-example')throw fail(422,'Choose the Nipsey example research pack');
 // Server-owned mapping retains every supplied row and original reference, not executable Python.
 const data=clone(example);if(Buffer.byteLength(JSON.stringify(data))>512*1024)throw fail(413,'Source pack is too large');
 for(const [key,max] of [['sources',128],['recordings',32],['workstreams',16],['matches',256]])if(!Array.isArray(data[key])||data[key].length>max||new Set(data[key].map(x=>x.id)).size!==data[key].length)throw fail(422,'Invalid source pack references');
 for(const s of data.sources){if(!/^[A-Za-z0-9_-]{11}$/.test(s.videoId)||s.id!==`youtube:${s.videoId}`||s.sourceUrl!==`https://www.youtube.com/watch?v=${s.videoId}`||!date(s.publishedAt))throw fail(422,'Invalid canonical source');for(const o of s.observations)if(!['views','likes','comments'].includes(o.metric)||!Number.isSafeInteger(o.value)||o.value<0||!date(o.observedAt))throw fail(422,'Invalid historical observation');}
 for(const m of data.matches)if(!data.sources.some(s=>s.id===m.sourceId)||!data.recordings.some(r=>r.id===m.recordingId)||!data.workstreams.some(w=>w.id===m.workstreamId))throw fail(422,'Source pack has a missing match reference');
 return data;
}
export function inboxPreview(state,input){
 const data=inboxInput(input),before=state.inbox||emptyInbox(),counts={};
 for(const key of ['sources','recordings','workstreams','matches']){const existing=new Map(before[key].map(x=>[x.id,x]));counts[key]={new:0,unchanged:0,conflicting:0};for(const row of data[key]){const old=existing.get(row.id);if(!old)counts[key].new++;else if((old.importDigest||hash(old.originalImported||old))===hash(row))counts[key].unchanged++;else counts[key].conflicting++;}if(before[key].length+counts[key].new>({sources:128,recordings:32,workstreams:16,matches:256})[key])throw fail(413,'Creator inbox capacity reached; existing work is retained');}
 return {expectedRevision:state.revision,kind:input.kind,previewDigest:hash(data),counts,warnings:['Example research pack. Titles, catalog identifiers, metrics and permissions are supplied, not verified.','Observation times are unknown. Import preserves existing manager decisions and notes.']};
}
export function importInbox(state,input,actor,at){
 const preview=inboxPreview(state,{kind:input.kind});if(preview.previewDigest!==input.previewDigest)throw fail(409,'Source preview changed; inspect the pack again');if(Object.values(preview.counts).some(c=>c.conflicting))throw fail(409,'Existing imported records differ; preserve saved work and resolve the pack explicitly');
 const data=inboxInput({kind:input.kind}),inbox=state.inbox||emptyInbox();
 for(const key of ['sources','recordings','workstreams','matches'])for(const row of data[key])if(!inbox[key].some(x=>x.id===row.id))inbox[key].push({...row,importDigest:hash(row),originalImported:clone(row),importedBy:actor.id,importedAt:at});
 if(!inbox.imports.some(x=>x.digest===preview.previewDigest))inbox.imports.push({packId:data.packId,digest:preview.previewDigest,provenance:data.provenance,importedBy:actor.id,importedAt:at});state.inbox=inbox;
 return {counts:preview.counts,packId:data.packId};
}
export function saveInboxMatch(state,sourceId,input,actor,at){
 exact(input,['recordingId','rationale','workstreamId','stage']);const box=state.inbox||emptyInbox(),source=box.sources.find(s=>s.id===sourceId),old=box.matches.find(m=>m.sourceId===sourceId);
 if(!source||!old)throw fail(404,'Source match unavailable');if(!box.recordings.some(r=>r.id===input.recordingId)||!box.workstreams.some(w=>w.id===input.workstreamId)||!inboxStages.includes(input.stage))throw fail(422,'Choose a current recording, workstream and planning stage');
 const match={...old,recordingId:input.recordingId,workstreamId:input.workstreamId,stage:input.stage,rationale:text(input.rationale,'match rationale',2000),revision:old.revision+1,updatedBy:actor.id,updatedAt:at};box.matches=box.matches.map(m=>m.id===old.id?match:m);return clone(match);
}
export function readInbox(state,input={}){
 exact(input,['sourceId','query','workstream','stage','recording']);const box=state.inbox||emptyInbox();if(input.query!==undefined&&(typeof input.query!=='string'||input.query.length>200))throw fail(400,'Search is too long');if(input.stage&&!inboxStages.includes(input.stage))throw fail(400,'Unknown inbox stage');
 const q=(input.query||'').toLowerCase().trim(),sources=box.sources.filter(s=>{const m=box.matches.find(m=>m.sourceId===s.id),r=box.recordings.find(r=>r.id===m?.recordingId);return (!input.workstream||m?.workstreamId===input.workstream)&&(!input.stage||m?.stage===input.stage)&&(!input.recording||m?.recordingId===input.recording)&&(!q||[s.title,s.creator,s.creatorHandle,r?.title].some(x=>x?.toLowerCase().includes(q)));}).sort((a,b)=>(b.observations.find(o=>o.metric==='views')?.value??-1)-(a.observations.find(o=>o.metric==='views')?.value??-1));
 return {revision:state.revision,total:box.sources.length,sources:clone(sources),recordings:clone(box.recordings),workstreams:clone(box.workstreams),matches:clone(box.matches),selected:clone(box.sources.find(s=>s.id===input.sourceId)||null)};
}
export function inboxReportSnapshot(state,sourceIds=[],matchRefs=[]){
 const box=state.inbox||emptyInbox();if(!Array.isArray(sourceIds)||sourceIds.length>64||new Set(sourceIds).size!==sourceIds.length||sourceIds.some(x=>typeof x!=='string'))throw fail(422,'Choose at most 64 distinct sources');if(!Array.isArray(matchRefs)||matchRefs.length>64||matchRefs.some(x=>!sourceIds.includes(x.sourceId)||typeof x.id!=='string'||!Number.isSafeInteger(x.revision)))throw fail(422,'Invalid proposed match selection');
 return sourceIds.map(id=>{const source=box.sources.find(s=>s.id===id);if(!source)throw fail(409,'Selected source is unavailable');const refs=matchRefs.filter(x=>x.sourceId===id);if(refs.length>1)throw fail(422,'Choose one proposed match per source');const match=refs.length?box.matches.find(m=>m.id===refs[0].id&&m.sourceId===id):null;if(refs.length&&(!match||match.revision!==refs[0].revision))throw fail(409,'Proposed match changed; inspect it before saving the report');return {source:clone(source),match:clone(match),recording:clone(box.recordings.find(r=>r.id===match?.recordingId)||null),workstream:clone(box.workstreams.find(w=>w.id===match?.workstreamId)||null)};});
}
