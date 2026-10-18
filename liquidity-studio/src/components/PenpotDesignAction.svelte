<script>
  import {onMount, onDestroy} from 'svelte';
  let {request, storyId, format, storyRevision, generationId, onStateChange = () => {}, compact = false} = $props();
  let loading = $state(true), busy = $state(false), error = $state(''), rejected = $state(false);
  let result = $state(null), attempt = $state(null);
  let alive = true;
  onDestroy(() => { alive = false; });
  onMount(() => { void load(); });
  const nativeUrl = $derived(result?.design?.nativeUrl || '');
  const openUrl = $derived(result?.design?.status === 'ready' && nativeUrl.startsWith('http://localhost:39008/#/workspace?team-id=') ? nativeUrl : '');
  function reportState(design) {
    onStateChange(design?.status === 'ready' && design.nativeUrl?.startsWith('http://localhost:39008/#/workspace?team-id=') ? 'ready' : design?.status === 'pending' ? 'pending' : 'unknown');
  }
  async function load() {
    loading = true; error = ''; onStateChange('unknown');
    try {
      const value = await request(`/api/studio/penpot/designs?storyId=${encodeURIComponent(storyId)}&format=${encodeURIComponent(format)}`);
      if (alive) { result = value; attempt = value.design?.retry || null; reportState(value.design); }
    } catch (failure) { if (alive) error = failure.message; }
    finally { if (alive) loading = false; }
  }
  async function create() {
    if (busy || loading) return;
    attempt ||= {storyId, format, expectedRevision: storyRevision, generationId, idempotencyKey: crypto.randomUUID()};
    busy = true; error = ''; rejected = false;
    try {
      const design = await request('/api/studio/penpot/designs', {method:'POST', body:JSON.stringify(attempt)});
      if (!alive) return;
      result = {...result, design};
      reportState(design);
      attempt = design.status === 'pending' ? design.retry || attempt : null;
    } catch (failure) { if (alive) { onStateChange('unknown'); error = failure.message; rejected = Number.isInteger(failure.status) && failure.status >= 400 && failure.status < 500; } }
    finally { if (alive) busy = false; }
  }
</script>
<section class={["penpot-design-action", {compact}]} aria-label="Campaign design in Penpot">
  {#if !compact}<h3>Design your campaign</h3>{/if}
  {#if loading}<p role="status">Finding this campaign’s design…</p>
  {:else if openUrl}<a class="primary" href={openUrl} target="_blank" rel="noopener noreferrer">Open design in Penpot ↗</a><p>Edits save in Penpot. This Studio preview keeps the reviewed source copy.</p>
  {:else if result?.available || attempt || result?.design}<button class="primary" disabled={busy||rejected} onclick={create}>{busy?'Creating design…':attempt?'Retry design creation':result?.design?'Resume design creation':'Create design in Penpot'}</button><p>Create an editable design from the saved copy and brand.</p>
  {:else if result?.reason}<p>{result.reason}</p>{/if}
  {#if error}<p role="alert">{error}</p>{#if rejected}<button onclick={()=>window.location.reload()}>Reload saved campaign</button>{:else if !attempt}<button disabled={loading||busy} onclick={load}>Check design again</button>{/if}{/if}
</section>
<style>
  .penpot-design-action{display:grid;gap:.4rem;padding:.8rem 1rem;border:1px solid var(--border,#d1d5db);border-radius:.6rem}
  h3,p{margin:0}a,button{justify-self:start;min-height:42px;align-content:center}
  .compact{border:0;padding:0;gap:.3rem .65rem;align-content:center}
  .compact a,.compact button{min-height:34px}
  .compact p{font-size:.75rem;max-width:38rem}
</style>
