<script>
 import LocalEvidenceClients from '../../src/components/defiant/LocalEvidenceClients.svelte';
 let org=$state('invented_org'),mode=$state('normal'),calls=$state([]),revoked=$state(false);
 const clientName='<img src=x onerror=alert(1)>',grantId='b'.repeat(32);
 async function request(operation,body){
  calls=[...calls,{operation,body}];
  if(mode==='late')await new Promise(resolve=>setTimeout(resolve,1000));
  const organizationId=mode==='wrong'?'other':body.organizationId;
  if(operation==='inspect')return {pairingId:body.pairingId,organizationId,clientName,expiresAt:Date.now()+(mode==='expired'?-1000:300000),approved:false,scope:'evidence:read',readOnly:true,maximumGrantLifetimeMs:28800000};
  if(operation==='approve')return {approved:true,organizationId};
  if(operation==='list')return {organizationId,grants:revoked?[]:[{grantId,clientName,organizationId,expiresAt:Date.now()+300000,scope:'evidence:read',readOnly:true}]};
  if(operation==='revoke'){revoked=true;return {revoked:true};}
 }
</script>
<label>Fixture response<select bind:value={mode}><option>normal</option><option>wrong</option><option>expired</option><option>late</option></select></label>
<button onclick={()=>org=org==='invented_org'?'other_org':'invented_org'}>Switch fixture organization</button>
<output aria-label="Request log">{JSON.stringify(calls)}</output>
{#key org}<LocalEvidenceClients organizationId={org} {request}/>{/key}
