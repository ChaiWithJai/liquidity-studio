import {getGoldenPathway} from './defiant-golden-pathways.js';

const selectionKinds = {artistId:'artists',trackId:'tracks',sourceId:'sources',campaignId:'campaigns',opportunityId:'opportunities'};
const copy = value => structuredClone(value);
/** Consumes only the normalized, authorized createDefiantUnifiedData.read DTO. */
export function buildDefiantDemoView({data,pathwayId,selection={}}) {
  if (data?.schemaVersion !== 1 || !data.dataset || data.capabilities?.readOnly !== true ||
      Object.values(selectionKinds).some(kind => !Array.isArray(data[kind]))) throw new TypeError('A normalized read-only Defiant dataset is required');
  if (!selection || typeof selection !== 'object' || Array.isArray(selection) || Object.keys(selection).some(key => !Object.hasOwn(selectionKinds,key))) throw new TypeError('Unsupported research selection');
  const pathway = getGoldenPathway(pathwayId), resolved = {}, selectedRecords = {};
  for (const [key,kind] of Object.entries(selectionKinds)) {
    if (selection[key] === undefined || selection[key] === '') continue;
    if (typeof selection[key] !== 'string') throw new TypeError('Research selections require record IDs');
    const record = data[kind].find(item => item.id === selection[key]);
    if (!record) throw new TypeError('Selected research record is unavailable');
    resolved[key] = record.id;
    selectedRecords[kind] = copy(record);
  }
  const track = selectedRecords.tracks, artist = selectedRecords.artists, source = selectedRecords.sources,
    campaign = selectedRecords.campaigns, opportunity = selectedRecords.opportunities;
  if (track && artist && track.artistId !== artist.id ||
      track && source && !source.trackIds?.includes(track.id) ||
      track && campaign && campaign.trackId !== track.id ||
      track && opportunity && opportunity.trackId !== track.id ||
      source && campaign && !campaign.sourceIds?.includes(source.id) ||
      source && opportunity && !opportunity.sourceIds?.includes(source.id) ||
      campaign && opportunity && opportunity.campaignId && opportunity.campaignId !== campaign.id) throw new TypeError('Selected records do not share the proposed research context');
  const evidenceIds = new Set([
    ...(source ? [source.id] : []),
    ...(campaign?.sourceIds || []),
    ...(opportunity?.sourceIds || []),
  ]);
  const evidence = data.sources.filter(item => evidenceIds.has(item.id)).map(copy);
  const steps = pathway.steps.map(step => {
    const missingInputs = step.requires.filter(key => !resolved[key]);
    return {...step,state:missingInputs.some(key => !Object.hasOwn(selectionKinds,key))?'unavailable':missingInputs.length?'missing':step.requires.length?'available':'review-required',missingInputs};
  });
  const nextStep = steps.find(step => step.state === 'missing' || step.state === 'unavailable') || steps.find(step => step.state === 'review-required');
  const warnings = [
    data.dataset.provenance === 'synthetic' ? 'Synthetic demonstration. These records are not observed real-world results.' : 'User-reported demonstration. Claims and relationships remain unverified.',
    'Any financial or demand scenario is illustrative, not earned royalties, measured demand or a forecast.',
    'Selecting records does not approve source claims, clear rights or create a campaign.',
  ];
  return {
    schemaVersion:1,view:'guided-research',dataset:copy(data.dataset),pathway,selection:resolved,
    selectedRecords,steps,nextStep:copy(nextStep),evidence,
    status:nextStep?.state === 'unavailable'?'needs-workspace-context':nextStep?.state === 'missing'?'needs-input':'review-required',
    unavailableInputs:[...new Set(pathway.steps.flatMap(step => step.requires).filter(key => !Object.hasOwn(selectionKinds,key)))],
    unknowns:[...pathway.unknowns,'No rights or availability approval is supplied by this read-only view.'],warnings,
    capabilities:{readOnly:true,canApproveRights:false,canPublish:false},
  };
}
