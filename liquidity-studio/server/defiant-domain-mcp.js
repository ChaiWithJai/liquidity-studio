import {z} from 'zod/v4';
const recordId=z.string().min(1).max(160).regex(/^[A-Za-z0-9][A-Za-z0-9:_ .-]*$/);
const organizationId=z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
/** The domain and foundation tools resolve the same current authority and service. */
export function registerDefiantDomainTools(server,{execute}){
 const definitions=[
  ['defiant_artist_overview','Artist portfolio overview','Join an explicit artist to recordings, collaborators, regional demand and royalty totals. Synthetic observations are not actual performance.', 'artist-overview',{artistId:recordId}],
  ['defiant_detect_regional_opportunities','Detect regional opportunities','Rank recording-region pairs using three recent versus three prior complete monthly observations. Return the explicit heuristic and evidence, never an execution recommendation.','regional-opportunities',{artistId:recordId.optional(),regionId:recordId.optional(),limit:z.number().int().min(1).max(25).optional()}],
  ['defiant_explain_opportunity','Explain a regional opportunity','Explain an explicit recording and region using the same evidence and score as detection, with simulated rights context and human review required.','explain-opportunity',{trackId:recordId,regionId:recordId}],
  ['defiant_inspect_rights_and_royalties','Inspect rights and royalties','Inspect reconciled monthly streams, integer-cent royalty splits and simulated territory restrictions. Simulated-clear is not actual clearance; this tool cannot approve rights.','rights-and-royalties',{trackId:recordId,territory:z.string().min(1).max(12).optional()}],
  ['defiant_compare_campaign_scenarios','Compare explicit campaign scenarios','Compare one to three caller-supplied budgets against a trailing-three-month baseline and explicit acquisition-cost assumption. Not ML, campaign execution, measured lift or a budget recommendation.','compare-scenarios',{trackId:recordId,regionId:recordId,budgets:z.array(z.number().min(0).max(100000)).min(1).max(3),horizonMonths:z.number().int().min(1).max(12).optional()}],
 ];
 for(const [name,title,description,operation,fields]of definitions)server.registerTool(name,{title,description,inputSchema:z.object({organizationId,...fields}).strict(),annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}},execute(({service,actor},{organizationId:_organizationId,...args})=>service.domain(actor,{operation,...args})));
}
