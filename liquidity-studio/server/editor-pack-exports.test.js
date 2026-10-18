import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {projectFinalPngs,validateFinalPng} from './editor-pack-exports.js';
import {digest} from './editor-pack.js';
async function fixture(){
 const bytes=await sharp({create:{width:1080,height:1350,channels:3,background:'#f2a93b'}}).png().toBuffer();
 const receipt={eventId:'completed-event',artifactId:'a'.repeat(64),nativeId:'native',reviewRevision:3,sha256:digest(bytes),size:bytes.length,mime:'image/png',pageIndex:0,exportedAt:'2026-10-18T00:00:00Z',signedOffBy:'original-approver',completedBy:'original-operator'};
 const stage={...receipt,nativeRevision:2,reference:{key:'private-key'},fingerprint:'private-fingerprint',signoff:{actorId:receipt.signedOffBy,envelope:{nonce:'not-portable',mac:'not-portable'}}};
 return {bytes,receipt,stage};
}
test('completed native PNG projection preserves exact final pixels and historical humans without callback authority',async()=>{
 const f=await fixture();
 const result=await projectFinalPngs({nativeId:'native',format:'infographic',receipts:[f.receipt],loadStage:async()=>f.stage,loadBytes:async()=>f.bytes});
 assert.equal(result[0].authority,'historical-only');assert.deepEqual(result[0].bytes,f.bytes);assert.deepEqual(result[0].receipt,f.receipt);
 assert.equal(result[0].width,1080);assert.equal(result[0].nativeRevision,2);
 for(const key of ['reference','fingerprint','signoff','nonce','mac'])assert.equal(JSON.stringify(result).includes('"'+key+'"'),false);
});
test('completed native PNG projection rejects missing/mismatched stages, corruption, wrong page dimensions and callback extensions',async()=>{
 const f=await fixture(),base={nativeId:'native',format:'infographic',receipts:[f.receipt],loadStage:async()=>f.stage,loadBytes:async()=>f.bytes};
 await assert.rejects(projectFinalPngs({...base,loadStage:async()=>null}));
 await assert.rejects(projectFinalPngs({...base,loadStage:async()=>({...f.stage,pageIndex:1})}));
 await assert.rejects(projectFinalPngs({...base,loadBytes:async()=>Buffer.from('corrupt')}));
 await assert.rejects(validateFinalPng(f.bytes,f.receipt,{nativeId:'native',format:'story'}));
 await assert.rejects(validateFinalPng(f.bytes,{...f.receipt,nonce:'authority'},{nativeId:'native',format:'infographic'}));
});
