<script>
  import { onMount } from "svelte";
  let { request, binding, disabled = false, onPrepare } = $props();
  let images = $state([]), selected = $state(""), preview = $state(null);
  let boardKey = $state(""), loading = $state(false), error = $state("");
  let file = $state(null), rights = $state(""), consent = $state("");
  let uploadAttempt = $state(null);
  let alive = false, sequence = 0;
  const boards = $derived(binding.imageBoards || []);
  const board = $derived(boards.find(item => `${item.pageId}:${item.frameId}` === boardKey) || boards[0]);
  const image = $derived(images.find(item => item.id === selected));
  function context() {
    return { bindingId: binding.id, resourceId: binding.resourceId,
      command: structuredClone($state.snapshot(binding.command)) };
  }
  function scopedAssetPath(path) {
    return `${path}?context=${encodeURIComponent(JSON.stringify(context()))}`;
  }
  onMount(() => {
    alive = true;
    boardKey = boards[0] ? `${boards[0].pageId}:${boards[0].frameId}` : "";
    void refresh();
    return () => { alive = false; sequence++; preview = null; file = null; uploadAttempt = null; };
  });
  async function refresh() {
    const version = ++sequence;
    loading = true; error = "";
    try {
      const result = await request(scopedAssetPath("/api/studio/penpot/assets"));
      if (!alive || version !== sequence) return;
      images = result.assets;
      if (!images.some(item => item.id === selected)) { selected = ""; preview = null; }
    } catch (failure) { if (alive && version === sequence) error = failure.message; }
    finally { if (alive && version === sequence) loading = false; }
  }
  async function choose() {
    const id = selected, version = ++sequence;
    preview = null; error = ""; loading = true;
    try {
      if (!id) return;
      const result = await request(scopedAssetPath(`/api/studio/penpot/assets/${id}`));
      if (!alive || version !== sequence || selected !== id) return;
      if (result.id !== id || !["image/png", "image/jpeg", "image/webp"].includes(result.contentType) || result.size > 512 * 1024)
        throw new Error("Saved image preview is unavailable.");
      preview = { id, src: `data:${result.contentType};base64,${result.base64}` };
    } catch (failure) { if (alive && version === sequence) error = failure.message; }
    finally { if (alive && version === sequence) loading = false; }
  }
  async function upload() {
    if ((!uploadAttempt && (!file || !rights.trim() || !consent)) || loading || disabled) return;
    const version = ++sequence, currentFile = file, declaration = rights.trim(), currentConsent = consent;
    loading = true; error = "";
    try {
      if (!uploadAttempt && (currentFile.size > 512 * 1024 || !["image/png", "image/jpeg", "image/webp"].includes(currentFile.type)))
        throw new Error("Choose a PNG, JPEG or WebP up to 512 KiB.");
      if (!uploadAttempt) {
        const bytes = new Uint8Array(await currentFile.arrayBuffer());
        let binary = "";
        for (let offset = 0; offset < bytes.length; offset += 8192)
          binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
        uploadAttempt = { context: context(), asset: { name: currentFile.name, contentType: currentFile.type, base64: btoa(binary),
          rightsDeclaration: declaration, consent: currentConsent, idempotencyKey: crypto.randomUUID() } };
      }
      if (!alive || version !== sequence) return;
      const submitted = $state.snapshot(uploadAttempt);
      const result = await request("/api/studio/penpot/assets", {
        method: "POST", body: JSON.stringify(submitted),
      });
      if (!alive || version !== sequence) return;
      images = [...images.filter(item => item.id !== result.id), result]; selected = result.id;
      preview = { id: result.id, src: `data:${submitted.asset.contentType};base64,${submitted.asset.base64}` };
      file = null; rights = ""; consent = ""; uploadAttempt = null;
    } catch (failure) { if (alive && version === sequence) {
      if (failure.status >= 400 && failure.status < 500) uploadAttempt = null;
      error = failure.message;
    } }
    finally { if (alive && version === sequence) loading = false; }
  }
  function prepare() {
    if (!image || !board || loading || disabled || preview?.id !== image.id) return;
    const width = Math.min(image.width, board.width / 3, 384);
    const height = width * image.height / image.width;
    if (height > board.height - 48) { error = "This image needs a smaller placement before it can be added."; return; }
    onPrepare({ ...structuredClone($state.snapshot(binding.command)), operation: "import-private-raster",
      assetId: image.id, assetSha256: image.sha256, assetGeneration: image.generation,
      pageId: board.pageId, frameId: board.frameId,
      placement: { x: board.x + board.width - width - 24, y: board.y + board.height - height - 24, width, height } });
  }
</script>

<section aria-labelledby="saved-image-title">
  <h4 id="saved-image-title">Add saved image</h4>
  <p>Add one image at the bottom right of a board. Existing text stays editable. Check the layout afterward for overlap.</p>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if loading}<p role="status">Checking private image…</p>{/if}
  <label>Saved image
    <select bind:value={selected} onchange={choose} disabled={disabled || loading}>
      <option value="">Choose an image</option>
      {#each images as item (item.id)}<option value={item.id}>{item.name} · {item.width} × {item.height}</option>{/each}
    </select>
  </label>
  {#if image && preview?.id === image.id}
    <img src={preview.src} alt={`Preview of ${image.name}`} width="192" height="192" />
    <p>{image.width} × {image.height} pixels · {Math.ceil(image.size / 1024)} KiB · saved privately</p>
  {/if}
  <label>Board
    <select bind:value={boardKey} disabled={disabled || loading}>
      {#each boards as item (`${item.pageId}:${item.frameId}`)}
        <option value={`${item.pageId}:${item.frameId}`}>{item.name}</option>
      {/each}
    </select>
  </label>
  <button disabled={disabled || loading || !image || !board || preview?.id !== image.id} onclick={prepare}>Add saved image</button>
  <details>
    <summary>Save another image</summary>
    <label>Image file <input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled || loading || !!uploadAttempt} onchange={event => { file = event.currentTarget.files?.[0] || null; }} /></label>
    <label>Permission to use this image <textarea maxlength="500" bind:value={rights} disabled={disabled || loading || !!uploadAttempt} placeholder="Describe your ownership or permission."></textarea></label>
    <label>Consent <select bind:value={consent} disabled={disabled || loading || !!uploadAttempt}><option value="">Choose a consent declaration</option><option value="not_personal_data">Contains no personal data</option><option value="confirmed">Required consent is confirmed</option></select></label>
    <p>PNG, JPEG or WebP up to 512 KiB. Saving an image does not approve the design.</p>
    {#if uploadAttempt && !loading}<p role="status">The save response was not confirmed. Retry the same image before saving another.</p>{/if}
    <button disabled={disabled || loading || (!uploadAttempt && (!file || !rights.trim() || !consent))} onclick={upload}>{loading && uploadAttempt ? "Saving image…" : uploadAttempt ? "Retry image save" : "Save image privately"}</button>
  </details>
  {#if image}<details><summary>Image provenance</summary><p>{image.rightsDeclaration}</p><p>Permission declaration retained with this saved image.</p></details>{/if}
</section>

<style>
  section { display: grid; gap: .7rem; border-block-start: 1px solid #58636d; padding-block-start: 1rem; }
  h4,p { margin: 0; }
  label,details { display: grid; gap: .5rem; }
  input,select,textarea { box-sizing: border-box; width: 100%; min-height: 42px; }
  img { object-fit: contain; max-width: 100%; background: repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50% / 20px 20px; }
  button { min-height: 42px; }
</style>
