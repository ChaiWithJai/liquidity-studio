<script>
 import {onDestroy,untrack} from 'svelte';
 let {request,revision,organizationId,configured=false,filters={},sessionId='',offset=0,onSession=()=>{},onSource=()=>{}}=$props();
 let query=$state(''),busy=$state(false),error=$state(''),result=$state(null);
 let sequence=0,controller,pending,alive=true;
 function cancel(){sequence++;controller?.abort();}
 onDestroy(()=>{alive=false;cancel();});
 function valid(value){return value?.scope?.organizationId===organizationId&&value.revision===revision&&value.mode==='semantic'&&typeof value.sessionId==='string'&&/^[a-f0-9]{64}$/.test(value.sessionId)&&Array.isArray(value.items)&&value.items.length<=100&&Number.isInteger(value.offset)&&value.offset>=0&&value.offset<=256&&value.limit===25&&(value.nextOffset===null||Number.isInteger(value.nextOffset)&&value.nextOffset===value.offset+25)&&Number.isFinite(Date.parse(value.expiresAt))&&Number.isInteger(value.total)&&value.total>=0&&value.total<=256&&value.items.every(r=>typeof r.id==='string'&&typeof r.sha256==='string'&&/^[a-f0-9]{64}$/.test(r.sha256)&&Number.isFinite(r.similarity)&&['root','member'].includes(r.kind)&&(r.kind==='root'?typeof r.filename==='string':Array.isArray(r.chain)&&r.chain.every(x=>typeof x==='string')));}
 async function run(path,body,expected){cancel();const ticket=sequence;controller=new AbortController();busy=true;error='';try{const value=await request(path,{...(body?{method:'POST',body:JSON.stringify(body)}:{}),signal:controller.signal});if(!alive||ticket!==sequence)return null;if(!valid(value)||(expected&&(value.sessionId!==expected.sessionId||value.offset!==expected.offset)))throw Error('Semantic response context changed. Refresh evidence.');result=value;return value;}catch(e){if(alive&&ticket===sequence){result=null;error=body&&(!e.status||e.status===408||e.status>=500)?'The query outcome may be uncertain. Retry unchanged to reuse this request key; no automatic retry is made.':e.message;}return null;}finally{if(alive&&ticket===sequence)busy=false;}}
 async function submit(event){event.preventDefault();if(!configured||busy||!revision||!query.trim())return;const exactFilters=Object.fromEntries(Object.entries(filters).filter(([key,value])=>key!=='query'&&value));const shape={mode:'semantic',revision,query, ...exactFilters},signature=JSON.stringify(shape);if(pending?.signature!==signature)pending={signature,body:{...shape,idempotencyKey:crypto.randomUUID()}};const value=await run('/retained-sources',pending.body);if(value)onSession(value.sessionId,0);}
 function page(next){onSession(result.sessionId,next);}
 $effect(()=>{const id=sessionId,start=offset,pin=revision;untrack(()=>{if(!id){cancel();result=null;busy=false;return;}if(!/^[a-f0-9]{64}$/.test(id)||!pin||!Number.isInteger(start)||start<0||start>256){error='Invalid saved semantic session.';return;}void run('/retained-sources?'+new URLSearchParams({mode:'semantic-page',sessionId:id,revision:pin,offset:String(start),limit:'25'}),undefined,{sessionId:id,offset:start});});});
</script>
<section class="semantic" aria-label="Semantic metadata suggestions" aria-busy={busy}>
 <h3>Semantic metadata suggestions</h3>
 <p>Find filenames and declared periods using a natural-language query. File contents, financial cells and customer records are not vector-searched. Similarity does not prove an answer or a source identity.</p>
 {#if configured}
 <form onsubmit={submit}><label>Metadata question<input maxlength="200" bind:value={query} disabled={busy}/></label><button disabled={busy||!query.trim()||!revision}>Run one semantic search</button></form>
 <p class="meta">Submitting uses one capped hosted embedding request. Exact source filters above still apply. Paging and reload reuse the saved session for up to 15 minutes.</p>
 {:else}<p role="status">Semantic search is not configured for this evidence source. Keyword search and exact filters remain available.</p>{/if}
 {#if error}<p role="alert">{error}</p>{/if}
 {#if result}
 <p>{result.total} filtered metadata suggestions · expires {result.expiresAt}</p><p>Applied exact filters: {Object.entries(result.filters||{}).map(([key,value])=>`${key}: ${value}`).join(' · ')||'None'}</p>
 <ol start={result.offset+1}>{#each result.items as row (row.id)}<li><h4>{row.filename||row.chain?.join(' → ')||row.id}</h4><p>{row.kind} · {row.format} · similarity {row.similarity.toFixed(4)} (ranking signal)</p><button onclick={()=>onSource(row.sha256)}>Inspect exact source hash</button></li>{/each}</ol>
 <nav aria-label="Semantic result pages"><button disabled={busy||result.offset===0} onclick={()=>page(Math.max(0,result.offset-result.limit))}>Previous suggestions</button><span>{result.total?result.offset+1:0}–{result.offset+result.items.length} of {result.total}</span><button disabled={busy||result.nextOffset===null} onclick={()=>page(result.nextOffset)}>Next suggestions</button><button disabled={busy} onclick={()=>onSession('',0)}>Close suggestions</button></nav>
 {/if}
</section>
<style>
 .semantic{margin:12px var(--research-space,16px);padding:16px;border:1px solid var(--research-line);border-radius:6px;min-width:0}.semantic p,.semantic h4{overflow-wrap:anywhere}.semantic form,.semantic nav{display:flex;align-items:end;flex-wrap:wrap;gap:12px}.semantic label{display:grid;gap:6px;min-width:0;flex:1}.semantic input{width:100%;box-sizing:border-box}.semantic li{padding:10px 0}.semantic button{max-width:100%}.meta{font-size:13px}button:focus-visible,input:focus-visible{outline:2px solid var(--research-accent);outline-offset:2px}
</style>
