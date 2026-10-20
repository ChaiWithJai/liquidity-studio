import test from 'node:test';
import assert from 'node:assert/strict';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantMcpHandler} from './defiant-mcp-handler.js';
import {createDefiantUnifiedData} from './defiant-unified-data.js';

test('real SDK client discovers tools/resource and current authority through stateless handler',async t=>{
 let allowed=true;const seen=[];
 const dataset={dataset:{id:'fictional',label:'Fictional protocol fixture',provenance:'synthetic',asOf:null},artists:[{id:'artist_a',name:'Fictional Artist'}],tracks:[],sources:[],campaigns:[],opportunities:[]};
 const service=createDefiantUnifiedData({dataset,organizationId:'org_a',authorize:actor=>actor==='actor_a'&&allowed});
 const handler=createDefiantMcpHandler({uiHtml:'<!doctype html><html><body>Protocol fixture, not actual chat UI</body></html>',resolveService:async({organizationId,requestContext})=>{
  seen.push(requestContext.authInfo?.clientId);
  if(organizationId!=='org_a'||requestContext.authInfo?.clientId!=='fixture-client')throw Object.assign(new Error('Private resolver denial'),{status:403});
  return {service,actor:'actor_a'};
 }});
 // The fixture supplies verified context explicitly. Production verification is a mounting-host responsibility.
 const transport=new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init),{authInfo:{token:'fictional-fixture-only',clientId:'fixture-client',scopes:['defiant:read']}})});
 const client=new Client({name:'defiant-hosted-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});
 t.after(async()=>{await client.close();await handler.close();});await client.connect(transport);
 const tools=await client.listTools();assert.deepEqual(tools.tools.map(x=>x.name).sort(),['defiant_list_pathways','defiant_open_guided_view','defiant_read_data']);
 const read=await client.callTool({name:'defiant_read_data',arguments:{organizationId:'org_a',resource:'artists'}});assert.equal(read.structuredContent.items[0].name,'Fictional Artist');
 const view=await client.callTool({name:'defiant_open_guided_view',arguments:{organizationId:'org_a',pathwayId:'talent-to-campaign',selection:{artistId:'artist_a'}}});assert.equal(view.structuredContent.status,'needs-workspace-context');assert.deepEqual(view.structuredContent.scope,{organizationId:'org_a'});
 const resources=await client.listResources();assert.equal(resources.resources[0].uri,'ui://defiant/research-v1.html');
 const resource=await client.readResource({uri:'ui://defiant/research-v1.html'});assert.equal(resource.contents[0].mimeType,'text/html;profile=mcp-app');
 const wrongScope=await client.callTool({name:'defiant_read_data',arguments:{organizationId:'other_org',resource:'manifest'}});assert.equal(wrongScope.isError,true);assert.equal(JSON.stringify(wrongScope).includes('Private resolver'),false);
 allowed=false;const revoked=await client.callTool({name:'defiant_read_data',arguments:{organizationId:'org_a',resource:'artists'}});assert.equal(revoked.isError,true);assert.ok(seen.every(x=>x==='fixture-client'));
});
