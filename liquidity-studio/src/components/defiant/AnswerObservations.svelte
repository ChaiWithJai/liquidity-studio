<script>
 import {onDestroy} from 'svelte';
 let {request,revision}=$props();
 let observedAt=$state(''),hostLabel=$state(''),modelId=$state('');
 let open=$state(false),question=$state(''),answer=$state(''),rows=$state([{kind:'selection',reference:'',value:'',currency:'USD',quote:'',receiptId:'',cell:''}]),items=$state([]),detail=$state(null),comment=$state(''),error=$state(''),busy=$state(false),key=$state('');
 let alive=true,sequence=0;// Request controllers are non-rendered lifecycle handles, not reactive view state.
 let controllers=[];
 onDestroy(()=>{alive=false;sequence++;for(const c of controllers)c.abort();});
 async function run(path,body){const c=new AbortController();controllers.push(c);const ticket=++sequence;busy=true;error='';try{const value=await request(path,{...(body?{method:'POST',body:JSON.stringify(body)}:{}),signal:c.signal});if(!alive||ticket!==sequence)return null;return value;}catch(e){if(alive&&ticket===sequence)error=path==='/observations'&&body&&(!e.status||e.status===408||e.status>=500)?'The save outcome may be uncertain. Retry without editing to reuse the same request key and retrieve any saved result.':e.message;return null;}finally{controllers=controllers.filter(value=>value!==c);if(alive&&ticket===sequence)busy=false;}}
 async function list(){const result=await run('/observations');if(result)items=result.items;}
 async function show(id){const result=await run('/observations/'+id);if(result){detail=result;comment='';}}
 async function capture(){
  try{const assertions=rows.map(row=>{if(!row.quote||answer.indexOf(row.quote)!==answer.lastIndexOf(row.quote)||!answer.includes(row.quote))throw Error('Each quoted answer span must occur exactly once.');const start=Array.from(answer.slice(0,answer.indexOf(row.quote))).length;return {kind:row.kind,value:row.value,currency:row.currency,span:{start,end:start+Array.from(row.quote).length,text:row.quote},reference:row.kind==='selection'?{selectionId:row.reference}:{month:row.reference},receipt:row.receiptId?{receiptId:row.receiptId,cell:row.cell}:null};});
   if(!key)key=crypto.randomUUID();const result=await run('/observations',{idempotencyKey:key,question,answer,revision,assertions,observedAt:observedAt||null,hostLabel:hostLabel||null,modelId:modelId||null});if(result){detail=result;key='';}
  }catch(e){error=e.message;}
 }
 async function correct(){const result=await run('/observations/'+detail.observation.observationId+'/correction',{comment});if(result)detail=result;}
 function edited(){key='';}
</script>
<section aria-label="Answer evidence observations">
 <button onclick={()=>open=!open} aria-expanded={open}>Record and inspect an observed answer</button>
 {#if open}
 <p>Record an answer you actually observed. These checks compare declared numbers with this evidence revision; they do not verify the whole answer, causality or model quality.</p>
 <p>Evidence revision: <code>{revision}</code></p>
 <label>Question<textarea bind:value={question} oninput={edited} maxlength="2048" disabled={busy}></textarea></label>
 <label>Observed answer<textarea bind:value={answer} oninput={edited} maxlength="16384" disabled={busy}></textarea></label>
 <label>Observed at (optional ISO UTC timestamp)<input bind:value={observedAt} oninput={edited} disabled={busy}/></label><label>Host (optional, attributed)<input bind:value={hostLabel} oninput={edited} disabled={busy}/></label><label>Model (optional, attributed)<input bind:value={modelId} oninput={edited} disabled={busy}/></label>
 {#each rows as row,index (index)}
 <fieldset disabled={busy}><legend>Numerical assertion {index+1}</legend>
 <label>Source<select bind:value={row.kind} onchange={edited}><option value="selection">Source selection amount</option><option value="earnings">Monthly earnings amount</option></select></label>
 <label>{row.kind==='selection'?'Selection identifier':'Sales month (YYYY-MM)'}<input bind:value={row.reference} oninput={edited}/></label>
 <label>Exact signed decimal<input bind:value={row.value} oninput={edited}/></label><label>Currency<input bind:value={row.currency} oninput={edited} maxlength="3"/></label>
 <label>Exact quote from answer<input bind:value={row.quote} oninput={edited}/></label>
 <label>Optional curated receipt identifier<input bind:value={row.receiptId} oninput={edited}/></label><label>Receipt cell name<input bind:value={row.cell} oninput={edited}/></label>
 <button disabled={busy||rows.length===1} onclick={()=>{rows=rows.filter((_,i)=>i!==index);edited();}}>Remove assertion {index+1}</button>
 </fieldset>
 {/each}
 <button disabled={busy||rows.length>=5} onclick={()=>{rows=[...rows,{kind:'selection',reference:'',value:'',currency:'USD',quote:'',receiptId:'',cell:''}];edited();}}>Add assertion</button>
 <button disabled={busy||!revision} onclick={capture}>Check and save observed answer</button>
 <button disabled={busy} onclick={list}>Refresh saved observations</button>
 <ul>{#each items as item (item.observationId)}<li><button disabled={busy} onclick={()=>show(item.observationId)}>{item.question} · {item.createdAt}</button></li>{/each}</ul>
 {#if detail}
 <article><h3>Saved observation</h3><p>{detail.observation.question}</p><pre>{detail.observation.answer}</pre><p>Revision <code>{detail.observation.evidenceRevision}</code> · User-supplied observation · Model execution unverified</p>
 <p>Attributed observed time: {detail.observation.attributedMetadata?.observedAt||'Unknown'} · Host: {detail.observation.attributedMetadata?.hostLabel||'Unknown'} · Model: {detail.observation.attributedMetadata?.modelId||'Unknown'}. These supplied values are not verified execution evidence.</p>
 {#each detail.observation.results as result,index (index)}<section><h4>{result.assertion.span.text}</h4><p>Amount: {result.amountCheck} · Currency: {result.currencyCheck} · Semantic support: unknown</p>{#if result.fact}<p>Source amount: {result.fact.amount} {result.fact.currency} · <code>{result.fact.sourceHash}</code></p>{/if}<p>Metric: {result.fact?.metric||'Unknown'}</p><p>{result.fact?.qualification||'No matching source fact'}</p><p>Period: {result.period||'Unknown'}</p>{#if result.receipt}<p>Curated receipt cell exists: {String(result.receipt.exists)} · Source matches fact: {String(result.receipt.sourceMatchesFact)}</p><p>{result.receipt.member} · record {result.receipt.record} · {result.receipt.cell}</p><p>{result.receipt.qualification}</p>{/if}<p>{result.limitation}</p></section>{/each}
 {#if detail.correction}<h4>Submitted reviewer correction</h4><p>{detail.correction.comment}</p><p>{detail.correction.actorId} · {detail.correction.createdAt}</p><p>{detail.correction.qualification}</p>{:else}<label>One attributed correction<textarea bind:value={comment} maxlength="2048" disabled={busy}></textarea></label><button disabled={busy||!comment} onclick={correct}>Save reviewer correction</button>{/if}</article>
 {/if}
 {/if}
 {#if error}<p role="alert">{error}</p>{/if}{#if busy}<p role="status">Checking authorized evidence…</p>{/if}
</section>
<style>
 section{margin:1rem 0;min-width:0}label{display:block;margin:.6rem 0}input,textarea,select{display:block;box-sizing:border-box;max-width:100%;width:100%;font:inherit}textarea{min-height:5rem}fieldset{min-width:0}button{max-width:100%;white-space:normal;overflow-wrap:anywhere;margin:.4rem;padding:.5rem}code,p,pre,h4{overflow-wrap:anywhere}pre{white-space:pre-wrap}article{border:1px solid var(--border,#aaa);padding:1rem}:focus-visible{outline:2px solid currentColor;outline-offset:2px}
</style>
