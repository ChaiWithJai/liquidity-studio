import {serveStdio} from '@modelcontextprotocol/server/stdio';
import {createEvidenceClientAuth} from './defiant-evidence-client-auth.js';
import {createPrivateEvidenceBridge} from './defiant-evidence-bridge.js';
async function start(){
 if(process.argv.length===4&&process.argv[2]==='--pair'){
  const auth=await createEvidenceClientAuth({configurationPath:process.argv[3]});
  await auth.pair({report:({pairingId,url})=>console.error(`Open ${url} and expand Local evidence clients. Enter pairing code ${pairingId}, inspect the exact organization and approve read-only access. No sign-in credentials are exported.`)});
  console.error('Local evidence client connected. Start the configured MCP server.');return;
 }
 if(process.argv.length!==3)throw Error('Configuration required');
 const bridge=await createPrivateEvidenceBridge({configurationPath:process.argv[2]});
 const handle=serveStdio(()=>bridge.createServer());
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{void handle.close();});
}
start().catch(()=>{console.error('Private evidence client unavailable. Check the owner-only configuration and authorized credential handoff.');process.exitCode=1;});
