import {createHash} from 'node:crypto';
const sha=v=>createHash('sha256').update(v).digest('hex');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const exact=(v,keys)=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const id=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}(?![\s\S])/.test(v);
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}(?![\s\S])/.test(v);
const decimal=v=>typeof v==='string'&&/^-?(0|[1-9]\d{0,25})(\.\d{1,12})?(?![\s\S])/.test(v);
const integer=v=>{const [a,b='']=v.replace(/^-/,'').split('.');return BigInt(a+b.padEnd(12,'0'))*(v.startsWith('-')?-1n:1n);};
const copy=v=>structuredClone(v);
function valid(v){if(!v)throw fail(400,'Invalid evaluation case pack');}
/** Pinned preparation bytes are inputs, not a claim of independent human review. */
export function createPinnedEarningsCasePack({bytes,sha256,evidence,authorize}={}){
 valid(bytes instanceof Uint8Array&&bytes.byteLength>0&&bytes.byteLength<=262144&&hash(sha256)&&sha(bytes)===sha256&&typeof evidence?.read==='function'&&typeof authorize==='function');
 let data;try{data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw fail(400,'Invalid evaluation case pack');}
 valid(exact(data,['schemaVersion','organizationId','cases'])&&data.schemaVersion===1&&id(data.organizationId)&&Array.isArray(data.cases)&&data.cases.length>0&&data.cases.length<=32);
 const entries=new Map();
 for(const row of data.cases){
  valid(exact(row,['caseId','origin','datasetSha256','evidenceRevision','claim','claimSha256','assertion'])&&id(row.caseId)&&!entries.has(row.caseId)&&['authored-development','observed-answer'].includes(row.origin)&&hash(row.datasetSha256)&&hash(row.evidenceRevision)&&typeof row.claim==='string'&&Buffer.byteLength(row.claim)>0&&Buffer.byteLength(row.claim)<=4096&&sha(row.claim)===row.claimSha256);
  const a=row.assertion;
  valid(exact(a,['month','amount','currency','sourceHash','span'])&&typeof a.month==='string'&&/^\d{4}-(0[1-9]|1[0-2])(?![\s\S])/.test(a.month)&&decimal(a.amount)&&typeof a.currency==='string'&&/^[A-Z]{3}(?![\s\S])/.test(a.currency)&&hash(a.sourceHash));
  const s=a.span,chars=Array.from(row.claim);
  valid(exact(s,['start','end','text'])&&Number.isInteger(s.start)&&Number.isInteger(s.end)&&s.start>=0&&s.end>s.start&&s.end<=chars.length&&s.end-s.start<=48&&typeof s.text==='string'&&chars.slice(s.start,s.end).join('')===s.text);
  valid(/^-?(?:0|[1-9]\d{0,25}|[1-9]\d{0,2}(?:,\d{3}){1,8})(?:\.\d{1,12})?(?![\s\S])/.test(s.text)&&decimal(s.text.replaceAll(',',''))&&integer(s.text.replaceAll(',',''))===integer(a.amount));
  entries.set(row.caseId,copy(row));
 }
 const organizationId=data.organizationId;
 const get=caseId=>{if(!id(caseId)||!entries.has(caseId))throw fail(404,'Evaluation case unavailable');return copy(entries.get(caseId));};
 return Object.freeze({organizationId,sha256,get,async resolve(actor,caseId){
  await authorize(actor);const row=get(caseId),a=row.assertion;
  const response=await evidence.read(actor,{resource:'earnings',month:a.month,currency:a.currency,limit:1,revision:row.evidenceRevision});
  await authorize(actor);
  if(response?.schemaVersion!==1)throw fail(503,'Evaluation evidence unavailable');
  if(response?.scope?.organizationId!==organizationId||response.revision!==row.evidenceRevision)throw fail(409,'Evaluation evidence changed');
  if(!Number.isSafeInteger(response.total)||response.total<0||!Array.isArray(response.items)||response.items.length!==Math.min(response.total,1))throw fail(503,'Evaluation evidence unavailable');
  if(response.total!==1)throw fail(404,'Evaluation fact unavailable');
  const fact=response.items[0];
  if(!decimal(fact?.amount)||typeof fact.currency!=='string'||!hash(fact.sourceHash)||fact.month!==a.month||fact.metric!=='source-total-earned')throw fail(503,'Evaluation evidence unavailable');
  const reasons=[];
  if(integer(fact.amount)!==integer(a.amount))reasons.push('numeric-mismatch');
  if(fact.currency!==a.currency)reasons.push('currency-mismatch');
  if(fact.sourceHash!==a.sourceHash)reasons.push('citation-missing');
  const evidenceText=JSON.stringify({schemaVersion:response.schemaVersion,revision:response.revision,sourceHash:fact.sourceHash,month:fact.month,amount:fact.amount,currency:fact.currency,metric:fact.metric,periodQualification:'declared-earnings-period',qualification:'Supplied source Total Earned; not verified bank cash, profit or final settlement. Exact aggregate metadata binding is not a new source-row recomputation.'});
  return {ref:{caseId:row.caseId,datasetSha256:row.datasetSha256,origin:row.origin,evidenceRevision:row.evidenceRevision},state:{organizationId,evidenceRevision:row.evidenceRevision,claim:row.claim,evidence:evidenceText},deterministic:{status:reasons.length?'fail':'pass',reasons}};
 }});
}
