import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FirestoreStore } from './cloud-store.js';

function fakeFirestore() {
  const records = new Map();
  let queue = Promise.resolve();
  const reference = path => ({ path, collection: child => collection(`${path}/${child}`) });
  const snapshot = ref => ({ exists: records.has(ref.path), data: () => structuredClone(records.get(ref.path)) });
  const collection = path => ({ doc: id => reference(`${path}/${id}`), orderBy: () => ({ startAt: () => ({ endAt: () => ({ get: async () => ({ docs: [...records.entries()].filter(([key]) => key.split('/').length === 2).map(([, value]) => ({ data: () => value })) }) }) }), get: async () => ({ docs: [...records.entries()].filter(([key]) => key.split('/').length === 2).map(([, value]) => ({ data: () => value })) }) }) });
  return {
    records, collection,
    async runTransaction(callback) {
      const work = queue.then(async () => {
        const writes = [];
        const result = await callback({ get: async ref => snapshot(ref), getAll: async (...refs) => refs.map(snapshot), set: (ref, value) => writes.push(() => records.set(ref.path, structuredClone(value))), delete: ref => writes.push(() => records.delete(ref.path)) });
        writes.forEach(write => write());
        return result;
      });
      queue = work.catch(() => {});
      return work;
    },
    async terminate() {}
  };
}

function fakeBucket() {
  const objects = new Map();
  return { name: 'pilot-private-assets', objects, async getMetadata() { return [{}]; }, file(object, options = {}) {
    return {
      async save(buffer, config) {
        assert.equal(config.preconditionOpts.ifGenerationMatch, 0);
        if (objects.has(object)) throw Object.assign(new Error('exists'), { code: 412 });
        objects.set(object, { buffer: Buffer.from(buffer), metadata: { ...config.metadata, generation: '1', size: String(buffer.length) } });
      },
      async getMetadata() { return [objects.get(object).metadata]; },
      async download() { assert.equal(String(options.generation), '1'); return [objects.get(object).buffer]; },
      async delete(config) { assert.equal(config.ifGenerationMatch, '1'); objects.delete(object); }
    };
  } };
}

const scope = { organizationId: 'org-one', brandId: 'brand-one' };

test('SDK boundary: JSON persists across clients and chunk shrink removes stale bytes', async () => {
  const firestore = fakeFirestore();
  const first = new FirestoreStore({ firestore });
  const second = new FirestoreStore({ firestore });
  const key = 'scope:org-one:brand-one';
  const large = { text: '漢字'.repeat(100000), count: 0 };
  await first.update(key, () => large);
  assert.deepEqual(await second.get(key), large);
  assert.ok(firestore.records.size > 2);
  await second.update(key, value => ({ count: value.count + 1 }));
  assert.deepEqual(await first.get(key), { count: 1 });
  assert.equal(firestore.records.size, 2);
  assert.deepEqual(await first.keys('scope:'), [key]);
  await first.delete(key);
  assert.equal(await second.get(key), null);
  assert.equal(firestore.records.size, 0);
});

test('SDK boundary: concurrent increments commit without dropped updates', async () => {
  const store = new FirestoreStore({ firestore: fakeFirestore() });
  await Promise.all(Array.from({ length: 20 }, () => store.update('counter', value => ({ count: (value?.count || 0) + 1 }))));
  assert.deepEqual(await store.get('counter'), { count: 20 });
});

test('SDK boundary: async callbacks, capacity, corruption and local backup fail explicitly', async () => {
  const firestore = fakeFirestore();
  const store = new FirestoreStore({ firestore });
  await assert.rejects(store.update('bad', async () => ({})), error => error.code === 'INVALID_UPDATE');
  await assert.rejects(store.update('big', () => ({ text: 'x'.repeat(5 * 1024 * 1024) })), error => error.code === 'STORE_CAPACITY');
  assert.equal(await store.get('big'), null);
  await store.update('good', () => ({ count: 1 }));
  const part = [...firestore.records.keys()].find(key => key.includes('/chunks/'));
  firestore.records.get(part).bytes = Buffer.from('corrupt');
  await assert.rejects(store.get('good'), error => error.code === 'STORE_CORRUPT');
  await assert.rejects(store.backup('/tmp/file'), error => error.code === 'REMOTE_BACKUP_REQUIRED');
});

test('GCS boundary: scoped content-addressed uploads are idempotent and generation pinned', async () => {
  const bucket = fakeBucket();
  const store = new FirestoreStore({ firestore: fakeFirestore(), bucket });
  const bytes = Buffer.from('approved artifact');
  const reference = await store.uploadArtifact(scope, 'asset-one', bytes, 'text/plain');
  assert.deepEqual(await store.uploadArtifact(scope, 'asset-one', bytes, 'text/plain'), reference);
  assert.deepEqual(await store.downloadArtifact(scope, reference), bytes);
  await assert.rejects(store.downloadArtifact({ ...scope, brandId: 'other-brand' }, reference), error => error.code === 'ARTIFACT_FORBIDDEN');
  await assert.rejects(store.downloadArtifact({ ...scope, organizationId: 'other-org' }, reference), error => error.code === 'ARTIFACT_FORBIDDEN');
  await assert.rejects(store.downloadArtifact(scope, { ...reference, bucket: 'foreign-bucket' }), error => error.code === 'ARTIFACT_FORBIDDEN');
  bucket.objects.get(reference.object).buffer = Buffer.from('tampered artifact');
  await assert.rejects(store.downloadArtifact(scope, reference), error => error.code === 'ARTIFACT_INTEGRITY');
  await store.deleteArtifact(scope, reference);
  assert.equal(bucket.objects.size, 0);
});

test('GCS boundary: traversal IDs, empty bytes and unsupported executable content are rejected', async () => {
  const store = new FirestoreStore({ firestore: fakeFirestore(), bucket: fakeBucket() });
  await assert.rejects(store.uploadArtifact(scope, '../escape', Buffer.from('x'), 'text/plain'), error => error.code === 'INVALID_ARTIFACT');
  await assert.rejects(store.uploadArtifact({ ...scope, brandId: '../escape' }, 'id', Buffer.from('x'), 'text/plain'), error => error.code === 'INVALID_ARTIFACT_SCOPE');
  await assert.rejects(store.uploadArtifact(scope, 'id', Buffer.from('x'), 'text/html'), error => error.code === 'INVALID_ARTIFACT');
});

test('cloud readiness checks both dependencies and redacts SDK diagnostics', async () => {
  const store = new FirestoreStore({ firestore: fakeFirestore(), bucket: fakeBucket() });
  assert.deepEqual(await store.checkHealth(), { repository: 'available', artifacts: 'available' });
  store.bucket.getMetadata = async () => { throw new Error('private-bucket?token=secret'); };
  await assert.rejects(store.checkHealth(), error => {
    assert.doesNotMatch(error.message, /private|token|secret/);
    return error.code === 'CLOUD_DEPENDENCY_UNAVAILABLE';
  });
});

test('GCS reel text export preserves its UTF8 MIME metadata', async () => {
  const store = new FirestoreStore({ firestore: fakeFirestore(), bucket: fakeBucket() });
  const bytes = Buffer.from('Reel script: source notes');
  const reference = await store.uploadArtifact(scope, 'reel-one', bytes, 'text/plain; charset=utf-8');
  assert.equal(reference.contentType, 'text/plain; charset=utf-8');
  assert.deepEqual(await store.downloadArtifact(scope, reference), bytes);
});

test('overlapping readiness checks share one underlying dependency operation', async () => {
  const store = new FirestoreStore({ firestore: fakeFirestore(), bucket: fakeBucket() });
  let resolve;
  let calls = 0;
  store.bucket.getMetadata = () => { calls++; return new Promise(done => { resolve = done; }); };
  const first = store.checkHealth();
  const second = store.checkHealth();
  await new Promise(done => setImmediate(done));
  assert.equal(calls, 1);
  resolve([{}]);
  await Promise.all([first, second]);
  assert.equal(store.healthRequest, null);
});

test('unchanged repository initialization does not rewrite chunks or increment the stored revision', async () => {
  const firestore = fakeFirestore();
  const store = new FirestoreStore({ firestore });
  await store.update('scope:org:brand', () => ({ count: 1 }));
  const before = structuredClone([...firestore.records.entries()]);
  await store.update('scope:org:brand', current => current || { count: 0 });
  assert.deepEqual([...firestore.records.entries()], before);
});

test('SDK boundary: multi-key transaction reads all chunks before writes and atomically rolls back', async () => {
  const firestore = fakeFirestore();
  const run = firestore.runTransaction.bind(firestore);
  firestore.runTransaction = callback => run(async transaction => {
    let writing = false;
    return callback({
      get: (...args) => { assert.equal(writing, false); return transaction.get(...args); },
      getAll: (...args) => { assert.equal(writing, false); return transaction.getAll(...args); },
      set: (...args) => { writing = true; return transaction.set(...args); },
      delete: (...args) => { writing = true; return transaction.delete(...args); },
    });
  });
  const store = new FirestoreStore({ firestore });
  await store.update('native', () => ({ revision: 3, text: 'x'.repeat(300000) }));
  const before = structuredClone([...firestore.records]);
  await assert.rejects(store.transact(['native', 'approval'], () => [{ revision: 4 }, undefined]), { code: 'INVALID_TRANSACTION' });
  assert.deepEqual([...firestore.records], before);
  await store.transact(['native', 'approval'], ([native]) => [native, { nativeRevision: native.revision }]);
  assert.equal((await store.get('approval')).nativeRevision, 3);
  const unchanged = structuredClone([...firestore.records]);
  await store.transact(['native', 'approval'], values => values);
  assert.deepEqual([...firestore.records], unchanged);
  await assert.rejects(store.transact(['native', 'approval'], async values => values), { code: 'INVALID_TRANSACTION' });
  await assert.rejects(store.transact(['native', 'approval'], () => [{ text: 'x'.repeat(4*1024*1024) }, {}]), { code: 'STORE_CAPACITY' });
  assert.deepEqual([...firestore.records], unchanged);
});
