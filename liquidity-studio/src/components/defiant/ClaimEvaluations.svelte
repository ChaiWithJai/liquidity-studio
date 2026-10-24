<script>
 import {onDestroy} from 'svelte';
 let {request}=$props();
 let open=$state(false),busy=$state(false),error=$state(''),cases=$state([]),items=$state([]),selected=$state(''),available=$state(false),semanticsUnavailable=$state(false),attemptConsumed=$state(null),detail=$state(null),pending=$state(null);
 let alive=true,sequence=0,controller=null;
 const validationStages=['content-type','length','body','chunk','utf8','json','model','answers','support','support-object', 'support-type', 'support-choice', 'support-labels', 'support-probability', 'support-sum','booleans','usage','routing','cost'];
 function validationStage(outcome){const value=outcome?.responseValidation;return value&&Object.keys(value).length===2&&value.schemaVersion===1&&validationStages.includes(value.stage)?value.stage:null;}
 const selectedCase=$derived(cases.find(item=>item.caseId===selected));
 onDestroy(()=>{alive=false;sequence++;controller?.abort();});
 async function perform(task,execution=false){
  if(busy)return;const ticket=++sequence;controller=new AbortController();busy=true;error='';
  try{const value=await task(controller.signal);if(!alive||ticket!==sequence)return null;return value;}
  catch(e){if(alive&&ticket===sequence){if(e.status===401||e.status===403){cases=[];items=[];detail=null;available=false;semanticsUnavailable=false;attemptConsumed=null;}error=execution&&(!e.status||e.status===408||e.status>=500)?'The outcome may be uncertain. Recover using the same request key. An existing reservation is never executed again.':e.status===404?'Hosted evaluation is not configured for this organization.':e.status===403||e.status===401?'Current Studio access is required.':e.status===409?'This request or the single-attempt capacity is no longer available. Reopen saved results.':'Evaluation is unavailable. No automatic retry was made.';}return null;}
  finally{if(alive&&ticket===sequence)busy=false;}
 }
 async function refresh(){available=false;semanticsUnavailable=false;attemptConsumed=null;const result=await perform(async signal=>({discovery:await request('/evaluations/cases',{signal}),saved:await request('/evaluations',{signal})}));if(result){cases=result.discovery.cases;available=result.discovery.executionAvailable===true;semanticsUnavailable=result.discovery.executionUnavailableReason==='ambiguous-evidence-semantics';items=result.saved.items;attemptConsumed=typeof result.saved.attemptConsumed==='boolean'?result.saved.attemptConsumed:null;if(!selected)selected=cases[0]?.caseId||'';}}
 async function reveal(){open=!open;if(open)await refresh();}
 async function submit(){if(!pending){if(!selected)return;pending={caseId:selected,idempotencyKey:crypto.randomUUID()};}const body=JSON.stringify(pending);const result=await perform(signal=>request('/evaluations',{method:'POST',body,signal}),true);if(result){detail=result;await refresh();}}
 async function show(recordId){const result=await perform(signal=>request('/evaluations/'+recordId,{signal}));if(result)detail=result;}
</script>
<section aria-label="Hosted claim evaluation" aria-busy={busy}>
 <button onclick={reveal} disabled={busy} aria-expanded={open}>Evaluate a configured claim</button>
 {#if open}
  <p>Run one bounded hosted evaluation against pinned evidence. Typed model probabilities are observations, not verified accuracy or human labels. A consumed or uncertain attempt is never automatically repeated.</p>
  <button onclick={refresh} disabled={busy}>Refresh evaluation cases and saved results</button>
  {#if cases.length}
   <label>Configured case<select bind:value={selected} disabled={busy||!!pending}>{#each cases as item (item.caseId)}<option value={item.caseId}>{item.caseId} · {item.origin}</option>{/each}</select></label>
   {#if selectedCase}<p>{selectedCase.claim}</p><p>Origin: {selectedCase.origin} · Evidence revision <code>{selectedCase.evidenceRevision}</code></p>{/if}
   {#if semanticsUnavailable}<p>New evaluation is unavailable because the configured evidence uses ambiguous legacy comparability semantics. Saved results remain available.</p>{:else if !available}<p>Evaluation credentials are unavailable. No provider request will be sent.</p>{/if}
   <button onclick={submit} disabled={busy||(!available&&!(pending&&semanticsUnavailable))||!selected||(!pending&&attemptConsumed!==false)}>{pending?'Recover the same evaluation attempt':'Run one hosted evaluation'}</button>
   {#if available&&attemptConsumed===null}<p>The configured experiment’s attempt availability could not be verified. Refresh before starting a new evaluation.</p>{/if}
   {#if attemptConsumed===true&&!pending}<p>The configured experiment has already consumed its attempt. Saved results remain available.</p>{/if}
   {#if pending}<p>The request is fixed to case {pending.caseId}. Recovery reuses the same request key. An existing reservation is never executed again.</p>{/if}
  {/if}
  <ul>{#each items as item (item.recordId)}<li><button onclick={()=>show(item.recordId)} disabled={busy}>Reopen {item.caseId} · {item.createdAt}</button></li>{/each}</ul>
  {#if detail}
   <article aria-label="Saved evaluation"><h3>Saved evaluation: {detail.status}</h3><p>Case {detail.caseId} · <code>{detail.recordId}</code></p><p>{detail.createdAt}</p>
    {#if detail.status==='reserved'||detail.status==='indeterminate'}<p>Completion is pending or uncertain. The reserved attempt remains consumed; no new provider call is permitted.</p>{/if}
    {#if detail.evaluation}
     {@const value=detail.evaluation}
     <p>Deterministic checks: {value.deterministic.status} {value.deterministic.reasons.join(', ')}</p>
     <p>Evidence revision <code>{value.case.evidenceRevision}</code></p><p>Evaluator {value.evaluatorVersion} · Checks {value.deterministicVersion}</p>
     <p>Outcome: {value.outcome.status}{value.outcome.reason?' · '+value.outcome.reason:''}</p>
     {#if value.outcome.status==='failed'&&value.outcome.reason==='provider-response'}
      <p>Response validation stage: {validationStage(value.outcome)??'not retained'}.</p>
      <p>This identifies a response check, not a semantic evaluation result. No automatic retry was made.</p>
     {/if}
     {#if value.outcome.status==='observed'}
      <p>Model {value.outcome.model} · Immutable checkpoint: unknown</p><p>Support decision: {value.outcome.answers.support.choice}</p>
      <dl>{#each Object.entries(value.outcome.answers.support.probabilities) as [label,probability] (label)}<dt>{label}</dt><dd>{probability}</dd>{/each}</dl>
      <dl>{#each ['causalOverreach','temporalComparability','identityOverreach','citationSufficiency'] as label (label)}<dt>{label}</dt><dd>{value.outcome.answers[label].probability}</dd>{/each}</dl>
      <p>Input tokens {value.outcome.usage.inputTokens} · Output tokens {value.outcome.usage.outputTokens} · Reported cost USD {value.outcome.reportedCostUsd??'unknown'} · Latency {value.outcome.latencyMs} ms</p>
     {/if}
     {#if value.historicalProvenance}
      {@const history=value.historicalProvenance}
      <section aria-label="Historical evidence provenance">
       <h4>Historical evidence provenance</h4>
       {#if history.projection.version==='historical-store-period-comparability-v1'}<p>This observation used legacy comparability semantics. A false comparable flag did not distinguish unestablished comparability from established non-comparability. The recorded model result is unchanged.</p>{:else if history.projection.version==='historical-store-period-comparability-v2'}<p>Evidence comparability status: not-established. Interpretation: settlement-comparability-status-v1. This is evidence context, separate from the model support decision.</p>{/if}
       <p>This evaluation uses the pinned historical answer and evidence, not the current snapshot.</p>
       <dl>
        <dt>Answer SHA256</dt><dd><code>{history.answer.sha256}</code> · {history.answer.bytes} bytes</dd>
        <dt>Quoted span (Unicode code points, end exclusive)</dt><dd>{history.answer.quoteStart}–{history.answer.quoteEnd}</dd>
        <dt>Historical snapshot SHA256</dt><dd><code>{history.historicalSnapshot.sha256}</code> · {history.historicalSnapshot.bytes} bytes</dd>
        <dt>Neutral state SHA256</dt><dd><code>{history.neutralState.sha256}</code> · {history.neutralState.bytes} bytes</dd>
        <dt>Dataset</dt><dd>{history.dataset.kind} · <code>{history.dataset.sha256}</code></dd>
        <dt>Projection</dt><dd>{history.projection.version}</dd>
        <dt>Reviewed normalizer Git blob</dt><dd><code>{history.projection.normalizerGitBlob}</code></dd>
        <dt>Historical normalizer Git blob</dt><dd><code>{history.historicalNormalizerGitBlob}</code></dd>
        <dt>Evidence selectors</dt><dd>Coverage {history.selector.coverageId} · Comparison {history.selector.comparisonId}</dd>
       </dl>
       <p>{history.dataset.verification}</p><p>{history.historicalRevisionVerification}</p><p>{history.projection.verification}</p><p>{history.qualification}</p>
      </section>
     {/if}
     <p>{value.qualification}</p>
    {/if}
    <p>Pack <code>{detail.packSha256}</code> · Configuration <code>{detail.evaluatorConfigSha256}</code></p>
   </article>
  {/if}
 {/if}
 {#if error}<p role="alert">{error}</p>{/if}{#if busy}<p role="status">Reading or recording the authorized evaluation…</p>{/if}
</section>
<style>
 section,article{min-width:0;margin:1rem 0}article{border:1px solid var(--border,#aaa);padding:1rem}label{display:block;margin:.6rem 0}select{font:inherit;max-width:100%;width:100%}button{max-width:100%;white-space:normal;overflow-wrap:anywhere;margin:.4rem;padding:.5rem}p,code,dd{overflow-wrap:anywhere}dl{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.4rem}dd{margin:0}:focus-visible{outline:2px solid currentColor;outline-offset:2px}
</style>
