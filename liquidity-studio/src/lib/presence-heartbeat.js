// Presence belongs to the confirmed actor for this mounted client. A cookie can
// change in another tab without updating the current tab's workspace state.
export function createPresenceHeartbeat({ request, actorId, clientId, selected, onPaused }) {
  let stopped = false, pending = false;
  const controller = new AbortController();
  function pause(message) {
    if (stopped) return;
    stopped = true;
    onPaused(message);
  }
  return {
    async beat() {
      if (stopped || pending) return;
      pending = true;
      try {
        const session = await request('/api/auth/session', { signal: controller.signal });
        if (stopped) return;
        if (session.user?.id !== actorId) {
          pause('Presence paused because your sign-in changed in another tab. Reload when you are ready to use the current account.');
          return;
        }
        await request('/api/studio/workspace/control/presence', {
          method: 'POST', signal: controller.signal,
          body: JSON.stringify({ clientId, clientKind: 'human', ...selected }),
        });
      } catch (failure) {
        if (!stopped && ([401, 403, 409].includes(failure.status) || failure.code === 'REQUEST_CONTEXT_CHANGED')) {
          pause(`Presence paused: ${failure.message}. Reload when you are ready to reconnect.`);
        }
      } finally { pending = false; }
    },
    stop() { stopped = true; controller.abort(); },
  };
}
