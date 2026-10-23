<script>
 import ClaimEvaluations from '../../src/components/defiant/ClaimEvaluations.svelte';
 let epoch=$state(0),posts=$state([]),calls=$state(0),hold=$state(false),release=$state(null),uncertain=$state(false),available=$state(true);
 const revision='a'.repeat(64),id='b'.repeat(64),key='claim-evaluation-fixture';
 const read=()=>JSON.parse(localStorage.getItem(key)||'null');
 async function request(path,options={}){
  const captured=epoch;calls++;
  if(path==='/evaluations/cases')return {executionAvailable:available,cases:[{caseId:'invented-control',origin:'authored-development',claim:'Reported cash <img src=x onerror=alert(1)>',evidenceRevision:revision}]};
  if(options.method==='POST'){
   const body=JSON.parse(options.body);posts=[...posts,body];let saved=read();
   if(!saved){saved={recordId:id,caseId:body.caseId,createdAt:'2026-10-23T12:00:00.000Z',status:'completed',packSha256:'c'.repeat(64),evaluatorConfigSha256:'d'.repeat(64),evaluation:{deterministic:{status:'pass',reasons:[]},case:{evidenceRevision:revision},evaluatorVersion:'defiant-claim-decisions-v1',deterministicVersion:'earnings-claim-exact-v1',outcome:{status:'unavailable',reason:'fixture-no-provider'},qualification:'Invented contract response; no model was called.'}};localStorage.setItem(key,JSON.stringify(saved));}
   if(hold){hold=false;await new Promise(resolve=>release=resolve);release=null;}
   if(uncertain){uncertain=false;throw Object.assign(new Error('fixture'),{status:408});}
   return {...saved,caseId:captured===epoch?saved.caseId:'old-account-private-case'};
  }
  if(path==='/evaluations')return {items:read()?[{recordId:id,caseId:read().caseId,createdAt:read().createdAt}]:[]};
  return read();
 }
 function change(){epoch++;localStorage.removeItem(key);}
</script>
<button onclick={()=>uncertain=true}>Lose next evaluation response</button>
<button onclick={()=>hold=true}>Hold next evaluation response</button>
<button onclick={()=>release?.()} disabled={!release}>Release evaluation response</button>
<button onclick={change}>Switch account and organization</button>
<button onclick={()=>available=false}>Remove fixture credential</button>
<output aria-label="Evaluation post bodies">{JSON.stringify(posts)}</output><output aria-label="Evaluation request count">{calls}</output>
{#key epoch}<ClaimEvaluations {request}/>{/key}
