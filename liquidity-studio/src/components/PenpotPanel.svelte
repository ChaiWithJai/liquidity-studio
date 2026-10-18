<script>
  import { onMount } from "svelte";
  let { request, storyId, role } = $props();
  let bindings = $state([]), targets = $state([]), actions = $state([]);
  let selected = $state(""), capability = $state(""), actionId = $state("");
  let loading = $state(true), busy = $state(false), error = $state(""), notice = $state("");
  let attempt = $state(null);
  let alive = false, sequence = 0;
  const choices = $derived(bindings.filter(item => item.command?.storyId === storyId || !item.available));
  const chosen = $derived(choices.find(item => item.id === selected));
  const history = $derived(actions.filter(item => item.command.storyId === storyId));
  onMount(() => {
    alive = true;
    void refresh();
    return () => { alive = false; sequence++; capability = ""; attempt = null; };
  });
  async function refresh() {
    const current = ++sequence, expectedStory = storyId;
    loading = true; error = "";
    try {
      const result = await request("/api/studio/penpot/bindings");
      if (!alive || current !== sequence || expectedStory !== storyId) return;
      bindings = result.bindings; targets = result.targets; actions = result.actions;
      if (!choices.some(item => item.id === selected)) selected = choices[0]?.id || "";
      if (actions.some(item => item.id === actionId && item.status === "native-state-verified")) capability = "";
    } catch (failure) { if (alive && current === sequence) error = failure.message; }
    finally { if (alive && current === sequence) loading = false; }
  }
  async function register(targetId) {
    busy = true; error = "";
    const current = sequence;
    try {
      await request("/api/studio/penpot/bindings", { method: "POST", body: JSON.stringify({targetId}) });
      if (alive && current === sequence) await refresh();
    } catch (failure) { if (alive && current === sequence) error = failure.message; }
    finally { if (alive) busy = false; }
  }
  async function prepare() {
    if (busy || (!attempt && !chosen?.available)) return;
    const expectedStory = storyId, current = sequence;
    if (!attempt) attempt = { bindingId: chosen.id, resourceId: chosen.resourceId, command: structuredClone($state.snapshot(chosen.command)), idempotencyKey: crypto.randomUUID() };
    busy = true; error = ""; notice = "";
    try {
      const result = await request("/api/studio/penpot/actions", { method: "POST", body: JSON.stringify(attempt) });
      if (!alive || current !== sequence || expectedStory !== storyId) return;
      actionId = result.action.id; capability = result.nativeActionCapability || ""; attempt = null;
      notice = result.capabilityAvailable ? "One-use native action prepared. Open the registered document and apply it through the local plugin." : "This attempt already has a durable record. Check saved native state; the action was not reapplied.";
      await refresh();
    } catch (failure) {
      if (alive && current === sequence) { error = failure.message; notice = "The outcome may be unknown. Recover this exact attempt before starting another."; }
    } finally { if (alive) busy = false; }
  }
  async function reconcile(id) {
    const current = sequence;
    busy = true; error = "";
    try {
      const result = await request(`/api/studio/penpot/actions/${id}/reconcile`, {method: "POST", body: "{}"});
      if (!alive || current !== sequence) return;
      notice = result.status === "native-state-verified" ? "Saved native token values and registered paints were verified. Editorial approval remains separate." : "Matching saved native paint was not observed. No native change was reapplied. Refresh the registered context before a new attempt.";
      if (result.status === "native-state-verified") capability = "";
      await refresh();
    } catch (failure) { if (alive && current === sequence) error = failure.message; }
    finally { if (alive) busy = false; }
  }
  function nativeUrl(value) {
    return typeof value === "string" && value.startsWith("http://localhost:39008/#/workspace?team-id=") ? value : null;
  }
</script>

<section aria-labelledby="penpot-panel-title" class="penpot-panel">
  <h3 id="penpot-panel-title">Registered Penpot design</h3>
  <p>Private local integration. Refresh current Brand Kit colors without replacing native human text or geometry. Native checks do not approve a post.</p>
  {#if loading}<p role="status">Checking registered native context…</p>{/if}
  {#if error}<p role="alert">{error}</p>{/if}
  {#if notice}<p role="status">{notice}</p>{/if}
  <button disabled={busy || loading} onclick={refresh}>Refresh native context</button>
  {#if !loading && !choices.length}<p>No registered native document is available for this saved story. An operator must configure the source and native owner mapping.</p>{/if}
  {#if role === "founder"}
    {#each targets.filter(target => !target.registered) as target (target.id)}
      <button disabled={busy || loading} onclick={() => register(target.id)}>Register configured target {target.id}</button>
    {/each}
  {/if}
  {#if choices.length}
    <label>Registered native document
      <select bind:value={selected} disabled={busy || !!attempt} onchange={() => { capability = ""; actionId = ""; }}>
        {#each choices as binding (binding.id)}<option value={binding.id}>{binding.targetId}</option>{/each}
      </select>
    </label>
    {#if chosen}
      {#if nativeUrl(chosen.nativeUrl)}<a href={nativeUrl(chosen.nativeUrl)} target="_blank" rel="noopener noreferrer">Open registered native document</a>{/if}
      {#if chosen.available}
        <p>Source revision {chosen.command.expectedRevision}; native revision {chosen.command.expectedNativeRevision}. Current brand revision is checked on every action.</p>
        {#if !attempt}<button disabled={busy || loading} onclick={prepare}>Prepare color refresh</button>{/if}
      {:else}<p>{chosen.reason}</p>{/if}
    {/if}
  {/if}
  {#if attempt}<button disabled={busy} onclick={prepare}>Recover exact preparation attempt</button>{/if}
  {#if capability}
    <label>One-use native action code <input readonly type="text" value={capability} autocomplete="off" spellcheck="false" /></label>
    <p>Copy into the local Studio plugin in the registered Penpot document. This code expires within one minute and is never saved in browser storage. Leaving this story clears it.</p>
    <button disabled={busy} onclick={() => reconcile(actionId)}>Check saved native state</button>
  {/if}
  <h4>Recent durable action history</h4>
  {#if !history.length}<p>No action history for this story.</p>{/if}
  <ul>
    {#each history as action (action.id)}
      <li>
        <strong>{action.status}</strong> · source revision {action.command.expectedRevision}
        {#if action.verification}<span>Native revision {action.verification.nativeRevision}, observed {action.verification.observedAt}. {action.verification.method === "read-only-reconciliation" ? "Recovered by read-only comparison; action attribution is not inferred." : "Native acknowledgement recorded."}</span>{/if}
        {#if action.status !== "native-state-verified"}<button disabled={busy} onclick={() => reconcile(action.id)}>Reconcile saved state</button>{/if}
      </li>
    {/each}
  </ul>
</section>

<style>
  .penpot-panel { border: 1px solid #58636d; border-radius: 10px; padding: 1rem; margin-block: 1rem; display: grid; gap: 0.7rem; overflow-wrap: anywhere; }
  h3,h4,p { margin: 0; }
  label,li { display: grid; gap: 0.4rem; }
  input,select { box-sizing: border-box; width: 100%; min-width: 0; min-height: 42px; }
  button,a { min-height: 42px; align-content: center; }
  ul { display: grid; gap: 0.8rem; padding-inline-start: 1.2rem; }
</style>
