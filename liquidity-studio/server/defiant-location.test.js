import test from 'node:test';
import assert from 'node:assert/strict';
import {readWorkflowLocation,workflowHref} from '../src/lib/workflow-location.js';
import {strategyOrganizationFor} from '../src/lib/defiant-location.js';
test('organization strategy location preserves actual study selection and report without a fake brand',()=>{
 const url='http://127.0.0.1:3002/?org=defiant_org&tab=strategy&view=report&focus=node_lagos&select=edge_lagos_to_london&savedView=view_1&report=report_1&target=brand_1&brand=brand_vedic&story=research_4&native=old_native';
 const route=readWorkflowLocation(url);
 assert.equal(route.brandId,'');assert.equal(route.storyId,'');assert.equal(route.nativeId,'');
 assert.deepEqual(route.strategy,{view:'report',focus:'node_lagos',selected:'edge_lagos_to_london',savedViewId:'view_1',reportId:'report_1',destinationBrandId:'brand_1'});
 const serialized=workflowHref(url,route),query=new URL(serialized).searchParams;
 for(const key of ['brand','story','native','format','editor','page'])assert.equal(query.has(key),false);
 assert.deepEqual(readWorkflowLocation(serialized).strategy,route.strategy);
 const org={id:'defiant_org',brands:[],strategy:{enabled:true,canEnable:false}};
 assert.equal(strategyOrganizationFor(route,[org]),org);
 assert.equal(strategyOrganizationFor(route,[{...org,strategy:{enabled:false,canEnable:false}}]),null);
 assert.equal(strategyOrganizationFor(route,[{...org,id:'foreign'}]),null);
});
test('publishing location remains separate and explicit destination is never guessed',()=>{
 const original='http://127.0.0.1:3002/?org=defiant_org&tab=strategy&view=report&focus=node_lagos&select=artist_1&report=report_1&target=brand_1';
 const url=workflowHref(original,{organizationId:'org_default',brandId:'brand_vedic',tab:'studio',storyId:'research_4',format:'carousel',editor:'prepared',page:2});
 const query=new URL(url).searchParams;
 for(const key of ['view','focus','select','savedView','report','target'])assert.equal(query.has(key),false);
 const route=readWorkflowLocation(url);assert.equal(route.storyId,'research_4');assert.equal(route.format,'carousel');assert.equal(route.page,2);assert.equal('strategy' in route,false);
 const empty=readWorkflowLocation('http://127.0.0.1:3002/?org=defiant_org&tab=strategy&view=campaign&select=%3Cscript%3E');
 assert.equal(empty.strategy.view,'map');assert.equal(empty.strategy.selected,'');assert.equal(empty.strategy.destinationBrandId,'');
});

test('owned entity identifiers with colons roundtrip without broadening organization or destination IDs',()=>{
 const input={organizationId:'defiant_org',tab:'strategy',strategy:{view:'map',focus:'owned:producer',selected:'owned:relationship',savedViewId:'view:one',reportId:'report:one',destinationBrandId:'brand:invalid'}};
 const route=readWorkflowLocation(workflowHref('http://127.0.0.1:3002/',input));
 assert.equal(route.strategy.focus,'owned:producer');assert.equal(route.strategy.selected,'owned:relationship');assert.equal(route.strategy.savedViewId,'view:one');assert.equal(route.strategy.reportId,'report:one');assert.equal(route.strategy.destinationBrandId,'');
 assert.equal(strategyOrganizationFor({...route,organizationId:'org:invalid'},[{id:'org:invalid',strategy:{enabled:true}}]),null);
});


test('strategy filters and search roundtrip without leaking into publishing URLs',()=>{
 const url=workflowHref('http://localhost/',{organizationId:'defiant_org',tab:'strategy',strategy:{view:'map',kinds:['artist'],showExamples:false,query:'London producer'}});
 const route=readWorkflowLocation(url);assert.deepEqual(route.strategy.kinds,['artist']);assert.equal(route.strategy.showExamples,false);assert.equal(route.strategy.query,'London producer');
 const published=new URL(workflowHref(url,{organizationId:'org_default',brandId:'brand_default',tab:'studio'}));for(const key of ['kinds','examples','find'])assert.equal(published.searchParams.has(key),false);
});


test('ordered route IDs roundtrip with bounded syntax and stay out of publishing URLs',()=>{
 const input={organizationId:'defiant_org',tab:'strategy',strategy:{view:'map',routeEdgeIds:['route:ab','route:bc']}};
 const url=workflowHref('http://localhost/',input);assert.deepEqual(readWorkflowLocation(url).strategy.routeEdgeIds,input.strategy.routeEdgeIds);
 const published=new URL(workflowHref(url,{organizationId:'org_default',brandId:'brand_default',tab:'studio'}));assert.equal(published.searchParams.has('path'),false);
 for(const path of ['route:ab,route:ab','route:ab,<bad>',Array.from({length:17},(_,i)=>'edge:'+i).join(',')])assert.equal(readWorkflowLocation('http://localhost/?tab=strategy&path='+encodeURIComponent(path)).strategy.routeEdgeIds,undefined);
});

// Hosted contract: candidate identity survives reload without becoming campaign authority.
test('analysis moment selection roundtrips with its source and is removed on campaign handoff',()=>{
 const url=workflowHref('http://localhost/',{organizationId:'defiant_org',tab:'strategy',strategy:{view:'inbox',sourceId:'youtube:source',momentId:'moment:one'}});
 const selected=readWorkflowLocation(url).strategy;assert.equal(selected.sourceId,'youtube:source');assert.equal(selected.momentId,'moment:one');
 const draft=workflowHref(url,{organizationId:'org_default',brandId:'brand_default',tab:'studio'});assert.equal(new URL(draft).searchParams.has('moment'),false);
 assert.equal(readWorkflowLocation('http://localhost/?tab=strategy&moment=%3Cscript%3E').strategy.momentId,undefined);
});

test('catalog and talent origins retain exact selection on report return without changing legacy links',async()=>{
 const {strategyReturnContext,strategyReportReturn}=await import('../src/lib/defiant-location.js');
 for(const origin of ['catalog','talent']){
  const context=strategyReturnContext({origin,view:origin==='catalog'?'inbox':'map',regionId:'region:one',artistId:'artist:one',sourceId:'youtube:one',recordingId:'recording:one',focus:'artist:one',selected:'person:one',query:'retained words',cohort:'supplied-2026'});
  const href=workflowHref('http://localhost/',{organizationId:'defiant_org',tab:'strategy',strategy:{...context,view:'report',reportId:'report:one'}});
  const read=readWorkflowLocation(href).strategy;assert.equal(read.origin,origin);assert.equal(read.regionId,'region:one');assert.equal(read.artistId,'artist:one');
  const back=strategyReportReturn(read,{returnContext:context});assert.deepEqual(back,{...context,reportId:''});
  const publishing=new URL(workflowHref(href,{organizationId:'org_default',brandId:'brand_default',tab:'studio'}));for(const key of ['origin','region','artist','source','recording','select'])assert.equal(publishing.searchParams.has(key),false);
 }
 assert.equal(strategyReportReturn({view:'report'},{sourceRefs:['youtube:one'],planIds:[]}).view,'inbox');
 assert.equal(strategyReportReturn({view:'report'},{planIds:['artist:one']}).view,'map');
 assert.equal(readWorkflowLocation('http://localhost/?tab=strategy&view=map').strategy.origin,undefined);
});
