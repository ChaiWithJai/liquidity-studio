import test from 'node:test';
import assert from 'node:assert/strict';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantMcpHandler} from './defiant-mcp-handler.js';
import {createDefiantUnifiedData} from './defiant-unified-data.js';
import {defiantUnifiedRequest} from './defiant-unified-http.js';
import {generateDefiantSyntheticDataset} from './defiant-synthetic-dataset.js';
const command={pathwayId:'catalog-to-campaign',artistId:'artist:fictional-1',trackId:'track:fictional-1-1',regionId:'region:nj',budgets:[0,500],horizonMonths:3};
test('domain review SDK tool and scoped HTTP command share the actual joined packet and dated observations',async t=>{
 const dataset=generateDefiantSyntheticDataset();let allowed=true;
 const service=createDefiantUnifiedData({dataset,organizationId:'org_fixture',authorize:actor=>actor==='owner'&&allowed});
 const html='<!doctype html><html><body>Fictional resource fixture</body></html>';
 const handler=createDefiantMcpHandler({domainUiHtml:html,resolveService:async({organizationId})=>{if(organizationId!=='org_fixture')throw Object.assign(Error('Private scope denied'),{status:403});return {service,actor:'owner'};}});
 const transport=new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))});
 const client=new Client({name:'domain-review-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(transport);
 const tools=await client.listTools(),tool=tools.tools.find(x=>x.name==='defiant_open_domain_review');assert.equal(tool._meta.ui.resourceUri,'ui://defiant/domain-review-v2.html');assert.equal(tool.annotations.readOnlyHint,true);
 const response=await client.callTool({name:tool.name,arguments:{organizationId:'org_fixture',...command}});assert.notEqual(response.isError,true);
 const packet=response.structuredContent;assert.equal(packet.view,'domain-review');assert.equal(packet.status,'human-review-required');assert.equal(packet.review.status,'pending');assert.equal(packet.capabilities.canExecuteCampaign,false);assert.deepEqual(packet.scope,{organizationId:'org_fixture'});
 const expected=dataset.demand.filter(x=>x.trackId===command.trackId&&x.regionId===command.regionId).sort((a,b)=>a.date.localeCompare(b.date)).slice(-24).map(({id,date,streams,period,provenance})=>({id,date,streams,period,provenance}));
 assert.deepEqual(packet.explanation.observations,expected);assert.equal(expected.length,12);assert.ok(expected.every(x=>packet.explanation.evidenceIds.includes(x.id)));
 const http=await defiantUnifiedRequest({service,user:'owner',route:'/api/studio/defiant-data/org_fixture/domain-review',method:'POST',url:new URL('https://fixture.invalid/api/studio/defiant-data/org_fixture/domain-review'),body:command});assert.deepEqual(http,packet);
 const resource=await client.readResource({uri:'ui://defiant/domain-review-v2.html'});assert.equal(resource.contents[0].text,html);assert.equal(resource.contents[0].mimeType,'text/html;profile=mcp-app');assert.deepEqual(resource.contents[0]._meta.ui.csp,{connectDomains:[],resourceDomains:[],frameDomains:[]});
 const badScope=await client.callTool({name:tool.name,arguments:{organizationId:'other',...command}});assert.equal(badScope.isError,true);
 const duplicateBudget=await client.callTool({name:tool.name,arguments:{organizationId:'org_fixture',...command,budgets:[500,500]}});assert.equal(duplicateBudget.isError,true);
 allowed=false;const denied=await client.callTool({name:tool.name,arguments:{organizationId:'org_fixture',...command}});assert.equal(denied.isError,true);await assert.rejects(defiantUnifiedRequest({service,user:'owner',route:'/api/studio/defiant-data/org_fixture/domain-review',method:'POST',url:new URL('https://fixture.invalid/api/studio/defiant-data/org_fixture/domain-review'),body:command}),{status:403});
});
test('domain UI registration stays optional and bounded, independent of the foundation UI',async t=>{
 const handler=createDefiantMcpHandler({resolveService:async()=>{throw Error('Not a data request');}});
 const transport=new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))});const client=new Client({name:'resource-absence-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(transport);
 assert.equal(client.getServerCapabilities()?.resources,undefined);const tool=(await client.listTools()).tools.find(x=>x.name==='defiant_open_domain_review');assert.equal(tool._meta?.ui,undefined);
 // Configuration is validated at server registration, not read from tool arguments.
 const {registerDefiantTools}=await import('./defiant-mcp.js');assert.throws(()=>registerDefiantTools({}, {resolveService:async()=>{},domainUiHtml:'x'.repeat(512*1024+1)}),TypeError);
});
