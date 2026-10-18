import { randomUUID } from 'node:crypto';
import { fail } from './auth.js';
import { getApprovedClaims } from './source-integrity.js';
import { exact, text, revision, validateQuery, hash, FORMATS, DAYS } from './workspace-schema.js';
export function storyRow(story,state){
 const assignments=(state.workspace?.assignments||[]).filter(item=>!item.deletedAt&&item.storyId===story.id);
 let sourceReadiness='blocked';try{getApprovedClaims(story);sourceReadiness='ready';}catch{}
 const exports=state.assets.filter(item=>item.storyId===story.id);
 return {id:story.id,title:story.title,category:story.category,status:story.status,revision:story.revision,sourceReadiness,assigneeId:story.assigneeId||null,formats:FORMATS.filter(format=>story.campaignDraft?.[format]),plannedDate:assignments.map(item=>item.date).sort()[0]||null,assignments,legacyWeekday:story.scheduleSchemaVersion!==1&&DAYS.includes(story.scheduledDay)?story.scheduledDay:null,exportStatus:exports.length?'exported':'not_exported',exportedAt:exports.map(item=>item.createdAt).sort().at(-1)||null,exportCount:exports.length};
}
export function queryStories(state,scope,input={}){
 const query=validateQuery(input);let rows=state.backlog.map(story=>storyRow(story,state));const total=rows.length;const f=query.filters;
 rows=rows.filter(row=>(!f.search||(row.title+' '+row.category).toLowerCase().includes(f.search.toLowerCase()))&&(!f.statuses?.length||f.statuses.includes(row.status))&&(!f.assigneeIds?.length||f.assigneeIds.includes(row.assigneeId))&&(!f.formats?.length||f.formats.some(format=>row.formats.includes(format)))&&(!f.sourceReadiness||f.sourceReadiness==='any'||row.sourceReadiness===f.sourceReadiness)&&(f.exported===undefined||(row.exportStatus==='exported')===f.exported)&&(!f.dateFrom||row.assignments.some(item=>item.date>=f.dateFrom&&(!f.dateTo||item.date<=f.dateTo)))&&(!f.dateTo||row.assignments.some(item=>item.date<=f.dateTo&&(!f.dateFrom||item.date>=f.dateFrom))));
 rows.sort((a,b)=>{for(const item of query.sort){const left=a[item.field]??'',right=b[item.field]??'';const order=typeof left==='number'&&typeof right==='number'?left-right:String(left).localeCompare(String(right));if(order)return item.direction==='desc'?-order:order;}return a.id.localeCompare(b.id);});
 const groups={};if(query.groupBy)for(const row of rows){const key=String(row[query.groupBy]??'Unassigned');groups[key]=(groups[key]||0)+1;}
 const {cursor,...definition}=query;const queryRevision=hash({scope,definition,rows});let offset=0;
 if(cursor){let parsed;try{parsed=JSON.parse(Buffer.from(cursor,'base64url').toString());}catch{throw fail(400,'Invalid query cursor');}exact(parsed,['offset','queryRevision']);if(!Number.isInteger(parsed.offset)||parsed.offset<0||parsed.offset>rows.length)throw fail(400,'Invalid query offset');if(parsed.queryRevision!==queryRevision)throw fail(409,'Stories changed; restart this query');offset=parsed.offset;}
 const next=offset+query.limit;
 return {schemaVersion:1,rows:rows.slice(offset,next),total,filteredTotal:rows.length,groups:Object.entries(groups).map(([key,count])=>({key,count})),queryRevision,nextCursor:next<rows.length?Buffer.from(JSON.stringify({offset:next,queryRevision})).toString('base64url'):null,definition};
}
const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export function idempotencyKey(value){if(!uuid(value))throw fail(400,'A UUIDv4 idempotency key is required');return value;}
export class WorkspaceViews {
 constructor(service){this.service=service;this.key=`workspace-views:${service.scope.organizationId}:${service.scope.brandId}`;}
 visible(view,actor){return view.sharing==='brand'||view.ownerId===actor.id;}
 async list(actor){await this.service.authorize(actor);return ((await this.service.store.get(this.key))?.views||[]).filter(view=>!view.deletedAt&&this.visible(view,actor));}
 async write(actor,id,action,input){
  await this.service.authorize(actor);exact(input,['create','update'].includes(action)?['idempotencyKey','expectedRevision','name','sharing','definition']:['idempotencyKey','expectedRevision']);idempotencyKey(input.idempotencyKey);
  const requestHash=hash({id,action,input}),newId=randomUUID(),now=new Date().toISOString();let result;
  await this.service.store.update(this.key,state=>{
   state ||= {views:[],receipts:[]};const old=state.receipts.find(item=>item.key===input.idempotencyKey);
   if(old){if(old.actorId!==actor.id||old.requestHash!==requestHash)throw fail(409,'Idempotency key was used for another view action');result=old.result;return state;}
   let view;
   if(action==='create'){
    if(state.views.filter(item=>!item.deletedAt).length>=100)throw fail(422,'Workspace view limit reached');
    view={id:newId,ownerId:actor.id,name:'',sharing:'personal',definition:validateQuery({}),revision:0,deletedAt:null};
   }else{
    view=state.views.find(item=>item.id===id);
    if(!view||!this.visible(view,actor))throw fail(404,'View not found');
    if(view.ownerId!==actor.id&&actor.role!=='founder')throw fail(403,'Only the view owner or brand founder can edit shared views');
    if(revision(input.expectedRevision)!==view.revision)throw fail(409,'View changed; reload before editing');
    view=structuredClone(view);
   }
   if(['create','update'].includes(action)){
    if(view.deletedAt)throw fail(409,'Restore the view before editing');
    if(input.name!==undefined)view.name=text(input.name,'view name',120);
    if(!view.name)throw fail(400,'View name required');
    if(input.sharing!==undefined){if(!['personal','brand'].includes(input.sharing))throw fail(400,'Invalid view sharing scope');if(input.sharing==='personal'&&view.ownerId!==actor.id)throw fail(403,'Only the owner can make a shared view personal');view.sharing=input.sharing;}
    if(input.definition!==undefined){const normalized=validateQuery(input.definition);if(normalized.cursor)throw fail(400,'A view cannot save a page cursor');delete normalized.cursor;view.definition=normalized;}
   }else if(action==='delete')view.deletedAt=now;else if(action==='restore')view.deletedAt=null;else throw fail(400,'Unknown view action');
   view.revision++;view.updatedAt=now;const index=state.views.findIndex(item=>item.id===view.id);if(index<0)state.views.push(view);else state.views[index]=view;
   result=structuredClone(view);state.receipts.push({key:input.idempotencyKey,actorId:actor.id,requestHash,result});state.receipts=state.receipts.slice(-100);return state;
  });return result;
 }
}
