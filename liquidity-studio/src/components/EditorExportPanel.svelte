<script>
  import {onDestroy,onMount} from 'svelte';
  let {record,stages=[],request,scopeKey,getScopeKey,dirty=false,ready=false,onExported=()=>{}}=$props();
  let preview=$state.raw(null),busy=$state(false),error=$state(''),receipt=$state.raw(null);
  let retainedStages=$state.raw([]);
  let availableStages=$derived([...new Map([...retainedStages,...stages].map(stage=>[stage.artifactId,stage])).values()]);
  let pending=null;
  let disposed=false;
  onDestroy(()=>{disposed=true;});
  const current=(id,revision,scope)=>!disposed&&getScopeKey()===scope&&record.id===id&&record.revision===revision;
  onMount(()=>{
    const id=record.id,revision=record.revision,scope=scopeKey;
    request(`/api/studio/native-editor/documents/${id}/exports`).then(result=>{if(current(id,revision,scope))retainedStages=result;}).catch(failure=>{if(current(id,revision,scope)&&failure.status!==409)error='Prepared PNGs could not be reloaded. Retry opening this saved layout.';});
  });
  async function open(stage){
    if(busy)return;const id=record.id,revision=record.revision,scope=scopeKey;
    busy=true;error='';receipt=null;
    try{
      const result=await request(`/api/studio/native-editor/documents/${id}/exports/${stage.artifactId}`);
      if(current(id,revision,scope)){preview=result;pending=null;}
    }catch{if(current(id,revision,scope))error='The private PNG could not be opened. Saved work is unchanged.';}
    finally{if(current(id,revision,scope))busy=false;}
  }
  async function approveAndDownload(){
    if(busy||dirty||!ready||!preview)return;
    const id=record.id,revision=record.revision,scope=scopeKey,image=preview;
    busy=true;error='';
    try{
      const base=`/api/studio/native-editor/documents/${id}/exports/${image.artifactId}`;
      const envelope=pending||await request(`${base}/signoff`,{method:'POST',body:JSON.stringify({sha256:image.sha256,reviewed:true})});
      if(!current(id,revision,scope)||preview?.artifactId!==image.artifactId)return;
      pending=envelope;
      const result=await request(`${base}/complete`,{method:'POST',body:JSON.stringify(pending)});
      if(!current(id,revision,scope))return;
      const bytes=Uint8Array.from(atob(image.base64),char=>char.charCodeAt(0));
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');
      if(hash!==result.sha256||bytes.length!==result.size)throw new Error('The download did not match the verified receipt.');
      if(!current(id,revision,scope))return;
      receipt=result;onExported(result);const url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
      const link=document.createElement('a');link.href=url;link.download=`${id}-page-${image.pageIndex+1}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
    }catch(failure){if(current(id,revision,scope))error=failure.status===403?'A current founder or designated brand approver must sign off this PNG. If the sign-off expired, prepare a new PNG.':failure.status===409?'The source, layout or review changed. Reopen the current saved layout before exporting.':'Export was not confirmed. Retry this same PNG to reconcile its receipt.';}
    finally{if(current(id,revision,scope))busy=false;}
  }
</script>

<section aria-label="Verified PNG export" aria-busy={busy}>
  <h3>PNG export</h3>
  <p>After approving the saved layout, choose “Prepare approved PNGs” in the canvas toolbar.</p>
  {#each availableStages.filter(stage=>stage.nativeId===record.id&&stage.nativeRevision===record.revision) as stage (stage.artifactId)}
    <button disabled={busy} onclick={()=>open(stage)}>Review page {stage.pageIndex+1}</button>
  {/each}
  {#if preview?.nativeId===record.id&&preview?.nativeRevision===record.revision}
    <figure><img src={`data:image/png;base64,${preview.base64}`} alt={`Prepared PNG for page ${preview.pageIndex+1}`} /><figcaption>Page {preview.pageIndex+1} · saved version {preview.nativeRevision}</figcaption></figure>
    <button disabled={busy||dirty||!ready} onclick={approveAndDownload}>{busy?'Confirming export…':'Approve this PNG and download'}</button>
    {#if dirty}<p role="status">Save and review your changed layout before exporting.</p>{/if}
  {/if}
  {#if receipt?.nativeId===record.id}<p role="status">PNG verified · page {receipt.pageIndex+1} · {receipt.size} bytes. This records a file export.</p>{/if}
  {#if error}<p role="alert">{error}</p>{/if}
</section>

<style>
  section{padding:.75rem 1rem;border-bottom:1px solid #c9cdd4;background:#fff;color:#15171b;font:14px/1.5 sans-serif;}
  h3,p{margin:0 0 .5rem;}button{padding:.45rem .7rem;margin:0 .5rem .5rem 0;border:1px solid #69717c;border-radius:.3rem;background:white;color:inherit;}button:disabled{opacity:.55;}
  figure{margin:.5rem 0;}img{display:block;width:min(100%,270px);height:auto;border:1px solid #c9cdd4;}figcaption{margin-top:.3rem;}
</style>
