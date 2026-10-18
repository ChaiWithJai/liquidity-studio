<script>
  import {onDestroy,onMount} from 'svelte';
  import {createEditorRecoveryKit} from '../lib/editor-recovery-kit.js';
  let {actorId,organizationId,brandId,scopeKey,getScopeKey,request,onRestored=()=>{},recoveryOnly=false,initialStatus=null,onRecovered=()=>{}}=$props();
  let pack=$state.raw(null),preview=$state.raw(null),destination=$state.raw(null),journal=$state.raw(null),intent=$state.raw(null);
  let busy=$state(false),uncertain=$state(false),capacityRejected=$state(false),error=$state(''),notice=$state(''),name=$state(''),preset=$state('liquidity_desk'),acknowledged=$state(false);
  let fileHash=$state(''),locator=$state.raw(null),disposed=false,sequence=0;
  const storageKey=()=>`studio-recovery:${actorId}:${organizationId}:${brandId}`;
  const current=()=>!disposed&&getScopeKey()===scopeKey;
  onDestroy(()=>{disposed=true;sequence++;pack=null;});
  onMount(()=>{
    if(recoveryOnly){journal=initialStatus;destination={scope:{organizationId,brandId}};return;}
    try{const saved=JSON.parse(localStorage.getItem(storageKey())||'null');if(saved?.actorId===actorId&&saved?.sourceOrganizationId===organizationId&&saved?.sourceBrandId===brandId){locator=saved;destination=saved.destination||null;}}catch{}
  });
  function persist(value){locator=value;try{if(value)localStorage.setItem(storageKey(),JSON.stringify(value));else localStorage.removeItem(storageKey());}catch{notice='Browser recovery storage is unavailable. Keep this page and the pack file until recovery is confirmed.';}}
  const sha=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  async function selectFile(event){
    if(busy||uncertain)return;const file=event.currentTarget.files?.[0],ticket=++sequence;
    error='';notice='';pack=null;preview=null;fileHash='';acknowledged=false;
    if(!file)return;if(file.size>48*1024*1024){error='Choose a JSON pack no larger than 48 MiB.';return;}
    busy=true;
    try{
      const bytes=await file.arrayBuffer(),hash=await sha(bytes),value=JSON.parse(new TextDecoder().decode(bytes));
      if(!current()||ticket!==sequence)return;
      if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value.documents)||!Array.isArray(value.assets)||!Array.isArray(value.files)||typeof value.sha256!=='string'||!/^[a-f0-9]{64}$/.test(value.sha256))throw new Error('Choose a supported JSON editor pack. The server will validate its contents before restoration.');
      if(locator&&(locator.fileSha256!==hash||locator.packSha256!==value.sha256))throw new Error('Reselect the exact pack used by the retained recovery request. Keep its current destination unchanged.');
      pack=value;fileHash=hash;preview={schemaVersion:value.schemaVersion,documents:value.documents.length,assets:value.assets.length,files:value.files.length,bytes:file.size,sourceBrand:typeof value.scope?.brandId==='string'?value.scope.brandId:'Unknown'};
      if(locator?.destination)destination=locator.destination;
    }catch(failure){if(current()&&ticket===sequence)error=failure.message||'This JSON file could not be read.';}
    finally{if(current()&&ticket===sequence)busy=false;}
  }
  async function exportPack(kit=false){
    if(busy||uncertain)return;busy=true;error='';
    try{const value=await request('/api/admin/editor-pack/export');if(!current())return;const bundle=kit?await createEditorRecoveryKit(value):null;if(!current())return;const url=URL.createObjectURL(new Blob([bundle?bundle.bytes:JSON.stringify(value)],{type:bundle?'application/zip':'application/json'}));const a=document.createElement('a');a.href=url;a.download=bundle?bundle.filename:`studio-editor-pack-${brandId}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),0);notice=bundle?'Recovery kit downloaded. Extract it and start with RESTORE.md. To restore here, choose its studio-editor-pack.json file. Keep the kit private.':'Pack downloaded. Keep it private; it contains source evidence and owned artwork, not sign-in credentials.';}
    catch(failure){if(current())error=failure.message||'Export was not available. Settle edits and retry.';}
    finally{if(current())busy=false;}
  }
  function rememberIntent(value){intent=value;persist({...value,actorId,sourceOrganizationId:organizationId,sourceBrandId:brandId,fileSha256:fileHash||locator?.fileSha256,packSha256:pack?.sha256||locator?.packSha256,destination:destination||locator?.destination});}
  async function createDestination(){
    if(busy||uncertain||!pack||destination||!name.trim())return;
    rememberIntent({operation:'destination',idempotencyKey:crypto.randomUUID(),name:name.trim(),preset});await execute();
  }
  function options(key){
    const owners=[];const addOwner=id=>{if(!owners.includes(id))owners.push(id);};for(const doc of pack.documents){for(const field of ['createdBy','updatedBy'])if(typeof doc?.metadata?.[field]==='string')addOwner(doc.metadata[field]);for(const row of doc?.history||[])if(typeof row?.updatedBy==='string')addOwner(row.updatedBy);}
    for(const asset of pack.assets)if(typeof asset?.metadata?.createdBy==='string')addOwner(asset.metadata.createdBy);
    return {target:{organizationId:destination.scope.organizationId,brandId:destination.scope.brandId},principalRemap:Object.fromEntries(owners.map(owner=>[owner,actorId])),sourceReviewAcknowledged:true,idempotencyKey:key};
  }
  async function install(){
    if(busy||uncertain||!pack||!destination||!acknowledged)return;
    rememberIntent({operation:'install',idempotencyKey:crypto.randomUUID()});await execute();
  }
  async function execute(){
    if(busy)return;const retained=intent||locator;if(!retained)return;
    if(retained.operation==='install'&&(!pack||pack.sha256!==retained.packSha256&&retained.packSha256)){error='Reselect the exact retained pack before retrying restoration.';return;}
    busy=true;uncertain=false;capacityRejected=false;error='';notice='';
    try{
      if(retained.operation==='destination'){
        const result=await request('/api/admin/editor-pack/destinations',{method:'POST',body:JSON.stringify({organizationId,name:retained.name,preset:retained.preset,idempotencyKey:retained.idempotencyKey})});
        if(!current())return;destination=result;intent=null;persist({actorId,sourceOrganizationId:organizationId,sourceBrandId:brandId,fileSha256:fileHash||locator.fileSha256,packSha256:pack?.sha256||locator.packSha256,destination:result});notice='A new empty recovery brand is ready. No existing brand was replaced.';
      }else if(retained.operation==='install'){
        const result=await request('/api/admin/editor-pack/install',{method:'POST',body:JSON.stringify({pack,options:options(retained.idempotencyKey)})},destination.scope);
        if(!current())return;journal={status:'completed',result};intent=null;uncertain=false;persist({...locator,operation:'completed',idempotencyKey:retained.idempotencyKey});notice='Restored into the new brand. Native layouts and prepared evidence remain historical until current-owner review.';await onRestored(destination.scope);
      }
    }catch(failure){if(current()){capacityRejected=failure.status===507&&['RESTORE_CAPACITY_INSUFFICIENT','RESTORE_CAPACITY_UNAVAILABLE'].includes(failure.data?.code);uncertain=!capacityRejected&&(!failure.status||failure.status>=500);if(!uncertain&&!capacityRejected)intent=null;error=uncertain?'The outcome is unknown. Keep this exact pack and retry the retained request; do not create another destination.':failure.message||'Recovery was rejected. Inspect its current status.';}}
    finally{if(current())busy=false;}
  }
  async function checkStatus(){
    const target=destination?.scope||locator?.destination?.scope;if(!target||busy)return;busy=true;error='';
    try{const value=await request('/api/admin/editor-pack/status',{},target);if(!current())return;journal=value;if(value.packSha256&&locator?.packSha256&&value.packSha256!==locator.packSha256){error='This destination belongs to a different pack. Keep your retained file and inspect the current installation before taking action.';return;}if(value.status==='completed'){uncertain=false;notice='The server confirms the retained destination was restored. Select its name in the Brand menu to inspect it. This status check did not run an installation.';}else if(value.status==='empty')notice='The destination has no active installation. Reselect the exact pack before continuing.';else notice='Installation is interrupted. Recover this reserved destination before retrying the same pack.';}
    catch(failure){if(current())error=failure.message||'Recovery status could not be checked.';}
    finally{if(current())busy=false;}
  }
  async function rollback(){
    if(busy||!journal?.canRollback)return;busy=true;error='';
    try{await request('/api/admin/editor-pack/rollback',{method:'POST',body:JSON.stringify({installationId:journal.installationId})},destination?.scope||locator.destination.scope);if(!current())return;journal={status:'empty'};uncertain=false;notice='The interrupted installation was rolled back to its empty recovery destination.';
      if(recoveryOnly){try{await onRecovered();}catch{if(current())error='Rollback was recorded, but the workspace could not reload. Retry loading this brand.';}}
      else notice+=' Reselect the same pack and retry the retained installation.';}
    catch(failure){if(current())error=failure.message||'Rollback was not confirmed. Check recovery status before retrying.';}
    finally{if(current())busy=false;}
  }
  function clearCompleted(){if(busy||!['empty','completed'].includes(journal?.status))return;persist(null);pack=null;preview=null;destination=null;journal=null;intent=null;uncertain=false;capacityRejected=false;acknowledged=false;fileHash='';notice='Browser recovery locator cleared. No server brand or artifact was deleted.';}
  function resume(){
    if(!locator||busy)return;intent=locator;
    if(locator.operation==='install'&&!pack){error='Reselect the exact retained pack, then retry this request.';return;}
    destination=locator.destination||destination;execute();
  }
</script>
<section class="panel recovery" aria-label="Portable brand recovery" aria-busy={busy}>
  <h2>Portable brand recovery</h2>
  {#if recoveryOnly}
    <p>Only recovery controls are available while this brand is reserved.</p>
    <button class="secondary" disabled={busy} onclick={checkStatus}>Refresh recovery status</button>
  {:else}
  <p>Download this brand’s private editor pack, or restore a pack into a new empty brand. Existing brands are never replaced.</p>
  <button class="primary" disabled={busy||uncertain} onclick={()=>exportPack(true)}>Download recovery kit (ZIP)</button><p>The kit includes your exact editor pack, readable licensed fonts/notices, checksums and a restore guide. Extract it first, then choose studio-editor-pack.json below. For each registered Penpot design, open its saved campaign and use Download Penpot recovery kit when available; keep both kits.</p>
  <button class="secondary" disabled={busy||uncertain} onclick={()=>exportPack()}>Download current brand pack</button>
  <label>Choose private editor pack (up to 48 MiB)<input type="file" accept="application/json,.json" disabled={busy||uncertain} onchange={selectFile}/></label>
  {#if preview}<div aria-label="Unvalidated pack preview"><strong>Unvalidated file preview</strong><p>{preview.documents} layouts · {preview.assets} images · {preview.files} files · schema {preview.schemaVersion}. These are untrusted file claims; server validation happens before installation.</p></div>{/if}
  {#if locator}<p>A recovery request is retained for this account and source brand. No pack bytes or credentials are stored in the browser.</p>{#if locator.destination}<button class="secondary" disabled={busy} onclick={checkStatus}>Check retained recovery status</button>{/if}{#if !uncertain&&!capacityRejected&&(locator.operation==='destination'||locator.operation==='install')&&journal?.originalActor!==false}<button class="secondary" disabled={busy||locator.operation==='install'&&!pack||['installing','rolling-back'].includes(journal?.status)} onclick={resume}>Retry retained recovery request</button>{/if}{/if}
  {#if pack&&!destination}<label>New recovery brand name<input bind:value={name} maxlength="160" disabled={busy||uncertain}/></label><label>Recovery brand preset<select bind:value={preset} disabled={busy||uncertain}><option value="liquidity_desk">The Liquidity Desk</option><option value="vedic_dharma">Chai With Jai</option></select></label><button disabled={busy||uncertain||!name.trim()} onclick={createDestination}>Create new empty recovery brand</button>{/if}
  {#if destination}<p>New destination: <strong>{destination.brand.name}</strong></p>{/if}
  {#if pack&&destination&&!capacityRejected&&(!journal||journal.status==='empty')}<label class="attestation"><input type="checkbox" bind:checked={acknowledged} disabled={busy||uncertain}/>I reviewed this exact pack and explicitly map its retained owners to my current account. I attest to approved nonclinical sources only. Prepared-copy and native approvals remain historical; clinical sources require their separate review.</label><button disabled={busy||uncertain||!acknowledged} onclick={install}>Restore into this new brand</button>{/if}
  {#if uncertain||capacityRejected}{#if uncertain}<p role="status">The request outcome is uncertain.</p>{:else}<p role="status">Recovery stopped before writing restore data. Keep this pack and destination, free disk space or restore storage access, then retry the retained request.</p>{/if}<button class="secondary" disabled={busy||intent?.operation==='install'&&!pack} onclick={()=>execute()}>Retry same recovery request</button>{/if}
  {/if}
  {#if journal}<p aria-label="Recovery status">Recovery status: {journal.status}</p>{#if journal.canRollback}<button class="secondary" disabled={busy} onclick={rollback}>Recover interrupted empty destination</button>{/if}{#if !recoveryOnly && ['empty','completed'].includes(journal.status)}<button class="secondary" disabled={busy} onclick={clearCompleted}>Clear finished recovery locator</button>{/if}{/if}
  {#if notice}<p role="status">{notice}</p>{/if}{#if error}<p role="alert">{error}</p>{/if}
</section>
<style>
.recovery{display:grid;gap:.8rem;align-content:start}.recovery h2,.recovery p{margin:0}.recovery label{display:grid;gap:.35rem}.recovery input,.recovery select{max-width:100%;padding:.5rem}.attestation{grid-template-columns:auto 1fr;align-items:start}.attestation input{margin-top:.3rem}.recovery button{justify-self:start}
</style>
