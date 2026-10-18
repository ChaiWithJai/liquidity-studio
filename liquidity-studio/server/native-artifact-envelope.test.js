import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {generateKeyPairSync,createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {seal,open} from '../scripts/native-artifact-envelope.mjs';
const keys=()=>generateKeyPairSync('rsa',{modulusLength:3072,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
test('recipient envelope preserves exact archive and rejects tampering without retaining plaintext',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'native-envelope-'));try{
 const k=keys(),input=path.join(dir,'input'),output=path.join(dir,'sealed'),envelope=path.join(dir,'envelope'),privateKeyFile=path.join(dir,'key'),restored=path.join(dir,'restored');
 fs.writeFileSync(input,Buffer.from('native bytes\u0000exact archive'));fs.writeFileSync(privateKeyFile,k.privateKey,{mode:0o600});
 const {createPublicKey}=await import('node:crypto');const recipientSha256=createHash('sha256').update(createPublicKey(k.publicKey).export({type:'spki',format:'der'})).digest('hex');
 await assert.rejects(seal({input,output,envelope,publicPem:k.publicKey,recipientSha256:'0'.repeat(64)}),/fingerprint/);assert.equal(fs.existsSync(output),false);
 await seal({input,output,envelope,publicPem:k.publicKey,recipientSha256});await open({input:output,output:restored,envelope,privateKeyFile});assert.deepEqual(fs.readFileSync(restored),fs.readFileSync(input));assert.equal(fs.statSync(restored).mode&0o077,0);
 const broken=fs.readFileSync(output);broken[0]^=1;fs.writeFileSync(output,broken);const rejected=path.join(dir,'rejected');await assert.rejects(open({input:output,output:rejected,envelope,privateKeyFile}));assert.equal(fs.existsSync(rejected),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('operator CLI resolves a symlinked entrypoint and reports invalid invocation',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'native-envelope-cli-'));
 try{
  const entry=path.join(dir,'operator.mjs');
  fs.symlinkSync(fileURLToPath(new URL('../scripts/native-artifact-envelope.mjs',import.meta.url)),entry);
  const result=spawnSync(process.execPath,[entry],{encoding:'utf8'});
  assert.equal(result.status,1);
  assert.match(result.stderr,/Use seal input output envelope/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
