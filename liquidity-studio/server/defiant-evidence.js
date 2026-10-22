import {createHash} from 'node:crypto';

const fail = (status, message) => Object.assign(new Error(message), {status});
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const bounded = (value, max = 200) => typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
const identifier = value => bounded(value, 128) && /^[A-Za-z0-9_-]+$/.test(value);
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const month = value => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
const decimal = value => typeof value === 'string' && /^-?(0|[1-9]\d{0,25})(\.\d{1,12})?$/.test(value);
const caps = Object.freeze({readOnly: true, canActivate: false, canApproveRights: false});
const METRIC = 'source-total-earned';

// This provider accepts curated products, never raw archives or arbitrary caller paths.
function normalize(input, organizationId) {
  if (!plain(input) || input.organizationId !== organizationId || input.schemaVersion !== 1 || !bounded(input.coverage, 2000)) throw fail(503, 'Evidence snapshot unavailable');
  if (!Array.isArray(input.months) || input.months.length > 1200 || !Array.isArray(input.receipts) || input.receipts.length > 1000) throw fail(503, 'Evidence snapshot exceeds bounds');
  const keys = new Set();
  const months = input.months.map(row => {
    if (!plain(row) || !month(row.month) || !/^[A-Z]{3}$/.test(row.currency ?? '') || !decimal(row.amount) || !hash(row.sourceHash) || row.metric !== METRIC) throw fail(503, 'Invalid earnings product');
    const key = `${row.month}:${row.currency}`;
    if (keys.has(key)) throw fail(503, 'Duplicate earnings period');
    keys.add(key);
    if (!Array.isArray(row.receiptIds) || row.receiptIds.length > 20 || row.receiptIds.some(value => !identifier(value))) throw fail(503, 'Invalid receipt references');
    return {receiptIds: [...new Set(row.receiptIds)], month: row.month, currency: row.currency, amount: row.amount, metric: METRIC, sourceHash: row.sourceHash};
  }).sort((a, b) => a.month.localeCompare(b.month) || a.currency.localeCompare(b.currency));
  const receiptIds = new Set();
  const receipts = input.receipts.map(row => {
    if (!plain(row) || !identifier(row.id) || receiptIds.has(row.id) || !hash(row.sourceHash) || !bounded(row.member, 500) || !Number.isSafeInteger(row.record) || row.record < 2 || !plain(row.cells)) throw fail(503, 'Invalid evidence receipt');
    receiptIds.add(row.id);
    const entries = Object.entries(row.cells);
    if (!entries.length || entries.length > 40 || entries.some(([key, value]) => !bounded(key, 100) || typeof value !== 'string' || value.length > 2000 || /[\u0000-\u001f\u007f]/.test(value))) throw fail(503, 'Invalid evidence cells');
    return {id: row.id, sourceHash: row.sourceHash, member: row.member, record: row.record, cells: Object.fromEntries(entries)};
  });
  for (const row of months) for (const receiptId of row.receiptIds) {
    const receipt = receipts.find(value => value.id === receiptId);
    if (!receipt || receipt.sourceHash !== row.sourceHash) throw fail(503, 'Receipt source mismatch');
  }
  const data = {schemaVersion: 1, organizationId, coverage: input.coverage, months, receipts};
  const revision = createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return {...data, revision};
}

/** The host owns authenticated actors and a bounded, integrity-checked snapshot loader. */
export function createDefiantEvidenceService({organizationId, authorize, loadSnapshot} = {}) {
  if (!identifier(organizationId) || typeof authorize !== 'function' || typeof loadSnapshot !== 'function') throw new TypeError('Evidence scope, authority and loader required');
  const scope = Object.freeze({organizationId});
  return Object.freeze({
    async read(actor, request = {}) {
      if (!await authorize(actor, scope)) throw fail(403, 'Evidence access denied');
      if (!plain(request) || Object.keys(request).some(key => !['resource', 'revision', 'month', 'currency', 'receiptId', 'offset', 'limit'].includes(key))) throw fail(400, 'Invalid evidence request');
      const {resource = 'manifest', revision, month: selectedMonth, currency, receiptId, offset = 0, limit = 25} = request;
      if (!['manifest', 'earnings', 'receipt'].includes(resource) || (revision !== undefined && !hash(revision)) || !Number.isInteger(offset) || offset < 0 || offset > 1200 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw fail(400, 'Invalid evidence request');
      if (resource !== 'earnings' && (selectedMonth !== undefined || currency !== undefined || request.offset !== undefined || request.limit !== undefined)) throw fail(400, 'Filters require earnings');
      if (resource !== 'receipt' && receiptId !== undefined) throw fail(400, 'Receipt ID requires receipt');
      if ((selectedMonth !== undefined && !month(selectedMonth)) || (currency !== undefined && !/^[A-Z]{3}$/.test(currency)) || (resource === 'receipt' && (!identifier(receiptId) || revision === undefined))) throw fail(400, 'Invalid evidence selection');
      let data;
      try { data = normalize(await loadSnapshot(scope), organizationId); }
      catch (error) { throw fail(503, 'Evidence snapshot unavailable'); }
      // Recheck after asynchronous loading so revocation cannot expose loaded evidence.
      if (!await authorize(actor, scope)) throw fail(403, 'Evidence access denied');
      if (revision !== undefined && revision !== data.revision) throw fail(409, 'Evidence revision changed');
      const base = {schemaVersion: 1, scope, revision: data.revision, coverage: data.coverage, capabilities: caps};
      if (resource === 'manifest') return structuredClone({...base, counts: {months: data.months.length, receipts: data.receipts.length}, metric: METRIC});
      if (resource === 'receipt') {
        const receipt = data.receipts.find(row => row.id === receiptId);
        if (!receipt) throw fail(404, 'Receipt unavailable');
        return structuredClone({...base, receipt, rowConvention: '1-based logical CSV record including header', limitation: 'A receipt is one source record; an aggregate requires its full contributing selection.'});
      }
      const rows = data.months.filter(row => (!selectedMonth || row.month === selectedMonth) && (!currency || row.currency === currency));
      return structuredClone({...base, items: rows.slice(offset, offset + limit), total: rows.length, nextOffset: offset + limit < rows.length ? offset + limit : null});
    }
  });
}
