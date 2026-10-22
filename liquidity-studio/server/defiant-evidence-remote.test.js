import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomBytes} from 'node:crypto';
import {createServer} from 'node:http';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createPlatform} from './platform.js';
import {DurableStore} from './storage.js';
import {googleAuthConfiguration} from './google-auth.js';
import {DefiantStrategyService} from './defiant-strategy.js';
import {createRemoteEvidence} from './defiant-evidence-remote.js';
import {EVIDENCE_RESOURCE,EVIDENCE_ISSUER} from './defiant-evidence-oauth.js';
const publicClient={clientId:'https://chatgpt.com/oauth/client.json',redirectUri:'https://chatgpt.com/connector_platform_oauth_redirect',clientName:'ChatGPT evidence'};
const configuration=googleAuthConfiguration({STUDIO_FIREBASE_PROJECT_ID:'test-studio-project',STUDIO_FIREBASE_API_KEY:'public-key',STUDIO_FIREBASE_AUTH_DOMAIN:'test-studio-project.firebaseapp.com',STUDIO_FIREBASE_APP_ID:'public-app',STUDIO_GOOGLE_FOUNDER_EMAIL:'founder@example.com',STUDIO_GOOGLE_MARKETER_EMAIL:'marketer@example.com'});
async function fixture(t,clients=[publicClient]){
 const store=new DurableStore(':memory:');let loads=0,revokeDuringLoad=false;
 const platform=createPlatform({store,authMode:'google',googleAuth:{configuration,verifyIdToken:async(token,revoked)=>{assert.equal(revoked,true);if(token!=='google-fixture')throw Error('private detail');return {aud:'test-studio-project',iss:'https://securetoken.google.com/test-studio-project',sub:'managed-owner',iat:Math.floor(Date.now()/1000)-5,exp:Math.floor(Date.now()/1000)+3600,email:'founder@example.com',email_verified:true,firebase:{sign_in_provider:'google.com'}};},lookupJobUser:async()=>({uid:'managed-owner',email:'founder@example.com',emailVerified:true,disabled:false,providerData:[{providerId:'google.com'}],tokensValidAfterTime:'1970-01-01T00:00:00Z'})}});await platform.ready;
 const user=await platform.identity.authenticate('google-fixture'),organization=await platform.identity.createOrganization(user,'Invented OAuth evidence');const strategy=new DefiantStrategyService({store,identity:platform.identity,organizationId:organization.id});await strategy.enable(user,{});
 const remote=createRemoteEvidence({platform,clients,authorizeEvidence:async(actor,organizationId)=>new DefiantStrategyService({store,identity:platform.identity,organizationId}).raw(actor),fetchImpl:async url=>{assert.equal(url,publicClient.clientId);return Response.json({client_id:publicClient.clientId,redirect_uris:[publicClient.redirectUri],token_endpoint_auth_methods_supported:['none']});},provider:async({organizationId})=>({loadSnapshot:async()=>{loads++;if(revokeDuringLoad)await store.update('identity',s=>({...s,memberships:s.memberships.filter(m=>m.organizationId!==organization.id)}));return {schemaVersion:1,organizationId,coverage:'Invented authenticated evidence',months:[],receipts:[]};}})});
 t.after(()=>store.close());const request=(path,options={})=>remote.fetch(new Request('https://studio.chaiwithjai.com'+path,options));
 const jsonPost=(operation,body,cookie)=>request('/api/studio/remote-evidence/'+operation,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer google-fixture',cookie},body:JSON.stringify(body)});
 const token=async()=>{
  const verifier=randomBytes(32).toString('base64url'),params=new URLSearchParams({client_id:publicClient.clientId,redirect_uri:publicClient.redirectUri,resource:EVIDENCE_RESOURCE,scope:'evidence:read',response_type:'code',state:'host-state',code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256'});const begun=await request('/oauth/defiant-evidence/authorize?'+params);assert.equal(begun.status,302);const cookie=begun.headers.get('set-cookie').split(';')[0],transactionId=new URL(begun.headers.get('location')).searchParams.get('remoteEvidenceTransaction');
  const inspected=await (await jsonPost('inspect',{organizationId:organization.id,transactionId},cookie)).json();assert.equal(inspected.owner.userId,user.id);const approved=await jsonPost('approve',{organizationId:organization.id,transactionId,inspectionToken:inspected.inspectionToken},cookie);assert.equal(approved.status,200);
  const completed=await request('/oauth/defiant-evidence/complete?transaction='+transactionId,{headers:{cookie}});assert.equal(completed.status,302);const callback=new URL(completed.headers.get('location'));assert.equal(callback.searchParams.get('iss'),EVIDENCE_ISSUER);
  const response=await request('/oauth/defiant-evidence/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',client_id:publicClient.clientId,resource:EVIDENCE_RESOURCE,code:callback.searchParams.get('code'),redirect_uri:publicClient.redirectUri,code_verifier:verifier})});assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');return response.json();
 };
 return {platform,remote,request,jsonPost,token,organization,loads:()=>loads,revokeDuringLoad:()=>revokeDuringLoad=true};
}
test('empty client bootstrap discovery follows exact issuer path and scope without provider reads',async t=>{
 const f=await fixture(t,[]);const resource=await f.request('/.well-known/oauth-protected-resource/mcp/defiant-evidence');assert.equal(resource.status,200);const metadata=await resource.json();assert.equal(metadata.resource,EVIDENCE_RESOURCE);assert.deepEqual(metadata.scopes_supported,['evidence:read']);assert.deepEqual(metadata.authorization_servers,[EVIDENCE_ISSUER]);
 const issuer=new URL(metadata.authorization_servers[0]);const discovery=await f.request('/.well-known/oauth-authorization-server'+issuer.pathname);assert.equal(discovery.status,200);const auth=await discovery.json();assert.equal(auth.issuer,EVIDENCE_ISSUER);assert.equal(auth.authorization_response_iss_parameter_supported,true);assert.deepEqual(auth.code_challenge_methods_supported,['S256']);
 assert.equal((await f.request('/oauth/defiant-evidence/authorize?client_id='+encodeURIComponent(publicClient.clientId))).status,400);assert.equal(f.loads(),0);
});
test('real engine HTTP consent and actual SDK discover17tools/read pinned evidence, wrongscope and revoked membership deny',async t=>{
 const f=await fixture(t),token=await f.token();const client=new Client({name:'remote-evidence-contract',version:'1'},{versionNegotiation:{mode:'auto'}});t.after(()=>client.close());
 await client.connect(new StreamableHTTPClientTransport(new URL(EVIDENCE_RESOURCE),{fetch:(url,options)=>f.remote.fetch(new Request(url,{...options,headers:{...Object.fromEntries(new Headers(options?.headers)),Authorization:'Bearer '+token.access_token}}))}));
 const tools=(await client.listTools()).tools;assert.equal(tools.length,17);const result=await client.callTool({name:'defiant_evidence_manifest',arguments:{}});assert.equal(result.isError,undefined);assert.equal(result.structuredContent.scope.organizationId,f.organization.id);assert.equal(f.loads(),1);
 const wrong=await client.callTool({name:'defiant_evidence_manifest',arguments:{organizationId:'other'}});assert.equal(wrong.isError,true);assert.equal(wrong.structuredContent,undefined);assert.equal(f.loads(),1);
 f.revokeDuringLoad();const denied=await client.callTool({name:'defiant_evidence_manifest',arguments:{organizationId:f.organization.id}});assert.equal(denied.isError,true);assert.equal(denied.structuredContent,undefined);assert.equal(JSON.stringify(denied).includes('Invented authenticated evidence'),false);
});
test('normal Node HTTP adapter enforces host, origin, body ceiling and OAuth challenge before data',async t=>{
 const f=await fixture(t);const server=createServer((req,res)=>{void f.remote.handle(req,res);});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const base='http://127.0.0.1:'+server.address().port;
 const denied=await fetch(base+'/mcp/defiant-evidence',{headers:{Host:'studio.chaiwithjai.com'}});assert.equal(denied.status,401);assert.match(denied.headers.get('www-authenticate'),/oauth-protected-resource/);assert.equal(f.loads(),0);
 assert.equal((await fetch(base+'/.well-known/oauth-authorization-server/oauth/defiant-evidence',{headers:{Host:'wrong.invalid'}})).status,403);
 assert.equal((await fetch(base+'/oauth/defiant-evidence/token',{method:'POST',headers:{Host:'studio.chaiwithjai.com','content-type':'application/x-www-form-urlencoded'},body:'a'.repeat(65537)})).status,413);
 assert.equal((await f.request('/api/studio/remote-evidence/constructor',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,404);
});

test('slow response body deadline cancels its reader and never returns partial evidence',async()=>{
 const {readRemoteBody}=await import('./defiant-evidence-remote.js');const controller=new AbortController();let cancelled=0;const response=new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array([123]));},cancel(){cancelled++;}}));
 const pending=assert.rejects(readRemoteBody(response,65536,controller.signal),{status:408});controller.abort();await pending;assert.equal(cancelled,1);
});

test('built lazy remote module is defaultOFF and metadata bootstrap needs no fake registered client',async t=>{
 const {createHttpServer}=await import('./index.js');const store=new DurableStore(':memory:');const platform=createPlatform({store,authMode:'password'});await platform.ready;let reads=0;
 const server=createHttpServer(null,{platform,enableRemoteEvidence:false,defiantEvidenceProvider:async()=>{reads++;throw Error('Provider must not run');}});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>server.close(r));store.close();});const base='http://127.0.0.1:'+server.address().port;
 assert.equal((await(await fetch(base+'/api/auth/config')).json()).remoteEvidenceEnabled,false);assert.equal((await fetch(base+'/.well-known/oauth-protected-resource/mcp/defiant-evidence')).status,404);assert.equal((await fetch(base+'/mcp/defiant-evidence')).status,404);assert.equal(reads,0);
 assert.throws(()=>createHttpServer(null,{platform,enableRemoteEvidence:true,defiantEvidenceProvider:async()=>{reads++;}}),/managed Google/);
});

test('OAuth engine dependencies and UI consent never make general Studio bearer access anonymous',async t=>{
 const f=await fixture(t);assert.equal((await f.request('/api/studio/remote-evidence/list',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({organizationId:f.organization.id})})).status,403);assert.equal(f.loads(),0);
 const duplicate=new URLSearchParams([['grant_type','authorization_code'],['grant_type','refresh_token']]);assert.equal((await f.request('/oauth/defiant-evidence/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:duplicate})).status,400);
 for(const suffix of ['/authorize/extra','/token/extra','/complete/extra'])assert.equal((await f.request('/oauth/defiant-evidence'+suffix)).status,404);
});

test('enabled index imports built remote closure and discovers empty-client OAuth without evidence reads',async t=>{
 const {createHttpServer}=await import('./index.js');const f=await fixture(t,[]);let reads=0;const enabled=createHttpServer(null,{platform:f.platform,enableRemoteEvidence:true,remoteEvidenceClients:[],remoteEvidenceHosts:['studio.chaiwithjai.com'],defiantEvidenceProvider:async()=>{reads++;throw Error('No evidence read for metadata');}});await new Promise(r=>enabled.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>enabled.close(r)));const base='http://127.0.0.1:'+enabled.address().port;const get=path=>fetch(base+path,{headers:{Host:'studio.chaiwithjai.com'}});
 assert.equal((await(await get('/api/auth/config')).json()).remoteEvidenceEnabled,true);const metadata=await(await get('/.well-known/oauth-protected-resource/mcp/defiant-evidence')).json();assert.deepEqual(metadata.scopes_supported,['evidence:read']);assert.deepEqual(metadata.authorization_servers,[EVIDENCE_ISSUER]);const discovery=await get('/.well-known/oauth-authorization-server/oauth/defiant-evidence');assert.equal(discovery.status,200);assert.equal((await discovery.json()).issuer,EVIDENCE_ISSUER);assert.equal((await get('/oauth/defiant-evidence/authorize?client_id='+encodeURIComponent(publicClient.clientId))).status,400);assert.equal(reads,0);assert.equal(f.loads(),0);
});
