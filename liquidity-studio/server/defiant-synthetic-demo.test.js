import test from 'node:test';
import assert from 'node:assert/strict';
import {request as httpRequest} from 'node:http';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createHttpServer, defiantSyntheticDemoConfiguration } from './index.js';
const path='/mcp/defiant-synthetic';
// Node fetch does not reliably preserve an overridden Host. Use real HTTP bytes
// for the public-origin boundary while retaining the actual SDK transport.
async function publicFetch(url,init={}){
 const request=new Request(url,init),bytes=request.body?Buffer.from(await request.arrayBuffer()):undefined;
 return new Promise((resolve,reject)=>{
  const req=httpRequest(new URL(request.url),{method:request.method,headers:Object.fromEntries(request.headers),signal:request.signal},res=>{
   const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('error',reject);res.on('end',()=>resolve(new Response([204,205,304].includes(res.statusCode)?null:Buffer.concat(chunks),{status:res.statusCode,headers:res.headers})));
  });req.on('error',reject);req.end(bytes);
 });
}
async function host(t,options={}){
 let identityReads=0,privateLoads=0;
 const platform={ready:Promise.resolve(),identity:{mode:'password',authenticate(){identityReads++;throw Error('Must not read private identity');}}};
 const server=createHttpServer(null,{platform,defiantDatasetProvider:()=>{privateLoads++;throw Error('Must not load private dataset');},...options});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 return {base:`http://127.0.0.1:${server.address().port}`,get identityReads(){return identityReads;},get privateLoads(){return privateLoads;}};
}
test('synthetic mount is absent by default and requires exact public origins to enable',async t=>{
 const h=await host(t);assert.equal((await fetch(h.base+path)).status,404);assert.equal(h.identityReads,0);assert.equal(h.privateLoads,0);
 assert.throws(()=>createHttpServer(null,{platform:{},enableDefiantSyntheticDemo:true}));
 assert.throws(()=>createHttpServer(null,{platform:{},enableDefiantSyntheticDemo:true,defiantSyntheticDemoOrigins:['https://demo.example/']}));
});
test('public fictional MCP uses actual fixed build fixture and never cookies, identity or private provider',async t=>{
 const h=await host(t,{enableDefiantSyntheticDemo:true,defiantSyntheticDemoOrigins:['https://demo.example']});
 const transport=new StreamableHTTPClientTransport(new URL(h.base+path),{fetch:publicFetch,requestInit:{headers:{Host:'demo.example',cookie:'studio_session=fixture-private-sentinel',Authorization:'Bearer fixture-private-sentinel'}}});
 const client=new Client({name:'fictional-public-http-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(()=>client.close());await client.connect(transport);
 const tools=await client.listTools();assert.ok(tools.tools.some(tool=>tool.name==='defiant_artist_overview'));assert.ok(tools.tools.every(tool=>tool._meta.securitySchemes[0].type==='noauth'));
 const overview=await client.callTool({name:'defiant_artist_overview',arguments:{organizationId:'defiant_synthetic_demo',artistId:'artist:fictional-1'}});
 assert.equal(overview.structuredContent.dataset.provenance,'synthetic');assert.equal(overview.structuredContent.artist.name,'Harbor Lantern');assert.equal(overview.structuredContent.recordings.length,6);
 const denied=await client.callTool({name:'defiant_read_data',arguments:{organizationId:'private_workspace',resource:'manifest'}});assert.equal(denied.isError,true);assert.equal(denied.structuredContent,undefined);
 const rest=(resource,options={})=>publicFetch(h.base+'/api/defiant-synthetic/'+resource,{...options,headers:{Host:'demo.example',...options.headers}});
 const data=await rest('artists?limit=25');assert.equal(data.status,200);const mcpRead=await client.callTool({name:'defiant_read_data',arguments:{organizationId:'defiant_synthetic_demo',resource:'artists',limit:25}});assert.deepEqual(await data.json(),mcpRead.structuredContent);
 const scenario={operation:'compare-scenarios',trackId:'track:fictional-1-1',regionId:'region:nj',budgets:[0,500],horizonMonths:3};
 const restScenario=await rest('domain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(scenario)});assert.equal(restScenario.status,200);
 const {operation:_operation,...scenarioArgs}=scenario,mcpScenario=await client.callTool({name:'defiant_compare_campaign_scenarios',arguments:{organizationId:'defiant_synthetic_demo',...scenarioArgs}});assert.deepEqual(await restScenario.json(),mcpScenario.structuredContent);
 assert.equal((await rest('artists?organizationId=private_workspace')).status,400);
 assert.equal((await rest('domain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...scenario,organizationId:'private_workspace'})})).status,400);
 assert.equal((await client.listPrompts()).prompts.length,3);assert.equal(h.identityReads,0);assert.equal(h.privateLoads,0);
});
test('public mount rejects host/origin/query/method/body violations before SDK processing',async t=>{
 const h=await host(t,{enableDefiantSyntheticDemo:true,defiantSyntheticDemoOrigins:['https://demo.example']});
 const req=(suffix='',options={})=>publicFetch(h.base+path+suffix,{...options,headers:{Host:'demo.example',...options.headers}});
 assert.equal((await fetch(h.base+path)).status,403);
 assert.equal((await req('',{headers:{Origin:'https://other.example'}})).status,403);
 assert.equal((await req('?file=/private/file')).status,403);
 assert.equal((await req('',{method:'DELETE'})).status,405);
 assert.equal((await req('',{method:'POST',headers:{'Content-Type':'text/plain'},body:'{}'})).status,415);
 assert.equal((await req('',{method:'POST',headers:{'Content-Type':'application/json'},body:' '.repeat(65537)})).status,413);
 const cors=await req('',{method:'OPTIONS',headers:{Origin:'https://demo.example'}});assert.equal(cors.status,204);assert.equal(cors.headers.get('access-control-allow-origin'),'https://demo.example');assert.equal(cors.headers.get('access-control-allow-credentials'),null);
 assert.equal(h.identityReads,0);assert.equal(h.privateLoads,0);
});

test('deployment constructor flags remain explicit and managed origin configuration is finite',()=>{
 assert.deepEqual(defiantSyntheticDemoConfiguration({}),{enableDefiantSyntheticDemo:false,defiantSyntheticDemoOrigins:[]});
 assert.deepEqual(defiantSyntheticDemoConfiguration({STUDIO_DEFIANT_SYNTHETIC_DEMO_ENABLED:'true',STUDIO_DEFIANT_SYNTHETIC_DEMO_ORIGINS:'https://demo.example'}),{enableDefiantSyntheticDemo:true,defiantSyntheticDemoOrigins:['https://demo.example']});
 assert.throws(()=>defiantSyntheticDemoConfiguration({STUDIO_DEFIANT_SYNTHETIC_DEMO_ENABLED:'yes'}));
});

test('malformed public REST prefixes are final 404 responses, never private-route fallthrough',async t=>{
 const h=await host(t,{enableDefiantSyntheticDemo:true,defiantSyntheticDemoOrigins:['https://demo.example']});
 for(const path of ['/api/defiant-synthetic','/api/defiant-synthetic/private_org/artists','/api/defiant-synthetic/%2e%2e/private','/api/defiant-synthetic/raw','/mcp/defiant-synthetic/extra']){
  const status=await new Promise((resolve,reject)=>{const req=httpRequest(new URL(h.base),{path,headers:{Host:'demo.example'}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});req.on('error',reject);req.end();});assert.equal(status,404);
 }
 assert.equal(h.identityReads,0);assert.equal(h.privateLoads,0);
});
