// Local developer asset serving only. No model URL, download or upstream source distribution.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createNativeCutoutModel} from '../server/native-cutout-model.js';
export const nativeBridgeSources = [
 'src/lib/native-editor-frame.js','src/lib/native-editor-mount.jsx','src/lib/native-editor-adapter.js',
 'src/lib/native-editor-broker.js','src/lib/native-cutout-availability.js','src/lib/native-editor-size-presets.js','src/lib/native-cutout-remover.js','src/lib/modnet-worker.js',
 'src/lib/modnet-worker-client.js','src/lib/modnet-model-cache.js','src/lib/modnet-processor.js',
 'server/native-audio.js','server/native-cutout-contract.js','vite.config.js','native-editor-frame.html','scripts/build-dist.js','package.json','scripts/native-editor-vite.js','src/lib/native-webm-duration.ts','../docs/specs/doory-host-source-inventory.json','../scripts/investigations/doory-webm-duration/webm-duration.patch','package-lock.json',
];
const app=fileURLToPath(new URL('../',import.meta.url));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const allowed=relative=>relative==='native-editor-frame.html'||relative==='native-editor-license.txt'||/^assets\/[A-Za-z0-9_.-]+\.(?:js|mjs|css|wasm)$/.test(relative);
function regular(file,max){const stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>max)throw Error('Invalid private native asset');return stat;}
export async function localNativeDevelopment({assetsDirectory,modelPath}={}) {
 if(modelPath&&!assetsDirectory)throw Error('--cutout-model requires --native-assets');
 if(!assetsDirectory)return null;
 if(process.env.NODE_ENV!=='development'||process.env.K_SERVICE)throw Error('Local native assets require the developer launcher');
 if(!path.isAbsolute(assetsDirectory)||!fs.lstatSync(assetsDirectory).isDirectory()||fs.lstatSync(assetsDirectory).isSymbolicLink())throw Error('Absolute real private native asset directory required');
 const directory=fs.realpathSync(assetsDirectory),manifestPath=path.join(directory,'studio-native-assets.json');regular(manifestPath,256*1024);
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 if(manifest.version!==1||manifest.privateOnly!==true||manifest.upstreamPin!=='27b6f68221fdbf1ef1bedc182e303210ca9e39f5'||!manifest.sources||!Array.isArray(manifest.files)||manifest.files.length>512)throw Error('Current private native asset manifest required');
 for(const source of nativeBridgeSources)if(manifest.sources[source]!==digest(fs.readFileSync(path.join(app,source))))throw Error('Private native assets are stale; obtain the matching artifact');
 const files=new Map();let total=0;
 for(const entry of manifest.files){if(!entry||!allowed(entry.path)||files.has(entry.path)||!Number.isSafeInteger(entry.size)||entry.size<0||entry.size>64*1024*1024||!/^[a-f0-9]{64}$/.test(entry.sha256))throw Error('Invalid native asset manifest entry');
  const file=path.join(directory,entry.path);if(fs.realpathSync(file)!==file||regular(file,64*1024*1024).size!==entry.size||digest(fs.readFileSync(file))!==entry.sha256)throw Error('Private native asset bytes do not match');
  total+=entry.size;if(total>256*1024*1024)throw Error('Private native assets exceed the local bound');files.set('/'+entry.path,{...entry,file});
 }
 if(!files.has('/native-editor-frame.html')||!files.has('/native-editor-license.txt')||!manifest.files.some(f=>f.path.endsWith('.wasm')))throw Error('Private native frame, license and WASM graph required');
 const model=createNativeCutoutModel({enabled:!!modelPath,path:modelPath});if(modelPath){if(!path.isAbsolute(modelPath))throw Error('Absolute owned cutout model path required');await model.manifest();}
 return {model,has:pathname=>files.has(pathname),serve(req,res,pathname){const entry=files.get(pathname);if(!entry)return false;if(req.method!=='GET'){res.writeHead(405);res.end();return true;}
  // Recheck each immutable file before sending, so changed assets fail without fallback.
  regular(entry.file,64*1024*1024);const bytes=fs.readFileSync(entry.file);if(bytes.length!==entry.size||digest(bytes)!==entry.sha256)throw Error('Private native asset changed');
  const types={'.html':'text/html; charset=utf-8','.txt':'text/plain; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.wasm':'application/wasm'};
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' blob:; worker-src 'self' blob:; media-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'self'");
  res.writeHead(200,{'Content-Type':types[path.extname(entry.file)],'Cache-Control':'no-store'});res.end(bytes);return true;
 }};
}
