import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Readable} from 'node:stream';
import {createDefiantSourceRecordResolver} from './defiant-source-records.js';
const sourceHash='a'.repeat(64),revision='b'.repeat(64),organizationId='sample_org';
const receipt=record=>({id:'r_'+record,sourceHash,member:'invented.csv',record,cells:{Amount:'1'}});
function setup(transform=x=>x){
 const blobs=new Map();const opened=[];
 const partitions=[[2,3],[4,5]].map(([firstRecord,lastRecord])=>{
  const key='block_'+firstRecord;const bytes=Buffer.from(JSON.stringify(transform({organizationId,sourceHash,receipts:[receipt(firstRecord),receipt(lastRecord)]})));
  blobs.set(key,bytes);return {sourceHash,firstRecord,lastRecord,object:{key,generation:'1',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}};
 });
 const resolve=createDefiantSourceRecordResolver({organizationId,partitions,openObject:async pin=>{opened.push(pin.key);return {generation:'1',stream:Readable.from([blobs.get(pin.key)])};}});
 return {resolve,opened,partitions};
}
test('pinned partition resolver returns exact selected rows across blocks',async()=>{
 const {resolve,opened}=setup();const rows=await resolve({organizationId,sourceHash,revision,sourceRecords:[3,4]});
 assert.deepEqual(rows.map(r=>r.record),[3,4]);assert.deepEqual(opened,['block_2','block_4']);
});
test('invalid scope, missing records and duplicate locators fail before I/O',async()=>{
 const {resolve,opened}=setup();
 for(const input of [{organizationId:'other',sourceRecords:[2]},{sourceRecords:[6]},{sourceRecords:[2,2]}])await assert.rejects(resolve({organizationId,sourceHash,revision,...input}),{status:503});
 assert.equal(opened.length,0);
});
test('partition bytes must describe the exact pinned source range',async()=>{
 for(const transform of [x=>({...x,sourceHash:'c'.repeat(64)}),x=>({...x,receipts:x.receipts.slice(1)}),x=>({...x,receipts:[...x.receipts].reverse()})]){
  const {resolve}=setup(transform);await assert.rejects(resolve({organizationId,sourceHash,revision,sourceRecords:[2]}),{status:503});
 }
});
test('overlapping registry ranges fail at construction',()=>{
 const {partitions}=setup();
 assert.throws(()=>createDefiantSourceRecordResolver({organizationId,partitions:[partitions[0],partitions[0]],openObject:async()=>{}}),/Overlapping/);
});
test('cumulative source byte budget fails before opening sparse shards',async()=>{
 let opened=0;
 const partitions=Array.from({length:5},(_,i)=>({sourceHash,firstRecord:i+2,lastRecord:i+2,object:{key:'block_'+i,generation:'1',bytes:8*1024*1024,sha256:'c'.repeat(64)}}));
 const resolve=createDefiantSourceRecordResolver({organizationId,partitions,openObject:async()=>{opened++;}});
 await assert.rejects(resolve({organizationId,sourceHash,revision,sourceRecords:[2,3,4,5,6]}),{status:503});assert.equal(opened,0);
});
test('invalid unselected row numbering invalidates the entire shard',async()=>{
 const {resolve}=setup(x=>({...x,receipts:[x.receipts[0],{...x.receipts[1],record:99}]}));
 await assert.rejects(resolve({organizationId,sourceHash,revision,sourceRecords:[2]}),{status:503});
});
test('service selection reads cells through pinned partition integrity loaders',async()=>{
 const {createDefiantEvidenceService}=await import('./defiant-evidence.js');
 const {resolve}=setup();
 const service=createDefiantEvidenceService({organizationId,authorize:actor=>actor==='allowed',loadSourceRecords:resolve,loadSnapshot:async()=>({schemaVersion:1,organizationId,coverage:'Invented full resolver contract',months:[],receipts:[],selections:[{id:'group_a',label:'Invented group',sourceHash,amount:'2',currency:'USD',sourceRecords:[3,4]}]})});
 const manifest=await service.read('allowed');
 const result=await service.read('allowed',{resource:'selection-receipts',selectionId:'group_a',revision:manifest.revision});
 assert.deepEqual(result.receipts.map(r=>r.record),[3,4]);assert.equal(result.receipts[0].cells.Amount,'1');
});
