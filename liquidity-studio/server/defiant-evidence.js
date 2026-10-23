import {createSemanticSessions} from './defiant-semantic-sessions.js';
import {normalizeSemanticIndex} from './defiant-semantic-index.js';
import {normalizeSelectionReconciliations,selectionReconciliationView} from './defiant-selection-reconciliation.js';
import {normalizeRetainedSourceRegister,searchRetainedSources,validateRetainedSourceRequest} from './defiant-retained-sources.js';
import {composeEvidenceDecision} from './defiant-evidence-decision.js';
import {normalizeStorePeriodCoverage} from './defiant-store-period-coverage.js';
import {discoverServedEvidenceCoverage,validateServedEvidenceDiscoveryRequest} from './defiant-evidence-discovery.js';
import {normalizeWorksheetCell} from './defiant-worksheet-cells.js';
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
  const selectionReconciliations = normalizeSelectionReconciliations(input.selectionReconciliations, selections);
  const identityGroups = normalizeIdentityGroups(input.identityGroups, selections);
  const comparisons = normalizeComparisons(input.comparisons, months);
  const audienceDefinitions = normalizeAudienceDefinitions(input.audienceDefinitions);
  const storePeriodCoverage = normalizeStorePeriodCoverage(input.storePeriodCoverage, comparisons);
  const retainedSourceRegister = normalizeRetainedSourceRegister(input.retainedSourceRegister);
  const data = {...(selectionReconciliations === undefined ? {} : {selectionReconciliations}), ...(retainedSourceRegister === undefined ? {} : {retainedSourceRegister}), schemaVersion: 1, organizationId, coverage: input.coverage, months, receipts, selections, ...(storePeriodCoverage === undefined ? {} : {storePeriodCoverage}), ...(comparisons === undefined ? {} : {comparisons}), ...(audienceDefinitions === undefined ? {} : {audienceDefinitions}), ...(input.identityGroups === undefined ? {} : {identityGroups})};
  const revision = createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return {...data, revision};
}

/** The host owns authenticated actors and a bounded, integrity-checked snapshot loader. */
export function createDefiantEvidenceService({organizationId, authorize, loadSnapshot, loadSourceRecords, loadWorksheetCells, loadSemanticIndex, semanticDependencies} = {}) {
  if (!identifier(organizationId) || typeof authorize !== 'function' || typeof loadSnapshot !== 'function') throw new TypeError('Evidence scope, authority and loader required');
  if (loadSourceRecords !== undefined && typeof loadSourceRecords !== 'function') throw new TypeError('Server-owned source resolver required');
  if (loadWorksheetCells !== undefined && typeof loadWorksheetCells !== 'function') throw new TypeError('Server-owned worksheet resolver required');
  const scope = Object.freeze({organizationId});
  const semantic=typeof loadSemanticIndex==='function'&&semanticDependencies?createSemanticSessions({...semanticDependencies,readContext:async actor=>{
    if(!await authorize(actor,scope))throw fail(403,'Evidence access denied');
    const snapshot=normalize(await loadSnapshot(scope),organizationId);
    const index=normalizeSemanticIndex(await loadSemanticIndex(scope),{organizationId,register:snapshot.retainedSourceRegister});
    if(!await authorize(actor,scope))throw fail(403,'Evidence access denied');
    return {actor,snapshot,index};
  }}):null;
  return Object.freeze({
    async read(actor, request = {}, {onStage} = {}) {
      const mark=stage=>{try { const result=onStage?.(stage);if(result&&typeof result.then==='function')Promise.resolve(result).catch(()=>{}); } catch {}};
      mark('authority_before_snapshot');
      if (!await authorize(actor, scope)) throw fail(403, 'Evidence access denied');
      mark('request_validation');
      if (!plain(request) || Object.keys(request).some(key => !['resource', 'revision', 'month', 'currency', 'receiptId', 'selectionId', 'identityGroupId', 'comparisonId', 'audienceId', 'groupId', 'referenceIndex', 'offset', 'limit', 'query', 'fromMonth', 'toMonth', 'storeCoverageId', 'sourceId', 'format', 'kind', 'sourceHash','periodPresence','mode','sessionId','idempotencyKey'].includes(key))) throw fail(400, 'Invalid evidence request');
      const {resource = 'manifest', revision, month: selectedMonth, currency, receiptId, selectionId, identityGroupId, comparisonId, audienceId, groupId, referenceIndex, query, fromMonth, toMonth, storeCoverageId, sourceId, format, kind, sourceHash, periodPresence, mode, sessionId, idempotencyKey, offset = 0, limit = 25} = request;
      if (!['selection-reconciliation', 'retained-sources', 'store-coverage', 'coverage', 'manifest', 'earnings', 'receipt', 'selections', 'selection', 'selection-receipts', 'catalog-identity-review', 'identity-group', 'comparisons', 'explain-change', 'audience-readiness', 'audience-definition', 'comparison-examples', 'audience-cells', 'june-review'].includes(resource) || (revision !== undefined && !hash(revision)) || !Number.isInteger(offset) || offset < 0 || offset > 500000 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw fail(400, 'Invalid evidence request');
      if ((resource !== 'earnings' && (selectedMonth !== undefined || currency !== undefined)) || (!['retained-sources', 'store-coverage', 'coverage', 'earnings', 'selections', 'selection', 'selection-receipts', 'catalog-identity-review', 'identity-group', 'comparisons', 'explain-change', 'audience-readiness', 'june-review'].includes(resource) && (request.offset !== undefined || request.limit !== undefined))) throw fail(400, 'Filters require earnings');
      if ((!['selection-reconciliation', 'selection', 'selection-receipts', 'june-review'].includes(resource) && selectionId !== undefined) || (['selection-reconciliation', 'selection', 'selection-receipts', 'june-review'].includes(resource) && (!identifier(selectionId) || revision === undefined))) throw fail(400, 'Invalid selection request');
      if ((resource !== 'store-coverage' && storeCoverageId !== undefined) || (resource === 'store-coverage' && (revision === undefined || (storeCoverageId !== undefined && !identifier(storeCoverageId)) || offset > 100))) throw fail(400, 'Invalid store coverage request');
      if ((resource !== 'identity-group' && identityGroupId !== undefined) || (resource === 'identity-group' && (!identifier(identityGroupId) || revision === undefined))) throw fail(400, 'Invalid identity group request');
      if (['catalog-identity-review', 'identity-group'].includes(resource) && offset > 2000) throw fail(400, 'Invalid identity page');
      if ((resource === 'earnings' && offset > 1200) || (resource === 'selections' && offset > 2000)) throw fail(400, 'Invalid page offset');
      if ((!['explain-change','comparison-examples'].includes(resource) && comparisonId !== undefined) || (['explain-change','comparison-examples'].includes(resource) && (!identifier(comparisonId) || revision === undefined))) throw fail(400, 'Invalid comparison request');
      if ((!['audience-definition','audience-cells'].includes(resource) && audienceId !== undefined) || (['audience-definition','audience-cells'].includes(resource) && (!identifier(audienceId) || revision === undefined))) throw fail(400, 'Invalid audience request');
      if ((resource !== 'comparison-examples' && (groupId !== undefined || referenceIndex !== undefined)) || (resource === 'comparison-examples' && (!identifier(groupId) || !Number.isInteger(referenceIndex) || referenceIndex < 0 || referenceIndex >= 48))) throw fail(400, 'Invalid comparison example request');
      if ((resource === 'comparisons' && offset > 100) || (['audience-readiness', 'audience-definition'].includes(resource) && offset > 200)) throw fail(400, 'Invalid product page');
      if (resource === 'explain-change' && offset > 10000) throw fail(400, 'Invalid comparison page');
      if (resource !== 'receipt' && receiptId !== undefined) throw fail(400, 'Receipt ID requires receipt');
      if ((selectedMonth !== undefined && !month(selectedMonth)) || (currency !== undefined && (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency))) || (resource === 'receipt' && (!identifier(receiptId) || revision === undefined))) throw fail(400, 'Invalid evidence selection');
      if(!['coverage','retained-sources'].includes(resource)&&(query!==undefined||fromMonth!==undefined||toMonth!==undefined))throw fail(400,'Coverage filters require coverage');
      if(resource!=='retained-sources'&&[sourceId,format,kind,sourceHash,periodPresence,mode,sessionId,idempotencyKey].some(v=>v!==undefined))throw fail(400,'Retained source filters require retained sources');
      if(resource==='retained-sources')validateRetainedSourceRequest({query,sourceId,format,kind,sourceHash,fromMonth,toMonth,periodPresence,offset,limit});
      if(resource==='coverage')validateServedEvidenceDiscoveryRequest({query,fromMonth,toMonth,offset,limit});
      let data;
      try { mark('snapshot_load');const snapshot=await loadSnapshot(scope);mark('snapshot_normalize');data = normalize(snapshot, organizationId); }
      catch (error) { throw fail(503, 'Evidence snapshot unavailable'); }
      mark('authority_after_snapshot');
      // Recheck after asynchronous loading so revocation cannot expose loaded evidence.
      if (!await authorize(actor, scope)) throw fail(403, 'Evidence access denied');
      mark('revision_check');
      if (revision !== undefined && revision !== data.revision) throw fail(409, 'Evidence revision changed');
      mark('resource_read');
      const base = {schemaVersion: 1, scope, revision: data.revision, coverage: data.coverage, capabilities: caps};
      if(resource==='retained-sources'&&mode!==undefined&&mode!=='keyword'){
        if(!semantic)throw fail(503,'Semantic metadata index unavailable');
        if(mode==='semantic'){
          if(sessionId!==undefined||request.offset!==undefined||request.limit!==undefined)throw fail(400,'Invalid explicit semantic request');
          return semantic.start(actor,{revision,query,idempotencyKey,filters:Object.fromEntries(Object.entries({sourceId,format,kind,sourceHash,fromMonth,toMonth,periodPresence}).filter(([,v])=>v!==undefined))});
        }
        if(mode==='semantic-page'){
          if([query,idempotencyKey,sourceId,format,kind,sourceHash,fromMonth,toMonth,periodPresence].some(v=>v!==undefined))throw fail(400,'Invalid semantic page request');
          return semantic.page(actor,{revision,sessionId,offset,limit});
        }
        throw fail(400,'Invalid retained search mode');
      }
      if(resource==='retained-sources'&&(sessionId!==undefined||idempotencyKey!==undefined))throw fail(400,'Session fields require explicit semantic search');
      if(resource==='retained-sources'){const result=searchRetainedSources(data,{query,sourceId,format,kind,sourceHash,fromMonth,toMonth,periodPresence,offset,limit});return semantic?{...result,semanticSearch:{configured:true,requiresExplicitInvocation:true,indexVerified:false}}:result;}
      if(resource==='coverage')return discoverServedEvidenceCoverage(data,{query,fromMonth,toMonth,offset,limit});
      if (resource === 'selection-reconciliation') return structuredClone({...base,...selectionReconciliationView(data,selectionId)});
      if (resource === 'manifest') return structuredClone({...base, counts: {...(data.selectionReconciliations === undefined ? {} : {selectionReconciliations:data.selectionReconciliations.length}), ...(data.comparisons === undefined ? {} : {comparisons:data.comparisons.length}), ...(data.audienceDefinitions === undefined ? {} : {audienceDefinitions:data.audienceDefinitions.length}), months: data.months.length, receipts: data.receipts.length, selections: data.selections.length, ...(data.identityGroups === undefined ? {} : {identityGroups: data.identityGroups.length})}, metric: METRIC});
      if (resource === 'store-coverage') {
        const products=(data.storePeriodCoverage||[]).map(product=>({...product,settlementMaturityComparability:'not-established',limitation:product.limitation+' Settlement maturity comparability has not been established; legacy settlementMaturityComparable:false does not demonstrate unequal maturity.'}));
        if(storeCoverageId!==undefined){const product=products.find(p=>p.id===storeCoverageId);if(!product)throw fail(404,'Store coverage unavailable');return structuredClone({...base,product});}
        return structuredClone({...base,items:products.slice(offset,offset+limit),total:products.length,nextOffset:offset+limit<products.length?offset+limit:null});
      }
      if (resource === 'june-review') {
        if (selectedMonth !== undefined || currency !== undefined || receiptId !== undefined) throw fail(400, 'Invalid June review request');
        const selected = data.selections.find(row => row.id === selectionId);
        if (!selected) throw fail(404, 'Selection unavailable');
        const periods = data.months.filter(row => row.sourceHash === selected.sourceHash && row.currency === selected.currency);
        if (periods.length !== 1 || periods[0].month !== '2025-06') throw fail(409, 'June source period unavailable');
        const period = periods[0];
        const {sourceRecords, ...selection} = selected;
        return structuredClone({...base,
          storeCoverage:(data.storePeriodCoverage||[]).filter(p=>p.currency===selected.currency&&p.observations.some(o=>o.month==='2025-06'&&o.sourceHash===selected.sourceHash)).map(p=>({id:p.id,storeKey:p.storeKey,qualificationScope:'source-period context, not proof this selection has store-specific activity',observation:p.observations.find(o=>o.month==='2025-06'),expectedDelivery:p.expectedDelivery,limitation:p.limitation,followUp:{resource:'store-coverage',storeCoverageId:p.id,revision:data.revision}})),
          ...composeEvidenceDecision({selection,month:'2025-06',revision:data.revision,products:data.storePeriodCoverage||[],receiptsAvailable:typeof loadSourceRecords==='function'}),
          purpose:'factual-period-brief', readiness:'qualified', month:'2025-06',
          question:'What do the supplied June statements report for this selection, and which records support it?',
          facts:{selection:{...selection,rowCount:sourceRecords.length},period:{month:period.month,currency:period.currency,amount:period.amount,metric:period.metric,sourceHash:period.sourceHash}},
          lineage:{sourceHash:selected.sourceHash,sourceRecords:sourceRecords.slice(offset,offset+limit),rowConvention:'1-based logical CSV record including header',total:sourceRecords.length,nextOffset:offset+limit<sourceRecords.length?offset+limit:null},
          followUp:{resource:'selection-receipts',selectionId,revision:data.revision,offset,limit,available:typeof loadSourceRecords==='function'},
          missingEvidence:['External delivery completeness','Comparable settlement maturity','Verified cross-provider recording identity'],
          commercialReadiness:{purpose:'current-commercial-recommendation',readiness:'not-ready',missingEvidence:['Current comparable demand or dated buyer transactions','Validated relevant identity joins','Offer economics','Current action authority']},
          nextWork:'Inspect original selection cells and resolve the documented evidence gaps before making a broader performance or commercial claim.',
          limitation:'Deterministic supplied-statement facts, not model inference. Source hash and currency bind the selection to its declared June period. Amounts are supplied curated aggregates, not recomputed by this read; the selection is not necessarily the entire period. This page contains bounded locators, not original cells or proof of complete provider delivery. No causal attribution, valuation or action approval.'});
      }
      if (resource === 'comparison-examples') {
        const comparison=(data.comparisons || []).find(row=>row.id===comparisonId);
        const group=comparison?.groups.find(row=>row.id===groupId);
        const reference=group?.sourceReferences[referenceIndex];
        if(!reference) throw fail(404,'Comparison reference unavailable');
        mark('source_records_load');
        if(!loadSourceRecords) throw fail(503,'Source cells unavailable');
        let receipts;
        try {
          const loaded=reference.exampleRecords.length ? await loadSourceRecords({...scope,sourceHash:reference.sourceHash,sourceRecords:[...reference.exampleRecords],revision:data.revision}) : [];
          mark('source_records_normalize');
          receipts=normalize({schemaVersion:1,organizationId,coverage:data.coverage,months:[],receipts:loaded},organizationId).receipts;
          if(receipts.length!==reference.exampleRecords.length || receipts.some((row,i)=>row.sourceHash!==reference.sourceHash || row.record!==reference.exampleRecords[i])) throw fail(503,'Source examples mismatch');
        } catch {throw fail(503,'Source cells unavailable');}
        mark('authority_after_records');
        if(!await authorize(actor,scope)) throw fail(403,'Evidence access denied');
        return structuredClone({...base,comparisonId,groupId,referenceIndex,reference,receipts,fullSelectionAvailable:false,limitation:'Original cells for producer-selected examples only; these examples do not reconcile or represent the full group aggregate.'});
      }
      if (resource === 'audience-cells') {
        const definition=(data.audienceDefinitions || []).find(row=>row.id===audienceId);
        if(!definition) throw fail(404,'Audience definition unavailable');
        mark('worksheet_load');
        if(!loadWorksheetCells) throw fail(503,'Worksheet cells unavailable');
        let worksheet;
        try {
          const loaded=await loadWorksheetCells({...scope,sourceHash:definition.sourceHash,sheet:definition.sheet,cellRefs:[...definition.cellRefs],revision:data.revision});
          mark('worksheet_normalize');
          if(!plain(loaded)||loaded.sourceHash!==definition.sourceHash||loaded.sheet!==definition.sheet||!Array.isArray(loaded.cells)||loaded.cells.length!==definition.cellRefs.length)throw fail(503,'Worksheet mismatch');
          const cells=loaded.cells.map((cell,i)=>{
            if(!plain(cell)||cell.cellRef!==definition.cellRefs[i])throw fail(503,'Worksheet mismatch');
            return normalizeWorksheetCell(cell);
          });
          worksheet={sourceHash:loaded.sourceHash,sheet:loaded.sheet,cells};
        }catch{throw fail(503,'Worksheet cells unavailable');}
        mark('authority_after_worksheet');
        if(!await authorize(actor,scope))throw fail(403,'Evidence access denied');
        return structuredClone({...base,audienceId,worksheet,limitation:'Source cell strings from the host integrity-checked worksheet resolver; no formula execution. Supplied definitions do not verify populations or consent. Required, observed and missing evidence are analyst assessments, not workbook claims.'});
      }
      if (resource === 'comparisons' || resource === 'explain-change') {
        const rows = data.comparisons || [];
        const summary = ({groups, ...row}) => ({...row, groupCount:groups.length,arithmeticReconciliation:{status:'checked',basis:'curated-group-sums-equal-supplied-period-totals',exclusions:['complete-source-cell-recomputation','usage-rate-adjustment-explanation','provider-completeness','settlement-maturity-comparability','causal-attribution']}});
        const limitation = 'Arithmetic contribution only, not causal attribution or opportunity scoring. grossDecrease is a positive magnitude; delta = offsetIncrease - grossDecrease. Period verification is a producer assertion. Example logical record references are not complete selections or loaded source cells; full group receipt drilldown is unavailable.';
        if (resource === 'comparisons') return structuredClone({...base, items:rows.slice(offset,offset+limit).map(summary), total:rows.length, nextOffset:offset+limit<rows.length?offset+limit:null, limitation});
        const row = rows.find(v=>v.id===comparisonId);
        if (!row) throw fail(404, 'Comparison unavailable');
        return structuredClone({...base, comparison:summary(row), groups:row.groups.slice(offset,offset+limit), total:row.groups.length, nextOffset:offset+limit<row.groups.length?offset+limit:null, limitation});
      }
      if (resource === 'audience-readiness' || resource === 'audience-definition') {
        const rows=(data.audienceDefinitions || []).map(row=>({...row,definitionOrigin:'source-workbook',evidenceAssessmentOrigin:'analyst-assessment'}));
        const limitation='Workbook-attributed segment definitions; required, observed and missing evidence are analyst assessments of availability, not workbook claims. Supplied definitions and availability only. Membership, consent, customer/listener identity and activation eligibility are not computed or verified. Offer text is a proposal, not approval.';
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
          mark('source_records_load');
          if (!loadSourceRecords) throw fail(503, 'Source cells unavailable');
          const records = selected.sourceRecords.slice(offset, offset + limit);
          let receipts;
          try {
            const loaded = await loadSourceRecords({...scope, sourceHash: selected.sourceHash, sourceRecords: [...records], revision: data.revision});
            mark('source_records_normalize');
            receipts = normalize({schemaVersion: 1, organizationId, coverage: data.coverage, months: [], receipts: loaded}, organizationId).receipts;
            if (receipts.length !== records.length || receipts.some((row, i) => row.sourceHash !== selected.sourceHash || row.record !== records[i])) throw fail(503, 'Source selection mismatch');
          } catch { throw fail(503, 'Source cells unavailable'); }
          mark('authority_after_records');
          if (!await authorize(actor, scope)) throw fail(403, 'Evidence access denied');
          return structuredClone({...base, selection: summary(selected), receipts, total: selected.sourceRecords.length, nextOffset: offset + limit < selected.sourceRecords.length ? offset + limit : null, limitation: 'Exact source cells supplied by the host integrity-checked partition resolver; this page is not the entire aggregate unless it contains every contributing record.'});
        }
        const matchingPeriods=data.months.filter(p=>p.sourceHash===selected.sourceHash&&p.currency===selected.currency);
        const juneReviewAvailable=matchingPeriods.length===1&&matchingPeriods[0].month==='2025-06';
        return structuredClone({...base, juneReviewAvailable, selection: summary(selected), sourceRecords: selected.sourceRecords.slice(offset, offset + limit), total: selected.sourceRecords.length, nextOffset: offset + limit < selected.sourceRecords.length ? offset + limit : null, rowConvention: '1-based logical CSV record including header', limitation});
      }
      if (resource === 'receipt') {
        mark('receipt_lookup');
        const receipt = data.receipts.find(row => row.id === receiptId);
        if (!receipt) throw fail(404, 'Receipt unavailable');
        return structuredClone({...base, receipt, rowConvention: '1-based logical CSV record including header', limitation: 'A receipt is one source record; an aggregate requires its full contributing selection.'});
      }
      const rows = data.months.filter(row => (!selectedMonth || row.month === selectedMonth) && (!currency || row.currency === currency));
      return structuredClone({...base, items: rows.slice(offset, offset + limit), total: rows.length, nextOffset: offset + limit < rows.length ? offset + limit : null});
    }
  });
}
