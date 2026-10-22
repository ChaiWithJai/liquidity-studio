import {normalizeComparisons, normalizeAudienceDefinitions} from './defiant-evidence-products.js';
import {normalizeIdentityGroups, identityRankingBasis} from './defiant-evidence-identity.js';
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
    if (!plain(row) || !month(row.month) || typeof row.currency !== 'string' || !/^[A-Z]{3}$/.test(row.currency) || !decimal(row.amount) || !hash(row.sourceHash) || row.metric !== METRIC) throw fail(503, 'Invalid earnings product');
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
  const selectionIds = new Set(); let recordCount = 0;
  if (input.selections !== undefined && (!Array.isArray(input.selections) || input.selections.length > 2000)) throw fail(503, 'Invalid aggregate selections');
  const selections = (input.selections || []).map(row => {
    if (!plain(row) || !identifier(row.id) || selectionIds.has(row.id) || !bounded(row.label, 500) || !hash(row.sourceHash) || !decimal(row.amount) || typeof row.currency !== 'string' || !/^[A-Z]{3}$/.test(row.currency) || !Array.isArray(row.sourceRecords) || !row.sourceRecords.length) throw fail(503, 'Invalid aggregate selection');
    selectionIds.add(row.id); recordCount += row.sourceRecords.length;
    if (recordCount > 500000) throw fail(503, 'Aggregate selections exceed bounds');
    let previous = 1;
    for (const record of row.sourceRecords) {
      if (!Number.isSafeInteger(record) || record <= previous) throw fail(503, 'Invalid selection record order');
      previous = record;
    }
    return {id: row.id, label: row.label, sourceHash: row.sourceHash, amount: row.amount, currency: row.currency, sourceRecords: [...row.sourceRecords]};
  });
  const identityGroups = normalizeIdentityGroups(input.identityGroups, selections);
  const comparisons = normalizeComparisons(input.comparisons, months);
  const audienceDefinitions = normalizeAudienceDefinitions(input.audienceDefinitions);
  const data = {schemaVersion: 1, organizationId, coverage: input.coverage, months, receipts, selections, ...(comparisons === undefined ? {} : {comparisons}), ...(audienceDefinitions === undefined ? {} : {audienceDefinitions}), ...(input.identityGroups === undefined ? {} : {identityGroups})};
  const revision = createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return {...data, revision};
}

/** The host owns authenticated actors and a bounded, integrity-checked snapshot loader. */
export function createDefiantEvidenceService({organizationId, authorize, loadSnapshot, loadSourceRecords} = {}) {
  if (!identifier(organizationId) || typeof authorize !== 'function' || typeof loadSnapshot !== 'function') throw new TypeError('Evidence scope, authority and loader required');
  if (loadSourceRecords !== undefined && typeof loadSourceRecords !== 'function') throw new TypeError('Server-owned source resolver required');
  const scope = Object.freeze({organizationId});
  return Object.freeze({
    async read(actor, request = {}) {
      if (!await authorize(actor, scope)) throw fail(403, 'Evidence access denied');
      if (!plain(request) || Object.keys(request).some(key => !['resource', 'revision', 'month', 'currency', 'receiptId', 'selectionId', 'identityGroupId', 'comparisonId', 'audienceId', 'offset', 'limit'].includes(key))) throw fail(400, 'Invalid evidence request');
      const {resource = 'manifest', revision, month: selectedMonth, currency, receiptId, selectionId, identityGroupId, comparisonId, audienceId, offset = 0, limit = 25} = request;
      if (!['manifest', 'earnings', 'receipt', 'selections', 'selection', 'selection-receipts', 'catalog-identity-review', 'identity-group', 'comparisons', 'explain-change', 'audience-readiness', 'audience-definition'].includes(resource) || (revision !== undefined && !hash(revision)) || !Number.isInteger(offset) || offset < 0 || offset > 500000 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw fail(400, 'Invalid evidence request');
      if ((resource !== 'earnings' && (selectedMonth !== undefined || currency !== undefined)) || (!['earnings', 'selections', 'selection', 'selection-receipts', 'catalog-identity-review', 'identity-group', 'comparisons', 'explain-change', 'audience-readiness'].includes(resource) && (request.offset !== undefined || request.limit !== undefined))) throw fail(400, 'Filters require earnings');
      if ((!['selection', 'selection-receipts'].includes(resource) && selectionId !== undefined) || (['selection', 'selection-receipts'].includes(resource) && (!identifier(selectionId) || revision === undefined))) throw fail(400, 'Invalid selection request');
      if ((resource !== 'identity-group' && identityGroupId !== undefined) || (resource === 'identity-group' && (!identifier(identityGroupId) || revision === undefined))) throw fail(400, 'Invalid identity group request');
      if (['catalog-identity-review', 'identity-group'].includes(resource) && offset > 2000) throw fail(400, 'Invalid identity page');
      if ((resource === 'earnings' && offset > 1200) || (resource === 'selections' && offset > 2000)) throw fail(400, 'Invalid page offset');
      if ((resource !== 'explain-change' && comparisonId !== undefined) || (resource === 'explain-change' && (!identifier(comparisonId) || revision === undefined))) throw fail(400, 'Invalid comparison request');
      if ((resource !== 'audience-definition' && audienceId !== undefined) || (resource === 'audience-definition' && (!identifier(audienceId) || revision === undefined))) throw fail(400, 'Invalid audience request');
      if ((resource === 'comparisons' && offset > 100) || (['audience-readiness', 'audience-definition'].includes(resource) && offset > 200)) throw fail(400, 'Invalid product page');
      if (resource === 'explain-change' && offset > 10000) throw fail(400, 'Invalid comparison page');
      if (resource !== 'receipt' && receiptId !== undefined) throw fail(400, 'Receipt ID requires receipt');
      if ((selectedMonth !== undefined && !month(selectedMonth)) || (currency !== undefined && (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency))) || (resource === 'receipt' && (!identifier(receiptId) || revision === undefined))) throw fail(400, 'Invalid evidence selection');
      let data;
      try { data = normalize(await loadSnapshot(scope), organizationId); }
      catch (error) { throw fail(503, 'Evidence snapshot unavailable'); }
      // Recheck after asynchronous loading so revocation cannot expose loaded evidence.
      if (!await authorize(actor, scope)) throw fail(403, 'Evidence access denied');
      if (revision !== undefined && revision !== data.revision) throw fail(409, 'Evidence revision changed');
      const base = {schemaVersion: 1, scope, revision: data.revision, coverage: data.coverage, capabilities: caps};
      if (resource === 'manifest') return structuredClone({...base, counts: {...(data.comparisons === undefined ? {} : {comparisons:data.comparisons.length}), ...(data.audienceDefinitions === undefined ? {} : {audienceDefinitions:data.audienceDefinitions.length}), months: data.months.length, receipts: data.receipts.length, selections: data.selections.length, ...(data.identityGroups === undefined ? {} : {identityGroups: data.identityGroups.length})}, metric: METRIC});
      if (resource === 'comparisons' || resource === 'explain-change') {
        const rows = data.comparisons || [];
        const summary = ({groups, ...row}) => ({...row, groupCount:groups.length});
        const limitation = 'Arithmetic contribution only, not causal attribution or opportunity scoring. grossDecrease is a positive magnitude; delta = offsetIncrease - grossDecrease. Period verification is a producer assertion. Example logical record references are not complete selections or loaded source cells; full group receipt drilldown is unavailable.';
        if (resource === 'comparisons') return structuredClone({...base, items:rows.slice(offset,offset+limit).map(summary), total:rows.length, nextOffset:offset+limit<rows.length?offset+limit:null, limitation});
        const row = rows.find(v=>v.id===comparisonId);
        if (!row) throw fail(404, 'Comparison unavailable');
        return structuredClone({...base, comparison:summary(row), groups:row.groups.slice(offset,offset+limit), total:row.groups.length, nextOffset:offset+limit<row.groups.length?offset+limit:null, limitation});
      }
      if (resource === 'audience-readiness' || resource === 'audience-definition') {
        const rows=data.audienceDefinitions || [];
        const limitation='Supplied segment definitions and evidence availability only. Membership, consent, customer/listener identity and activation eligibility are not computed or verified. Offer text is a proposal, not approval.';
        if(resource==='audience-readiness') return structuredClone({...base,items:rows.slice(offset,offset+limit),total:rows.length,nextOffset:offset+limit<rows.length?offset+limit:null,limitation});
        const definition=rows.find(v=>v.id===audienceId);
        if(!definition) throw fail(404,'Audience definition unavailable');
        return structuredClone({...base,definition,limitation});
      }
      if (resource === 'catalog-identity-review' || resource === 'identity-group') {
        const groups = data.identityGroups || [];
        const summary = ({members, ...row}) => ({...row, memberCount: members.length, missingSourceIds: members.filter(member => member.sourceId === null).length});
        const limitation = 'Source identities and referenced selection amounts only; recording equivalence is unreviewed. Amounts sum unique selection references, not independently recomputed source cells. Overlapping source-record memberships are rejected across the identity queue. Ranking is review priority within currency, not an opportunity score or action approval.';
        if (resource === 'catalog-identity-review') return structuredClone({...base, items: groups.slice(offset, offset + limit).map(summary), total: groups.length, nextOffset: offset + limit < groups.length ? offset + limit : null, rankingBasis: identityRankingBasis, limitation});
        const group = groups.find(row => row.id === identityGroupId);
        if (!group) throw fail(404, 'Identity group unavailable');
        return structuredClone({...base, group: summary(group), members: group.members.slice(offset, offset + limit), total: group.members.length, nextOffset: offset + limit < group.members.length ? offset + limit : null, limitation});
      }
      if (resource === 'selections' || resource === 'selection' || resource === 'selection-receipts') {
        const summary = ({sourceRecords, ...row}) => ({...row, rowCount: sourceRecords.length});
        const limitation = 'Complete producer-supplied record selection; declared aggregate is not recomputed by this read. Exact source cells require the pinned source partition.';
        if (resource === 'selections') return structuredClone({...base, items: data.selections.slice(offset, offset + limit).map(summary), total: data.selections.length, nextOffset: offset + limit < data.selections.length ? offset + limit : null, limitation});
        const selected = data.selections.find(row => row.id === selectionId);
        if (!selected) throw fail(404, 'Selection unavailable');
        if (resource === 'selection-receipts') {
          if (!loadSourceRecords) throw fail(503, 'Source cells unavailable');
          const records = selected.sourceRecords.slice(offset, offset + limit);
          let receipts;
          try {
            const loaded = await loadSourceRecords({...scope, sourceHash: selected.sourceHash, sourceRecords: [...records], revision: data.revision});
            receipts = normalize({schemaVersion: 1, organizationId, coverage: data.coverage, months: [], receipts: loaded}, organizationId).receipts;
            if (receipts.length !== records.length || receipts.some((row, i) => row.sourceHash !== selected.sourceHash || row.record !== records[i])) throw fail(503, 'Source selection mismatch');
          } catch { throw fail(503, 'Source cells unavailable'); }
          if (!await authorize(actor, scope)) throw fail(403, 'Evidence access denied');
          return structuredClone({...base, selection: summary(selected), receipts, total: selected.sourceRecords.length, nextOffset: offset + limit < selected.sourceRecords.length ? offset + limit : null, limitation: 'Exact source cells supplied by the host integrity-checked partition resolver; this page is not the entire aggregate unless it contains every contributing record.'});
        }
        return structuredClone({...base, selection: summary(selected), sourceRecords: selected.sourceRecords.slice(offset, offset + limit), total: selected.sourceRecords.length, nextOffset: offset + limit < selected.sourceRecords.length ? offset + limit : null, rowConvention: '1-based logical CSV record including header', limitation});
      }
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
