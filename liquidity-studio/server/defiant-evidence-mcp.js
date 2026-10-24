import {z} from 'zod/v4';
import {createMcpHandler, McpServer} from '@modelcontextprotocol/server';
const organizationId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
const revision = z.string().regex(/^[a-f0-9]{64}$/);
const stages = new Set(['scope_check','resolve_binding','service_read','authority_before_snapshot','request_validation','snapshot_load','snapshot_normalize','authority_after_snapshot','revision_check','resource_read','receipt_lookup','source_records_load','source_records_normalize','authority_after_records','worksheet_load','worksheet_normalize','authority_after_worksheet','response_scope','response_serialize']);
// Constructor-owned diagnostics only. Never await a sink or let it change tool behavior.
function observe(sink, value) {
 try { const result = sink?.(value); if (result && typeof result.then === 'function') Promise.resolve(result).catch(() => {}); } catch {}
}
const annotations = {readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false};
/** Private evidence protocol only. The host verifies credentials and current membership. */
export function registerDefiantEvidenceTools(server, {resolveEvidence, unauthorizedChallenge, boundOrganizationId, onOutcome} = {}) {
 if (typeof resolveEvidence !== 'function') throw new TypeError('Verified evidence resolver required');
 if (onOutcome !== undefined && typeof onOutcome !== 'function') throw new TypeError('Evidence outcome sink required');
 if(unauthorizedChallenge!==undefined&&(typeof unauthorizedChallenge!=='string'||unauthorizedChallenge.length>1024||/[\r\n]/.test(unauthorizedChallenge)))throw new TypeError('Invalid evidence auth challenge');
 if(boundOrganizationId!==undefined&&!/^[A-Za-z0-9_-]{1,128}$/.test(boundOrganizationId))throw new TypeError('Invalid bound evidence organization');
 const register = (name, description, shape, resource, fixedMode) => server.registerTool(name, {
  description, annotations, inputSchema: z.object({organizationId:boundOrganizationId===undefined?organizationId:organizationId.optional(), ...shape}).strict()
 }, async (input, context) => {
  let stage='scope_check', outcome='error', status=503;
  const onStage=value=>{if(stages.has(value))stage=value;};
  try {
   const {organizationId: suppliedScope, ...request} = input;
   const requestedScope=suppliedScope??boundOrganizationId;
   if(boundOrganizationId!==undefined&&requestedScope!==boundOrganizationId)throw Object.assign(new Error('Denied'),{status:403});
   stage='resolve_binding';
   const binding = await resolveEvidence({organizationId: requestedScope, context});
   if (!binding?.actor || binding.organizationId !== requestedScope || typeof binding.service?.read !== 'function') throw Object.assign(new Error('Denied'), {status: 403});
   stage='service_read';
   const data = await binding.service.read(binding.actor, {...request, ...(fixedMode===undefined?{}:{mode:fixedMode}), resource}, {onStage});
   stage='response_scope';
   if (data?.scope?.organizationId !== requestedScope) throw Object.assign(new Error('Denied'), {status: 403});
   stage='response_serialize';
   const result={content: [{type: 'text', text: JSON.stringify(data)}], structuredContent: data};
   outcome='success';status=200;return result;
  } catch (error) {
   status = [400,401,403,404,409,503].includes(error?.status) ? error.status : 503;
   if(error?.status===401&&unauthorizedChallenge)return {isError:true,content:[{type:'text',text:'Evidence authorization required.'}],_meta:{'mcp/www_authenticate':[unauthorizedChallenge]}};
   return {isError: true, content: [{type: 'text', text: `Evidence request unavailable (${status}).`}]};
  } finally {
   observe(onOutcome,Object.freeze({event:'defiant_evidence_tool_outcome',tool:name,outcome,status,stage}));
  }
 });
 register('defiant_source_evidence','Find existing served evidence references for an exact registered source hash. Follow typed links to original financial records or worksheet cells; these navigation references do not prove complete source coverage.', {revision,sourceHash:z.string().regex(/^[a-f0-9]{64}(?![\s\S])/),offset:z.number().int().min(0).max(24400).optional(),limit:z.number().int().min(1).max(100).optional()},'source-evidence');
 register('defiant_selection_reconciliation','Inspect retained selected-derived-cell reconciliation evidence bound to a current selection. Runtime verifies metadata and signed totals, not source cells, provider completeness or predicate truth.', {revision,selectionId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$(?![\s\S])/ )},'selection-reconciliation');
 const semanticFilters={periodPresence:z.enum(['dated','undated']).optional(),sourceId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$(?![\s\S])/).optional(),format:z.enum(['csv','xlsx','xls','pdf','png','jpg','zip','tar.gz','json','other']).optional(),kind:z.enum(['root','member']).optional(),sourceHash:z.string().length(64).regex(/^[a-f0-9]{64}$/).optional(),fromMonth:z.string().length(7).regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),toMonth:z.string().length(7).regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional()};
 register('defiant_start_semantic_source_search','Explicitly start one capped retained-source metadata query embedding. Supply current revision, a nonblank query, and a stable idempotencyKey. Omit every exact-filter field for no restrictions; do not send a nested filters object. Do not send mode, sessionId, offset or limit: the first page is always offset 0, limit 25. Use defiant_page_semantic_source_search for later pages. After an uncertain start, reuse exactly the same key and arguments; never retry with a new key. Suggestions are metadata ranking, not factual support, identity or completeness.',{
  revision,query:z.string().max(200).regex(/^[^\u0000-\u001f\u007f]*$(?![\s\S])/).regex(/\S/),idempotencyKey:z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$(?![\s\S])/),...semanticFilters
 },'retained-sources','semantic');
 register('defiant_page_semantic_source_search','Read an existing retained-source semantic session without another embedding. Supply the returned current revision and sessionId, plus offset and limit (for example 25 and 25). Do not supply mode, query, idempotencyKey or exact filters. Expired, revoked or changed sessions remain unavailable; this tool never starts a replacement search.',{
  revision,sessionId:z.string().length(64).regex(/^[a-f0-9]+$/),offset:z.number().int().min(0).max(256),limit:z.number().int().min(1).max(100)
 },'retained-sources','semantic-page');
 register('defiant_search_retained_sources','Search retained source and archive-member metadata within the registered intake scope. Keyword search by default. Prefer defiant_start_semantic_source_search and defiant_page_semantic_source_search for explicit semantic operations; legacy mode inputs remain supported. Explicit semantic mode invokes one capped metadata query embedding; semantic-page reuses its session. Suggestions never prove facts, identity or provider completeness.', {
  mode:z.enum(['keyword','semantic','semantic-page']).optional(),sessionId:z.string().length(64).regex(/^[a-f0-9]+$/).optional(),idempotencyKey:z.string().max(128).regex(/^[A-Za-z0-9_-]+$(?![\s\S])/).optional(),periodPresence:z.enum(['dated','undated']).optional(),revision:revision.optional(),query:z.string().max(200).refine(v=>!/[\u0000-\u001f\u007f]/.test(v)).optional(),sourceId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$(?![\s\S])/).optional(),format:z.enum(['csv','xlsx','xls','pdf','png','jpg','zip','tar.gz','json','other']).optional(),kind:z.enum(['root','member']).optional(),sourceHash:z.string().length(64).regex(/^[a-f0-9]{64}$/).optional(),fromMonth:z.string().length(7).regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),toMonth:z.string().length(7).regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),offset:z.number().int().min(0).max(5000).optional(),limit:z.number().int().min(1).max(100).optional()
 },'retained-sources');
 register('defiant_store_period_coverage','Inspect supplied store-period observations and exact all-period versus mutually observed amount comparisons. Missing observations do not imply zero activity or missing delivery.',{revision,storeCoverageId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$/).optional(),offset:z.number().int().min(0).max(100).optional(),limit:z.number().int().min(1).max(100).optional()},'store-coverage');
 register('defiant_discover_served_evidence','Discover metadata for sources referenced by served evidence. Deterministic text/earnings-period filters only; not a complete bronze inventory or semantic ranking.', {revision:revision.optional(),query:z.string().max(200).refine(v=>!/[\u0000-\u001f\u007f]/.test(v)).optional(),fromMonth:z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),toMonth:z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),offset:z.number().int().min(0).max(5000).optional(),limit:z.number().int().min(1).max(100).optional()},'coverage');
 register('defiant_evidence_manifest', 'Inspect authorized real-evidence coverage and revision. Counts are not a claim of complete source intake.', {}, 'manifest');
 register('defiant_catalog_earnings', 'Read reported earnings by month and currency with source receipt references. These are not profit, catalog valuation or causal attribution.', {
  revision: revision.optional(), month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(), currency: z.string().regex(/^[A-Z]{3}$/).optional(), offset: z.number().int().min(0).max(1200).optional(), limit: z.number().int().min(1).max(100).optional()
 }, 'earnings');
 register('defiant_list_evidence_selections', 'List source-local aggregates with complete producer-supplied record selections. Does not recompute totals or establish external completeness.', {
  revision: revision.optional(), offset: z.number().int().min(0).max(2000).optional(), limit: z.number().int().min(1).max(100).optional()
 }, 'selections');
 register('defiant_inspect_evidence_selection', 'Page through every logical source-record locator behind a selected aggregate at one pinned revision. Locators are not the source cells themselves.', {
  revision, selectionId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/), offset: z.number().int().min(0).max(500000).optional(), limit: z.number().int().min(1).max(100).optional()
 }, 'selection');
 register('defiant_read_selection_receipts', 'Read original cells for a bounded page of an aggregate selection. Requires the current revision and a configured integrity-checked private source resolver.', {
  revision, selectionId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/), offset: z.number().int().min(0).max(500000).optional(), limit: z.number().int().min(1).max(100).optional()
 }, 'selection-receipts');
 register('defiant_catalog_identity_review', 'List source-identity groups for human review, ranked by absolute net reported amount within each currency. Does not merge recordings or score opportunities.', {
  revision: revision.optional(), offset: z.number().int().min(0).max(2000).optional(), limit: z.number().int().min(1).max(100).optional()
 }, 'catalog-identity-review');
 register('defiant_inspect_identity_group', 'Inspect source-system/account identities, observed releases and receipt-selection references at one revision. Missing IDs remain explicit; equivalence is unreviewed.', {
  revision, identityGroupId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/), offset: z.number().int().min(0).max(2000).optional(), limit: z.number().int().min(1).max(100).optional()
 }, 'identity-group');
 register('defiant_list_change_comparisons', 'List curated equal-period earnings comparisons with declared source scope and hashes. Arithmetic only; no causal attribution.', {
  revision:revision.optional(), offset:z.number().int().min(0).max(100).optional(), limit:z.number().int().min(1).max(100).optional()
 }, 'comparisons');
 register('defiant_explain_change', 'Page exact signed contributions for one comparison at a pinned revision. Example record references are not complete receipts or causal evidence.', {
  revision, comparisonId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$/), offset:z.number().int().min(0).max(10000).optional(), limit:z.number().int().min(1).max(100).optional()
 }, 'explain-change');
 register('defiant_audience_readiness', 'Read supplied audience definitions and missing evidence. Does not compute populations, verify consent or authorize activation.', {
  revision:revision.optional(), offset:z.number().int().min(0).max(200).optional(), limit:z.number().int().min(1).max(100).optional()
 }, 'audience-readiness');
 register('defiant_inspect_audience_definition', 'Inspect one source-attributed segment rule and worksheet cell references at a pinned revision. Proposed offers remain unapproved.', {
  revision, audienceId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$/)
 }, 'audience-definition');
 register('defiant_read_comparison_examples', 'Read original cells for one producer-selected comparison reference. Examples are not the full group aggregate; no caller paths or hashes.', {
  revision, comparisonId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$/), groupId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$/), referenceIndex:z.number().int().min(0).max(47)
 }, 'comparison-examples');
 register('defiant_read_audience_cells', 'Read source worksheet cells behind one supplied audience definition. Analyst evidence assessments are separate; no formula execution or activation.', {
  revision, audienceId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$/)
 }, 'audience-cells');
 register('defiant_june_factual_review', 'Inspect a qualified June2025 factual review packet for one source-local selection, with exact lineage and purpose-specific missing evidence. No commercial recommendation or model inference.', {
  revision, selectionId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$/), offset:z.number().int().min(0).max(500000).optional(), limit:z.number().int().min(1).max(100).optional()
 }, 'june-review');
 register('defiant_show_receipt', 'Return exact source cells and a logical CSV record locator at the requested revision. One example record does not establish an entire aggregate.', {
  revision, receiptId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/)
 }, 'receipt');
}
/** Not mounted on the public synthetic endpoint. This creates no listening socket. */
export function createDefiantEvidenceMcpHandler({resolveEvidence, onOutcome} = {}) {
 if (typeof resolveEvidence !== 'function') throw new TypeError('Verified evidence resolver required');
 if (onOutcome !== undefined && typeof onOutcome !== 'function') throw new TypeError('Evidence outcome sink required');
 return createMcpHandler(requestContext => {
  const server = new McpServer({name: 'defiant-private-evidence', version: '1.0.0'});
  registerDefiantEvidenceTools(server, {onOutcome, resolveEvidence: input => resolveEvidence({...input, requestContext})});
  return server;
 }, {responseMode: 'json'});
}
