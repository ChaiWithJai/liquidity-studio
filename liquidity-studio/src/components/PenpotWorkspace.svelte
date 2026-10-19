<script>
  import {onMount} from 'svelte';
  import {readPenpotSaveState} from '../lib/penpot-workspace.js';
  let {design,storyTitle,brandName,formatName,onReturn,onSaveStateChange=()=>{}}=$props();
  let loaded=$state(false),saveState=$state('unknown'),revision=$state(null),frame;
  let nonce='';
  const labels={unknown:'Save status unavailable',clean:'No unsaved changes',editing:'Finish editing to save',pending:'Unsaved changes',saving:'Saving…',saved:'Saved',error:'Changes could not be saved'};
  function resetFrame(){
    nonce=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
    loaded=true;saveState='unknown';revision=null;onSaveStateChange('unknown');observe();
  }
  function observe(){if(frame?.contentWindow&&nonce)frame.contentWindow.postMessage({type:'studio-penpot-observe',version:1,nonce,fileId:design.fileId},new URL(design.frameUrl).origin);}
  onMount(()=>{
    const receive=event=>{
      const value=readPenpotSaveState(event,{source:frame?.contentWindow,origin:new URL(design.frameUrl).origin,nonce,fileId:design.fileId});
      if(!value)return;
      saveState=value.status;revision=value.revision;onSaveStateChange(saveState);
    };
    window.addEventListener('message',receive);
    const timer=setInterval(observe,1000);
    return()=>{clearInterval(timer);window.removeEventListener('message',receive);};
  });
</script>
<section class="design-workspace" aria-label="Campaign design workspace">
  <header>
    <div><strong>{brandName} · {formatName}</strong><span title={storyTitle}>{storyTitle}</span><span role="status">{labels[saveState]}{(saveState==='saved'||saveState==='clean')&&revision!==null?` · revision ${revision}`:''}</span></div>
    <nav aria-label="Design workspace actions">
      <button class="secondary" onclick={onReturn}>Return to copy and preview</button>
      <a href={design.frameUrl} target="_blank" rel="noopener noreferrer">Open in separate tab ↗</a>
    </nav>
  </header>
  <details>
    <summary>About this workspace</summary>
    <p>Save and export with the Penpot controls below. The status above distinguishes a pristine loaded design from an acknowledged save. Finish text entry with the Move tool before waiting for Saved. If status is unavailable, check the editor before leaving. Native layout edits do not change the reviewed Studio copy.</p>
    <p>If sign-in or an editor feature cannot open here, use the separate tab, then return to this same saved design.</p>
  </details>
  {#if !loaded}<p role="status">Opening your saved design…</p>{/if}
  <iframe bind:this={frame} title={`${formatName} design for ${storyTitle}`} src={design.frameUrl} allow="clipboard-read; clipboard-write; fullscreen" allowfullscreen onload={resetFrame}></iframe>
</section>
<style>
  .design-workspace { display:flex; flex-direction:column; gap:8px; min-width:0; }
  header { display:flex; align-items:center; justify-content:space-between; gap:12px; }
  header div { display:grid; gap:2px; min-width:0; }
  header span { font-size:13px; color:var(--muted,#616571); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:55vw; }
  nav { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
  a,summary { font-size:13px; }
  details p { max-width:80ch; font-size:13px; margin:8px 0; }
  iframe { width:100%; height:calc(100dvh - 170px); min-height:480px; border:1px solid #ddd; border-radius:8px; background:#18181b; }
  @media(max-width:720px){header{align-items:flex-start;flex-direction:column}header span{max-width:90vw}iframe{height:calc(100dvh - 210px)}}
</style>
