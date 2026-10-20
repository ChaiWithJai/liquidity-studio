import test from 'node:test';
import assert from 'node:assert/strict';
import {listGoldenPathways,getGoldenPathway} from './defiant-golden-pathways.js';
import {buildDefiantDemoView} from './defiant-demo-view.js';

// Deliberately synthetic contract records, not owner archive rows or maintained data.
const fixture = () => ({
  schemaVersion:1,
  dataset:{id:'fixture',label:'Synthetic contract fixture',provenance:'synthetic',asOf:null,counts:{artists:1,tracks:1,sources:1,campaigns:1,opportunities:1}},
  artists:[{id:'artist-a',name:'Illustrative artist',provenance:'synthetic',rightsStatus:'unknown'}],
  tracks:[{id:'track-a',artistId:'artist-a',title:'Illustrative recording',provenance:'synthetic',rightsStatus:'unknown'}],
  sources:[{id:'source-a',trackIds:['track-a'],title:'Illustrative evidence',provenance:'synthetic',rightsStatus:'unknown'}],
  campaigns:[{id:'campaign-a',trackId:'track-a',sourceIds:['source-a'],title:'Illustrative campaign',provenance:'synthetic',rightsStatus:'unknown'}],
  opportunities:[{id:'opportunity-a',trackId:'track-a',sourceIds:['source-a'],campaignId:'campaign-a',title:'Illustrative opportunity',method:'scenario',status:'proposed',score:40,reasons:['Illustrative heuristic'],provenance:'synthetic',rightsStatus:'unknown'}],
  capabilities:{readOnly:true,canApproveRights:false,canPublish:false},
});
test('finite pathway descriptors are independent copies and reject arbitrary programs', () => {
  const pathways = listGoldenPathways();
  assert.deepEqual(pathways.map(p=>p.id),['catalog-to-campaign','talent-to-campaign','opportunity-to-plan']);
  pathways[0].steps[0].label = 'changed';
  assert.equal(getGoldenPathway('catalog-to-campaign').steps[0].label,'Choose a catalog recording');
  assert.throws(()=>getGoldenPathway('eval'),/Unknown Defiant pathway/);
});
test('catalog selection resolves supplied evidence without inventing a saved moment or clearance', () => {
  const data=fixture(),before=structuredClone(data);
  const view=buildDefiantDemoView({data,pathwayId:'catalog-to-campaign',selection:{trackId:'track-a',sourceId:'source-a'}});
  assert.equal(view.selectedRecords.tracks.id,'track-a');
  assert.deepEqual(view.evidence.map(s=>s.id),['source-a']);
  assert.equal(view.nextStep.id,'moment');
  assert.equal(view.nextStep.state,'unavailable');
  assert.equal(view.status,'needs-workspace-context');
  assert.deepEqual(view.unavailableInputs,['momentId']);
  assert.equal(view.capabilities.canApproveRights,false);
  assert.match(view.warnings.join(' '),/Synthetic demonstration/);
  assert.equal(view.selectedRecords.tracks.rightsStatus,'unknown');
  view.evidence[0].title='changed';
  assert.deepEqual(data,before);
});
test('talent context stays unavailable rather than treating arbitrary region or collaborator IDs as facts', () => {
  const data=fixture();
  const view=buildDefiantDemoView({data,pathwayId:'talent-to-campaign',selection:{artistId:'artist-a'}});
  assert.equal(view.nextStep.id,'region');
  assert.deepEqual(view.unavailableInputs,['regionId','collaboratorId']);
  assert.throws(()=>buildDefiantDemoView({data,pathwayId:'talent-to-campaign',selection:{regionId:'invented'}}),/Unsupported research selection/);
});
test('opportunity inspection carries scenario evidence and explicit financial unknowns, not a completed plan', () => {
  const view=buildDefiantDemoView({data:fixture(),pathwayId:'opportunity-to-plan',selection:{opportunityId:'opportunity-a',trackId:'track-a',sourceId:'source-a'}});
  assert.equal(view.selectedRecords.opportunities.method,'scenario');
  assert.equal(view.nextStep.id,'constraints');
  assert.equal(view.status,'review-required');
  assert.match(view.unknowns.join(' '),/not earned revenue/);
  assert.equal(view.capabilities.canPublish,false);
  assert.equal('completed' in view,false);
});
test('unknown IDs and unrelated evidence cannot masquerade as the selected track context', () => {
  const data=fixture();
  assert.throws(()=>buildDefiantDemoView({data,pathwayId:'catalog-to-campaign',selection:{sourceId:'missing'}}),/unavailable/);
  data.sources[0].trackIds=['other-track'];
  assert.throws(()=>buildDefiantDemoView({data,pathwayId:'catalog-to-campaign',selection:{trackId:'track-a',sourceId:'source-a'}}),/do not share/);
});

test('campaign and source selections must share evidence even without an explicit track selection', () => {
  const data=fixture();
  data.campaigns[0].sourceIds=[];
  assert.throws(()=>buildDefiantDemoView({data,pathwayId:'catalog-to-campaign',selection:{campaignId:'campaign-a',sourceId:'source-a'}}),/do not share/);
});
