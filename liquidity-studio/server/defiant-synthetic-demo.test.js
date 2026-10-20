import test from 'node:test';
import assert from 'node:assert/strict';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createHttpServer } from './index.js';
const path='/mcp/defiant-synthetic';
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
 const transport=new StreamableHTTPClientTransport(new URL(h.base+path),{requestInit:{headers:{Host:'demo.example',cookie:'studio_session=fixture-private-sentinel',Authorization:'Bearer fixture-private-sentinel'}}});
 const client=new Client({name:'fictional-public-http-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(()=>client.close());await client.connect(transport);
 const tools=await client.listTools();assert.ok(tools.tools.some(tool=>tool.name==='defiant_artist_overview'));assert.ok(tools.tools.every(tool=>tool._meta.securitySchemes[0].type==='noauth'));
 const overview=await client.callTool({name:'defiant_artist_overview',arguments:{organizationId:'defiant_synthetic_demo',artistId:'artist:fictional-1'}});
 assert.equal(overview.structuredContent.dataset.provenance,'synthetic');assert.equal(overview.structuredContent.artist.name,'Harbor Lantern');assert.equal(overview.structuredContent.recordings.length,6);
 const denied=await client.callTool({name:'defiant_read_data',arguments:{organizationId:'private_workspace',resource:'manifest'}});assert.equal(denied.isError,true);assert.equal(denied.structuredContent,undefined);
 assert.equal((await client.listPrompts()).prompts.length,3);assert.equal(h.identityReads,0);assert.equal(h.privateLoads,0);
});
test('public mount rejects host/origin/query/method/body violations before SDK processing',async t=>{
 const h=await host(t,{enableDefiantSyntheticDemo:true,defiantSyntheticDemoOrigins:['https://demo.example']});
 const req=(suffix='',options={})=>fetch(h.base+path+suffix,{...options,headers:{Host:'demo.example',...options.headers}});
 assert.equal((await fetch(h.base+path)).status,403);
 assert.equal((await req('',{headers:{Origin:'https://other.example'}})).status,403);
 assert.equal((await req('?file=/private/file')).status,403);
 assert.equal((await req('',{method:'DELETE'})).status,405);
 assert.equal((await req('',{method:'POST',headers:{'Content-Type':'text/plain'},body:'{}'})).status,415);
 assert.equal((await req('',{method:'POST',headers:{'Content-Type':'application/json'},body:' '.repeat(65537)})).status,413);
 const cors=await req('',{method:'OPTIONS',headers:{Origin:'https://demo.example'}});assert.equal(cors.status,204);assert.equal(cors.headers.get('access-control-allow-origin'),'https://demo.example');assert.equal(cors.headers.get('access-control-allow-credentials'),null);
 assert.equal(h.identityReads,0);assert.equal(h.privateLoads,0);
});
