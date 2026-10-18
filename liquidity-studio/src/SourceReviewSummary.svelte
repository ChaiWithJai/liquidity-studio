<script>
  let { summary, onclaim } = $props();
</script>
<section class="source-review-summary" aria-label="Generation prerequisites" aria-live="polite">
  <strong>{summary.ready ? "Sources ready for generation" : "Source review required"}</strong>
  <p>{summary.approved} of {summary.total} claims approved · {summary.excluded} excluded. Approval records editorial review, not verified factual or clinical accuracy.</p>
  {#if summary.blockers.length}<ul>{#each summary.blockers as blocker, index (`${blocker.claimId || "review"}:${index}`)}<li>{#if blocker.claimId}<button class="secondary" onclick={() => onclaim(blocker.claimId)}>{blocker.message}</button>{:else}{blocker.message}{/if}</li>{/each}</ul>{/if}
</section>
<style>
  .source-review-summary { background: var(--panel, #fff); border: 1px solid currentColor; border-radius: 12px; padding: 12px 16px; margin: 12px 0; }
  p { margin: 6px 0; font-size: 0.85rem; }
  ul { margin: 6px 0; padding-left: 20px; }
  button { text-align: left; }
</style>
