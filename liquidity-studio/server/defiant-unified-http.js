import {listGoldenPathways} from './defiant-golden-pathways.js';
import {buildDefiantDemoView} from './defiant-demo-view.js';
import {fail} from './auth.js';
import {runDefiantDomainPathway} from './defiant-domain-pathways.js';
const resources=new Set(['manifest','artists','tracks','sources','campaigns','demand','royalties','opportunities','regions','collaborators','rights','forecasts','pathways','view','domain','domain-review']);
/** Transport-only adapter. The injected facade owns authorization and data projection. */
export async function defiantUnifiedRequest({service,user,route,method,url,body}) {
 const match=/^\/api\/studio\/defiant-data\/([A-Za-z0-9_-]{1,128})\/([a-z-]+)$/.exec(route);
 if(!match||!resources.has(match[2]))throw fail(404,'Unknown Defiant data resource');
 if(match[2]==='domain-review'){
  if(method!=='POST')throw fail(405,'Domain review requires an explicit read-only command');
  if(url.search)throw fail(400,'Domain review does not accept query filters');
  if(!body?.artistId||!body?.budgets)throw fail(400,'Artist and explicit scenario budgets required');
  try{return {...await runDefiantDomainPathway(service,user,body),view:'domain-review',scope:{organizationId:match[1]}};}catch(error){if(error instanceof TypeError)throw fail(400,error.message);throw error;}
 }
 if(match[2]==='domain'){
  if(method!=='POST')throw fail(405,'Domain research requires an explicit read-only command');
  if(url.search)throw fail(400,'Domain commands do not accept query filters');
  return service.domain(user,body);
 }
 if(method!=='GET')throw fail(405,'Defiant data resources are read-only');
 if(['pathways','view'].includes(match[2])) {
  const selection={},viewKeys=['artistId','trackId','sourceId','campaignId','opportunityId'];let pathwayId;
  for(const [key,value] of url.searchParams){
   if(!value||value.length>160)throw fail(400,'Invalid guided research filter');
   if(key==='pathwayId'&&pathwayId===undefined)pathwayId=value;
   else if(viewKeys.includes(key)&&!Object.hasOwn(selection,key))selection[key]=value;
   else throw fail(400,'Unsupported or repeated guided research filter');
  }
  if(match[2]==='pathways'&&url.search)throw fail(400,'Pathways do not accept filters');
  const data=await service.read(user,{resource:'manifest'});
  if(match[2]==='pathways')return {schemaVersion:1,dataset:data.dataset,pathways:listGoldenPathways(),capabilities:data.capabilities};
  try{return buildDefiantDemoView({data,pathwayId,selection});}catch(error){if(error instanceof TypeError)throw fail(400,error.message);throw error;}
 }
 const input={resource:match[2]};
 for(const [key,value] of url.searchParams){
  if(!['id','query','cursor','limit'].includes(key)||Object.hasOwn(input,key))throw fail(400,'Unsupported or repeated Defiant data filter');
  if(key==='limit'){
   if(!/^[1-9][0-9]{0,2}$/.test(value)||Number(value)>100)throw fail(400,'Defiant data limit must be between 1 and 100');
   input.limit=Number(value);
  }else{
   if(!value||value.length>(key==='query'?200:256))throw fail(400,'Invalid Defiant data filter');
   input[key]=value;
  }
 }
 return service.read(user,input);
}
