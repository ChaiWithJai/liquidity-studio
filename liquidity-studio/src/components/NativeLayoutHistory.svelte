<script>
  import {onDestroy} from 'svelte';
  let {request,storyId,format,scopeKey,getScopeKey,onOpen=()=>{}}=$props();
  let rows=$state.raw(null),selected=$state(''),busy=$state(false),error=$state('');
  let disposed=false;onDestroy(()=>{disposed=true});
  const current=(story,f,scope)=>!disposed&&storyId===story&&format===f&&getScopeKey()===scope;
  async function load(){
    if(busy)return;const story=storyId,f=format,scope=scopeKey;busy=true;error='';rows=null;selected='';
    try{const result=await request(`/api/studio/native-editor/documents?storyId=${encodeURIComponent(story)}&format=${encodeURIComponent(f)}`);if(current(story,f,scope)){rows=result.documents;selected=rows[0]?.id||''}}
    catch(failure){if(current(story,f,scope))error=failure.message}
    finally{if(current(story,f,scope))busy=false}
  }
</script>
<details class="native-history"><summary>Saved native layouts</summary>
  <button type="button" disabled={busy} onclick={load}>{busy?'Loading layouts…':'Load saved layouts'}</button>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if rows?.length}<label>Saved layout <select aria-label="Saved layout" bind:value={selected}>{#each rows as row(row.id)}<option value={row.id}>{row.title} · version {row.revision}{row.requiresSourceReview?' · historical, source review required':''}</option>{/each}</select></label><button type="button" disabled={busy||!selected} onclick={()=>onOpen(selected)}>Open selected layout</button>
  {:else if rows}<p role="status">No saved layouts for this story and format.</p>{/if}
</details>
<style>.native-history{padding:.6rem 1rem;border:1px solid #d1d5db;background:#f8fafc}.native-history summary{cursor:pointer}label{display:block;margin:.5rem 0}select{display:block;max-width:100%;padding:.45rem}button{margin:.25rem .5rem .25rem 0;padding:.45rem .7rem}button:focus-visible,select:focus-visible{outline:3px solid #174ba7;outline-offset:2px}</style>
