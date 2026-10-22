import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefiantEvidenceService} from './defiant-evidence.js';
const sourceHash = 'a'.repeat(64);
const fixture = () => ({schemaVersion: 1, organizationId: 'sample_org', coverage: 'Invented contract fixture only', months: [{month: '2025-01', currency: 'USD', amount: '-0.000001', metric: 'source-total-earned', sourceHash, receiptIds: ['sample_receipt']}], receipts: [{id: 'sample_receipt', sourceHash, member: 'invented.csv', record: 2, cells: {'Total Earned': '-0.000001', Currency: 'USD'}}]});
const make = (options = {}) => createDefiantEvidenceService({organizationId: 'sample_org', authorize: actor => actor === 'allowed', loadSnapshot: async () => fixture(), ...options});
test('evidence preserves exact signed decimals and supplies a revision-bound receipt', async () => {
 const service = make();
 const manifest = await service.read('allowed');
 assert.equal(manifest.months, undefined);
 const earnings = await service.read('allowed', {resource: 'earnings', revision: manifest.revision});
 assert.equal(earnings.items[0].amount, '-0.000001');
 const result = await service.read('allowed', {resource: 'receipt', receiptId: earnings.items[0].receiptIds[0], revision: manifest.revision});
 assert.equal(result.receipt.cells['Total Earned'], '-0.000001');
 assert.equal(result.capabilities.canActivate, false);
});
test('denial occurs before private loading and revocation is checked after loading', async () => {
 let loads = 0;
 const denied = make({loadSnapshot: async () => {loads++; return fixture();}});
 await assert.rejects(denied.read('other'), {status: 403});
 assert.equal(loads, 0);
 let authorized = true;
 const revoked = make({authorize: () => authorized, loadSnapshot: async () => {authorized = false; return fixture();}});
 await assert.rejects(revoked.read('allowed'), {status: 403});
});
test('stale revision and wrong-scope snapshots cannot return receipts', async () => {
 await assert.rejects(make().read('allowed', {resource: 'receipt', receiptId: 'sample_receipt', revision: 'b'.repeat(64)}), {status: 409});
 await assert.rejects(make({loadSnapshot: async () => ({...fixture(), organizationId: 'other'})}).read('allowed'), {status: 503});
 await assert.rejects(make().read('allowed', {resource: 'receipt', receiptId: 'sample_receipt'}), {status: 400});
});
test('malformed amounts, duplicate periods and mismatched receipt sources fail closed', async () => {
 for (const mutate of [x => {x.months[0].amount = 'NaN';}, x => {x.months.push({...x.months[0]});}, x => {x.receipts[0].sourceHash = 'b'.repeat(64);}]) {
  const data = fixture(); mutate(data);
  await assert.rejects(make({loadSnapshot: async () => data}).read('allowed'), {status: 503});
 }
});
test('caller paths and unknown keys are rejected before loading', async () => {
 let loads = 0; const service = make({loadSnapshot: async () => {loads++; return fixture();}});
 await assert.rejects(service.read('allowed', {path: '/private/source'}), {status: 400});
 assert.equal(loads, 0);
});

import {createHash} from 'node:crypto';
import {Readable} from 'node:stream';
import {createDefiantEvidenceLoader} from './defiant-evidence-loader.js';
test('pinned loader validates exact generation, bytes and hash before parsing', async () => {
 const bytes = Buffer.from(JSON.stringify(fixture()));
 const object = {key: 'invented/snapshot.json', generation: '1', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')};
 const makeLoader = openObject => createDefiantEvidenceLoader({organizationId: 'sample_org', object, openObject});
 const loader = makeLoader(async pinned => {assert.deepEqual(pinned, object); return {generation: '1', stream: Readable.from([bytes])};});
 assert.equal((await loader({organizationId: 'sample_org'})).schemaVersion, 1);
 for (const response of [
  {generation: '2', stream: Readable.from([bytes])},
  {generation: '1', stream: Readable.from([bytes, Buffer.from('x')])},
  {generation: '1', stream: Readable.from([Buffer.alloc(bytes.length, 32)])},
  {generation: '1', stream: Readable.from([bytes.subarray(1)])}
 ]) await assert.rejects(makeLoader(async () => response)({organizationId: 'sample_org'}), {status: 503});
 let opened = false;
 await assert.rejects(makeLoader(async () => {opened = true;})({organizationId: 'other'}), {status: 503});
 assert.equal(opened, false);
});
test('currency must be a string in both product and request', async () => {
 const data = fixture(); data.months[0].currency = ['USD'];
 await assert.rejects(make({loadSnapshot: async () => data}).read('allowed'), {status: 503});
 await assert.rejects(make().read('allowed', {resource: 'earnings', currency: ['USD']}), {status: 400});
});
test('loader bounds stream chunk count independently of byte count', async () => {
 const bytes = Buffer.from(JSON.stringify(fixture()));
 async function* chunks() {for (let i = 0; i < 65537; i++) yield Buffer.alloc(0); yield bytes;}
 const loader = createDefiantEvidenceLoader({organizationId: 'sample_org', object: {key: 'sample.json', generation: '1', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')}, openObject: async () => ({generation: '1', stream: chunks()})});
 await assert.rejects(loader({organizationId: 'sample_org'}), {status: 503});
});
test('pinned loader rejects malformed encodings and closes every opened stream', async () => {
 for (const bytes of [Buffer.from([0xff]), Buffer.from('{broken'), Buffer.from(JSON.stringify({organizationId: 'other'}))]) {
  const stream = Readable.from([bytes]);
  const loader = createDefiantEvidenceLoader({organizationId: 'sample_org', object: {key: 'sample.json', generation: '1', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')}, openObject: async () => ({generation: '1', stream})});
  await assert.rejects(loader({organizationId: 'sample_org'}), {status: 503});
  assert.equal(stream.destroyed, true);
 }
});
test('pinned loader accepts fragmented bytes without changing multibyte receipt cells', async () => {
 const data = fixture(); data.receipts[0].cells = {Title: 'Café 🎵'};
 const bytes = Buffer.from(JSON.stringify(data));
 const stream = Readable.from(Array.from(bytes, value => Buffer.from([value])));
 const loader = createDefiantEvidenceLoader({organizationId: 'sample_org', object: {key: 'sample.json', generation: '1', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')}, openObject: async () => ({generation: '1', stream})});
 assert.deepEqual(await loader({organizationId: 'sample_org'}), data);
 assert.equal(stream.destroyed, true);
});

import {createDefiantGcsOpener} from './defiant-evidence-gcs.js';
test('GCS opener pins media generation and preserves original bytes', async () => {
 const stream = Readable.from([Buffer.from('sample')]); const calls = [];
 const open = createDefiantGcsOpener({bucket: {file: (key, options) => {calls.push({key, options}); return {createReadStream: options => {calls.push(options); return stream;}};}}});
 const opened = await open({key: 'evidence/sample.json', generation: '123'});
 assert.equal(opened.generation, '123');
 assert.deepEqual(calls, [{key: 'evidence/sample.json', options: {generation: '123'}}, {validation: 'crc32c', decompress: false}]);
 for await (const chunk of opened.stream) assert.equal(chunk.toString(), 'sample');
});
test('GCS opener destroys a stalled media stream at its deadline', async () => {
 const stream = new Readable({read() {}});
 const open = createDefiantGcsOpener({bucket: {file: () => ({createReadStream: () => stream})}, timeoutMs: 10});
 const opened = await open({key: 'evidence/sample.json', generation: '123'});
 await assert.rejects(async () => {for await (const chunk of opened.stream) void chunk;}, /deadline exceeded/);
 assert.equal(stream.destroyed, true);
});

test('aggregate selections page all locators at one revision and expose only bounded summaries', async () => {
 const data = fixture(); data.selections = [{id: 'group_a', label: 'Invented group', sourceHash, amount: '1.25', currency: 'USD', sourceRecords: [2, 4, 8]}];
 const service = make({loadSnapshot: async () => data});
 const manifest = await service.read('allowed');
 const listed = await service.read('allowed', {resource: 'selections', revision: manifest.revision});
 assert.equal(listed.items[0].rowCount, 3); assert.equal(listed.items[0].sourceRecords, undefined);
 const first = await service.read('allowed', {resource: 'selection', selectionId: 'group_a', revision: manifest.revision, limit: 2});
 assert.deepEqual(first.sourceRecords, [2, 4]); assert.equal(first.nextOffset, 2);
 const last = await service.read('allowed', {resource: 'selection', selectionId: 'group_a', revision: manifest.revision, offset: first.nextOffset, limit: 2});
 assert.deepEqual(last.sourceRecords, [8]); assert.equal(last.nextOffset, null);
 await assert.rejects(service.read('allowed', {resource: 'selection', selectionId: 'group_a'}), {status: 400});
 data.selections[0].sourceRecords.push(9);
 await assert.rejects(service.read('allowed', {resource: 'selection', selectionId: 'group_a', revision: manifest.revision}), {status: 409});
});
test('aggregate selections reject duplicate, unordered, nonintegral and header record locators', async () => {
 for (const sourceRecords of [[2,2], [3,2], [2,2.5], [1,2]]) {
  const data = fixture(); data.selections = [{id:'group_a',label:'Invented group',sourceHash,amount:'1',currency:'USD',sourceRecords}];
  await assert.rejects(make({loadSnapshot: async () => data}).read('allowed'), {status: 503});
 }
});

test('source-cell pages bind to exact selection, hash and current authority', async () => {
 const data = fixture(); data.selections = [{id:'group_a',label:'Invented group',sourceHash,amount:'1',currency:'USD',sourceRecords:[2,4]}];
 const requests = []; let allowed = true;
 const service = make({authorize: () => allowed, loadSnapshot: async () => data, loadSourceRecords: async request => {
  requests.push(request); return request.sourceRecords.map(record => ({id:'r_'+record,sourceHash,member:'sample.csv',record,cells:{Amount:'0.5'}}));
 }});
 const {revision} = await service.read('allowed');
 const result = await service.read('allowed',{resource:'selection-receipts',selectionId:'group_a',revision,limit:1});
 assert.deepEqual(requests[0],{organizationId:'sample_org',sourceHash,sourceRecords:[2],revision});
 assert.equal(result.receipts[0].record,2);assert.equal(result.nextOffset,1);
 const revoked = make({authorize: () => allowed,loadSnapshot:async()=>data,loadSourceRecords:async()=>{allowed=false;return [{id:'r_2',sourceHash,member:'sample.csv',record:2,cells:{Amount:'0.5'}}];}});
 await assert.rejects(revoked.read('allowed',{resource:'selection-receipts',selectionId:'group_a',revision,limit:1}),{status:403});
});
test('source-cell pages reject wrong source, missing and reordered records', async () => {
 const data=fixture();data.selections=[{id:'group_a',label:'Invented group',sourceHash,amount:'1',currency:'USD',sourceRecords:[2,4]}];
 const receipt=record=>({id:'r_'+record,sourceHash,member:'sample.csv',record,cells:{Amount:'0.5'}});
 for(const rows of [[],[receipt(4),receipt(2)],[{...receipt(2),sourceHash:'b'.repeat(64)},receipt(4)]]) {
  const service=make({loadSnapshot:async()=>data,loadSourceRecords:async()=>rows});const {revision}=await service.read('allowed');
  await assert.rejects(service.read('allowed',{resource:'selection-receipts',selectionId:'group_a',revision}),{status:503});
 }
});
