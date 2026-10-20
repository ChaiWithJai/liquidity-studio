import {buildDefiantDemoView} from '../../server/defiant-demo-view.js';
const frame=document.querySelector('iframe'),counter=document.querySelector('output');
const data={schemaVersion:1,dataset:{id:'fictional-sdk',label:'Fictional SDK bridge',provenance:'synthetic',asOf:null,revision:'f'.repeat(64),counts:{artists:1,tracks:1,sources:1,campaigns:0,opportunities:0}},artists:[{id:'artist-a',name:'Fictional SDK Artist'}],tracks:[{id:'track-a',artistId:'artist-a',title:'Fictional SDK Recording'}],sources:[{id:'source-a',title:'Fictional SDK Source',trackIds:['track-a'],url:'https://example.org/fictional',provenance:'synthetic'}],campaigns:[],opportunities:[],capabilities:{readOnly:true,canApproveRights:false,canPublish:false}};
const scope={organizationId:'org_fixture'};
const guided=args=>({content:[],structuredContent:{...buildDefiantDemoView({data,pathwayId:args.pathwayId,selection:args.selection}),scope}});
const post=message=>frame.contentWindow.postMessage({jsonrpc:'2.0',...message},location.origin);
let calls=0;
addEventListener('message',event=>{
 if(event.source!==frame.contentWindow||event.origin!==location.origin)return;
 const message=event.data;
 if(message?.method==='ui/initialize'){
  post({id:message.id,result:{protocolVersion:message.params.protocolVersion,hostInfo:{name:'fictional-browser-host',version:'1.0.0'},hostCapabilities:{serverTools:{}},hostContext:{}}});
  const args={...scope,pathwayId:'catalog-to-campaign',selection:{}};
  post({method:'ui/notifications/tool-input',params:{arguments:args}});
  post({method:'ui/notifications/tool-result',params:guided(args)});
 }else if(message?.method==='ui/notifications/initialized'){
  document.querySelector('[aria-label="Host initialization"]').textContent='complete';
 }else if(message?.method==='tools/call'){
  calls++;counter.textContent=String(calls);const args=message.params.arguments;
  if(args.organizationId!==scope.organizationId){post({id:message.id,result:{isError:true,content:[{type:'text',text:'Fixture scope denied'}]}});return;}
  const result=message.params.name==='defiant_open_guided_view'?guided(args):message.params.name==='defiant_read_data'&&['artists','tracks','sources','opportunities'].includes(args.resource)&&args.limit===25?{content:[],structuredContent:{schemaVersion:1,dataset:data.dataset,scope,resource:args.resource,available:true,items:data[args.resource],capabilities:data.capabilities}}:{isError:true,content:[{type:'text',text:'Unsupported fixture tool'}]};
  post({id:message.id,result});
 }
});

frame.src='/tests/fixtures/defiant-sdk-child.html';
