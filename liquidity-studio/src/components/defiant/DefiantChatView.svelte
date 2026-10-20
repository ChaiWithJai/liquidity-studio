<script>
  import '../../app-chrome.css';
  import ResearchPage from './ResearchPage.svelte';
  import ResearchToolbar from './ResearchToolbar.svelte';
  let {view=null,choices={},loading=false,error='',onSelection=()=>{},onRetry=null}=$props();
  const kinds={artistId:'artists',trackId:'tracks',sourceId:'sources',opportunityId:'opportunities'};
  const labels={artistId:'Artist',trackId:'Recording',sourceId:'Source evidence',opportunityId:'Illustrative opportunity'};
  const stepLabels={missing:'Choose an input',available:'Available to inspect',unavailable:'Continue in the workspace','review-required':'Review required'};
  const metricLabels={budget:'Budget',spend:'Spend',impressions:'Impressions',clicks:'Clicks',streams:'Streams',royaltyPerStream:'Royalty per stream',roas:'ROAS'};
  const rows=key=>Array.isArray(choices[kinds[key]])?choices[kinds[key]].slice(0,25):[];
  const selected=$derived(view?.selectedRecords||{});
  const scenario=$derived(selected.opportunities?.scenario||selected.campaigns?.scenario||selected.tracks?.scenario);
  const metrics=$derived(Object.entries(metricLabels).filter(([key])=>Number.isFinite(scenario?.[key])));
  function options(key){
    const all=rows(key),selection=view?.selection||{};
    if(key==='trackId'&&selection.artistId)return all.filter(row=>row.artistId===selection.artistId);
    if(key==='sourceId'&&selection.trackId)return all.filter(row=>row.trackIds?.includes(selection.trackId));
    if(key==='opportunityId'&&selection.trackId)return all.filter(row=>row.trackId===selection.trackId);
    return all;
  }
  function select(key,value){
    if(loading||!view||!Object.hasOwn(kinds,key)||value&&!options(key).some(row=>row.id===value))return;
    const next={...view.selection};
    if(value)next[key]=value;else delete next[key];
    // Dependent selections are requests for a fresh projection, never durable edits.
    if(key==='artistId')for(const child of ['trackId','sourceId','campaignId','opportunityId'])delete next[child];
    if(key==='trackId')for(const child of ['sourceId','campaignId','opportunityId'])delete next[child];
    if(key==='sourceId')for(const child of ['campaignId','opportunityId'])delete next[child];
    if(key==='opportunityId'){
      delete next.campaignId;
      const opportunity=rows(key).find(row=>row.id===value);
      if(opportunity){delete next.artistId;next.trackId=opportunity.trackId;if(next.sourceId&&!opportunity.sourceIds?.includes(next.sourceId))delete next.sourceId;}
    }
    onSelection(next);
  }
  function sourceHref(value){
    try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}
  }
</script>

<ResearchPage label="Defiant guided research">
  <div class="chat-research" aria-busy={loading}>
    <header class="chat-heading">
      <div><p class="brand">DEFIANT · RESEARCH</p><h2>{view?.pathway?.title||'Explore a research pathway'}</h2></div>
      {#if view}<span class="provenance">{view.dataset.provenance==='synthetic'?'Synthetic demonstration':'User-reported · unverified'}</span>{/if}
    </header>
    {#if loading}<p role="status" class="feedback">Loading research…</p>{/if}
    {#if error}<div role="alert" class="feedback error"><p>{error}</p>{#if onRetry}<button disabled={loading} onclick={()=>onRetry()}>Retry research</button>{/if}</div>{/if}
    {#if view}
      <div class="dataset-meta"><strong>{view.dataset.label}</strong><span>{view.dataset.asOf?`As of ${view.dataset.asOf}`:'Date not supplied'}</span><span>{view.dataset.counts.artists} artists · {view.dataset.counts.tracks} recordings · {view.dataset.counts.sources} sources</span></div>
      <ResearchToolbar label="Choose research context">
        {#each Object.keys(kinds) as key(key)}
          <label class="choice">{labels[key]}<select aria-label={labels[key]} disabled={loading||!options(key).length} value={view.selection[key]||''} onchange={event=>select(key,event.currentTarget.value)}>
            <option value="">{options(key).length?`Choose ${labels[key].toLowerCase()}`:'No supplied choices'}</option>
            {#if view.selection[key]&&!options(key).some(row=>row.id===view.selection[key])}<option value={view.selection[key]}>Current selection · {view.selection[key]}</option>{/if}
            {#each options(key) as row(row.id)}<option value={row.id}>{row.name||row.title}</option>{/each}
          </select></label>
        {/each}
      </ResearchToolbar>
      <ol class="stepper" aria-label="Research pathway steps">
        {#each view.steps as step(step.id)}<li class:current={view.nextStep?.id===step.id} aria-current={view.nextStep?.id===step.id?'step':undefined}><span>{step.label}</span><small>{stepLabels[step.state]||'Review required'}</small></li>{/each}
      </ol>
      <div class="research-body">
        <section class="context" aria-label="Selected research and evidence">
          {#if Object.keys(selected).length}
            <div class="selected-context">{#if selected.artists}<p class="research-meta">{selected.artists.name}</p>{/if}<h3>{selected.tracks?.title||selected.opportunities?.title||selected.sources?.title||selected.campaigns?.title||selected.artists?.name}</h3></div>
            {#if selected.opportunities}<div class="opportunity"><h4>{selected.opportunities.title}</h4><p>Illustrative score: {selected.opportunities.score} / 100 · scenario, not measured performance</p><ul>{#each selected.opportunities.reasons as reason,index(index)}<li>{reason}</li>{/each}</ul></div>{/if}
            {#if metrics.length}<section class="scenario" aria-label="Illustrative scenario"><h4>Scenario values</h4><dl>{#each metrics as [key,label](key)}<div><dt>{label}</dt><dd>{scenario[key]}</dd></div>{/each}</dl><p class="research-meta">Illustrative values. Currency and accounting basis are not supplied.</p></section>{/if}
            <h4>Source evidence</h4>
            {#if view.evidence.length}<ul class="evidence">{#each view.evidence as source(source.id)}<li><strong>{source.title}</strong><span>{source.provenance==='synthetic'?'Synthetic reference':'User-reported reference'} · rights unknown</span>{#if sourceHref(source.url)}<a href={sourceHref(source.url)} target="_blank" rel="noopener noreferrer">Open source: {source.title} ↗</a>{/if}</li>{/each}</ul>
            {:else}<p>No linked source evidence is selected. Choose a source before drawing a conclusion.</p>{/if}
          {:else}<h3>Start with a supplied reference</h3><p>Choose an artist, recording or illustrative opportunity to inspect its context. Selecting a record does not change saved work.</p>{/if}
        </section>
        <aside class="next-step" aria-label="Next research step">
          <p class="brand">NEXT STEP</p><h3>{view.nextStep?.label||'Review this research'}</h3>
          {#if view.status==='needs-workspace-context'}<p>This dataset does not supply {view.nextStep.missingInputs.map(key=>({momentId:'a saved working moment',regionId:'a region',collaboratorId:'a collaborator'}[key]||key)).join(' or ')}. Continue with the existing Studio workflow; no completed step is inferred here.</p>
          {:else if view.status==='needs-input'}<p>Choose the relevant supplied reference above to continue.</p>
          {:else}<p>Review these references and unknowns before preparing a plan in Studio. No campaign has been saved by this view.</p>{/if}
          <p class="rights">Rights and availability are unknown.</p><p class="research-meta">Read-only research · no approval or publication</p>
        </aside>
      </div>
      <details class="limits"><summary>Evidence limits and dataset snapshot</summary><ul>{#each view.warnings as warning,index(index)}<li>{warning}</li>{/each}{#each view.unknowns as unknown,index(index)}<li>{unknown}</li>{/each}</ul><p>Demand history and royalty ledger are not supplied by this dataset.</p><p class="revision">Snapshot revision: {view.dataset.revision||'not supplied'}</p></details>
    {:else if !loading&&!error}<section class="empty"><h3>No research is open</h3><p>Open a Defiant pathway to inspect its supplied references and next step.</p></section>{/if}
  </div>
</ResearchPage>
<style>
  .chat-research{min-width:0;color:var(--app-ink);background:var(--app-surface)}
  .chat-heading{display:flex;gap:12px;align-items:start;justify-content:space-between;padding:18px 20px 12px;flex-wrap:wrap}
  .brand{margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:1.1px;color:var(--app-muted)}
  .provenance{padding:4px 8px;background:var(--app-selected);border-radius:4px;font-size:12px;line-height:1.5;font-weight:600}
  .dataset-meta{display:flex;flex-wrap:wrap;gap:4px 14px;padding:0 20px 14px;font-size:12px;color:var(--app-muted)}
  .dataset-meta strong{color:var(--app-ink);min-width:0;overflow-wrap:anywhere}
  .choice{flex:1;min-width:150px;max-width:280px}
  .stepper{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));list-style:none;gap:8px;margin:0;padding:14px 20px;border-bottom:1px solid var(--app-line);counter-reset:steps}
  .stepper li{counter-increment:steps;min-width:0;padding:8px;border-left:2px solid var(--app-line);font-size:12px;overflow-wrap:anywhere}
  .stepper li::before{content:counter(steps) '. ';font-weight:700}.stepper small{display:block;margin-top:3px;color:var(--app-muted);font-size:11px}.stepper .current{border-color:var(--app-accent);background:var(--app-canvas)}
  .research-body{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(220px,1fr);gap:24px;padding:20px}
  .context{min-width:0;overflow-wrap:anywhere}.context p{margin:6px 0 12px}.selected-context{margin-bottom:16px}
  .opportunity{margin-bottom:18px}.opportunity ul{padding-left:20px}.opportunity li{margin:5px 0}
  .evidence{padding:0;list-style:none;margin:8px 0}.evidence li{padding:10px 0;border-top:1px solid var(--app-line);display:grid;gap:5px}.evidence span{font-size:12px;color:var(--app-muted)}a{color:var(--app-accent);overflow-wrap:anywhere}
  .next-step{min-width:0;align-self:start;padding:16px;background:var(--app-canvas);border:1px solid var(--app-line);border-radius:8px;overflow-wrap:anywhere}.next-step p{margin:8px 0}.rights{font-weight:600}
  .scenario{margin:16px 0}.scenario dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.scenario dl div{border:1px solid var(--app-line);padding:8px}.scenario dt{font-size:12px;color:var(--app-muted)}.scenario dd{margin:2px 0 0;font-weight:600}
  .limits{border-top:1px solid var(--app-line);padding:12px 20px;font-size:12px}.limits ul{padding-left:18px}.limits li{margin:6px 0}.revision{overflow-wrap:anywhere}.feedback{margin:0;padding:12px 20px}.feedback p{margin:0 0 8px}.error{border-left:3px solid #8e2929}.empty{padding:20px}
  @media(max-width:600px){.research-body{grid-template-columns:minmax(0,1fr);gap:16px;padding:16px}.chat-heading{padding:16px}.dataset-meta{padding:0 16px 12px}.stepper{grid-template-columns:repeat(2,minmax(0,1fr));padding:12px 16px}.choice{max-width:none;min-width:130px}.limits{padding:12px 16px}}
</style>
