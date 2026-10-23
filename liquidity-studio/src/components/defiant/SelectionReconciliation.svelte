<script>
 let {packet}=$props();
 const proof=$derived(packet.available?packet.proof:null);
</script>
<section aria-label="Selection reconciliation" class="reconciliation">
 <h3>Selection reconciliation</h3>
 {#if !packet.available}
  <p role="status">No retained reconciliation is prepared for this selection. This does not establish incorrect arithmetic.</p>
 {:else}
  <p><strong>Metadata and arithmetic binding: checked.</strong> The service checked the retained proof against this selection and its signed totals.</p>
  <p><strong>Retained derived-cell review: reported pass.</strong> This is a supplied retained review, not a new source-cell recomputation.</p>
  <p>Predicate truth and complete provider delivery are not verified by this page. It does not establish settlement maturity, causal impact, identity equivalence, rights or economic correctness.</p>
  <dl>
   <dt>Declared amount</dt><dd class="amount">{proof.declaredAmount} {proof.currency}</dd>
   <dt>Retained recomputed amount</dt><dd class="amount">{proof.recomputedAmount} {proof.currency}</dd>
   <dt>Positive amount</dt><dd class="amount">{proof.positiveAmount} {proof.currency}</dd>
   <dt>Negative amount</dt><dd class="amount">{proof.negativeAmount} {proof.currency}</dd>
   <dt>Selected records</dt><dd>{proof.selectedRecordCount}</dd>
   <dt>Zero-valued records</dt><dd>{proof.zeroRows}</dd>
   <dt>Metric</dt><dd>{proof.metric}</dd>
   <dt>Declared group month</dt><dd>{proof.month} · Producer-declared; not independently established by this read.</dd>
  </dl>
  <h4>Source-local predicate metadata</h4>
  <p>Equality against the fixed columns below is recorded in the retained review. This page does not check the predicate against source rows or join recording identities.</p>
  <dl><dt>TC Song ID</dt><dd>{proof.predicates.sourceSongId}</dd><dt>Store Name</dt><dd>{proof.predicates.store}</dd></dl>
  <p>Record convention: 1-based logical CSV records including the header. Positive and negative record counts were not supplied and remain unknown.</p>
  <details><summary>Binding and retained artifact references</summary>
   <p>Revision: <code>{packet.revision}</code></p><p>Selection: <code>{packet.selectionId}</code></p><p>Source hash: <code>{proof.sourceHash}</code></p><p>Ordered record-set hash: <code>{proof.selectionRecordSetSha256}</code></p>
   {#each [['Cross-tab artifact','crossTabSha256'],['Selected receipts artifact','selectedReceiptsSha256'],['Producer receipt','producerReceiptSha256'],['Independent review artifact','independentReviewSha256']] as [label,key] (key)}<p>{label}: <code>{proof.provenance[key]}</code></p>{/each}
   <p>These are retained artifact identities, not cryptographic reviewer certification or proof of a new download.</p>
  </details>
 {/if}
 <p class="qualification">{packet.limitation}</p>
</section>
<style>
 .reconciliation{padding:12px var(--research-space,16px);min-width:0}.reconciliation p{margin:8px 0}dl{display:grid;grid-template-columns:minmax(120px,1fr) minmax(0,2fr);gap:8px}dt{font-weight:600}dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.amount{font-variant-numeric:tabular-nums}code{overflow-wrap:anywhere;white-space:normal}details{margin-top:12px}.qualification{font-size:13px}@media(max-width:700px){dl{grid-template-columns:1fr}dd{margin-bottom:6px}}
</style>
