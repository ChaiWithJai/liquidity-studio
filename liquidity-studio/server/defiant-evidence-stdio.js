import {serveStdio} from '@modelcontextprotocol/server/stdio';
import {createPrivateEvidenceBridge} from './defiant-evidence-bridge.js';
async function start(){
 if(process.argv.length!==3)throw Error('Configuration required');
 const bridge=await createPrivateEvidenceBridge({configurationPath:process.argv[2]});
 const handle=serveStdio(()=>bridge.createServer());
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{void handle.close();});
}
start().catch(()=>{console.error('Private evidence client unavailable. Check the owner-only configuration and authorized credential handoff.');process.exitCode=1;});
