import test from 'node:test';
import assert from 'node:assert/strict';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantMcpHandler} from './defiant-mcp-handler.js';
import {createDefiantUnifiedData} from './defiant-unified-data.js';
import {generateDefiantSyntheticDataset} from './defiant-synthetic-dataset.js';

// Hosted protocol fixture: actual SDK + generated portfolio + actual domain service, no model/provider.
test('MCP accelerator tools trace one synthetic artist through regional evidence to a review-required scenario',async t=>{
 const dataset=generateDefiantSyntheticDataset({seed:'golden-mcp-contract',asOf:'2026-10-01',months:12}),actor={kind:'fictional-hosted-owner'};
 const service=createDefiantUnifiedData({dataset,organizationId:'org_fixture',authorize:person=>person===actor});
 const handler=createDefiantMcpHandler({resolveService:async({organizationId})=>{assert.equal(organizationId,'org_fixture');return {service,actor};}});
 const transport=new StreamableHTTPClientTransport(new URL('https://fictional.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))});
 const client=new Client({name:'fictional-domain-journey',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});
 t.after(async()=>{await client.close();await handler.close();});await client.connect(transport);
 const call=async(name,args)=>{const result=await client.callTool({name,arguments:{organizationId:'org_fixture',...args}});assert.notEqual(result.isError,true);return result.structuredContent;};
 const artistId='artist:fictional-1',trackId='track:fictional-1-1',regionId='region:nj';
 const overview=await call('defiant_artist_overview',{artistId});assert.equal(overview.artist.name,'Harbor Lantern');assert.ok(overview.recordings.some(track=>track.id===trackId));
 const regional=await call('defiant_detect_regional_opportunities',{artistId,regionId,limit:25});const selected=regional.items.find(item=>item.trackId===trackId);assert.equal(selected.regionId,regionId);assert.ok(selected.growthRate>1.5);
 const rights=await call('defiant_inspect_rights_and_royalties',{trackId});assert.equal(rights.recording.id,trackId);assert.equal(rights.royalties.rows.length,12);assert.ok(rights.royalties.amountCents>0);assert.ok(rights.rights.every(row=>row.actualApproval===false));assert.equal(rights.reviewRequired,true);
 const explanation=await call('defiant_explain_opportunity',{trackId,regionId});assert.equal(explanation.recording.id,trackId);assert.equal(explanation.region.id,regionId);
 const scenarios=await call('defiant_compare_campaign_scenarios',{trackId,regionId,budgets:[0,500,1000],horizonMonths:3});assert.equal(scenarios.trained,false);assert.equal(scenarios.reviewRequired,true);assert.deepEqual(scenarios.scenarios.map(row=>row.budget),[0,500,1000]);
 for(const result of [overview,regional,rights,explanation,scenarios]){assert.equal(result.dataset.revision,overview.dataset.revision);assert.equal(result.provenance,'synthetic');assert.equal(result.capabilities.canApproveRights,false);assert.equal(result.capabilities.canPublish,false);assert.ok(result.evidenceIds.length>0);}
 const prompt=await client.getPrompt({name:'defiant_catalog_activation_review',arguments:{organizationId:'org_fixture',artistId,budgets:'0,500,1000',horizonMonths:'3'}});
 assert.match(prompt.messages[0].content.text,/Mark review pending/);
 assert.equal(client.getServerCapabilities()?.resources,undefined);
});
