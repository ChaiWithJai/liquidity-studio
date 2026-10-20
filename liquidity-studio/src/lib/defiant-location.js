// Addressable view identifiers only. Session DTOs and URLs never grant authority.
const identifier=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value)?value:'';
const entityIdentifier=value=>typeof value==='string'&&/^[A-Za-z0-9_:-]{1,128}$/.test(value)?value:'';
export const strategyLocationKeys=['view','focus','select','savedView','report','target','kinds','examples','find','path','source','workstream','stage','recording','clip','moment','cohort','origin','region','artist','sample'];
const routePath=value=>{const ids=typeof value==='string'?value.split(','):[];return ids.length&&ids.length<=16&&ids.every(id=>entityIdentifier(id))&&new Set(ids).size===ids.length?ids:[];};
const kinds=value=>typeof value==='string'?[...new Set(value.split(',').filter(k=>['region','artist','signal','person','resource','format','catalog','external','route'].includes(k)))]:[];
export function readStrategyLocation(params){
 return {...(params.get('sample')==='demo'?{sample:'demo'}:{}),...(['catalog','talent'].includes(params.get('origin'))?{origin:params.get('origin')}:{}),...(entityIdentifier(params.get('region'))?{regionId:entityIdentifier(params.get('region'))}:{}),...(entityIdentifier(params.get('artist'))?{artistId:entityIdentifier(params.get('artist'))}:{}),...(entityIdentifier(params.get('moment'))?{momentId:entityIdentifier(params.get('moment'))}:{}),...(['supplied-2026','historical-sample','youtube-discovery'].includes(params.get('cohort'))?{cohort:params.get('cohort')}:{}),...(entityIdentifier(params.get('clip'))?{clipId:entityIdentifier(params.get('clip'))}:{}),...(entityIdentifier(params.get('source'))?{sourceId:entityIdentifier(params.get('source'))}:{}),...(entityIdentifier(params.get('workstream'))?{workstreamId:entityIdentifier(params.get('workstream'))}:{}),...(entityIdentifier(params.get('recording'))?{recordingId:entityIdentifier(params.get('recording'))}:{}),...(['new','considering','selected','parked'].includes(params.get('stage'))?{inboxStage:params.get('stage')}:{}),view:['report','inbox'].includes(params.get('view'))?params.get('view'):'map',focus:entityIdentifier(params.get('focus')),selected:entityIdentifier(params.get('select')),savedViewId:entityIdentifier(params.get('savedView')),reportId:entityIdentifier(params.get('report')),destinationBrandId:identifier(params.get('target')),...(routePath(params.get('path')).length?{routeEdgeIds:routePath(params.get('path'))}:{}),...(kinds(params.get('kinds')).length?{kinds:kinds(params.get('kinds'))}:{}),...(params.get('examples')==='hide'?{showExamples:false}:{}),...(params.get('find')?.trim()?{query:params.get('find').trim().slice(0,200)}:{})};
}
export function writeStrategyLocation(params,state={}){
 for(const key of strategyLocationKeys)params.delete(key);
 params.set('view',['report','inbox'].includes(state.view)?state.view:'map');
 if(state.sample==='demo')params.set('sample','demo');
 if(['catalog','talent'].includes(state.origin))params.set('origin',state.origin);
 if(['supplied-2026','historical-sample','youtube-discovery'].includes(state.cohort))params.set('cohort',state.cohort);
 const route=routePath(Array.isArray(state.routeEdgeIds)?state.routeEdgeIds.join(','):'');if(route.length)params.set('path',route.join(','));
 const selectedKinds=kinds(Array.isArray(state.kinds)?state.kinds.join(','):'');if(selectedKinds.length)params.set('kinds',selectedKinds.join(','));if(state.showExamples===false)params.set('examples','hide');if(typeof state.query==='string'&&state.query.trim())params.set('find',state.query.trim().slice(0,200));
 for(const [key,value] of Object.entries({region:state.regionId,artist:state.artistId,moment:state.momentId,clip:state.clipId,source:state.sourceId,workstream:state.workstreamId,stage:['new','considering','selected','parked'].includes(state.inboxStage)?state.inboxStage:'',recording:state.recordingId,focus:state.focus,select:state.selected,savedView:state.savedViewId,report:state.reportId,target:state.destinationBrandId})){
  const safe=key==='target'?identifier(value):entityIdentifier(value);if(safe)params.set(key,safe);
 }
}
export function strategyOrganizationFor(route,organizations){
 if(route?.tab!=='strategy'||!identifier(route.organizationId)||!Array.isArray(organizations))return null;
 const org=organizations.find(org=>org.id===route.organizationId);
 return org&&(org.strategy?.enabled===true||org.strategy?.canEnable===true)?org:null;
}

// A report returns to its captured research context, never to a guessed tenant.
export function strategyReturnContext(location={}){
 const params=new URLSearchParams();writeStrategyLocation(params,location);
 const context=readStrategyLocation(params);delete context.reportId;delete context.destinationBrandId;delete context.sample;
 context.view=context.origin==='catalog'?'inbox':context.origin==='talent'?'map':location.view==='inbox'?'inbox':'map';
 return context;
}
export function strategyReportReturn(location={},report){
 const captured=report?.returnContext||location;
 const sourceOnly=!report?.returnContext&&report?.sourceRefs?.length&&!report?.planIds?.length;
 const singleSource=sourceOnly&&report.sourceRefs.length===1?report.sourceRefs[0]:'';
 const legacySource=sourceOnly?(report.sourceRefs.includes(captured.sourceId)?captured.sourceId:singleSource):'';
 const moments=legacySource?(report.momentSnapshots||[]).filter(s=>s.sourceId===legacySource&&s.moment?.savedAt):[];
 const legacyMoment=moments.some(s=>s.moment.id===captured.momentId)?captured.momentId:moments.length===1?moments[0].moment.id:'';
 const inferred=sourceOnly&&!report.returnContext?{...captured,origin:'catalog',view:'inbox',sourceId:legacySource,momentId:legacyMoment}:captured;
 return {...strategyReturnContext(inferred),reportId:''};
}
