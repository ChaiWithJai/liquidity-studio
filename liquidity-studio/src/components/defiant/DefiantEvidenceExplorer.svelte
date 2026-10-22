<script>
 import {onDestroy,untrack} from 'svelte';
 import ResearchToolbar from './ResearchToolbar.svelte';
 import ResearchInspector from './ResearchInspector.svelte';
 import {createEvidenceExplorer,emptyEvidenceView,evidenceLocation} from '../../lib/defiant-evidence-explorer.js';
 let {request,location,onNavigate=()=>{}}=$props();
 let view=$state(emptyEvidenceView()),field=$state('Total Earned'),refreshEpoch=$state(0);
 const active=$derived(evidenceLocation(location));
 const controller=createEvidenceExplorer({request:(...args)=>request(...args),onState:value=>view=value});
 $effect(()=>{const input=location;refreshEpoch;untrack(()=>{field='Total Earned';void controller.load(input);});});
 onDestroy(()=>controller.cancel());
 function navigate(next){onNavigate({...location,view:'evidence',sample:'',evidenceRevision:view.revision||active.revision,evidenceOffset:0,...next});}
 function root(mode=active.mode){navigate({evidenceMode:mode,evidenceGroupId:'',evidenceSelectionId:'',evidenceReceiptId:''});}
 function refresh(){const next={...location,view:'evidence',evidenceRevision:'',evidenceGroupId:'',evidenceSelectionId:'',evidenceReceiptId:'',evidenceOffset:0};onNavigate(next);refreshEpoch++;}
 const page=$derived(view.selection||view.group||view.list);
 const fields=$derived([...new Set(view.receipts.flatMap(receipt=>Object.keys(receipt.cells)))]);
 const highlight=$derived(fields.includes(field)?field:fields.find(name=>/earned|amount/i.test(name))||fields[0]||'');
</script>
<section aria-label="Earnings and receipts" aria-busy={view.loading}>
 <ResearchToolbar label="Evidence navigation">
  <div class="heading"><h2>Earnings &amp; receipts</h2><p class="research-meta">Reported amounts, source identities and the records behind them.</p></div>
  <button disabled={view.loading} onclick={()=>root('earnings')} aria-pressed={active.mode==='earnings'}>Earnings</button>
  <button disabled={view.loading} onclick={()=>root('identity')} aria-pressed={active.mode==='identity'}>Identity review</button>
  <button disabled={view.loading} onclick={()=>root('selections')} aria-pressed={active.mode==='selections'}>Source selections</button>
  <button disabled={view.loading} onclick={refresh}>Refresh evidence</button>
 </ResearchToolbar>
 {#if view.loading}<p class="message" role="status">Opening evidence…</p>
 {:else if view.error}<p class="message" role="alert">{view.error}</p>
 {:else if view.manifest}
  <div class="coverage"><h3>Evidence coverage</h3><p>{view.manifest.coverage}</p><p class="research-meta">{view.manifest.counts.months} reported periods · {view.manifest.counts.selections} source selections{#if view.manifest.counts.identityGroups !== undefined} · {view.manifest.counts.identityGroups} identity review groups{/if}</p><details><summary>Snapshot details</summary><p>Organization: <code>{view.manifest.scope.organizationId}</code></p><p>Revision: <code>{view.revision}</code></p></details></div>
  {#if active.groupId||active.selectionId||active.receiptId}<nav class="breadcrumbs" aria-label="Evidence trail"><button onclick={()=>root()}>Back to {active.mode==='identity'?'identity review':active.mode==='selections'?'source selections':'earnings'}</button></nav>{/if}
  {#if view.list}
   {#if !view.list.items.length}<p class="message">No {active.mode==='identity'?'identity review groups':active.mode==='selections'?'source selections':'earnings'} in this evidence page.</p>
   {:else}<!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable table needs keyboard access) -->
   <div class="table-scroll" tabindex="0" role="region" aria-label={active.mode==='identity'?'Identity review table':active.mode==='selections'?'Source selection table':'Reported earnings table'}><table><thead><tr><th scope="col">{active.mode==='identity'?'Source identity group':active.mode==='selections'?'Source selection':'Period'}</th><th scope="col">Reported amount</th><th scope="col">Evidence</th></tr></thead><tbody>
    {#each view.list.items as row (active.mode!=='earnings'?row.id:row.month+row.currency)}<tr><th scope="row">{#if active.mode==='identity'}{row.artist} — {row.title}<small>{row.memberCount} observations · {row.missingSourceIds} missing IDs</small>{:else if active.mode==='selections'}{row.label}<small>{row.rowCount} contributing locators</small>{:else}{row.month}{/if}</th><td>{row.amount} {row.currency}</td><td>{#if active.mode==='identity'}<button onclick={()=>navigate({evidenceGroupId:row.id,evidenceSelectionId:'',evidenceReceiptId:''})}>Review {row.title}</button>{:else if active.mode==='selections'}<button onclick={()=>navigate({evidenceSelectionId:row.id,evidenceGroupId:'',evidenceReceiptId:''})}>Inspect selection {row.id}</button>{:else}{#each row.receiptIds as receiptId(receiptId)}<button onclick={()=>navigate({evidenceReceiptId:receiptId,evidenceGroupId:'',evidenceSelectionId:''})}>Show example receipt {receiptId}</button>{/each}{#if !row.receiptIds.length}No example receipt supplied{/if}{/if}</td></tr>{/each}
   </tbody></table></div>{/if}
   {#if active.mode==='earnings'}<p class="message">Example receipts show individual source records; they do not prove a monthly total. Open Source selections to inspect complete supplied selections, including unresolved identities.</p>{/if}
   {#if active.mode==='identity'}<p class="message">Review priority uses absolute net reported amount within each currency. Similar titles do not establish equivalent recordings.</p>{/if}
  {/if}
  {#if view.group&&!view.selection}
   <div class="coverage"><h3>{view.group.group.artist} — {view.group.group.title}</h3><p>{view.group.group.amount} {view.group.group.currency} · {view.group.total} source observations · {view.group.group.reviewStatus}</p><p>Inspect the source identities before deciding whether recordings match.</p></div>
   <div class="members">{#each view.group.members as member(member.id)}<article><h4>{member.releaseTitle||'Release title unavailable'}</h4><dl><dt>Source system / account</dt><dd>{member.sourceSystem} / {member.accountScope}</dd><dt>Source ID</dt><dd>{member.sourceId===null?'Missing source ID':member.sourceId}</dd><dt>UPC</dt><dd>{member.upc||'Not supplied'}</dd><dt>Reported amount</dt><dd>{member.amount} {member.currency}</dd></dl>{#each member.selectionIds as selectionId(selectionId)}<button onclick={()=>navigate({evidenceSelectionId:selectionId,evidenceGroupId:'',evidenceMode:'selections',evidenceReceiptId:''})}>Inspect selection {selectionId}</button>{/each}</article>{/each}</div>
  {/if}
  {#if view.selection}<div class="coverage"><h3>{view.selection.selection.label}</h3><p>{view.selection.selection.amount} {view.selection.selection.currency} · {view.selection.total} contributing record locators</p></div>{/if}
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
.heading{margin-right:auto}.coverage,.message,.members,.breadcrumbs,.pagination{padding:12px var(--research-space,16px);margin:0}.coverage p{margin:8px 0}.breadcrumbs,.pagination{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.table-scroll{overflow:auto;margin:0 var(--research-space,16px);max-width:100%}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:10px;text-align:left;vertical-align:top;border-bottom:1px solid var(--research-line)}td{font-variant-numeric:tabular-nums}small{display:block;font-weight:400;margin-top:4px}.members{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:12px}.members article,.receipt{padding:12px;border:1px solid var(--research-line);border-radius:6px;min-width:0}.receipt{margin-top:12px}dl{display:grid;grid-template-columns:minmax(100px,1fr) minmax(0,2fr);gap:8px;margin:12px 0}dt{font-weight:600}dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}code{overflow-wrap:anywhere;white-space:normal}mark{background:#fff0ad;color:#292315;padding:2px 4px;box-decoration-break:clone}button,select{max-width:100%}.table-scroll:focus-visible{outline:2px solid var(--research-accent);outline-offset:2px}@media(max-width:700px){.heading{width:100%}dl{grid-template-columns:1fr}dd{margin-bottom:5px}th,td{padding:8px}table{min-width:460px}}
</style>
