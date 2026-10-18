<script>
  import {onDestroy} from 'svelte';
  let {request,storyId,format,storyRevision,generationId,onconnected=()=>{}}=$props();
  let nativeUrl=$state(''),manifest=$state(null),preview=$state(null),pages=$state({}),busy=$state(false),error=$state(''),attempt=$state(null);
  let alive=true;onDestroy(()=>{alive=false;});
  async function readManifest(event){
    preview=null;attempt=null;error='';const file=event.currentTarget.files?.[0];
    if(!file)return;
    if(file.size>32768){error='Choose the recovery-manifest.json from your version 2 kit (at most 32 KiB).';return;}
    try{manifest=JSON.parse(await file.text());}catch{manifest=null;error='This recovery manifest is not valid JSON.';}
  }
  const base=()=>({storyId,format,expectedRevision:storyRevision,generationId,nativeUrl,manifest});
  async function inspect(){busy=true;error='';preview=null;attempt=null;const saved=base();
    try{const value=await request('/api/studio/penpot/designs/reconnect-preview',{method:'POST',body:JSON.stringify(saved)});if(!alive||JSON.stringify(base())!==JSON.stringify(saved))return;preview=value;pages=Object.fromEntries(['infographic','carousel','story','reel'].map(f=>[f,value.pages.find(p=>new RegExp('^'+f+' 1(?: |$)').test(p.name))?.id||'']));}
    catch(e){if(alive)error=e.message;}finally{if(alive)busy=false;}
  }
  async function connect(){busy=true;error='';attempt||={...base(),expectedNativeRevision:preview.nativeRevision,fileSha256:preview.fileSha256,pages:Object.entries(pages).map(([format,id])=>({format,id})),idempotencyKey:crypto.randomUUID()};
    try{const value=await request('/api/studio/penpot/designs/reconnect',{method:'POST',body:JSON.stringify(attempt)});if(alive){attempt=null;onconnected(value);preview=null;}}
    catch(e){if(alive){error=e.message;if(Number.isInteger(e.status)&&e.status>=400&&e.status<500)attempt=null;}}finally{if(alive)busy=false;}
  }
</script>
<details><summary>Reconnect an imported Penpot design</summary>
  <p>Import your design and restore its fonts first. This links it to this saved copy without changing the native file or restoring approval.</p>
  <label>Recovery manifest<input type="file" accept=".json,application/json" onchange={readManifest} disabled={busy||Boolean(attempt)}/></label>
  <label>Imported design link<input type="url" bind:value={nativeUrl} oninput={()=>{preview=null;}} placeholder="Paste the Penpot workspace link" disabled={busy||Boolean(attempt)}/></label>
  <button class="secondary" onclick={inspect} disabled={busy||!manifest||!nativeUrl||Boolean(attempt)}>Inspect imported design</button>
  {#if preview}
    <p>Choose the imported page to open for each format. The destination is your currently configured Penpot workspace.</p>
    {#each ['infographic','carousel','story','reel'] as f (f)}<label>{f}<select bind:value={pages[f]} disabled={busy||Boolean(attempt)}><option value="">Choose a page</option>{#each preview.pages as page (page.id)}<option value={page.id}>{page.name}</option>{/each}</select></label>{/each}
    <button class="secondary" onclick={connect} disabled={busy||Object.values(pages).some(id=>!id)}>{busy?'Reconnecting…':attempt?'Retry same reconnection':'Reconnect this imported design'}</button>
    {#if attempt}<p>The operation is retained. Retry the same reconnection before changing its mapping.</p>{/if}
  {/if}
  {#if error}<p role="alert">{error}</p>{/if}
</details>
<style>details{margin-top:12px}summary{cursor:pointer}label{display:block;margin:8px 0}input,select{display:block;width:100%;max-width:34rem}p{max-width:65ch}</style>
