import {selectionReconciliationView} from './defiant-selection-reconciliation.js';
import {selectionMetadataBreakdownView} from './defiant-selection-metadata-breakdown.js';

const fail=(status,message)=>Object.assign(new Error(message),{status});
const id=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$(?![\s\S])/.test(value);
const limits=Object.freeze({
 issue:'https://github.com/ChaiWithJai/liquidity-studio/issues/374',
 codes:['provider-completeness-unverified','settlement-comparability-not-established','usage-rate-adjustment-attribution-incomplete','recording-equivalence-unreviewed','commercial-activation-unverified'],
 qualification:'Missing inputs limit these conclusions, not the availability of supplied statement facts. No zero imputation, causal attribution, identity equivalence or campaign approval.'
});
const arithmetic=Object.freeze({status:'checked',basis:'curated-group-sums-equal-supplied-period-totals',exclusions:['complete-source-cell-recomputation','usage-rate-adjustment-explanation','provider-completeness','settlement-maturity-comparability','causal-attribution']});
export function validateRoyaltyReviewRequest(request){
 const {revision,selectionId,comparisonId,storeCoverageId,offset=0,limit=25}=request;
 if(Object.keys(request).some(key=>!['resource','revision','selectionId','comparisonId','storeCoverageId','offset','limit'].includes(key))||typeof revision!=='string'||!/^[a-f0-9]{64}$(?![\s\S])/.test(revision)||
    (selectionId===undefined)===(comparisonId===undefined)||selectionId!==undefined&&!id(selectionId)||comparisonId!==undefined&&!id(comparisonId)||
    storeCoverageId!==undefined&&(!id(storeCoverageId)||comparisonId===undefined)||!Number.isInteger(offset)||offset<0||offset>(comparisonId===undefined?500000:10000)||!Number.isInteger(limit)||limit<1||limit>100)throw fail(400,'Invalid royalty review request');
}
/** Compose already-normalized products. No new sums, intersections, cell loads or inference. */
export function royaltyReviewView(data,request,{receiptsAvailable=false}={}){
 validateRoyaltyReviewRequest(request);
 if(request.revision!==data.revision)throw fail(409,'Evidence revision changed');
 const {selectionId,comparisonId,storeCoverageId,offset=0,limit=25}=request;
 const common={purpose:'royalty-evidence-review',readiness:'qualified',knownLimits:limits,
  settlementMaturityComparability:'not-established',
  limitation:'Supplied curated facts and existing checked metadata only. This read does not recompute source cells, prove complete provider delivery, or explain causes. Original receipt follow-ups retain their own source and completeness limits.'};
 if(selectionId!==undefined){
  const selected=data.selections.find(row=>row.id===selectionId);
  if(!selected)throw fail(404,'Selection unavailable');
  const periods=data.months.filter(row=>row.sourceHash===selected.sourceHash&&row.currency===selected.currency);
  if(periods.length!==1)throw fail(409,'Unique selection source period unavailable');
  const {sourceRecords,...selection}=selected;
  const {receiptIds,...period}=periods[0];
  return {...common,mode:'selection',facts:{selection:{...selection,rowCount:sourceRecords.length},period,periodScope:'entire supplied source-period amount, not this selection amount'},
   reconciliation:selectionReconciliationView(data,selectionId),metadataBreakdown:selectionMetadataBreakdownView(data,selectionId),
   lineage:{sourceHash:selected.sourceHash,rowConvention:'1-based logical CSV record including header',sourceRecords:sourceRecords.slice(offset,offset+limit),offset,limit,total:sourceRecords.length,nextOffset:offset+limit<sourceRecords.length?offset+limit:null},
   followUp:{resource:'selection-receipts',selectionId,revision:data.revision,offset,limit,available:receiptsAvailable},
   nextAction:'Read original selection receipts. Treat any supplied units or metadata categories as source-defined; do not infer missing unit, rate or adjustment facts.'};
 }
 const selected=(data.comparisons||[]).find(row=>row.id===comparisonId);
 if(!selected)throw fail(404,'Comparison unavailable');
 const {groups,...comparison}=selected;
 const applicable=(data.storePeriodCoverage||[]).filter(product=>product.comparisonId===comparisonId);
 const coverage=storeCoverageId===undefined?null:applicable.find(product=>product.id===storeCoverageId);
 if(storeCoverageId!==undefined&&!coverage)throw fail(409,'Store coverage does not apply to this comparison');
 // The snapshot normalizer already binds coverage to exact comparison/group/currency/month/source
 // and verifies its supplied arithmetic. Do not infer applicability from store labels alone.
 const coverageView=coverage?Object.fromEntries(Object.entries(coverage).filter(([key])=>key!=='settlementMaturityComparable')):null;
 const selectedGroup=coverage?groups.find(group=>group.id===coverage.groupId):null;
 if(coverage&&(!selectedGroup||coverage.currency!==comparison.currency))throw fail(503,'Store coverage binding unavailable');
 const groupView=group=>({...group,originalReceiptFollowUps:group.sourceReferences.map((reference,referenceIndex)=>({resource:'comparison-examples',comparisonId,groupId:group.id,referenceIndex,revision:data.revision,sourceHash:reference.sourceHash,exampleCount:reference.exampleRecords.length,available:receiptsAvailable&&reference.exampleRecords.length>0,scope:'producer-selected examples, not full group receipts'}))});
 return {...common,mode:'comparison',comparison:{...comparison,groupCount:groups.length,arithmeticReconciliation:arithmetic,scope:'whole comparison dimension; not the selected store alone'},
  contributions:{items:groups.slice(offset,offset+limit).map(groupView),offset,limit,total:groups.length,nextOffset:offset+limit<groups.length?offset+limit:null},
  selectedStore:coverage?{group:groupView(selectedGroup),coverage:{...coverageView,settlementMaturityComparability:'not-established'},scope:'only the explicitly selected normalized store group; allPeriod and mutuallyObserved retain their distinct supplied bases'}:null,
  availableStoreCoverage:applicable.map(product=>({id:product.id,groupId:product.groupId,storeKey:product.storeKey,followUp:{resource:'royalty-review',comparisonId,storeCoverageId:product.id,revision:data.revision,offset:0,limit}})),
  nextAction:'Use selectedStore for a store-specific question; compare its existing allPeriod and mutuallyObserved views separately. Follow a nonempty originalReceiptFollowUp to inspect example cells; examples do not reconcile the full aggregate.'};
}
