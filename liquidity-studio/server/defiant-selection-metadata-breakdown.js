import {createHash} from 'node:crypto';
import {fail} from './auth.js';
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const exact=(v,keys)=>plain(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$(?![\s\S])/.test(v);
const text=v=>typeof v==='string'&&v.length<=500&&!/[\u0000-\u001f\u007f\u2028\u2029]/.test(v);
const decimal=v=>typeof v==='string'&&/^-?(0|[1-9][0-9]{0,25})(\.[0-9]{1,12})?$(?![\s\S])/.test(v);
const units=v=>{const neg=v.startsWith('-');const [a,b='']=(neg?v.slice(1):v).split('.');const n=BigInt(a)*10n**12n+BigInt(b.padEnd(12,'0'));return neg?-n:n;};
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const count=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const productKeys=['schemaVersion','method','selectionId','sourceHash','currency','month','sourceSongId','store','parentRecordSetSha256','parentRecordCount','declaredAmount','buckets','provenance'];
const bucketKeys=['videoIdPresent','policyPresent','policy','salesType','currency','recordSetSha256','rows','amount','positiveAmount','negativeAmount','zeroRows','unitsSum','unitsNumericRows','unitsMissingRows','unitsInvalidRows','unitsNegativeRows','unitsZeroRows','unitsNonintegerRows','samples'];
const provenanceKeys=['selectedReceiptsSha256','crossTabSha256','producerResultSha256','independentReviewSha256'];
const bad=()=>{throw fail(503,'Invalid selection metadata breakdown');};
/** Runtime binds retained metadata/arithmetic; it does not re-read source cells or certify producer classifications. */
export function normalizeSelectionMetadataBreakdowns(input,selections,proofs){
 if(input===undefined)return undefined;
 if(!Array.isArray(input)||input.length>100||Buffer.byteLength(JSON.stringify(input))>2*1024*1024)bad();
 const seen=new Set();return input.map(p=>{
  if(!exact(p,productKeys)||Buffer.byteLength(JSON.stringify(p))>65536||p.schemaVersion!==1||p.method!=='youtube-video-policy-presence-v1'||typeof p.selectionId!=='string'||seen.has(p.selectionId)||!hash(p.sourceHash)||!hash(p.parentRecordSetSha256)||!decimal(p.declaredAmount)||!text(p.sourceSongId)||!p.sourceSongId||p.store!=='YouTube'||!exact(p.provenance,provenanceKeys)||!provenanceKeys.every(k=>hash(p.provenance[k]))||!Array.isArray(p.buckets)||!p.buckets.length||p.buckets.length>32)bad();
  const s=selections.find(s=>s.id===p.selectionId),proof=proofs?.find(v=>v.selectionId===p.selectionId);
  if(!s||!proof||s.sourceHash!==p.sourceHash||s.currency!==p.currency||proof.month!==p.month||proof.sourceHash!==p.sourceHash||proof.currency!==p.currency||proof.predicates.sourceSongId!==p.sourceSongId||proof.predicates.store!==p.store||p.parentRecordCount!==s.sourceRecords.length||p.parentRecordSetSha256!==digest(s.sourceRecords)||units(p.declaredAmount)!==units(s.amount))bad();
  let rows=0,total=0n,positive=0n,negative=0n,zeros=0;const keys=new Set(),sampleOffsets=new Set();
  for(const b of p.buckets){
   if(!exact(b,bucketKeys)||typeof b.videoIdPresent!=='boolean'||typeof b.policyPresent!=='boolean'||!text(b.policy)||b.policyPresent!==(b.policy!=='')||!text(b.salesType)||!b.salesType||b.currency!==p.currency||!hash(b.recordSetSha256)||!count(b.rows,p.parentRecordCount)||b.rows===0||!['amount','positiveAmount','negativeAmount','unitsSum'].every(k=>decimal(b[k]))||!['zeroRows','unitsNumericRows','unitsMissingRows','unitsInvalidRows','unitsNegativeRows','unitsZeroRows','unitsNonintegerRows'].every(k=>count(b[k],b.rows)))bad();
   const key=JSON.stringify([b.videoIdPresent,b.policyPresent,b.policy,b.salesType,b.currency]);if(keys.has(key))bad();keys.add(key);
   if(b.unitsNumericRows+b.unitsMissingRows+b.unitsInvalidRows!==b.rows||b.unitsNegativeRows+b.unitsZeroRows>b.unitsNumericRows||b.unitsNonintegerRows>b.unitsNumericRows-b.unitsZeroRows||(!b.unitsNumericRows&&units(b.unitsSum)!==0n))bad();
   const unitTotal=units(b.unitsSum),unitPositive=b.unitsNumericRows-b.unitsNegativeRows-b.unitsZeroRows;
   if((b.unitsNonintegerRows===0&&unitTotal%(10n**12n)!==0n)||(b.unitsZeroRows===b.unitsNumericRows&&unitTotal!==0n)||(b.unitsNegativeRows===0&&unitTotal<0n)||(unitPositive===0&&unitTotal>0n)||(unitPositive>0&&b.unitsNegativeRows===0&&unitTotal<=0n)||(b.unitsNegativeRows>0&&unitPositive===0&&unitTotal>=0n))bad();
   if(b.unitsNonintegerRows===0&&((b.unitsNegativeRows===0&&unitTotal<BigInt(unitPositive)*10n**12n)||(unitPositive===0&&unitTotal> -BigInt(b.unitsNegativeRows)*10n**12n)))bad();
   const a=units(b.amount),pos=units(b.positiveAmount),neg=units(b.negativeAmount);if(pos<0n||neg>0n||pos+neg!==a||b.rows-b.zeroRows<Number(pos>0n)+Number(neg<0n)||((pos===0n&&neg===0n)&&b.zeroRows!==b.rows))bad();
   if(!Array.isArray(b.samples)||!b.samples.length||b.samples.length>Math.min(3,b.rows))bad();let prior=-1;
   for(const sample of b.samples){if(!exact(sample,['offset','record'])||!count(sample.offset,s.sourceRecords.length-1)||sample.offset<=prior||sampleOffsets.has(sample.offset)||sample.record!==s.sourceRecords[sample.offset])bad();prior=sample.offset;sampleOffsets.add(sample.offset);}
   rows+=b.rows;total+=a;positive+=pos;negative+=neg;zeros+=b.zeroRows;
  }
  if(rows!==p.parentRecordCount||total!==units(p.declaredAmount)||positive!==units(proof.positiveAmount)||negative!==units(proof.negativeAmount)||zeros!==proof.zeroRows)bad();
  seen.add(p.selectionId);return structuredClone(p);
 });
}
export function selectionMetadataBreakdownView(data,selectionId){
 const p=data.selectionMetadataBreakdowns?.find(p=>p.selectionId===selectionId);
 if(!p)return {available:false,reason:'not-prepared'};
 const view={available:true,product:{...structuredClone(p),buckets:p.buckets.map(b=>({...structuredClone(b),followUps:b.samples.map(s=>({resource:'selection-receipts',selectionId,revision:data.revision,offset:s.offset,limit:1}))}))},runtimeBinding:'selection/proof metadata and exact arithmetic checked; source cells not recomputed',retainedProducerReview:'supplied artifact hashes identify retained review, not provider truth',limitations:['Video metadata is an indicator, not a verified exhaustive Music/Content ID classification; blank fields do not establish Music.','Reported units are not unique views/listeners; Commission is not assumed Commission Rate.','Original sample cells illustrate buckets, not aggregate completeness or causal effects.']};
 if(Buffer.byteLength(JSON.stringify(view))>128*1024)bad();
 return view;
}
