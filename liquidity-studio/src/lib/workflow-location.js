import {readStrategyLocation,writeStrategyLocation,strategyLocationKeys} from './defiant-location.js';
// Navigation identifiers only. These are never identity, permission or saved draft data.
const tabs=new Set(['backlog','calendar','studio','brand','jobs','admin','strategy']);
const formats=new Set(['infographic','carousel','story','reel']);
const identifier=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value)?value:'';
export function readWorkflowLocation(href){
  const url=new URL(href),q=url.searchParams;
  const tab=tabs.has(q.get('tab'))?q.get('tab'):'backlog';
  return {hasLocation:['org','brand','tab','story','format','editor','native','design','page'].some(key=>q.has(key)),organizationId:identifier(q.get('org')),brandId:identifier(q.get('brand')),tab,storyId:identifier(q.get('story')),format:formats.has(q.get('format'))?q.get('format'):'infographic',editor:q.get('editor')==='prepared'?'prepared':'handoff',nativeId:identifier(q.get('design'))?'':identifier(q.get('native')),penpotDesignId:identifier(q.get('design')),page:/^[0-3]$/.test(q.get('page')||'')?Number(q.get('page')):0,...(tab==='strategy'?{brandId:'',storyId:'',nativeId:'',penpotDesignId:'',editor:'handoff',page:0,strategy:readStrategyLocation(q)}:{})};
}
export function workflowHref(href,state){
  const url=new URL(href);for(const key of ['org','brand','tab','story','format','editor','native','design','page',...strategyLocationKeys])url.searchParams.delete(key);
  if(state.tab==='strategy'){
    if(state.organizationId)url.searchParams.set('org',state.organizationId);
    url.searchParams.set('tab','strategy');writeStrategyLocation(url.searchParams,state.strategy);return url.href;
  }
  for(const [key,value]of Object.entries({org:state.organizationId,brand:state.brandId,tab:state.tab,story:state.storyId,format:state.format,editor:state.editor==='prepared'?'prepared':'',native:state.nativeId,design:state.tab==='studio'?state.penpotDesignId:'',page:state.page?String(state.page):''}))if(value)url.searchParams.set(key,value);
  return url.href;
}
