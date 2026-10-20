import test from 'node:test';
import assert from 'node:assert/strict';
import {generateDefiantSyntheticDataset} from './defiant-synthetic-dataset.js';
import {createDefiantUnifiedData} from './defiant-unified-data.js';
import {listDefiantDomainPathways,runDefiantDomainPathway} from './defiant-domain-pathways.js';
import {registerDefiantDomainPrompts} from './defiant-domain-prompts.js';

// Hosted only. Uses the real deterministic generator and domain service, not canned tool results.
test('artist → regional demand → linked royalties/rights → opportunity → scenario ends at human review',async()=>{
 const dataset=generateDefiantSyntheticDataset({seed:'golden-pathway-contract',asOf:'2026-10-01',months:12}),actor={id:'fictional-owner'};
 const service=createDefiantUnifiedData({dataset,organizationId:'org_fixture',authorize:person=>person===actor});
 const packet=await runDefiantDomainPathway(service,actor,{pathwayId:'catalog-to-campaign',artistId:'artist:fictional-1',trackId:'track:fictional-1-1',regionId:'region:nj',budgets:[0,500,1000],horizonMonths:3});
 assert.equal(packet.status,'human-review-required');assert.equal(packet.overview.artist.name,'Harbor Lantern');
 assert.deepEqual(packet.selection,{artistId:'artist:fictional-1',trackId:'track:fictional-1-1',regionId:'region:nj',method:'explicit-selection'});
 const opportunity=packet.regional.items.find(item=>item.trackId===packet.selection.trackId&&item.regionId===packet.selection.regionId);
 assert.ok(opportunity.growthRate>1.5,'the deliberately planted NJ change must be explained by the monthly evidence');
 assert.equal(packet.explanation.recording.id,packet.selection.trackId);assert.equal(packet.explanation.region.id,'region:nj');
 const ledger=dataset.royalties.filter(row=>row.trackId===packet.selection.trackId);
 assert.equal(packet.rightsAndRoyalties.royalties.streams,ledger.reduce((sum,row)=>sum+row.streams,0));
 assert.equal(packet.rightsAndRoyalties.royalties.amountCents,ledger.reduce((sum,row)=>sum+row.royaltyCents,0));
 assert.ok(packet.rightsAndRoyalties.rights.every(row=>row.trackId===packet.selection.trackId&&row.actualApproval===false));
 assert.equal(packet.rightsAndRoyalties.canApproveRights,false);assert.equal(packet.rightsAndRoyalties.reviewRequired,true);
 assert.deepEqual(packet.scenarioComparison.scenarios.map(row=>row.budget),[0,500,1000]);
 assert.equal(packet.scenarioComparison.trained,false);assert.equal(packet.scenarioComparison.scenarios[0].assumedIncrementalStreams,0);
 assert.equal(packet.scenarioComparison.scenarios[0].projectedStreams,packet.scenarioComparison.scenarios[0].baselineStreams);
 assert.equal(packet.review.status,'pending');assert.equal(packet.capabilities.canExecuteCampaign,false);assert.equal(packet.capabilities.canApproveRights,false);
 assert.match(packet.review.unknowns.join(' '),/Fictional/);assert.match(packet.review.unknowns.join(' '),/not financial forecasts/);
 assert.ok(packet.evidenceIds.length>0);assert.ok(packet.evidenceIds.some(id=>id.startsWith('demand:')));assert.ok(packet.evidenceIds.some(id=>id.startsWith('royalty:')));assert.ok(packet.evidenceIds.some(id=>id.startsWith('rights:')));
 assert.equal(dataset.dataset.provenance,'synthetic');assert.equal(packet.dataset.provenance,'synthetic');
});
test('audience prompts name the actual domain tools and require explicit budget assumptions without performing reads',async()=>{
 const prompts=new Map(),server={registerPrompt:(name,config,callback)=>prompts.set(name,{config,callback})};registerDefiantDomainPrompts(server);
 assert.deepEqual([...prompts.keys()],['defiant_catalog_activation_review','defiant_regional_talent_review','defiant_opportunity_scenario_review']);
 for(const {config,callback} of prompts.values()){
  const args=config.argsSchema.parse({organizationId:'org_fixture',artistId:'artist:fictional-1',budgets:'0,500,1000',horizonMonths:'3'}),text=callback(args).messages[0].content.text;
  for(const tool of listDefiantDomainPathways()[0].toolSequence)assert.ok(text.includes(tool.tool));
  assert.match(text,/human-review packet/);assert.match(text,/Mark review pending/);assert.match(text,/not a budget recommendation/);
  assert.throws(()=>config.argsSchema.parse({organizationId:'org_fixture',artistId:'artist:fictional-1',budgets:'1000,eval()'}));
 }
 let calls=0;const missing=await runDefiantDomainPathway({domain:()=>{calls++;}},null,{pathwayId:'talent-to-campaign'});
 assert.equal(missing.status,'needs-input');assert.deepEqual(missing.missingInputs,['artistId','budgets']);assert.equal(calls,0);
});
