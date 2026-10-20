import { z } from 'zod/v4';
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { listGoldenPathways } from './defiant-golden-pathways.js';
import { buildDefiantDemoView } from './defiant-demo-view.js';

const RESOURCE_URI = 'ui://defiant/research-v1.html';
const organizationId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
const recordId = z.string().min(1).max(160).regex(/^[A-Za-z0-9][A-Za-z0-9:_ .-]*$/);
const boundedText = z.string().trim().min(1).max(200).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const selection = z.object({ artistId: recordId.optional(), trackId: recordId.optional(), sourceId: recordId.optional(), campaignId: recordId.optional(), opportunityId: recordId.optional() }).strict();
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const result = structuredContent => ({ content: [{ type: 'text', text: 'Read-only Defiant research. Supplied claims and rights remain unverified.' }], structuredContent });

/** Register protocol tools only. The host owns authentication, transport and dataset loading. */
export function registerDefiantTools(server, { resolveService, uiHtml } = {}) {
  if (typeof resolveService !== 'function') throw new TypeError('A server-owned service resolver is required');
  if (uiHtml !== undefined && (typeof uiHtml !== 'string' || !uiHtml.trim() || Buffer.byteLength(uiHtml, 'utf8') > 512 * 1024)) throw new TypeError('A bounded, built static UI document is required');
  const resourceUri = uiHtml === undefined ? null : RESOURCE_URI;
  const execute = operation => async (input, context) => {
    try {
      const binding = await resolveService({ organizationId: input.organizationId, context });
      if (!binding || !binding.actor || typeof binding.service?.read !== 'function') throw Object.assign(new Error('Unavailable'), { status: 403 });
      return result({...await operation(binding, input),scope:{organizationId:input.organizationId}});
    } catch (error) {
      const status = [400, 401, 403, 404, 409, 503].includes(error?.status) ? error.status : error instanceof TypeError ? 400 : 500;
      return { isError: true, content: [{ type: 'text', text: `Defiant research request unavailable (${status}).` }] };
    }
  };
  registerAppTool(server, 'defiant_read_data', {
    title: 'Read Defiant reference data', description: 'Read a bounded reference resource. Does not fetch sources, infer rights or execute campaigns.',
    inputSchema: z.object({ organizationId, resource: z.enum(['manifest', 'artists', 'tracks', 'sources', 'campaigns', 'demand', 'royalties', 'opportunities']), id: recordId.optional(), query: boundedText.optional(), cursor: z.string().regex(/^(0|[1-9]\d{0,5})$/).optional(), limit: z.number().int().min(1).max(100).optional() }).strict(),
    annotations, _meta: {},
  }, execute(({ service, actor }, { organizationId: _organizationId, ...request }) => service.read(actor, request)));
  registerAppTool(server, 'defiant_list_pathways', {
    title: 'List Defiant research pathways', description: 'List finite guided research pathways for the authorized reference dataset.',
    inputSchema: z.object({ organizationId }).strict(), annotations, _meta: {},
  }, execute(async ({ service, actor }) => {
    const data = await service.read(actor, { resource: 'manifest' });
    return { schemaVersion: 1, dataset: data.dataset, pathways: listGoldenPathways(), capabilities: data.capabilities };
  }));
  registerAppTool(server, 'defiant_open_guided_view', {
    title: 'Open Defiant guided research', description: 'Inspect linked supplied records and the next human review step. Does not create a campaign or approve claims.',
    inputSchema: z.object({ organizationId, pathwayId: z.enum(['catalog-to-campaign', 'talent-to-campaign', 'opportunity-to-plan']), selection: selection.optional() }).strict(),
    annotations, _meta: resourceUri ? { ui: { resourceUri } } : {},
  }, execute(async ({ service, actor }, input) => buildDefiantDemoView({ data: await service.read(actor, { resource: 'manifest' }), pathwayId: input.pathwayId, selection: input.selection })));
  if (resourceUri) {
    const meta = { ui: { csp: { connectDomains: [], resourceDomains: [], frameDomains: [] } } };
    registerAppResource(server, 'Defiant guided research', resourceUri, { mimeType: RESOURCE_MIME_TYPE, _meta: meta }, async () => ({ contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: uiHtml, _meta: meta }] }));
  }
  return { resourceUri };
}
