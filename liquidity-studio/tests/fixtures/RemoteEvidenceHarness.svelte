<script>
 import RemoteEvidenceClients from '../../src/components/defiant/RemoteEvidenceClients.svelte';
 let org=$state('invented_org'),user=$state('invented_user'),mode=$state('normal'),calls=$state([]),completion=$state(''),revoked=$state(false);
 const tx='a'.repeat(43),clientName='<img src=x onerror=alert(1)>',grantId='b'.repeat(32);
 async function request(operation,body){
  calls=[...calls,{operation,organizationId:body.organizationId,transactionId:body.transactionId}];
  if(mode==='late'||(mode==='late-approve'&&operation==='approve'))await new Promise(resolve=>setTimeout(resolve,1000));
  const organizationId=mode==='wrong-org'?'other':body.organizationId;
  if(operation==='inspect')return {transactionId:body.transactionId,organizationId,inspectionToken:'c'.repeat(43),clientId:'https://chatgpt.com/oauth/client.json',clientName,resource:mode==='wrong-resource'?'https://wrong.invalid':'https://studio.chaiwithjai.com/mcp/defiant-evidence',scope:'evidence:read',maxLifetimeMs:28800000,expiresAt:Date.now()+(mode==='expired'?-1000:300000),status:'pending',owner:{userId:mode==='wrong-user'?'other':user,email:'fixture@example.invalid'}};
  if(operation==='approve'||operation==='deny')return {completed:true,completionUrl:mode==='redirect'?'https://wrong.invalid/steal':'/oauth/defiant-evidence/complete?transaction='+body.transactionId};
  if(operation==='list')return {organizationId,grants:revoked?[]:[{grantId,clientName,clientId:'https://chatgpt.com/oauth/client.json',organizationId,approvedAt:Date.now(),expiresAt:Date.now()+300000,scope:'evidence:read',readOnly:true}]};
  if(operation==='revoke'){revoked=true;return {revoked:true};}
 }
</script>
<label>Fixture response<select bind:value={mode}><option>normal</option><option>wrong-org</option><option>wrong-user</option><option>wrong-resource</option><option>expired</option><option>late</option><option>late-approve</option><option>redirect</option></select></label>
<button onclick={()=>org=org==='invented_org'?'other_org':'invented_org'}>Switch fixture organization</button><button onclick={()=>user=user==='invented_user'?'other_user':'invented_user'}>Switch fixture account</button>
<output aria-label="Request log">{JSON.stringify(calls)}</output><output aria-label="Completion">{completion}</output>
{#key org+user}<RemoteEvidenceClients organizationId={org} userId={user} transactionId={tx} {request} onComplete={value=>completion=value}/>{/key}

<style>
 /* Diagnostic JSON and completion URLs remain visible without widening the fixture. */
 output { display:block; max-width:100%; overflow-wrap:anywhere; }
</style>
