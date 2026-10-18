<script>
  import { onMount } from 'svelte';
  import NativeEditorHost from '../../src/components/NativeEditorHost.svelte';
  let fixtures = $state([]), selected = $state(''), record = $state(null), state = $state('idle'), message = $state('');
  let scope = $state('');
  async function request(path, options = {}) {
    const response = await fetch(`${path}${path.includes('?') ? '&' : '?'}${scope}`, { ...options, headers: { 'Content-Type': 'application/json' } });
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(data.error || 'Fixture request failed'), { status: response.status });
    return data;
  }
  async function open() {
    const fixture = fixtures.find((item) => item.id === selected);
    record = null;
    scope = `organizationId=org_default&brandId=${fixture.brandId}`;
    record = await request(`/api/studio/native-editor/documents/${selected}`);
  }
  onMount(async () => { fixtures = await (await fetch('/fixture-config')).json(); selected = fixtures[0].id; await open(); });
</script>
<h1>Disposable native EditorApp fixture</h1>
<p>Synthetic approved test excerpt. No factual or clinical approval is established by this fixture.</p>
<label>Native fixture <select aria-label="Native fixture" bind:value={selected} onchange={open}>{#each fixtures as fixture (fixture.id)}<option value={fixture.id}>{fixture.label}</option>{/each}</select></label>
<button onclick={open}>Reload saved native document</button>
<p role="status">Native state: {state} {message}</p>
{#if record}{#key record.id + scope}<NativeEditorHost {record} {request} scopeKey={scope} getScopeKey={() => scope} onSaveStateChange={(value) => { state = value.status; message = value.message || ''; }} />{/key}{/if}
