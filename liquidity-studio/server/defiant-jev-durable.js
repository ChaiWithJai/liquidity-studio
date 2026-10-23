import {createHash} from 'node:crypto';
import {createClaimEvaluation} from './defiant-jev-evaluation.js';
const sha=v=>createHash('sha256').update(v).digest('hex');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const id=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}(?![\s\S])/.test(v);
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}(?![\s\S])/.test(v);
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const copy=v=>structuredClone(v);
const iso=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z(?![\s\S])/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString()===v;
const VERSION='earnings-claim-exact-v1';
/** No HTTP mount here. Account experiment identity must be constructor-owned and shared across replicas. */
export function createDurableClaimEvaluations({store,strategy,authorizeCurrent,pack,adapter,accountExperimentId,evaluatorConfigSha256,now=()=>new Date().toISOString()}={}){
 if(!store?.transact||!strategy?.assertCurrent||!strategy?.raw||typeof authorizeCurrent!=='function'||typeof pack?.get!=='function'||typeof pack?.resolve!=='function'||!hash(pack.sha256)||pack.organizationId!==strategy.organizationId||!id(accountExperimentId)||!hash(evaluatorConfigSha256)||!adapter?.decide||typeof now!=='function')throw TypeError('Scoped evaluation dependencies required');
 const packSha256=pack.sha256,getCase=pack.get.bind(pack),resolveCase=pack.resolve.bind(pack),decisionAdapter=Object.freeze({decide:adapter.decide.bind(adapter)});
 const org=strategy.organizationId,accountKey=`defiant-evaluations:v1:account:${accountExperimentId}`,indexKey=`defiant-evaluations:v1:${org}:index`;
 const recordKey=recordId=>`defiant-evaluations:v1:${org}:${recordId}`;
 function checkedIndex(index){
  index=index||{schemaVersion:1,organizationId:org,entries:[]};
  if(!exact(index,['schemaVersion','organizationId','entries'])||index.schemaVersion!==1||index.organizationId!==org||!Array.isArray(index.entries)||index.entries.length>100||index.entries.some(e=>!exact(e,['recordId','createdAt','caseId'])||!hash(e.recordId)||!iso(e.createdAt)||!id(e.caseId))||new Set(index.entries.map(e=>e.recordId)).size!==index.entries.length)throw fail(409,'Evaluation index unavailable');
  return index;
 }
 async function current(actor){
  const next=await authorizeCurrent(actor);
  if(!next||next.id!==actor.id||!next.uid||next.uid!==actor.uid)throw fail(403,'Evaluation account changed');
  await strategy.raw(next);return next;
 }
 function checked(identity,state,actor){strategy.assertCurrent(identity,state,actor);}
 function result(record){return copy(record);}
 return Object.freeze({async evaluate(inputActor,input){
  if(!exact(input,['caseId','idempotencyKey'])||!id(input.caseId)||!id(input.idempotencyKey)||!id(inputActor?.id)||typeof inputActor.uid!=='string'||!inputActor.uid||inputActor.uid.length>128)throw fail(400,'Invalid evaluation request');
  const actor=Object.freeze({...inputActor}),request=copy(input);await current(actor);
  const recordId=sha(JSON.stringify([org,actor.id,actor.uid,request.idempotencyKey]));
  const payloadHash=sha(JSON.stringify({caseId:request.caseId,packSha256,accountExperimentId,evaluatorConfigSha256,deterministicVersion:VERSION,evaluatorVersion:'defiant-claim-decisions-v1'}));
  const createdAt=now();if(!iso(createdAt))throw fail(503,'Evaluation clock unavailable');
  const keys=['identity',strategy.key,accountKey,indexKey,recordKey(recordId)];
  let acquired=false;
  const reserved=await store.transact(keys,([identity,state,budget,index,record])=>{
   checked(identity,state,actor);
   if(record){if(record.payloadHash!==payloadHash||record.actorId!==actor.id||record.actorUid!==actor.uid||record.organizationId!==org)throw fail(409,'Evaluation key already used');acquired=false;return [identity,state,budget,index,record];}
   getCase(request.caseId);
   budget=budget||{schemaVersion:1,accountExperimentId,maximumAttempts:1,attempts:[]};
   if(!exact(budget,['schemaVersion','accountExperimentId','maximumAttempts','attempts'])||budget.schemaVersion!==1||budget.accountExperimentId!==accountExperimentId||budget.maximumAttempts!==1||!Array.isArray(budget.attempts)||budget.attempts.length>1)throw fail(409,'Evaluation budget unavailable');
   if(budget.attempts.length===1)throw fail(409,'Evaluation attempt capacity reached');
   index=checkedIndex(index);
   if(index.entries.length>=100)throw fail(409,'Evaluation index unavailable');
   const candidate={schemaVersion:1,recordId,organizationId:org,actorId:actor.id,actorUid:actor.uid,createdAt,payloadHash,caseId:request.caseId,packSha256,accountExperimentId,evaluatorConfigSha256,status:'reserved',evaluation:null,qualification:'One account attempt reserved; pending or uncertain completion never authorizes automatic retry.'};
   acquired=true;return [identity,state,{...budget,attempts:[{recordId,organizationId:org,createdAt}]},{...index,entries:[...index.entries,{recordId,createdAt,caseId:request.caseId}]},candidate];
  });
  if(!acquired){await current(actor);return result(reserved[4]);}
  async function finish(evaluation,status){
   await current(actor);
   if(evaluation!==null&&Buffer.byteLength(JSON.stringify(evaluation))>65536)throw fail(413,'Evaluation result too large');
   const values=await store.transact(keys,([identity,state,budget,index,record])=>{
    checked(identity,state,actor);
    if(!record||record.payloadHash!==payloadHash||record.actorUid!==actor.uid||record.organizationId!==org||budget?.attempts?.length!==1||budget.attempts[0].recordId!==recordId)throw fail(409,'Evaluation reservation changed');
    if(record.status!=='reserved')return [identity,state,budget,index,record];
    return [identity,state,budget,index,{...record,status,evaluation}];
   });await current(actor);return result(values[4]);
  }
  try{
   await current(actor);const prepared=await resolveCase(actor,request.caseId);await current(actor);
   let completed;
   const evaluation=createClaimEvaluation({manifest:[prepared.ref],authorize:async ctx=>{if(ctx.organizationId!==org||ctx.actorId!==actor.id)throw fail(403,'Evaluation scope changed');await current(actor);},resolveCase:async()=>prepared.state,deterministicCheck:async()=>prepared.deterministic,deterministicVersion:VERSION,adapter:decisionAdapter,createId:()=>recordId,now,persistRecord:async record=>{completed=await finish(record,'completed');}});
   await evaluation.evaluate({organizationId:org,actorId:actor.id},{caseId:request.caseId});
   return completed;
  }catch(error){
   // No automatic retry after reservation: the provider may already have billed a request.
   await current(actor);
   const terminal=await finish(null,'indeterminate');
   if(terminal.status==='completed')return terminal;
   if([400,403,404,409,413].includes(error?.status))throw fail(error.status,'Evaluation unavailable; reserved attempt retained');
   return terminal;
  }
 },async list(inputActor){
  if(!id(inputActor?.id)||typeof inputActor.uid!=='string'||!inputActor.uid)throw fail(400,'Invalid evaluation actor');
  const actor=Object.freeze({...inputActor});await current(actor);
  const values=await store.transact(['identity',strategy.key,indexKey],([identity,state,index])=>{checked(identity,state,actor);index=checkedIndex(index);return [identity,state,index];});await current(actor);return {organizationId:org,items:copy(values[2].entries)};
 },async detail(inputActor,recordId){
  if(!hash(recordId)||!id(inputActor?.id)||typeof inputActor.uid!=='string'||!inputActor.uid)throw fail(400,'Invalid evaluation reference');
  const actor=Object.freeze({...inputActor});await current(actor);
  const values=await store.transact(['identity',strategy.key,recordKey(recordId)],([identity,state,record])=>{checked(identity,state,actor);if(!record||record.organizationId!==org)throw fail(404,'Evaluation unavailable');return [identity,state,record];});await current(actor);return result(values[2]);
 }});
}
