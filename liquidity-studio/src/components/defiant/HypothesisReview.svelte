<script>
 import {onDestroy} from 'svelte';
 let {request,revision='',onEvidence=()=>{}}=$props();
 let open=$state(false),busy=$state(false),error=$state(''),items=$state([]),detail=$state(null);
 let mode=$state('analysis-expectation'),question=$state(''),expectation=$state(''),priorKnowledge=$state(''),month=$state(''),currency=$state('USD'),targetMonth=$state(''),operator=$state('gte'),threshold=$state(''),supersedes=$state('');
 let kind=$state('evidence-fact'),observationId=$state(''),assertionIndex=$state('0'),observedAt=$state(''),comment=$state('');
 let registrationKey=$state(''),outcomeKey=$state(''),correctionKey=$state('');
 // Keep pending payloads stable through timeout and evidence refresh; they are not persisted client-side.
 let registrationPayload=$state.raw(null),outcomePayload=$state.raw(null),correctionPayload=null;
 let alive=true,sequence=0;// Lifecycle handles are intentionally non-reactive.
 let controllers=[];
 onDestroy(()=>{alive=false;sequence++;for(const c of controllers)c.abort();});
 function editRegistration(){registrationKey='';registrationPayload=null;}
 function editOutcome(){outcomeKey='';outcomePayload=null;}
 function editCorrection(){correctionKey='';correctionPayload=null;}
 async function run(path,body){const c=new AbortController();controllers.push(c);const ticket=++sequence;busy=true;error='';try{const result=await request(path,{...(body?{method:'POST',body:JSON.stringify(body)}:{}),signal:c.signal});return alive&&ticket===sequence?result:null;}catch(e){if(alive&&ticket===sequence)error=body&&(!e.status||e.status===408||e.status>=500)?'The save outcome may be uncertain. Retry unchanged to reuse the same request and read back any saved result.':e.message;return null;}finally{controllers=controllers.filter(value=>value!==c);if(alive&&ticket===sequence)busy=false;}}
 function accept(value){detail=value;comment='';editOutcome();editCorrection();}
 async function list(){const value=await run('/hypotheses');if(value)items=value.items;}
 async function show(id){const value=await run('/hypotheses/'+id);if(value)accept(value);}
 async function register(){if(!registrationPayload){registrationKey=crypto.randomUUID();registrationPayload={idempotencyKey:registrationKey,mode,question,expectation,priorKnowledge,baseline:{revision,month,currency},target:{month:targetMonth,currency,metric:'source-total-earned'},criterion:{metric:'source-total-earned',currency,operator,threshold},supersedesHypothesisId:supersedes||null};}const value=await run('/hypotheses',registrationPayload);if(value){accept(value);editRegistration();}}
 async function link(){if(!detail)return;if(!outcomePayload){outcomeKey=crypto.randomUUID();outcomePayload={idempotencyKey:outcomeKey,kind,reference:kind==='evidence-fact'?{revision}:{observationId,assertionIndex:Number(assertionIndex)},observedAt:observedAt||null};}const value=await run('/hypotheses/'+detail.hypothesis.hypothesisId+'/outcome',outcomePayload);if(value)accept(value);}
 async function correct(){if(!correctionPayload){correctionKey=crypto.randomUUID();correctionPayload={idempotencyKey:correctionKey,comment};}const value=await run('/hypotheses/'+detail.hypothesis.hypothesisId+'/correction',correctionPayload);if(value){detail=value;editCorrection();}}
 function inspect(rev){onEvidence({evidenceMode:'earnings',evidenceRevision:rev});}
</script>
<section aria-label="Registered expectations">
 <button aria-expanded={open} onclick={()=>open=!open}>Register and review an expectation</button>
 {#if open}
 <p>Register an expectation without inventing an answer. A later numerical check does not establish a blind prediction, causal effect or commercial approval.</p>
 <p>Current evidence revision: <code>{revision||'Unavailable'}</code>. Saved baselines remain fixed when current evidence changes.</p>
 {#if registrationPayload&&registrationPayload.baseline.revision!==revision}<p role="status">Pending registration retry retains baseline revision <code>{registrationPayload.baseline.revision}</code>. Edit a registration field to start a different request.</p>{/if}
 <fieldset disabled={busy}><legend>New registration</legend>
 <label>Expectation type<select bind:value={mode} onchange={editRegistration}><option value="analysis-expectation">Expectation about an analysis</option><option value="future-period-outcome">Future business period</option></select></label>
 {#if mode==='analysis-expectation'}<p>Historical periods are allowed. Registration precedes a later capture, not necessarily your knowledge of the data.</p>{:else}<p>A future target must begin after registration. Business evaluation remains unavailable without verified series identity and completeness, even after the period ends.</p>{/if}
 <label>Analysis question<textarea bind:value={question} oninput={editRegistration} maxlength="2048"></textarea></label>
 <label>Expectation<textarea bind:value={expectation} oninput={editRegistration} maxlength="2048"></textarea></label>
 <label>Already known or inspected evidence<textarea bind:value={priorKnowledge} oninput={editRegistration} maxlength="2048"></textarea></label>
 <label>Baseline month (YYYY-MM)<input bind:value={month} oninput={editRegistration}/></label>
 <label>Registration currency<input bind:value={currency} oninput={editRegistration} maxlength="3"/></label>
 <label>Frozen target month (YYYY-MM)<input bind:value={targetMonth} oninput={editRegistration}/></label>
 <p>Metric: source-total-earned. The criterion compares the later absolute reported amount, not a change, profit or ROI.</p>
 <label>Criterion operator<select bind:value={operator} onchange={editRegistration}><option value="lt">Less than</option><option value="lte">At most</option><option value="eq">Equal to</option><option value="gte">At least</option><option value="gt">Greater than</option></select></label>
 <label>Exact decimal threshold<input bind:value={threshold} oninput={editRegistration}/></label>
 <label>Superseded registration ID (optional)<input bind:value={supersedes} oninput={editRegistration}/></label>
 <button disabled={!revision&&!registrationPayload} onclick={register}>Register expectation</button>
 </fieldset>
 <button disabled={busy} onclick={list}>Refresh registered expectations</button>
 <ul>{#each items as item(item.hypothesisId)}<li><button disabled={busy} onclick={()=>show(item.hypothesisId)}>{item.question} · {item.registeredAt}</button></li>{/each}</ul>
 {#if detail}
 <article aria-label="Saved registration"><h3>Saved registration</h3>
 <p>{detail.hypothesis.question}</p><p>{detail.hypothesis.expectation}</p>
 <p>ID <code>{detail.hypothesis.hypothesisId}</code> · Registered {detail.hypothesis.registeredAt} · {detail.hypothesis.actorId}</p>
 <p>Mode: {detail.hypothesis.mode} · Evaluator: {detail.hypothesis.evaluatorVersion}</p>
 <p>Attributed prior knowledge: {detail.hypothesis.priorKnowledge}</p>
 <p>Frozen baseline: {detail.hypothesis.baseline.month} · {detail.hypothesis.baseline.amount} {detail.hypothesis.baseline.currency} · {detail.hypothesis.baseline.metric}</p>
 <p>Baseline revision <code>{detail.hypothesis.baseline.revision}</code> · Source <code>{detail.hypothesis.baseline.sourceHash}</code></p><p>{detail.hypothesis.baseline.qualification}</p>
 <button disabled={busy} onclick={()=>inspect(detail.hypothesis.baseline.revision)}>Open earnings at baseline revision</button>
 <p>Frozen target: {detail.hypothesis.target.month} · {detail.hypothesis.target.currency} · {detail.hypothesis.target.metric}</p>
 <p>Criterion: {detail.hypothesis.criterion.operator} {detail.hypothesis.criterion.threshold} {detail.hypothesis.criterion.currency}</p><p>{detail.hypothesis.temporalQualification}</p>
 {#if detail.hypothesis.supersedesHypothesisId}<p>Supersedes <code>{detail.hypothesis.supersedesHypothesisId}</code></p>{/if}
 {#if !detail.outcome}
 {#if outcomePayload?.kind==='evidence-fact'&&outcomePayload.reference.revision!==revision}<p role="status">Pending result retry retains evidence revision <code>{outcomePayload.reference.revision}</code>. Edit a result field to start a different request.</p>{/if}
 <fieldset disabled={busy}><legend>Link one result</legend>
 <label>Result type<select bind:value={kind} onchange={editOutcome}><option value="evidence-fact">Current evidence for frozen target</option><option value="answer-assertion">Saved answer assertion</option></select></label>
 {#if kind==='evidence-fact'}<p>Reads only the frozen target at revision <code>{revision||'Unavailable'}</code>. Target month and currency cannot be changed.</p>{:else}
 <label>Saved observation ID<input bind:value={observationId} oninput={editOutcome}/></label><label>Assertion index (0–4)<select bind:value={assertionIndex} onchange={editOutcome}>{#each [0,1,2,3,4] as i(i)}<option value={String(i)}>{i}</option>{/each}</select></label>
 <p>A saved answer assertion is not a business outcome. Earlier observations remain retrospective.</p>{/if}
 <label>Attributed result observation time (optional ISO UTC)<input bind:value={observedAt} oninput={editOutcome}/></label>
 <button disabled={kind==='evidence-fact'&&!revision&&!outcomePayload} onclick={link}>Link selected result</button></fieldset>
 {:else}
 <section aria-label="Linked result"><h4>Linked result</h4><p>Criterion result: {detail.outcome.evaluation.result}</p><p>Reason: {detail.outcome.evaluation.reason||'None'} · Meaning: {detail.outcome.evaluation.meaning}</p><p>{detail.outcome.temporalQualification}</p>
 <p>Recorded {detail.outcome.recordedAt} by {detail.outcome.actorId} · Attributed observed time: {detail.outcome.observedAt||'Unknown'} (unverified)</p>
 <p>Result revision <code>{detail.outcome.revision||'Unknown'}</code></p><p>Evidence reuse: {detail.outcome.evidenceReuse} · Revision changed: {String(detail.outcome.revisionChanged)} · Source hash changed: {String(detail.outcome.sourceHashChanged)}</p>
 {#if detail.outcome.fact}<p>Reported fact: {detail.outcome.fact.amount} {detail.outcome.fact.currency} · {detail.outcome.fact.month} · {detail.outcome.fact.metric}</p><p>{detail.outcome.fact.qualification}</p><p>Source <code>{detail.outcome.fact.sourceHash}</code></p>{:else}<p>No unique compatible fact established; absence is not zero.</p>{/if}
 {#if detail.outcome.observation}<p>Linked observation <code>{detail.outcome.observation.observationId}</code> · Assertion {detail.outcome.observation.assertionIndex} · Captured {detail.outcome.observation.createdAt}</p><p>Answer hash <code>{detail.outcome.observation.answerHash}</code></p>{#if detail.outcome.observation.selectedResult}<div aria-label="Linked answer assertion checks"><p>Declared answer value: {detail.outcome.observation.selectedResult.assertion.value} {detail.outcome.observation.selectedResult.assertion.currency}</p><p>Answer quote: {detail.outcome.observation.selectedResult.assertion.span.text}</p><p>Recorded answer amount check: {detail.outcome.observation.selectedResult.amountCheck} · Currency check: {detail.outcome.observation.selectedResult.currencyCheck}</p><p>Answer evidence period: {detail.outcome.observation.selectedResult.period||'Unknown'} · {detail.outcome.observation.selectedResult.periodQualification}</p><p>{detail.outcome.observation.selectedResult.limitation}</p></div>{/if}<p>The criterion evaluates the linked source fact; it does not certify that the recorded answer matches it. Answer semantics and model execution are not independently verified.</p>{/if}</section>
 {#if detail.correction}<h4>Attributed correction</h4><p>{detail.correction.comment}</p><p>{detail.correction.actorId} · {detail.correction.createdAt}</p><p>{detail.correction.qualification}</p>{:else}<label>One result correction<textarea bind:value={comment} oninput={editCorrection} maxlength="2048" disabled={busy}></textarea></label><button disabled={busy||!comment} onclick={correct}>Save attributed correction</button>{/if}
 {/if}</article>
 {/if}{/if}
 {#if error}<p role="alert">{error}</p>{/if}{#if busy}<p role="status">Saving or reading scoped registration…</p>{/if}
</section>
<style>
 section{min-width:0;margin:1rem 0}fieldset{min-width:0}label{display:block;margin:.6rem 0}input,textarea,select{box-sizing:border-box;display:block;width:100%;max-width:100%;font:inherit}textarea{min-height:4rem}button{max-width:100%;white-space:normal;overflow-wrap:anywhere;margin:.4rem;padding:.5rem}p,code,h3,h4{overflow-wrap:anywhere}article{border:1px solid var(--border,#aaa);padding:1rem}:focus-visible{outline:2px solid currentColor;outline-offset:2px}
</style>
