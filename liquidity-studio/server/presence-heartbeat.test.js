import test from 'node:test';
import assert from 'node:assert/strict';
import { createPresenceHeartbeat } from '../src/lib/presence-heartbeat.js';

const selection = { storyId: 'story-1', observedRevision: 3 };
test('presence pauses before posting after a confirmed actor change and does not rotate the client', async () => {
  const paths = [], notices = [];
  const heartbeat = createPresenceHeartbeat({ actorId: 'old-actor', clientId: 'retained-client', selected: selection,
    request: async path => { paths.push(path); return { user: { id: 'new-actor' } }; }, onPaused: message => notices.push(message) });
  await heartbeat.beat(); await heartbeat.beat();
  assert.deepEqual(paths, ['/api/auth/session']);
  assert.equal(notices.length, 1);
  assert.match(notices[0], /sign-in changed/);
});

test('cookie change between confirmation and POST pauses after one guarded conflict', async () => {
  const posts = [], notices = [];
  const heartbeat = createPresenceHeartbeat({ actorId: 'actor', clientId: 'fixed-client', selected: selection,
    request: async (path, options) => {
      if (path === '/api/auth/session') return { user: { id: 'actor' } };
      posts.push(JSON.parse(options.body));
      throw Object.assign(new Error('Presence client belongs to another actor'), { status: 409 });
    }, onPaused: message => notices.push(message) });
  await heartbeat.beat(); await heartbeat.beat();
  assert.deepEqual(posts, [{ clientId: 'fixed-client', clientKind: 'human', ...selection }]);
  assert.equal(notices.length, 1);
});

test('teardown aborts confirmation and prevents an old client from posting; confirmed new actor uses a new lifecycle', async () => {
  let resolveSession, signal;
  const posts = [], notices = [];
  const old = createPresenceHeartbeat({ actorId: 'old', clientId: 'old-client', selected: selection,
    request: (path, options) => { signal = options.signal; return new Promise(resolve => { resolveSession = resolve; }); },
    onPaused: message => notices.push(message) });
  const pending = old.beat(); await old.beat();
  old.stop(); assert.equal(signal.aborted, true);
  resolveSession({ user: { id: 'old' } }); await pending;
  assert.deepEqual(notices, []);
  const current = createPresenceHeartbeat({ actorId: 'new', clientId: 'new-client', selected: selection,
    request: async (path, options) => {
      if (path === '/api/auth/session') return { user: { id: 'new' } };
      posts.push(JSON.parse(options.body));
    }, onPaused: message => notices.push(message) });
  await current.beat();
  assert.equal(posts[0].clientId, 'new-client');
  assert.deepEqual(notices, []);
});
