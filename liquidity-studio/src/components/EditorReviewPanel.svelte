<script>
  import { untrack } from 'svelte';
  let { record, request, scopeKey, getScopeKey, dirty = false, ready = true } = $props();
  let review = $state.raw(null);
  let loading = $state(true);
  let loadFailed = $state(false);
  let busy = $state(false);
  let error = $state('');
  let reload = $state(0);
  let active = null;
  let pending = null;
  const stages = { DraftReady: 'Draft ready', InPostProd: 'In post-production', FinalLayout: 'Final layout', Approved: 'Approved' };
  const labels = { create: 'Begin review', start: 'Start post-production', submit: 'Submit final layout', approve: 'Approve saved layout', reject: 'Request changes', restart: 'Restart review for saved version' };

  $effect(() => {
    const id = record.id;
    const nativeRevision = record.revision;
    const currentScope = scopeKey;
    const epoch = reload;
    const send = untrack(() => request);
    let disposed = false;
    const current = () => !disposed && getScopeKey() === currentScope && record.id === id && record.revision === nativeRevision;
    const session = { id, nativeRevision, epoch, send, current };
    active = session;
    loading = true;
    loadFailed = false;
    error = '';
    busy = false;
    send(`/api/studio/native-editor/documents/${id}/review`).then(value => {
      if (current()) { review = value; loading = false; }
    }).catch(() => {
      if (current()) { error = 'Review could not be loaded. Saved content is unchanged.'; loadFailed = true; loading = false; }
    });
    return () => { disposed = true; if (active === session) active = null; };
  });

  async function transition(action) {
    const session = active;
    if (!session?.current() || busy || loading || loadFailed || dirty || !ready) return;
    const intent = { action, expectedRevision: review?.revision || 0, expectedNativeRevision: session.nativeRevision };
    const fingerprint = JSON.stringify({ id: session.id, scopeKey, ...intent });
    if (pending && pending.fingerprint !== fingerprint) {
      error = 'The previous response is uncertain. Retry the same action or reload review before changing it.';
      return;
    }
    pending ||= { fingerprint, body: { ...intent, idempotencyKey: crypto.randomUUID() } };
    busy = true; error = '';
    try {
      await session.send(`/api/studio/native-editor/documents/${session.id}/review`, { method: 'POST', body: JSON.stringify(pending.body) });
      if (!session.current()) return;
      pending = null;
      reload += 1;
    } catch (failure) {
      if (!session.current()) return;
      if (failure.status >= 400 && failure.status < 500) pending = null;
      error = failure.status === 409 ? 'The saved content or review changed. Reload review; your edits remain open.' : 'Review was not confirmed. Retry the same action to safely check its receipt.';
    } finally { if (session.current()) busy = false; }
  }
  function refresh() { pending = null; reload += 1; }
</script>

<section aria-label="Saved layout review" aria-busy={loading || busy}>
  <h3>Saved layout review</h3>
  <p>Approval applies to this saved native version. Scheduling and export are separate actions; neither publishes to social media.</p>
  {#if dirty}<p role="status">Save your native edits before changing review state.</p>{/if}
  {#if !ready}<p role="status">Wait for the native editor to open before reviewing this saved version.</p>{/if}
  {#if loading}<p role="status">Loading review…</p>
  {:else}
    <p role="status">{review ? `${stages[review.stage] || 'Review unavailable'} · review ${review.revision} · native version ${review.binding.nativeRevision}` : 'Review has not started.'}</p>
    {#if review?.stale}<p role="alert">The saved content or source changed. The previous approval is historical; restart review for the current saved version.</p>{/if}
    {#if review?.approval}<p>Approved by {review.approval.approvedByLabel || 'workspace approver'} at {review.approval.approvedAt}.</p>{/if}
    <div class="actions">
      {#if !review}<button disabled={!ready || busy || dirty || loadFailed} onclick={() => transition('create')}>{labels.create}</button>
      {:else if review.stale}<button disabled={!ready || busy || dirty} onclick={() => transition('restart')}>{labels.restart}</button>
      {:else if review.stage === 'DraftReady'}<button disabled={!ready || busy || dirty} onclick={() => transition('start')}>{labels.start}</button>
      {:else if review.stage === 'InPostProd'}<button disabled={!ready || busy || dirty} onclick={() => transition('submit')}>{labels.submit}</button>
      {:else if review.stage === 'FinalLayout'}
        {#if review.canApprove}<button disabled={!ready || busy || dirty} onclick={() => transition('approve')}>{labels.approve}</button>
        <button disabled={!ready || busy || dirty} onclick={() => transition('reject')}>{labels.reject}</button>
        {:else}<p>A founder or designated brand approver must approve this saved layout.</p>{/if}
      {/if}
      <button disabled={busy} onclick={refresh}>Reload review</button>
    </div>
  {/if}
  {#if error}<p role="alert">{error}</p>{/if}
</section>

<style>
  section { padding: .75rem 1rem; border-block: 1px solid #c9cdd4; background: #f6f8fb; color: #15171b; font: 14px/1.5 sans-serif; }
  h3 { margin: 0 0 .4rem; font-size: 1rem; }
  p { margin: .4rem 0; }
  .actions { display: flex; flex-wrap: wrap; gap: .5rem; }
  button { padding: .45rem .7rem; color: #15171b; background: white; border: 1px solid #69717c; border-radius: .3rem; }
  button:disabled { opacity: .55; }
</style>
