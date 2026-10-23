import {randomUUID} from 'node:crypto';
import {canonicalMetadata,sha256,SEMANTIC_MODEL} from './defiant-semantic-index.js';
import {searchRetainedSources,validateRetainedSourceRequest} from './defiant-retained-sources.js';
const fail=(status,message)=>Object.assign(new Error(message),{status});
const hash=v=>typeof v==='string'&&v.length===64&&/^[a-f0-9]+$/.test(v);
const id=v=>typeof v==='string'&&v.length>0&&v.length<=128&&/^[A-Za-z0-9_-]+$(?![\s\S])/.test(v);
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const BUDGET='defiant-semantic:v1:pilot-budget';
const TTL=15*60*1000;
/** Durable reservations are never refunded or retried, including ambiguous provider failures.
 * readContext rechecks live credential + membership and returns current normalized snapshot/index.
 * assertCurrent must synchronously validate identity/strategy in every retryable transaction.
 */
export function createSemanticSessions({store,strategy,readContext,embed,signal,now=()=>Date.now()}={}){
 if(typeof store?.transact!=='function'||typeof strategy?.assertCurrent!=='function'||typeof readContext!=='function'||typeof embed!=='function'||!id(strategy.organizationId))throw TypeError('Scoped durable semantic dependencies required');
 const org=strategy.organizationId,recordKey=sessionId=>`defiant-semantic:v1:${org}:${sessionId}`;
 const active=()=>{if(signal?.aborted)throw fail(408,'Semantic request expired; reserved attempt may have completed');};
 async function context(actor){active();const c=await readContext(actor);active();if(!c||c.actor?.id!==actor.id||c.actor?.uid!==actor.uid||c.snapshot?.organizationId!==org||c.index?.organizationId!==org||!hash(c.snapshot.revision)||!hash(c.index.indexSha256))throw fail(503,'Semantic metadata index unavailable');return c;}
 function authority(identity,state,actor){active();strategy.assertCurrent(identity,state,actor);}
 async function transaction(actor,sessionId,callback){return store.transact(['identity',strategy.key,BUDGET,recordKey(sessionId)],values=>{authority(values[0],values[1],actor);return callback(values);});}
 function publicPage(c,record,offset,limit){
  if(record.status!=='complete')throw fail(409,'Semantic attempt pending or failed; no automatic retry');
  if(record.expiresAt<=now())throw fail(409,'Semantic session expired; explicitly submit a new search');
  if(record.revision!==c.snapshot.revision||record.indexSha256!==c.index.indexSha256)throw fail(409,'Semantic evidence context changed');
  const rows=[];for(let offset=0;offset<256;offset+=100){const p=searchRetainedSources(c.snapshot,{...record.filters,query:'',offset,limit:100});rows.push(...p.items);if(p.nextOffset===null)break;}
  const byId=new Map(rows.map(r=>[r.id,r]));if(record.ranked.some(r=>!byId.has(r.id)))throw fail(503,'Semantic results unavailable');
  return {schemaVersion:1,scope:{organizationId:org},revision:record.revision,availability:true,mode:'semantic',sessionId:record.sessionId,expiresAt:new Date(record.expiresAt).toISOString(),indexSha256:record.indexSha256,registerSha256:c.index.registerSha256,...SEMANTIC_MODEL,querySha256:record.querySha256,filters:record.filters,offset,limit,total:record.ranked.length,items:record.ranked.slice(offset,offset+limit).map(r=>({...byId.get(r.id),similarity:r.similarity})),nextOffset:offset+limit<record.ranked.length?offset+limit:null,tokenCount:record.tokenCount,limitations:['Metadata similarity is a ranking signal, not factual support, identity, calibrated confidence or commercial readiness.','Exact filters are applied before ranking. No similarity threshold establishes that a query is supported.','Paging and readback reuse this expiring authorized session; no automatic model retry or hidden embedding.']};
 }
 return Object.freeze({
 async start(actor,input){
  if(!exact(input,['revision','query','filters','idempotencyKey'])||!hash(input.revision)||!id(input.idempotencyKey)||typeof input.query!=='string'||!input.query.trim()||input.query.length>200||Buffer.byteLength(input.query)>1536||/[\u0000-\u001f\u007f]/.test(input.query)||!input.filters||Object.getPrototypeOf(input.filters)!==Object.prototype||Object.keys(input.filters).some(k=>!['sourceId','format','kind','sourceHash','fromMonth','toMonth','periodPresence'].includes(k)))throw fail(400,'Invalid explicit semantic search');
  validateRetainedSourceRequest({...input.filters,query:''});if(!id(actor?.id)||!id(actor?.uid))throw fail(403,'Semantic identity unavailable');
  const frozenActor=Object.freeze({...actor}),payload=structuredClone(input),payloadHash=sha256(canonicalMetadata(payload)),sessionId=sha256(canonicalMetadata([org,actor.id,actor.uid,payload.idempotencyKey])),createdAt=now(),expiresAt=createdAt+TTL,owner=randomUUID();
  let c=await context(frozenActor);if(c.snapshot.revision!==payload.revision)throw fail(409,'Evidence revision changed');
  const reservation={schemaVersion:1,organizationId:org,actorId:frozenActor.id,actorUid:frozenActor.uid,sessionId,payloadHash,querySha256:sha256(payload.query),filters:payload.filters,revision:payload.revision,indexSha256:c.index.indexSha256,createdAt,expiresAt,owner,status:'pending'};
  const values=await transaction(frozenActor,sessionId,([identity,state,budget,prior])=>{
   if(prior){if(prior.payloadHash!==payloadHash)throw fail(409,'Semantic idempotency conflict');return [identity,state,budget,prior];}
   budget=budget||{schemaVersion:1,reservations:0};if(budget.schemaVersion!==1||!Number.isInteger(budget.reservations)||budget.reservations<0||budget.reservations>=100)throw fail(409,'Pilot semantic query capacity reached');
   return [identity,state,{...budget,reservations:budget.reservations+1},reservation];
  });
  if(values[3].status==='complete'){c=await context(frozenActor);return publicPage(c,values[3],0,25);}
  if(values[3].owner!==owner||values[3].status!=='pending')throw fail(409,'Semantic attempt already reserved; read its session');
  try{
   c=await context(frozenActor);if(c.snapshot.revision!==reservation.revision||c.index.indexSha256!==reservation.indexSha256)throw fail(409,'Evidence context changed');
   if(now()>=reservation.expiresAt)throw fail(409,'Semantic reservation expired');
   const result=await embed(payload.query,{signal});
   if(Object.entries(SEMANTIC_MODEL).some(([key,value])=>result[key]!==value)||result.task!=='RETRIEVAL_QUERY'||result.inputSha256!==reservation.querySha256||!Array.isArray(result.vector)||result.vector.length!==768||result.vector.some(v=>!Number.isFinite(v))||Math.abs(result.vector.reduce((sum,n)=>sum+n*n,0)-1)>1e-9||result.truncated!==false||!Number.isInteger(result.tokenCount)||result.tokenCount<1||result.tokenCount>2048)throw fail(503,'Query embedding unavailable');
   c=await context(frozenActor);if(c.snapshot.revision!==reservation.revision||c.index.indexSha256!==reservation.indexSha256)throw fail(409,'Evidence context changed');
   const allowed=new Set();for(let offset=0;offset<256;offset+=100){const page=searchRetainedSources(c.snapshot,{...payload.filters,query:'',offset,limit:100});for(const row of page.items)allowed.add(row.id);if(page.nextOffset===null)break;}
   const ranked=c.index.entries.filter(e=>allowed.has(e.id)).map(e=>({id:e.id,similarity:e.vector.reduce((sum,v,i)=>sum+v*result.vector[i],0)})).sort((a,b)=>b.similarity-a.similarity||(a.id<b.id?-1:a.id>b.id?1:0));
   const done=await transaction(frozenActor,sessionId,([identity,state,budget,record])=>{if(record.owner!==owner||record.status!=='pending'||record.expiresAt<=now())throw fail(409,'Semantic reservation unavailable');return [identity,state,budget,{...record,status:'complete',ranked,tokenCount:result.tokenCount}];});
   c=await context(frozenActor);return publicPage(c,done[3],0,25);
  }catch(error){
   // Failure metadata contains no raw query, provider text or credentials. Revocation may
   // prevent this update; the durable pending reservation remains non-retryable.
   try{await context(frozenActor);await transaction(frozenActor,sessionId,([identity,state,budget,record])=>[identity,state,budget,record.owner===owner&&record.status==='pending'?{...record,status:'failed'}:record]);}catch{}
   throw error;
  }
 },
 async page(actor,{sessionId,revision,offset=0,limit=25}={}){
  if(!hash(sessionId)||!hash(revision)||!Number.isInteger(offset)||offset<0||offset>256||!Number.isInteger(limit)||limit<1||limit>100)throw fail(400,'Invalid semantic page');
  const frozenActor=Object.freeze({...actor});let c=await context(frozenActor);if(c.snapshot.revision!==revision)throw fail(409,'Evidence revision changed');
  const values=await transaction(frozenActor,sessionId,([identity,state,budget,record])=>{if(!record||record.organizationId!==org||record.actorId!==frozenActor.id||record.actorUid!==frozenActor.uid)throw fail(404,'Semantic session unavailable');return [identity,state,budget,record];});
  c=await context(frozenActor);return publicPage(c,values[3],offset,limit);
 }
 });
}
