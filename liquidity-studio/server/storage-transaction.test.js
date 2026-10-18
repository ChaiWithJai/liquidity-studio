import test from 'node:test';
import assert from 'node:assert/strict';
import { DurableStore } from './storage.js';

test('multi-record commit compares current source and native revisions and preserves unrelated records', () => {
  const store = new DurableStore(':memory:');
  try {
    store.update('source', () => ({ revision: 2 }));
    store.update('native', () => ({ revision: 3 }));
    store.update('unrelated', () => ({ preserved: true }));
    const result = store.transact(['source', 'native', 'approval'], ([source, native, approval]) => {
      assert.equal(approval, null);
      assert.equal(source.revision, 2);
      assert.equal(native.revision, 3);
      return [source, native, { sourceRevision: 2, nativeRevision: 3 }];
    });
    assert.deepEqual(result[2], store.get('approval'));
    result[2].sourceRevision = 100;
    assert.equal(store.get('approval').sourceRevision, 2);
    assert.deepEqual(store.get('unrelated'), { preserved: true });
    store.update('native', () => ({ revision: 4 }));
    assert.throws(() => store.transact(['source', 'native', 'approval'], ([source, native]) => {
      if (native.revision !== 3) throw new Error('stale native revision');
      return [source, native, {}];
    }), /stale native revision/);
    assert.equal(store.get('approval').nativeRevision, 3);
  } finally { store.close(); }
});

test('invalid multi-record callbacks and capacity errors never partially commit', () => {
  const store = new DurableStore(':memory:');
  try {
    store.update('a', () => ({ value: 1 }));
    for (const callback of [() => undefined, () => Promise.resolve([{}, {}]), () => [{}], () => [{}, undefined], () => [{}, { big: 'x'.repeat(4 * 1024 * 1024) }], () => { throw new Error('abort'); }]) {
      assert.throws(() => store.transact(['a', 'b'], callback));
      assert.deepEqual(store.get('a'), { value: 1 });
      assert.equal(store.get('b'), null);
    }
    for (const keys of [[], ['a', 'a'], [''], ['x'.repeat(513)], Array.from({length: 9}, (_, i) => String(i))]) assert.throws(() => store.transact(keys, () => []));
    assert.deepEqual(store.transact(['a'], ([a]) => [a]), [{ value: 1 }]);
  } finally { store.close(); }
});
