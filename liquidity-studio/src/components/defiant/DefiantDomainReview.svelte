<script>
 import {untrack} from 'svelte';
 let {view=null,input=null,choices={},loading=false,error='',onSelection=()=>{},onRetry=()=>{}}=$props();
 let artistId=$state(untrack(()=>input?.artistId??''));
 let trackId=$state(untrack(()=>input?.trackId??''));
 let regionId=$state(untrack(()=>input?.regionId??''));
 let budgetsText=$state(untrack(()=>input?.budgets?.join(', ')??''));
 let horizonMonths=$state(untrack(()=>input?.horizonMonths??3));
 let formError=$state('');
 const ready=$derived(view?.status==='human-review-required');
 const recording=$derived(view?.explanation?.recording);
 const region=$derived(view?.explanation?.region);
 const regional=$derived(view?.regional?.items?.find(row=>row.trackId===view?.selection?.trackId&&row.regionId===view?.selection?.regionId));
 const observations=$derived((view?.explanation?.observations??[]).slice(0,24));
 const maxStreams=$derived(Math.max(1,...observations.map(row=>row.streams)));
 const trackChoices=$derived((choices.tracks??[]).filter(row=>row.artistId===artistId));
 const number=value=>Number.isFinite(value)?new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(value):'Unavailable';
 const money=value=>Number.isFinite(value)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value):'Unavailable';
 function submit(event){
  event.preventDefault();
  const parts=budgetsText.split(',').map(value=>value.trim());
  const budgets=parts.map(Number),months=Number(horizonMonths);
  if(!artistId||parts.some(value=>!value)||budgets.length<1||budgets.length>3||budgets.some(value=>!Number.isFinite(value)||value<0||value>100000)||new Set(budgets).size!==budgets.length||!Number.isInteger(months)||months<1||months>12){formError='Choose an artist, one to three distinct budgets between 0 and 100,000, and a horizon of 1–12 months.';return;}
  formError='';onSelection({artistId,...(trackId?{trackId}:{}),...(regionId?{regionId}:{}),budgets,horizonMonths:months});
 }
 function partyName(id){return view?.overview?.artist?.id===id?view.overview.artist.name:view?.overview?.collaborators?.find(row=>row.id===id)?.name??id;}
</script>

<main class="domain-review" aria-busy={loading}>
 <header>
  <p class="eyebrow">Defiant · Domain review</p>
  <div class="title-row"><h1>{view?.pathway?.title??'Artist and regional opportunity review'}</h1><span class="badge">{view?.dataset?.provenance==='user-reported'?'User-reported data':'Fictional demonstration'}</span></div>
  <p>Joined research for a human decision. This tool cannot approve rights, save a campaign or publish.</p>
  {#if view?.dataset}<p class="metadata">{view.dataset.label} · As of {view.dataset.asOf??'not supplied'} · {view.dataset.counts?.artists??'—'} artists · {view.dataset.counts?.tracks??'—'} recordings <span class="revision">Revision {view.dataset.revision}</span></p>{/if}
 </header>

 <nav aria-label="Domain review steps"><ol><li>Artist &amp; recording</li><li>Regional evidence</li><li>Rights &amp; royalties</li><li>Scenarios &amp; human review</li></ol></nav>
 <form onsubmit={submit} aria-label="Review inputs">
  <div class="inputs">
   <label>Artist<select bind:value={artistId} onchange={()=>{trackId='';}} disabled={loading}><option value="">Choose an artist</option>{#each choices.artists??[] as row(row.id)}<option value={row.id}>{row.name}</option>{/each}</select></label>
   <label>Recording<select bind:value={trackId} disabled={loading||!artistId}><option value="">First matching regional proposal</option>{#each trackChoices as row(row.id)}<option value={row.id}>{row.title}</option>{/each}</select></label>
   <label>Region<select bind:value={regionId} disabled={loading}><option value="">First matching region</option>{#each choices.regions??[] as row(row.id)}<option value={row.id}>{row.name}</option>{/each}</select></label>
   <label>Illustrative budgets (USD)<input bind:value={budgetsText} disabled={loading} placeholder="Enter amounts, separated by commas" aria-describedby="budget-help"/></label>
   <label>Horizon (months)<input type="number" min="1" max="12" step="1" bind:value={horizonMonths} disabled={loading}/></label>
   <button type="submit" disabled={loading||!input}>Compare review</button>
  </div>
  <p id="budget-help" class="small">Supply 1–3 amounts, including 0 if useful. For example: 0, 500, 1000. These are your scenario inputs, not spending recommendations.</p>
  {#if formError}<p role="alert">{formError}</p>{/if}
 </form>
 {#if loading}<p role="status">{view?'Updating review… Previous results remain below.':'Opening domain review…'}</p>{/if}
 {#if error}<div class="error" role="alert"><p>{error}</p><button type="button" onclick={onRetry} disabled={loading}>Retry review</button></div>{/if}
 {#if view?.status==='needs-input'}<section aria-label="Inputs needed"><h2>Choose the review context</h2><p>{view.nextStep}</p>{#if view.missingInputs?.length}<p>Needed: {view.missingInputs.join(', ')}</p>{/if}</section>{/if}

 {#if ready}
  <section class="context" aria-label="Joined review context">
   <div><p class="eyebrow">Selected catalog</p><h2>{view.overview.artist.name}</h2><p>{recording.title}</p><p class="small">{recording.id}</p></div>
   <div><p class="eyebrow">Regional proposal</p><h2>{region.name}</h2><p>{view.selection.method==='explicit-selection'?'Explicit recording and region':'First matching ranked proposal; review the evidence below.'}</p><p>Heuristic signal score: {number(view.explanation.item?.score)} / 100 · not a trained ranking</p><p class="small">{view.overview.collaborators?.length??0} linked collaborators · availability unverified</p></div>
  </section>
  <div class="review-grid">
   <section aria-labelledby="demand-heading">
    <h2 id="demand-heading">Regional demand evidence</h2>
    <p class="small">Synthetic monthly streams · {region.name} · {recording.title}</p>
    {#if observations.length}
     <div class="chart" aria-label="Monthly regional demand chart">
      {#each observations as row(row.id)}<div class="chart-row"><span>{row.date.slice(0,7)}</span><span class="bar-track"><span class="bar" style:width={`${100*row.streams/maxStreams}%`}></span></span><strong>{number(row.streams)}</strong></div>{/each}
     </div>
     <details><summary>Monthly values and evidence IDs</summary><div class="table-scroll"><table><caption>Selected recording and region; no interpolated observations</caption><thead><tr><th>Month</th><th>Streams</th><th>Evidence</th></tr></thead><tbody>{#each observations as row(row.id)}<tr><th>{row.date.slice(0,7)}</th><td>{number(row.streams)}</td><td class="identifier">{row.id}</td></tr>{/each}</tbody></table></div></details>
    {:else}<p>Monthly observations were not supplied in this result. The period totals below remain available.</p>{/if}
    {#if regional}<dl class="metrics"><div><dt>Prior 3 months</dt><dd>{number(regional.baselineStreams)}</dd></div><div><dt>Recent 3 months</dt><dd>{number(regional.recentStreams)}</dd></div><div><dt>Change</dt><dd>{regional.growthRate===null?'No nonzero baseline':`${number(regional.growthRate*100)}%`}</dd></div></dl>{/if}
    <p class="small">Baseline: {view.regional.periods?.baseline?.join(', ')??'not supplied'}. Recent: {view.regional.periods?.recent?.join(', ')??'not supplied'}.</p>
    <details><summary>Comparison method and assumptions</summary><p>{regional?.method??'Unavailable'}</p>{#each view.regional.assumptions??[] as assumption,index(`${index}:${assumption}`)}<p>{assumption}</p>{/each}</details>
   </section>
   <section aria-labelledby="rights-heading">
    <h2 id="rights-heading">Linked rights &amp; royalties</h2>
    <p>Rights approval: <strong>not granted</strong>. Simulated-clear is a fictional scenario, not clearance.</p>
    <ul>{#each view.rightsAndRoyalties.rights??[] as row(row.id)}<li>{row.territory}: {row.status}</li>{/each}</ul>
    {#if !view.rightsAndRoyalties.rights?.length}<p>No matching rights records were supplied. Rights remain unknown.</p>{/if}
    <dl class="metrics"><div><dt>Ledger streams</dt><dd>{number(view.rightsAndRoyalties.royalties?.streams)}</dd></div><div><dt>Scenario royalties</dt><dd>{money(view.rightsAndRoyalties.royalties?.amountCents/100)}</dd></div></dl>
    <div class="table-scroll"><table><caption>Linked royalty allocation · synthetic USD</caption><thead><tr><th>Party</th><th>Amount</th></tr></thead><tbody>{#each view.rightsAndRoyalties.royalties?.splits??[] as row(row.partyId)}<tr><th>{partyName(row.partyId)}</th><td>{money(row.amountCents/100)}</td></tr>{/each}</tbody></table></div>
    <details><summary>Inspect monthly royalty ledger</summary><div class="table-scroll"><table><thead><tr><th>Month</th><th>Streams</th><th>USD</th></tr></thead><tbody>{#each view.rightsAndRoyalties.royalties?.rows??[] as row(row.id)}<tr><th>{row.date.slice(0,7)}</th><td>{number(row.streams)}</td><td>{money(row.royaltyCents/100)}</td></tr>{/each}</tbody></table></div></details>
    <p class="small">These fictional ledger amounts are not earned revenue. Intended use, participants and rights need separate confirmation.</p>
   </section>
  </div>
  <section aria-labelledby="scenario-heading">
   <h2 id="scenario-heading">Compare your illustrative scenarios</h2>
   <p>Trailing-three-month baseline: {number(view.scenarioComparison.baselineMonthlyStreams)} streams/month. Untrained; no measured campaign lift.</p>
   <div class="table-scroll"><table><caption>Caller-supplied budgets · {view.scenarioComparison.scenarios[0]?.horizonMonths} month horizon</caption><thead><tr><th>Budget</th><th>Baseline streams</th><th>Assumed additional streams</th><th>Projected streams</th><th>Projected royalties</th><th>Royalties less budget</th></tr></thead><tbody>{#each view.scenarioComparison.scenarios as row(row.budget)}<tr><th>{money(row.budget)}</th><td>{number(row.baselineStreams)}</td><td>{number(row.assumedIncrementalStreams)}</td><td>{number(row.projectedStreams)}</td><td>{row.projectedRoyaltyCents===null?'Unavailable':money(row.projectedRoyaltyCents/100)}</td><td>{money(row.netAfterBudget)}</td></tr>{/each}</tbody></table></div>
   <details><summary>Scenario assumptions</summary>{#each view.scenarioComparison.assumptions??[] as assumption,index(`${index}:${assumption}`)}<p>{assumption}</p>{/each}{#each view.scenarioComparison.scenarios[0]?.assumptions??[] as assumption,index(`${index}:${assumption}`)}<p>{assumption}</p>{/each}</details>
  </section>
  <section class="human-review" aria-label="Human review pending"><p class="eyebrow">Human review · pending</p><h2>Review before any separate campaign action</h2><ol>{#each view.review.questions as question,index(`${index}:${question}`)}<li>{question}</li>{/each}</ol><ul>{#each view.review.unknowns as unknown,index(`${index}:${unknown}`)}<li>{unknown}</li>{/each}</ul><p>{view.review.nextStep}</p><details><summary>Joined evidence references ({view.evidenceIds.length})</summary><ul class="evidence">{#each view.evidenceIds as reference(reference)}<li>{reference}</li>{/each}</ul></details></section>
 {:else if !view&&!loading&&!error}<p>Open a domain review from the chat host to choose an artist and explicit scenario inputs.</p>{/if}
</main>

<style>
 .domain-review{font-family:var(--app-font,Inter,system-ui,sans-serif);color:var(--app-ink,#19251c);background:var(--app-surface,#fff);padding:clamp(14px,3vw,28px);max-width:1120px;margin:auto;line-height:1.5;overflow-wrap:anywhere}header p{margin:6px 0}.title-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}h1{font-size:clamp(22px,3vw,30px);line-height:1.2;margin:0}h2{font-size:18px;line-height:1.3;margin:0 0 10px}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--app-muted,#59665d)}.badge{background:#eef1e8;border:1px solid #d5ddcf;border-radius:20px;padding:4px 9px;font-size:12px;font-weight:650}.metadata,.small{font-size:12px;color:var(--app-muted,#59665d)}.revision{display:block;font-family:monospace;font-size:10px}nav ol{display:flex;gap:6px 20px;flex-wrap:wrap;padding-left:22px;font-size:12px;font-weight:650}form,section{border:1px solid var(--app-line,#dedfd5);border-radius:12px;padding:16px;margin-top:14px;min-width:0}.inputs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:end}label{display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:650}input,select,button{box-sizing:border-box;width:100%;min-width:0;font:inherit;padding:9px;border:1px solid #b6c1b3;border-radius:7px;background:#fff;color:inherit}button{background:#263a2d;color:#fff;cursor:pointer;font-weight:650}button:disabled{opacity:.6;cursor:wait}:focus-visible{outline:3px solid #2e754d;outline-offset:3px}.context,.review-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.context p{margin:5px 0}.review-grid section{margin-top:14px}.chart{display:grid;gap:6px;margin:14px 0}.chart-row{display:grid;grid-template-columns:54px minmax(0,1fr) 62px;gap:8px;align-items:center;font-size:11px}.chart-row strong{text-align:right;font-variant-numeric:tabular-nums}.bar-track{background:#edf1e8;border-radius:3px;height:12px}.bar{display:block;height:12px;background:#527a57;border-radius:3px}.metrics{display:flex;gap:18px;flex-wrap:wrap;margin:16px 0}.metrics div{min-width:90px}.metrics dt{font-size:11px;color:var(--app-muted,#59665d)}.metrics dd{margin:0;font-size:18px;font-weight:650;font-variant-numeric:tabular-nums}.table-scroll{max-width:100%;overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:12px}caption{text-align:left;font-size:11px;color:var(--app-muted,#59665d);padding:8px 0}th,td{padding:9px 8px;border-bottom:1px solid #e3e8de;text-align:left;vertical-align:top;font-variant-numeric:tabular-nums}th{font-weight:650}details{font-size:12px;margin-top:12px}summary{cursor:pointer;font-weight:650}.identifier,.evidence{font-family:monospace;font-size:10px}.evidence{max-height:240px;overflow:auto;padding-left:20px}.human-review{border-left:4px solid #68845c;background:#f5f7f1}.error{border-left:4px solid #9b3d30;padding:10px 14px;margin-top:12px}.error button{width:auto}li{margin-bottom:5px}@media(max-width:680px){.inputs,.context,.review-grid{grid-template-columns:1fr}.inputs{gap:10px}nav ol{gap:6px 18px}.domain-review{padding:14px}section,form{padding:12px}.metrics{gap:12px}th,td{padding:8px 6px}}
</style>
