import test from 'node:test';
import assert from 'node:assert/strict';
import {addFile,createPackFileCollection,PACK_LIMITS} from './editor-pack.js';
test('portable file count/encoded byte/per-file budgets reject before base64 accumulation, without double-counting deduplication',()=>{
 const files=createPackFileCollection({...PACK_LIMITS,files:2,bytes:1024,fileBytes:64});
 const first=addFile(files,Buffer.from('first'),'document');addFile(files,Buffer.from('second'),'document');
 assert.equal(addFile(files,Buffer.from('first'),'document'),first);assert.equal(files.length,2);
 assert.throws(()=>addFile(files,Buffer.from('third'),'document'),{status:413});assert.equal(files.length,2);
 const bounded=createPackFileCollection({...PACK_LIMITS,bytes:220,fileBytes:64});
 addFile(bounded,Buffer.alloc(16,1),'document');const before=structuredClone(bounded);
 const next=Buffer.alloc(16,2);let encoded=false;next.toString=()=>{encoded=true;throw Error('must not allocate rejected base64');};
 assert.throws(()=>addFile(bounded,next,'document'),{status:413});assert.equal(encoded,false);assert.deepEqual(bounded,before);
 const oversized=Buffer.alloc(65);oversized.toString=()=>{throw Error('must not encode oversized input');};
 assert.throws(()=>addFile(files,oversized,'document'),{status:413});assert.equal(files.length,2);
});
