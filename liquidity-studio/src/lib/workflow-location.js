// Navigation identifiers only. These are never identity, permission or saved draft data.
const tabs=new Set(['backlog','calendar','studio','brand','jobs','admin']);
const formats=new Set(['infographic','carousel','story','reel']);
const identifier=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value)?value:'';
export function readWorkflowLocation(href){
  const url=new URL(href),q=url.searchParams;
  return {hasLocation:['org','brand','tab','story','format','editor','native','page'].some(key=>q.has(key)),organizationId:identifier(q.get('org')),brandId:identifier(q.get('brand')),tab:tabs.has(q.get('tab'))?q.get('tab'):'backlog',storyId:identifier(q.get('story')),format:formats.has(q.get('format'))?q.get('format'):'infographic',editor:q.get('editor')==='prepared'?'prepared':'handoff',nativeId:identifier(q.get('native')),page:/^[0-3]$/.test(q.get('page')||'')?Number(q.get('page')):0};
}
export function workflowHref(href,state){
  const url=new URL(href);for(const key of ['org','brand','tab','story','format','editor','native','page'])url.searchParams.delete(key);
  for(const [key,value]of Object.entries({org:state.organizationId,brand:state.brandId,tab:state.tab,story:state.storyId,format:state.format,editor:state.editor==='prepared'?'prepared':'',native:state.nativeId,page:state.page?String(state.page):''}))if(value)url.searchParams.set(key,value);
  return url.href;
}
