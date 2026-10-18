<script>
  import {onMount, onDestroy} from 'svelte';
  let {request, storyId, format, storyRevision, generationId, onStateChange = () => {}, compact = false} = $props();
  let loading = $state(true), busy = $state(false), error = $state(''), rejected = $state(false);
  let result = $state(null), attempt = $state(null);
  let styleAttempt=$state(null),styleReceipt=$state(null),styleCapability=$state(''),styleError=$state(''),styleNotice=$state(''),styleRejected=$state(false);
  let copyNotice=$state('');
  let svgUrl=$state(''),svgError=$state('');
  let recoveryUrl=$state(''),recoveryError=$state(''),recoveryContext=$state('');
  const currentRecoveryContext=$derived(JSON.stringify([storyId,format,storyRevision,generationId,result?.design?.fileId]));
  async function prepareSvg(){
    if(busy||loading||!openUrl)return;busy=true;svgUrl='';svgError='';
    const saved={storyId,format,expectedRevision:storyRevision,generationId,fileId:result.design.fileId,nativeUrl:openUrl};
    try{
      const fresh=await request(`/api/studio/penpot/designs?storyId=${encodeURIComponent(saved.storyId)}&format=${encodeURIComponent(saved.format)}`);
      if(!alive)return;
      if(storyId!==saved.storyId||format!==saved.format||storyRevision!==saved.expectedRevision||generationId!==saved.generationId||openUrl!==saved.nativeUrl)throw Error('The campaign changed. Reopen its saved design before saving SVG.');
      const design=fresh.design;
      if(design?.status!=='ready'||design.fileId!==saved.fileId||design.storyId!==saved.storyId||design.generationId!==saved.generationId||design.nativeUrl!==saved.nativeUrl||!Number.isSafeInteger(design.nativeRevision)||design.nativeRevision<0)throw Error(fresh.reason||'The saved design is unavailable. Reopen it before saving SVG.');
      result=fresh;
      const value=await request('/api/studio/penpot/designs/svg',{method:'POST',body:JSON.stringify({storyId:saved.storyId,format:saved.format,expectedRevision:saved.expectedRevision,generationId:saved.generationId,expectedNativeRevision:design.nativeRevision})});
      if(alive&&value.downloadUrl?.startsWith('http://localhost:39008/studio-save-svg?permit='))svgUrl=value.downloadUrl;
    }
    catch(failure){if(alive)svgError=failure.message;}finally{if(alive){busy=false;if(refreshPending){refreshPending=false;void load();}}}
  }
  async function prepareRecovery(){
    if(busy||loading||!openUrl)return;busy=true;recoveryUrl='';recoveryError='';
    const savedContext=currentRecoveryContext;
    const saved={storyId,format,expectedRevision:storyRevision,generationId,fileId:result.design.fileId,nativeUrl:openUrl};
    try{
      const fresh=await request(`/api/studio/penpot/designs?storyId=${encodeURIComponent(saved.storyId)}&format=${encodeURIComponent(saved.format)}`);
      if(!alive)return;
      if(storyId!==saved.storyId||format!==saved.format||storyRevision!==saved.expectedRevision||generationId!==saved.generationId||openUrl!==saved.nativeUrl)throw Error('The campaign changed. Reopen its saved design before downloading its recovery kit.');
      const design=fresh.design;
      if(design?.status!=='ready'||design.fileId!==saved.fileId||design.storyId!==saved.storyId||design.generationId!==saved.generationId||design.nativeUrl!==saved.nativeUrl||!Number.isSafeInteger(design.nativeRevision)||design.nativeRevision<0)throw Error(fresh.reason||'The saved design is unavailable. Reopen it before downloading its recovery kit.');
      result=fresh;
      const value=await request('/api/studio/penpot/designs/recovery',{method:'POST',body:JSON.stringify({storyId:saved.storyId,format:saved.format,expectedRevision:saved.expectedRevision,generationId:saved.generationId,expectedNativeRevision:design.nativeRevision})});
      if(alive&&currentRecoveryContext===savedContext&&openUrl===saved.nativeUrl&&value.downloadUrl?.startsWith('http://localhost:39008/studio-recovery-kit?permit=')){recoveryUrl=value.downloadUrl;recoveryContext=savedContext;}
    }
    catch(failure){if(alive)recoveryError=failure.message;}finally{if(alive){busy=false;if(refreshPending){refreshPending=false;void load();}}}
  }
  const pluginManifestUrl='http://localhost:39039/manifest.json';
  async function copyStyleValue(value,label){
    try{await navigator.clipboard.writeText(value);if(alive)copyNotice=`${label} copied.`;}
    catch{if(alive)copyNotice=`Copy unavailable. Select the ${label.toLowerCase()} field and copy it manually.`;}
  }
  const savedStyleAction=$derived(styleReceipt||result?.design?.styles?.action);
  let alive = true, refreshPending = false, loadSequence = 0;
  export function refreshAccess() {
    if (!alive) return;
    if (busy) { refreshPending = true; return; }
    void load();
  }
  onDestroy(() => { alive = false; loadSequence++; });
  onMount(() => { void load(); });
  function nativeDesignUrl(value){
    try{const url=new URL(value);return (url.protocol==='https:'||url.origin==='http://localhost:39008')&&!url.username&&!url.password&&url.pathname==='/'&&url.hash.startsWith('#/workspace?team-id=')?value:'';}catch{return '';}
  }
  const nativeUrl = $derived(result?.design?.nativeUrl || '');
  const openUrl = $derived(result?.design?.status === 'ready' && nativeDesignUrl(nativeUrl) ? nativeUrl : '');
  function reportState(design) {
    onStateChange(design?.status === 'ready' && nativeDesignUrl(design.nativeUrl) ? 'ready' : design?.status === 'pending' ? 'pending' : 'unknown');
  }
  async function load() {
    const ticket = ++loadSequence;
    loading = true; error = ''; onStateChange('unknown');
    try {
      const value = await request(`/api/studio/penpot/designs?storyId=${encodeURIComponent(storyId)}&format=${encodeURIComponent(format)}`);
      if (alive && ticket === loadSequence) { result = value; attempt = value.design?.status === 'ready' ? null : attempt || value.design?.retry || null; reportState(value.design); }
    } catch (failure) { if (alive && ticket === loadSequence) error = failure.message; }
    finally { if (alive && ticket === loadSequence) loading = false; }
  }
  async function prepareStyles(){
    if(busy||loading||!result?.design?.styles?.needsRefresh)return;
    styleAttempt ||= (!styleRejected&&savedStyleAction?.status!=='native-state-verified'?savedStyleAction?.retry:null)||{storyId,format,expectedRevision:storyRevision,generationId,expectedBrandRevision:result.design.styles.currentBrandRevision,expectedNativeRevision:result.design.nativeRevision,idempotencyKey:crypto.randomUUID()};
    busy=true;styleError='';styleNotice='';
    try{const value=await request('/api/studio/penpot/designs/styles',{method:'POST',body:JSON.stringify(styleAttempt)});if(!alive)return;styleReceipt=value;styleCapability=value.nativeActionCapability||'';styleRejected=false;styleNotice=value.status==='native-state-verified'?'Saved native colors were verified.':'Color update prepared. Apply the one-use code in the linked Penpot design, then check saved colors.';if(value.status==='native-state-verified'){styleAttempt=null;await load();}}
    catch(failure){if(alive){styleError=failure.message;styleRejected=Number.isInteger(failure.status)&&failure.status>=400&&failure.status<500;if(styleRejected){styleAttempt=null;styleCapability='';}else styleNotice='The reply was interrupted. Retry this same color update or check its saved outcome.';}}
    finally{if(alive){busy=false;if(refreshPending){refreshPending=false;void load();}}}
  }
  async function checkStyles(){
    if(busy||loading)return;busy=true;styleError='';
    try{if(savedStyleAction){const value=await request(`/api/studio/penpot/designs/styles/${savedStyleAction.id}/reconcile`,{method:'POST',body:'{}'});if(!alive)return;styleReceipt=value;if(value.status==='native-state-verified'){styleAttempt=null;styleCapability='';styleNotice='Saved native colors were verified. Your design remains the same file.';}else styleNotice='The new colors are not saved yet. Apply the pending update in Penpot before checking again.';}await load();}
    catch(failure){if(alive)styleError=failure.message;}finally{if(alive){busy=false;if(refreshPending){refreshPending=false;void load();}}}
  }
  async function create() {
    if (busy || loading) return;
    attempt ||= {storyId, format, expectedRevision: storyRevision, generationId, idempotencyKey: crypto.randomUUID()};
    busy = true; error = ''; rejected = false;
    try {
      const design = await request('/api/studio/penpot/designs', {method:'POST', body:JSON.stringify(attempt)});
      if (!alive) return;
      result = {...result, design};
      reportState(design);
      attempt = design.status === 'pending' ? design.retry || attempt : null;
    } catch (failure) { if (alive) { onStateChange('unknown'); error = failure.message; rejected = Number.isInteger(failure.status) && failure.status >= 400 && failure.status < 500; } }
    finally { if (alive) { busy = false; if (refreshPending) { refreshPending = false; void load(); } } }
  }
</script>
<section class={["penpot-design-action", {compact}]} aria-label="Campaign design in Penpot">
  {#if !compact}<h3>Design your campaign</h3>{/if}
  {#if loading}<p role="status">Finding this campaign’s design…</p>
  {:else if !error && openUrl}<a class="primary" href={openUrl} target="_blank" rel="noopener noreferrer">Open design in Penpot ↗</a><p>Edits save in Penpot. This Studio preview keeps the reviewed source copy.</p>{#if result.design.styles?.needsRefresh}<p>Brand Kit styles changed. This existing design and your Penpot edits are preserved.</p>{#if result.design.styles.refreshAvailable}<button class="secondary" disabled={busy||loading} onclick={prepareStyles}>{busy?'Preparing colors…':styleRejected?'Prepare a new color update':styleAttempt?'Retry same color update':'Refresh Brand Kit colors'}</button><button class="secondary" disabled={busy||loading} onclick={checkStyles}>Check saved colors</button>{/if}{/if}
  {:else if !error && (result?.available || attempt || result?.design)}<button class="primary" disabled={busy||rejected} onclick={create}>{busy?'Creating design…':attempt?'Retry design creation':result?.design?'Resume design creation':'Create design in Penpot'}</button><p>Create an editable design from the saved copy and brand.</p>
  {:else if result?.reason}<p>{result.reason}</p>{/if}
  {#if !loading && openUrl && result?.svgAvailable}<button class="secondary" disabled={busy} onclick={prepareSvg}>{busy?'Preparing download…':'Save SVG'}</button>
    <p>Draft SVG of this format’s first board, with licensed fonts embedded. Save changes in Penpot first. Images outside the verified export set are not supported.</p>
    {#if svgUrl}<a href={svgUrl} target="_blank" rel="noopener noreferrer">Download draft SVG ↗</a><p>This one-use download expires in two minutes. Use your connected Penpot account.</p>{/if}
    {#if svgError}<p role="alert">{svgError}</p>{/if}
  {/if}
  {#if !loading && openUrl && result?.recoveryAvailable}
    <button class="secondary" disabled={busy} onclick={prepareRecovery}>{busy?'Preparing download…':'Download Penpot recovery kit'}</button>
    <p>Native design, media and fonts. Save Penpot changes first.</p>
    {#if recoveryUrl && recoveryContext===currentRecoveryContext}<a href={recoveryUrl} target="_blank" rel="noopener noreferrer">Download prepared Penpot kit ↗</a><p>One use · expires in two minutes.</p>{/if}
    {#if recoveryError}<p role="alert">{recoveryError}</p>{/if}
  {/if}
  {#if styleCapability}<section class="style-handoff" aria-label="Apply saved Brand Kit colors">
    <ol>
      <li>Open this design’s Plugins menu and add the Studio plugin.</li>
      <li>Paste the one-use code into the plugin and apply colors.</li>
      <li>Return here and choose Check saved colors.</li>
    </ol>
    <label>Plugin manifest<input readonly value={pluginManifestUrl} aria-label="Plugin manifest URL"/></label>
    <button class="secondary" onclick={()=>copyStyleValue(pluginManifestUrl,'Manifest URL')}>Copy manifest URL</button>
    <label>One-use Penpot code<input readonly value={styleCapability} aria-label="One-use Penpot code"/></label>
    <button class="secondary" onclick={()=>copyStyleValue(styleCapability,'Code')}>Copy code</button>
    <p>Code expires after one minute. Only bound colors change; text and layout stay intact.</p>
    {#if copyNotice}<p role="status">{copyNotice}</p>{/if}
  </section>{/if}
  {#if styleError}<p role="alert">{styleError}</p>{/if}{#if styleNotice}<p role="status">{styleNotice}</p>{/if}
  {#if error}<p role="alert">{error}</p>{#if rejected}<button onclick={()=>window.location.reload()}>Reload saved campaign</button>{:else}<button disabled={loading||busy} onclick={load}>Check design again</button>{/if}{/if}
</section>
<style>
  .penpot-design-action{display:grid;gap:.4rem;padding:.8rem 1rem;border:1px solid var(--border,#d1d5db);border-radius:.6rem}
  .style-handoff{display:grid;gap:.4rem}.style-handoff ol{margin:.2rem 0;padding-left:1.4rem}.style-handoff label{display:grid;gap:.2rem}.style-handoff input{width:100%;min-width:0;box-sizing:border-box}
  h3,p{margin:0}a,button{justify-self:start;min-height:42px;align-content:center}
  .compact{border:0;padding:0;gap:.3rem .65rem;align-content:center}
  .compact a,.compact button{min-height:34px}
  .compact p{font-size:.75rem;max-width:38rem}
</style>
