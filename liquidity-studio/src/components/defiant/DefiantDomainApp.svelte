<script>
 import {onMount} from 'svelte';
 import {App} from '@modelcontextprotocol/ext-apps';
 import {createDefiantDomainBridge} from '../../lib/defiant-domain-bridge.js';
 import DefiantDomainReview from './DefiantDomainReview.svelte';
 let state=$state.raw({view:null,input:null,choices:{},loading:true,error:''});
 let controller;
 onMount(()=>{
  const app=new App({name:'Defiant domain review',version:'1.0.0'},{},{strict:true});
  controller=createDefiantDomainBridge({app,onState:next=>{state=next;}});
  void controller.start();
  return()=>{void controller.dispose();};
 });
</script>
{#key JSON.stringify(state.input)}<DefiantDomainReview view={state.view} input={state.input} choices={state.choices} loading={state.loading} error={state.error} onSelection={input=>controller?.select(input)} onRetry={()=>controller?.retry()}/>{/key}
