<script>
  import {onDestroy} from 'svelte';
  let {record,request,scopeKey,getScopeKey,dirty=false,ready=false,getCanvasEpoch=()=>0,onRefreshed=()=>{}}=$props();
  let checked=$state.raw(null),busy=$state(false),error=$state(''),notice=$state('');
  let pending=$state.raw(null),disposed=false;
  onDestroy(()=>{disposed=true;});
  const current=(id,revision,scope)=>!disposed&&getScopeKey()===scope&&record.id===id&&record.revision===revision;
  async function check(){
    if(busy||pending)return;
    const id=record.id,revision=record.revision,scope=scopeKey;
    busy=true;error='';notice='';
    try{const value=await request(`/api/studio/native-editor/documents/${id}`);if(current(id,revision,scope)){checked=value;if(value.revision!==revision)error='A newer saved layout exists. Reload it explicitly before refreshing styles.';}}
    catch{if(current(id,revision,scope))error='Brand styles could not be checked. Your canvas is unchanged.';}
    finally{if(current(id,revision,scope))busy=false;}
  }
  async function refresh(){
    if(busy||dirty||!ready||(!pending&&(!checked||checked.revision!==record.revision||checked.currentBrandRevision===record.origin.brandRevision)))return;
    const id=record.id,revision=record.revision,scope=scopeKey,canvasEpoch=getCanvasEpoch();
    pending ||= {expectedRevision:revision,expectedOldBrandRevision:record.origin.brandRevision,expectedBrandRevision:checked.currentBrandRevision,idempotencyKey:crypto.randomUUID()};
    busy=true;error='';notice='';
    try{
      const result=await request(`/api/studio/native-editor/documents/${id}/brand-tokens`,{method:'POST',body:JSON.stringify(pending)});
      if(!current(id,revision,scope))return;
      const latest=await request(`/api/studio/native-editor/documents/${id}`);
      if(!current(id,revision,scope))return;
      if(latest.revision!==result.revision||latest.sourceState!=='current'){pending=null;error='The saved layout or Brand Kit changed again. Your open canvas is preserved; reload and check the current version.';return;}
      pending=null;
      onRefreshed(latest,{id,revision,scope,canvasEpoch});
      notice='Brand styles saved as a new layout version. Review it again before exporting.';
    }catch(failure){if(current(id,revision,scope)){if(failure.status>=400&&failure.status<500)pending=null;error=failure.status===409?'The source, Brand Kit or saved layout changed. Preserve your edits and reload the current version.':failure.status===403?'Current access to this brand is required.':'Refresh was not confirmed. Retry the same request to recover its receipt.';}}
    finally{if(current(id,revision,scope))busy=false;}
  }
</script>
<section aria-label="Native brand styles" aria-busy={busy}>
  <h3>Brand styles</h3>
  <button disabled={busy||!ready||!!pending} onclick={check}>Check saved Brand Kit</button>
  {#if pending||checked?.revision===record.revision&&checked?.currentBrandRevision!==record.origin.brandRevision}
    <p>Brand Kit changes are available for this saved layout. Native copy and placement will be preserved.</p>
    <button disabled={busy||dirty||!ready} onclick={refresh}>{pending?'Retry saved brand refresh':'Refresh saved brand styles'}</button>
  {:else if checked}<p>Saved styles match the current Brand Kit.</p>{/if}
  {#if dirty}<p role="status">Save or explicitly resolve your native edits before refreshing styles.</p>{/if}
  {#if notice}<p role="status">{notice}</p>{/if}
  {#if error}<p role="alert">{error}</p>{/if}
</section>
<style>
section{padding:.75rem 1rem;border-bottom:1px solid #c9cdd4;background:#fff;color:#15171b;font:14px/1.5 sans-serif}h3,p{margin:0 0 .5rem}button{padding:.45rem .7rem;margin:0 .5rem .5rem 0;border:1px solid #69717c;border-radius:.3rem;background:white;color:inherit}button:disabled{opacity:.55}
</style>
