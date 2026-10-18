<script>
  import {onDestroy} from 'svelte';
  let {record,request,scopeKey,getScopeKey,canRebind=false,canReviewSource=false,onRebound=()=>{},onReviewSource=()=>{}}=$props();
  let plan=$state.raw(null),pending=$state.raw(null),busy=$state(false),error=$state(''),notice=$state('');
  let disposed=false;
  onDestroy(()=>{disposed=true});
  const current=(id,revision,scope)=>!disposed&&record.id===id&&record.revision===revision&&getScopeKey()===scope;
  async function check(){
    if(busy||pending)return;const id=record.id,revision=record.revision,scope=scopeKey;busy=true;error='';notice='';plan=null;
    try{const value=await request(`/api/studio/native-editor/documents/${id}/rebind-plan`);if(current(id,revision,scope))plan=value}
    catch(failure){if(current(id,revision,scope))error=failure.message}
    finally{if(current(id,revision,scope))busy=false}
  }
  async function createCopy(){
    if(busy||(!plan&&!pending))return;const id=record.id,revision=record.revision,scope=scopeKey;
    const body=pending||{planSha256:plan.planSha256,expectedHistoricalRevision:revision,confirmed:true,idempotencyKey:crypto.randomUUID()};
    pending=body;busy=true;error='';notice='';let saved=false;
    try{
      const receipt=await request(`/api/studio/native-editor/documents/${id}/rebind`,{method:'POST',body:JSON.stringify(body)});saved=true;
      if(!current(id,revision,scope))return;
      const latest=await request(`/api/studio/native-editor/documents/${receipt.id}`);
      if(!current(id,revision,scope))return;
      if(latest.id!==receipt.id||latest.revision!==receipt.revision||latest.sourceState!=='current'){
        pending=null;plan=null;notice='The copy was created, but its saved version changed. Open it from Saved native layouts; this historical layout is unchanged.';return;
      }
      pending=null;plan=null;await onRebound(latest);
    }catch(failure){if(current(id,revision,scope)){
      if(failure.status>=400&&failure.status<500){pending=null;plan=null;error=saved?'The copy was created, but current access or source binding changed. Restore access and open the saved copy explicitly.':failure.message}
      else error=saved?'The copy was created, but opening it was not confirmed. Retry the same request to recover it.':'Creating the copy was not confirmed. Retry the same request to recover it.';
    }}finally{if(current(id,revision,scope))busy=false}
  }
</script>
<section aria-label="Historical layout recovery" class="rebind-panel">
  <h4>Create a reviewed-source copy</h4>
  <p>The historical layout stays unchanged. Review and adopt its saved campaign copy first. The new editable layout keeps human wording and geometry, adopts current brand styles, and needs a new layout review.</p>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if notice}<p role="status">{notice}</p>{/if}
  {#if canReviewSource}<button type="button" disabled={busy||!!pending} onclick={onReviewSource}>Review current campaign copy</button>{:else}<p>Source review is unavailable in this workspace. A founder must restore it before creating an editable copy.</p>{/if}
  {#if canRebind}
    <button type="button" disabled={busy||!!pending} onclick={check}>{busy&&!pending?'Checking source binding…':'Check source binding'}</button>
    {#if plan}<p>Historical layout version {plan.historicalRevision} → current story revision {plan.storyRevision}, {plan.pageCount} page{plan.pageCount===1?'':'s'}. No old approval is transferred.</p>{/if}
    {#if plan||pending}<button type="button" disabled={busy} onclick={createCopy}>{busy?'Creating editable copy…':pending?'Retry creating editable copy':'Create editable copy'}</button>{/if}
  {:else}<p>A founder must review the saved source copy and create the new layout proposal.</p>{/if}
</section>
<style>.rebind-panel{padding:1rem;border:1px solid #d1d5db;background:#f8fafc}.rebind-panel h4{margin:0 0 .5rem}.rebind-panel p{max-width:75ch}button{margin:.25rem .5rem .25rem 0;padding:.45rem .7rem}button:focus-visible{outline:3px solid #174ba7;outline-offset:2px}[role=alert]{color:#992222}</style>
