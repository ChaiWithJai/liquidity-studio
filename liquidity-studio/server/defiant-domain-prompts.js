import {z} from 'zod/v4';
import {listDefiantDomainPathways,DEFIANT_DOMAIN_INSTRUCTIONS} from './defiant-domain-pathways.js';
const record=z.string().min(1).max(160).regex(/^[A-Za-z0-9][A-Za-z0-9:_ .-]*$/);
const budgetValues=value=>value.split(',').map(item=>Number(item.trim()));
const budgetText=z.string().min(1).max(80).refine(value=>/^[0-9., ]+$/.test(value)&&value.split(',').every(item=>item.trim())&&budgetValues(value).length<=3&&new Set(budgetValues(value)).size===budgetValues(value).length&&budgetValues(value).every(number=>Number.isFinite(number)&&number>=0&&number<=100000),'Supply one to three explicit illustrative budgets');
const names={'catalog-to-campaign':'defiant_catalog_activation_review','talent-to-campaign':'defiant_regional_talent_review','opportunity-to-plan':'defiant_opportunity_scenario_review'};
/** Prompts guide the same domain tools; retrieving one performs no reads or writes. */
export function registerDefiantDomainPrompts(server){
 for(const pathway of listDefiantDomainPathways())server.registerPrompt(names[pathway.id],{
  title:pathway.title,description:`${pathway.audience}: ${pathway.question} Fictional evidence only; finish at human review.`,
  argsSchema:z.object({organizationId:z.string().regex(/^[A-Za-z0-9_-]{1,128}$/),artistId:record,trackId:record.optional(),regionId:record.optional(),budgets:budgetText,horizonMonths:z.string().regex(/^(?:[1-9]|1[0-2])$/).optional()}).strict(),
 },args=>{
  const scope={organizationId:args.organizationId},artist={...scope,artistId:args.artistId},budgets=budgetValues(args.budgets),horizonMonths=Number(args.horizonMonths||3);
  return {description:pathway.title,messages:[{role:'user',content:{type:'text',text:[
   DEFIANT_DOMAIN_INSTRUCTIONS,
   `Audience: ${pathway.audience}. Task: ${pathway.question}`,
   `1. Call defiant_artist_overview with ${JSON.stringify(artist)}. Use returned catalog IDs, never an invented recording.`,
   `2. Call defiant_detect_regional_opportunities with ${JSON.stringify({...artist,...(args.regionId?{regionId:args.regionId}:{}),limit:25})}. Compare the actual returned monthly periods and evidence IDs. ${args.trackId?`Use supplied recording ${JSON.stringify(args.trackId)}.`:'Propose a recording/region from the returned ranked synthetic results and state that it is a proposal.'}`,
   '3. Call defiant_inspect_rights_and_royalties for that exact trackId and organizationId. Join ledger and rights records by recording; simulated-clear is not actual approval.',
   '4. Call defiant_explain_opportunity for the same organizationId, trackId and regionId. Explain actual evidence and deterministic method; do not describe a synthetic change as an observed real-world trend.',
   `5. Call defiant_compare_campaign_scenarios for that same organizationId, trackId and regionId with budgets=${JSON.stringify(budgets)} and horizonMonths=${horizonMonths}. These are explicit illustrative inputs, not a budget recommendation.`,
   `6. Produce a human-review packet: artist/recording/region, linked periods/evidence IDs, royalty and rights constraints, scenario assumptions, and these questions: ${JSON.stringify(pathway.reviewQuestions)}. Mark review pending. No campaign action, rights approval or real financial result is authorized.`,
   'If a required record or result is missing, inaccessible or from a different dataset revision, stop and request the missing context. Never fill the gap with fabricated facts or execute arbitrary code.',
  ].join('\n')}}]};
 });
}
