const pathways=new Set(['catalog-to-campaign','talent-to-campaign','opportunity-to-plan']);
const fields=['organizationId','pathwayId','artistId','trackId','regionId','budgets','horizonMonths'];
const resources=['artists','tracks','regions'];
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const id=value=>typeof value==='string'&&value.length>0&&value.length<=160&&/^[A-Za-z0-9][A-Za-z0-9:_ .-]*$/.test(value);
const copy=value=>structuredClone(value);
function input(value){
 if(!object(value)||Object.keys(value).some(key=>!fields.includes(key))||!/^[A-Za-z0-9_-]{1,128}$/.test(value.organizationId??'')||!pathways.has(value.pathwayId))throw Error('Invalid domain input');
 for(const key of ['artistId','trackId','regionId'])if(value[key]!==undefined&&!id(value[key]))throw Error('Invalid reference');
 if(value.budgets!==undefined&&(!Array.isArray(value.budgets)||value.budgets.length<1||value.budgets.length>3||value.budgets.some(x=>!Number.isFinite(x)||x<0||x>100000)||new Set(value.budgets).size!==value.budgets.length))throw Error('Invalid budgets');
 if(value.horizonMonths!==undefined&&(!Number.isInteger(value.horizonMonths)||value.horizonMonths<1||value.horizonMonths>12))throw Error('Invalid horizon');
 return copy(value);
}
function dataset(value){return object(value)&&id(value.id)&&/^[a-f0-9]{64}$/.test(value.revision??'')&&['synthetic','user-reported'].includes(value.provenance)&&typeof value.label==='string';}
const sameDataset=(a,b)=>a?.id===b?.id&&a?.revision===b?.revision;
function result(reply,binding){
 const data=reply?.structuredContent;
 if(reply?.isError||!object(data)||data.schemaVersion!==1||data.view!=='domain-review'||data.scope?.organizationId!==binding.organizationId||data.pathway?.id!==binding.pathwayId)throw Error('Invalid domain result');
 if(data.status==='needs-input'){
  if(!Array.isArray(data.missingInputs)||!data.missingInputs.every(x=>['artistId','budgets','trackId','regionId'].includes(x))||typeof data.nextStep!=='string'||(data.dataset!==undefined&&!dataset(data.dataset))||(data.overview&&data.overview.artist?.id!==binding.artistId))throw Error('Invalid missing-input result');
  return data;
 }
 if(data.status!=='human-review-required'||!dataset(data.dataset)||data.selection?.artistId!==binding.artistId||(binding.trackId&&data.selection.trackId!==binding.trackId)||(binding.regionId&&data.selection.regionId!==binding.regionId)||data.review?.status!=='pending'||data.capabilities?.readOnly!==true||data.capabilities.canApproveRights!==false||data.capabilities.canExecuteCampaign!==false||data.capabilities.canPublish!==false)throw Error('Invalid review state');
 const {overview,regional,rightsAndRoyalties:rights,explanation,scenarioComparison:comparison}=data;
 if(![overview,regional,rights,explanation,comparison].every(row=>object(row)&&sameDataset(row.dataset,data.dataset)&&row.capabilities?.readOnly===true&&row.capabilities.canApproveRights===false&&row.capabilities.canPublish===false)||overview.artist?.id!==binding.artistId||!Array.isArray(overview.recordings)||!overview.recordings.some(row=>row.id===data.selection.trackId)||!Array.isArray(regional.items)||rights.recording?.id!==data.selection.trackId||explanation.recording?.id!==data.selection.trackId||explanation.region?.id!==data.selection.regionId||comparison.recording?.id!==data.selection.trackId||comparison.region?.id!==data.selection.regionId||rights.canApproveRights!==false||rights.reviewRequired!==true||comparison.trained!==false||comparison.reviewRequired!==true||!Array.isArray(comparison.scenarios)||comparison.scenarios.length!==binding.budgets?.length||!comparison.scenarios.every((row,index)=>row.budget===binding.budgets[index]&&row.horizonMonths===(binding.horizonMonths??3))||!Array.isArray(data.evidenceIds)||!Array.isArray(data.review.questions)||!Array.isArray(data.review.unknowns))throw Error('Inconsistent joined review');
 if(explanation.observations!==undefined&&(!Array.isArray(explanation.observations)||explanation.observations.length>24||!explanation.observations.every((row,index,rows)=>object(row)&&id(row.id)&&/^\d{4}-\d{2}-01$/.test(row.date)&&Number.isSafeInteger(row.streams)&&row.streams>=0&&row.period==='month'&&row.provenance===data.dataset.provenance&&data.evidenceIds.includes(row.id)&&(!index||rows[index-1].date<row.date))))throw Error('Invalid monthly evidence');
 return data;
}
function choices(reply,binding,resource,snapshot){
 const data=reply?.structuredContent;
 if(reply?.isError||data?.scope?.organizationId!==binding.organizationId||data?.schemaVersion!==1||!dataset(data.dataset)||data.capabilities?.readOnly!==true||data.capabilities.canApproveRights!==false||data.capabilities.canPublish!==false||data.resource!==resource||data.available!==true||!Array.isArray(data.items)||data.items.length>25||!data.items.every(row=>object(row)&&id(row.id)&&typeof row[resource==='tracks'?'title':'name']==='string')||(snapshot&&!sameDataset(snapshot,data.dataset)))throw Error('Invalid domain choices');
 return data;
}
/** Only finite read-only MCP calls. Host scope and dataset revision stay bound across async work. */
export function createDefiantDomainBridge({app,onState}){
 if(!app||typeof app.connect!=='function'||typeof app.callServerTool!=='function'||typeof onState!=='function')throw TypeError('App and state callback required');
 let binding=null,epoch=0,disposed=false,connected=false,connecting=null,failed=null,awaitingHost=false;
 let state={view:null,input:null,choices:{artists:[],tracks:[],regions:[]},loading:true,error:''};
 const emit=()=>{if(!disposed)onState(copy(state));};
 const current=token=>!disposed&&token===epoch;
 function failure(token,kind){if(!current(token))return;failed=kind;state.loading=false;state.error=kind==='choices'?'The review is retained, but choices could not refresh. Retry review.':'The review could not refresh. Previous results are retained; they do not reflect unapplied inputs. Retry review.';emit();}
 async function loadChoices(token){
  if(!current(token)||!connected||!binding||!state.view)return;
  const captured=copy(binding),view=state.view;
  try{
   const replies=await Promise.all(resources.map(resource=>app.callServerTool({name:'defiant_read_data',arguments:{organizationId:captured.organizationId,resource,limit:25}})));
   if(!current(token))return;
   let snapshot=view.dataset;
   const entries=resources.map((resource,index)=>{const data=choices(replies[index],captured,resource,snapshot);snapshot??=data.dataset;return [resource,copy(data.items)];});
   state.choices=Object.fromEntries(entries);
   if(view.overview?.recordings)state.choices.tracks=[...view.overview.recordings.slice(0,25)];
   // Keep the selected joined recording in the bounded first page when it falls beyond 25.
   for(const [resource,row]of [['artists',view.overview?.artist],['tracks',view.explanation?.recording],['regions',view.explanation?.region]])if(row&&!state.choices[resource].some(x=>x.id===row.id)){if(state.choices[resource].length===25)state.choices[resource].pop();state.choices[resource].unshift(copy(row));}
   state.loading=false;state.error='';failed=null;emit();
  }catch{failure(token,'choices');}
 }
 function adopt(reply,token){
  if(!current(token)||!binding)return;
  try{const view=result(reply,binding);if(!sameDataset(view.dataset,state.view?.dataset))state.choices={artists:[],tracks:[],regions:[]};state.view=copy(view);state.loading=true;state.error='';failed=null;emit();if(connected)void loadChoices(token);}catch{failure(token,'view');}
 }
 app.ontoolinput=params=>{
  if(disposed)return;++epoch;
  try{const next=input(params?.arguments),same=binding?.organizationId===next.organizationId&&binding?.pathwayId===next.pathwayId;binding=next;awaitingHost=true;failed=null;if(!same)state={view:null,input:copy(next),choices:{artists:[],tracks:[],regions:[]},loading:true,error:''};else{state.input=copy(next);state.loading=true;state.error='';}emit();}catch{binding=null;awaitingHost=false;failed=null;state={view:null,input:null,choices:{artists:[],tracks:[],regions:[]},loading:false,error:'Open a valid domain review tool with an organization and pathway.'};emit();}
 };
 app.ontoolresult=reply=>{if(disposed||!binding||!awaitingHost)return;const data=reply?.structuredContent;if(!reply?.isError&&(data?.scope?.organizationId!==binding.organizationId||data?.pathway?.id!==binding.pathwayId||data?.selection&&data.selection.artistId!==binding.artistId))return;awaitingHost=false;adopt(reply,epoch);};
 app.ontoolcancelled=()=>{if(disposed)return;++epoch;awaitingHost=false;failed=binding?'view':null;state.loading=false;state.error='Review cancelled. Previous results are retained.';emit();};
 app.onteardown=()=>{disposed=true;++epoch;return {};};
 async function start(){if(disposed||connected)return;if(connecting)return connecting;connecting=(async()=>{try{await app.connect();if(disposed)return;connected=true;if(failed==='connect'){failed=null;state.error='';}if(state.view&&!failed)void loadChoices(epoch);else emit();}catch{if(!disposed){failed='connect';state.loading=false;state.error='Could not connect to this chat host. Retry review.';emit();}}finally{connecting=null;}})();return connecting;}
 async function select(value){
  if(disposed||!connected||!binding)return;
  let next;try{next=input({...value,organizationId:binding.organizationId,pathwayId:binding.pathwayId});if(!next.artistId||!next.budgets)throw Error('Explicit inputs required');}catch{state.error='Choose an artist and supply one to three distinct budgets from 0 to 100,000.';emit();return;}
  const token=++epoch;binding=next;state.input=copy(next);awaitingHost=false;state.loading=true;state.error='';failed=null;emit();
  try{const reply=await app.callServerTool({name:'defiant_open_domain_review',arguments:copy(next)});if(current(token))adopt(reply,token);}catch{failure(token,'view');}
 }
 async function retry(){if(disposed||!failed)return;if(failed==='connect')return start();if(binding)return select(binding);}
 async function dispose(){disposed=true;++epoch;for(const name of ['ontoolinput','ontoolresult','ontoolcancelled','onteardown'])app[name]=undefined;await app.close?.();}
 emit();return Object.freeze({start,select,retry,dispose});
}
