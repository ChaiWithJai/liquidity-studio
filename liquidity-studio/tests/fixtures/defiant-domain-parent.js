// Hosted fixture only: actual SDK protocol, actual generated dataset and domain service on its test server.
const frame=document.querySelector('iframe'),calls=document.querySelector('[aria-label="Domain host tool calls"]');
const args={organizationId:'fictional_domain_browser',pathwayId:'catalog-to-campaign',artistId:'artist:fictional-1',trackId:'track:fictional-1-1',regionId:'region:nj',budgets:[0,500,1000],horizonMonths:3};
const post=message=>frame.contentWindow.postMessage({jsonrpc:'2.0',...message},location.origin);
async function tool(request){const response=await fetch('/fixture-domain-tool',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});if(!response.ok)throw Error('Fixture service rejected request');return response.json();}
let count=0;
addEventListener('message',async event=>{
 if(event.source!==frame.contentWindow||event.origin!==location.origin)return;
 const message=event.data;
 if(message?.method==='ui/initialize'){
  post({id:message.id,result:{protocolVersion:message.params.protocolVersion,hostInfo:{name:'fictional-domain-host',version:'1.0.0'},hostCapabilities:{serverTools:{}},hostContext:{}}});
  post({method:'ui/notifications/tool-input',params:{arguments:args}});
  const result=await tool({name:'defiant_open_domain_review',arguments:args});post({method:'ui/notifications/tool-result',params:result});
 }else if(message?.method==='ui/notifications/initialized')document.querySelector('[aria-label="Domain host initialization"]').textContent='complete';
 else if(message?.method==='tools/call'){
  count++;calls.textContent=String(count);
  try{post({id:message.id,result:await tool(message.params)});}catch{post({id:message.id,result:{isError:true,content:[{type:'text',text:'Fixture service unavailable'}]}});}
 }
});
frame.src='/tests/fixtures/defiant-domain-child.html';
