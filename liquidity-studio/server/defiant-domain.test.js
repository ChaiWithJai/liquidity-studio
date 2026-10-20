import test from 'node:test';
import assert from 'node:assert/strict';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantMcpHandler} from './defiant-mcp-handler.js';
import {createDefiantUnifiedData} from './defiant-unified-data.js';
import {defiantUnifiedRequest} from './defiant-unified-http.js';
import {generateDefiantSyntheticDataset} from './defiant-synthetic-dataset.js';
const artistId='artist:fictional-1',trackId='track:fictional-1-1',regionId='region:nj';
const fixture=()=>{let allowed=true;const input=generateDefiantSyntheticDataset();const service=createDefiantUnifiedData({dataset:input,organizationId:'org_fixture',authorize:actor=>actor==='fixture_actor'&&allowed});return {input,service,revoke:()=>{allowed=false;}};};
test('joined fictional portfolio preserves profiles and exact demand, ledger and split conservation',async()=>{
 const {input,service}=fixture();const snapshot=await service.read('fixture_actor');
 assert.equal(snapshot.dataset.counts.demand,2592);assert.equal(snapshot.dataset.counts.royalties,432);assert.equal(snapshot.artists[0].profile.summary,input.artists[0].profile.summary);
 const overview=await service.domain('fixture_actor',{operation:'artist-overview',artistId});assert.equal(overview.recordings.length,6);assert.equal(overview.regions.length,6);assert.equal(overview.collaborators.length,2);assert.equal(overview.provenance,'synthetic');
 const ledger=await service.domain('fixture_actor',{operation:'rights-and-royalties',trackId});
 assert.equal(ledger.royalties.rows.length,12);assert.equal(ledger.canApproveRights,false);assert.equal(ledger.rights[0].actualApproval,false);assert.equal(ledger.rights[0].status,'simulated-clear');
 const streams=input.demand.filter(x=>x.trackId===trackId).reduce((s,x)=>s+x.streams,0);assert.equal(ledger.royalties.streams,streams);
 assert.equal(ledger.royalties.splits.reduce((s,x)=>s+x.amountCents,0),ledger.royalties.amountCents);
 assert.ok(ledger.evidenceIds.includes(ledger.rights[0].id));assert.equal(ledger.asOf,'2026-10-01T00:00:00.000Z');
});
test('regional detection and explanation use identical dated evidence and explicit score; scenarios are not learned outcomes',async()=>{
 const {service}=fixture();const detected=await service.domain('fixture_actor',{operation:'regional-opportunities',regionId,limit:12});
 assert.equal(detected.items.length,12);assert.ok(detected.items.every(x=>['artist:fictional-1','artist:fictional-2'].includes(x.artistId)));
 assert.deepEqual(detected.periods,{baseline:['2026-04-01','2026-05-01','2026-06-01'],recent:['2026-07-01','2026-08-01','2026-09-01']});
 const selected=detected.items[0],explained=await service.domain('fixture_actor',{operation:'explain-opportunity',trackId:selected.trackId,regionId});assert.deepEqual(explained.item,selected);assert.match(selected.assumptions[0],/Score =/);
 const scenarios=await service.domain('fixture_actor',{operation:'compare-scenarios',trackId,regionId,budgets:[0,500,1000],horizonMonths:3});
 assert.equal(scenarios.scenarios[0].assumedIncrementalStreams,0);assert.equal(scenarios.scenarios[1].assumedIncrementalStreams,10000);assert.equal(scenarios.scenarios[2].assumedIncrementalStreams,20000);assert.equal(scenarios.trained,false);assert.equal(scenarios.reviewRequired,true);assert.match(scenarios.assumptions[0],/assumed \$0.05/);
 assert.deepEqual(await service.domain('fixture_actor',{operation:'compare-scenarios',trackId,regionId,budgets:[0,500,1000],horizonMonths:3}),scenarios);
});
test('missing monthly history stays unknown and invalid joins or financial units are rejected',async()=>{
 const {input}=fixture();delete input.demand;delete input.royalties;delete input.forecasts;
 const service=createDefiantUnifiedData({dataset:input,organizationId:'org_fixture',authorize:()=>true});
 assert.equal((await service.domain('actor',{operation:'regional-opportunities'})).available,false);
 const scenario=await service.domain('actor',{operation:'compare-scenarios',trackId,regionId,budgets:[0]});assert.equal(scenario.baselineMonthlyStreams,null);assert.equal(scenario.scenarios[0].projectedRoyaltyCents,null);
 for(const change of [d=>{d.royalties[0].royaltyCents++;},d=>{d.royalties[0].splits[0].amountCents++;},d=>{d.royalties[0].splits[0].amountCents+=2;d.royalties[0].splits[1].amountCents-=2;},d=>{d.demand[0].regionId='region:missing';},d=>{d.rights[0].actualApproval=true;},d=>{d.forecasts[0].trained=true;},d=>{d.forecasts[0].projectedStreams++;},d=>{d.forecasts[0].baselineMonthlyStreams++;},d=>{d.forecasts[0].asOf='2026-09-01';},d=>{d.demand[0].date='2026-10-01';}]){const data=generateDefiantSyntheticDataset();change(data);assert.throws(()=>createDefiantUnifiedData({dataset:data,organizationId:'org_fixture',authorize:()=>true}),{status:400});}
 for(const request of [{operation:'sql'},{operation:'artist-overview',artistId:'missing'},{operation:'compare-scenarios',trackId,regionId,budgets:[-1]},{operation:'compare-scenarios',trackId,regionId,budgets:[1,1]},{operation:'regional-opportunities',limit:26}])await assert.rejects(service.domain('actor',request),error=>[400,404].includes(error.status));
});
test('real MCP domain tools and HTTP command return the same scoped math and reject revoked authority',async t=>{
 const {service,revoke}=fixture();const handler=createDefiantMcpHandler({resolveService:async({organizationId})=>{if(organizationId!=='org_fixture')throw Object.assign(Error('Denied'),{status:403});return {service,actor:'fixture_actor'};}});
 const transport=new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init),{})});const client=new Client({name:'domain-fixture',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(transport);
 const commands=[['defiant_artist_overview',{operation:'artist-overview',artistId}],['defiant_detect_regional_opportunities',{operation:'regional-opportunities',artistId,regionId,limit:3}],['defiant_explain_opportunity',{operation:'explain-opportunity',trackId,regionId}],['defiant_inspect_rights_and_royalties',{operation:'rights-and-royalties',trackId}],['defiant_compare_campaign_scenarios',{operation:'compare-scenarios',trackId,regionId,budgets:[0,500],horizonMonths:3}]];
 for(const [name,body]of commands){const {operation,...args}=body;const mcp=await client.callTool({name,arguments:{organizationId:'org_fixture',...args}});assert.equal(mcp.isError,undefined);const http=await defiantUnifiedRequest({service,user:'fixture_actor',route:'/api/studio/defiant-data/org_fixture/domain',method:'POST',url:new URL('https://fixture.invalid/api/studio/defiant-data/org_fixture/domain'),body});assert.deepEqual(mcp.structuredContent,{...http,scope:{organizationId:'org_fixture'}});}
 revoke();const denied=await client.callTool({name:'defiant_artist_overview',arguments:{organizationId:'org_fixture',artistId}});assert.equal(denied.isError,true);await assert.rejects(service.domain('fixture_actor',{operation:'artist-overview',artistId}),{status:403});
});
