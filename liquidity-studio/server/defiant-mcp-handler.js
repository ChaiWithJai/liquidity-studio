import {createMcpHandler,McpServer} from '@modelcontextprotocol/server';
import {registerDefiantTools} from './defiant-mcp.js';
/** Protocol handler only. The mounting host must verify credentials/Host/Origin first.
 * No token parsing, anonymous actor fallback, private dataset or listening socket here.
 */
export function createDefiantMcpHandler({resolveService,uiHtml}={}) {
 if(typeof resolveService!=='function')throw new TypeError('A verified host service resolver is required');
 return createMcpHandler(requestContext=>{
  const server=new McpServer({name:'defiant-research',version:'1.0.0'});
  registerDefiantTools(server,{uiHtml,resolveService:({organizationId,context})=>resolveService({organizationId,context,requestContext})});
  return server;
 },{responseMode:'json'});
}
