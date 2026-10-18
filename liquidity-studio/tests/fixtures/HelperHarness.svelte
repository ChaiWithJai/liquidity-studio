<script>
  import { onMount } from 'svelte';
  import HelperControlPane from '../../src/components/HelperControlPane.svelte';
  let actor = $state(null), story = $state(null), members = $state([]), notes = $state('');
  const scopeKey = 'org_default:brand_default';
  async function request(path, options = {}) {
    const response = await fetch(path + '?organizationId=org_default&brandId=brand_default', { ...options, headers: { 'Content-Type': 'application/json' } });
    const data = await response.json();
    if (!response.ok) throw Object.assign(Error(data.error || 'Request failed'), { status: response.status });
    return data;
  }
  onMount(() => { void (async () => {
    actor = (await request('/api/auth/session')).user;
    members = (await request('/api/studio/workspace/members')).members;
    const row = (await request('/api/studio/workspace/query', { method: 'POST', body: '{}' })).rows[0];
    story = (await request('/api/studio/workspace/stories/' + row.id)).story;
  })(); });
</script>
<label>Personal notes<textarea bind:value={notes}></textarea></label>
{#if actor && story}<HelperControlPane {request} {scopeKey} actorId={actor.id} {members} {story}/>{/if}
