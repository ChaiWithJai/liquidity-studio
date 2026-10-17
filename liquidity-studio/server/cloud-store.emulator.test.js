import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { FirestoreStore } from './cloud-store.js';

const host = process.env.FIRESTORE_EMULATOR_HOST;
if (host && !/^(127\.0\.0\.1|localhost):\d+$/.test(host)) throw new Error('Contract tests may only connect to a loopback Firestore emulator');

test('real Firestore emulator: restart, concurrent transactions, chunk shrink, scope keys and deletion', { skip: !host, timeout: 60000 }, async () => {
  const { Firestore } = await import('@google-cloud/firestore');
  const collection = `contract_${randomUUID().replaceAll('-', '')}`;
  const first = new FirestoreStore({ firestore: new Firestore({ projectId: 'liquidity-emulator-contract' }), collection });
  const key = 'scope:org-one:brand-one';
  const secondKey = 'scope:org-two:brand-one';
  await first.update(key, () => ({ text: '漢字'.repeat(100000), count: 0 }));
  await first.update(secondKey, () => ({ count: 9 }));
  await first.close();

  const second = new FirestoreStore({ firestore: new Firestore({ projectId: 'liquidity-emulator-contract' }), collection });
  try {
    assert.equal((await second.get(key)).text.length, 200000);
    await Promise.all(Array.from({ length: 12 }, () => second.update(key, value => ({ count: value.count + 1 }))));
    assert.deepEqual(await second.get(key), { count: 12 });
    const beforeRevision = (await second.ref(key).get()).data().revision;
    await second.update(key, current => current);
    assert.equal((await second.ref(key).get()).data().revision, beforeRevision);
    assert.deepEqual(await second.keys('scope:org-one:'), [key]);
    assert.deepEqual(await second.get(secondKey), { count: 9 });
    await assert.rejects(second.update(key, () => { throw new Error('cancel operation'); }), /cancel operation/);
    assert.deepEqual(await second.get(key), { count: 12 });
    await second.delete(key);
    assert.equal(await second.get(key), null);
    assert.deepEqual(await second.keys('scope:org-two:'), [secondKey]);
  } finally {
    await second.delete(key);
    await second.delete(secondKey);
    await second.close();
  }
});
