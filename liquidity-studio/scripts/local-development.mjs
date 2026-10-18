#!/usr/bin/env node
// Developer entry only. Does not alter production auth or select cloud data.
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import {parseLocalArguments,rejectDeployment,sanitizedChildEnvironment} from './local-development-support.mjs';
export {parseLocalArguments,rejectDeployment,sanitizedChildEnvironment};
export function main(args=process.argv.slice(2)) {
  rejectDeployment(process.env);const config=parseLocalArguments(args);
  if(config.check){console.log(JSON.stringify({profile:config.profile,meaning:'ALL LOCAL emulation, never deployed staging/production',origin:`http://127.0.0.1:${config.port}`,databaseDirectory:path.join(os.homedir(),'.config/liquidity-studio/development',config.profile),personas:['founder','marketer'],auth:'existing password sessions',research:'guarded public HTTPS source preparation; one local durable worker',generation:'offline-synthetic; approved-source rules unchanged',features:'source jobs and typed helpers on; '+(config.penpotConfigurationPath?'developer Penpot Create/Open opted in; ':'Penpot off; ')+(config.nativeAssetsDirectory?'private image editor opted in'+(config.cutoutModelPath?' with background removal':''):'native/cutout off')+(config.nativePairingConfigurationPath?'; native profile pairing opted in':'')+(config.portableRecovery?'; portable recovery opted in':'; portable off'),started:false}));return;}
  const env=sanitizedChildEnvironment(process.env);
  const child=spawn(process.execPath,['--max-old-space-size=384','--input-type=module','-e',"import {createDevelopmentServer} from './scripts/local-development-support.mjs'; await createDevelopmentServer(JSON.parse(process.argv[1]));",JSON.stringify({profile:config.profile,port:config.port,...(config.penpotConfigurationPath?{penpotConfigurationPath:config.penpotConfigurationPath}:{}),...(config.nativePairingConfigurationPath?{nativePairingConfigurationPath:config.nativePairingConfigurationPath}:{}),...(config.nativeAssetsDirectory?{nativeAssetsDirectory:config.nativeAssetsDirectory}:{}),...(config.cutoutModelPath?{cutoutModelPath:config.cutoutModelPath}:{}),...(config.portableRecovery?{portableRecovery:true}:{})})],{cwd:fileURLToPath(new URL('../',import.meta.url)),env,stdio:'inherit'});
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>child.kill(signal));
  child.once('error',()=>{console.error('Local launcher could not start. Use existing Node 22 and installed project dependencies.');process.exitCode=1;});
  child.once('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
}
if(process.argv[1]&&fs.realpathSync(process.argv[1])===fileURLToPath(import.meta.url))try{main();}catch(error){console.error(error.message);process.exitCode=1;}
