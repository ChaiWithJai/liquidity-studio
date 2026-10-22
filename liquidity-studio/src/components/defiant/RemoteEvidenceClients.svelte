<script>
 import {onMount,onDestroy} from 'svelte';
 let {organizationId,userId,transactionId='',request,onComplete=()=>{}}=$props();
 let inspection=$state(null),grants=$state([]),busy=$state(false),error=$state(''),notice=$state(''),listed=$state(false),clock=$state(Date.now());
 let alive=true,pending;
 const opaque=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{43}$/.test(value);
 const text=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[\x00-\x1f\x7f]/.test(value);
 const resource='https://studio.chaiwithjai.com/mcp/defiant-evidence';
 const ready=$derived(inspection&&inspection.transactionId===transactionId&&inspection.organizationId===organizationId&&inspection.owner.userId===userId&&inspection.expiresAt>clock);
 onMount(()=>{const timer=setInterval(()=>clock=Date.now(),1000);return ()=>clearInterval(timer);});
 onDestroy(()=>{alive=false;inspection=null;pending?.abort();});
 function completion(value,tx){
  if(typeof value!=='string'||value.length>2048)throw Error('Invalid completion');
  const url=new URL(value,window.location.origin);
  if(url.origin!==window.location.origin||url.username||url.password||url.hash||url.pathname!=='/oauth/defiant-evidence/complete'||[...url.searchParams].length!==1||url.searchParams.get('transaction')!==tx)throw Error('Invalid completion');
  return url.pathname+url.search;
 }
 async function action(operation,extra={}){
  if(busy||!alive)return;busy=true;error='';notice='';const org=organizationId,actor=userId,tx=transactionId;pending=new AbortController();
  try{
   const result=await request(operation,{organizationId:org,...extra},{signal:pending.signal});
   if(!alive||org!==organizationId||actor!==userId||tx!==transactionId)return;
   if(operation==='inspect'){
    if(result?.organizationId!==org||result.transactionId!==tx||!opaque(result.inspectionToken)||result.owner?.userId!==actor||!text(result.owner.email,320)||!text(result.clientId,2048)||!text(result.clientName,200)||result.resource!==resource||result.scope!=='evidence:read'||result.maxLifetimeMs!==28800000||!Number.isSafeInteger(result.expiresAt)||result.expiresAt<=clock||result.status!=='pending')throw Error('Invalid inspection');
    inspection=result;
   }else if(operation==='approve'||operation==='deny'){
    if(result?.completed!==true)throw Error('Invalid completion');const target=completion(result.completionUrl,tx);inspection=null;onComplete(target);
   }else if(operation==='list'){
    if(result?.organizationId!==org||!Array.isArray(result.grants)||result.grants.length>64||new Set(result.grants.map(g=>g.grantId)).size!==result.grants.length||result.grants.some(g=>!/^([a-f0-9]{32})$/.test(g.grantId)||!text(g.clientId,2048)||!text(g.clientName,200)||g.organizationId!==org||g.scope!=='evidence:read'||g.readOnly!==true||!Number.isSafeInteger(g.expiresAt)||g.expiresAt<=clock))throw Error('Invalid grants');
    grants=result.grants;listed=true;
   }else if(operation==='revoke'){
    if(result?.revoked!==true)throw Error('Invalid revocation');grants=grants.filter(g=>g.grantId!==extra.grantId);notice='Remote client access revoked.';
   }
  }catch(e){if(alive&&org===organizationId&&actor===userId&&tx===transactionId){inspection=null;grants=[];listed=false;error=e?.status===404?'Remote evidence connections are not enabled here.':'Unable to verify this request. Inspect again or refresh your connections.';}}
  finally{if(alive)busy=false;pending=null;}
 }
 function decide(operation){if(ready&&!busy)void action(operation,{transactionId:inspection.transactionId,inspectionToken:inspection.inspectionToken});}
 const date=value=>new Date(value).toLocaleString();
</script>
<section class="remote-clients" aria-label="Remote evidence client consent" aria-busy={busy}>
 <h2>Remote evidence connections</h2><p>Current organization: <code>{organizationId}</code></p>
 {#if transactionId}
  <h3>Review connection request</h3><p>No access is granted until you inspect this request and explicitly approve it.</p>
  {#if !opaque(transactionId)}<p role="alert">Invalid connection request. Start again from ChatGPT.</p>{/if}
  <button disabled={busy||!opaque(transactionId)} onclick={()=>{inspection=null;void action('inspect',{transactionId});}}>Inspect remote request</button>
 {/if}
 {#if inspection}
  <div class="inspection"><h3>{inspection.clientName}</h3><dl><dt>Signed-in account</dt><dd>{inspection.owner.email} · {inspection.owner.userId}</dd><dt>Client identifier</dt><dd>{inspection.clientId}</dd><dt>Organization</dt><dd>{inspection.organizationId}</dd><dt>Resource</dt><dd>{inspection.resource}</dd><dt>Scope</dt><dd>{inspection.scope} · Read only</dd><dt>Maximum connection lifetime</dt><dd>8 hours</dd><dt>Request expires</dt><dd>{date(inspection.expiresAt)}</dd></dl>
  <p>Your Studio sign-in credentials are not shared with this client. Approval allows reads for this organization; it does not authorize campaigns, contact or spending.</p>
  {#if inspection.expiresAt<=clock}<p>Request expired. Start again from ChatGPT.</p>{/if}
  <button disabled={busy||!ready} onclick={()=>decide('approve')}>Approve read-only connection</button><button disabled={busy||!ready} onclick={()=>decide('deny')}>Deny connection</button></div>
 {/if}
 <h3>Your active remote connections</h3><button disabled={busy} onclick={()=>action('list')}>Refresh my remote connections</button>
 {#each grants.filter(g=>g.expiresAt>clock) as grant(grant.grantId)}<article><h4>{grant.clientName}</h4><p>{grant.clientId}</p><p>Read only · expires {date(grant.expiresAt)}</p><button disabled={busy} onclick={()=>action('revoke',{grantId:grant.grantId})}>Revoke {grant.clientName}</button></article>{/each}
 {#if listed&&!grants.some(g=>g.expiresAt>clock)}<p>No active remote connections returned for your account in this organization.</p>{/if}
 {#if notice}<p role="status">{notice}</p>{/if}{#if error}<p role="alert">{error}</p>{/if}
</section>
<style>
 .remote-clients{margin:1rem 0;padding:1rem;border:1px solid var(--border,#bbb);border-radius:8px;background:var(--panel,#fff);color:var(--text,#222);max-width:48rem;box-sizing:border-box}button{margin:.4rem .5rem .4rem 0;min-height:40px;max-width:100%;font:inherit}code,dd,h3,h4,p{overflow-wrap:anywhere}dd{margin:0 0 .6rem}dt{font-weight:600}.inspection,article{padding:.8rem;border:1px solid var(--border,#bbb);border-radius:6px;margin:.8rem 0}:focus-visible{outline:2px solid currentColor;outline-offset:3px}
</style>
