import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {nativeBridgeSources,localNativeDevelopment} from '../scripts/local-native-development.mjs';
import {parseLocalArguments} from '../scripts/local-development-support.mjs';
const app=fileURLToPath(new URL('../',import.meta.url)),sha=x=>createHash('sha256').update(x).digest('hex');
async function artifact(t){const directory=await fs.mkdtemp(path.join(tmpdir(),'local-native-assets-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));await fs.mkdir(path.join(directory,'assets'));
 const content={'native-editor-frame.html':'<!doctype html><div id="native-root"></div>','native-editor-license.txt':'Controlled test license placeholder, not an upstream license','assets/worker-abc.js':'/* controlled worker fixture; never executed */','assets/runtime-abc.wasm':'controlled-non-executable-bytes'};
 const files=[];for(const [name,bytes] of Object.entries(content)){await fs.writeFile(path.join(directory,name),bytes);files.push({path:name,size:Buffer.byteLength(bytes),sha256:sha(bytes)});}
 const sources=Object.fromEntries(await Promise.all(nativeBridgeSources.map(async name=>[name,sha(await fs.readFile(path.join(app,name)))])));const manifest={version:1,privateOnly:true,upstreamPin:'27b6f68221fdbf1ef1bedc182e303210ca9e39f5',sources,files};
 const save=()=>fs.writeFile(path.join(directory,'studio-native-assets.json'),JSON.stringify(manifest),{mode:0o600});await save();return {directory,manifest,save};}
test('local image editor opts in explicitly and serves only current inventoried assets with worker WASM policy',async t=>{
 const previous=process.env.NODE_ENV;process.env.NODE_ENV='development';t.after(()=>{if(previous===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previous;});
 assert.equal(await localNativeDevelopment(),null);await assert.rejects(()=>localNativeDevelopment({modelPath:'/owned/model'}),/requires --native-assets/);
 const f=await artifact(t),native=await localNativeDevelopment({assetsDirectory:f.directory});assert.equal(native.has('/private-secret.json'),false);assert.equal(native.has('/assets/worker-abc.js'),true);await assert.rejects(()=>native.model.manifest(),/unavailable/);
 const headers={},response={setHeader:(k,v)=>headers[k]=v,writeHead:(status,h)=>{headers.status=status;Object.assign(headers,h);},end:bytes=>headers.bytes=bytes};native.serve({method:'GET'},response,'/assets/worker-abc.js');assert.equal(headers.status,200);assert.match(headers['Content-Security-Policy'],/wasm-unsafe-eval/);assert.match(headers['Content-Security-Policy'],/(?:^|;) media-src 'self' blob:;/);assert.doesNotMatch(headers['Content-Security-Policy'],/media-src[^;]*(?:https?:|\*)/);assert.equal(headers['Cache-Control'],'no-store');
 await fs.writeFile(path.join(f.directory,'assets/worker-abc.js'),'changed');assert.throws(()=>native.serve({method:'GET'},response,'/assets/worker-abc.js'),/changed/);
});
test('local native artifacts reject stale sources, escaping paths, missing graph and deployment use',async t=>{
 const previous=process.env.NODE_ENV;process.env.NODE_ENV='development';t.after(()=>{if(previous===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previous;});const f=await artifact(t);
 f.manifest.sources[nativeBridgeSources[0]]='0'.repeat(64);await f.save();await assert.rejects(()=>localNativeDevelopment({assetsDirectory:f.directory}),/stale/);
 f.manifest.sources[nativeBridgeSources[0]] = sha(await fs.readFile(path.join(app, nativeBridgeSources[0]))); await f.save();
 f.manifest.files[0].path='../secret';await f.save();await assert.rejects(()=>localNativeDevelopment({assetsDirectory:f.directory}),/manifest entry/);
 const missing=await artifact(t);missing.manifest.files=missing.manifest.files.filter(f=>!f.path.endsWith('.wasm'));await missing.save();await assert.rejects(()=>localNativeDevelopment({assetsDirectory:missing.directory}),/WASM graph required/);
 process.env.NODE_ENV='production';await assert.rejects(()=>localNativeDevelopment({assetsDirectory:f.directory}),/developer launcher/);
 assert.deepEqual(parseLocalArguments(['--native-assets','/private/dist','--cutout-model','/private/model']),{profile:'development',port:3002,check:false,nativeAssetsDirectory:'/private/dist',cutoutModelPath:'/private/model'});assert.throws(()=>parseLocalArguments(['--cutout-model','/private/model']),/requires/);assert.throws(()=>parseLocalArguments(['--native-assets']),/path required/);
});
test('actual local wrapper requires its profile session before serving private native code',async t=>{
 const previous={...process.env};process.env.NODE_ENV='development';t.after(()=>{for(const key of Object.keys(process.env))if(!(key in previous))delete process.env[key];Object.assign(process.env,previous);});
 const f=await artifact(t),home=await fs.mkdtemp(path.join(tmpdir(),'native-local-home-'));t.after(()=>fs.rm(home,{recursive:true,force:true}));
 const {createDevelopmentServer}=await import('../scripts/local-development-support.mjs');
 const runtime=await createDevelopmentServer({profile:'development',port:0,home,nativeAssetsDirectory:f.directory});t.after(()=>runtime.close());
 const anonymous=await fetch(runtime.origin+'/native-editor-frame.html');assert.equal(anonymous.status,401);
 const login=await fetch(runtime.origin+'/__dev/session',{method:'POST',redirect:'manual',headers:{Origin:runtime.origin,'Content-Type':'application/x-www-form-urlencoded'},body:'persona=founder'});assert.equal(login.status,303);const cookie=login.headers.get('set-cookie').split(';')[0];
 const frame=await fetch(runtime.origin+'/native-editor-frame.html',{headers:{Cookie:cookie}});assert.equal(frame.status,200);assert.match(frame.headers.get('content-security-policy'),/wasm-unsafe-eval/);assert.match(frame.headers.get('content-security-policy'),/(?:^|;) media-src 'self' blob:;/);assert.match(await frame.text(),/native-root/);
 const bootstrap=await fetch(runtime.origin+'/api/studio/bootstrap?organizationId=org_default&brandId=brand_default',{headers:{Cookie:cookie}});assert.equal(bootstrap.status,200);assert.equal((await bootstrap.json()).operatorCapabilities.nativeEditor,true);
 const hidden=await fetch(runtime.origin+'/studio-native-assets.json',{headers:{Cookie:cookie}});assert.notEqual(hidden.status,200,'the private filesystem manifest is never served');
});
