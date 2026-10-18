import {createDraftDestination,handoffReport} from './defiant-draft-handoff.js';
import {createHash} from 'node:crypto';
import {fail} from './auth.js';
import {exact as planningExact,annotationRecord,viewRecord,reportRecord,clusterRecord} from './defiant-strategy-notes.js';
import {demoData,normalizeIntake,assertReferences,projectGraph} from './defiant-strategy-data.js';
const clone=value=>structuredClone(value),hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const keyFor=id=>`defiant-strategy:${id}`;
const id=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value);
const exact=(body,keys)=>{if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!keys.includes(k)))throw fail(400,'Unsupported strategy command fields');};
function current(identity,actor,organizationId,founder=false){
 const user=identity?.users?.find(u=>u.id===actor?.id),organization=identity?.organizations?.find(o=>o.id===organizationId);
 if(!user||user.disabled===true||!['founder','marketer'].includes(user.role)||!organization||!identity.memberships?.some(m=>m.userId===user.id&&m.organizationId===organizationId)||(founder&&user.role!=='founder'))throw fail(403,'Current organization strategy permission required');
 return {user,organization};
}
function protectedOrganization(org){return org.id==='org_default'||org.brands?.some(b=>['brand_default','brand_vedic'].includes(b.id));}
const empty=(organizationId,actor,at)=>({schemaVersion:1,organizationId,enabled:true,revision:1,enabledBy:actor.id,enabledAt:at,graph:{nodes:[],edges:[],clusters:[]},evidence:[],observations:[],resources:[],annotations:[],views:[],reports:[],receipts:[]});
function dataOf(state){return {nodes:state.graph.nodes,edges:state.graph.edges,evidence:state.evidence,observations:state.observations,resources:state.resources};}
export class DefiantStrategyService {
 constructor({store,identity,organizationId,now=()=>new Date().toISOString()}){if(!store||!identity||!id(organizationId))throw Error('Strategy requires an explicit organization');Object.assign(this,{store,identity,organizationId,now,key:keyFor(organizationId)});}
 async authority(actor,founder=false){await this.identity.ready;return current(await this.store.get('identity'),actor,this.organizationId,founder);}
 async enable(actor,input){
  exact(input,[]);const {organization}=await this.authority(actor,true);if(protectedOrganization(organization))throw fail(403,'Use a separate organization for Defiant strategy');let result;
  await this.store.transact(['identity',this.key],([identity,state])=>{const {organization}=current(identity,actor,this.organizationId,true);if(protectedOrganization(organization))throw fail(403,'Publishing organizations cannot enable Defiant strategy');if(state&&state.organizationId!==this.organizationId)throw fail(409,'Stored strategy scope changed');state=state||empty(this.organizationId,actor,this.now());result={enabled:state.enabled===true,organizationId:this.organizationId,revision:state.revision};return [identity,state];});return result;
 }
 async raw(actor){
  await this.authority(actor);const state=await this.store.get(this.key);const {organization,user}=await this.authority(actor);
  if(!state?.enabled||state.organizationId!==this.organizationId||protectedOrganization(organization))throw fail(404,'Strategy is not enabled for this organization');
  const identity=await this.store.get('identity'),latest=current(identity,actor,this.organizationId);const membership=identity.memberships.find(m=>m.userId===user.id&&m.organizationId===this.organizationId);
  return {state,organization:latest.organization,membership};
 }
 async read(actor){
  const {state,organization,membership}=await this.raw(actor),{receipts,...publicState}=clone(state),nodes=publicState.graph.nodes.map(n=>({...n,sourceId:n.seedRef||n.id})),edges=publicState.graph.edges.map(e=>({...e,sourceId:e.seedRef||e.id}));
  return {...publicState,items:[...nodes,...edges,...publicState.graph.clusters],regions:nodes.filter(n=>n.kind==='region'),artists:nodes.filter(n=>n.kind==='artist'),corridors:edges.filter(e=>e.kind==='route'),resources:publicState.resources.map(r=>({...nodes.find(n=>n.id===r.nodeId),...r})),destinations:organization.brands.filter(b=>membership.brandIds.includes(b.id)&&!['brand_default','brand_vedic'].includes(b.id)).map(({id,name})=>({id,name,socialConnectionVerified:false}))};
 }

 async graph(actor,input={}){
  exact(input,['focusId','selectedId','query']);for(const k of ['focusId','selectedId'])if(input[k]!==undefined&&input[k]!==''&&(typeof input[k]!=='string'||input[k].length>128))throw fail(400,'Invalid graph selection');if(input.query!==undefined&&(typeof input.query!=='string'||input.query.length>200))throw fail(400,'Invalid graph search');return projectGraph(await this.read(actor),input);
 }
 intake(input){
  if(!['owned','demo'].includes(input.kind))throw fail(400,'Choose explicit owned intake or labeled demo');
  if(input.kind==='demo'){if(input.data!==undefined)throw fail(400,'Demo data is server-owned');return clone(demoData);}return normalizeIntake(input.data);
 }
 async preview(actor,input){
  exact(input,['kind','data']);const {state}=await this.raw(actor),incoming=this.intake(input),combined=this.combine(state,incoming);assertReferences(combined);
  return {expectedRevision:state.revision,kind:input.kind,data:incoming,counts:Object.fromEntries(Object.entries(incoming).map(([k,v])=>[k,v.length])),warnings:[input.kind==='demo'?'Example references only: metrics, relationships and rights are unverified.':'User-reported intake: source links are not fetched and rights are not verified.','Existing records and human annotations are preserved; changed existing IDs require a deliberate later edit.']};
 }
 combine(state,incoming){
  const before=dataOf(state),result={};for(const name of Object.keys(before)){const seen=new Map(before[name].map(row=>[row.id,row]));for(const row of incoming[name]){const old=seen.get(row.id);if(old&&hash(old)!==hash(row))throw fail(409,`Existing ${name} record changed; preserve its saved interpretation`);if(!old)seen.set(row.id,row);}result[name]=[...seen.values()];}return result;
 }
 async createDestination(actor,input){return createDraftDestination(this,actor,input);}
 async handoff(actor,reportId,input){return handoffReport(this,actor,reportId,input);}
 async saveCluster(actor,input){
  planningExact(input,['expectedRevision','idempotencyKey','cluster']);validatePlanningIntent(input);await this.authority(actor);const requestHash=hash({operation:'cluster',input});let result;
  await this.store.transact(['identity',this.key],([identity,state])=>{
   planningMember(identity,actor,this.organizationId);const replay=planningReceipt(state,actor,input,requestHash,this.organizationId);if(replay){result=replay;return [identity,state];}
   const record=clusterRecord(state,input.cluster,actor,this.now());state.graph.clusters=state.graph.clusters.filter(c=>c.id!==record.id);state.graph.clusters.push(record);result=planningAck(state,actor,input,requestHash,{cluster:record});return [identity,state];
  });return result;
 }
 async annotate(actor,input){
  planningExact(input,['expectedRevision','idempotencyKey','annotation']);validatePlanningIntent(input);await this.authority(actor);const requestHash=hash({operation:'annotation',input});let result;
  await this.store.transact(['identity',this.key],([identity,state])=>{
   planningMember(identity,actor,this.organizationId);const replay=planningReceipt(state,actor,input,requestHash,this.organizationId);if(replay){result=replay;return [identity,state];}
   const record=annotationRecord(state,input.annotation,actor,this.now());state.annotations=state.annotations.filter(a=>a.id!==record.id);state.annotations.push(record);result=planningAck(state,actor,input,requestHash,{annotation:record});return [identity,state];
  });return result;
 }
 async saveView(actor,input){
  planningExact(input,['expectedRevision','idempotencyKey','view']);validatePlanningIntent(input);await this.authority(actor);const requestHash=hash({operation:'view',input});let result;
  await this.store.transact(['identity',this.key],([identity,state])=>{
   planningMember(identity,actor,this.organizationId);const replay=planningReceipt(state,actor,input,requestHash,this.organizationId);if(replay){result=replay;return [identity,state];}
   const record=viewRecord(state,input.view,actor,this.now());state.views=state.views.filter(v=>v.id!==record.id);state.views.push(record);result=planningAck(state,actor,input,requestHash,{view:record});return [identity,state];
  });return result;
 }
 async saveReport(actor,input){
  planningExact(input,['expectedRevision','idempotencyKey','report']);validatePlanningIntent(input);await this.authority(actor);const requestHash=hash({operation:'report',input});let result;
  await this.store.transact(['identity',this.key],([identity,state])=>{
   planningMember(identity,actor,this.organizationId);const replay=planningReceipt(state,actor,input,requestHash,this.organizationId);if(replay){result=replay;return [identity,state];}
   const record=reportRecord(state,input.report,actor,this.now());state.reports=state.reports.filter(r=>r.id!==record.id);state.reports.push(record);result=planningAck(state,actor,input,requestHash,{report:record});return [identity,state];
  });return result;
 }
 async refreshReport(actor,reportId,input){
  planningExact(input,['expectedRevision','idempotencyKey','expectedReportRevision','planIds','annotationIds','viewId']);validatePlanningIntent(input);await this.authority(actor);const requestHash=hash({operation:'refresh-report',reportId,input});let result;
  await this.store.transact(['identity',this.key],([identity,state])=>{
   planningMember(identity,actor,this.organizationId);const replay=planningReceipt(state,actor,input,requestHash,this.organizationId);if(replay){result=replay;return [identity,state];}
   const {expectedRevision,idempotencyKey,...selection}=input,record=reportRecord(state,selection,actor,this.now(),{refreshId:reportId});state.reports=state.reports.filter(r=>r.id!==record.id);state.reports.push(record);result=planningAck(state,actor,input,requestHash,{report:record});return [identity,state];
  });return result;
 }

 async import(actor,input){
  exact(input,['kind','data','expectedRevision','idempotencyKey']);if(!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<1||typeof input.idempotencyKey!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(input.idempotencyKey))throw fail(400,'Saved revision and import request key required');
  await this.authority(actor);const incoming=this.intake(input),requestHash=hash(input);let result;
  await this.store.transact(['identity',this.key],([identity,state])=>{
   const {organization}=current(identity,actor,this.organizationId);if(!state?.enabled||protectedOrganization(organization)||state.organizationId!==this.organizationId)throw fail(404,'Strategy is not enabled');
   const prior=state.receipts.find(r=>r.id===input.idempotencyKey);if(prior){if(prior.actorId!==actor.id||prior.requestHash!==requestHash)throw fail(409,'Import request key belongs to different content');result=clone(prior.result);return [identity,state];}
   if(state.revision!==input.expectedRevision)throw fail(409,'Strategy changed; keep your import and preview the current workspace');if(state.receipts.length>=128)throw fail(429,'Strategy import receipt capacity reached; preserve prior requests');
   const data=this.combine(state,incoming);assertReferences(data);state.graph.nodes=data.nodes;state.graph.edges=data.edges;state.evidence=data.evidence;state.observations=data.observations;state.resources=data.resources;state.revision++;state.updatedAt=this.now();
   result={organizationId:this.organizationId,revision:state.revision,kind:input.kind,imported:Object.fromEntries(Object.entries(incoming).map(([k,v])=>[k,v.length]))};state.receipts.push({id:input.idempotencyKey,actorId:actor.id,requestHash,result:clone(result)});if(Buffer.byteLength(JSON.stringify(state))>2*1024*1024)throw fail(413,'Strategy workspace capacity reached');return [identity,state];
  });return result;
 }
}
export async function strategyOrganizations({store,identity,actor,organizations}){
 await identity.ready;const currentIdentity=await store.get('identity');const result=[];
 for(const org of organizations){const {user,organization}=current(currentIdentity,actor,org.id);const state=await store.get(keyFor(org.id));result.push({...org,strategy:{enabled:!protectedOrganization(organization)&&state?.organizationId===org.id&&state.enabled===true,canEnable:user.role==='founder'&&!protectedOrganization(organization)}});}
 const final=await store.get('identity');for(const org of result)current(final,actor,org.id);return result;
}

function validatePlanningIntent(input){if(!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<1||typeof input.idempotencyKey!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(input.idempotencyKey))throw fail(400,'Saved revision and planning request key required');}
function planningReceipt(state,actor,input,requestHash,organizationId){
 if(!state?.enabled||state.organizationId!==organizationId)throw fail(404,'Strategy is not enabled');
 const prior=state.receipts.find(r=>r.id===input.idempotencyKey);if(prior){if(prior.actorId!==actor.id||prior.requestHash!==requestHash)throw fail(409,'Planning request key belongs to different content');return clone(prior.result);}
 if(state.revision!==input.expectedRevision)throw fail(409,'Strategy changed; keep your text and compare the latest saved version');if(state.receipts.length>=128)throw fail(429,'Planning receipt capacity reached; prior intents are preserved');return null;
}
function planningAck(state,actor,input,requestHash,record){
 state.revision++;const result={organizationId:state.organizationId,revision:state.revision,...clone(record)};state.receipts.push({id:input.idempotencyKey,actorId:actor.id,requestHash,result:clone(result)});if(Buffer.byteLength(JSON.stringify(state))>2*1024*1024)throw fail(413,'Strategy workspace capacity reached; prior work is preserved');return result;
}

function planningMember(identity,actor,organizationId){const context=current(identity,actor,organizationId);if(protectedOrganization(context.organization))throw fail(403,'Publishing organizations cannot save Defiant planning records');return context;}
