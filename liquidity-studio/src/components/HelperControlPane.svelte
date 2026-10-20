<script>
  import { untrack } from 'svelte';
  import { createPresenceHeartbeat } from '../lib/presence-heartbeat.js';
  import { canonicalZone, validDate, captureIntent, placeCommand, removeCommand, unitLabel } from '../lib/calendar-model.js';
  let { request, scopeKey, actorId, story = null, members = [], onContentChanged = async () => {} } = $props();
  let projection = $state({ grants: [], proposals: [], presence: [], operations: [] });
  let helperId = $state(''), category = $state(''), error = $state(''), message = $state('');
  let pending = $state(0), uncertain = $state(null);
  let grantTarget = $state('current'), grantSearch = $state(''), grantStoryId = $state('');
  let grantRows = $state([]), grantMatches = $state(0), grantResultKey = $state(null);
  let grantSearching = $state(false), grantLookupError = $state('');
  let grantSearchReads = 0, grantSearchController;
  const grantStory = () => grantTarget === 'current' ? story : grantResultKey === grantSearch.trim() ? grantRows.find(row => row.id === grantStoryId) : null;
  const grantStoryLabel = id => id === story?.id ? story.title : grantRows.find(row => row.id === id)?.title || projection.proposals.flatMap(proposal => proposal.preview).find(item => item.storyId === id)?.before.title || id;
  function cancelGrantSearch() {
    grantSearchController?.abort(); grantSearchController = undefined; grantSearchReads++;
    grantRows = []; grantStoryId = ''; grantMatches = 0; grantResultKey = null; grantSearching = false; grantLookupError = '';
  }
  async function searchGrantStories() {
    cancelGrantSearch();
    const owner = lifecycle, read = grantSearchReads, send = request, query = grantSearch.trim();
    if (!query || grantTarget !== 'other') return;
    const controller = new AbortController(); grantSearchController = controller; grantSearching = true;
    try {
      const result = await send('/api/studio/workspace/query', { method: 'POST', body: JSON.stringify({ filters: { search: query }, limit: 25 }), signal: controller.signal });
      if (owner !== lifecycle || read !== grantSearchReads || controller.signal.aborted || grantTarget !== 'other' || query !== grantSearch.trim()) return;
      grantRows = result.rows; grantMatches = result.filteredTotal; grantResultKey = query;
    } catch (failure) {
      if (owner === lifecycle && read === grantSearchReads && !controller.signal.aborted) grantLookupError = `Stories could not be loaded: ${failure.message}`;
    } finally {
      if (owner === lifecycle && read === grantSearchReads) { grantSearching = false; grantSearchController = undefined; }
    }
  }
  let permission = $state('metadata'), proposalKind = $state('story.patch');
  let calendarUnit = $state('campaign'), calendarFormat = $state('infographic');
  let calendarDate = $state(''), calendarZone = $state('America/New_York');
  let observation = $state.raw(null), observing = $state(false);
  let calendarReads = 0;
  const settings = () => JSON.stringify([story?.id, proposalKind, calendarUnit, calendarFormat, calendarDate, calendarZone]);
  const ready = () => observation && observation.settings === settings() && observation.base === story?.revision;
  const actionLabel = kind => ({ 'story.patch': 'Category changes', 'assignment.place': 'Calendar placement or move', 'assignment.remove': 'Calendar removal' })[kind] || kind;
  let clientId = $state(crypto.randomUUID());
  let presenceNotice = $state('');
  let lifecycle = 0, reads = 0, observedReceiptState = '';
  // This effect owns an external scoped subscription; its reset state is not derived content.
  const root = '/api/studio/workspace/control';
  const display = id => members.find(member => member.id === id)?.displayName || id;
  function active(grant) { return grant.status === 'active' && Date.parse(grant.expiresAt) > Date.now(); }
  function incomingGrantForCurrentStory(grant) { return grant.helperId === actorId && active(grant) && story && grant.storyIds.includes(story.id); }
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
      error = ''; message = ''; helperId = ''; category = ''; grantTarget = 'current'; grantSearch = ''; cancelGrantSearch(); permission = 'metadata'; proposalKind = 'story.patch'; calendarUnit = 'campaign'; calendarFormat = 'infographic'; calendarDate = ''; calendarZone = 'America/New_York'; observation = null; observing = false; calendarReads++; uncertain = null; pending = 0; clientId = crypto.randomUUID();
      void refresh(lifecycle, send);
    });
    const owner = lifecycle;
    const timer = setInterval(() => { if (key === scopeKey) void refresh(owner, send); }, 5000);
    return () => { clearInterval(timer); grantSearchController?.abort(); grantSearchReads++; lifecycle++; reads++; };
  });
  $effect(() => {
    const send = request, actor = actorId, id = clientId;
    const selected = story ? { storyId: story.id, observedRevision: story.revision } : { storyId: null, observedRevision: null };
    scopeKey;
    untrack(() => { presenceNotice = ''; });
    const heartbeat = createPresenceHeartbeat({ request: send, actorId: actor, clientId: id, selected,
      onPaused: message => { presenceNotice = message; } });
    void heartbeat.beat(); const timer = setInterval(() => void heartbeat.beat(), 10000);
    return () => { clearInterval(timer); heartbeat.stop(); };
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
    const target = grantStory();
    if (!target || !helperId || grantSearching) return;
    const kinds = permission === 'metadata' ? ['story.patch'] : permission === 'calendar' ? ['assignment.place', 'assignment.remove'] : ['story.patch', 'assignment.place', 'assignment.remove'];
    return action('/grants', { helperId, storyIds: [target.id], kinds, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() }, `Granted the selected proposals for “${target.title}” for 10 minutes. Each still needs your approval. Your active editor is unchanged.`);
  }
  async function observeCalendar() {
    const owner = lifecycle, read = ++calendarReads, send = request, key = settings(), selected = story ? { id: story.id, revision: story.revision } : null;
    const config = { kind: proposalKind, unit: calendarUnit, format: calendarFormat, date: calendarDate, zone: calendarZone };
    if (!selected) return;
    observation = null; observing = true; error = '';
    try {
      const zone = canonicalZone(config.zone);
      if (config.kind === 'assignment.place' && !validDate(config.date)) throw new Error('Choose a valid calendar date.');
      const { row } = await send(`/api/studio/workspace/stories/${encodeURIComponent(selected.id)}`);
      const assignment = row.assignments.find(item => item.unit === config.unit && (config.unit === 'campaign' || item.format === config.format));
      if (config.kind === 'assignment.remove' && !assignment) throw new Error('This unit has no dated placement to remove.');
      const days = new Map();
      if (config.kind === 'assignment.place') days.set(`${zone}|${config.date}`, { date: config.date, zone });
      if (assignment) days.set(`${assignment.timeZone}|${assignment.date}`, { date: assignment.date, zone: assignment.timeZone });
      const snapshots = await Promise.all([...days.values()].map(({ date, zone: timeZone }) => send('/api/studio/workspace/calendar?' + new URLSearchParams({ startDate: date, endDate: date, timeZone }))));
      const assignments = [...new Map(snapshots.flatMap(item => item.assignments).map(item => [item.id, item])).values()];
      const buckets = Object.assign({}, ...snapshots.map(item => item.buckets));
      const intent = captureIntent({ storyId: row.id, unit: config.unit, format: config.format, assignmentId: assignment?.id }, new Map([[row.id, { row }]]), { assignments, buckets });
      if (owner !== lifecycle || read !== calendarReads || key !== settings() || selected.revision !== story?.revision) return;
      observation = { settings: key, base: selected.revision, intent, assignment, zone };
    } catch (failure) { if (owner === lifecycle && read === calendarReads) error = failure.message; }
    finally { if (owner === lifecycle && read === calendarReads) observing = false; }
  }
  function propose(grant) {
    if (!story) return;
    let change;
    if (proposalKind === 'story.patch') {
      if (!category.trim()) return;
      change = { kind: 'story.patch', storyId: story.id, expectedRevision: story.revision, patch: { category: category.trim() } };
    } else {
      if (!ready()) return;
      change = proposalKind === 'assignment.remove' ? removeCommand(observation.intent) : placeCommand(observation.intent, calendarDate, observation.zone);
    }
    return action('/proposals', { grantId: grant.id, epoch: grant.epoch, changes: [change] }, 'Proposal submitted for the owner to review. Shared content has not changed.');
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
  <p>Review bounded proposals before another operator or helper changes shared metadata or calendar plans. Navigation and unsaved editing stay personal.</p>
  <button class="secondary" onclick={() => refresh()}>Refresh shared control</button>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if message}<p role="status">{message}</p>{/if}
  {#if story}
    <p>Current story: {story.title} · revision {story.revision}</p>
    <label>Proposal operator<select aria-label="Proposal operator" bind:value={helperId}><option value="">Choose a current brand member</option>{#each members as member (member.id)}<option value={member.id}>{member.displayName}</option>{/each}</select></label>
    <label>Grant target<select aria-label="Grant target" bind:value={grantTarget} onchange={cancelGrantSearch}><option value="current">Current editor story</option><option value="other">Another story in this brand</option></select></label>
    {#if grantTarget === 'other'}
      <p>Choose a story without opening it or saving your current editor. The proposal operator opens that story in their own workspace.</p>
      <label>Find story for delegation<input bind:value={grantSearch} oninput={cancelGrantSearch} maxlength="100" /></label>
      <button class="secondary" disabled={grantSearching || pending > 0 || !grantSearch.trim()} onclick={searchGrantStories}>Search stories for delegation</button>
      {#if grantSearching}<p role="status">Loading stories in this brand…</p>{/if}
      {#if grantLookupError}<p role="alert">{grantLookupError}</p>{/if}
      {#if grantResultKey === grantSearch.trim()}
        {#if grantRows.length}
          <label>Story to delegate<select aria-label="Story to delegate" bind:value={grantStoryId}><option value="">Choose a returned story</option>{#each grantRows as row (row.id)}<option value={row.id}>{row.title} · revision {row.revision}</option>{/each}</select></label>
          <p>Showing {grantRows.length} of {grantMatches} matching stories.{grantMatches > grantRows.length ? ' Narrow the search to find another story.' : ''}</p>
        {:else}<p>No matching stories in this brand. Change the search and try again.</p>{/if}
      {/if}
    {/if}
    {#if grantStory()}<p>Grant applies only to: {grantStory().title}. Your current editor remains {story.title}.</p>{/if}
    <label>Allowed proposal types<select aria-label="Allowed proposal types" bind:value={permission}><option value="metadata">Category changes only</option><option value="calendar">Calendar plans only</option><option value="both">Category changes and calendar plans</option></select></label>
    <button disabled={pending > 0 || !helperId || grantSearching || !grantStory()} onclick={createGrant}>{permission === 'metadata' ? 'Grant metadata proposals for 10 minutes' : permission === 'calendar' ? 'Grant calendar proposals for 10 minutes' : 'Grant metadata and calendar proposals for 10 minutes'}</button>
    {#if projection.grants.some(incomingGrantForCurrentStory)}
    <label>Proposal action<select aria-label="Proposal action" bind:value={proposalKind}><option value="story.patch">Change category</option><option value="assignment.place">Place or move a calendar plan</option><option value="assignment.remove">Remove a calendar plan</option></select></label>
    {#if proposalKind === 'story.patch'}
      <label>Proposed category<input bind:value={category} maxlength="100" /></label>
    {:else}
      <p>Calendar plans are dated assignments, not publication. A format plan does not imply an exported asset exists. Placement appends to the chosen date.</p>
      <label>Planning unit<select aria-label="Planning unit" bind:value={calendarUnit}><option value="campaign">Whole campaign</option><option value="format">Individual format</option></select></label>
      {#if calendarUnit === 'format'}<label>Planning format<select aria-label="Planning format" bind:value={calendarFormat}><option value="infographic">Infographic</option><option value="carousel">Carousel</option><option value="story">Story</option><option value="reel">Reel</option></select></label>{/if}
      {#if proposalKind === 'assignment.place'}
        <label>Proposed date<input type="date" bind:value={calendarDate} /></label>
        <label>Calendar timezone<input bind:value={calendarZone} /></label>
      {/if}
      <button class="secondary" disabled={observing || pending > 0} onclick={observeCalendar}>Load calendar observation</button>
      {#if ready()}
        <p role="status">Observed {unitLabel(observation.intent)} at saved story revision {observation.intent.expectedRevision}. {observation.assignment ? `Current placement: ${observation.assignment.date} (${observation.assignment.timeZone}), revision ${observation.assignment.revision}.` : 'No current dated placement.'} Calendar order revisions are captured; newer work requires a fresh observation.</p>
      {:else}<p>Load saved story and calendar revisions before proposing. Changed settings or story revisions require a new observation.</p>{/if}
    {/if}
    {:else}<p>Proposal inputs appear when you receive an active grant for this story.</p>{/if}
  {:else}<p>Open a story to create a bounded grant or proposal.</p>{/if}
  {#if uncertain}<p role="status">An operation result is unknown. Its request key is retained for retry.</p>{#if uncertain.operationId}<button disabled={pending > 0} onclick={() => undo(uncertain.operationId)}>Retry same undo</button>{/if}{/if}
  {#each projection.grants as grant (grant.id)}
    <article aria-label={`Grant ${grant.id}`}>
      <h3>{display(grant.ownerId)} → {display(grant.helperId)}</h3>
      <p>{active(grant) ? 'Active' : grant.status === 'active' ? 'Expired' : grant.status} · epoch {grant.epoch} · {grant.storyIds.length} stories · expires {grant.expiresAt}</p>
      <p>Granted stories: {grant.storyIds.map(grantStoryLabel).join('; ')}.</p>
      <p>Allowed actions: {grant.kinds.map(actionLabel).join(', ')}. Attempted items: {grant.attemptedItems} of 25.</p>
      {#if grant.ownerId === actorId && !['stopped', 'completed'].includes(grant.status)}
        {#if active(grant)}<button class="secondary" onclick={() => action(`/grants/${grant.id}/pause`, { expectedEpoch: grant.epoch }, 'Paused. Older helper epochs cannot apply new work.')}>Pause</button>{/if}
        {#if grant.status === 'paused'}<button class="secondary" onclick={() => action(`/grants/${grant.id}/resume`, { expectedEpoch: grant.epoch }, 'Resumed with a new epoch. A fresh proposal is required.')}>Resume</button>{/if}
        <button class="secondary" onclick={() => action(`/grants/${grant.id}/stop`, { expectedEpoch: grant.epoch }, 'Stopped. Prior accepted changes remain recorded.')}>Stop</button>
        <button class="secondary" onclick={() => action(`/grants/${grant.id}/takeover`, { expectedEpoch: grant.epoch }, 'Taken over. This grant cannot execute further work.')}>Take over</button>
      {/if}
      {#if incomingGrantForCurrentStory(grant)}
        <button disabled={pending > 0 || !!uncertain || !grant.kinds.includes(proposalKind) || (proposalKind === 'story.patch' ? !category.trim() : !ready())} onclick={() => propose(grant)}>{proposalKind === 'story.patch' ? 'Propose category change' : proposalKind === 'assignment.remove' ? 'Propose calendar removal' : 'Propose calendar placement'}</button>
      {/if}
      {#each projection.proposals.filter(proposal => proposal.grantId === grant.id) as proposal (proposal.id)}
        <section aria-label={`Proposal ${proposal.id}`}>
          <h4>Proposal · {proposal.status} · revision {proposal.revision}</h4>
          {#each proposal.changes.filter(change => change.kind !== 'story.patch') as change (change.storyId)}
            <p>{actionLabel(change.kind)} · {change.unit ? unitLabel(change) : 'Existing dated plan'}{change.date ? ` · ${change.date} (${change.timeZone})` : ''}. Exact revisions are checked again when applied.</p>
          {/each}
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
  {#if presenceNotice}<p role="status">{presenceNotice}</p>{/if}
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
