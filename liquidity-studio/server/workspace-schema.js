import { createHash } from 'node:crypto';
import { fail } from './auth.js';
export const FORMATS = ['infographic','carousel','story','reel'];
export const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const COLUMNS = ['title','category','status','sourceReadiness','assigneeId','formats','plannedDate','exportStatus','revision'];
export const SORT_FIELDS = ['title','category','status','revision','plannedDate','assigneeId','exportedAt'];
export const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function exact(value, fields) {
 if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key=>!fields.includes(key))) throw fail(400,'Unknown workspace field');
}
export function text(value, name, max=300) { if(typeof value!=='string'||!value.trim()||value.length>max)throw fail(400,`Invalid ${name}`);return value.trim(); }
export function revision(value) { if(!Number.isSafeInteger(value)||value<0)throw fail(400,'Expected revision is required');return value; }
export function localDate(value) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw fail(400,'Use an explicit YYYY-MM-DD local date');
 const [y,m,d]=value.split('-').map(Number),date=new Date(0);date.setUTCFullYear(y,m-1,d);date.setUTCHours(0,0,0,0);
 if(y<1||date.toISOString().slice(0,10)!==value)throw fail(400,'Invalid local date');return value;
}
export function timeZone(value) { try { if(typeof value!=='string'||value.length>100)throw Error();return new Intl.DateTimeFormat('en',{timeZone:value}).resolvedOptions().timeZone; }catch{throw fail(400,'Use a valid IANA timezone');} }
export function bucketId(date,zone){return Buffer.from(JSON.stringify([zone,date])).toString('base64url');}
export function emptyWorkspace(){return {schemaVersion:1,assignments:[],buckets:{},receipts:[],events:[]};}
export function workspace(state){return state.workspace ||= emptyWorkspace();}
export function validateQuery(input={}) {
 exact(input,['filters','sort','groupBy','columns','limit','cursor']);
 const filters=input.filters||{};exact(filters,['search','statuses','sourceReadiness','assigneeIds','formats','dateFrom','dateTo','exported']);
 if(filters.search!==undefined&&(typeof filters.search!=='string'||filters.search.length>500))throw fail(400,'Invalid search');
 for(const field of ['statuses','assigneeIds','formats'])if(filters[field]!==undefined&&(!Array.isArray(filters[field])||filters[field].length>30||filters[field].some(value=>typeof value!=='string'&&!(field==='assigneeIds'&&value===null))))throw fail(400,'Invalid filter values');
 if(filters.formats?.some(format=>!FORMATS.includes(format)))throw fail(400,'Unsupported format filter');
 if(filters.sourceReadiness!==undefined&&!['ready','blocked','any'].includes(filters.sourceReadiness))throw fail(400,'Invalid review readiness filter');
 if(filters.exported!==undefined&&typeof filters.exported!=='boolean')throw fail(400,'Invalid export filter');
 if(filters.dateFrom)localDate(filters.dateFrom);if(filters.dateTo)localDate(filters.dateTo);
 if(filters.dateFrom&&filters.dateTo&&filters.dateFrom>filters.dateTo)throw fail(400,'Invalid date range');
 const sort=input.sort||[{field:'title',direction:'asc'}];
 if(!Array.isArray(sort)||sort.length>3||sort.some(item=>{exact(item,['field','direction']);return !SORT_FIELDS.includes(item.field)||!['asc','desc'].includes(item.direction)}))throw fail(400,'Invalid sort');
 const columns=input.columns||COLUMNS;
 if(!Array.isArray(columns)||!columns.length||columns.length>COLUMNS.length||new Set(columns).size!==columns.length||columns.some(column=>!COLUMNS.includes(column)))throw fail(400,'Invalid columns');
 if(input.groupBy!==undefined&&input.groupBy!==null&&!['status','sourceReadiness','assigneeId','plannedDate'].includes(input.groupBy))throw fail(400,'Invalid grouping');
 const limit=input.limit??50;if(!Number.isInteger(limit)||limit<1||limit>100)throw fail(400,'Page size must be 1 to 100');
 if(input.cursor!==undefined&&(typeof input.cursor!=='string'||input.cursor.length>1000))throw fail(400,'Invalid query cursor');
 return {filters:{...filters,search:filters.search?.trim()||''},sort,columns,groupBy:input.groupBy||null,limit,cursor:input.cursor};
}
export function portableWorkspace(value,storyIds,scope,{remapTo}={}) {
 if(value===undefined)return undefined;
 exact(value,['schemaVersion','assignments','buckets','events']);
 if(value.schemaVersion!==1||!Array.isArray(value.assignments)||value.assignments.length>1000||!value.buckets||typeof value.buckets!=='object'||Array.isArray(value.buckets)||!Array.isArray(value.events)||value.events.length>500)throw fail(400,'Invalid portable workspace');
 const copy=structuredClone(value),ids=new Set();
 for(const item of copy.assignments){
  exact(item,['id','storyId','unit','format','date','timeZone','revision','organizationId','brandId','deletedAt']);
  if(typeof item.id!=='string'||ids.has(item.id)||!storyIds.has(item.storyId)||item.organizationId!==scope.organizationId||item.brandId!==scope.brandId||!['campaign','format'].includes(item.unit)||(item.unit==='campaign'?item.format!==null:!FORMATS.includes(item.format)))throw fail(400,'Orphaned or foreign portable assignment');
  ids.add(item.id);localDate(item.date);if(timeZone(item.timeZone)!==item.timeZone)throw fail(400,'Use canonical portable timezone');revision(item.revision);if(item.deletedAt!==null&&(typeof item.deletedAt!=='string'||!Number.isFinite(Date.parse(item.deletedAt))))throw fail(400,'Invalid assignment tombstone');
  if(remapTo){item.organizationId=remapTo.organizationId;item.brandId=remapTo.brandId;}
 }
 const active=copy.assignments.filter(item=>!item.deletedAt);if(new Set(active.map(item=>JSON.stringify([item.storyId,item.unit,item.format]))).size!==active.length)throw fail(400,'Duplicate portable assignment unit');const placed=new Set();
 for(const [key,bucket] of Object.entries(copy.buckets)){
  exact(bucket,['date','timeZone','revision','assignmentIds']);localDate(bucket.date);timeZone(bucket.timeZone);revision(bucket.revision);
  if(key!==bucketId(bucket.date,bucket.timeZone)||!Array.isArray(bucket.assignmentIds)||bucket.assignmentIds.some(id=>{const assignment=active.find(item=>item.id===id);if(!assignment||placed.has(id)||assignment.date!==bucket.date||assignment.timeZone!==bucket.timeZone)return true;placed.add(id);return false;}))throw fail(400,'Invalid portable calendar ordering');
 }
 if(placed.size!==active.length)throw fail(400,'Portable calendar has orphaned assignments');
 for(const event of copy.events){exact(event,['id','operationId','actorId','createdAt','action','storyIds']);if(!Array.isArray(event.storyIds)||event.storyIds.some(id=>!storyIds.has(id))||typeof event.actorId!=='string'||typeof event.action!=='string')throw fail(400,'Invalid portable workspace history');}
 return {...copy,receipts:[]};
}
