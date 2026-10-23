<script>
 import {onDestroy,untrack} from 'svelte';
 import HypothesisReview from './HypothesisReview.svelte';
 import AnswerObservations from './AnswerObservations.svelte';
 import EvidenceDecisionCard from './EvidenceDecisionCard.svelte';
 import ResearchToolbar from './ResearchToolbar.svelte';
 import ResearchInspector from './ResearchInspector.svelte';
 import {createEvidenceExplorer,emptyEvidenceView,evidenceLocation} from '../../lib/defiant-evidence-explorer.js';
 let {request,location,onNavigate=()=>{}}=$props();
 let retainedDraft=$state({query:'',sourceId:'',format:'',kind:'',sourceHash:'',fromMonth:'',toMonth:''});
 let view=$state(emptyEvidenceView()),field=$state('Total Earned'),refreshEpoch=$state(0);
 const cleared={evidenceJuneReview:false,evidenceGroupId:'',evidenceSelectionId:'',evidenceReceiptId:'',evidenceComparisonId:'',evidenceComparisonGroupId:'',evidenceReferenceIndex:null,evidenceAudienceId:'',evidenceAudienceCells:false};
 const active=$derived(evidenceLocation(location));
 const controller=createEvidenceExplorer({request:(...args)=>request(...args),onState:value=>view=value});
 $effect(()=>{const input=location;refreshEpoch;untrack(()=>{retainedDraft={query:'',sourceId:'',format:'',kind:'',sourceHash:'',fromMonth:'',toMonth:'',...evidenceLocation(input).retainedFilters};field='Total Earned';void controller.load(input);});});
 onDestroy(()=>controller.cancel());
 function navigate(next){onNavigate({...location,view:'evidence',sample:'',evidenceRevision:view.revision||active.revision,evidenceOffset:0,...next});}
 function root(mode=active.mode){navigate({...cleared,evidenceMode:mode});}
 function refresh(){const next={...location,view:'evidence',evidenceRevision:'',...cleared,evidenceOffset:0};onNavigate(next);refreshEpoch++;}
 const page=$derived(active.mode==='retained'&&view.list?.availability===false?null:view.comparison||view.selection||view.group||view.list);
 const fields=$derived([...new Set(view.receipts.flatMap(receipt=>Object.keys(receipt.cells)))]);
 const modeLabel=$derived(active.mode==='retained'?'retained sources':active.mode==='changes'?'changes':active.mode==='audience'?'audience definitions':active.mode==='identity'?'identity review':active.mode==='selections'?'source selections':'earnings');
 const highlight=$derived(fields.includes(field)?field:fields.find(name=>/earned|amount/i.test(name))||fields[0]||'');
</script>
<section aria-label="Earnings and receipts" aria-busy={view.loading}>
 <ResearchToolbar label="Evidence navigation">
  <div class="heading"><h2>Earnings &amp; receipts</h2><p class="research-meta">Reported amounts, source identities and the records behind them.</p></div>
  <button disabled={view.loading} onclick={()=>root('earnings')} aria-pressed={active.mode==='earnings'}>Earnings</button>
  <button disabled={view.loading} onclick={()=>root('identity')} aria-pressed={active.mode==='identity'}>Identity review</button>
  <button disabled={view.loading} onclick={()=>root('selections')} aria-pressed={active.mode==='selections'}>Source selections</button>
  <button disabled={view.loading} onclick={()=>root('changes')} aria-pressed={active.mode==='changes'}>Changes</button>
  <button disabled={view.loading} onclick={()=>root('retained')} aria-pressed={active.mode==='retained'}>Retained sources</button>
  <button disabled={view.loading} onclick={()=>root('audience')} aria-pressed={active.mode==='audience'}>Audience definitions</button>
  <button disabled={view.loading} onclick={refresh}>Refresh evidence</button>
 </ResearchToolbar>
 <HypothesisReview {request} revision={view.revision||active.revision} onEvidence={next=>navigate({...cleared,evidenceOffset:0,...next})}/>
 {#if active.mode==='retained'}
   <form class="retained-filters" onsubmit={event=>{event.preventDefault();navigate({...cleared,evidenceMode:'retained',retainedFilters:{...retainedDraft}});}}>
    <fieldset disabled={view.loading}><legend>Find retained source metadata</legend>
     <label>Filename, member path or hash<input maxlength="200" bind:value={retainedDraft.query}/></label>
     <label>Source identifier<input maxlength="128" bind:value={retainedDraft.sourceId}/></label>
     <label>File format<select bind:value={retainedDraft.format}><option value="">All formats</option>{#each ['csv','xlsx','xls','pdf','png','jpg','zip','tar.gz','json','other'] as format (format)}<option value={format}>{format}</option>{/each}</select></label>
     <label>Record kind<select bind:value={retainedDraft.kind}><option value="">Roots and members</option><option value="root">Root objects</option><option value="member">Archive members</option></select></label>
     <label>Exact source hash<input maxlength="64" bind:value={retainedDraft.sourceHash}/></label>
     <label>Declared period from<input type="month" bind:value={retainedDraft.fromMonth}/></label><label>Declared period to<input type="month" bind:value={retainedDraft.toMonth}/></label>
     <button type="submit">Search retained sources</button><button type="button" onclick={()=>navigate({...cleared,evidenceMode:'retained',retainedFilters:{}})}>Clear source filters</button>
    </fieldset>
   </form>
 {/if}
 {#if view.loading}<p class="message" role="status">Opening evidence…</p>
 {:else if view.error}<p class="message" role="alert">{view.error}</p>
 {:else if view.manifest&&view.mode===active.mode}
  {#key view.revision}<AnswerObservations {request} revision={view.revision}/>{/key}
  <div class="coverage"><h3>Evidence coverage</h3><p>{view.manifest.coverage}</p><p class="research-meta">{view.manifest.counts.months} reported periods · {view.manifest.counts.selections} source selections{#if view.manifest.counts.identityGroups !== undefined} · {view.manifest.counts.identityGroups} identity review groups{/if}</p><details><summary>Snapshot details</summary><p>Organization: <code>{view.manifest.scope.organizationId}</code></p><p>Revision: <code>{view.revision}</code></p></details></div>
  {#if active.groupId||active.selectionId||active.receiptId||active.comparisonId||active.audienceId}<nav class="breadcrumbs" aria-label="Evidence trail"><button onclick={()=>navigate({...cleared,evidenceMode:active.mode,evidenceOffset:active.receiptId&&active.mode==='earnings'?active.offset:0})}>Back to {modeLabel}</button>{#if active.comparisonGroupId}<button onclick={()=>navigate({evidenceComparisonGroupId:'',evidenceReferenceIndex:null,evidenceOffset:active.offset})}>Back to comparison</button>{/if}</nav>{/if}
  {#if active.mode==='retained'}

   {#if view.list}
    {#if !view.list.availability}<p role="status" class="message">Retained intake register unavailable. This does not mean no files were retained.</p>
    {:else}
     <div class="coverage"><h3>Retained intake metadata</h3><p>{view.list.scopeDescription}</p><p>Captured: {view.list.capturedAt}</p><p>Matching filters: {view.list.matchingCounts.rootObjects} root objects · {view.list.matchingCounts.memberOccurrences} archive member occurrences · {view.list.matchingCounts.undatedRecords} undated records</p><h4>Whole retained register</h4><p>{view.list.globalCounts.rootObjects} root objects · {view.list.globalCounts.memberOccurrences} archive member occurrences · {view.list.globalCounts.leafOccurrences} member leaves · {view.list.globalCounts.uniqueLeafHashes} unique member leaf hashes · {view.list.globalCounts.duplicateLeafHashGroups} repeated member leaf hash groups</p><p>{view.list.globalCounts.undatedRecords} undated records in this register. Period filters exclude undated records. No complete provider or Downloads inventory is claimed; repeated content hashes are not deduplicated sales.</p></div>
     <div class="members">{#each view.list.items as row(row.id)}<article><h3>{row.kind==='root'?row.filename:row.chain.at(-1)}</h3><p>{row.kind==='root'?'Root object':row.container?'Archive container member':'Archive member'} · {row.format} · {row.bytes} bytes</p><dl><dt>Source</dt><dd>{row.sourceId}</dd><dt>Source hash</dt><dd><code>{row.sha256}</code></dd><dt>Occurrence</dt><dd><code>{row.id}</code></dd>{#if row.kind==='member'}<dt>Root reference</dt><dd><code>{row.rootId}</code></dd><dt>Member chain</dt><dd>{row.chain.join(' → ')}</dd>{:else}<dt>Original generation</dt><dd>{row.generation}</dd><dt>Member inventory</dt><dd>{row.memberInventory.status}: {row.memberInventory.scope}</dd><dt>Supplied transfer checks</dt><dd>Size: {String(row.retentionVerification.size)} · CRC32C: {String(row.retentionVerification.crc32c)} · MD5: {String(row.retentionVerification.md5)} (null means unknown)</dd>{/if}<dt>Declared periods</dt><dd>{#each row.periods as period (period.month+period.periodKind+period.sourceText)}<p>{period.month} · {period.periodKind} · {period.basis}<br/>{period.sourceText}</p>{:else}No explicit filename period registered{/each}</dd><dt>Served association</dt><dd>{row.servedAssociation}</dd></dl></article>{:else}<p role="status">No retained metadata matches these filters or this page. This is not evidence of missing provider delivery.</p>{/each}</div>
     <div class="coverage">{#each view.list.limitations as limitation (limitation)}<p>{limitation}</p>{/each}</div>
    {/if}
   {/if}
  {/if}
  {#if view.list&&['changes','audience'].includes(active.mode)}
   <div class="members">{#each view.list.items as row(row.id)}<article>{#if active.mode==='changes'}<h3>{row.dimension} change</h3><p>{row.beforeMonths.join(', ')} → {row.afterMonths.join(', ')}</p><p>Reported change: {row.summary.delta} {row.currency}</p><p>Period basis: {row.periodBasis} (producer assertion)</p><button onclick={()=>navigate({evidenceComparisonId:row.id})}>Inspect comparison {row.id}</button>{:else}<h3>{row.name}</h3><p>{row.criteria}</p><p>Supplied scale: {row.scaleText} — not recomputed</p><button onclick={()=>navigate({evidenceAudienceId:row.id})}>Inspect definition {row.name}</button>{/if}</article>{:else}<p>No {modeLabel} supplied in this evidence page.</p>{/each}</div><p class="message">{view.list.limitation}</p>
  {/if}
  {#if view.list&&!['changes','audience','retained'].includes(active.mode)}
   {#if !view.list.items.length}<p class="message">No {active.mode==='identity'?'identity review groups':active.mode==='selections'?'source selections':'earnings'} in this evidence page.</p>
   {:else}<!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable table needs keyboard access) -->
   <div class="table-scroll" tabindex="0" role="region" aria-label={active.mode==='identity'?'Identity review table':active.mode==='selections'?'Source selection table':'Reported earnings table'}><table><thead><tr><th scope="col">{active.mode==='identity'?'Source identity group':active.mode==='selections'?'Source selection':'Period'}</th><th scope="col">Reported amount</th><th scope="col">Evidence</th></tr></thead><tbody>
    {#each view.list.items as row (active.mode!=='earnings'?row.id:row.month+row.currency)}<tr><th scope="row">{#if active.mode==='identity'}{row.artist} — {row.title}<small>{row.memberCount} observations · {row.missingSourceIds} missing IDs</small>{:else if active.mode==='selections'}{row.label}<small>{row.rowCount} contributing locators</small>{:else}{row.month}{/if}</th><td>{row.amount} {row.currency}</td><td>{#if active.mode==='identity'}<button onclick={()=>navigate({evidenceGroupId:row.id,evidenceSelectionId:'',evidenceReceiptId:''})}>Review {row.title}</button>{:else if active.mode==='selections'}<button onclick={()=>navigate({evidenceSelectionId:row.id,evidenceGroupId:'',evidenceReceiptId:''})}>Inspect selection {row.id}</button>{:else}{#each row.receiptIds as receiptId(receiptId)}<button onclick={()=>navigate({evidenceReceiptId:receiptId,evidenceGroupId:'',evidenceSelectionId:'',evidenceOffset:active.offset})}>Show example receipt {receiptId}</button>{/each}{#if !row.receiptIds.length}No example receipt supplied{/if}{/if}</td></tr>{/each}
   </tbody></table></div>{/if}
   {#if active.mode==='earnings'}<p class="message">Example receipts show individual source records; they do not prove a monthly total. Open Source selections to inspect complete supplied selections, including unresolved identities.</p>{/if}
   {#if active.mode==='identity'}<p class="message">Review priority uses absolute net reported amount within each currency. Similar titles do not establish equivalent recordings.</p>{/if}
  {/if}
  {#if view.comparison}
   <div class="coverage"><h3>{view.comparison.comparison.dimension} change</h3><p>{view.comparison.comparison.beforeMonths.join(', ')} → {view.comparison.comparison.afterMonths.join(', ')}</p><p>Source/account: {view.comparison.comparison.sourceSystem} / {view.comparison.comparison.accountScope}</p><p>Period basis: {view.comparison.comparison.periodBasis} (producer assertion)</p><dl><dt>Before</dt><dd>{view.comparison.comparison.summary.beforeAmount} {view.comparison.comparison.currency}</dd><dt>After</dt><dd>{view.comparison.comparison.summary.afterAmount} {view.comparison.comparison.currency}</dd><dt>Net change</dt><dd>{view.comparison.comparison.summary.delta} {view.comparison.comparison.currency}</dd><dt>Gross decrease (positive magnitude)</dt><dd>{view.comparison.comparison.summary.grossDecrease}</dd><dt>Offset increase</dt><dd>{view.comparison.comparison.summary.offsetIncrease}</dd></dl><p>{view.comparison.limitation}</p><p>Different dimensions explain the same total change. Do not add their contributions across comparisons.</p></div>
   <div class="members">{#each view.comparison.groups as group(group.id)}<article><h4>{group.label}</h4><p>Source key: {group.key===null?'Unresolved':group.key}</p><p>{group.beforeAmount} → {group.afterAmount} {view.comparison.comparison.currency}; change {group.delta}</p>{#each group.sourceReferences as ref,index(ref.side+ref.month)}<button onclick={()=>navigate({evidenceComparisonGroupId:group.id,evidenceReferenceIndex:index,evidenceOffset:active.offset})}>Show {ref.side} examples {ref.month} for {group.id}</button>{:else}<p>No example records supplied.</p>{/each}</article>{/each}</div>
  {/if}
  {#if view.comparisonExamples}<div class="coverage"><h3>Comparison source examples</h3><p>{view.comparisonExamples.reference.side} · {view.comparisonExamples.reference.month}</p><p>{view.comparisonExamples.limitation}</p>{#if !view.receipts.length}<p>No source example records in this reference.</p>{/if}</div>{/if}
  {#if view.audience}
   <div class="coverage"><h3>{view.audience.definition.name}</h3><h4>Supplied workbook definition</h4><p>{view.audience.definition.criteria}</p><p>Supplied scale: {view.audience.definition.scaleText} — not recomputed</p><p>Proposed offer: {view.audience.definition.proposedOffer}</p><h4>Analyst evidence assessment</h4><p>Required: {view.audience.definition.requiredEvidence.join(', ')||'None listed'}</p><p>Observed availability: {view.audience.definition.observedEvidence.join(', ')||'None supplied'}</p><p>Missing: {view.audience.definition.missingEvidence.join(', ')||'None listed; this does not establish consent or eligibility'}</p><p>{view.audience.limitation}</p><button onclick={()=>navigate({evidenceAudienceCells:true})}>Show definition source cells</button></div>
  {/if}
  {#if view.worksheet}
   <ResearchInspector label="Original worksheet cells" selected={true}><h3>Original worksheet cells</h3><p>{view.worksheet.limitation}</p><p>Worksheet: {view.worksheet.worksheet.sheet}</p><details><summary>Workbook hash</summary><code>{view.worksheet.worksheet.sourceHash}</code></details><label>Highlight worksheet cell<select value={view.worksheet.worksheet.cells.some(cell=>cell.cellRef===field)?field:view.worksheet.worksheet.cells[0]?.cellRef} onchange={event=>field=event.currentTarget.value}>{#each view.worksheet.worksheet.cells as cell(cell.cellRef)}<option value={cell.cellRef}>{cell.cellRef}</option>{/each}</select></label>{#each view.worksheet.worksheet.cells as cell,index(cell.cellRef)}<article class="receipt"><h4>{cell.cellRef} · source type {cell.type}</h4><p class="cell-value">{#if cell.cellRef===field||(!view.worksheet.worksheet.cells.some(c=>c.cellRef===field)&&index===0)}<mark>{cell.value||'(empty)'}</mark>{:else}{cell.value||'(empty)'}{/if}</p><details><summary>Raw value and formula</summary><p class="cell-value">Raw: {cell.rawValue??'(absent)'}</p><p class="cell-value">Formula: {cell.formula??'(none)'}</p><p>Formula not executed by this tool; displayed values may be cached source values.</p></details></article>{/each}</ResearchInspector>
  {/if}
  {#if view.group&&!view.selection}
   <div class="coverage"><h3>{view.group.group.artist} — {view.group.group.title}</h3><p>{view.group.group.amount} {view.group.group.currency} · {view.group.total} source observations · {view.group.group.reviewStatus}</p><p>Inspect the source identities before deciding whether recordings match.</p></div>
   <div class="members">{#each view.group.members as member(member.id)}<article><h4>{member.releaseTitle||'Release title unavailable'}</h4><dl><dt>Source system / account</dt><dd>{member.sourceSystem} / {member.accountScope}</dd><dt>Source ID</dt><dd>{member.sourceId===null?'Missing source ID':member.sourceId}</dd><dt>UPC</dt><dd>{member.upc||'Not supplied'}</dd><dt>Reported amount</dt><dd>{member.amount} {member.currency}</dd></dl>{#each member.selectionIds as selectionId(selectionId)}<button onclick={()=>navigate({evidenceSelectionId:selectionId,evidenceGroupId:'',evidenceMode:'selections',evidenceReceiptId:''})}>Inspect selection {selectionId}</button>{/each}</article>{/each}</div>
  {/if}
  {#if view.selection}<div class="coverage"><h3>{view.selection.selection.label}</h3><p>{view.selection.selection.amount} {view.selection.selection.currency} · {view.selection.total} contributing record locators</p></div>{/if}
  {#if view.selection?.juneReviewAvailable}<div class="breadcrumbs"><button onclick={()=>navigate({evidenceJuneReview:!active.showJuneReview,evidenceOffset:active.offset})}>{active.showJuneReview?'Back to original selection cells':'Open June evidence review'}</button></div>{/if}
  {#if view.juneReview}<EvidenceDecisionCard packet={view.juneReview} coverage={view.storeCoverage?.product} onReceipts={()=>navigate({evidenceJuneReview:false,evidenceOffset:active.offset})}/>{/if}
  {#if view.receipts.length}
   <ResearchInspector label="Original source cells" selected={true}>
    <h3>Original source cells</h3><p>{view.cellLimitation}</p><p class="research-meta">Text from the supplied source records, not an image of the original worksheet.</p>
    <label>Highlight source field<select value={highlight} onchange={event=>field=event.currentTarget.value}>{#each fields as name(name)}<option value={name}>{name}</option>{/each}</select></label>
    {#each view.receipts as receipt(receipt.id)}<article class="receipt"><h4>{receipt.member} · record {receipt.record}</h4><p class="research-meta">1-based logical CSV record including header</p><details><summary>Source hash</summary><code>{receipt.sourceHash}</code></details><dl>{#each Object.entries(receipt.cells) as [name,value](name)}<dt>{name}</dt><dd>{#if name===highlight}<mark>{value||'(empty)'}</mark>{:else}{value||'(empty)'}{/if}</dd>{/each}</dl></article>{/each}
   </ResearchInspector>
  {/if}
  {#if page}<nav class="pagination" aria-label="Evidence pages"><button disabled={active.offset===0} onclick={()=>navigate({evidenceOffset:Math.max(0,active.offset-25)})}>Previous page</button><span>{page.total&&active.offset<page.total?active.offset+1:0}–{active.offset<page.total?Math.min(active.offset+25,page.total):0} of {page.total}</span><button disabled={page.nextOffset===null} onclick={()=>navigate({evidenceOffset:page.nextOffset})}>Next page</button></nav>{/if}
 {/if}
</section>
<style>
.retained-filters{padding:12px var(--research-space,16px)}.retained-filters fieldset{display:flex;flex-wrap:wrap;gap:12px;min-width:0}.retained-filters label{display:grid;gap:4px;min-width:0;max-width:100%}.retained-filters input,.retained-filters select{max-width:100%;box-sizing:border-box}.members h3{overflow-wrap:anywhere}.heading{margin-right:auto}.coverage,.message,.members,.breadcrumbs,.pagination{padding:12px var(--research-space,16px);margin:0}.coverage p{margin:8px 0}.breadcrumbs,.pagination{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.table-scroll{overflow:auto;margin:0 var(--research-space,16px);max-width:100%}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:10px;text-align:left;vertical-align:top;border-bottom:1px solid var(--research-line)}td{font-variant-numeric:tabular-nums}small{display:block;font-weight:400;margin-top:4px}.members{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:12px}.members article,.receipt{padding:12px;border:1px solid var(--research-line);border-radius:6px;min-width:0}.receipt{margin-top:12px}dl{display:grid;grid-template-columns:minmax(100px,1fr) minmax(0,2fr);gap:8px;margin:12px 0}dt{font-weight:600}dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.cell-value{white-space:pre-wrap;overflow-wrap:anywhere}code{overflow-wrap:anywhere;white-space:normal}mark{background:#fff0ad;color:#292315;padding:2px 4px;box-decoration-break:clone}button,select{max-width:100%}.table-scroll:focus-visible{outline:2px solid var(--research-accent);outline-offset:2px}@media(max-width:700px){.heading{width:100%}dl{grid-template-columns:1fr}dd{margin-bottom:5px}th,td{padding:8px}table{min-width:460px}}
</style>
