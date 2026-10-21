import { open } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { createDefiantUnifiedData } from './defiant-unified-data.js';
import { registerDefiantTools } from './defiant-mcp.js';
import { defiantUnifiedRequest } from './defiant-unified-http.js';
import { DEFIANT_DOMAIN_INSTRUCTIONS } from './defiant-domain-pathways.js';
export const DEFIANT_SYNTHETIC_MCP_PATH = '/mcp/defiant-synthetic';
const REST_PREFIX='/api/defiant-synthetic';
const REST_RESOURCES=new Set(['manifest','artists','tracks','sources','campaigns','demand','royalties','opportunities','regions','collaborators','rights','forecasts','pathways','view','domain','domain-review']);
const ORGANIZATION = 'defiant_synthetic_demo';
const reject = (status, message) => Object.assign(new Error(message), { status });
async function loadFixture() {
  // Fixed build output, never distDir, a user file, URL or private dataset provider.
  const handle = await open(resolve(process.cwd(),'dist/mcp/defiant-synthetic-portfolio.json'), constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size < 1 || stat.size > 4 * 1024 * 1024) throw new Error('Invalid build fixture');
    const bytes = Buffer.alloc(stat.size + 1);let length=0;
    while(length<bytes.length){const read=await handle.read(bytes,length,bytes.length-length,null);if(!read.bytesRead)break;length+=read.bytesRead;}
    if(length!==stat.size)throw new Error('Build fixture changed');
    const input=JSON.parse(bytes.subarray(0,length).toString('utf8'));
    if(input.organizationId!==ORGANIZATION||input.dataset?.dataset?.id!=='defiant-fictional-portfolio-v1'||input.dataset.dataset.provenance!=='synthetic'||Object.values(input.dataset).filter(Array.isArray).some(rows=>rows.some(row=>row.provenance!=='synthetic')))throw new Error('Only the synthetic demo dataset is allowed');
    return input.dataset;
  } finally { await handle.close(); }
}
function body(req) {
  return new Promise((resolve,rejectBody)=>{
    let size=0,settled=false;const chunks=[];
    const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);req.off('data',data);req.off('end',end);req.off('error',errorEvent);req.off('aborted',aborted);if(error){req.resume();rejectBody(error);}else resolve(value);};
    const data=chunk=>{size+=chunk.length;if(size>65536)return finish(reject(413,'Demo request exceeds limit'));chunks.push(chunk);};
    const end=()=>{try{const value=JSON.parse(Buffer.concat(chunks,size).toString('utf8'));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();finish(null,value);}catch{finish(reject(400,'Demo JSON object required'));}};
    const errorEvent=()=>finish(reject(400,'Demo body failed')),aborted=()=>finish(reject(400,'Demo request aborted'));
    const timer=setTimeout(()=>finish(reject(408,'Demo body deadline exceeded')),4000);
    req.on('data',data);req.once('end',end);req.once('error',errorEvent);req.once('aborted',aborted);
  });
}
/** Anonymous access is limited to this fixed, publicly safe fictional data process. */
export async function createDefiantSyntheticDemo({ enabled=false, publicOrigins=[] }={}) {
  if(typeof enabled!=='boolean'||!Array.isArray(publicOrigins)||publicOrigins.length>4)throw new TypeError('Invalid synthetic demo configuration');
  const origins=publicOrigins.map(value=>{let url;try{url=new URL(value);}catch{throw new TypeError('Exact HTTPS demo origins required');}if(url.origin!==value||url.protocol!=='https:'||url.username||url.password||url.hostname==='localhost'||url.hostname.endsWith('.localhost')||url.hostname==='127.0.0.1'||url.hostname==='[::1]')throw new TypeError('Exact public HTTPS demo origins required');return url;});
  if(enabled&&!origins.length)throw new TypeError('An exact public demo origin is required');
  const hosts=new Set(origins.map(url=>url.host)),allowedOrigins=new Set(publicOrigins);
  const readUi=async name=>{const handle=await open(resolve(process.cwd(),'dist/mcp',name),constants.O_RDONLY|constants.O_NOFOLLOW);try{const stat=await handle.stat();if(!stat.isFile()||stat.size<1||stat.size>512*1024)throw Error('Invalid build UI');const bytes=Buffer.alloc(stat.size+1);let length=0;while(length<bytes.length){const read=await handle.read(bytes,length,bytes.length-length,null);if(!read.bytesRead)break;length+=read.bytesRead;}if(length!==stat.size)throw Error('Build UI changed');return bytes.subarray(0,length).toString('utf8');}finally{await handle.close();}};
  const uiHtml=await readUi('defiant-research.html'),domainUiHtml=await readUi('defiant-domain-review.html');
  const actor=Object.freeze({kind:'public-fictional-demo'});let servicePromise;
  const service=()=>servicePromise??=(async()=>createDefiantUnifiedData({dataset:await loadFixture(),organizationId:ORGANIZATION,authorize:candidate=>candidate===actor}))();
  const handler=createMcpHandler(()=>{
    const server=new McpServer({name:'defiant-public-research',version:'1.0.0'},{instructions:`Synthetic data demo. Use organizationId ${ORGANIZATION}. ${DEFIANT_DOMAIN_INSTRUCTIONS}`});
    const registration={registerTool:(name,config,callback)=>server.registerTool(name,{...config,_meta:{...config._meta,securitySchemes:[{type:'noauth'}]}},callback),registerResource:server.registerResource.bind(server),registerPrompt:server.registerPrompt.bind(server)};
    registerDefiantTools(registration,{uiHtml,domainUiHtml,resolveService:async({organizationId})=>{if(organizationId!==ORGANIZATION)throw reject(403,'Demo scope only');return {service:await service(),actor};}});
    return server;
  },{responseMode:'json'});
  const node=toNodeHandler(handler);
  return Object.freeze({close:()=>handler.close(),async handle(req,res){
    const rawPath=(req.url||'').split('?')[0],url=new URL(req.url,'https://demo.invalid');
    const mcp=rawPath===DEFIANT_SYNTHETIC_MCP_PATH,rest=/^\/api\/defiant-synthetic\/([a-z-]+)$/.exec(rawPath);
    if(!rawPath.startsWith(DEFIANT_SYNTHETIC_MCP_PATH)&&!rawPath.startsWith(REST_PREFIX))return false;
    const json=(status,message)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:message}));};
    if(!enabled||(!mcp&&(!rest||!REST_RESOURCES.has(rest[1])))){json(404,'Not found');return true;}
    if(mcp&&url.search||!hosts.has(req.headers.host)||req.headers.origin&&!allowedOrigins.has(req.headers.origin)){json(403,'Demo origin or host denied');return true;}
    res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Origin');
    if(req.headers.origin)res.setHeader('Access-Control-Allow-Origin',req.headers.origin);
    if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,MCP-Protocol-Version,Mcp-Method,Mcp-Name','Access-Control-Max-Age':'300'});res.end();return true;}
    if(!['GET','POST'].includes(req.method)){json(405,'Demo supports GET and POST only');return true;}
    if(rest&&((['domain','domain-review'].includes(rest[1])&&req.method!=='POST')||(!['domain','domain-review'].includes(rest[1])&&req.method!=='GET'))){json(405,'Unsupported read-only demo method');return true;}
    try{
      let parsed;
      if(req.method==='POST'){
        if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw reject(415,'Demo JSON required');
        if(req.headers['content-length']&&(!/^\d+$/.test(req.headers['content-length'])||Number(req.headers['content-length'])>65536))throw reject(413,'Demo request exceeds limit');
        parsed=await body(req);
      }
      if(rest){
        const route=`/api/studio/defiant-data/${ORGANIZATION}/${rest[1]}`;
        const result=await defiantUnifiedRequest({service:await service(),user:actor,route,method:req.method,url,body:parsed});
        res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({...result,scope:{organizationId:ORGANIZATION}}));
      }else await node(req,res,parsed);
    }catch(error){if(!res.headersSent)json([400,403,404,405,408,409,413,415].includes(error?.status)?error.status:503,'Synthetic demo request unavailable');else res.end();}
    return true;
  }});
}
