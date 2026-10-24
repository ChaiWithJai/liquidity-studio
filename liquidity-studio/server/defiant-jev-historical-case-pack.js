import {createHash} from 'node:crypto';
const sha=v=>createHash('sha256').update(v).digest('hex');
const error=()=>Object.assign(new Error('Historical evaluation evidence unavailable'),{status:503});
const need=v=>{if(!v)throw error();};
const exact=(v,keys)=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const id=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}(?![\s\S])/.test(v);
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}(?![\s\S])/.test(v);
const month=v=>typeof v==='string'&&/^\d{4}-(0[1-9]|1[0-2])(?![\s\S])/.test(v);
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}(?![\s\S])/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const text=(v,max)=>typeof v==='string'&&Buffer.byteLength(v)>0&&Buffer.byteLength(v)<=max;
const copy=v=>structuredClone(v);
const NORMALIZER='a77152e9dd06fbcb7a2dfe335b26efb42d7c817c';
const LIMITATION='Absence means no observation in the supplied grouping, not zero listening or missing provider delivery. Posting windows describe the whole source file, not this store, including when the store observation is absent. Mutually observed periods can still differ in posting and settlement maturity. Exact supplied-amount arithmetic, not causal demand analysis.';
export const HISTORICAL_COMPARABILITY_VERSION='historical-store-period-comparability-v1';
export const EXPLICIT_COMPARABILITY_VERSION='historical-store-period-comparability-v2';
export const COMPARABILITY_SEMANTICS_VERSION='settlement-comparability-status-v1';
const versions=[HISTORICAL_COMPARABILITY_VERSION,EXPLICIT_COMPARABILITY_VERSION];
const explicitStatus=()=>({status:'not-established',basis:'source-file-posting-windows-without-store-settlement-verification',normalizerGitBlob:NORMALIZER,interpretationVersion:COMPARABILITY_SEMANTICS_VERSION});
const verification=version=>version===HISTORICAL_COMPARABILITY_VERSION?'reviewed-normalizer-interpretation; false/unknown/limitation are not stored snapshot fields and historical JavaScript is not executed':'reviewed-normalizer-interpretation; not-established is not established-incomparable; historical JavaScript is not executed';
function pin(v,max){need(exact(v,['sha256','bytes'])&&hash(v.sha256)&&Number.isSafeInteger(v.bytes)&&v.bytes>0&&v.bytes<=max);}
function decoded(input,p){need(input instanceof Uint8Array);const bytes=Buffer.from(input);need(bytes.length===p.bytes&&sha(bytes)===p.sha256);try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw error();}}
function parsed(input,p){try{return JSON.parse(decoded(input,p));}catch{throw error();}}
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}
function unique(rows,key){need(Array.isArray(rows)&&rows.length<=1000);const found=rows.filter(key);need(found.length===1);return found[0];}
function projection(snapshot,row,version){
 need(snapshot?.schemaVersion===1&&snapshot.organizationId===row.organizationId);
 const source=unique(snapshot.storePeriodCoverage,x=>x?.id===row.selector.coverageId);
 const comparison=unique(snapshot.comparisons,x=>x?.id===row.selector.comparisonId&&x.dimension==='store');
 need(source.schemaVersion===1&&source.comparisonId===comparison.id&&text(source.storeKey,200)&&comparison.periodBasis==='filename-declared');
 const group=unique(comparison.groups,g=>g?.key===source.storeKey);need(id(group.id));
 for(const list of [comparison.beforeMonths,comparison.afterMonths])need(Array.isArray(list)&&list.length>0&&list.length<=12&&list.every(month)&&new Set(list).size===list.length);
 const months=[...comparison.beforeMonths,...comparison.afterMonths];need(new Set(months).size===months.length&&Array.isArray(source.observations)&&source.observations.length===months.length);
 const seen=new Set(),observations=source.observations.map(o=>{
  need(o&&month(o.month)&&months.includes(o.month)&&!seen.has(o.month)&&hash(o.sourceHash)&&Number.isSafeInteger(o.rowCount)&&o.rowCount>=0);seen.add(o.month);
  const reference=unique(comparison.sourceReferences,r=>r?.month===o.month);need(reference.sourceHash===o.sourceHash);
  let postingWindow=null;if(o.postingWindow!==null){need(exact(o.postingWindow,['first','last'])&&date(o.postingWindow.first)&&date(o.postingWindow.last)&&o.postingWindow.first<=o.postingWindow.last);postingWindow=copy(o.postingWindow);}
  return {month:o.month,sourceHash:o.sourceHash,rowCount:o.rowCount,postingWindow};
 }).sort((a,b)=>a.month<b.month?-1:a.month>b.month?1:0);
 return {storeKey:source.storeKey,periodBasis:comparison.periodBasis,beforeMonths:copy(comparison.beforeMonths),afterMonths:copy(comparison.afterMonths),postingWindowScope:'source-file',postingWindowVerification:'producer-supplied-profile',observations,expectedDelivery:'unknown',...(version===HISTORICAL_COMPARABILITY_VERSION?{settlementMaturityComparable:false}:{settlementComparability:explicitStatus()}),limitation:LIMITATION};
}
export function checkedTrustedHistoricalBinding(input){
 const b=copy(input);need(exact(b,['schemaVersion','organizationId','caseId','dataset','answer','historicalSnapshot','neutralState','projection'])&&b.schemaVersion===1&&id(b.organizationId)&&id(b.caseId));
 need(exact(b.dataset,['kind','sha256'])&&b.dataset.kind==='retained-observed-report-cases-v1'&&hash(b.dataset.sha256));
 need(exact(b.answer,['sha256','bytes','quoteStart','quoteEnd']));pin({sha256:b.answer.sha256,bytes:b.answer.bytes},65536);
 need(Number.isSafeInteger(b.answer.quoteStart)&&Number.isSafeInteger(b.answer.quoteEnd)&&b.answer.quoteStart>=0&&b.answer.quoteEnd>b.answer.quoteStart&&b.answer.quoteEnd-b.answer.quoteStart<=4096);
 need(exact(b.historicalSnapshot,['sha256','bytes','evidenceRevision'])&&hash(b.historicalSnapshot.evidenceRevision));pin({sha256:b.historicalSnapshot.sha256,bytes:b.historicalSnapshot.bytes},4194304);pin(b.neutralState,12000);
 need(exact(b.projection,['version','normalizerGitBlob'])&&versions.includes(b.projection.version)&&b.projection.normalizerGitBlob===NORMALIZER);return b;
}
/** Persist only the finite reviewed provenance envelope, never arbitrary resolver data. */
export function checkedHistoricalComparabilityProvenance(input){
 const p=copy(input);need(exact(p,['dataset','historicalRevisionVerification','projection','answer','historicalSnapshot','historicalNormalizerGitBlob','neutralState','selector','qualification']));
 need(exact(p.dataset,['kind','sha256','verification'])&&p.dataset.kind==='retained-observed-report-cases-v1'&&hash(p.dataset.sha256)&&p.dataset.verification==='trusted-reviewed-case-artifact-binding; dataset bytes not loaded by this resolver');
 need(p.historicalRevisionVerification==='trusted-reviewed-snapshot-to-revision-binding; runtime does not recompute the historical normalized revision');
 need(exact(p.projection,['version','normalizerGitBlob','verification'])&&versions.includes(p.projection.version)&&p.projection.normalizerGitBlob===NORMALIZER&&p.projection.verification===verification(p.projection.version));
 need(exact(p.answer,['sha256','bytes','quoteStart','quoteEnd']));pin({sha256:p.answer.sha256,bytes:p.answer.bytes},65536);
 need(Number.isSafeInteger(p.answer.quoteStart)&&Number.isSafeInteger(p.answer.quoteEnd)&&p.answer.quoteStart>=0&&p.answer.quoteEnd>p.answer.quoteStart&&p.answer.quoteEnd-p.answer.quoteStart<=4096);
 pin(p.historicalSnapshot,4*1024*1024);pin(p.neutralState,12000);need(p.historicalNormalizerGitBlob===NORMALIZER);
 need(exact(p.selector,['coverageId','comparisonId'])&&id(p.selector.coverageId)&&id(p.selector.comparisonId));
 need(p.qualification==='Mechanical historical metadata and exact-quote binding only; no expected semantic label, current-snapshot substitution or historical JavaScript execution.');
 need(Buffer.byteLength(JSON.stringify(p))<=4096);return p;
}
/** Loaders are constructor-owned pinned private-object readers, never request-selected destinations. */
export function createPinnedHistoricalComparabilityCasePack({bytes,sha256,loadAnswer,loadHistoricalSnapshot,loadState,authorize,trustedHistoricalBinding}={}){
 need(bytes instanceof Uint8Array&&bytes.byteLength>0&&bytes.byteLength<=262144&&hash(sha256)&&sha(bytes)===sha256&&[loadAnswer,loadHistoricalSnapshot,loadState,authorize].every(x=>typeof x==='function'));
 const pack=parsed(bytes,{bytes:bytes.byteLength,sha256});need(exact(pack,['schemaVersion','organizationId','cases'])&&pack.schemaVersion===2&&id(pack.organizationId)&&Array.isArray(pack.cases)&&pack.cases.length===1);
 const r=pack.cases[0];need(exact(r,['caseId','caseType','origin','datasetSha256','evidenceRevision','answer','historicalSnapshot','historicalNormalizerGitBlob','selector','state'])&&id(r.caseId)&&r.caseType==='historical-store-period-comparability'&&r.origin==='observed-answer'&&hash(r.datasetSha256)&&hash(r.evidenceRevision)&&r.historicalNormalizerGitBlob===NORMALIZER);
 need(exact(r.answer,['sha256','bytes','quote']));pin({sha256:r.answer.sha256,bytes:r.answer.bytes},65536);pin(r.historicalSnapshot,4*1024*1024);pin(r.state,12000);
 const q=r.answer.quote;need(exact(q,['start','end','text'])&&Number.isSafeInteger(q.start)&&Number.isSafeInteger(q.end)&&q.start>=0&&q.end>q.start&&q.end-q.start<=4096&&text(q.text,4096));need(exact(r.selector,['coverageId','comparisonId'])&&id(r.selector.coverageId)&&id(r.selector.comparisonId));
 const binding=checkedTrustedHistoricalBinding(trustedHistoricalBinding);need(exact(binding,['schemaVersion','organizationId','caseId','dataset','answer','historicalSnapshot','neutralState','projection'])&&binding.schemaVersion===1&&binding.organizationId===pack.organizationId&&binding.caseId===r.caseId);
 need(exact(binding.dataset,['kind','sha256'])&&binding.dataset.kind==='retained-observed-report-cases-v1'&&hash(binding.dataset.sha256)&&binding.dataset.sha256===r.datasetSha256);
 need(exact(binding.answer,['sha256','bytes','quoteStart','quoteEnd'])&&binding.answer.sha256===r.answer.sha256&&binding.answer.bytes===r.answer.bytes&&binding.answer.quoteStart===q.start&&binding.answer.quoteEnd===q.end);
 need(exact(binding.historicalSnapshot,['sha256','bytes','evidenceRevision'])&&binding.historicalSnapshot.sha256===r.historicalSnapshot.sha256&&binding.historicalSnapshot.bytes===r.historicalSnapshot.bytes&&binding.historicalSnapshot.evidenceRevision===r.evidenceRevision);
 need(exact(binding.neutralState,['sha256','bytes'])&&canonical(binding.neutralState)===canonical(r.state));
 need(exact(binding.projection,['version','normalizerGitBlob'])&&versions.includes(binding.projection.version)&&binding.projection.normalizerGitBlob===NORMALIZER);
 const row=copy({...r,organizationId:pack.organizationId}),organizationId=pack.organizationId,version=binding.projection.version;
 const get=caseId=>{if(!id(caseId)||caseId!==row.caseId)throw Object.assign(new Error('Historical evaluation case unavailable'),{status:404});return copy(row);};
 async function load(actor,loader,p){await authorize(actor);const value=await loader(Object.freeze(copy(p)));await authorize(actor);return value;}
 return Object.freeze({organizationId,sha256,deterministicVersion:version,executionAvailable:version===EXPLICIT_COMPARABILITY_VERSION,executionUnavailableReason:version===HISTORICAL_COMPARABILITY_VERSION?'ambiguous-evidence-semantics':null,get,list:()=>[{caseId:row.caseId,origin:row.origin,evidenceRevision:row.evidenceRevision,claim:row.answer.quote.text}],async resolve(actor,caseId){
  await authorize(actor);const selected=get(caseId),answer=decoded(await load(actor,loadAnswer,{sha256:selected.answer.sha256,bytes:selected.answer.bytes}),selected.answer);
  const quote=selected.answer.quote;const answerCharacters=Array.from(answer);need(quote.end<=answerCharacters.length&&answerCharacters.slice(quote.start,quote.end).join('')===quote.text);
  const snapshot=parsed(await load(actor,loadHistoricalSnapshot,selected.historicalSnapshot),selected.historicalSnapshot);
  const state=parsed(await load(actor,loadState,selected.state),selected.state);need(exact(state,['claim','evidence'])&&state.claim===quote.text);
  const evidence=projection(snapshot,selected,version);need(canonical(state.evidence)===canonical(evidence));const serialized=JSON.stringify(evidence);need(Buffer.byteLength(serialized)<=12000);
  await authorize(actor);
  return {ref:{caseId:selected.caseId,datasetSha256:selected.datasetSha256,origin:selected.origin,evidenceRevision:selected.evidenceRevision},state:{organizationId,evidenceRevision:selected.evidenceRevision,claim:quote.text,evidence:serialized},deterministic:{status:'pass',reasons:[]},deterministicVersion:version,provenance:{dataset:{kind:binding.dataset.kind,sha256:binding.dataset.sha256,verification:'trusted-reviewed-case-artifact-binding; dataset bytes not loaded by this resolver'},historicalRevisionVerification:'trusted-reviewed-snapshot-to-revision-binding; runtime does not recompute the historical normalized revision',projection:{...binding.projection,verification:verification(version)},answer:{sha256:selected.answer.sha256,bytes:selected.answer.bytes,quoteStart:quote.start,quoteEnd:quote.end},historicalSnapshot:copy(selected.historicalSnapshot),historicalNormalizerGitBlob:NORMALIZER,neutralState:copy(selected.state),selector:copy(selected.selector),qualification:'Mechanical historical metadata and exact-quote binding only; no expected semantic label, current-snapshot substitution or historical JavaScript execution.'}};
 }});
}
