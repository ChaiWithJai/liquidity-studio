// Addressable view identifiers only. Session DTOs and URLs never grant authority.
const identifier=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value)?value:'';
export const strategyLocationKeys=['view','focus','select','savedView','report','target'];
export function readStrategyLocation(params){
 return {view:params.get('view')==='report'?'report':'map',focus:identifier(params.get('focus')),selected:identifier(params.get('select')),savedViewId:identifier(params.get('savedView')),reportId:identifier(params.get('report')),destinationBrandId:identifier(params.get('target'))};
}
export function writeStrategyLocation(params,state={}){
 for(const key of strategyLocationKeys)params.delete(key);
 params.set('view',state.view==='report'?'report':'map');
 for(const [key,value] of Object.entries({focus:state.focus,select:state.selected,savedView:state.savedViewId,report:state.reportId,target:state.destinationBrandId})){
  const safe=identifier(value);if(safe)params.set(key,safe);
 }
}
export function strategyOrganizationFor(route,organizations){
 if(route?.tab!=='strategy'||!identifier(route.organizationId)||!Array.isArray(organizations))return null;
 const org=organizations.find(org=>org.id===route.organizationId);
 return org&&(org.strategy?.enabled===true||org.strategy?.canEnable===true)?org:null;
}
