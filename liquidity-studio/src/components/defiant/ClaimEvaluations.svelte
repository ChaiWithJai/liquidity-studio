<script>
 import {onDestroy} from 'svelte';
 let {request}=$props();
 let open=$state(false),busy=$state(false),error=$state(''),cases=$state([]),items=$state([]),selected=$state(''),available=$state(false),detail=$state(null),pending=$state(null);
 let alive=true,sequence=0,controller=null;
 const selectedCase=$derived(cases.find(item=>item.caseId===selected));
 onDestroy(()=>{alive=false;sequence++;controller?.abort();});
 async function perform(task,execution=false){
  if(busy)return;const ticket=++sequence;controller=new AbortController();busy=true;error='';
  try{const value=await task(controller.signal);if(!alive||ticket!==sequence)return null;return value;}
  catch(e){if(alive&&ticket===sequence){if(e.status===401||e.status===403){cases=[];items=[];detail=null;available=false;}error=execution&&(!e.status||e.status===408||e.status>=500)?'The outcome may be uncertain. Recover using the same request key. An existing reservation is never executed again.':e.status===404?'Hosted evaluation is not configured for this organization.':e.status===403||e.status===401?'Current Studio access is required.':e.status===409?'This request or the single-attempt capacity is no longer available. Reopen saved results.':'Evaluation is unavailable. No automatic retry was made.';}return null;}
  finally{if(alive&&ticket===sequence)busy=false;}
 }
 async function refresh(){const result=await perform(async signal=>({discovery:await request('/evaluations/cases',{signal}),saved:await request('/evaluations',{signal})}));if(result){cases=result.discovery.cases;available=result.discovery.executionAvailable;items=result.saved.items;if(!selected)selected=cases[0]?.caseId||'';}}
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
   {#if !available}<p>Evaluation credentials are unavailable. No provider request will be sent.</p>{/if}
   <button onclick={submit} disabled={busy||!available||!selected||(!pending&&items.length>0)}>{pending?'Recover the same evaluation attempt':'Run one hosted evaluation'}</button>
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
     {#if value.outcome.status==='observed'}
      <p>Model {value.outcome.model} · Immutable checkpoint: unknown</p><p>Support decision: {value.outcome.answers.support.choice}</p>
      <dl>{#each Object.entries(value.outcome.answers.support.probabilities) as [label,probability] (label)}<dt>{label}</dt><dd>{probability}</dd>{/each}</dl>
      <dl>{#each ['causalOverreach','temporalComparability','identityOverreach','citationSufficiency'] as label (label)}<dt>{label}</dt><dd>{value.outcome.answers[label].probability}</dd>{/each}</dl>
      <p>Input tokens {value.outcome.usage.inputTokens} · Output tokens {value.outcome.usage.outputTokens} · Reported cost USD {value.outcome.reportedCostUsd??'unknown'} · Latency {value.outcome.latencyMs} ms</p>
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
