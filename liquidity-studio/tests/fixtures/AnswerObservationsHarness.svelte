<script>
 import AnswerObservations from '../../src/components/defiant/AnswerObservations.svelte';
 let epoch=$state(0),calls=$state([]),saved=null;
 async function request(path,options={}){calls=[...calls,path];const body=options.body?JSON.parse(options.body):null;
  if(path.endsWith('/correction')){saved={...saved,correction:{comment:body.comment,actorId:'fixture-user',createdAt:'2026-01-01T00:00:00.000Z',qualification:'Submitted comment; not verified ground truth.'}};return saved;}
  if(body){saved={observation:{observationId:'b'.repeat(64),question:body.question,answer:body.answer,evidenceRevision:body.revision,results:body.assertions.map(assertion=>({assertion,amountCheck:'match',currencyCheck:'match',period:'2025-06',fact:{amount:'0',currency:'USD',sourceHash:'c'.repeat(64),metric:'source-total-earned',qualification:'Supplied amount, not profit.'},receipt:null,limitation:'Declared assertion only; semantic support unknown.'}))},correction:null};return saved;}
  if(path==='/observations')return {items:saved?[{observationId:saved.observation.observationId,question:saved.observation.question,createdAt:'2026-01-01'}]:[]};return saved;
 }
</script>
<button onclick={()=>epoch++}>Switch fixture context</button><output aria-label="Observation requests">{calls.length}</output>
{#key epoch}<AnswerObservations {request} revision={'a'.repeat(64)}/>{/key}
