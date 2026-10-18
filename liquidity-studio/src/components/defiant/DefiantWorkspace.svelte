<script>
 import {onMount,onDestroy,untrack} from 'svelte';
 import GraphCanvas from './GraphCanvas.svelte';
 import Icon from './Icon.svelte';
 import DefiantPlanning from './DefiantPlanning.svelte';
 let {request,location,onNavigate=()=>{},onDirtyChange=()=>{},canEnable=false,onEnabled=()=>{}}=$props();
 let state=$state(null),graph=$state(null),loading=$state(true),busy=$state(''),error=$state(''),notice=$state('');
 let query=$state(''),positions=$state({}),planIds=$state([]),intakeText=$state(''),preview=$state(null),intent=$state(null),unknown=$state(false);
 let intakeDirty=$state(false),planningDirty=$state(false),reportRequest=$state(0);
 $effect(()=>onDirtyChange(intakeDirty||planningDirty));
 let restoredView='';
 $effect(()=>{const id=location.savedViewId;const view=state?.views.find(v=>v.id===id);untrack(()=>{if(view&&restoredView!==id){positions=view.positions||{};planIds=view.planIds||[];restoredView=id;}});});
 let alive=true,sequence=0;
 let graphLoading=$state(false);
 const selected=$derived(location?.selected||''),focus=$derived(location?.focus||'');
 const current=$derived(graph?.selectedItem?.id===selected?graph.selectedItem:null),matches=$derived(graph?.matches||[]);
 const typeName={cluster:'Working group',region:'Region',artist:'Artist',signal:'Signal',person:'Collaborator',resource:'Resource',format:'Media concept',catalog:'Catalog reference',route:'Route',external:'External reference'};
 function navigate(next){onNavigate({...location,...next});}
 function select(id){const repeat=id===selected;const item=state?.items.find(n=>n.id===id);navigate({view:'map',selected:id,focus:['region','artist','signal','person','resource','cluster'].includes(item?.kind)?id:focus});query='';if(repeat)void loadGraph();}
 async function loadGraph(){
  const ticket=++sequence;error='';graphLoading=true;
  try{const q=new URLSearchParams({focusId:focus,selectedId:selected,query});const value=await request('/graph?'+q);if(alive&&ticket===sequence)graph=value;}
  catch(failure){if(alive&&ticket===sequence)error=failure.message;}
  finally{if(alive&&ticket===sequence)graphLoading=false;}
 }
 async function load(){
  if(!state)loading=true;error='';
  try{const value=await request('');if(!alive)return;state=value;await loadGraph();}
  catch(failure){if(alive)error=failure.status===404&&canEnable?'':failure.message;}
  finally{if(alive)loading=false;}
 }
 $effect(()=>{focus;selected;untrack(()=>{if(state)void loadGraph();});});
 onMount(()=>{void load();});
 onDestroy(()=>{alive=false;sequence++;});
 async function enable(){
  if(busy)return;busy='enable';error='';
  try{await request('/enable',{method:'POST',body:'{}'});if(!alive)return;await onEnabled();await load();}
  catch(failure){if(alive)error=failure.message;}
  finally{if(alive)busy='';}
 }
 function editIntake(value){intakeText=value;preview=null;if(!unknown)intent=null;intakeDirty=Boolean(value.trim());}
 async function inspectIntake(kind){
  if(busy||unknown)return;busy='preview';error='';notice='';
  try{const input=kind==='demo'?{kind}:{kind,data:JSON.parse(intakeText)};const value=await request('/import-preview',{method:'POST',body:JSON.stringify(input)});if(!alive)return;preview=value;intent={...input,expectedRevision:value.expectedRevision,idempotencyKey:crypto.randomUUID()};intakeDirty=true;}
  catch(failure){if(alive)error=failure.message;}
  finally{if(alive)busy='';}
 }
 async function importPreview(){
  if(!intent||busy)return;busy='import';error='';notice='';
  try{await request('/import',{method:'POST',body:JSON.stringify(intent)});if(!alive)return;notice='References saved';preview=null;intent=null;unknown=false;intakeText='';intakeDirty=false;await load();}
  catch(failure){if(!alive)return;error=failure.message;unknown=!(Number.isInteger(failure.status)&&failure.status>=400&&failure.status<500);}
  finally{if(alive)busy='';}
 }
 function restoreView(view){restoredView=view.id;positions=view.positions||{};planIds=view.planIds||[];navigate({view:'map',focus:view.focus||'',selected:view.selected||'',savedViewId:view.id,reportId:''});}
 async function planningSaved(ack){if(ack&&state)state={...state,revision:ack.revision};await load();}
 function togglePlan(id){planIds=planIds.includes(id)?planIds.filter(x=>x!==id):[...planIds,id];}
</script>
<section class="defiant" aria-label="Defiant strategy workspace">
 {#if error}<p class="error" role="alert">{error}</p>{/if}
 {#if loading}<p role="status">Opening your strategy workspace…</p>
 {:else if !state}
  <div class="empty"><h2>A separate space for strategy</h2><p>Explore people, regional routes and evidence without changing your publishing brands.</p>{#if canEnable}<button class="primary" disabled={!!busy} onclick={enable}>{busy==='enable'?'Opening…':'Enable strategy for this organization'}</button>{:else}<p>This organization’s strategy workspace is unavailable.</p>{/if}</div>
 {:else}
 <div class="intake-bar"><details><summary>Add references</summary><div class="intake"><h3>Bring your evidence</h3><p>Import your own people, relationships and source notes as JSON. Links and rights remain user-reported.</p><label>Reference data<textarea rows="5" value={intakeText} disabled={!!busy||unknown} oninput={e=>editIntake(e.currentTarget.value)} placeholder={'{"nodes":[],"edges":[],"evidence":[],"observations":[],"resources":[]}'}></textarea></label><button disabled={!!busy||unknown||!intakeText.trim()} onclick={()=>inspectIntake('owned')}>Preview import</button><button class="secondary" disabled={!!busy||unknown} onclick={()=>inspectIntake('demo')}>Preview sample map</button></div></details>{#if notice}<span role="status">{notice}</span>{/if}</div>
 {#if preview}<section class="import-preview" aria-label="Reference import preview"><h3>{preview.kind==='demo'?'Sample references':'Your reference preview'}</h3><p>{Object.entries(preview.counts).map(([kind,count])=>`${count} ${kind}`).join(' · ')}</p>{#each preview.warnings as warning(warning)}<p>{warning}</p>{/each}<button class="primary" disabled={!!busy} onclick={importPreview}>{busy==='import'?'Saving…':unknown?'Retry same import':'Add these references'}</button>{#if !unknown}<button disabled={!!busy} onclick={()=>{preview=null;intent=null;intakeDirty=Boolean(intakeText.trim());}}>Cancel</button>{/if}</section>{/if}
 <div class="scene">
  <aside class="rail"><label class="search"><Icon name="search"/><input aria-label="Find an artist, region or resource" placeholder="Find anything…" value={query} oninput={e=>{query=e.currentTarget.value;void loadGraph();}}/></label>{#if query}<div class="search-results">{#each matches as item(item.id)}<button onclick={()=>select(item.id)}><strong>{item.name}</strong><small>{typeName[item.kind]||item.kind}</small></button>{/each}{#if !matches.length}<p>No matches</p>{/if}</div>{/if}<h3>{state.regions.length?'REGIONS':'REFERENCES'} <span>{state.regions.length||state.items.length}</span></h3><button class:chosen={!focus} onclick={()=>navigate({focus:'',selected:''})}>{state.regions.length?'All regions':'All references'}</button>{#each state.regions as region(region.id)}<button class:chosen={focus===region.id} onclick={()=>select(region.id)}>{region.name}<Icon name="chevron" size={13}/></button>{/each}<details><summary>All references</summary>{#each state.items as item(item.id)}<button onclick={()=>select(item.id)}>{item.name}<small>{typeName[item.kind]||item.kind}</small></button>{/each}</details></aside>
  <main class="map-area"><div class="map-heading"><div><span class="eyebrow">OPPORTUNITY MAP</span><h2>{state.items.find(n=>n.id===focus)?.name||(state.regions.length?'Explore regions':'Your references')}</h2><p>{state.regions.length?'Follow a route. Find someone worth bringing into the room.':'Explore your evidence and relationships. Shortlist what matters.'}</p></div>{#if focus}<button class="quiet" onclick={()=>navigate({focus:'',selected:''})}><Icon name="back"/>{state.regions.length?'All regions':'All references'}</button>{/if}</div>
   {#if graph?.nodes.length}<GraphCanvas nodes={graph.nodes.map(n=>({...n,...positions[n.id]}))} edges={graph.edges} selectedId={selected} onselect={select} onmove={(id,pos)=>{positions={...positions,[id]:pos};}} {planIds}/>{:else}<div class="empty"><h3>Start with a real reference</h3><p>Add your own evidence, or preview the clearly labeled sample map.</p><button onclick={()=>inspectIntake('demo')} disabled={!!busy}>Preview sample map</button></div>{/if}
   <div class="plan-tray"><strong>Your shortlist <span>{planIds.length}</span></strong><div>{#each planIds as id(id)}<button onclick={()=>togglePlan(id)}>{state.items.find(n=>n.id===id)?.name||id} ×</button>{/each}{#if !planIds.length}<span>Add people, routes or ideas as you explore.</span>{/if}</div><button onclick={()=>reportRequest++}>Build a report</button><small>Save a view to retain your shortlist and layout.</small></div>
  </main>
  <aside class="inspector" class:has-selection={Boolean(selected)} aria-label="Selection details">{#if current}<div class="inspector-top"><span class="eyebrow">{typeName[current.kind]||current.kind}</span><button aria-label="Close details" onclick={()=>navigate({selected:''})}><Icon name="close"/></button></div><h2>{current.name}</h2><p>{current.subtitle}</p><span class="sample-tag">{current.verification==='example'?'Sample reference':current.verification==='user-reported'?'User-reported reference':current.verification==='working-selection'?'Working selection':'Unverified reference'}</span>{#if current.profile||current.description}<h3>Why this connection</h3><p>{current.profile||current.description}</p>{/if}{#if current.tags?.length}<div class="tags">{#each current.tags as tag(tag)}<span>{tag}</span>{/each}</div>{/if}
   {#if current.sourceRegion}<p>Regional corridor origin: {state.items.find(n=>n.id===current.sourceRegion)?.name||current.sourceRegion}</p>{/if}{#if graph.relatedResources.length}<h3>Possible connections</h3>{#each graph.relatedResources as related(related.id)}<button class="related" onclick={()=>select(related.id)}>{related.name}<Icon name="arrow" size={15}/></button>{/each}{/if}
   {#if current.resource}<h3>Availability and rights</h3><p>{current.resource.availability?.status||'unknown'} availability · {current.resource.rights?.status||'unverified'} rights</p>{/if}<button class="add-plan" onclick={()=>togglePlan(current.id)}>{planIds.includes(current.id)?'Remove from shortlist':'Add to shortlist'}</button>
   <details class="provenance"><summary>Reference details</summary>{#each current.evidence||[] as evidence(evidence.id)}<article><h3>{evidence.title}</h3>{#if evidence.sourceUrl}<a href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer">Open source ↗</a>{/if}<p>{evidence.excerpt}</p><small>{evidence.method} · {evidence.verification}</small></article>{/each}<p>Relationships and permissions must be checked before acting.</p><code>{current.sourceId||current.id}</code></details>
  {:else}<div class="empty-inspector"><Icon name="network" size={26}/><h2>{graphLoading?'Opening selection…':selected?'Reference unavailable':'Select a region'}</h2><p>{selected?'This selection is no longer available. Choose another reference or return to all regions.':'Choose a region to find an artist, explore a route and collect what matters.'}</p></div>{/if}</aside>
 </div><div id="strategy-planning"><DefiantPlanning {reportRequest} {state} {location} {planIds} {positions} {request} onSaved={planningSaved} onNavigate={navigate} onRestoreView={restoreView} onDirtyChange={value=>planningDirty=value}/></div>{/if}
</section>
<style>
.defiant{background:#f5f5f2;color:#2b362b;border:1px solid var(--line,#dedfd8);border-radius:12px;overflow:hidden}.defiant button{display:inline-flex;align-items:center;gap:8px;min-height:34px;font-size:12px}.defiant p{font-size:12px;line-height:1.7;color:#69765f}.defiant h2{font-size:23px;letter-spacing:-.6px}.defiant h3{font-size:12px}.intake-bar{padding:12px 20px;border-bottom:1px solid #dedfd8;display:flex;justify-content:space-between}.intake-bar summary,.rail summary,.provenance summary{font-size:12px;cursor:pointer}.intake{max-width:650px;padding:12px 0}.intake textarea{width:100%;font:12px monospace}.intake label{display:block}.intake button{margin:8px 8px 0 0}.import-preview{padding:16px 24px;border-bottom:1px solid #dedfd8;background:#fff}.scene{display:grid;grid-template-columns:170px minmax(300px,1fr) 260px;min-height:640px}.rail{padding:20px 12px;border-right:1px solid #dedfd8}.rail h3{margin:24px 8px 12px;color:#69765f;letter-spacing:.1em}.rail button,.related{display:flex;width:100%;text-align:left;justify-content:space-between;border:0;background:transparent;color:inherit;padding:9px 8px}.rail button.chosen{background:#e8eddf;border-radius:6px}.rail small{display:block;font-size:10px}.search{display:flex;align-items:center;gap:6px}.search input{width:100%;min-width:0;font-size:12px}.search-results{padding-block:8px}.map-area{display:flex;flex-direction:column;min-width:0}.map-heading{padding:25px 24px 15px;display:flex;justify-content:space-between;gap:10px}.map-heading h2{margin:8px 0}.eyebrow{font-size:10px;letter-spacing:.12em;font-weight:700;color:#69765f}.plan-tray{margin:12px;min-height:65px;border:1px solid #dedfd6;border-radius:10px;background:#fcfcf9;padding:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px}.plan-tray>div{flex:1;display:flex;gap:5px;flex-wrap:wrap}.plan-tray small{flex-basis:100%;color:#69765f}.inspector{background:#fcfcf9;border-left:1px solid #dedfd8;padding:20px;overflow-wrap:anywhere}.inspector-top{display:flex;justify-content:space-between;align-items:center}.sample-tag{font-size:10px;border:1px solid #e8e2d5;background:#f7f4ed;padding:4px 6px;border-radius:4px}.tags{display:flex;gap:5px;flex-wrap:wrap}.tags span{font-size:10px;padding:4px 6px;background:#eff1ea;border-radius:4px}.add-plan{width:100%;justify-content:center;margin-block:16px;border:1px solid #bccbb2}.provenance{font-size:11px;line-height:1.7}.empty,.empty-inspector{padding:30px 24px}.error{margin:12px}.quiet{align-self:flex-start}
@media(max-width:1100px){.scene{grid-template-columns:140px minmax(280px,1fr)}.inspector:not(.has-selection){display:none}.inspector{grid-column:2;grid-row:1;border-top:1px solid #dedfd8;border-left:0;max-height:45vh;overflow:auto;position:sticky;top:0;z-index:3}.map-area{grid-column:2;grid-row:2}.rail{grid-row:1 / 3}}
@media(max-width:700px){.scene{grid-template-columns:minmax(0,1fr)}.rail{grid-row:auto;border-right:0;border-bottom:1px solid #dedfd8}.rail details{max-height:180px;overflow:auto}.inspector{grid-column:1;grid-row:1}.map-area{grid-column:1;grid-row:auto}.rail{grid-row:auto}.map-heading{padding:20px}.defiant h2{font-size:20px}}
</style>
