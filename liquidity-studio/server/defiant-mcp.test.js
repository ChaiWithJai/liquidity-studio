import test from 'node:test';
import assert from 'node:assert/strict';
import { registerDefiantTools } from './defiant-mcp.js';
import { createDefiantUnifiedData } from './defiant-unified-data.js';
import {generateDefiantSyntheticDataset} from './defiant-synthetic-dataset.js';
const dataset = { dataset: { id: 'fictional', label: 'Fictional MCP contract', provenance: 'synthetic', asOf: null }, artists: [{ id: 'artist:a', name: 'Example Artist' }], tracks: [], sources: [], campaigns: [], opportunities: [] };
function harness(options) {
  const tools = new Map(), resources = new Map();
  const server = { registerTool(name, config, callback) { tools.set(name, { config, callback }); return {}; }, registerResource(name, uri, config, callback) { resources.set(uri, { config, callback }); return {}; }, registerPrompt(){return {};} };
  const registration = registerDefiantTools(server, options);
  return { tools, resources, registration, call(name, args, context) { const tool = tools.get(name); return tool.callback(tool.config.inputSchema.parse(args), context); } };
}
test('finite tools require scoped server binding and current facade authority on every invocation', async () => {
  const seen = []; let allowed = true;
  const service = createDefiantUnifiedData({ dataset, organizationId: 'org_a', authorize: actor => actor === 'person:a' && allowed });
  const host = harness({ resolveService: async input => { seen.push(input); return { service, actor: 'person:a' }; } });
  assert.deepEqual([...host.tools.keys()], ['defiant_read_data', 'defiant_list_pathways', 'defiant_open_guided_view', 'defiant_artist_overview', 'defiant_detect_regional_opportunities', 'defiant_explain_opportunity', 'defiant_inspect_rights_and_royalties', 'defiant_compare_campaign_scenarios', 'defiant_open_domain_review']);
  assert.equal(host.registration.resourceUri, null); assert.equal(host.resources.size, 0);
  const context = { authenticatedContext: 'host-only' };
  const first = await host.call('defiant_read_data', { organizationId: 'org_a', resource: 'artists' }, context);
  assert.equal(first.structuredContent.items[0].id, 'artist:a');
  assert.equal(seen[0].context, context); assert.equal(seen[0].organizationId, 'org_a');
  const pathways = await host.call('defiant_list_pathways', { organizationId: 'org_a' }, context);
  assert.equal(pathways.structuredContent.pathways.length, 3);
  const view = await host.call('defiant_open_guided_view', { organizationId: 'org_a', pathwayId: 'talent-to-campaign', selection: { artistId: 'artist:a' } }, context);
  assert.equal(view.structuredContent.status, 'needs-workspace-context');
  allowed = false;
  for (const [name, args] of [['defiant_read_data', { resource: 'manifest' }], ['defiant_list_pathways', {}], ['defiant_open_guided_view', { pathwayId: 'catalog-to-campaign' }]]) {
    const rejected = await host.call(name, { organizationId: 'org_a', ...args }, context);
    assert.equal(rejected.isError, true); assert.equal(rejected.structuredContent, undefined);
  }
});
test('exact schemas reject authority injection, arbitrary resources and unbounded reads', () => {
  const host = harness({ resolveService: () => { throw new Error('must not resolve'); } });
  for (const args of [{ organizationId: 'org_a', resource: 'raw' }, { organizationId: 'org_a', resource: 'tracks', limit: 101 }, { organizationId: 'org_a', resource: 'tracks', actor: 'founder' }]) assert.throws(() => host.call('defiant_read_data', args));
  assert.throws(() => host.call('defiant_open_guided_view', { organizationId: 'org_a', pathwayId: 'eval' }));
  assert.throws(() => host.call('defiant_open_guided_view', { organizationId: 'org_a', pathwayId: 'catalog-to-campaign', selection: { rightsApproved: true } }));
  assert.throws(()=>host.call('defiant_open_domain_review',{organizationId:'org_a',pathwayId:'catalog-to-campaign',artistId:'artist:a',budgets:[]}));
  assert.throws(()=>host.call('defiant_open_domain_review',{organizationId:'org_a',pathwayId:'catalog-to-campaign',artistId:'artist:a',budgets:[500],actor:'founder'}));
});
test('only explicit static HTML registers an MCP Apps resource; errors never expose resolver internals', async () => {
  const html = '<!doctype html><html><body>Fictional built UI contract</body></html>';
  const host = harness({ uiHtml: html, resolveService: () => { throw new Error('private-provider-cookie-value'); } });
  const uri = host.registration.resourceUri, resource = host.resources.get(uri);
  assert.equal(uri, 'ui://defiant/research-v1.html');
  assert.equal(host.tools.get('defiant_open_guided_view').config._meta.ui.resourceUri, uri);
  assert.equal(host.tools.get('defiant_read_data').config._meta.ui, undefined);
  const content = (await resource.callback()).contents[0];
  assert.equal(content.text, html); assert.equal(content.mimeType, 'text/html;profile=mcp-app');
  assert.deepEqual(content._meta.ui.csp.connectDomains, []); assert.deepEqual(content._meta.ui.csp.resourceDomains, []);
  const rejected = await host.call('defiant_list_pathways', { organizationId: 'org_a' });
  assert.equal(rejected.isError, true); assert.equal(JSON.stringify(rejected).includes('private-provider'), false);
  for (const { config } of host.tools.values()) assert.deepEqual(config.annotations, { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false });
  assert.throws(() => harness({}));
  assert.throws(() => harness({ resolveService: () => {}, uiHtml: '' }));
});

test('MCP manifest is compact authorized metadata while records stay paginated and internal guided data remains intact',async()=>{
 let allowed=true;const service=createDefiantUnifiedData({dataset:generateDefiantSyntheticDataset(),organizationId:'org_a',authorize:actor=>actor==='person:a'&&allowed});
 const host=harness({resolveService:async()=>({service,actor:'person:a'})});
 const reply=await host.call('defiant_read_data',{organizationId:'org_a',resource:'manifest'}),data=reply.structuredContent;
 assert.deepEqual(Object.keys(data).sort(),['capabilities','dataset','resources','schemaVersion','scope']);
 assert.equal(data.dataset.counts.demand,2592);assert.equal(data.dataset.counts.royalties,432);assert.ok(Buffer.byteLength(JSON.stringify(reply))<16384);
 assert.deepEqual(data.resources.find(row=>row.resource==='demand'),{resource:'demand',count:2592});
 const page=await host.call('defiant_read_data',{organizationId:'org_a',resource:'demand',limit:25});assert.equal(page.structuredContent.items.length,25);assert.equal(page.structuredContent.nextCursor,'25');assert.equal(page.structuredContent.dataset.revision,data.dataset.revision);
 const internal=await service.read('person:a',{resource:'manifest'});assert.equal(internal.demand.length,2592);assert.equal(internal.dataset.revision,data.dataset.revision);
 const guided=await host.call('defiant_open_guided_view',{organizationId:'org_a',pathwayId:'catalog-to-campaign',selection:{artistId:'artist:fictional-1',trackId:'track:fictional-1-1'}});assert.equal(guided.isError,undefined);assert.equal(guided.structuredContent.selectedRecords.tracks.id,'track:fictional-1-1');
 allowed=false;const denied=await host.call('defiant_read_data',{organizationId:'org_a',resource:'manifest'});assert.equal(denied.isError,true);assert.equal(denied.structuredContent,undefined);
});
