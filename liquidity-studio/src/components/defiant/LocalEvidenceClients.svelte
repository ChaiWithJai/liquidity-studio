<script>
 import {onMount,onDestroy} from 'svelte';
 let {organizationId,request}=$props();
 let code=$state(''),inspection=$state(null),grants=$state([]),busy=$state(false),notice=$state(''),error=$state(''),listed=$state(false),clock=$state(Date.now());
 let alive=true,pending=null;
 const id=value=>typeof value==='string'&&/^[a-f0-9]{32}$/.test(value);
 const name=value=>typeof value==='string'&&value.length>0&&value.length<=80&&!/[\x00-\x1f\x7f]/.test(value);
 const expiry=value=>Number.isSafeInteger(value)&&value>clock;
 const approved=$derived(inspection?.approved===true);
 const ready=$derived(inspection&&inspection.pairingId===code&&inspection.organizationId===organizationId&&inspection.expiresAt>clock&&!approved);
 onMount(()=>{const timer=setInterval(()=>clock=Date.now(),1000);return ()=>clearInterval(timer);});
 onDestroy(()=>{alive=false;pending?.abort();});
 function changed(event){code=event.currentTarget.value.trim();inspection=null;notice='';error='';}
 async function action(operation,extra={}){
  if(busy||!alive)return;busy=true;error='';notice='';const org=organizationId;pending=new AbortController();
  try{
   const result=await request(operation,{organizationId:org,...extra},{signal:pending.signal});
   if(!alive||org!==organizationId)return;
   if(operation==='inspect'){
    if(result?.organizationId!==org||result.pairingId!==extra.pairingId||!id(result.pairingId)||!name(result.clientName)||!expiry(result.expiresAt)||typeof result.approved!=='boolean'||result.scope!=='evidence:read'||result.readOnly!==true||!Number.isSafeInteger(result.maximumGrantLifetimeMs)||result.maximumGrantLifetimeMs<=0||result.maximumGrantLifetimeMs>28800000)throw Error('Invalid inspection');
    inspection=result;
   }else if(operation==='approve'){
    if(result?.approved!==true||result.organizationId!==org)throw Error('Invalid approval');
    inspection=null;code='';notice='Client approved. Return to the local client to finish connecting.';
   }else if(operation==='list'){
    if(result?.organizationId!==org||!Array.isArray(result.grants)||result.grants.length>64||new Set(result.grants.map(g=>g.grantId)).size!==result.grants.length||result.grants.some(g=>!id(g.grantId)||!name(g.clientName)||g.organizationId!==org||g.scope!=='evidence:read'||g.readOnly!==true||!expiry(g.expiresAt)))throw Error('Invalid grants');
    grants=result.grants;listed=true;
   }else if(operation==='revoke'){
    if(result?.revoked!==true)throw Error('Invalid revocation');grants=grants.filter(g=>g.grantId!==extra.grantId);notice='Client access revoked.';
   }
  }catch(e){if(alive){inspection=null;grants=[];listed=false;error=e?.status===404?'Local evidence connections are not enabled here.':'Unable to verify this request. Inspect again or refresh your clients.';}}
  finally{if(alive)busy=false;pending=null;}
 }
 function approve(){if(ready&&!busy)void action('approve',{pairingId:inspection.pairingId});}
 const date=value=>new Date(value).toLocaleString();
</script>
<details class="clients">
 <summary>Local evidence clients</summary>
 <section aria-label="Local evidence client access" aria-busy={busy}>
  <h2>Connect a local client</h2>
  <p>Approve read-only evidence access for this organization. Your sign-in credentials stay in Studio.</p>
  <p>Current organization: <code>{organizationId}</code></p>
  <label>Pairing code<input value={code} oninput={changed} maxlength="32" autocomplete="off" spellcheck="false" disabled={busy}/></label>
  <button disabled={busy||!id(code)} onclick={()=>{inspection=null;void action('inspect',{pairingId:code});}}>Inspect client</button>
  {#if inspection}
   <div class="inspection"><h3>{inspection.clientName}</h3><dl><dt>Organization</dt><dd>{inspection.organizationId}</dd><dt>Access</dt><dd>{inspection.scope} · Read only</dd><dt>Pairing expires</dt><dd>{date(inspection.expiresAt)}</dd><dt>Maximum connection lifetime</dt><dd>{inspection.maximumGrantLifetimeMs/3600000} hours</dd></dl>
   {#if approved}<p>This pairing has already been approved.</p>{:else if inspection.expiresAt<=clock}<p>Pairing expired. Start a new pairing in your local client.</p>{/if}
   <button disabled={busy||!ready} onclick={approve}>Approve read-only client</button></div>
  {/if}
  <h3>Your active clients</h3><button disabled={busy} onclick={()=>action('list')}>Refresh my clients</button>
  {#each grants.filter(g=>g.expiresAt>clock) as grant(grant.grantId)}<article><h4>{grant.clientName}</h4><p>Read only · expires {date(grant.expiresAt)}</p><button disabled={busy} onclick={()=>action('revoke',{grantId:grant.grantId})}>Revoke {grant.clientName}</button></article>{/each}
  {#if listed&&!grants.some(g=>g.expiresAt>clock)}<p>No active clients returned for your account in this organization.</p>{/if}
  {#if notice}<p role="status">{notice}</p>{/if}{#if error}<p role="alert">{error}</p>{/if}
 </section>
</details>
<style>
 .clients{margin:1rem 0;padding:1rem;border:1px solid var(--border,#bbb);border-radius:8px;background:var(--panel,#fff);color:var(--text,#222)}summary{cursor:pointer;font-weight:600}section{max-width:48rem}input{display:block;width:min(100%,28rem);box-sizing:border-box;margin:.5rem 0;padding:.65rem;font:inherit}button{margin:.4rem .5rem .4rem 0;min-height:40px;font:inherit}code,dd,h3,h4{overflow-wrap:anywhere}dd{margin:0 0 .6rem}dt{font-weight:600}.inspection,article{padding:.8rem;border:1px solid var(--border,#bbb);border-radius:6px;margin:.8rem 0}:focus-visible{outline:2px solid currentColor;outline-offset:3px}
</style>
