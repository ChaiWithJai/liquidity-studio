import {fail} from './auth.js';
const resources=new Set(['retained-sources','store-coverage','coverage','manifest','earnings','receipt','selections','selection','selection-receipts','catalog-identity-review','identity-group','comparisons','explain-change','audience-readiness','audience-definition','comparison-examples','audience-cells','june-review']);
/** Existing Studio authentication owns identity; this adapter only parses bounded reads. */
export async function defiantEvidenceRequest({service,user,route,method,url}) {
 const match=/^\/api\/studio\/defiant-evidence\/([A-Za-z0-9_-]{1,128})\/([a-z-]+)$/.exec(route);
 if(!match||!resources.has(match[2]))throw fail(404,'Unknown evidence resource');
 if(method!=='GET')throw fail(405,'Evidence is read-only');
 const input={resource:match[2]};
 for(const [key,value] of url.searchParams){
  if(!['revision','month','currency','receiptId','selectionId','identityGroupId','comparisonId','audienceId','groupId','referenceIndex','offset','limit','query','fromMonth','toMonth','storeCoverageId','sourceId','format','kind','sourceHash'].includes(key)||Object.hasOwn(input,key)||(!value&&key!=='query')||value.length>(key==='query'?200:128))throw fail(400,'Invalid evidence filter');
  if(['offset','limit','referenceIndex'].includes(key)){
   if(!/^(0|[1-9]\d{0,5})$/.test(value))throw fail(400,'Invalid evidence page');
   input[key]=Number(value);
  }else input[key]=value;
 }
 const result=await service.read(user,input);
 if(result?.scope?.organizationId!==match[1])throw fail(403,'Evidence scope mismatch');
 return result;
}
