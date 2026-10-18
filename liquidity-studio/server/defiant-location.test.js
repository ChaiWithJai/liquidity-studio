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
