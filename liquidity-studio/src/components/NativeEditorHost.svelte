<script>
  let { document, meta, adapter, scopeKey, onSaveStateChange = () => {}, onConflictResolve = () => {}, onDirtyChange = () => {} } = $props();
  let host = $state();
  let error = $state('');
  let loading = $state(true);

  $effect(() => {
    if (!host) return;
    const openingScope = scopeKey;
    const openingDocument = document;
    const openingMeta = meta;
    const openingAdapter = adapter;
    loading = true;
    error = "";
    let disposed = false;
    let editor;
    async function mount() {
      try {
        const module = await import('virtual:studio-native-editor');
        if (disposed || scopeKey !== openingScope) return;
        editor = module.mountNativeEditor(host, {
          document: openingDocument, meta: openingMeta, adapter: openingAdapter,
          onSaveStateChange(state) {
            if (disposed || scopeKey !== openingScope) return;
            onDirtyChange(['dirty', 'saving', 'conflict', 'error'].includes(state.status));
            onSaveStateChange(state);
          },
          onConflictResolve,
        });
      } catch {
        if (!disposed) error = 'The native editor is unavailable. Return to the original exporter; your campaign is unchanged.';
      } finally {
        if (!disposed) loading = false;
      }
    }
    mount();
    return () => { disposed = true; editor?.destroy(); };
  });
</script>

<section class="native-editor-shell" aria-label="Native design editor">
  <p class="attribution">Siam — Creator and maintainer of Doory · <a href="https://github.com/shaongitbd/doory" target="_blank" rel="noreferrer">Doory source and attribution</a></p>
  {#if loading}<p role="status">Opening native editor…</p>{/if}
  {#if error}<p role="alert">{error}</p>{/if}
  <div class="native-editor-root" bind:this={host}></div>
</section>

<style>
  .native-editor-shell { min-width: 0; background: #fff; color: #15171b; }
  .attribution { margin: 0; padding: .6rem 1rem; background: #f0f2f5; font: 14px/1.5 sans-serif; }
  .attribution a { color: #174ba7; text-decoration: underline; }
  .native-editor-root { height: min(84dvh, 1000px); min-height: 500px; isolation: isolate; }
  .native-editor-root :global(*) { box-sizing: border-box; }
</style>
