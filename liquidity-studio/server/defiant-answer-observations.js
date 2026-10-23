import {createHash} from 'node:crypto';
const fail=(status,message)=>Object.assign(new Error(message),{status});
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
const exact=(v,keys)=>plain(v)&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const id=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(v);
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const text=(v,max)=>typeof v==='string'&&v.length>0&&Buffer.byteLength(v)<=max&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v);
const decimal=v=>typeof v==='string'&&/^-?(0|[1-9]\d{0,25})(\.\d{1,12})?$/.test(v);
const digest=v=>createHash('sha256').update(v).digest('hex');
const integer=v=>{const negative=v.startsWith('-');const [a,b='']=v.replace(/^-/,'').split('.');return BigInt(a+b.padEnd(12,'0'))*(negative?-1n:1n);};
const size=v=>Buffer.byteLength(JSON.stringify(v));
export function answerObservationRecordKey(organizationId,observationId){if(!id(organizationId)||!hash(observationId))throw fail(400,'Invalid observation key');return `defiant-answer-observations:v1:${organizationId}:${observationId}`;}
function validate(input){
 if(!exact(input,['idempotencyKey','question','answer','revision','assertions','observedAt','hostLabel','modelId',...(Object.hasOwn(input||{},'revisionAssertions')?['revisionAssertions']:[])])||!id(input.idempotencyKey)||!text(input.question,2048)||!text(input.answer,16384)||!hash(input.revision)||!Array.isArray(input.assertions)||input.assertions.length<1||input.assertions.length>5||size(input)>65536)throw fail(400,'Invalid answer observation');
 if(input.observedAt!==null&&(typeof input.observedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(input.observedAt)||!Number.isFinite(Date.parse(input.observedAt))||new Date(input.observedAt).toISOString()!==input.observedAt))throw fail(400,'Invalid attributed observation time');
 if([input.hostLabel,input.modelId].some(v=>v!==null&&!text(v,200)))throw fail(400,'Invalid attributed observation metadata');
 const chars=Array.from(input.answer);
 if(Object.hasOwn(input,'revisionAssertions')){
  if(!Array.isArray(input.revisionAssertions)||input.revisionAssertions.length<1||input.revisionAssertions.length>5)throw fail(400,'Invalid revision assertions');
  for(const a of input.revisionAssertions){const span=a?.span;if(!exact(a,['span'])||!exact(span,['start','end','text'])||typeof span.text!=='string'||!Number.isInteger(span.start)||!Number.isInteger(span.end)||span.start<0||span.end<=span.start||span.end>chars.length||span.end-span.start>128||chars.slice(span.start,span.end).join('')!==span.text)throw fail(400,'Invalid revision assertion span');}
 }
 for(const a of input.assertions){
  if(!exact(a,['kind','value','currency','span','reference','receipt'])||!['selection','earnings'].includes(a.kind)||!decimal(a.value)||typeof a.currency!=='string'||!/^[A-Z]{3}$/.test(a.currency)||!exact(a.span,['start','end','text'])||!Number.isInteger(a.span.start)||!Number.isInteger(a.span.end)||a.span.start<0||a.span.end<=a.span.start||a.span.end>chars.length||chars.slice(a.span.start,a.span.end).join('')!==a.span.text)throw fail(400,'Invalid numerical assertion');
  if(a.kind==='selection'&&(!exact(a.reference,['selectionId'])||!id(a.reference.selectionId)))throw fail(400,'Invalid selection reference');
  if(a.kind==='earnings'&&(!exact(a.reference,['month'])||typeof a.reference.month!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(a.reference.month)))throw fail(400,'Invalid earnings reference');
  if(a.receipt!==null&&(!exact(a.receipt,['receiptId','cell'])||!id(a.receipt.receiptId)||!text(a.receipt.cell,200)))throw fail(400,'Invalid curated receipt reference');
 }
}
/** No model invocation. Caller text remains attributed, not an attested model execution. */
export function createAnswerObservations({store,strategy,evidence,authorizeCurrent,signal,now=()=>new Date().toISOString()}={}){
 if(!store?.transact||!strategy?.assertCurrent||!evidence?.read||typeof authorizeCurrent!=='function')throw TypeError('Current scoped observation dependencies required');
 const org=strategy.organizationId,indexKey=`defiant-answer-observations:v1:${org}:index`,recordKey=id=>answerObservationRecordKey(org,id);
 const deadline=Date.now()+30000;
 const active=()=>{if(signal?.aborted||Date.now()>deadline)throw fail(408,'Observation request expired');};
 async function current(actor){active();const next=await authorizeCurrent(actor);if(!next||next.id!==actor.id||!next.uid||next.uid!==actor.uid)throw fail(403,'Observation account changed');await strategy.raw(next);return next;}
 const check=(identity,state,actor)=>{active();return strategy.assertCurrent(identity,state,actor);};
 return {
 async capture(actor,input){
  validate(input);actor=await current(actor);const payload=structuredClone(input),payloadHash=digest(JSON.stringify(payload)),observationId=digest(JSON.stringify([org,actor.id,actor.uid,input.idempotencyKey])),createdAt=now();const results=[];
  if(await store.get(recordKey(observationId))){const prior=await store.transact(['identity',strategy.key,recordKey(observationId)],([identity,state,record])=>{check(identity,state,actor);if(record&&record.payloadHash!==payloadHash)throw fail(409,'Idempotency key already used');return [identity,state,record];});if(prior[2])return structuredClone(prior[2]);}
  for(const assertion of payload.assertions){
   const request=assertion.kind==='selection'?{resource:'selection',selectionId:assertion.reference.selectionId,limit:1,revision:payload.revision}:{resource:'earnings',month:assertion.reference.month,currency:assertion.currency,limit:1,revision:payload.revision};
   const response=await evidence.read(actor,request);if(response.revision!==payload.revision||response.scope?.organizationId!==org)throw fail(409,'Evidence context changed');
   const fact=assertion.kind==='selection'?response.selection:response.total===1?response.items[0]:null;
   const result={assertion,amountCheck:fact?integer(assertion.value)===integer(fact.amount)?'match':'mismatch':'unknown',currencyCheck:fact?assertion.currency===fact.currency?'match':'mismatch':'unknown',period:assertion.kind==='earnings'?assertion.reference.month:null,periodQualification:assertion.kind==='earnings'?'declared-earnings-period':'unknown',fact:fact?{amount:fact.amount,currency:fact.currency,sourceHash:fact.sourceHash,metric:fact.metric||null,qualification:response.limitation||'Supplied source-total-earned; not profit or final settlement.'}:null,receipt:null,semanticSupport:'unknown',limitation:'Only the declared numerical assertion is checked; the answer wording and causal meaning are not verified.'};
   if(assertion.receipt){const r=await evidence.read(actor,{resource:'receipt',receiptId:assertion.receipt.receiptId,revision:payload.revision});if(r.revision!==payload.revision||r.scope?.organizationId!==org)throw fail(409,'Evidence context changed');result.receipt={receiptId:r.receipt.id,sourceHash:r.receipt.sourceHash,member:r.receipt.member,record:r.receipt.record,cell:assertion.receipt.cell,exists:Object.hasOwn(r.receipt.cells,assertion.receipt.cell),sourceMatchesFact:fact?r.receipt.sourceHash===fact.sourceHash:null,qualification:'Curated snapshot example only; not a new original-shard integrity check or proof of an aggregate.'};}
   results.push(result);
  }
  const observation={schemaVersion:1,observationId,organizationId:org,createdAt,actorId:actor.id,actorUid:actor.uid,origin:'user-supplied-observation',attributedMetadata:{observedAt:payload.observedAt,hostLabel:payload.hostLabel,modelId:payload.modelId,verified:false},question:payload.question,questionHash:digest(payload.question),answer:payload.answer,answerHash:digest(payload.answer),evidenceRevision:payload.revision,validatorVersion:'exact-decimal-v1',results,...(payload.revisionAssertions?{revisionResults:payload.revisionAssertions.map(({span})=>({span,expectedRevision:payload.revision,revisionCheck:span.text===payload.revision?'match':'mismatch',basis:'exact-selected-text-equals-captured-evidence-revision',validatorVersion:'exact-revision-text-v1',semanticSupport:'unknown'}))}:{}),semanticSupport:'unknown',modelExecutionVerified:false};
  const candidate={observation,payloadHash,correction:null};if(size(candidate)>262144)throw fail(413,'Observation too large');actor=await current(actor);
  const values=await store.transact(['identity',strategy.key,indexKey,recordKey(observationId)],([identity,state,index,record])=>{check(identity,state,actor);index=index||{schemaVersion:1,organizationId:org,entries:[]};if(index.organizationId!==org||!Array.isArray(index.entries)||index.entries.length>100)throw fail(409,'Observation index unavailable');if(record){if(record.payloadHash!==payloadHash)throw fail(409,'Idempotency key already used');return [identity,state,index,record];}if(index.entries.length>=100)throw fail(409,'Observation capacity reached');return [identity,state,{...index,entries:[...index.entries,{observationId,createdAt,actorId:actor.id,question:payload.question.slice(0,160)}]},candidate];});return structuredClone(values[3]);
 },
 async list(actor){actor=await current(actor);const values=await store.transact(['identity',strategy.key,indexKey],([identity,state,index])=>{check(identity,state,actor);return [identity,state,index||{schemaVersion:1,organizationId:org,entries:[]}];});return {organizationId:org,items:values[2].entries};},
 async detail(actor,observationId){if(!hash(observationId))throw fail(400,'Invalid observation identifier');actor=await current(actor);const values=await store.transact(['identity',strategy.key,recordKey(observationId)],([identity,state,record])=>{check(identity,state,actor);if(!record||record.observation.organizationId!==org)throw fail(404,'Observation unavailable');return [identity,state,record];});return structuredClone(values[2]);},
 async correct(actor,observationId,input){if(!hash(observationId)||!exact(input,['comment'])||!text(input.comment,2048))throw fail(400,'Invalid correction');actor=await current(actor);const correction={comment:input.comment,actorId:actor.id,actorUid:actor.uid,createdAt:now(),qualification:'Explicit submitted reviewer comment; not independently verified ground truth.'};const values=await store.transact(['identity',strategy.key,recordKey(observationId)],([identity,state,record])=>{check(identity,state,actor);if(!record||record.observation.organizationId!==org)throw fail(404,'Observation unavailable');if(record.correction)throw fail(409,'Correction already recorded');return [identity,state,{...record,correction}];});return structuredClone(values[2]);}
 };
}
