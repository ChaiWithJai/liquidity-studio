<script>
 import DefiantChatView from '../../src/components/defiant/DefiantChatView.svelte';
 import {buildDefiantDemoView} from '../../server/defiant-demo-view.js';
 const data={schemaVersion:1,dataset:{id:'fictional',label:'Fictional browser contract',provenance:'synthetic',asOf:null,revision:'f'.repeat(64),counts:{artists:1,tracks:1,sources:1,campaigns:0,opportunities:1}},artists:[{id:'artist-a',name:'Fictional Artist'}],tracks:[{id:'track-a',artistId:'artist-a',title:'Fictional Recording',rightsStatus:'unknown'}],sources:[{id:'source-a',title:'Fictional Source',trackIds:['track-a'],url:'https://example.org/fictional',provenance:'synthetic',rightsStatus:'unknown'}],campaigns:[],opportunities:[{id:'opportunity-a',title:'Fictional Opportunity',trackId:'track-a',sourceIds:['source-a'],method:'scenario',score:30,status:'proposed',reasons:['Fictional illustrative explanation'],rightsStatus:'unknown'}],capabilities:{readOnly:true,canApproveRights:false,canPublish:false}};
 let view=$state(buildDefiantDemoView({data,pathwayId:'catalog-to-campaign'})),loading=$state(false),error=$state(''),selection=$state(''),calls=$state(0);
 const choices={...data,artists:[...data.artists,...Array.from({length:30},(_,i)=>({id:`unused-${i}`,name:`Unused fictional artist ${i}`}))]};
 function choose(next){selection=JSON.stringify(next);calls++;view=buildDefiantDemoView({data,pathwayId:'catalog-to-campaign',selection:next});}
</script>
<DefiantChatView {view} {choices} {loading} {error} onSelection={choose} onRetry={()=>{error='';calls++;}}/>
<output aria-label="Selection callback">{selection}</output><output aria-label="Callback count">{calls}</output>
<div aria-label="Hosted fixture controls"><button onclick={()=>loading=!loading}>Toggle fixture loading</button><button onclick={()=>error='Fictional request failed; prior context retained.'}>Show fixture error</button><button onclick={()=>view=null}>Show fixture empty</button></div>
