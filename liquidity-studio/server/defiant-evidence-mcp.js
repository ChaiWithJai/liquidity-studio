import {z} from 'zod/v4';
import {createMcpHandler, McpServer} from '@modelcontextprotocol/server';
const organizationId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
const revision = z.string().regex(/^[a-f0-9]{64}$/);
const annotations = {readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false};
/** Private evidence protocol only. The host verifies credentials and current membership. */
export function registerDefiantEvidenceTools(server, {resolveEvidence} = {}) {
 if (typeof resolveEvidence !== 'function') throw new TypeError('Verified evidence resolver required');
 const register = (name, description, shape, resource) => server.registerTool(name, {
  description, annotations, inputSchema: z.object({organizationId, ...shape}).strict()
 }, async (input, context) => {
  try {
   const {organizationId: requestedScope, ...request} = input;
   const binding = await resolveEvidence({organizationId: requestedScope, context});
   if (!binding?.actor || binding.organizationId !== requestedScope || typeof binding.service?.read !== 'function') throw Object.assign(new Error('Denied'), {status: 403});
   const data = await binding.service.read(binding.actor, {...request, resource});
   if (data?.scope?.organizationId !== requestedScope) throw Object.assign(new Error('Denied'), {status: 403});
   return {content: [{type: 'text', text: JSON.stringify(data)}], structuredContent: data};
  } catch (error) {
   const status = [400,401,403,404,409,503].includes(error?.status) ? error.status : 503;
   return {isError: true, content: [{type: 'text', text: `Evidence request unavailable (${status}).`}]};
  }
 });
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
 register('defiant_show_receipt', 'Return exact source cells and a logical CSV record locator at the requested revision. One example record does not establish an entire aggregate.', {
  revision, receiptId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/)
 }, 'receipt');
}
/** Not mounted on the public synthetic endpoint. This creates no listening socket. */
export function createDefiantEvidenceMcpHandler({resolveEvidence} = {}) {
 if (typeof resolveEvidence !== 'function') throw new TypeError('Verified evidence resolver required');
 return createMcpHandler(requestContext => {
  const server = new McpServer({name: 'defiant-private-evidence', version: '1.0.0'});
  registerDefiantEvidenceTools(server, {resolveEvidence: input => resolveEvidence({...input, requestContext})});
  return server;
 }, {responseMode: 'json'});
}
