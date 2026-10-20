<script>
 import {onMount} from 'svelte';
 import {App} from '@modelcontextprotocol/ext-apps';
 import {createDefiantChatBridge} from '../../lib/defiant-chat-bridge.js';
 import DefiantChatView from './DefiantChatView.svelte';
 let state=$state.raw({view:null,choices:{},loading:true,error:''});
 let controller;
 onMount(()=>{
  const app=new App({name:'Defiant guided research',version:'1.0.0'},{},{strict:true});
  controller=createDefiantChatBridge({app,onState:next=>{state=next;}});
  void controller.start();
  return()=>{void controller.dispose();};
 });
</script>
<DefiantChatView view={state.view} choices={state.choices} loading={state.loading} error={state.error} onSelection={selection=>controller?.select(selection)} onRetry={()=>controller?.retry()}/>
