import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DurableStore } from './storage.js';
test('transactional records survive reopen and restore without losing independent changes', () => {
 const directory = fs.mkdtempSync(path.join(os.tmpdir(),'liquidity-store-'));
 try {
  const filename=path.join(directory,'data.sqlite'); let store=new DurableStore(filename);
  store.update('org:a:brand:b', value => ({...value,draft:'human edit'}));
  store.update('org:a:brand:b', value => ({...value,day:'Monday'}));
  store.backup(path.join(directory,'backup.sqlite'));store.close();
  store=new DurableStore(filename);assert.deepEqual(store.get('org:a:brand:b'),{draft:'human edit',day:'Monday'});
  assert.equal(store.get('org:x:brand:b'),null);store.close();
  const restored=new DurableStore(path.join(directory,'backup.sqlite'));assert.equal(restored.get('org:a:brand:b').draft,'human edit');restored.close();
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
