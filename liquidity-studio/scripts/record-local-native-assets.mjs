// Run only after an explicitly approved private native artifact build, normally hosted.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {nativeBridgeSources} from './local-native-development.mjs';
const app=fileURLToPath(new URL('../',import.meta.url)),directory=process.argv[2];
if(!path.isAbsolute(directory||'')||process.argv.length!==3)throw Error('Pass the private native build output directory');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');const sources=Object.fromEntries(nativeBridgeSources.map(name=>[name,sha(fs.readFileSync(path.join(app,name)))]));
const names=['native-editor-frame.html','native-editor-license.txt',...fs.readdirSync(path.join(directory,'assets')).filter(name=>/^[A-Za-z0-9_.-]+\.(?:js|mjs|css|wasm)$/.test(name)).map(name=>'assets/'+name)];
const files=names.sort().map(name=>{const file=path.join(directory,name),stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('Regular native artifact files required');const bytes=fs.readFileSync(file);return {path:name,size:bytes.length,sha256:sha(bytes)};});
fs.writeFileSync(path.join(directory,'studio-native-assets.json'),JSON.stringify({version:1,privateOnly:true,upstreamPin:'27b6f68221fdbf1ef1bedc182e303210ca9e39f5',sources,files},null,2)+'\n',{mode:0o600,flag:'wx'});
