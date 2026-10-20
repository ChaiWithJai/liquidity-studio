const pathways=new Set(['catalog-to-campaign','talent-to-campaign','opportunity-to-plan']);
const selectionKeys=['artistId','trackId','sourceId','campaignId','opportunityId'];
const resources=['artists','tracks','sources','opportunities'];
const recordId=value=>typeof value==='string'&&value.length<=160&&/^[A-Za-z0-9][A-Za-z0-9:_ .-]*$/.test(value);
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const clone=value=>structuredClone(value);
function selection(value={}){
 if(!object(value)||Object.keys(value).some(key=>!selectionKeys.includes(key)))throw Error('Invalid selection');
 const result={};for(const key of selectionKeys)if(Object.hasOwn(value,key)){if(!recordId(value[key]))throw Error('Invalid record');result[key]=value[key];}return result;
}
function input(value){
 if(!object(value)||Object.keys(value).some(key=>!['organizationId','pathwayId','selection'].includes(key))||typeof value.organizationId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(value.organizationId)||!pathways.has(value.pathwayId))throw Error('Invalid tool input');
 return {organizationId:value.organizationId,pathwayId:value.pathwayId,selection:selection(value.selection)};
}
const selectionKey=value=>JSON.stringify(selection(value));
function envelope(result,binding){
 const data=result?.structuredContent;
 if(result?.isError||!object(data)||data.schemaVersion!==1||data.scope?.organizationId!==binding.organizationId||data.capabilities?.readOnly!==true||data.capabilities.canApproveRights!==false||data.capabilities.canPublish!==false||!object(data.dataset)||!recordId(data.dataset.id)||!['synthetic','user-reported'].includes(data.dataset.provenance)||typeof data.dataset.label!=='string'||!/^[a-f0-9]{64}$/.test(data.dataset.revision))throw Error('Invalid research result');
 return data;
}
function renderRecord(row,kind){
 return object(row)&&recordId(row.id)&&typeof row[kind==='artists'?'name':'title']==='string'&&(kind!=='opportunities'||Number.isFinite(row.score)&&Array.isArray(row.reasons)&&row.reasons.length<=8&&row.reasons.every(reason=>typeof reason==='string'));
}
function guided(result,binding){
 const data=envelope(result,binding);
 if(data.view!=='guided-research'||data.pathway?.id!==binding.pathwayId||typeof data.pathway.title!=='string'||selectionKey(data.selection)!==selectionKey(binding.selection)||!object(data.selectedRecords)||!Object.entries(data.selectedRecords).every(([kind,row])=>[...resources,'campaigns'].includes(kind)&&renderRecord(row,kind))||!object(data.dataset.counts)||!['artists','tracks','sources'].every(key=>Number.isSafeInteger(data.dataset.counts[key])&&data.dataset.counts[key]>=0)||!Array.isArray(data.steps)||!data.steps.length||data.steps.length>8||!data.steps.every(step=>object(step)&&typeof step.id==='string'&&typeof step.label==='string'&&['missing','available','unavailable','review-required'].includes(step.state)&&Array.isArray(step.missingInputs)&&step.missingInputs.every(key=>typeof key==='string'))||!data.steps.some(step=>step.id===data.nextStep?.id)||!Array.isArray(data.evidence)||data.evidence.length>1000||!data.evidence.every(row=>object(row)&&recordId(row.id)&&typeof row.title==='string')||!['needs-input','needs-workspace-context','review-required'].includes(data.status)||!['warnings','unknowns'].every(key=>Array.isArray(data[key])&&data[key].length<=32&&data[key].every(text=>typeof text==='string')))throw Error('Invalid guided view');
 const nextStep=data.steps.find(step=>step.id===data.nextStep.id);
 if(data.status!==(nextStep.state==='unavailable'?'needs-workspace-context':nextStep.state==='missing'?'needs-input':'review-required'))throw Error('Invalid research state');
 return {...data,nextStep};
}
function choiceRows(result,binding,view,resource){
 const data=envelope(result,binding);
 if(data.dataset.id!==view.dataset.id||data.dataset.revision!==view.dataset.revision||data.resource!==resource||data.available!==true||!Array.isArray(data.items)||data.items.length>25||!data.items.every(row=>renderRecord(row,resource)))throw Error('Inconsistent choices');
 const rows=clone(data.items),current=view.selectedRecords[resource];
 if(current&&!rows.some(row=>row.id===current.id)){if(rows.length===25)rows.pop();rows.unshift(clone(current));}
 return rows;
}
/** App is injected: this controller owns no HTTP, credentials, writes or arbitrary tool names. */
export function createDefiantChatBridge({app,onState}){
 if(!app||typeof app.connect!=='function'||typeof app.callServerTool!=='function'||typeof onState!=='function')throw TypeError('App and state callback required');
 let binding=null,epoch=0,disposed=false,connected=false,connecting=null,failed=null,awaitingHost=false;
 let state={view:null,choices:{artists:[],tracks:[],sources:[],opportunities:[]},loading:true,error:''};
 const emit=()=>{if(!disposed)onState(clone(state));};
 const current=(token)=>!disposed&&token===epoch;
 function failure(token,kind){if(!current(token))return;failed=kind;state.loading=false;state.error=kind==='choices'?'Research is open, but choices could not refresh. Retry research.':'Research could not refresh. Your previous context is retained. Retry research.';emit();}
 async function loadChoices(token){
  if(!current(token)||!connected||!binding||!state.view)return;
  const captured=clone(binding),view=state.view;
  try{
   const replies=await Promise.all(resources.map(resource=>app.callServerTool({name:'defiant_read_data',arguments:{organizationId:captured.organizationId,resource,limit:25}})));
   if(!current(token))return;
   state.choices=Object.fromEntries(resources.map((resource,index)=>[resource,choiceRows(replies[index],captured,view,resource)]));state.loading=false;state.error='';failed=null;emit();
  }catch{failure(token,'choices');}
 }
 function adopt(result,token){
  if(!current(token)||!binding)return false;
  try{
   const view=guided(result,binding);
   if(state.view?.dataset.revision!==view.dataset.revision||state.view?.dataset.id!==view.dataset.id)state.choices={artists:[],tracks:[],sources:[],opportunities:[]};
   state.view=clone(view);state.loading=true;state.error='';failed=null;emit();if(connected)void loadChoices(token);return true;
  }catch{failure(token,'view');return false;}
 }
 app.ontoolinput=params=>{
  if(disposed)return;const token=++epoch;
  try{
   const next=input(params?.arguments),sameScope=binding&&next.organizationId===binding.organizationId&&next.pathwayId===binding.pathwayId;
   binding=next;failed=null;awaitingHost=true;if(!sameScope)state={view:null,choices:{artists:[],tracks:[],sources:[],opportunities:[]},loading:true,error:''};else{state.loading=true;state.error='';}emit();
  }catch{binding=null;failed=null;awaitingHost=false;state={view:null,choices:{artists:[],tracks:[],sources:[],opportunities:[]},loading:false,error:'Open a valid Defiant guided research tool to continue.'};if(current(token))emit();}
 };
 app.ontoolresult=result=>{
  if(disposed||!binding||!awaitingHost)return;
  // Ignore a delayed notification from another scope, pathway or selection.
  const data=result?.structuredContent;
  if(!result?.isError&&(data?.scope?.organizationId!==binding.organizationId||data?.pathway?.id!==binding.pathwayId))return;
  if(!result?.isError){try{if(selectionKey(data?.selection)!==selectionKey(binding.selection))return;}catch{failure(epoch,'view');return;}}
  awaitingHost=false;adopt(result,epoch);
 };
 app.ontoolcancelled=()=>{if(disposed)return;++epoch;awaitingHost=false;failed=binding?'view':null;state.loading=false;state.error='Research request cancelled. Your previous context is retained.';emit();};
 app.onteardown=()=>{disposed=true;++epoch;return {};}; // Leave the transport alive long enough to acknowledge teardown.
 emit();
 async function start(){
  if(disposed||connected)return;if(connecting)return connecting;
  connecting=(async()=>{try{await app.connect();if(disposed)return;connected=true;if(failed==='connect'){failed=null;state.error='';}if(state.view&&!failed)void loadChoices(epoch);else emit();}catch{if(!disposed){failed='connect';state.loading=false;state.error='Could not connect to this chat host. Retry research.';emit();}}finally{connecting=null;}})();return connecting;
 }
 async function select(next){
  if(disposed||!connected||!binding)return;
  let selected;try{selected=selection(next);}catch{state.error='Choose a supplied research reference.';emit();return;}
  const token=++epoch;awaitingHost=false;binding={...binding,selection:selected};failed=null;state.loading=true;state.error='';emit();
  try{const result=await app.callServerTool({name:'defiant_open_guided_view',arguments:clone(binding)});if(current(token))adopt(result,token);}catch{failure(token,'view');}
 }
 async function retry(){if(disposed||!failed)return;if(failed==='connect'){return start();}if(!binding)return;return select(binding.selection);}
 async function dispose(){disposed=true;++epoch;for(const key of ['ontoolinput','ontoolresult','ontoolcancelled','onteardown'])app[key]=undefined;await app.close?.();}
 return Object.freeze({start,select,retry,dispose});
}
