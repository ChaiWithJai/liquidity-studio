import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomBytes} from 'node:crypto';
import {DurableStore} from './storage.js';
import {createEvidenceOAuth,EVIDENCE_RESOURCE,EVIDENCE_ISSUER,authorizationCookie,selectCimdAuthentication,oauthHostConfiguration} from './defiant-evidence-oauth.js';
import {createEvidenceOAuthEngine} from './defiant-evidence-oauth-engine.js';
import {createCimdInspector} from './defiant-evidence-oauth-client.js';
const client={clientId:'https://chatgpt.com/oauth/client.json',redirectUri:'https://chatgpt.com/connector_platform_oauth_redirect',clientName:'ChatGPT evidence'};
const metadata={client_id:client.clientId,redirect_uris:[client.redirectUri],token_endpoint_auth_methods_supported:['private_key_jwt','none'],token_endpoint_auth_method:'private_key_jwt'};
const digest=v=>createHash('sha256').update(v).digest('base64url');
async function fixture(t,clients=[client]){
 const store=new DurableStore(':memory:');t.after(()=>store.close());let enabled=true,uid='uid-one',actor='owner',clock=Date.now(),authorityHook;
 const oauth=createEvidenceOAuth({store,clients,inspectClient:async()=>metadata,engineFactory:createEvidenceOAuthEngine,now:()=>clock,
  approveActor:async({token},org)=>{if(token!=='google-fixture'||!['org','other'].includes(org))throw Error();return {userId:actor,uid,email:'owner@example.test'};},
  authorizeDelegate:async g=>{await authorityHook?.(g);return enabled&&g.userId===actor&&g.uid===uid&&['org','other'].includes(g.organizationId);}});
 const begin=async()=>{const verifier=randomBytes(32).toString('base64url');const result=await oauth.begin({client_id:client.clientId,redirect_uri:client.redirectUri,resource:EVIDENCE_RESOURCE,scope:'evidence:read',response_type:'code',state:'host-state',code_challenge:digest(verifier),code_challenge_method:'S256'});return {...result,verifier,cookie:result.cookie.split(';')[0]};};
 const inspect=async(p,org='org')=>oauth.inspect({bearer:'google-fixture',organizationId:org,transactionId:p.transactionId,cookie:p.cookie});
 const decide=async(p,inspection,approved=true)=>oauth.decide({bearer:'google-fixture',organizationId:inspection.organizationId,transactionId:p.transactionId,cookie:p.cookie,inspectionToken:inspection.inspectionToken,approved});
 const code=async()=>{const p=await begin();const i=await inspect(p);await decide(p,i);const done=await oauth.complete(p);return {...p,authorizationCode:new URL(done.location).searchParams.get('code'),done};};
 const exchange=async p=>oauth.token({grant_type:'authorization_code',client_id:client.clientId,resource:EVIDENCE_RESOURCE,code:p.authorizationCode,redirect_uri:client.redirectUri,code_verifier:p.verifier});
 return {store,oauth,begin,inspect,decide,code,exchange,disable:()=>enabled=false,switchOwner:()=>{uid='uid-two';actor='second';},advance:ms=>clock+=ms,time:()=>clock,onAuthority:hook=>authorityHook=hook};
}
test('CIMD plural authentication intersection accepts none despite legacy private-key preference',()=>{
 assert.equal(selectCimdAuthentication(metadata,client),'none');
 for(const patch of [{token_endpoint_auth_methods_supported:['private_key_jwt']},{token_endpoint_auth_methods_supported:[]},{redirect_uris:[client.redirectUri+'/']},{client_id:client.clientId+'?x'}])assert.throws(()=>selectCimdAuthentication({...metadata,...patch},client));
});
test('empty reviewed allowlist denies authorize without inventing a callback',async t=>{
 const f=await fixture(t,[]);await assert.rejects(f.begin(),{status:400,oauthCode:'invalid_client'});
});
test('actual engine authorization code and S256 token exchange preserve exact issuer and private authority',async t=>{
 const f=await fixture(t),p=await f.code();const done=new URL(p.done.location);assert.equal(done.origin+done.pathname,client.redirectUri);assert.equal(done.searchParams.get('state'),'host-state');assert.equal(done.searchParams.get('iss'),EVIDENCE_ISSUER);assert.match(p.done.cookie,/Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=0$/);
 const token=await f.exchange(p);assert.equal(token.token_type,'Bearer');assert.ok(token.access_token);assert.ok(token.refresh_token);const grant=await f.oauth.verifyAccessToken(token.access_token);assert.equal(grant.organizationId,'org');assert.equal(grant.resource,EVIDENCE_RESOURCE);
 const stored=JSON.stringify(await f.store.get('defiant-evidence-oauth:v1'));assert.equal(stored.includes(token.access_token),false);assert.equal(stored.includes(token.refresh_token),false);assert.equal(stored.includes(p.verifier),false);await assert.rejects(f.exchange(p));
});
test('failed S256 proof consumes the actual engine code; parallel exchange cannot issue twice',async t=>{
 const f=await fixture(t),p=await f.code();await assert.rejects(f.oauth.token({grant_type:'authorization_code',client_id:client.clientId,resource:EVIDENCE_RESOURCE,code:p.authorizationCode,redirect_uri:client.redirectUri,code_verifier:'z'.repeat(43)}));await assert.rejects(f.exchange(p));
 const next=await f.code(),results=await Promise.allSettled([f.exchange(next),f.exchange(next)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
});
test('approve versus deny is atomic; different inspected owner cannot replace first terminal binding',async t=>{
 const f=await fixture(t),p=await f.begin(),first=await f.inspect(p),second=await f.inspect(p,'other');const results=await Promise.allSettled([f.decide(p,first),f.decide(p,second,false)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 const state=await f.store.get('defiant-evidence-oauth:v1'),terminal=state.transactions.find(x=>x.id===p.transactionId);assert.ok(['approved','denied'].includes(terminal.status));const frozen=JSON.stringify(terminal);f.switchOwner();await assert.rejects(f.decide(p,first));assert.equal(JSON.stringify((await f.store.get('defiant-evidence-oauth:v1')).transactions.find(x=>x.id===p.transactionId)),frozen);
});
test('inspection ticket, duplicate cookie and newest-browser cookie prevent cross-context completion',async t=>{
 const f=await fixture(t),p=await f.begin(),i=await f.inspect(p);await assert.rejects(f.oauth.inspect({bearer:'google-fixture',organizationId:'org',transactionId:p.transactionId,cookie:p.cookie+'; '+p.cookie}),{status:403});
 await assert.rejects(f.oauth.decide({bearer:'google-fixture',organizationId:'other',transactionId:p.transactionId,inspectionToken:i.inspectionToken,cookie:p.cookie,approved:true}),{status:403});
 const newest=await f.begin();await assert.rejects(f.oauth.inspect({bearer:'google-fixture',organizationId:'org',transactionId:p.transactionId,cookie:newest.cookie}),{status:403});
 f.switchOwner();await assert.rejects(f.decide(p,i),{status:403});
});
test('denial returns exact callback state issuer without an authorization code',async t=>{
 const f=await fixture(t),p=await f.begin(),i=await f.inspect(p);await f.decide(p,i,false);const done=new URL((await f.oauth.complete(p)).location);assert.equal(done.searchParams.get('error'),'access_denied');assert.equal(done.searchParams.get('state'),'host-state');assert.equal(done.searchParams.get('iss'),EVIDENCE_ISSUER);assert.equal(done.searchParams.has('code'),false);await assert.rejects(f.oauth.complete(p));
});
test('actual refresh rotates both tokens, preserves absolute expiry, and replay revokes only that family',async t=>{
 const f=await fixture(t),p=await f.code(),first=await f.exchange(p),g=await f.oauth.verifyAccessToken(first.access_token);const next=await f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token});const updated=await f.oauth.verifyAccessToken(next.access_token);assert.notEqual(first.access_token,next.access_token);assert.notEqual(first.refresh_token,next.refresh_token);assert.equal(updated.expiresAt,g.expiresAt);assert.equal((await f.oauth.verifyAccessToken(first.access_token)).id,updated.id);
 await assert.rejects(f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token}));await assert.rejects(f.oauth.verifyAccessToken(next.access_token),{status:401});await assert.rejects(f.oauth.verifyAccessToken(first.access_token),{status:401});
});
test('public revoke needs exact token possession; unknown and wrong client reveal no family',async t=>{
 const f=await fixture(t),token=await f.exchange(await f.code());const families=JSON.stringify((await f.store.get('defiant-evidence-oauth:v1')).families);assert.deepEqual(await f.oauth.revokePublic({client_id:client.clientId,token:'a'.repeat(43)}),{});assert.deepEqual(await f.oauth.revokePublic({client_id:'unknown',token:token.access_token}),{});assert.equal(JSON.stringify((await f.store.get('defiant-evidence-oauth:v1')).families),families);assert.deepEqual(await f.oauth.revokePublic({client_id:client.clientId,token:token.refresh_token}),{});await assert.rejects(f.oauth.verifyAccessToken(token.access_token),{status:401});
});
test('current membership403 differs from expired401; absolute lifetime cannot renew past expiry',async t=>{
 const f=await fixture(t),token=await f.exchange(await f.code());f.disable();await assert.rejects(f.oauth.verifyAccessToken(token.access_token),{status:403,oauthCode:'access_denied'});f.advance(28800001);await assert.rejects(f.oauth.verifyAccessToken(token.access_token),{status:401,oauthCode:'invalid_token'});await assert.rejects(f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:token.refresh_token}));
});
test('authorize starts and inspection proof attempts fail closed without evicting live entries',async t=>{
 const f=await fixture(t);for(let n=0;n<30;n++)await f.begin();const before=(await f.store.get('defiant-evidence-oauth:v1')).transactions;await assert.rejects(f.begin(),{status:429});assert.deepEqual((await f.store.get('defiant-evidence-oauth:v1')).transactions,before);
 assert.equal(authorizationCookie('a'.repeat(43),'b'.repeat(43)).includes('Domain='),false);
});
test('CIMD fetch is exact bounded no-redirect cached metadata; oversized body is denied',async()=>{
 let calls=0;const inspector=createCimdInspector({fetchImpl:async(url,options)=>{calls++;assert.equal(url,client.clientId);assert.equal(options.redirect,'error');assert.equal(options.credentials,'omit');return Response.json(metadata);}});await inspector(client);await inspector(client);assert.equal(calls,1);
 await assert.rejects(createCimdInspector({fetchImpl:async()=>new Response(new Uint8Array(16385),{headers:{'content-type':'application/json'}})})(client),{status:503});
});

test('CIMD slow response deadline aborts its finite fetch',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let started;const ready=new Promise(r=>started=r);let aborted=false;
 const inspector=createCimdInspector({fetchImpl:async(_url,{signal})=>{started();return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>{aborted=true;reject(Error('private transport detail'));},{once:true}));}});
 const pending=assert.rejects(inspector(client),{status:503});await ready;t.mock.timers.tick(5000);await pending;assert.equal(aborted,true);
});

test('invalid short PKCE verifier is consumed by actual patched engine, not retried against same code',async t=>{
 const f=await fixture(t),p=await f.code();await assert.rejects(f.oauth.token({grant_type:'authorization_code',client_id:client.clientId,resource:EVIDENCE_RESOURCE,code:p.authorizationCode,redirect_uri:client.redirectUri,code_verifier:'x'}));await assert.rejects(f.exchange(p));
});

test('deployment host configuration is bounded exact existing-service metadata, never forwarded authority',()=>{
 const tag='evidence-oauth-candidate---liquidity-studio-x4fdad2sga-uk.a.run.app';assert.deepEqual(oauthHostConfiguration(JSON.stringify(['studio.chaiwithjai.com',tag])),['studio.chaiwithjai.com','liquidity-studio-x4fdad2sga-uk.a.run.app',tag]);
 for(const value of [[tag],['studio.chaiwithjai.com',tag,tag],['studio.chaiwithjai.com','evil.example'],['studio.chaiwithjai.com',tag+':443'],['studio.chaiwithjai.com',tag+'/'],['studio.chaiwithjai.com','*.a.run.app'],['studio.chaiwithjai.com','x---another-service.a.run.app'],'x'.repeat(1025)])assert.throws(()=>oauthHostConfiguration(value));
});


test('retained and current access expire at their original five-minute deadlines, never at refresh time',async t=>{
 const f=await fixture(t),first=await f.exchange(await f.code());const original=await f.oauth.verifyAccessToken(first.access_token);f.advance(1000);const next=await f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token});const family=await f.oauth.verifyAccessToken(next.access_token);assert.equal(family.expiresAt,original.expiresAt);assert.equal(family.accessTokens[0].expiresAt,original.accessExpiresAt);assert.equal(family.accessExpiresAt,f.time()+300000);
 f.advance(299001);await assert.rejects(f.oauth.verifyAccessToken(first.access_token),{status:401});assert.equal((await f.oauth.verifyAccessToken(next.access_token)).id,family.id);f.advance(1000);await assert.rejects(f.oauth.verifyAccessToken(next.access_token),{status:401});
});
test('verification paused in current authority survives legitimate refresh then family revocation denies both',async t=>{
 const f=await fixture(t),first=await f.exchange(await f.code());let enter,release;const entered=new Promise(r=>enter=r),resume=new Promise(r=>release=r);f.onAuthority(async()=>{f.onAuthority(null);enter();await resume;});const pending=f.oauth.verifyAccessToken(first.access_token);try{await entered;const next=await f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token});release();const verified=await pending;assert.equal(verified.organizationId,'org');assert.equal((await f.oauth.verifyAccessToken(next.access_token)).id,verified.id);
 await f.oauth.revokePublic({client_id:client.clientId,token:first.access_token});await assert.rejects(f.oauth.verifyAccessToken(first.access_token),{status:401});await assert.rejects(f.oauth.verifyAccessToken(next.access_token),{status:401});}finally{release();await pending.catch(()=>{});}
});
test('legacy sole-hash families migrate during refresh and current authority still denies retained tokens',async t=>{
 const f=await fixture(t),first=await f.exchange(await f.code());await f.store.update('defiant-evidence-oauth:v1',s=>({...s,families:s.families.map(g=>{const {accessTokens,...legacy}=g;return legacy;})}));await f.oauth.verifyAccessToken(first.access_token);const next=await f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token});assert.equal((await f.oauth.verifyAccessToken(next.access_token)).accessTokens.length,1);f.disable();await assert.rejects(f.oauth.verifyAccessToken(first.access_token),{status:403});await assert.rejects(f.oauth.verifyAccessToken(next.access_token),{status:403});
});
test('family access capacity fails before consuming refresh and expired slots permit the same credential',async t=>{
 const f=await fixture(t),first=await f.exchange(await f.code());await f.store.update('defiant-evidence-oauth:v1',s=>({...s,families:s.families.map(g=>({...g,accessTokens:Array.from({length:63},(_,n)=>({hash:(n+1).toString(16).padStart(64,'0'),expiresAt:f.time()+1000}))}))}));const before=await f.store.get('defiant-evidence-oauth:v1');await assert.rejects(f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token}),{status:429});const after=await f.store.get('defiant-evidence-oauth:v1');assert.equal(after.families[0].refreshHash,before.families[0].refreshHash);assert.deepEqual(after.tombstones,before.tombstones);assert.equal(after.families[0].claim,before.families[0].claim);await f.oauth.verifyAccessToken(first.access_token);
 f.advance(1001);const next=await f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token});assert.equal((await f.oauth.verifyAccessToken(next.access_token)).accessTokens.length,1);
});
test('malformed retained hashes, duplicate entries and extended original deadlines fail closed',async t=>{
 for(const kind of ['array','hash','duplicate','expiry','current-bound','overflow']){const f=await fixture(t),first=await f.exchange(await f.code());await f.store.update('defiant-evidence-oauth:v1',s=>({...s,families:s.families.map(g=>({...g,accessTokens:kind==='array'?{}:kind==='overflow'?Array.from({length:64},(_,n)=>({hash:(n+1).toString(16).padStart(64,'0'),expiresAt:g.accessExpiresAt})):[{hash:kind==='hash'?'bad':kind==='duplicate'?g.accessHash:'0'.repeat(64),expiresAt:kind==='expiry'?g.expiresAt+1:kind==='current-bound'?g.accessExpiresAt+1:g.accessExpiresAt}]}))}));await assert.rejects(f.oauth.verifyAccessToken(first.access_token),{status:503});}
});
test('failed persistence after refresh consumption closes only the owned family and never restores refresh',async t=>{
 const f=await fixture(t),first=await f.exchange(await f.code());const original=f.store.update.bind(f.store);let rejectSave=true;f.store.update=(key,fn)=>original(key,old=>{const next=fn(old);if(key==='defiant-evidence-oauth:v1'&&rejectSave&&old?.families[0]?.claim&&next.families[0].accessHash!==old.families[0].accessHash){rejectSave=false;throw Error('Simulated persistence failure');}return next;});await assert.rejects(f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token}));const stored=await f.store.get('defiant-evidence-oauth:v1');assert.equal(stored.families[0].refreshHash,null);assert.equal(stored.families[0].revoked,true);await assert.rejects(f.oauth.verifyAccessToken(first.access_token),{status:401});await assert.rejects(f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token}));
});


test('uncertain cleanup cannot restore consumed refresh or extend already issued access',async t=>{
 const f=await fixture(t),first=await f.exchange(await f.code());const original=f.store.update.bind(f.store);f.store.update=(key,fn)=>original(key,old=>{const next=fn(old);if(key==='defiant-evidence-oauth:v1'&&old?.families[0]?.claim)throw Error('Persistent save and cleanup failure');return next;});await assert.rejects(f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token}));const uncertain=await f.store.get('defiant-evidence-oauth:v1');assert.equal(uncertain.families[0].refreshHash,null);assert.ok(uncertain.families[0].claim);await f.oauth.verifyAccessToken(first.access_token);f.advance(300001);await assert.rejects(f.oauth.verifyAccessToken(first.access_token),{status:401});f.store.update=original;await assert.rejects(f.oauth.token({grant_type:'refresh_token',client_id:client.clientId,resource:EVIDENCE_RESOURCE,refresh_token:first.refresh_token}));assert.equal((await f.store.get('defiant-evidence-oauth:v1')).families[0].revoked,true);
});

test('persisted current expiry beyond five minutes fails closed',async t=>{const f=await fixture(t),first=await f.exchange(await f.code());await f.store.update('defiant-evidence-oauth:v1',s=>({...s,families:s.families.map(g=>({...g,accessExpiresAt:f.time()+300001}))}));await assert.rejects(f.oauth.verifyAccessToken(first.access_token),{status:503});});
