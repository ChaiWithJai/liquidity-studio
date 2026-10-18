<script>
  import { untrack } from 'svelte';
  import { createNativeEditorBroker } from '../lib/native-editor-broker.js';
  import EditorReviewPanel from './EditorReviewPanel.svelte';
  import EditorExportPanel from './EditorExportPanel.svelte';
  import NativeRebindPanel from './NativeRebindPanel.svelte';
  import NativeBrandRefreshPanel from './NativeBrandRefreshPanel.svelte';

  let {
    record, request, scopeKey, getScopeKey,
    onSaved = () => {}, onSaveStateChange = () => {}, onDirtyChange = () => {},
    canRebind = false, canReviewSource = false, onRebound = () => {}, onReviewSource = () => {},
  } = $props();
  // A save acknowledgment replaces metadata, not the live canvas or its dirty buffer.
  let documentId = $derived(record.id);
  let frame = $state();
  let broker = $state.raw(null);
  let loading = $state(true);
  let rightsDeclaration = $state('');
  let consent = $state('');
  let cutoutConfirmed = $state(false);
  let localRecord = $state.raw(null);
  let reloadEpoch = $state(0);
  let recoveryMessage = $state('');
  let editorDirty = $state(false);
  let editorReady = $state(false);
  let exportStages = $state.raw([]);
  let canvasEpoch = $state(0);
  let historical = $derived(record.origin?.requiresSourceReview === true || record.sourceState === 'historical');
  function refreshedBrand(saved, captured) {
    if (getScopeKey() !== captured.scope || record.id !== captured.id) return;
    const opening = localRecord?.id === record.id ? localRecord : record;
    if (opening.revision !== captured.revision || editorDirty || canvasEpoch !== captured.canvasEpoch) {
      recoveryMessage = 'Brand styles were saved in a newer version. Your local canvas is preserved; resolve its save conflict before reloading.';
      return;
    }
    localRecord = saved;
    onSaved(saved);
    editorReady = false;
    reloadEpoch += 1;
  }
  let exportReceiptEpoch = $state(0);

  $effect(() => {
    if (!frame || historical) return;
    const openingScope = scopeKey;
    const openingId = documentId;
    const epoch = reloadEpoch;
    const capturedRequest = untrack(() => request);
    loading = true;
    editorReady = false;
    let activeBroker;
    let disposed = false;
    let watchdog;
    const current = () => !disposed && getScopeKey() === openingScope && record.id === openingId;

    function loaded() {
      if (!current()) return;
      clearTimeout(watchdog);
      activeBroker?.dispose();
      loading = true;
      editorReady = false;
      activeBroker = createNativeEditorBroker({
        frameWindow: frame.contentWindow,
        request: capturedRequest,
        scopeKey: openingScope,
        getScopeKey,
        record: untrack(() => localRecord?.id === openingId ? localRecord : record),
        onSaved(saved) {
          localRecord = saved;
          onSaved(saved);
        },
        onReady() { clearTimeout(watchdog); loading = false; editorReady = true; },
        onExportStaged(stage) { if(current())exportStages=[...exportStages.filter(item=>item.artifactId!==stage.artifactId),stage].slice(-32); },
        async onConflictResolve(action) {
          if (action !== 'reload') {
            recoveryMessage = 'Saving a separate native copy is unavailable in this host. Your local edits remain open; export your work before reloading.';
            return;
          }
          try {
            const saved = await capturedRequest(`/api/studio/native-editor/documents/${openingId}`);
            if (!current()) return;
            localRecord = saved;
            onSaved(saved);
            reloadEpoch = epoch + 1;
            onDirtyChange(false);
          } catch {
            if (current()) recoveryMessage = 'The saved native document could not be reloaded. Your local edits remain open.';
          }
        },
        onState(state) {
          if (state.status === 'error') { clearTimeout(watchdog); loading = false; editorReady = false; }
          editorDirty = state.dirty ?? ['dirty', 'saving', 'conflict'].includes(state.status);
          if (editorDirty) canvasEpoch += 1;
          onDirtyChange(editorDirty);
          onSaveStateChange(state);
        },
      });
      broker = activeBroker;
      activeBroker.initialize();
      watchdog = setTimeout(() => {
        if (!disposed) {
          loading = false;
          recoveryMessage = 'The native editor did not start. Return to the original exporter; your saved campaign is unchanged.';
        }
      }, 10000);
    }
    frame.addEventListener('load', loaded);
    frame.src = '/native-editor-frame.html';
    return () => {
      disposed = true;
      clearTimeout(watchdog);
      frame?.removeEventListener('load', loaded);
      activeBroker?.dispose();
      broker = null;
    };
  });
  $effect(() => { broker?.setAssetPolicy({ rightsDeclaration, consent, cutoutConfirmed }); });
</script>

<section class="native-editor-shell" aria-label="Native design editor">
  <p class="attribution">
    Siam — Creator and maintainer of Doory ·
    <a href="https://github.com/shaongitbd/doory" target="_blank" rel="noreferrer">Doory source and attribution</a> ·
    <a href="/native-editor-license.txt" target="_blank" rel="noreferrer">Upstream license</a>
  </p>
  {#if (localRecord?.id === record.id ? localRecord : record).sourceState === 'changed'}
    <p role="status">The original campaign, source review or brand palette has changed. These native edits remain a proposal; return to the campaign to review before saving.</p>
  {/if}
  {#if recoveryMessage}<p role="alert">{recoveryMessage}</p>{/if}
  {#if historical}
    <p role="status">This restored layout is historical evidence. Its original source must be reviewed and adopted before creating a new editable layout. Live editing, cutout, approval and export actions are unavailable here.</p>
    <NativeRebindPanel {record} {request} {scopeKey} {getScopeKey} {canRebind} {canReviewSource} {onRebound} {onReviewSource} />
  {:else}
  <div class="native-tools" role="group" aria-label="Layout tools">
    <span class="editor-status" role="status">{loading?'Opening editor…':editorDirty?'Unsaved layout changes':'Layout tools'}</span>
    <details name={`native-tools-${record.id}`} data-native-tool="review"><summary>Review saved layout</summary><div class="tool-panel">
  <EditorReviewPanel record={localRecord?.id === record.id ? localRecord : record} {request} {scopeKey} {getScopeKey} dirty={editorDirty} ready={editorReady} refreshKey={exportReceiptEpoch} />
    </div></details>
    <details name={`native-tools-${record.id}`} data-native-tool="export"><summary>PNG export</summary><div class="tool-panel">
  {#key `${scopeKey}:${record.id}:${(localRecord?.id === record.id ? localRecord : record).revision}`}
    <EditorExportPanel record={localRecord?.id === record.id ? localRecord : record} stages={exportStages} {request} {scopeKey} {getScopeKey} dirty={editorDirty} ready={editorReady} onExported={()=>exportReceiptEpoch++} />
  {/key}
    </div></details>
    <details name={`native-tools-${record.id}`} data-native-tool="brand"><summary>Brand styles</summary><div class="tool-panel">
  {#key `${scopeKey}:${record.id}:${(localRecord?.id === record.id ? localRecord : record).revision}`}
    <NativeBrandRefreshPanel record={localRecord?.id === record.id ? localRecord : record} {request} {scopeKey} {getScopeKey} dirty={editorDirty} ready={editorReady} getCanvasEpoch={() => canvasEpoch} onRefreshed={refreshedBrand} />
  {/key}
    </div></details>
    <details name={`native-tools-${record.id}`} data-native-tool="images"><summary>Image rights</summary><div class="tool-panel image-rights">
    <label>Rights declaration <input bind:value={rightsDeclaration} maxlength="500" placeholder="Describe your permission to use uploaded images" /></label>
    <label>Consent
      <select bind:value={consent}>
        <option value="">Choose before uploading</option>
        <option value="confirmed">Permission and required personal consent confirmed</option>
        <option value="not_personal_data">Owned image with no personal data</option>
      </select>
    </label>
    <label><input type="checkbox" bind:checked={cutoutConfirmed} /> I confirm the selected image’s recorded rights and consent permit background removal.</label>
    <p>Uploads support PNG, JPEG and WebP up to 512 KiB and four megapixels. When configured locally, background removal preserves pixel dimensions and rejects PNG output above 512 KiB. It never silently resizes or overwrites the original; native Undo restores the original reference.</p>
    </div></details>
  </div>
  <iframe title="Native Doory design canvas" bind:this={frame} sandbox="allow-scripts allow-same-origin allow-downloads" referrerpolicy="no-referrer"></iframe>
  {/if}
</section>

<style>
  .native-editor-shell { min-width: 0; background: #fff; color: #15171b; }
  .attribution { margin: 0; padding: .3rem .75rem; background: #f8f9fb; font: 11px/1.5 sans-serif; border-bottom: 1px solid #e0e3e8; }
  .native-tools { position: relative; display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; padding: .45rem .75rem; border-bottom: 1px solid #c9cdd4; background: #f6f8fb; font: 12px/1.5 sans-serif; }
  .editor-status { margin-inline-end: auto; color: #59616b; }
  .native-tools > details { margin: 0; }
  .native-tools summary { cursor: pointer; padding: .3rem .55rem; border: 1px solid #c9cdd4; border-radius: .35rem; background: #fff; color: #15171b; }
  .native-tools details[open] > summary { background: #e9eef6; border-color: #69717c; }
  .native-tools summary:focus-visible { outline: 2px solid #174ba7; outline-offset: 2px; }
  .tool-panel { position: absolute; inset-inline: 0; top: 100%; z-index: 5; max-height: min(60dvh, 520px); overflow: auto; background: #fff; border: 1px solid #c9cdd4; box-shadow: 0 10px 24px #15171b20; }
  .image-rights { padding: .75rem 1rem; font: 13px/1.5 sans-serif; }
  @media(max-width:600px) { .editor-status { flex-basis: 100%; } .native-tools { gap: .3rem; } }
  .attribution a { color: #174ba7; text-decoration: underline; }
  label { display: block; margin: .4rem 0; }
  input, select { margin-inline-start: .5rem; max-width: 100%; }
  iframe { display: block; border: 0; width: 100%; height: min(84dvh, 1000px); min-height: 500px; }
</style>
