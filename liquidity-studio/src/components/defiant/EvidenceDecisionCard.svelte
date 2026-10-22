<script>
 let {packet,coverage=null,onReceipts=()=>{}}=$props();
 const card=$derived(packet.decisionCard);
</script>
<section aria-label="June evidence review">
 <h3>June evidence review</h3><p>{packet.question}</p>
 <p>Period reported amount: {packet.facts.period.amount} {packet.facts.period.currency} · {packet.month} · {packet.facts.period.metric}</p>
 <p>Factual readiness: {packet.readiness}. Commercial recommendation: {packet.commercialReadiness.readiness}.</p>
 {#if card}
  <h4>Action</h4><p>{card.action.text}</p><p>Prepared for review; no request sent.</p>
  <h4>Evidence</h4><p>{card.context.scope}</p>
  <ul>{#each card.context.absentObservations as observation(observation.month)}<li>{observation.month}: absent in supplied grouping ({observation.scope}); no observed zero or original row is implied. <code>{observation.sourceHash}</code></li>{/each}</ul>
  {#if coverage}<p>{coverage.storeKey} · {coverage.currency}</p><dl><dt>All supplied periods</dt><dd>{coverage.allPeriod.beforeAmount} → {coverage.allPeriod.afterAmount}; change {coverage.allPeriod.delta}</dd><dt>Mutually observed periods</dt><dd>{coverage.mutuallyObserved.beforeAmount??'Unavailable'} → {coverage.mutuallyObserved.afterAmount??'Unavailable'}; change {coverage.mutuallyObserved.delta??'Unavailable'}</dd></dl><p>{coverage.mutuallyObserved.pairingBasis}</p><p>{coverage.limitation}</p>{/if}
  <button disabled={!card.evidence.find(e=>e.followUp.resource==='selection-receipts')?.available} onclick={onReceipts}>Inspect original selection cells</button>
  <h4>Hypothesis · {card.hypothesis.status}</h4><p>{card.hypothesis.text}</p>
  <h4>Cost</h4><p>Unknown analyst effort; no spend committed.</p>
  <h4>Success measure · {card.successMeasure.status}</h4><ul>{#each card.successMeasure.criteria as criterion(criterion)}<li>{criterion}</li>{/each}</ul>
  <h4>Review date</h4><p>Unset</p>
  <details><summary>Qualification and provenance</summary><p>{card.selectionBasis} · Other eligible coverage products: {card.otherEligibleCoverageCount}</p><p>Revision: <code>{card.datasetRevision}</code></p><ul>{#each card.limitations as limitation(limitation)}<li>{limitation}</li>{/each}</ul></details>
 {:else}<p>No reporting-absence action is supported for this selection: {packet.decisionCardUnavailableReason}. The factual brief remains available.</p>{/if}
 <h4>Commercial evidence still needed</h4><ul>{#each packet.commercialReadiness.missingEvidence as missing(missing)}<li>{missing}</li>{/each}</ul><p>{packet.limitation}</p>
</section>
<style>
 section{padding:16px;border:1px solid var(--research-line);border-radius:6px;margin:12px 16px;min-width:0}h4{margin-bottom:6px}p,li,dd{overflow-wrap:anywhere}code{overflow-wrap:anywhere;white-space:normal}dl{display:grid;grid-template-columns:minmax(100px,1fr) minmax(0,2fr);gap:8px}dd{margin:0}button{max-width:100%}@media(max-width:700px){dl{grid-template-columns:1fr}}
</style>
