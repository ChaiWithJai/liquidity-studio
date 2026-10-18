import source from './seed.reference.json';

// A view adapter, not an import into application tenants. Source ownership,
// clearance and forecasts are deliberately not promoted into operational facts.
const c=source.collections;
export const regions=c.city_nodes.map((r,i)=>({id:r._id,kind:'region',name:r.city,subtitle:r.country,tags:r.sonicDNA,sourceId:r._id,
  x:[25,50,76,76,50,25][i],y:[29,17,29,69,82,69][i],country:r.regionCode.split('-')[0]}));
export const artists=c.step1_youtube_scout_signals_6_regions.map(a=>({id:a._id,kind:'artist',name:a.artistName,subtitle:a.sonicProfile.style,regionId:a.focalNodeId,
  sourceTitle:a.youtubeVideoTitle,bpm:a.sonicProfile.bpm,profile:a.sonicProfile.vocalPocket,exampleMetrics:a.metrics,sourceId:a._id}));
const shortNames={conn_studio_kofi_mensah_ldn:'Kofi “Bridge” Mensah',conn_studio_rohan_varma_bom_ldn:'Rohan Varma',conn_xxl_global_freshman_cypher:'Global diaspora cypher',conn_xxl_2010_nipsey_freshman_vault:'Freshman archive',conn_xxl_inside_track_co_sign:'Executive co-sign series'};
export const resources=c.step3_premade_connectors.map(r=>({id:r._id,kind:r.connectorType.includes('STUDIO')?'person':r.connectorType.includes('XXL')?'format':'catalog',
  name:shortNames[r._id]||r.assetTitle.split(' — ')[1]?.split(' & ')[0]||r.assetTitle,fullName:r.assetTitle,
  subtitle:r.connectorType.includes('STUDIO')?'Producer · sample collaborator':r.connectorType.includes('XXL')?'Media concept · unconfirmed':'Catalog reference · rights unconfirmed',
  description:r.whyItConnects,regionIds:r.linkedNodes||r.preClearedNodes||[],exampleTurnaround:r.turnaroundHours||r.studioTurnaroundHours,sourceId:r._id}));
export const corridors=c.corridor_edges.map(e=>({id:e._id,kind:'route',name:`${regions.find(r=>r.id===e.sourceNodeId)?.name} → ${regions.find(r=>r.id===e.targetNodeId)?.name}`,
  from:e.sourceNodeId,to:e.targetNodeId,subtitle:e.corridorName,description:e.whatItTakesStrategy,sourceId:e._id}));
export const items=[...regions,...artists,...resources,...corridors];
export const item=id=>items.find(n=>n.id===id);
export const typeName={region:'Region',artist:'Artist',person:'Collaborator',format:'Media concept',catalog:'Catalog reference',route:'Route'};
export const targets=[{id:'defiant-main',name:'Defiant Records',handle:'@defiant.records · sample account'},{id:'defiant-presents',name:'Defiant Presents',handle:'@defiant.presents · sample account'}];
export function relatedResources(artistId){
  const simulation=c.step2_emerging_artist_cross_system_simulations.find(s=>s.sourceSignalId===artistId);
  const ids=[...new Set((simulation?.whatTheyLookLikeInOtherNodes||[]).flatMap(s=>[s.matchedStudioConnectorId,s.matchedXxlConnectorId,s.matchedCatalogConnectorId]).filter(Boolean))];
  return ids.map(item).filter(Boolean);
}
export function makeGraph(focusId,positions={}){
  const focus=item(focusId);
  if(!focus||focus.kind==='route')return {nodes:regions.map(r=>({...r,...positions[r.id]})),edges:corridors};
  const city=focus.kind==='region'?focus:item(focus.regionId);
  if(!city)return {nodes:regions,edges:corridors};
  const artist=focus.kind==='artist'?focus:artists.find(a=>a.regionId===city.id);
  const routes=corridors.filter(e=>e.from===city.id);
  const targetIds=[...new Set(routes.map(e=>e.to))];
  const nodes=[{...city,x:18,y:46}];
  const edges=[];
  if(artist){nodes.push({...artist,x:44,y:46});edges.push({id:`discovery:${artist.id}`,from:city.id,to:artist.id,label:'Discovered in',kind:'discovery'});}
  targetIds.forEach((id,i)=>{nodes.push({...item(id),x:78,y:targetIds.length===1?46:23+i*(47/Math.max(1,targetIds.length-1))});});
  routes.forEach(e=>edges.push({...e,from:artist?.id||city.id,sourceRegion:e.from}));
  if(focus.kind==='artist'){
    const first=relatedResources(artist.id).find(r=>r.kind==='person');
    if(first){nodes.push({...first,x:45,y:79});edges.push({id:`match:${first.id}`,from:artist.id,to:first.id,kind:'match',label:'Possible collaboration'});}
  }
  return {nodes:nodes.map(n=>({...n,...positions[n.id]})),edges};
}
export function initialState(){
  try{const v=JSON.parse(localStorage.getItem('defiant-design-study:v1')||'null');if(v?.version===1&&Array.isArray(v.planIds)&&Array.isArray(v.annotations)&&Array.isArray(v.savedViews)&&Array.isArray(v.campaigns))return v;}catch{/* A malformed browser draft starts a fresh study, not application data. */}
  return {version:1,planIds:[],annotations:[],savedViews:[],positions:{},report:null,campaigns:[]};
}
