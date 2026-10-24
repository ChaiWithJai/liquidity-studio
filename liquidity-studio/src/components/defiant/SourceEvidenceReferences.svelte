<script>
 let {packet,onOpen=()=>{},onPage=()=>{}}=$props();
</script>
<section aria-label="Evidence for this source">
 <h3>Evidence for this exact source</h3>
 <details><summary>Exact source identity</summary><p>Source hash: <code>{packet.sourceHash}</code></p><p>Evidence revision: <code>{packet.revision}</code></p></details>
 {#if packet.availability===false}<p>The retained source register is unavailable. This is not an empty source inventory.</p>
 {:else}
 <p>{packet.total} served references · {packet.occurrenceCount} registered occurrences. References may overlap; these are not financial row counts.</p>
 <p>{packet.limitation}</p>
 {#if packet.total===0}<p>No supported evidence reference is available for this registered source.</p>{/if}
 {#each packet.items as item (item.key)}
 <article>
  <h4>{item.label||item.month||item.id}</h4><p>{item.kind}</p>
  {#if item.amount!==undefined}<p>Reported amount: {item.amount} {item.currency}</p>{/if}
  {#if item.sheet}<p>Worksheet: {item.sheet} · {item.cellRefs.join(', ')}</p>{/if}
  <p>{item.qualification}</p>
  <button onclick={()=>onOpen(item.followUp)}>Open evidence reference</button>
  {#if item.cells}<button onclick={()=>onOpen(item.cells)}>Open original cells</button>{/if}
  {#if item.receiptIds}{#each item.receiptIds as receiptId (receiptId)}<button onclick={()=>onOpen({resource:'receipt',receiptId,revision:packet.revision})}>Open receipt {receiptId}</button>{/each}{/if}
 </article>
 {/each}
 {#if packet.total>0}<nav aria-label="Source evidence pages"><button disabled={packet.offset===0} onclick={()=>onPage(Math.max(0,packet.offset-packet.limit))}>Previous source references</button><span>{packet.offset+1}–{Math.min(packet.offset+packet.items.length,packet.total)} of {packet.total}</span><button disabled={packet.nextOffset===null} onclick={()=>onPage(packet.nextOffset)}>Next source references</button></nav>{/if}
 {/if}
</section>
<style>
 section,article{min-width:0;overflow-wrap:anywhere}article{border-block-start:1px solid var(--border,#bbb);padding-block:1rem}button{max-width:100%;white-space:normal;margin:.25rem}nav{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}button:focus-visible{outline:3px solid currentColor;outline-offset:3px}
</style>
