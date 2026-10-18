<script>
  import { onMount, onDestroy, untrack } from 'svelte';
  import { renderSvg } from '../../server/artwork.js';
  const QUEUED_NOTICE='Source preparation queued. You can leave and rejoin this durable job.';
  let {request,storyId,scopeKey,getScopeKey,brandProfile,onDirtyChange=()=>{},onPromoted=()=>{},onStoryChanged=()=>{},onReturnToHandoff=()=>{}}=$props();
  let info=$state(null),working=$state(null),savedSignature=$state(''),format=$state('infographic'),page=$state(0),pending=$state(false),error=$state(''),notice=$state(''),retained=$state(null),kind=$state(''),reviewPlan=$state(null),reviewed=$state(false),clinicalReviewed=$state(false);
  let closed=false,sequence=0;
  const capturedScope=untrack(()=>scopeKey),capturedStory=untrack(()=>storyId);
  const current=()=>!closed&&getScopeKey()===capturedScope;
  let dirty=$derived(working!==null&&JSON.stringify(working)!==savedSignature);
  let pages=$derived(format==='carousel'?working?.carousel?.slides?.length||1:format==='reel'?working?.reel?.beats?.length||1:1);
  let preview=$derived.by(()=>{if(!working)return {svg:'',error:''};try{return {svg:renderSvg({campaign:working,brandProfile,format,slideIndex:Math.min(page,pages-1)}),error:''};}catch{return {svg:'',error:'This copy does not fit. Shorten the preview text before continuing.'};}});
  function fieldLabel(path) { const names={headline:'Headline',statRows:'Key fact',bottomTakeaway:'Takeaway',caption:'Caption',coverHook:'Cover headline',slides:'Slide',title:'Title',bodyMetric:'Body copy',visualNote:'Visual direction',hookBanner:'Story headline',keyStatHighlight:'Main fact',interactiveStickerPrompt:'Sticker prompt',spokenHook0to3s:'Opening voiceover',beats:'Beat',voiceover:'Voiceover',onScreenText:'On-screen copy',bRollDirection:'Visual direction',closingCta:'Closing line'};return path.map(part=>/^\d+$/.test(part)?Number(part)+1:names[part]||part).join(' '); }
  function fields(value,path=[]) {return Object.entries(value||{}).flatMap(([key,child])=>typeof child==='string'&&key!=='timecode'?[{path:[...path,key],label:fieldLabel([...path,key]),value:child}]:child&&typeof child==='object'?fields(child,[...path,key]):[]);}
  let editable=$derived(fields(working?.[format]));
  function replacePrepared(prepared) {
    reviewPlan=null;reviewed=false;clinicalReviewed=false;
    if(!prepared){working=null;savedSignature='';onDirtyChange(false);return;}
    working=structuredClone(prepared.workingArtwork||prepared.candidate.artwork);savedSignature=JSON.stringify(working);onDirtyChange(false);
  }
  async function load(discard=false) {
    const ticket=++sequence;
    try {
      const next=await request(`/api/studio/preparations/stories/${encodeURIComponent(capturedStory)}`);
      if(!current()||ticket!==sequence)return;
      if(dirty&&!discard&&(next.prepared?.candidate.id!==info?.prepared?.candidate.id||next.prepared?.revision!==info?.prepared?.revision)){notice='A newer candidate is saved. Your local edits keep their original revision; save will report a conflict.';return;}
      const changed=next.prepared?.candidate.id!==info?.prepared?.candidate.id||next.prepared?.revision!==info?.prepared?.revision;
      info=next;if(next.status==='ready'&&notice===QUEUED_NOTICE)notice='';if(discard||changed||!working)replacePrepared(next.prepared);
    }catch(failure){if(current()&&ticket===sequence)error=failure.message;}
  }
  function edit(path,value) {
    if(pending||retained)return;
    reviewPlan=null;reviewed=false;clinicalReviewed=false;
    const next=structuredClone($state.snapshot(working));let target=next[format];
    for(const key of path.slice(0,-1))target=target[key];target[path.at(-1)]=value;working=next;onDirtyChange(JSON.stringify(next)!==savedSignature);
  }
  async function submit(intent) {
    if(!current()||pending)return;
    pending=true;retained=intent;error='';++sequence;
    try {
      const result=await request(intent.path,{method:'POST',body:JSON.stringify(intent.body)});
      if(!current())return;
      retained=null;
      if(intent.operation==='promote'){onDirtyChange(false);await onPromoted(result);notice=result.promotionStillCurrent===false?'The earlier promotion was recovered, but this story changed afterward. Reload its current handoff before continuing.':'Reviewed copy promoted. Native layout and publication approval remain separate.';}
      else if(intent.operation==='historical-fork'){await onStoryChanged();if(!current())return;await load(true);if(current())notice=result.forkStillCurrent===false?'The saved continuation was recovered, but the story changed afterward. Inspect the current saved story before continuing.':'Restored saved copy is now an unreviewed draft in this workspace. Save any changes and explicitly review its evidence before handoff.';}
      else if(intent.operation==='save'){info={...info,prepared:result};replacePrepared(result);notice='Preview edits saved. Source and publication approval are unchanged.';}
      else{notice=result.dispatchError||QUEUED_NOTICE;await load();await onStoryChanged();}
    }catch(failure){if(current()){error=failure.message;if(failure.status>=400&&failure.status<500)retained=null;}}
    finally{if(current())pending=false;}
  }
  function prepare() {
    if(!info||dirty||retained)return;
    submit({operation:'prepare',path:'/api/studio/jobs',body:{purpose:'source-preparation',idempotencyKey:crypto.randomUUID(),reviewed:true,brandRevision:info.brandRevision,items:[{storyId:capturedStory,storyRevision:info.storyRevision}]}});
  }
  function save(){if(!info?.prepared||!dirty||retained)return;submit({operation:'save',path:`/api/studio/preparations/${info.prepared.candidate.id}/edit`,body:{idempotencyKey:crypto.randomUUID(),expectedRevision:info.prepared.revision,artwork:$state.snapshot(working)}});}
  async function openReview(){
    if(!info?.prepared||dirty||pending||retained)return;
    const ticket=++sequence;error='';
    try{const next=await request(`/api/studio/preparations/${info.prepared.candidate.id}/review-plan`);if(!current()||ticket!==sequence)return;if(next.candidateRevision!==info.prepared.revision){notice='The saved candidate changed. Reload it before review.';return;}reviewPlan=next;reviewed=false;clinicalReviewed=false;if(next.requiresClinicalReview)kind='clinical';}
    catch(failure){if(current()&&ticket===sequence)error=failure.message;}
  }
  async function continueHistorical(){
    if(!info?.prepared?.restoredHistorical||pending||dirty||retained)return;
    const ticket=++sequence;error='';
    try{const plan=await request(`/api/studio/preparations/${info.prepared.candidate.id}/fork-plan`);if(!current()||ticket!==sequence)return;const {expectedRevision,expectedContentRevision,expectedBrandRevision,expectedHistoricalRevision,sourceCopySha256,evidenceSha256,packSha256,inputFingerprint}=plan;submit({operation:'historical-fork',path:`/api/studio/preparations/${info.prepared.candidate.id}/fork`,body:{idempotencyKey:crypto.randomUUID(),expectedRevision,expectedContentRevision,expectedBrandRevision,expectedHistoricalRevision,sourceCopySha256,evidenceSha256,packSha256,inputFingerprint}});}
    catch(failure){if(current()&&ticket===sequence)error=failure.message;}
  }
  function promote(){
    if(!reviewPlan||!reviewed||!kind||dirty||pending||retained)return;
    submit({operation:'promote',path:`/api/studio/preparations/${info.prepared.candidate.id}/promote`,body:{idempotencyKey:crypto.randomUUID(),expectedCandidateRevision:reviewPlan.candidateRevision,expectedContentRevision:reviewPlan.contentRevision,brandRevision:reviewPlan.brandRevision,copySha256:reviewPlan.copySha256,evidenceSha256:reviewPlan.evidenceSha256,reviewed:true,kind,...(kind==='clinical'?{clinicalReviewed}:{})}});
  }

  onMount(()=>{load();const timer=setInterval(()=>{if(current()&&!pending&&!dirty&&!retained&&['queued','running'].includes(info?.status))load();},1500);return()=>clearInterval(timer);});
  onDestroy(()=>{closed=true;++sequence;onDirtyChange(false);});
</script>
<section class="prepared-source panel" aria-label="Prepared source draft">
  <header><div><h3>Source preview</h3></div><span role="status">{dirty?'Unsaved preview edits':info?.status==='ready'?`Ready for review · ${info.prepared?.evidence?.length||0} source${info.prepared?.evidence?.length===1?'':'s'}`:info?.status?.replaceAll('_',' ')||'Loading source preparation…'}</span></header>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if notice}<p role="status">{notice}</p>{/if}
  {#if retained&&!pending}<p>The request outcome is uncertain. Keep this intent until its receipt is recovered.</p><button class="secondary" disabled={pending} onclick={()=>submit(retained)}>Retry same request</button>{/if}
  {#if info?.prepared?.restoredHistorical}<p>Restored copy and source snapshots are historical. Continue this saved draft under the current workspace before editing or review. This preview uses the current brand.</p>{#if !info.hasCampaign}<button class="primary" disabled={pending||dirty||!!retained} onclick={continueHistorical}>Continue editing restored draft</button>{/if}{:else if info?.prepared?.stale}<p role="alert">Source content or brand settings changed. This historical preview cannot be approved or edited against the newer inputs.</p>{/if}
  {#if working}
    {#if info.prepared.candidate.artworkProjectionVersion === 2}<p>Preview copy uses shortened source excerpts, not complete quotations or conclusions. Open Evidence and unresolved questions for the full retrieved text, and review the copy before using it.</p>{/if}
    <div class="prepared-toolbar"><label>Preview format<select bind:value={format} onchange={()=>page=0}><option value="infographic">Feed infographic</option><option value="carousel">Carousel</option><option value="story">Story</option><option value="reel">Reel boards</option></select></label>{#if pages>1}<label>Page<select bind:value={page}>{#each Array.from({length:pages},(_,i)=>i) as index(index)}<option value={index}>{index+1} of {pages}</option>{/each}</select></label>{/if}<button class="primary" disabled={!dirty||pending||!!retained||info.prepared.stale||!!preview.error} onclick={save}>Save preview edits</button><button class="secondary" disabled={pending||!!retained} onclick={()=>load(true)}>Reload saved preview / discard edits</button></div>
    <div class="prepared-layout"><div class="prepared-artwork" aria-label="Unreviewed artwork preview">{#if preview.error}<p role="alert">{preview.error}</p>{:else}<img alt="Unreviewed source candidate artwork" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(preview.svg)}`} />{/if}</div><div class="prepared-copy"><h4>Edit preview copy</h4>{#each editable as field(field.path.join('.'))}<label>{field.label}<textarea rows="3" maxlength="2000" value={field.value} disabled={pending||!!retained||info.prepared.stale} oninput={event=>edit(field.path,event.currentTarget.value)}></textarea></label>{/each}</div></div>
    <details><summary>Evidence and unresolved questions</summary>{#each info.catalog as entry(entry.id)}<p>{entry.coverage}</p>{/each}{#each info.prepared.evidence as evidence(evidence.id)}<article><h4>Retrieved source</h4><a href={evidence.sourceUrl} target="_blank" rel="noreferrer">Open original source</a><p>Retrieved {evidence.retrievedAt}. This source has not been approved.</p><pre>{evidence.text}</pre></article>{/each}</details>
    <button id="workflow-handoff" tabindex="-1" class="primary" disabled={dirty||pending||!!retained||info.prepared.stale||!!preview.error} onclick={openReview}>Review saved draft and evidence</button>
    {#if reviewPlan}<section class="candidate-review" aria-label="Review prepared draft"><h4>Review this saved draft</h4><p>Confirm the exact saved copy across all formats against the retrieved evidence. This records editorial source and copy review; it does not publish or approve a native layout.</p><details><summary>All saved format copy · {reviewPlan.copyFieldCount} fields</summary>{#each Object.entries(working) as [name,copy] (name)}<h5>{name}</h5>{#each fields(copy) as field(field.path.join('.'))}<p><strong>{field.label}</strong>: {field.value}</p>{/each}{/each}</details><ul>{#each reviewPlan.sourceUrls as url(url)}<li><a href={url} target="_blank" rel="noreferrer">{url}</a></li>{/each}</ul><label>Content classification<select bind:value={kind} disabled={reviewPlan.requiresClinicalReview}><option value="">Choose classification</option><option value="financial">Financial</option><option value="cultural">Cultural</option><option value="general">General</option><option value="clinical">Clinical</option></select></label><label><input type="checkbox" bind:checked={reviewed}/> I reviewed this saved draft and its evidence across all formats.</label>{#if kind==='clinical'}<label><input type="checkbox" bind:checked={clinicalReviewed} disabled={!reviewPlan.canReviewClinical}/> I separately completed clinical source review as an authorized founder.</label>{#if !reviewPlan.canReviewClinical}<p>A current founder must complete the separate clinical review.</p>{/if}{/if}<button class="primary" disabled={!reviewed||!kind||dirty||pending||!!retained||(kind==='clinical'&&(!clinicalReviewed||!reviewPlan.canReviewClinical))} onclick={promote}>Confirm reviewed copy and continue to handoff</button></section>{/if}
    <details><summary>Candidate details</summary><p>Candidate {info.prepared.candidate.id} · candidate revision {info.prepared.revision} · source content revision {info.prepared.candidate.contentRevision}. This preview cannot be exported or published through the approved campaign path.</p></details>
  {:else if info}
    <p>{info.sourceReady?'A sourced preview is not ready yet. Preparation runs in the durable worker, independently of this editor.':'Source research needs attention. No matching retrievable primary source is configured for this topic.'}</p>{#each info.catalog as entry(entry.id)}<p>{entry.coverage}</p>{/each}
  {/if}
  {#if info?.hasCampaign}<button class="secondary" disabled={dirty||pending||!!retained} onclick={onReturnToHandoff}>Return to current handoff</button>{/if}
  {#if info&&!info.hasCampaign}<button class="secondary" disabled={!info.sourceReady||dirty||pending||!!retained||['queued','running'].includes(info.status)} onclick={prepare}>{info.prepared?'Prepare a new source candidate':'Prepare source preview'}</button><button class="secondary" disabled={pending||!!retained||dirty} onclick={()=>load()}>Refresh preparation status</button>{/if}
</section>
<style>
  .prepared-source header,.prepared-toolbar{display:flex;gap:12px;justify-content:space-between;align-items:center;flex-wrap:wrap}.prepared-source h3{margin:0}.prepared-layout{display:grid;grid-template-columns:minmax(220px,1fr) minmax(220px,1fr);gap:20px;margin:16px 0}.prepared-artwork{max-width:300px;margin:0 auto;width:100%;align-self:start}.prepared-artwork img{display:block;width:100%;height:auto}.prepared-toolbar{justify-content:flex-start;gap:8px}.prepared-toolbar button{padding:8px;font-size:12px}.prepared-toolbar label{font-size:12px}.prepared-copy{max-height:620px;overflow:auto}.prepared-copy label{display:block;margin-bottom:12px}.prepared-copy textarea{display:block;width:100%;box-sizing:border-box}.prepared-source pre{white-space:pre-wrap;max-height:280px;overflow:auto;font:inherit;font-size:13px}.prepared-source details{margin:12px 0}.prepared-source select{max-width:100%}@media(max-width:720px){.prepared-layout{grid-template-columns:1fr}.prepared-artwork{max-width:330px}.prepared-copy{max-height:none}}
</style>
