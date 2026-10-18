import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {verifyNativeOutputs} from '../scripts/package-native-editor-artifact.mjs';

test('private editor packaging binds actual output bytes and requires the worker WASM graph',async t=>{
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'native-artifact-'));
 t.after(()=>fs.rm(directory,{recursive:true,force:true}));
 const manifest={version:1,privateOnly:true,files:[]};
 for(const [name,content] of Object.entries({'native-editor-frame.html':'<div>controlled fixture</div>','native-editor-license.txt':'controlled license fixture','assets/kernel.wasm':'non-executable fixture'})){
  await fs.mkdir(path.dirname(path.join(directory,name)),{recursive:true});await fs.writeFile(path.join(directory,name),content);
  manifest.files.push({path:name,size:Buffer.byteLength(content),sha256:createHash('sha256').update(content).digest('hex')});
 }
 assert.equal(verifyNativeOutputs(directory,manifest).length,3);
 assert.throws(()=>verifyNativeOutputs(directory,{...manifest,files:manifest.files.filter(file=>!file.path.endsWith('.wasm'))}),/WASM required/);
 await fs.writeFile(path.join(directory,'assets/kernel.wasm'),'changed');
 assert.throws(()=>verifyNativeOutputs(directory,manifest),/mismatch/);
});

test('private editor output manifest cannot smuggle model weights or outside paths',()=>{
 for(const file of ['model.onnx','../operator.json','assets/not-a-model.onnx']){
  assert.throws(()=>verifyNativeOutputs('/unused',{version:1,privateOnly:true,files:[{path:file}]}),/Unexpected native output path/);
 }
});
