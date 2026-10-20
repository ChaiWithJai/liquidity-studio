<script>
 import {onDestroy} from 'svelte';
 let {onPreview=()=>{},onDirtyChange=()=>{},onClear=()=>{},disabled=false}=$props();
 let region=$state(''),artist=$state(''),sourceUrl=$state(''),context=$state(''),collaborator=$state(''),role=$state(''),error=$state('');
 const dirty=$derived(Boolean(region||artist||sourceUrl||context||collaborator||role));
 $effect(()=>onDirtyChange(dirty));onDestroy(()=>onDirtyChange(false));
 function preview(){
  error='';let url;try{url=new URL(sourceUrl);if(url.protocol!=='https:'||url.username||url.password)throw Error();}catch{error='Add the HTTPS source you used for this reference.';return;}
  const regionId=crypto.randomUUID(),artistId=crypto.randomUUID(),evidenceId=crypto.randomUUID(),personId=crypto.randomUUID();
  const nodes=[{id:regionId,kind:'region',name:region.trim()},{id:artistId,kind:'artist',name:artist.trim(),regionId,evidenceIds:[evidenceId],description:context.trim()}];
  const edges=[];
  if(collaborator.trim()){nodes.push({id:personId,kind:'person',name:collaborator.trim(),subtitle:role.trim(),regionId,evidenceIds:[evidenceId]});edges.push({id:crypto.randomUUID(),kind:'relationship',name:role.trim()||'Proposed collaborator',from:artistId,to:personId,evidenceIds:[evidenceId],description:context.trim()});}
  onPreview({nodes,edges,evidence:[{id:evidenceId,title:artist.trim()+' · source reference',sourceUrl:url.href,excerpt:context.trim()}],observations:[],resources:[]},{regionId,artistId});
 }
</script>
<form class="talent-intake" onsubmit={e=>{e.preventDefault();preview();}} aria-label="Add an artist reference">
 <h3>Start with an artist and a source</h3><p>Describe what you found. Preview the references before adding them to your workspace.</p>
 {#if error}<p role="alert">{error}</p>{/if}
 <fieldset disabled={disabled}><div class="pair"><label>Region name<input bind:value={region} required maxlength="200" placeholder="City or region"/></label><label>Artist name<input bind:value={artist} required maxlength="200"/></label></div><label>Evidence source URL<input type="url" bind:value={sourceUrl} required placeholder="https://…"/></label><label>Why this source matters<textarea bind:value={context} required rows="2" maxlength="2000"></textarea></label><div class="pair"><label>Possible collaborator<input bind:value={collaborator} maxlength="200" placeholder="Optional"/></label><label>Collaborator role<input bind:value={role} maxlength="200" placeholder="Producer, venue, manager…"/></label></div><button type="submit" disabled={!region.trim()||!artist.trim()||!sourceUrl.trim()||!context.trim()}>Preview these references</button><button type="button" onclick={()=>{region='';artist='';sourceUrl='';context='';collaborator='';role='';error='';onClear();}}>Clear reference fields</button></fieldset>
</form>
<style>.talent-intake{max-width:760px;padding:14px 0}.talent-intake h3{font-size:17px;margin:0}.talent-intake p{font-size:13px;line-height:1.5}.talent-intake fieldset{border:0;padding:0}.talent-intake label{display:block;font-size:13px;margin:10px 0}.talent-intake input,.talent-intake textarea{display:block;width:100%;margin-top:5px;font:inherit}.pair{display:flex;gap:14px}.pair label{flex:1;min-width:0}@media(max-width:600px){.pair{display:block}}</style>
