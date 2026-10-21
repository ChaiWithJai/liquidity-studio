// Domain workflows inspect actual joined service results; they do not authorize execution.
const toolSequence=[
 {operation:'artist-overview',tool:'defiant_artist_overview',label:'Inspect artist and catalog'},
 {operation:'regional-opportunities',tool:'defiant_detect_regional_opportunities',label:'Compare regional demand evidence'},
 {operation:'rights-and-royalties',tool:'defiant_inspect_rights_and_royalties',label:'Inspect linked rights and royalty records'},
 {operation:'explain-opportunity',tool:'defiant_explain_opportunity',label:'Explain the selected recording and region'},
 {operation:'compare-scenarios',tool:'defiant_compare_campaign_scenarios',label:'Compare explicit illustrative budgets'},
];
const definitions=[
 {id:'catalog-to-campaign',title:'Catalog activation review',audience:'Campaign strategist',question:'Which recording and region merit a review-required campaign proposal?',reviewQuestions:['Does the supplied catalog and demand evidence support the proposed recording/region?', 'Which intended uses, rights and budget assumptions require human confirmation?']},
 {id:'talent-to-campaign',title:'Regional artist research review',audience:'Artist manager',question:'Where is the artist showing a regional signal, and what remains unverified?',reviewQuestions:['Is the regional change supported by the linked periods rather than a claimed real-world trend?', 'Who must confirm collaborator availability, participation and use rights?']},
 {id:'opportunity-to-plan',title:'Opportunity and scenario review',audience:'Commercial decision maker',question:'How do linked demand, royalty and rights records constrain an illustrative plan?',reviewQuestions:['Can every proposed opportunity be traced to the selected artist, recording and region?', 'How sensitive is the scenario to budget, rate and untrained baseline assumptions?']},
].map(pathway=>({...pathway,requiredInputs:['artistId','budgets'],toolSequence}));
const copy=value=>structuredClone(value);
const id=value=>typeof value==='string'&&value.length<=160&&/^[A-Za-z0-9][A-Za-z0-9:_ .-]*$/.test(value);
export const DEFIANT_DOMAIN_INSTRUCTIONS='Use the unified data layer to identify an artist and catalog, then the media-and-entertainment domain tools to inspect regional demand and linked royalties/rights, then the governed pathway to compare explicit illustrative scenarios and produce a human-review packet. Trace claims to returned evidence IDs and periods. The demo uses synthetic data. State that once when introducing the dataset; do not repeat the disclosure in every sentence or record label. Focus on the business question and returned evidence. The baseline/scenario math is deterministic and untrained, not measured real-world demand or a financial forecast. Simulated rights statuses never constitute actual approval. Do not invent missing records, execute campaigns, approve rights or imply Databricks/Foundry integration.';
export const listDefiantDomainPathways=()=>copy(definitions);
export function getDefiantDomainPathway(pathwayId){const found=definitions.find(pathway=>pathway.id===pathwayId);if(!found)throw TypeError('Unknown domain pathway');return copy(found);}
function request(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>!['pathwayId','artistId','trackId','regionId','budgets','horizonMonths'].includes(key)))throw TypeError('Unsupported domain pathway input');
 const pathway=getDefiantDomainPathway(input.pathwayId),missingInputs=[];
 if(input.artistId===undefined)missingInputs.push('artistId');else if(!id(input.artistId))throw TypeError('Choose a supplied artist');
 for(const key of ['trackId','regionId'])if(input[key]!==undefined&&!id(input[key]))throw TypeError('Choose a supplied recording and region');
 if(input.budgets===undefined)missingInputs.push('budgets');else if(!Array.isArray(input.budgets)||input.budgets.length<1||input.budgets.length>3||input.budgets.some(value=>!Number.isFinite(value)||value<0||value>100000)||new Set(input.budgets).size!==input.budgets.length)throw TypeError('Supply one to three explicit illustrative budgets');
 const horizonMonths=input.horizonMonths??3;if(!Number.isInteger(horizonMonths)||horizonMonths<1||horizonMonths>12)throw TypeError('Choose a horizon of one to twelve months');
 return {pathway,missingInputs,horizonMonths};
}
/** Read-only orchestration over the same current-authorized domain service used by MCP. */
export async function runDefiantDomainPathway(service,actor,input){
 const {pathway,missingInputs,horizonMonths}=request(input);
 if(missingInputs.length)return {schemaVersion:1,pathway,status:'needs-input',missingInputs,nextStep:'Supply the artist and explicit scenario budgets; no domain reads have run.'};
 if(typeof service?.domain!=='function')throw TypeError('A scoped Defiant domain service is required');
 let snapshot=null;const results=[];
 async function read(command){
  const result=await service.domain(actor,command);
  if(result?.schemaVersion!==1||result.operation!==command.operation||!result.dataset?.revision||result.capabilities?.readOnly!==true||result.capabilities.canApproveRights!==false||result.capabilities.canPublish!==false)throw Error('Invalid domain read');
  const key=JSON.stringify([result.dataset.id,result.dataset.revision]);if(snapshot!==null&&snapshot!==key)throw Error('Dataset changed; restart the pathway against one snapshot');snapshot=key;results.push(result);return result;
 }
 const overview=await read({operation:'artist-overview',artistId:input.artistId});
 if(overview.artist?.id!==input.artistId)throw Error('Artist context did not match');
 const regional=await read({operation:'regional-opportunities',artistId:input.artistId,...(input.regionId?{regionId:input.regionId}:{}),limit:25});
 const candidate=regional.items?.find(item=>(!input.trackId||item.trackId===input.trackId)&&(!input.regionId||item.regionId===input.regionId));
 if(!candidate)return {schemaVersion:1,pathway,dataset:copy(overview.dataset),status:'needs-input',missingInputs:['trackId','regionId'],overview,regional,nextStep:'No matching opportunity is in these bounded results. Choose a supplied recording and region; do not invent a signal.'};
 if(candidate.artistId!==input.artistId||!overview.recordings?.some(recording=>recording.id===candidate.trackId))throw Error('Regional opportunity does not belong to the selected catalog');
 const rightsAndRoyalties=await read({operation:'rights-and-royalties',trackId:candidate.trackId});
 const explanation=await read({operation:'explain-opportunity',trackId:candidate.trackId,regionId:candidate.regionId});
 const scenarioComparison=await read({operation:'compare-scenarios',trackId:candidate.trackId,regionId:candidate.regionId,budgets:copy(input.budgets),horizonMonths});
 if(rightsAndRoyalties.recording?.id!==candidate.trackId||explanation.recording?.id!==candidate.trackId||explanation.region?.id!==candidate.regionId||scenarioComparison.recording?.id!==candidate.trackId||scenarioComparison.region?.id!==candidate.regionId||scenarioComparison.trained!==false||rightsAndRoyalties.canApproveRights!==false||rightsAndRoyalties.reviewRequired!==true||scenarioComparison.reviewRequired!==true)throw Error('Joined domain results do not preserve the proposed context');
 return {schemaVersion:1,pathway,dataset:copy(overview.dataset),status:'human-review-required',selection:{artistId:input.artistId,trackId:candidate.trackId,regionId:candidate.regionId,method:input.trackId&&input.regionId?'explicit-selection':'first-matching-ranked-synthetic-proposal'},overview,regional,rightsAndRoyalties,explanation,scenarioComparison,evidenceIds:[...new Set(results.flatMap(result=>result.evidenceIds||[]))],review:{status:'pending',questions:pathway.reviewQuestions,unknowns:['Demand and royalty records in this demo are synthetic.','Scenario projections are untrained assumptions, not financial forecasts.','Simulated rights, collaborators and availability require separate real-world confirmation.'],nextStep:'A person reviews the evidence, intended use and assumptions before any separate campaign action.'},capabilities:{readOnly:true,canApproveRights:false,canExecuteCampaign:false,canPublish:false}};
}
