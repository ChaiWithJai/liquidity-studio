<script>
 import Explorer from '../../src/components/defiant/DefiantEvidenceExplorer.svelte';
 import {readStrategyLocation,writeStrategyLocation} from '../../src/lib/defiant-location.js';
 const initial=readStrategyLocation(new URL(location.href).searchParams);
 let posts=$state(0),scope=$state('invented_org');
 const revision='b'.repeat(64),financial='a'.repeat(64),worksheet='c'.repeat(64),session='d'.repeat(64);
 let state=$state(initial.view==='evidence'?initial:{view:'evidence',evidenceMode:'retained',evidenceRevision:revision,retainedSessionId:session,retainedSessionOffset:25,evidenceOffset:50,retainedFilters:{kind:'member'}});
 function navigate(next){state=next;const url=new URL(location.href);writeStrategyLocation(url.searchParams,next);history.replaceState(null,'',url);}
 async function request(path,options={}){
  if(options.method==='POST'){posts++;throw Error('No provider invocation permitted');}
  const url=new URL(path,'https://fixture.invalid'),resource=url.pathname.slice(1),offset=Number(url.searchParams.get('offset')||0),base={scope:{organizationId:scope},revision};
  if(resource==='manifest')return {...base,coverage:'Invented fixture only',counts:{months:1,selections:1}};
  if(resource==='evaluations/cases')return {cases:[],executionAvailable:false};
  if(['evaluations','hypotheses','observations'].includes(resource))return {items:[],attemptConsumed:false};
  if(resource==='retained-sources'&&url.searchParams.get('mode')==='semantic-page')return {...base,mode:'semantic',sessionId:session,expiresAt:'2099-01-01T00:00:00Z',offset:25,limit:25,total:27,nextOffset:null,items:[{id:'financial',kind:'root',filename:'Financial source',sha256:financial,similarity:.5},{id:'worksheet',kind:'root',filename:'Worksheet source',sha256:worksheet,similarity:.4}]};
  if(resource==='retained-sources')return {...base,availability:true,items:[],scopeDescription:'Invented subset',capturedAt:'2026-01-01',globalCounts:{rootObjects:2,memberOccurrences:0,leafOccurrences:0,uniqueLeafHashes:0,duplicateLeafHashGroups:0,undatedRecords:2},matchingCounts:{rootObjects:0,memberOccurrences:0,undatedRecords:0},limitations:[],nextOffset:null,semanticSearch:{configured:true}};
  if(resource==='source-evidence'){const hash=url.searchParams.get('sourceHash'),isSheet=hash===worksheet;return {...base,sourceHash:hash,availability:true,offset:0,limit:25,total:1,nextOffset:null,occurrenceCount:1,limitation:'Existing references only',items:[isSheet?{key:'sheet',kind:'audience-definition',id:'audience',label:'Invented worksheet',sheet:'Sheet1',cellRefs:['A2'],qualification:'No verified population',followUp:{resource:'audience-definition',audienceId:'audience',revision},cells:{resource:'audience-cells',audienceId:'audience',revision}}:{key:'selection',kind:'selection',id:'selection',label:'Invented selection',amount:'2.00',currency:'USD',qualification:'Declared amount',followUp:{resource:'selection',selectionId:'selection',revision},cells:{resource:'selection-receipts',selectionId:'selection',revision}}]};}
  if(resource==='selection')return {...base,selection:{id:'selection',label:'Invented selection',sourceHash:financial,amount:'2.00',currency:'USD'},sourceRecords:Array.from({length:offset===0?25:1},(_,i)=>offset+i+2),total:26,offset,limit:25,nextOffset:offset===0?25:null};
  if(resource==='selection-receipts')return {...base,receipts:Array.from({length:offset===0?25:1},(_,i)=>({id:'row_'+(offset+i),sourceHash:financial,member:'invented.csv',record:offset+i+2,cells:{'Total Earned':'2.00'}})),limitation:'One original record'};
  if(resource==='audience-definition')return {...base,definition:{id:'audience',name:'Invented worksheet',sourceHash:worksheet,sheet:'Sheet1',cellRefs:['A2'],criteria:'Invented',requiredEvidence:[],observedEvidence:[],missingEvidence:[]},limitation:'No verified population'};
  if(resource==='audience-cells')return {...base,audienceId:'audience',worksheet:{sourceHash:worksheet,sheet:'Sheet1',cells:[{cellRef:'A2',type:'s',rawValue:'Invented original worksheet cell',value:'Invented original worksheet cell',formula:null,formulaExecuted:false}]},limitation:'Original cell, no population verification'};
  throw Error('Unexpected fixture resource');
 }
</script>
<p>Invented source handoff fixture; no model calls.</p><output aria-label="Provider posts">{posts}</output><button onclick={()=>{scope='other_org';navigate({view:'evidence',evidenceMode:'retained'});}}>Switch organization</button>
{#key scope}<Explorer {request} location={state} onNavigate={navigate}/>{/key}
<style>:global(body){margin:0}:global(*){box-sizing:border-box}:global(button){max-width:100%;white-space:normal}</style>
