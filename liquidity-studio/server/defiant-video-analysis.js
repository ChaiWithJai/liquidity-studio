import {createHash,randomUUID} from 'node:crypto';
import {fail} from './auth.js';
import {GenerationBudget} from './generation-budget.js';
import {videoWindow,videoMoments} from './vertex-video.js';
const clone=x=>structuredClone(x),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(x);
const exact=(x,keys)=>{if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).some(k=>!keys.includes(k)))throw fail(400,'Unsupported video preprocessing fields');};
export class DefiantVideoAnalysis {
 constructor(strategy,gateway){this.strategy=strategy;this.store=strategy.store;this.gateway=gateway;}
 configured(){return this.gateway?.getConfig().provider==='gcp-vertex';}
 dto(state,sourceId,analysisId){const analyses=(state.inbox?.analyses||[]).filter(a=>a.sourceId===sourceId).map(a=>{const {requestHash,saveReceipts,...safe}=a;return clone(safe);});return {configured:this.configured(),revision:state.revision,analysis:(analysisId?analyses.find(a=>a.id===analysisId):analyses.at(-1))||null,analyses};}
 async read(actor,sourceId,analysisId){let {state}=await this.strategy.raw(actor);if(!state.inbox?.sources.some(s=>s.id===sourceId))throw fail(404,'Select a current inbox source');
  if(state.inbox.analyses?.some(a=>a.sourceId===sourceId&&a.status==='running'&&Date.parse(a.deadlineAt)<=Date.parse(this.strategy.now())))await this.store.transact(['identity',this.strategy.key],([identity,current])=>{this.strategy.assertCurrent(identity,current,actor);for(const a of current.inbox.analyses||[])if(a.sourceId===sourceId&&a.status==='running'&&Date.parse(a.deadlineAt)<=Date.parse(this.strategy.now())){a.status='unknown';a.error='The provider outcome is unavailable. This request will not call the model again.';a.revision++;current.revision++;}state=current;return [identity,current];});
  return this.dto(state,sourceId,analysisId);
 }
 async analyze(actor,input){
  exact(input,['sourceId','expectedSourceRevision','idempotencyKey','window']);if(!uuid(input.idempotencyKey)||!Number.isSafeInteger(input.expectedSourceRevision))throw fail(400,'Retain the selected source revision and request key');videoWindow(input.window);if(!this.configured())throw fail(503,'Video preprocessing requires the configured Vertex provider');
  await this.strategy.raw(actor);const requestHash=hash(input);let record,replay=false,recordings;
  await this.store.transact(['identity',this.strategy.key],([identity,state])=>{
   this.strategy.assertCurrent(identity,state,actor);const rows=state.inbox.analyses||[],prior=rows.find(a=>a.id===input.idempotencyKey);
   if(prior){if(prior.actorId!==actor.id||prior.requestHash!==requestHash)throw fail(409,'Analysis request belongs to different content');record=clone(prior);replay=true;return [identity,state];}
   const source=state.inbox.sources.find(s=>s.id===input.sourceId);if(!source||source.revision!==input.expectedSourceRevision)throw fail(409,'Selected source changed; keep your request');
   if(rows.length>=128||rows.filter(a=>a.sourceId===source.id).length>=8)throw fail(429,'Saved analysis capacity reached; existing proposals are retained');
   if(rows.some(a=>a.sourceId===source.id&&a.status==='running'))throw fail(409,'This source already has an analysis in progress');
   recordings=clone(state.inbox.recordings);record={id:input.idempotencyKey,actorId:actor.id,requestHash,sourceId:source.id,sourceUrl:source.sourceUrl,sourceRevision:source.revision,status:'running',revision:1,window:clone(input.window),moments:[],trace:null,createdAt:this.strategy.now(),deadlineAt:new Date(Date.parse(this.strategy.now())+this.gateway.getConfig().timeoutMs+5000).toISOString(),saveReceipts:[]};
   state.inbox.analyses=[...rows,record];state.revision++;return [identity,state];
  });
  if(replay)return this.read(actor,input.sourceId,input.analysisId||input.idempotencyKey);
  const budget=new GenerationBudget(this.store,{organizationId:this.strategy.organizationId,brandId:null});let reservation,result,error;
  try{reservation=await budget.reserveGeneration();await budget.assertGenerationReservation(reservation);await this.strategy.raw(actor);result=await this.gateway.analyzeYouTubeVideo({sourceUrl:record.sourceUrl,window:record.window,recordings});}
  catch(e){error=e;}
  // An issued provider attempt is never repeated by replaying this request key.
  // A process interruption leaves its durable running record for explicit inspection.
  await this.store.transact(['identity',this.strategy.key],([identity,state])=>{
   this.strategy.assertCurrent(identity,state,actor);const current=state.inbox.analyses.find(a=>a.id===record.id);if(!current||current.status!=='running')throw fail(409,'Analysis state changed; reload its saved outcome');
   const source=state.inbox.sources.find(s=>s.id===record.sourceId);if(!source||source.revision!==record.sourceRevision)throw fail(409,'Selected source changed during preprocessing');
   current.status=error?(reservation?'unknown':'failed'):'ready';current.error=error?(reservation?'The provider outcome is unavailable. This request will not call the model again.':'Analysis was not started; check the current generation budget.'):null;
   current.trace=result?.trace||error?.trace||null;current.moments=result?videoMoments(result.moments,current.window,state.inbox.recordings).map(m=>({...m,id:randomUUID(),revision:1,savedAt:null,savedBy:null})):[];current.revision++;current.updatedAt=this.strategy.now();state.revision++;return [identity,state];
  });
  if(reservation)await budget.finalizeGeneration(reservation,{status:error?'error':'completed',mode:'youtube-video-analysis',traceId:result?.trace?.traceId||error?.trace?.traceId});
  return this.read(actor,input.sourceId,input.analysisId||input.idempotencyKey);
 }
 async saveMoment(actor,input){
  exact(input,['sourceId','analysisId','expectedRevision','idempotencyKey','moment']);if(!uuid(input.idempotencyKey)||!uuid(input.analysisId)||!uuid(input.moment?.id))throw fail(400,'Retain the analysis and moment request');
  const requestHash=hash(input);await this.strategy.raw(actor);
  await this.store.transact(['identity',this.strategy.key],([identity,state])=>{
   this.strategy.assertCurrent(identity,state,actor);const analysis=state.inbox?.analyses?.find(a=>a.id===input.analysisId&&a.sourceId===input.sourceId);if(!analysis||analysis.status!=='ready')throw fail(409,'Ready video analysis required');
   const prior=analysis.saveReceipts.find(r=>r.id===input.idempotencyKey);if(prior){if(prior.actorId!==actor.id||prior.requestHash!==requestHash)throw fail(409,'Moment request belongs to different wording');return [identity,state];}
   if(analysis.revision!==input.expectedRevision)throw fail(409,'Saved proposal changed; keep your working values');if(analysis.saveReceipts.length>=32)throw fail(429,'Moment edit history capacity reached');
   const old=analysis.moments.find(m=>m.id===input.moment.id);if(!old)throw fail(409,'Proposed moment is unavailable');const {id,...fields}=input.moment;let validated;try{validated=videoMoments([fields],analysis.window,state.inbox.recordings)[0];}catch{throw fail(422,'Keep the moment inside the analysis window and at most 30 seconds');}
   const saved={...validated,id,revision:old.revision+1,savedAt:this.strategy.now(),savedBy:actor.id};analysis.moments=analysis.moments.map(m=>m.id===id?saved:m);analysis.revision++;analysis.saveReceipts.push({id:input.idempotencyKey,actorId:actor.id,requestHash});state.revision++;return [identity,state];
  });return this.read(actor,input.sourceId,input.analysisId||input.idempotencyKey);
 }
}
