<script>
  import { onMount, onDestroy } from 'svelte';
  let { request } = $props();
  let info = $state(null), loading = $state(true), busy = $state(false), error = $state('');
  let connectUrl = $state(''), pollingStopped = $state(false);
  let alive = true, sequence = 0, timer, pollUntil = 0;
  const states = new Set(['not-connected', 'pending', 'native-confirmed', 'connected', 'expired']);
  function stopPolling() { clearTimeout(timer); timer = undefined; }
  function schedule() {
    stopPolling();
    if (!alive || info?.state !== 'pending') return;
    const expiry = Date.parse(info.challenge?.expiresAt || '');
    if (!Number.isFinite(expiry)) { error = 'Connection expiry is unavailable. Check the connection or start again.'; return; }
    pollUntil = Math.min(pollUntil || Date.now() + 10 * 60 * 1000, expiry);
    if (Date.now() >= pollUntil) { pollingStopped = true; connectUrl = ''; return; }
    timer = setTimeout(() => void load(false), Math.min(2000, pollUntil - Date.now()));
  }
  async function load(showLoading = true) {
    const ticket = ++sequence;
    if (showLoading) loading = true;
    try {
      const result = await request('/api/studio/penpot/access');
      if (!alive || ticket !== sequence) return;
      if (!states.has(result.state)) throw new Error('Connection status is unavailable. Check again.');
      info = result; error = '';
      if (result.state !== 'pending') connectUrl = '';
      schedule();
    } catch (failure) { if (alive && ticket === sequence) { error = failure.message; stopPolling(); } }
    finally { if (alive && ticket === sequence) loading = false; }
  }
  function checkedUrl(value) {
    const url = new URL(value);
    if (url.origin !== 'http://localhost:39008' || url.pathname !== '/studio-connect' || url.username || url.password || url.hash || [...url.searchParams.keys()].length !== 1 || !/^[A-Za-z0-9_-]{43}$/.test(url.searchParams.get('challenge') || '')) throw new Error('The Penpot connection link is unavailable. Start again.');
    return url.href;
  }
  async function start() {
    if (busy) return;
    stopPolling(); const ticket = ++sequence; busy = true; error = ''; connectUrl = ''; pollingStopped = false; pollUntil = 0;
    try {
      const challenge = await request('/api/studio/penpot/access/challenges', { method: 'POST', body: '{}' });
      if (!alive || ticket !== sequence) return;
      const url = checkedUrl(challenge.nativeConnectUrl);
      if (typeof challenge.id !== 'string' || !Number.isFinite(Date.parse(challenge.expiresAt))) throw new Error('The connection request is incomplete. Check its status before starting again.');
      info = { state: 'pending', connection: null, challenge: { id: challenge.id, expiresAt: challenge.expiresAt, status: 'pending' } };
      connectUrl = url; schedule();
    } catch (failure) { if (alive && ticket === sequence) error = failure.message; }
    finally { if (alive && ticket === sequence) busy = false; }
  }
  async function complete() {
    if (busy || info?.state !== 'native-confirmed' || !info.challenge?.id) return;
    stopPolling(); const ticket = ++sequence; const challengeId = info.challenge.id; busy = true; error = '';
    try {
      await request('/api/studio/penpot/access/complete', { method: 'POST', body: JSON.stringify({ challengeId }) });
      if (alive && ticket === sequence) await load();
    } catch (failure) { if (alive && ticket === sequence) error = failure.message; }
    finally { if (alive) busy = false; }
  }
  async function disconnect() {
    if (busy) return;
    stopPolling(); const ticket = ++sequence; busy = true; error = ''; connectUrl = '';
    try {
      await request('/api/studio/penpot/access/disconnect', { method: 'POST', body: '{}' });
      if (alive && ticket === sequence) { pollUntil = 0; pollingStopped = false; await load(); }
    } catch (failure) { if (alive && ticket === sequence) error = failure.message; }
    finally { if (alive) busy = false; }
  }
  onMount(() => { void load(); });
  onDestroy(() => { alive = false; sequence++; stopPolling(); });
</script>

<section class="penpot-connection" aria-label="Your Penpot account">
  <h3>Connect your Penpot account</h3>
  {#if loading}<p role="status">Checking your connection…</p>
  {:else if info?.state === 'connected'}
    <p role="status">Connected{info.connection?.nativeProfileName ? ` as ${info.connection.nativeProfileName}` : ''}. Design access is not enabled yet.</p>
    <button class="secondary" disabled={busy} onclick={disconnect}>Disconnect my account</button>
  {:else if info?.state === 'native-confirmed'}
    <p>Penpot confirmed {info.challenge?.nativeProfileName || 'your account'}. Confirm here to connect it to your current Studio account.</p>
    <button class="primary" disabled={busy} onclick={complete}>{busy ? 'Confirming…' : 'Confirm connection'}</button>
    <button class="secondary" disabled={busy} onclick={disconnect}>Cancel connection</button>
  {:else if info?.state === 'pending' && !pollingStopped}
    <p role="status">Continue in Penpot, then return here to confirm your account. No design access is granted yet.</p>
    {#if connectUrl}<a class="primary" href={connectUrl} target="_blank" rel="noopener noreferrer">Continue in Penpot ↗</a>{:else}<p>This pending request was restored. Start a new connection to get a fresh link.</p><button class="secondary" disabled={busy} onclick={start}>Start a new connection</button>{/if}
    <button class="secondary" disabled={busy} onclick={disconnect}>Cancel connection</button>
  {:else if info}
    {#if info.state === 'expired' || pollingStopped}<p>The connection request expired or checking stopped. Start again when you are ready.</p>{:else}<p>Use your own Penpot account. This does not change your personal designs or enable editing.</p>{/if}
    <button class="secondary" disabled={busy} onclick={start}>{busy ? 'Preparing connection…' : 'Connect my account'}</button>
  {/if}
  {#if error}<p role="alert">{error}</p><button class="secondary" disabled={loading || busy} onclick={() => load()}>Check connection again</button>{/if}
</section>
<style>
  .penpot-connection { display:flex; align-items:center; flex-wrap:wrap; gap:.5rem .75rem; padding:.8rem 1rem; border:1px solid var(--line,#d1d5db); border-radius:10px; margin-block:.75rem; }
  h3 { font-size:15px; margin:0; } p { margin:0; font-size:13px; flex:1 1 300px; } button,a { min-height:36px; padding:7px 10px; font-size:13px; } a { display:inline-flex; align-items:center; }
</style>
