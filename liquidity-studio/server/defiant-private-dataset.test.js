import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, chmod, symlink, rm, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadDefiantPrivateDataset } from './defiant-private-dataset.js';
const fixture = { organizationId: 'fictional_local', dataset: { dataset: { id: 'fictional', label: 'Fictional private process', provenance: 'synthetic', asOf: null }, artists: [], tracks: [], sources: [], campaigns: [], opportunities: [] } };
async function setup(t) {
 const dir = await mkdtemp(join(tmpdir(), 'defiant-private-contract-'));await chmod(dir,0o700);t.after(()=>rm(dir,{recursive:true,force:true}));
 const file=join(dir,'dataset.json');await writeFile(file,JSON.stringify(fixture),{mode:0o600});return {dir,file};
}
test('private envelope reads once and current guard revokes replacement without leaking data',async t=>{
 const {dir,file}=await setup(t),loaded=await loadDefiantPrivateDataset(file);
 assert.equal(loaded.organizationId,'fictional_local');assert.equal(loaded.dataset.dataset.provenance,'synthetic');assert.equal(await loaded.isCurrent(),true);
 const replacement=join(dir,'replacement');await writeFile(replacement,JSON.stringify(fixture),{mode:0o600});await rename(replacement,file);
 assert.equal(await loaded.isCurrent(),false);
});
test('rejects broad permissions, symlinks, unknown envelope keys and unbounded input',async t=>{
 const {dir,file}=await setup(t);
 await chmod(file,0o644);await assert.rejects(loadDefiantPrivateDataset(file));await chmod(file,0o600);
 const link=join(dir,'link');await symlink(file,link);await assert.rejects(loadDefiantPrivateDataset(link));
 await chmod(dir,0o755);await assert.rejects(loadDefiantPrivateDataset(file));await chmod(dir,0o700);
 await writeFile(file,JSON.stringify({...fixture,actor:'founder'}));await assert.rejects(loadDefiantPrivateDataset(file));
 await writeFile(file,' '.repeat(4*1024*1024+1));await assert.rejects(loadDefiantPrivateDataset(file));
 await assert.rejects(loadDefiantPrivateDataset('relative.json'));
});
test('current owner-only guard fails closed after permission change or deletion',async t=>{
 const {file}=await setup(t),loaded=await loadDefiantPrivateDataset(file);await chmod(file,0o644);assert.equal(await loaded.isCurrent(),false);await rm(file);assert.equal(await loaded.isCurrent(),false);
});
