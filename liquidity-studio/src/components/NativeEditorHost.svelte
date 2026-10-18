<script>
  import { untrack } from 'svelte';
  import { createNativeEditorBroker } from '../lib/native-editor-broker.js';
  let { record, request, scopeKey, getScopeKey, onSaved = () => {}, onSaveStateChange = () => {}, onDirtyChange = () => {} } = $props();
  let frame = $state();
  let broker = $state.raw(null);
  let loading = $state(true);
  let rightsDeclaration = $state('');
  let consent = $state('');
  let localRecord = $state.raw(null);
  let reloadEpoch = $state(0);
  let recoveryMessage = $state('');

  $effect(() => {
    if (!frame) return;
    const openingScope = scopeKey;
    const openingId = record.id;
    const epoch = reloadEpoch;
    const openingRecord = untrack(() => localRecord?.id === record.id ? localRecord : record);
    const capturedRequest = untrack(() => request);
    loading = true;
    let activeBroker;
    let disposed = false;
    function loaded() {
      if (disposed || getScopeKey() !== openingScope || record.id !== openingId) return;
      activeBroker = createNativeEditorBroker({ frameWindow: frame.contentWindow, request: capturedRequest, scopeKey: openingScope, getScopeKey, record: openingRecord, onSaved, async onConflictResolve(action) {
        if (action !== 'reload') { recoveryMessage = 'Saving a separate native copy is unavailable in this host. Your local edits remain open; return to the campaign or export your work before reloading.'; return; }
        try {
          const saved = await capturedRequest(`/api/studio/native-editor/documents/${openingId}`);
          if (disposed || getScopeKey() !== openingScope || record.id !== openingId) return;
          localRecord = saved;
          reloadEpoch = epoch + 1;
          onDirtyChange(false);
        } catch { recoveryMessage = 'The saved native document could not be reloaded. Your local edits remain open.'; }
      }, onState(state) { onDirtyChange(['dirty', 'saving', 'conflict', 'error'].includes(state.status)); onSaveStateChange(state); } });
      broker = activeBroker;
      activeBroker.initialize();
      loading = false;
    }
    frame.addEventListener('load', loaded);
    frame.src = '/native-editor-frame.html';
    return () => { disposed = true; frame?.removeEventListener('load', loaded); activeBroker?.dispose(); broker = null; };
  });
  $effect(() => { broker?.setAssetPolicy({ rightsDeclaration, consent }); });
</script>

<section class="native-editor-shell" aria-label="Native design editor">
  <p class="attribution">Siam — Creator and maintainer of Doory · <a href="https://github.com/shaongitbd/doory" target="_blank" rel="noreferrer">Doory source and attribution</a> · <a href="/native-editor-license.txt" target="_blank" rel="noreferrer">Upstream license</a></p>
  {#if (localRecord?.id === record.id ? localRecord : record).sourceState === 'changed'}<p role="status">The original campaign, source review or brand palette has changed. These native edits remain a proposal; return to the campaign to review before saving.</p>{/if}
  {#if recoveryMessage}<p role="alert">{recoveryMessage}</p>{/if}
  <details>
    <summary>Image rights and consent</summary>
    <label>Rights declaration <input bind:value={rightsDeclaration} maxlength="500" placeholder="Describe your permission to use uploaded images" /></label>
    <label>Consent <select bind:value={consent}><option value="">Choose before uploading</option><option value="confirmed">Permission and required personal consent confirmed</option><option value="not_personal_data">Owned procedural image with no personal data</option></select></label>
    <p>Uploads support PNG, JPEG and WebP up to 512 KiB. Background removal is unavailable.</p>
  </details>
  {#if loading}<p role="status">Opening native editor…</p>{/if}
  <iframe title="Native Doory design canvas" bind:this={frame} sandbox="allow-scripts allow-same-origin allow-downloads" referrerpolicy="no-referrer"></iframe>
</section>

<style>
  .native-editor-shell { min-width: 0; background: #fff; color: #15171b; }
  .attribution, details { margin: 0; padding: .6rem 1rem; background: #f0f2f5; font: 14px/1.5 sans-serif; }
  .attribution a { color: #174ba7; text-decoration: underline; }
  label { display: block; margin: .4rem 0; }
  input, select { margin-inline-start: .5rem; max-width: 100%; }
  iframe { display: block; border: 0; width: 100%; height: min(84dvh, 1000px); min-height: 500px; }
</style>
