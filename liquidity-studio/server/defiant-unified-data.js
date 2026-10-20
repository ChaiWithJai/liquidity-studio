/** Read-only projection of an explicitly supplied, unverified reference dataset. */
const RESOURCES = ['artists', 'tracks', 'sources', 'campaigns', 'opportunities'];
const fail = (status, message) => Object.assign(new Error(message), { status });
const text = (value, max = 300) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) throw fail(400, 'Invalid dataset text');
  return value.trim();
};
const id = value => {
  const result = text(value, 160);
  if (!/^[A-Za-z0-9][A-Za-z0-9:_ .-]*$/.test(result)) throw fail(400, 'Invalid dataset identifier');
  return result;
};
const ids = value => {
  if (!Array.isArray(value) || value.length > 100) throw fail(400, 'Invalid dataset references');
  return [...new Set(value.map(id))];
};
const CAPS = Object.freeze({ readOnly: true, canApproveRights: false, canPublish: false });
function normalize(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw fail(400, 'Dataset required');
  const metadata = input.dataset;
  if (!metadata || !['synthetic', 'user-reported'].includes(metadata.provenance)) throw fail(400, 'Dataset provenance required');
  if (metadata.asOf != null && (typeof metadata.asOf !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(metadata.asOf) || !Number.isFinite(Date.parse(metadata.asOf)))) throw fail(400, 'Invalid dataset date');
  const dataset = { id: id(metadata.id), label: text(metadata.label), provenance: metadata.provenance, asOf: metadata.asOf ?? null };
  const output = {};
  for (const resource of RESOURCES) {
    const rows = input[resource] ?? [];
    if (!Array.isArray(rows) || rows.length > 1000) throw fail(400, 'Dataset resource exceeds limit');
    const seen = new Set();
    output[resource] = rows.map(row => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw fail(400, 'Invalid dataset record');
      const key = id(row.id);
      if (seen.has(key)) throw fail(400, 'Duplicate dataset identifier');
      seen.add(key);
      const result = { id: key, [resource === 'artists' ? 'name' : 'title']: text(resource === 'artists' ? row.name : row.title), provenance: dataset.provenance, rightsStatus: 'unknown' };
      if (resource === 'tracks') { result.artistId = id(row.artistId); if (row.isrc != null) result.isrc = text(row.isrc, 40); }
      if (['sources', 'campaigns', 'opportunities'].includes(resource)) {
        if (row.trackId != null) result.trackId = id(row.trackId);
        if (resource === 'sources') result.trackIds = ids(row.trackIds ?? []);
        else result.sourceIds = ids(row.sourceIds ?? []);
      }
      if (resource === 'sources' && row.url != null) {
        let url; try { url = new URL(row.url); } catch { throw fail(400, 'Invalid source URL'); }
        if (url.protocol !== 'https:' || url.username || url.password || String(row.url).length > 2000) throw fail(400, 'Invalid source URL');
        result.url = url.href;
      }
      if (resource === 'campaigns' && row.stage != null) result.stage = text(row.stage, 80);
      if (resource === 'opportunities') {
        if (!Number.isFinite(row.score) || row.score < 0 || row.score > 100 || !Array.isArray(row.reasons) || !row.reasons.length || row.reasons.length > 8) throw fail(400, 'Invalid opportunity explanation');
        Object.assign(result, { score: row.score, reasons: row.reasons.map(reason => text(reason, 500)), method: 'scenario', status: 'proposed' });
        if (row.campaignId != null) result.campaignId = id(row.campaignId);
      }
      if (row.scenario != null) {
        if (typeof row.scenario !== 'object' || Array.isArray(row.scenario)) throw fail(400, 'Invalid scenario');
        const metrics = {};
        for (const field of ['budget', 'spend', 'impressions', 'clicks', 'streams', 'royaltyPerStream', 'roas']) {
          if (row.scenario[field] != null) {
            if (!Number.isFinite(row.scenario[field]) || row.scenario[field] < 0) throw fail(400, 'Invalid scenario metric');
            metrics[field] = row.scenario[field];
          }
        }
        result.scenario = { method: 'scenario', ...metrics };
      }
      return result;
    });
  }
  const has = (resource, key) => output[resource].some(row => row.id === key);
  for (const [resource, rows] of Object.entries(output)) for (const row of rows) {
    if (row.artistId && !has('artists', row.artistId)) throw fail(400, 'Unknown artist reference');
    for (const key of [...(row.trackIds ?? []), ...(row.trackId ? [row.trackId] : [])]) if (!has('tracks', key)) throw fail(400, 'Unknown track reference');
    for (const key of row.sourceIds ?? []) if (!has('sources', key)) throw fail(400, 'Unknown source reference');
    if (row.campaignId && !has('campaigns', row.campaignId)) throw fail(400, 'Unknown campaign reference');
  }
  output.opportunities.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  dataset.counts = Object.fromEntries(RESOURCES.map(resource => [resource, output[resource].length]));
  return { schemaVersion: 1, dataset, ...output, capabilities: CAPS };
}
export function createDefiantUnifiedData({ dataset, organizationId, authorize } = {}) {
  if (typeof authorize !== 'function') throw fail(500, 'Current authority callback required');
  const scope = Object.freeze({ organizationId: id(organizationId) });
  const projection = normalize(dataset); // detached allowlist: caller changes cannot alter this snapshot
  return Object.freeze({
    async read(actor, request = {}) {
      if (!await authorize(actor, scope)) throw fail(403, 'Dataset access denied');
      if (!request || typeof request !== 'object' || Array.isArray(request) || Object.keys(request).some(key => !['resource', 'id', 'query', 'cursor', 'limit'].includes(key))) throw fail(400, 'Invalid dataset read');
      const { resource = 'manifest', query, cursor, limit = 25 } = request;
      if (!['manifest', ...RESOURCES, 'demand', 'royalties'].includes(resource) || !Number.isInteger(limit) || limit < 1 || limit > 100) throw fail(400, 'Invalid dataset resource or limit');
      if (resource === 'manifest') {
        if (request.id != null || query != null || cursor != null) throw fail(400, 'Manifest does not accept filters');
        return structuredClone(projection);
      }
      const needle = query == null ? '' : text(query, 200).toLowerCase();
      const selectedId = request.id == null ? null : id(request.id);
      if (cursor != null && (typeof cursor !== 'string' || !/^(0|[1-9]\d{0,5})$/.test(cursor))) throw fail(400, 'Invalid dataset cursor');
      const offset = cursor == null ? 0 : Number(cursor);
      if (['demand', 'royalties'].includes(resource)) return structuredClone({ schemaVersion: 1, dataset: projection.dataset, resource, available: false, reason: 'No verified history or ledger supplied', items: [], total: 0, nextCursor: null, capabilities: CAPS });
      const rows = projection[resource].filter(row => (!selectedId || row.id === selectedId) && (!needle || `${row.title ?? row.name} ${row.id}`.toLowerCase().includes(needle)));
      return structuredClone({ schemaVersion: 1, dataset: projection.dataset, resource, available: true, items: rows.slice(offset, offset + limit), total: rows.length, nextCursor: offset + limit < rows.length ? String(offset + limit) : null, capabilities: CAPS });
    }
  });
}
