// Composition only: inputs are normalized, authorized snapshot products. No I/O or inference.
export function composeEvidenceDecision({selection,month,revision,products,receiptsAvailable}) {
 const matching=products.filter(p=>p.currency===selection.currency&&p.observations.some(o=>o.month===month&&o.sourceHash===selection.sourceHash));
 const eligible=matching.filter(p=>p.observations.some(o=>o.month===month&&o.sourceHash===selection.sourceHash&&o.observation==='absent-in-supplied-grouping')).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
 if(!eligible.length)return {decisionCard:null,decisionCardUnavailableReason:matching.length?'no-absent-observation-in-selected-period':'matching-store-coverage-unavailable'};
 const product=eligible[0];
 return {decisionCardUnavailableReason:null,decisionCard:{schemaVersion:1,purpose:'reporting-coverage-review',readiness:'qualified',datasetRevision:revision,selectionId:selection.id,storeCoverageId:product.id,
  selectionBasis:'First eligible coverage ID in lexical order; not priority or commercial ranking',otherEligibleCoverageCount:eligible.length-1,
  action:{kind:'prepare-evidence-review',execution:'not-executed',text:'Prepare a request for comparable refreshed exports and delivery/as-of clarification for the absent store-period observations.'},
  evidence:[{available:true,followUp:{resource:'store-coverage',storeCoverageId:product.id,revision}},{available:true,followUp:{resource:'explain-change',comparisonId:product.comparisonId,revision}},{available:receiptsAvailable,followUp:{resource:'selection-receipts',selectionId:selection.id,revision}}],
  context:{scope:'source-period, not selected-recording store activity',storeKey:product.storeKey,currency:product.currency,selectedMonth:month,selectedSourceHash:selection.sourceHash,absentObservations:product.observations.filter(o=>o.observation==='absent-in-supplied-grouping').map(o=>({month:o.month,sourceHash:o.sourceHash,amount:null,scope:o.month===month?'selected-period':'comparison-context'}))},
  hypothesis:{status:'untested',origin:'service-authored-investigation-hypothesis',text:'Coverage or posting-maturity differences may explain part of the supplied reported-amount difference; this is not an established cause.'},
  cost:{status:'unknown',kind:'analyst-effort',amount:null,currency:null},
  successMeasure:{kind:'evidence-reconciliation',status:'not-assessed',criteria:['Obtain source-backed delivery/as-of and account-scope clarification','Establish whether source periods are comparable','Reconcile revised source amounts with retained provenance','Distinguish absent observations from confirmed observed zero']},
  reviewDate:{status:'unset',value:null},
  limitations:['Expected delivery remains unknown; absence is not provider failure or zero listening','Posting windows describe whole source files, not store-specific dates','Declared positional pairing does not establish equal calendar or settlement maturity','Historical statement evidence does not establish current demand, ROI or commercial action authority']}};
}
