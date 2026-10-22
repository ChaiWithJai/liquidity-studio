import test from 'node:test';
import assert from 'node:assert/strict';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
import {createHttpServer} from './index.js';
import {createPlatform} from './platform.js';
import {DurableStore} from './storage.js';
import {DefiantStrategyService} from './defiant-strategy.js';
test('evidence adapter rejects mutations, repeated filters and caller paths',async()=>{
 let calls=0;const service={read:async()=>{calls++;return {scope:{organizationId:'org'}};}};
 for(const [path,method,status] of [['manifest','POST',405],['raw','GET',404],['earnings?limit=1&limit=2','GET',400],['receipt?path=secret','GET',400]]){
  const url=new URL('https://fixture.invalid/api/studio/defiant-evidence/org/'+path);
  await assert.rejects(defiantEvidenceRequest({service,user:{},route:url.pathname,method,url}),{status});
 }
 assert.equal(calls,0);
});
test('private evidence HTTP requires current Studio membership before provider loading',async t=>{
 const store=new DurableStore(':memory:'),platform=createPlatform({store,authMode:'password'});await platform.ready;
 await platform.identity.provision({username:'evidence-founder',password:'invented-hosted-password',role:'founder'});
 const actor=(await platform.identity.login('evidence-founder','invented-hosted-password')).user;
 const org=await platform.identity.createOrganization(actor,'Invented evidence fixture');
 await new DefiantStrategyService({store,identity:platform.identity,organizationId:org.id}).enable(actor,{});
 let loads=0;let broken=false;let revokeDuringLoad=false;
 const server=createHttpServer(null,{platform,defiantEvidenceProvider:async({organizationId})=>{
  loads++;if(broken)throw new Error('private-provider-detail');
  return {loadSnapshot:async()=>{if(revokeDuringLoad)store.update('identity',state=>({...state,memberships:state.memberships.filter(m=>m.organizationId!==org.id)}));return {schemaVersion:1,organizationId,coverage:'Invented fixture',months:[],receipts:[]};}};
 }});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>server.close(r));store.close();});
 const base=`http://127.0.0.1:${server.address().port}`,path=`/api/studio/defiant-evidence/${org.id}/manifest`;
 assert.equal((await fetch(base+path)).status,401);assert.equal(loads,0);
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'evidence-founder',password:'invented-hosted-password'})});
 const headers={cookie:login.headers.get('set-cookie').split(';')[0]};
 const disabled=createHttpServer(null,{platform});await new Promise(r=>disabled.listen(0,'127.0.0.1',r));
 try{assert.equal((await fetch(`http://127.0.0.1:${disabled.address().port}`+path,{headers})).status,404);assert.equal(loads,0);}finally{await new Promise(r=>disabled.close(r));}
 const other=await platform.identity.createOrganization(actor,'Other invented evidence');
 await new DefiantStrategyService({store,identity:platform.identity,organizationId:other.id}).enable(actor,{});
 store.update('identity',state=>({...state,memberships:state.memberships.filter(m=>m.organizationId!==other.id)}));
 assert.equal((await fetch(base+`/api/studio/defiant-evidence/${other.id}/manifest`,{headers})).status,403);assert.equal(loads,0);
 const response=await fetch(base+path,{headers});assert.equal(response.status,200);assert.equal((await response.json()).scope.organizationId,org.id);
 broken=true;const failure=await fetch(base+path,{headers});assert.equal(failure.status,503);assert.equal((await failure.text()).includes('private-provider-detail'),false);
 broken=false;revokeDuringLoad=true;const revoked=await fetch(base+path,{headers});assert.equal(revoked.status,403);assert.equal((await revoked.text()).includes('Invented fixture'),false);
 const before=loads;
 assert.equal((await fetch(base+path,{headers})).status,403);assert.equal(loads,before);
});
