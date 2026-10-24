import test from 'node:test';
import assert from 'node:assert/strict';
import {Client, StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantEvidenceMcpHandler} from './defiant-evidence-mcp.js';
import {createDefiantEvidenceService} from './defiant-evidence.js';
test('SDK journey reads earnings and exact receipt; stale, revoked and cross-scope reads disclose no data', async t => {
 let allowed = true; let loads = 0;
 const sourceHash = 'a'.repeat(64);
 const service = createDefiantEvidenceService({organizationId: 'sample_org', authorize: actor => allowed && actor === 'actor', loadSourceRecords: async ({sourceHash,sourceRecords}) => sourceRecords.map(record => ({id: 'r_'+record, sourceHash, member:'sample.csv', record, cells:{Amount:'-0.000001'}})), loadSnapshot: async () => {
  loads++;
  return {schemaVersion: 1, organizationId: 'sample_org', coverage: 'Invented protocol contract only', identityGroups:[{id:'identity_a',artist:'Invented artist',title:'Invented title',reviewStatus:'needs-review',rankingBasis:'absolute-net-reported-amount-within-currency',provenance:{upstreamSnapshotRevision:'c'.repeat(64),upstreamArtifactHash:'d'.repeat(64),observedPeriod:'2025-06'},members:[{id:'member_a',sourceSystem:'invented-system',accountScope:'invented-account',sourceId:'001',releaseTitle:'Invented release',upc:null,selectionIds:['group_a']}]}], selections: [{id: 'group_a', label: 'Invented group', sourceHash, amount: '-0.000001', currency: 'USD', sourceRecords: [2,4,8]}], months: [{month: '2025-06', currency: 'USD', amount: '-0.000001', metric: 'source-total-earned', sourceHash, receiptIds: ['row_2']}], receipts: [{id: 'row_2', sourceHash, member: 'sample.csv', record: 2, cells: {Amount: '-0.000001'}}]};
 }});
 const handler = createDefiantEvidenceMcpHandler({resolveEvidence: async ({organizationId, requestContext}) => {
  if (organizationId !== 'sample_org' || requestContext.authInfo?.clientId !== 'fixture-client') throw Object.assign(new Error('private resolver detail'), {status: 403});
  return {organizationId, actor: 'actor', service};
 }});
 const transport = new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'), {fetch: (url, init) => handler.fetch(new Request(url, init), {authInfo: {token: 'invented-only', clientId: 'fixture-client', scopes: ['evidence:read']}})});
 const client = new Client({name: 'evidence-contract', version: '1.0.0'}, {versionNegotiation: {mode: 'auto'}});
 t.after(async () => {await client.close(); await handler.close();});
 await client.connect(transport);
 assert.deepEqual((await client.listTools()).tools.map(x => x.name).sort(), ['defiant_audience_readiness','defiant_catalog_earnings','defiant_catalog_identity_review','defiant_discover_served_evidence','defiant_evidence_manifest','defiant_explain_change','defiant_inspect_audience_definition','defiant_inspect_evidence_selection','defiant_inspect_identity_group','defiant_june_factual_review','defiant_list_change_comparisons','defiant_list_evidence_selections','defiant_page_semantic_source_search','defiant_read_audience_cells','defiant_read_comparison_examples','defiant_read_selection_receipts','defiant_royalty_evidence_review','defiant_search_retained_sources','defiant_selection_reconciliation','defiant_show_receipt','defiant_source_evidence','defiant_start_semantic_source_search','defiant_store_period_coverage']);
 const call = (name, args = {}) => client.callTool({name, arguments: {organizationId: 'sample_org', ...args}});
 const manifest = (await call('defiant_evidence_manifest')).structuredContent;
 assert.deepEqual(manifest.counts, {months: 1, receipts: 1, selections: 1, identityGroups: 1});
 assert.equal(manifest.receipts, undefined);
 const earnings = (await call('defiant_catalog_earnings', {revision: manifest.revision})).structuredContent;
 assert.equal(earnings.items[0].amount, '-0.000001');
 const receipt = (await call('defiant_show_receipt', {revision: manifest.revision, receiptId: earnings.items[0].receiptIds[0]})).structuredContent;
 assert.equal(receipt.receipt.cells.Amount, '-0.000001');
 for (const result of [await call('defiant_show_receipt', {revision: 'b'.repeat(64), receiptId: 'row_2'}), await call('defiant_evidence_manifest', {organizationId: 'other'})]) {
  assert.equal(result.isError, true); assert.equal(result.structuredContent, undefined); assert.equal(JSON.stringify(result).includes('private resolver detail'), false);
 }
 const listed = (await call('defiant_list_evidence_selections', {revision: manifest.revision})).structuredContent;
 assert.equal(listed.items[0].rowCount, 3); assert.equal(listed.items[0].sourceRecords, undefined);
 const first = (await call('defiant_inspect_evidence_selection', {revision: manifest.revision, selectionId: listed.items[0].id, limit: 2})).structuredContent;
 assert.deepEqual(first.sourceRecords, [2,4]);
 const last = (await call('defiant_inspect_evidence_selection', {revision: manifest.revision, selectionId: listed.items[0].id, limit: 2, offset: first.nextOffset})).structuredContent;
 assert.deepEqual(last.sourceRecords, [8]); assert.equal(last.nextOffset, null);
 assert.equal((await call('defiant_inspect_evidence_selection', {revision: 'b'.repeat(64), selectionId: 'group_a'})).isError, true);
 const cells = (await call('defiant_read_selection_receipts', {revision: manifest.revision, selectionId: 'group_a', limit: 1})).structuredContent;
 assert.equal(cells.receipts[0].record, 2); assert.equal(cells.receipts[0].cells.Amount, '-0.000001');
 const identities = (await call('defiant_catalog_identity_review', {revision: manifest.revision})).structuredContent;
 assert.equal(identities.items[0].id, 'identity_a'); assert.equal(identities.items[0].amount, '-0.000001');
 const identity = (await call('defiant_inspect_identity_group', {identityGroupId: identities.items[0].id, revision: manifest.revision})).structuredContent;
 assert.equal(identity.members[0].sourceId, '001'); assert.deepEqual(identity.members[0].selectionIds, ['group_a']); assert.equal(identity.revision, cells.revision);
 assert.equal((await call('defiant_inspect_identity_group', {identityGroupId: 'identity_a', revision:'b'.repeat(64)})).isError, true);
 const comparisons = (await call('defiant_list_change_comparisons', {revision:manifest.revision})).structuredContent;
 assert.equal(comparisons.total, 0);
 const audiences = (await call('defiant_audience_readiness', {revision:manifest.revision})).structuredContent;
 assert.equal(audiences.total, 0);
 for (const [name,args] of [['defiant_explain_change',{comparisonId:'missing'}],['defiant_inspect_audience_definition',{audienceId:'missing'}]]) {
  const unavailable=await call(name,{...args,revision:manifest.revision});
  assert.equal(unavailable.isError,true); assert.match(unavailable.content[0].text,/404/);
 }
 const june=(await call('defiant_june_factual_review',{selectionId:'group_a',revision:manifest.revision,limit:2})).structuredContent;
 assert.equal(june.purpose,'factual-period-brief');assert.equal(june.readiness,'qualified');assert.equal(june.facts.selection.amount,'-0.000001');assert.deepEqual(june.lineage.sourceRecords,[2,4]);assert.equal(june.commercialReadiness.readiness,'not-ready');
 const drill=(await call('defiant_read_selection_receipts',{selectionId:june.followUp.selectionId,revision:june.followUp.revision,offset:june.followUp.offset,limit:june.followUp.limit})).structuredContent;
 assert.deepEqual(drill.receipts.map(x=>x.record),june.lineage.sourceRecords);assert.equal(drill.revision,june.revision);
 assert.equal((await call('defiant_june_factual_review',{selectionId:'group_a',revision:'b'.repeat(64)})).isError,true);
 const before = loads; allowed = false;
 assert.equal((await call('defiant_catalog_earnings')).isError, true);
 assert.equal(loads, before);
});

test('protocol refuses mismatched resolver and response scopes without returning evidence', async () => {
 const {registerDefiantEvidenceTools} = await import('./defiant-evidence-mcp.js');
 for (const binding of [
  {organizationId: 'other', actor: 'actor', service: {read: async () => {throw new Error('must not read');}}},
  {organizationId: 'sample_org', actor: 'actor', service: {read: async () => ({scope: {organizationId: 'other'}, privateValue: 'do-not-return'})}}
 ]) {
  const callbacks = new Map();
  registerDefiantEvidenceTools({registerTool: (name, config, callback) => callbacks.set(name, callback)}, {resolveEvidence: async () => binding});
  const result = await callbacks.get('defiant_evidence_manifest')({organizationId: 'sample_org'}, {});
  assert.equal(result.isError, true); assert.equal(result.structuredContent, undefined);
  assert.equal(JSON.stringify(result).includes('do-not-return'), false);
 }
});
