import {createHash} from 'node:crypto';
import {fail} from './auth.js';
const method='selected-derived-cells-signed-decimal-v1';
const metric='source-total-earned';
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const exact=(v,keys)=>plain(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$(?![\s\S])/.test(v);
const decimal=v=>typeof v==='string'&&/^-?(0|[1-9][0-9]{0,25})(\.[0-9]{1,12})?$(?![\s\S])/.test(v);
const text=v=>typeof v==='string'&&v.length>0&&Buffer.byteLength(v,'utf8')<=500&&!/[\u0000-\u001f\u007f]/.test(v);
const units=v=>{const negative=v.startsWith('-');const [whole,fraction='']=(negative?v.slice(1):v).split('.');const n=BigInt(whole)*10n**12n+BigInt(fraction.padEnd(12,'0'));return negative?-n:n;};
const keys=['schemaVersion','method','selectionId','sourceHash','currency','metric','month','selectedRecordCount','selectionRecordSetSha256','declaredAmount','recomputedAmount','positiveAmount','negativeAmount','zeroRows','predicates','provenance'];
const provenanceKeys=['crossTabSha256','selectedReceiptsSha256','producerReceiptSha256','independentReviewSha256'];
/** Supplied review metadata only: never re-read cells or infer predicate correctness. */
export function normalizeSelectionReconciliations(input,selections){
 if(input===undefined)return undefined;
 if(!Array.isArray(input)||input.length>2000||Buffer.byteLength(JSON.stringify(input),'utf8')>1024*1024)throw fail(503,'Invalid selection reconciliation');
 const byId=new Map(selections.map(s=>[s.id,s]));const seen=new Set();
 return input.map(row=>{
  if(!exact(row,keys)||row.schemaVersion!==1||row.method!==method||row.metric!==metric||(typeof row.selectionId!=='string'||!/^[A-Za-z0-9_-]{1,128}$(?![\s\S])/.test(row.selectionId))||seen.has(row.selectionId)||!hash(row.sourceHash)||!hash(row.selectionRecordSetSha256)||typeof row.currency!=='string'||!/^[A-Z]{3}$(?![\s\S])/.test(row.currency)||typeof row.month!=='string'||!/^[0-9]{4}-(0[1-9]|1[0-2])$(?![\s\S])/.test(row.month)||!Number.isSafeInteger(row.selectedRecordCount)||row.selectedRecordCount<1||!Number.isSafeInteger(row.zeroRows)||row.zeroRows<0||row.zeroRows>row.selectedRecordCount||!exact(row.predicates,['sourceSongId','store'])||!text(row.predicates.sourceSongId)||!text(row.predicates.store)||!exact(row.provenance,provenanceKeys)||!provenanceKeys.every(k=>hash(row.provenance[k]))||!['declaredAmount','recomputedAmount','positiveAmount','negativeAmount'].every(k=>decimal(row[k])))throw fail(503,'Invalid selection reconciliation');
  const selected=byId.get(row.selectionId);
  if(!selected||selected.sourceHash!==row.sourceHash||selected.currency!==row.currency||selected.sourceRecords.length!==row.selectedRecordCount||createHash('sha256').update(JSON.stringify(selected.sourceRecords)).digest('hex')!==row.selectionRecordSetSha256||units(selected.amount)!==units(row.declaredAmount)||units(row.declaredAmount)!==units(row.recomputedAmount)||units(row.positiveAmount)<0n||units(row.negativeAmount)>0n||units(row.positiveAmount)+units(row.negativeAmount)!==units(row.recomputedAmount))throw fail(503,'Selection reconciliation binding mismatch');
  const nonzero=row.selectedRecordCount-row.zeroRows;const buckets=Number(units(row.positiveAmount)>0n)+Number(units(row.negativeAmount)<0n);
  if(nonzero<buckets||(buckets===0&&nonzero!==0))throw fail(503,'Selection reconciliation sign counts infeasible');
  seen.add(row.selectionId);return structuredClone(row);
 });
}
export function selectionReconciliationView(data,selectionId){
 const selection=data.selections.find(row=>row.id===selectionId);
 if(!selection)throw fail(404,'Evidence selection unavailable');
 const proof=data.selectionReconciliations?.find(row=>row.selectionId===selectionId);
 if(!proof)return {available:false,selectionId,reason:'not-prepared',limitation:'No retained reconciliation proof is prepared for this selection; absence does not establish incorrect arithmetic.'};
 return {available:true,selectionId,rowConvention:'1-based-logical-csv-record-including-header',proof:structuredClone(proof),runtimeBinding:{status:'checked',scope:'selection-metadata-and-arithmetic'},retainedDerivedReview:{status:'reported-pass',scope:'selected-derived-records',basis:'supplied-retained-review'},periodQualification:'producer-declared-group-month; not independently established by this read',predicateColumns:{sourceSongId:'TC Song ID',store:'Store Name'},followUp:{resource:'selection-receipts',selectionId,revision:data.revision},limitation:'Runtime checked proof metadata against the current selection and signed totals, not source cells or predicate truth. Retained review reports selected derived-cell recomputation; it is not a second whole-source scan, complete provider intake, settlement maturity, causal finding, identity equivalence, rights or economic correctness.'};
}
