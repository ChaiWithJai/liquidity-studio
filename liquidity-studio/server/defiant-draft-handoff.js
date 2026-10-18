// Deliberate draft destinations and report handoff; never changes publishing defaults.
import {createHash} from 'node:crypto';
import {neutralBrandKit} from './neutral-brand-kit.js';
import {fail} from './auth.js';
import {exact} from './defiant-strategy-notes.js';
import {scopeKey} from './repository.js';
import {assertRestoreAvailable} from './restore-gate.js';
const clone=x=>structuredClone(x),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function stableId(value){const h=hash(value);return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;}
function intent(input){if(!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<1||typeof input.idempotencyKey!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(input.idempotencyKey))throw fail(400,'Saved revision and request key required');}
function member(identity,state,actor,orgId,founder=false){
 const user=identity?.users?.find(u=>u.id===actor?.id),organization=identity?.organizations?.find(o=>o.id===orgId),membership=identity?.memberships?.find(m=>m.userId===actor?.id&&m.organizationId===orgId);
 if(!user||user.disabled||!['founder','marketer'].includes(user.role)||founder&&user.role!=='founder'||!membership)throw fail(403,'Current strategy permission required');
 if(!organization||organization.id==='org_default'||organization.brands.some(b=>['brand_default','brand_vedic'].includes(b.id))||!state?.enabled||state.organizationId!==orgId)throw fail(404,'Strategy workspace unavailable');return {organization,membership};
}
function replay(state,actor,input,requestHash){const prior=state.receipts.find(r=>r.id===input.idempotencyKey);if(prior){if(prior.actorId!==actor.id||prior.requestHash!==requestHash)throw fail(409,'Request key belongs to different content');return clone(prior.result);}if(state.revision!==input.expectedRevision)throw fail(409,'Strategy changed; preserve your draft and compare the saved report');if(state.receipts.length>=128)throw fail(429,'Strategy request capacity reached');return null;}
function ack(state,actor,input,requestHash,value){state.revision++;const result={organizationId:state.organizationId,revision:state.revision,...value};state.receipts.push({id:input.idempotencyKey,actorId:actor.id,requestHash,result:clone(result)});if(Buffer.byteLength(JSON.stringify(state))>2*1024*1024)throw fail(413,'Strategy workspace capacity reached');return result;}
function emptyDestination(id,name){return {schemaVersion:1,brandProfile:{id,brandName:name,contentDomain:'general',logoText:'',websiteUrl:'',tagline:'',mission:'',...neutralBrandKit(),ExportFormats:[]},backlog:[],telemetry:{traces:[],batchJobs:[],backpropDataset:[]},jobs:[],assets:[],preflights:[],usage:[]};}
export async function createDraftDestination(service,actor,input){
 exact(input,['expectedRevision','idempotencyKey','name']);intent(input);if(typeof input.name!=='string'||!input.name.trim()||input.name.length>200)throw fail(422,'Name the draft destination');await service.authority(actor,true);
 const brandId=stableId({operation:'defiant-destination',organizationId:service.organizationId,actorId:actor.id,key:input.idempotencyKey}),key=scopeKey({organizationId:service.organizationId,brandId}),requestHash=hash({operation:'destination',input});let result;
 await service.store.transact(['identity',service.key,key],([identity,state,scope])=>{
  const {organization,membership}=member(identity,state,actor,service.organizationId,true),prior=replay(state,actor,input,requestHash);if(prior){if(!scope||!organization.brands.some(b=>b.id===brandId)||!membership.brandIds.includes(brandId))throw fail(403,'Current destination permission required');assertRestoreAvailable(scope);result=prior;return [identity,state,scope];}
  if(scope||organization.brands.some(b=>b.id===brandId))throw fail(409,'Destination already exists outside this request');const brand={id:brandId,name:input.name.trim()};organization.brands.push(brand);membership.brandIds.push(brandId);scope=emptyDestination(brandId,brand.name);
  result=ack(state,actor,input,requestHash,{destination:{...brand,socialConnectionVerified:false}});return [identity,state,scope];
 });return result;
}
export async function handoffReport(service,actor,reportId,input){
 exact(input,['expectedRevision','idempotencyKey','expectedReportRevision','destinationId','objective','deliverables']);intent(input);if(typeof input.objective!=='string'||!input.objective.trim()||input.objective.length>2000||!Array.isArray(input.deliverables)||!input.deliverables.length||input.deliverables.length>16||input.deliverables.some(d=>typeof d!=='string'||!d.trim()||d.length>300)||new Set(input.deliverables.map(d=>d.trim())).size!==input.deliverables.length)throw fail(422,'Choose an objective and distinct proposed deliverables');if(!Number.isSafeInteger(input.expectedReportRevision)||input.expectedReportRevision<1||typeof input.destinationId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(input.destinationId))throw fail(400,'Choose a destination and saved report revision');await service.authority(actor);
 const key=scopeKey({organizationId:service.organizationId,brandId:input.destinationId}),requestHash=hash({operation:'report-handoff',reportId,input});let result;
 await service.store.transact(['identity',service.key,key],([identity,state,scope])=>{
  const {organization,membership}=member(identity,state,actor,service.organizationId);if(!organization.brands.some(b=>b.id===input.destinationId)||!membership.brandIds.includes(input.destinationId))throw fail(403,'Current destination permission required');if(!scope)throw fail(409,'Open or create this draft destination before handoff');assertRestoreAvailable(scope);
  const prior=replay(state,actor,input,requestHash);if(prior){result=prior;return [identity,state,scope];}
  const report=state.reports.find(r=>r.id===reportId);if(!report)throw fail(404,'Saved report unavailable');if(report.revision!==input.expectedReportRevision)throw fail(409,'Report changed; compare before creating a draft');if(!Array.isArray(scope.backlog)||scope.backlog.length>=1000)throw fail(429,'Draft destination capacity reached');
  const {history,...snapshot}=report,at=service.now(),story={id:stableId({operation:'defiant-draft',organizationId:service.organizationId,actorId:actor.id,key:input.idempotencyKey}),title:report.title,category:'Strategy brief',audienceTag:'Unspecified',trendBadge:'Source review required',status:'In Backlog',reviewStatus:'unreviewed',scheduledDay:null,scheduleSchemaVersion:1,sourceClaims:[],verifiedFacts:[],campaignDraft:null,revision:1,contentRevision:1,draftBrief:{kind:'defiant-report',organizationId:service.organizationId,reportId,reportRevision:report.revision,sourceRevision:report.sourceRevision,createdBy:actor.id,createdAt:at,objective:input.objective.trim(),deliverables:input.deliverables.map(d=>d.trim()),reviewRequired:true,report:clone(snapshot)}};
  if(scope.backlog.some(s=>s.id===story.id))throw fail(409,'Draft already exists outside this request');scope.backlog.unshift(story);if(Buffer.byteLength(JSON.stringify(scope))>2*1024*1024)throw fail(413,'Draft destination capacity reached');
  result=ack(state,actor,input,requestHash,{draft:{id:story.id,title:story.title,organizationId:service.organizationId,brandId:input.destinationId,reportId,reportRevision:report.revision,reviewRequired:true}});return [identity,state,scope];
 });return result;
}
