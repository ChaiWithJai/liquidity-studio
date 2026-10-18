<script>
  import { untrack } from 'svelte';
  let { request, scopeKey, actorId, story = null, members = [], onContentChanged = async () => {} } = $props();
  let projection = $state({ grants: [], proposals: [], presence: [], operations: [] });
  let helperId = $state(''), category = $state(''), error = $state(''), message = $state('');
  let pending = $state(0), uncertain = $state(null);
  let clientId = $state(crypto.randomUUID());
  let lifecycle = 0, reads = 0, observedReceiptState = '';
  // This effect owns an external scoped subscription; its reset state is not derived content.
  const root = '/api/studio/workspace/control';
  const display = id => members.find(member => member.id === id)?.displayName || id;
  function active(grant) { return grant.status === 'active' && Date.parse(grant.expiresAt) > Date.now(); }
  async function refresh(owner = lifecycle, send = request) {
    const read = ++reads, entityId = story?.id;
    try {
      const [next, receipts] = await Promise.all([send(root), send('/api/studio/workspace/operations')]);
      next.operations = receipts.operations;
      if (owner === lifecycle && read === reads) {
        projection = next;
        const receiptState = JSON.stringify({ entityId, proposals: next.proposals.filter(p => p.operationId && p.changes.some(change => change.storyId === entityId)).map(p => [p.id, p.operationId, p.revision]), operations: next.operations.filter(operation => operation.outcomes.some(outcome => outcome.storyId === entityId)).map(operation => [operation.operationId, operation.undone]) });
        if (entityId && receiptState !== observedReceiptState) {
          observedReceiptState = receiptState;
          try { await onContentChanged({ storyIds: [entityId] }); }
          catch (failure) { if (owner === lifecycle) error = `Shared receipts loaded; refreshing the story failed: ${failure.message}`; }
        }
      }
    } catch (failure) { if (owner === lifecycle && read === reads) error = failure.message; }
  }
  $effect(() => {
    const key = scopeKey, send = request;
    actorId;
    untrack(() => {
      lifecycle++; reads++; observedReceiptState = ''; projection = { grants: [], proposals: [], presence: [], operations: [] };
      error = ''; message = ''; helperId = ''; category = ''; uncertain = null; pending = 0; clientId = crypto.randomUUID();
      void refresh(lifecycle, send);
    });
    const owner = lifecycle;
    const timer = setInterval(() => { if (key === scopeKey) void refresh(owner, send); }, 5000);
    return () => { clearInterval(timer); lifecycle++; reads++; };
  });
  $effect(() => {
    const send = request, selected = story ? { storyId: story.id, observedRevision: story.revision } : { storyId: null, observedRevision: null };
    scopeKey;
    const beat = () => send(root + '/presence', { method: 'POST', body: JSON.stringify({ clientId, clientKind: 'human', ...selected }) }).catch(() => {});
    void beat(); const timer = setInterval(beat, 10000);
    return () => clearInterval(timer);
  });
  async function notifyContent(receipt, owner) {
    const storyIds = [...new Set((receipt.rows || receipt.outcomes || []).map(item => item.id || item.storyId).filter(Boolean))];
    try { await onContentChanged({ storyIds }); }
    catch (failure) { if (owner === lifecycle) error = `Operation is recorded; refreshing shared content failed: ${failure.message}`; }
  }
  async function action(path, body, success) {
    const owner = lifecycle, send = request;
    pending++; error = '';
    try {
      await send(root + path, { method: 'POST', body: JSON.stringify(body) });
      if (owner === lifecycle) { message = success; await refresh(owner, send); }
    } catch (failure) { if (owner === lifecycle) error = failure.message; }
    finally { if (owner === lifecycle) pending--; }
  }
  function createGrant() {
    if (!story || !helperId) return;
    return action('/grants', { helperId, storyIds: [story.id], kinds: ['story.patch'], expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() }, 'Granted metadata proposals for this story for 10 minutes. Each proposal still needs your approval.');
  }
  function propose(grant) {
    if (!story || !category.trim()) return;
    return action('/proposals', { grantId: grant.id, epoch: grant.epoch, changes: [{ kind: 'story.patch', storyId: story.id, expectedRevision: story.revision, patch: { category: category.trim() } }] }, 'Proposal submitted for the owner to review. Story content has not changed.');
  }
  async function undo(operationId) {
    if (uncertain && uncertain.operationId !== operationId) return;
    const owner = lifecycle, send = request; pending++; error = '';
    const intent = uncertain || { operationId, idempotencyKey: crypto.randomUUID() };
    uncertain = intent;
    try {
      const receipt = await send(`/api/studio/workspace/operations/${operationId}/undo`, { method: 'POST', body: JSON.stringify({ idempotencyKey: intent.idempotencyKey }) });
      if (owner === lifecycle) { uncertain = null; message = `Undo recorded for ${receipt.operationId || operationId}. Newer work is protected by revision checks.`; await refresh(owner, send); await notifyContent(receipt, owner); }
    } catch (failure) {
      if (owner !== lifecycle) return;
      if (failure.status >= 400 && failure.status < 500) uncertain = null;
      error = uncertain ? 'Undo result is unknown. Retry the same undo request to recover its receipt.' : failure.message;
    } finally { if (owner === lifecycle) pending--; }
  }
  async function apply(proposal, grant) {
    if (uncertain && uncertain.proposalId !== proposal.id) return;
    const owner = lifecycle, send = request;
    const intent = uncertain || { proposalId: proposal.id, grantId: grant.id, epoch: proposal.epoch, idempotencyKey: crypto.randomUUID() };
    uncertain = intent; pending++; error = '';
    try {
      const { proposalId, ...body } = intent;
      const receipt = await send(root + `/proposals/${proposalId}/apply`, { method: 'POST', body: JSON.stringify(body) });
      if (owner !== lifecycle) return;
      uncertain = null;
      message = `Operation ${receipt.operationId}: ${receipt.outcomes.map(outcome => `${outcome.storyId}: ${outcome.status}`).join('; ')}. Refresh the affected story when you are ready; your current editor and focus stay here.`;
      await refresh(owner, send);
      await notifyContent(receipt, owner);
    } catch (failure) {
      if (owner !== lifecycle) return;
      if (failure.status >= 400 && failure.status < 500) uncertain = null;
      error = uncertain ? 'The result is unknown. Retry this proposal with the same request key before starting another.' : failure.message;
    } finally { if (owner === lifecycle) pending--; }
  }
</script>
<section aria-label="Shared control" class="helper-control">
  <h2>Shared control</h2>
  <p>Review bounded proposals before another operator or helper changes shared metadata. Navigation and unsaved editing stay personal.</p>
  <button class="secondary" onclick={() => refresh()}>Refresh shared control</button>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if message}<p role="status">{message}</p>{/if}
  {#if story}
    <p>Current story: {story.title} · revision {story.revision}</p>
    <label>Proposal operator<select aria-label="Proposal operator" bind:value={helperId}><option value="">Choose a current brand member</option>{#each members as member (member.id)}<option value={member.id}>{member.displayName}</option>{/each}</select></label>
    <button disabled={pending > 0 || !helperId} onclick={createGrant}>Grant metadata proposals for 10 minutes</button>
    <label>Proposed category<input bind:value={category} maxlength="100" /></label>
  {:else}<p>Open a story to create a bounded metadata grant or proposal.</p>{/if}
  {#if uncertain}<p role="status">An operation result is unknown. Its request key is retained for retry.</p>{#if uncertain.operationId}<button disabled={pending > 0} onclick={() => undo(uncertain.operationId)}>Retry same undo</button>{/if}{/if}
  {#each projection.grants as grant (grant.id)}
    <article aria-label={`Grant ${grant.id}`}>
      <h3>{display(grant.ownerId)} → {display(grant.helperId)}</h3>
      <p>{active(grant) ? 'Active' : grant.status === 'active' ? 'Expired' : grant.status} · epoch {grant.epoch} · {grant.storyIds.length} stories · expires {grant.expiresAt}</p>
      <p>Allowed actions: {grant.kinds.join(', ')}. Attempted items: {grant.attemptedItems} of 25.</p>
      {#if grant.ownerId === actorId && !['stopped', 'completed'].includes(grant.status)}
        {#if active(grant)}<button class="secondary" onclick={() => action(`/grants/${grant.id}/pause`, { expectedEpoch: grant.epoch }, 'Paused. Older helper epochs cannot apply new work.')}>Pause</button>{/if}
        {#if grant.status === 'paused'}<button class="secondary" onclick={() => action(`/grants/${grant.id}/resume`, { expectedEpoch: grant.epoch }, 'Resumed with a new epoch. A fresh proposal is required.')}>Resume</button>{/if}
        <button class="secondary" onclick={() => action(`/grants/${grant.id}/stop`, { expectedEpoch: grant.epoch }, 'Stopped. Prior accepted changes remain recorded.')}>Stop</button>
        <button class="secondary" onclick={() => action(`/grants/${grant.id}/takeover`, { expectedEpoch: grant.epoch }, 'Taken over. This grant cannot execute further work.')}>Take over</button>
      {/if}
      {#if grant.helperId === actorId && active(grant) && story && grant.storyIds.includes(story.id)}
        <button disabled={pending > 0 || !category.trim() || !!uncertain} onclick={() => propose(grant)}>Propose category change</button>
      {/if}
      {#each projection.proposals.filter(proposal => proposal.grantId === grant.id) as proposal (proposal.id)}
        <section aria-label={`Proposal ${proposal.id}`}>
          <h4>Proposal · {proposal.status} · revision {proposal.revision}</h4>
          {#each proposal.preview as item (item.storyId)}
            <p>Story {item.storyId}: revision {item.before.revision} → {item.after.revision}</p>
            <pre>{JSON.stringify({ before: item.before, proposed: item.after }, null, 2)}</pre>
          {/each}
          {#if grant.ownerId === actorId && proposal.status === 'proposed' && active(grant) && proposal.epoch === grant.epoch}
            <button disabled={pending > 0} onclick={() => action(`/proposals/${proposal.id}/approve`, { expectedRevision: proposal.revision }, 'Approved this exact proposal. Execution still checks the current revision and grant epoch.')}>Approve exact proposal</button>
          {/if}
          {#if grant.helperId === actorId && ((proposal.status === 'approved' && active(grant) && proposal.epoch === grant.epoch) || uncertain?.proposalId === proposal.id)}
            <button disabled={pending > 0 || (!!uncertain && uncertain.proposalId !== proposal.id)} onclick={() => apply(proposal, grant)}>{uncertain?.proposalId === proposal.id ? 'Retry same application' : 'Apply approved proposal'}</button>
          {/if}
          {#if proposal.operationId}<p>Receipt: {proposal.operationId}</p>
            {@const operation = projection.operations.find(item => item.operationId === proposal.operationId)}
            {#if operation?.undone}<p>Compensating undo recorded. Original receipt retained.</p>
            {:else if operation?.canUndo}<button class="secondary" disabled={pending > 0 || !!uncertain} onclick={() => undo(proposal.operationId)}>Undo accepted changes</button>{/if}
          {/if}
        </section>
      {/each}
    </article>
  {/each}
  <h3>Advisory presence</h3>
  <p>Presence is a last-seen signal, not a lock or an authorization grant.</p>
  {#each projection.presence || [] as person (person.clientId)}<p>{display(person.actorId)} · {person.clientKind} · {person.connected ? 'recently connected' : 'last seen'} · {person.storyId || 'no selected story'} · observed revision {person.observedRevision ?? 'none'}</p>{/each}
</section>
<style>
  .helper-control { padding: 1rem; border: 1px solid var(--border, #d7dbd0); border-radius: .75rem; }
  article { margin-top: 1rem; padding: 1rem; border: 1px solid var(--border, #d7dbd0); border-radius: .5rem; }
  label { display: block; margin-block: .75rem; }
  select, input { display: block; width: min(100%, 28rem); }
  button { margin: .3rem .3rem .3rem 0; }
  pre { max-height: 20rem; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; font-size: .8rem; }
</style>
