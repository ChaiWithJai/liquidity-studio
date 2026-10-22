const id = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value) ? value : '';
const revision = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) ? value : '';
export function evidenceLocation(location = {}) {
 return {mode:['identity','selections'].includes(location.evidenceMode)?location.evidenceMode:'earnings',revision:revision(location.evidenceRevision),groupId:id(location.evidenceGroupId),selectionId:id(location.evidenceSelectionId),receiptId:id(location.evidenceReceiptId),offset:Number.isInteger(location.evidenceOffset)&&location.evidenceOffset>=0&&location.evidenceOffset<=500000?location.evidenceOffset:0};
}
export const emptyEvidenceView = () => ({loading:false,error:'',status:0,manifest:null,list:null,group:null,selection:null,receipts:[],revision:''});
/** Existing host owns organization and authentication. Each navigation is an atomic view. */
export function createEvidenceExplorer({request,onState}) {
 let epoch=0,controller;
 const cancel=()=>{epoch++;controller?.abort();};
 return {cancel,async load(location={}){
  cancel();const ticket=epoch;controller=new AbortController();const signal=controller.signal;
  const current=()=>ticket===epoch;const state=emptyEvidenceView();onState({...state,loading:true});
  const input=evidenceLocation(location);
  try {
   if((input.groupId||input.selectionId||input.receiptId)&&!input.revision)throw Object.assign(new Error('Refresh evidence before opening this saved selection.'),{status:409});
   if((input.groupId&&input.selectionId)||(input.receiptId&&(input.selectionId||input.groupId)))throw Object.assign(new Error('Choose one evidence selection.'),{status:400});
   const read=async(resource,params={})=>{
    const query=new URLSearchParams(Object.entries(params).filter(([,value])=>value!==undefined&&value!==''));
    const data=await request('/'+resource+(query.size?'?'+query:''),{signal});
    if(!current())throw Object.assign(new Error('Navigation changed'),{code:'STALE'});
    if(!revision(data?.revision)||!data?.scope?.organizationId)throw new Error('Evidence response is unavailable.');
    if(params.revision&&data.revision!==params.revision)throw Object.assign(new Error('Evidence changed.'),{status:409});
    if(state.manifest&&(data.revision!==state.revision||data.scope.organizationId!==state.manifest.scope.organizationId))throw Object.assign(new Error('Evidence changed. Refresh to continue.'),{status:409});
    return data;
   };
   state.manifest=await read('manifest',{revision:input.revision});state.revision=state.manifest.revision;
   const pin={revision:state.revision};
   if(input.groupId)state.group=await read('identity-group',{...pin,identityGroupId:input.groupId,offset:input.offset,limit:25});
   if(input.selectionId){
    state.selection=await read('selection',{...pin,selectionId:input.selectionId,offset:input.offset,limit:25});
    const cells=await read('selection-receipts',{...pin,selectionId:input.selectionId,offset:input.offset,limit:25});
    state.receipts=cells.receipts;state.cellLimitation=cells.limitation;
   }else if(input.receiptId){const cells=await read('receipt',{...pin,receiptId:input.receiptId});state.receipts=[cells.receipt];state.cellLimitation=cells.limitation;}
   else if(!input.groupId)state.list=await read(input.mode==='identity'?'catalog-identity-review':input.mode==='selections'?'selections':'earnings',{...pin,offset:input.offset,limit:25});
   if(current())onState(state);
  }catch(error){if(current())onState({...emptyEvidenceView(),status:error.status||0,error:error.status===403?'Access to this evidence is no longer available.':error.status===401?'Sign in again to view this evidence.':error.status===409?'Evidence changed or this link has no revision. Refresh evidence to start a new review.':error.status===404?'Evidence is not available for this organization or selection.':'Evidence could not be loaded. Retry or refresh the evidence.'});}
 }};
}
