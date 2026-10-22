const invalid = () => Object.assign(new Error('Invalid catalog identity review'), {status: 503});
const text = (value, max = 200) => typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
const id = value => text(value, 128) && /^[A-Za-z0-9_-]+$/.test(value);
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const optionalText = (value, max) => value === null || text(value, max);
const scale = 1000000000000n;
// Selection amounts have already passed the evidence decimal-string validator.
const units = value => {
 const negative = value.startsWith('-');
 const [whole, fraction = ''] = (negative ? value.slice(1) : value).split('.');
 const amount = BigInt(whole) * scale + BigInt(fraction.padEnd(12, '0'));
 return negative ? -amount : amount;
};
const amountString = value => {
 const absolute = value < 0n ? -value : value;
 const fraction = String(absolute % scale).padStart(12, '0').replace(/0+$/, '');
 return `${value < 0n ? '-' : ''}${absolute / scale}${fraction ? '.' + fraction : ''}`;
};
const compareText = (a, b) => a < b ? -1 : a > b ? 1 : 0;
export const identityRankingBasis = 'absolute-net-reported-amount-within-currency';

/** Consumes normalized selections. Source observations never establish recording equivalence. */
export function normalizeIdentityGroups(input, selections) {
 if (input === undefined) return [];
 if (!Array.isArray(input) || input.length > 2000) throw invalid();
 const selectionById = new Map(selections.map(row => [row.id, row]));
 const groupIds = new Set(), usedSelections = new Set(), usedRecords = new Map(); let memberCount = 0;
 const groups = input.map(group => {
  if (!object(group) || !id(group.id) || groupIds.has(group.id) || !text(group.artist, 500) || !text(group.title, 500) || !['unreviewed', 'needs-review'].includes(group.reviewStatus) || group.rankingBasis !== identityRankingBasis || !Array.isArray(group.members) || !group.members.length || group.members.length > 2000) throw invalid();
  groupIds.add(group.id); memberCount += group.members.length;
  if (memberCount > 2000) throw invalid();
  const p = group.provenance;
  if (!object(p) || !hash(p.upstreamSnapshotRevision) || !hash(p.upstreamArtifactHash) || typeof p.observedPeriod !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(p.observedPeriod)) throw invalid();
  const memberIds = new Set(), sourceIdentities = new Set(); let currency; let total = 0n; let selectionCount = 0; let selectionRowCount = 0;
  const members = group.members.map(member => {
   if (!object(member) || !id(member.id) || memberIds.has(member.id) || !text(member.sourceSystem, 128) || !text(member.accountScope, 128) || !optionalText(member.sourceId, 128) || !optionalText(member.releaseTitle, 500) || !optionalText(member.upc, 128) || !Array.isArray(member.selectionIds) || !member.selectionIds.length || member.selectionIds.length > 2000) throw invalid();
   memberIds.add(member.id);
   if (member.sourceId !== null) {
    const sourceKey = JSON.stringify([member.sourceSystem, member.accountScope, member.sourceId, member.releaseTitle, member.upc]);
    if (sourceIdentities.has(sourceKey)) throw invalid();
    sourceIdentities.add(sourceKey);
   }
   let subtotal = 0n; let rowCount = 0;
   const selectionIds = member.selectionIds.map(selectionId => {
    const selected = id(selectionId) && selectionById.get(selectionId);
    if (!selected || usedSelections.has(selectionId)) throw invalid();
    usedSelections.add(selectionId);
    let seen = usedRecords.get(selected.sourceHash);
    if (!seen) {seen = new Set(); usedRecords.set(selected.sourceHash, seen);}
    for (const record of selected.sourceRecords) {
     if (seen.has(record)) throw invalid();
     seen.add(record);
    }
    if (currency !== undefined && currency !== selected.currency) throw invalid();
    currency = selected.currency; subtotal += units(selected.amount); rowCount += selected.sourceRecords.length;
    return selectionId;
   });
   total += subtotal; selectionCount += selectionIds.length; selectionRowCount += rowCount;
   return {id: member.id, sourceSystem: member.sourceSystem, accountScope: member.accountScope, sourceId: member.sourceId, identityStatus: member.sourceId === null ? 'missing-source-id' : 'source-observed', releaseTitle: member.releaseTitle, upc: member.upc, selectionIds, amount: amountString(subtotal), currency, selectionRowCount: rowCount};
  }).sort((a, b) => compareText(a.id, b.id));
  return {id: group.id, artist: group.artist, title: group.title, reviewStatus: group.reviewStatus, rankingBasis: identityRankingBasis, provenance: {upstreamSnapshotRevision:p.upstreamSnapshotRevision, upstreamArtifactHash:p.upstreamArtifactHash, observedPeriod:p.observedPeriod}, members, amount:amountString(total), currency, selectionCount, selectionRowCount};
 });
 return groups.sort((a, b) => {
  const currencyOrder = compareText(a.currency, b.currency);
  if (currencyOrder) return currencyOrder;
  const x = units(a.amount), y = units(b.amount), ax = x < 0n ? -x : x, ay = y < 0n ? -y : y;
  return ax > ay ? -1 : ax < ay ? 1 : compareText(a.id, b.id);
 });
}
