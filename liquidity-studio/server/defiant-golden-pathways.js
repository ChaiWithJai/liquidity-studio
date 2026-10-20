// Finite guided research contracts. These describe work; they never execute it.
const definitions = [
  {
    id: 'catalog-to-campaign', title: 'Catalog to campaign',
    requiredInputs: ['trackId'],
    steps: [
      {id:'catalog',label:'Choose a catalog recording',requires:['trackId']},
      {id:'evidence',label:'Inspect supplied source evidence',requires:['sourceId']},
      {id:'moment',label:'Select and review a working moment',requires:['momentId']},
      {id:'plan',label:'Prepare a review-required campaign brief',requires:[]},
    ],
    unknowns: ['Source relevance and recording match require human review.', 'Media rights and editorial approval are not established.'],
  },
  {
    id: 'talent-to-campaign', title: 'Talent to campaign',
    requiredInputs: ['regionId','artistId'],
    steps: [
      {id:'region',label:'Choose a region',requires:['regionId']},
      {id:'artist',label:'Inspect an artist and original evidence',requires:['artistId','sourceId']},
      {id:'collaborator',label:'Inspect a proposed collaborator',requires:['collaboratorId']},
      {id:'plan',label:'Prepare a review-required campaign brief',requires:[]},
    ],
    unknowns: ['Relationships and collaborator roles require verification.', 'Availability, participation and media rights remain unknown.'],
  },
  {
    id: 'opportunity-to-plan', title: 'Illustrative opportunity to plan',
    requiredInputs: ['opportunityId'],
    steps: [
      {id:'opportunity',label:'Choose an illustrative opportunity',requires:['opportunityId']},
      {id:'evidence',label:'Inspect its evidence and method',requires:['sourceId']},
      {id:'constraints',label:'Review rights and financial unknowns',requires:[]},
      {id:'plan',label:'Prepare a review-required plan',requires:[]},
    ],
    unknowns: ['Illustrative demand is not measured audience demand.', 'Royalty examples are not earned revenue or a financial forecast.', 'Rights and availability are not cleared by this workflow.'],
  },
];
const copy = value => structuredClone(value);
export function listGoldenPathways() { return copy(definitions); }
export function getGoldenPathway(id) {
  const pathway = definitions.find(item => item.id === id);
  if (!pathway) throw new TypeError('Unknown Defiant pathway');
  return copy(pathway);
}
