<script>
  import { onMount, onDestroy } from 'svelte';
  import { checkedPenpotConnectionUrl } from '../lib/penpot-connection-url.js';
  let { request, onConnectionChange = () => {}, returnContext = {} } = $props();
  let reportedStatus;
  let info = $state(null), loading = $state(true), busy = $state(false), error = $state('');
  let connectUrl = $state(''), pollingStopped = $state(false), settingUp = $state(false);
  let alive = true, sequence = 0, timer, pollUntil = 0;
  const states = new Set(['not-connected', 'pending', 'native-confirmed', 'connected', 'expired']);
  function validExpiry(value) { return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= 8640000000000000; }
  function stopPolling() { clearTimeout(timer); timer = undefined; }
  function schedule() {
    stopPolling();
    if (!alive || info?.state !== 'pending') return;
    const expiry = info.challenge?.expiresAt;
    if (!validExpiry(expiry)) { error = 'Connection expiry is unavailable. Check the connection or start again.'; return; }
    pollUntil = Math.min(pollUntil || Date.now() + 10 * 60 * 1000, expiry);
    if (Date.now() >= pollUntil) { pollingStopped = true; connectUrl = ''; return; }
    timer = setTimeout(() => void load(false), Math.min(2000, pollUntil - Date.now()));
  }
  async function load(showLoading = true, notify = true) {
    const ticket = ++sequence;
    if (showLoading) loading = true;
    try {
      const result = await request('/api/studio/penpot/access');
      if (!alive || ticket !== sequence) return;
      if (!states.has(result.state)) throw new Error('Connection status is unavailable. Check again.');
      info = result; error = '';
      const status = JSON.stringify([result.state, result.connection?.nativeProfileId, result.editingEnabled === true, result.accessReason]);
      if (notify && reportedStatus !== undefined && reportedStatus !== status) onConnectionChange();
      reportedStatus = status;
      if (result.state !== 'pending') connectUrl = '';
      schedule();
    } catch (failure) { if (alive && ticket === sequence) { error = failure.message; stopPolling(); } }
    finally { if (alive && ticket === sequence) loading = false; }
  }
  async function start() {
    if (busy) return;
    stopPolling(); const ticket = ++sequence; busy = true; error = ''; connectUrl = ''; pollingStopped = false; pollUntil = 0;
    try {
      const challenge = await request('/api/studio/penpot/access/challenges', { method: 'POST', body: JSON.stringify({returnContext}) });
      if (!alive || ticket !== sequence) return;
      const url = checkedPenpotConnectionUrl(challenge.nativeConnectUrl, challenge.nativeOrigin);
      if (typeof challenge.id !== 'string' || !validExpiry(challenge.expiresAt)) throw new Error('The connection request is incomplete. Check its status before starting again.');
      info = { state: 'pending', connection: null, challenge: { id: challenge.id, expiresAt: challenge.expiresAt, status: 'pending' } };
      connectUrl = url; schedule();
    } catch (failure) { if (alive && ticket === sequence) error = failure.message; }
    finally { if (alive && ticket === sequence) busy = false; }
  }
  async function complete() {
    if (busy || info?.state !== 'native-confirmed' || !info.challenge?.id) return;
    stopPolling(); const ticket = ++sequence; const challengeId = info.challenge.id; busy = true; error = '';
    let setUpAfterConnection = false;
    try {
      await request('/api/studio/penpot/access/complete', { method: 'POST', body: JSON.stringify({ challengeId }) });
      if (alive && ticket === sequence) {
        onConnectionChange(); await load(true, false);
        setUpAfterConnection = info?.state === 'connected' && info.setupAvailable === true && info.editingEnabled !== true;
      }
    } catch (failure) { if (alive && ticket === sequence) error = failure.message; }
    finally { if (alive) busy = false; }
    if (alive && setUpAfterConnection) await setupAccess();
  }
  async function setupAccess() {
    if (busy || info?.state !== 'connected' || info.setupAvailable !== true || info.editingEnabled === true) return;
    stopPolling(); const ticket = ++sequence; busy = true; settingUp = true; error = '';
    try {
      await request('/api/studio/penpot/access/setup', { method: 'POST', body: '{}' });
      if (alive && ticket === sequence) { onConnectionChange(); await load(false, false); }
    } catch (failure) { if (alive && ticket === sequence) error = failure.message; }
    finally { if (alive) { busy = false; settingUp = false; } }
  }
  async function disconnect() {
    if (busy) return;
    stopPolling(); const ticket = ++sequence; busy = true; error = ''; connectUrl = '';
    try {
      await request('/api/studio/penpot/access/disconnect', { method: 'POST', body: '{}' });
      if (alive && ticket === sequence) { pollUntil = 0; pollingStopped = false; onConnectionChange(); await load(true, false); }
    } catch (failure) { if (alive && ticket === sequence) error = failure.message; }
    finally { if (alive) busy = false; }
  }
  onMount(() => { void load(); });
  onDestroy(() => { alive = false; sequence++; stopPolling(); });
</script>

<svelte:window onfocus={() => { if (!loading && !busy) void load(false); }} />
<section class="penpot-connection" aria-label="Your Penpot account">
  {#if loading}<p role="status">Checking your connection…</p>
  {:else if info?.state === 'connected'}
    <p role="status">Penpot connected{info.connection?.nativeProfileName ? ` as ${info.connection.nativeProfileName}` : ''}. {info.editingEnabled === true ? 'Ready to edit this brand’s designs.' : info.accessReason || 'Design access is not enabled yet.'}</p>
    {#if info.editingEnabled !== true && info.setupAvailable === true}<button class="primary" disabled={busy} onclick={setupAccess}>{settingUp ? 'Setting up brand access…' : 'Set up brand access'}</button>{/if}
    <details><summary>Account connection</summary><button class="secondary" disabled={busy} onclick={disconnect}>Disconnect my account</button></details>
  {:else if info?.state === 'native-confirmed'}
    <p>Penpot confirmed {info.challenge?.nativeProfileName || 'your account'}. Confirm here to connect it to your current Studio account.</p>
    <button class="primary" disabled={busy} onclick={complete}>{busy ? 'Confirming…' : 'Confirm connection'}</button>
    <button class="secondary" disabled={busy} onclick={disconnect}>Cancel connection</button>
  {:else if info?.state === 'pending' && !pollingStopped}
    <p role="status">Continue in Penpot, then return here to confirm your account. No design access is granted yet.</p>
    {#if connectUrl}<a class="primary" href={connectUrl} target="_blank" rel="noopener noreferrer">Continue in Penpot ↗</a>{:else}<p>This pending request was restored. Start a new connection to get a fresh link.</p><button class="secondary" disabled={busy} onclick={start}>Start a new connection</button>{/if}
    <button class="secondary" disabled={busy} onclick={disconnect}>Cancel connection</button>
  {:else if info}
    {#if info.state === 'expired' || pollingStopped}<p>The connection request expired or checking stopped. Start again when you are ready.</p>{/if}
    <button class="secondary" disabled={busy} onclick={start}>{busy ? 'Preparing connection…' : 'Connect my account'}</button>
    <details class="connection-help"><summary>About shared access</summary><p>Connect your own Penpot account for shared brand access. Your personal designs stay unchanged. You can still open an existing linked design if you already have access.</p></details>
  {/if}
  {#if error}<p role="alert">{error}</p><button class="secondary" disabled={loading || busy} onclick={() => load()}>Check connection again</button>{/if}
</section>
<style>
  .penpot-connection { display:flex; align-items:center; flex-wrap:wrap; gap:.5rem .75rem; padding:0; border:0; margin:0; flex:0 1 auto; }
  .connection-help { position:relative; } .connection-help[open] p { max-width:28rem; margin-top:.5rem; } summary { cursor:pointer; font-size:13px; } details button { margin-top:.5rem; } p { margin:0; font-size:13px; flex:1 1 300px; } button,a { min-height:36px; padding:7px 10px; font-size:13px; } a { display:inline-flex; align-items:center; }
</style>
