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
