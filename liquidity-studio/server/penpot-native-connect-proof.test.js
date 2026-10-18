import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createNativeProfileProof,createNativeConnectHandler,createNativePairingProofSink,createNativePairingChallengeReader} from './penpot-native-connect-proof.js';
const challenge='A'.repeat(43),gatewayKey='a'.repeat(64),pairingKey='b'.repeat(43),nativeInstanceId='11111111-1111-4111-8111-111111111111',nativeProfileId='22222222-2222-4222-8222-222222222222';
test('native identity comes only from the presented native session and exact get-profile',async()=>{
 let call;const read=createNativeProfileProof({fetchImpl:async(url,options)=>{call={url,options};return Response.json({id:nativeProfileId,fullname:'Native Person',email:'private@example.test'});}});
 assert.deepEqual(await read('studio_session=ignore; auth-token=actual; studio_dev_production=ignore'),{nativeProfileId,nativeProfileName:'Native Person'});
 assert.equal(call.url,'http://localhost:39008/api/rpc/command/get-profile');assert.equal(call.options.headers.Cookie,'auth-token=actual');assert.equal(call.options.body,'{}');assert.equal(call.options.redirect,'error');
 await assert.rejects(read('auth-token=one; auth-token=two'),{status:401});await assert.rejects(read('studio_session=only'),{status:401});
 for(const response of [Response.json({id:'00000000-0000-0000-0000-000000000000'}),Response.json({id:'browser-profile'}),new Response('{}',{status:203}),new Response('x'.repeat(65537))])await assert.rejects(createNativeProfileProof({fetchImpl:async()=>response})('auth-token=actual'));
});
test('gateway page is inert; explicit same-native-origin confirmation records identity only',async t=>{
 const proofs=[];let reads=0;const server=http.createServer(createNativeConnectHandler({gatewayKey,nativeInstanceId,studioOrigin:'http://127.0.0.1:3002',describeChallenge:async value=>{if(value!==challenge)throw Object.assign(Error('Connection request expired'),{status:410});return {studioActorLabel:'Founder <script>alert(1)</script>',organizationLabel:'Private Studio',brandLabel:'Chai & Jai',expiresAt:Date.now()+120000};},readProfile:async cookie=>{reads++;assert.equal(cookie,'auth-token=presented');return {nativeProfileId,nativeProfileName:'Actual native'};},recordProof:async proof=>{proofs.push(proof);return {recorded:true};}}));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));const origin=`http://127.0.0.1:${server.address().port}`,headers={'X-Studio-Native-Gateway':gatewayKey};
 const page=await fetch(`${origin}/studio-connect?challenge=${challenge}`,{headers});assert.equal(page.status,200);assert.equal(reads,0);assert.equal(proofs.length,0);const html=await page.text();assert.match(html,/does not grant access/);assert.match(html,/Founder &lt;script&gt;alert\(1\)&lt;\/script&gt;/);assert.match(html,/Chai &amp; Jai/);assert.ok(!html.includes('<script>'));assert.equal(page.headers.get('referrer-policy'),'strict-origin');assert.match(page.headers.get('cache-control'),/no-store/);
 assert.equal((await fetch(`${origin}/studio-connect?challenge=${challenge}`)).status,403);
 const expired=await fetch(`${origin}/studio-connect?challenge=${'B'.repeat(43)}`,{headers});assert.equal(expired.status,410);assert.doesNotMatch(await expired.text(),/<button/);assert.equal(reads,0);
 const post=extra=>fetch(`${origin}/studio-connect/prove`,{method:'POST',headers:{...headers,'Content-Type':'application/x-www-form-urlencoded','X-Studio-Native-Origin':'http://localhost:39008','X-Studio-Native-Session':'auth-token=presented',...extra},body:`challenge=${challenge}`});
 assert.equal((await post({'X-Studio-Native-Origin':'http://evil.test'})).status,403);assert.equal(reads,0);
 assert.equal((await post({})).status,200);assert.deepEqual(proofs,[{challenge,nativeInstanceId,nativeProfileId,nativeProfileName:'Actual native'}]);
 assert.equal((await fetch(`${origin}/studio-connect/prove`,{method:'POST',headers:{...headers,'Content-Type':'application/x-www-form-urlencoded','X-Studio-Native-Origin':'http://localhost:39008'},body:`challenge=${challenge}&nativeProfileId=${nativeProfileId}`})).status,400);
});
test('proof callback is fixed, separately authenticated, bounded, and contains no native cookie',async()=>{
 let sent;const sink=createNativePairingProofSink({callbackUrl:'http://127.0.0.1:3002/api/native/penpot/pairing/proof',pairingKey,fetchImpl:async(url,options)=>{sent={url,options};return Response.json({recorded:true});}});
 const proof={challenge,nativeInstanceId,nativeProfileId};assert.deepEqual(await sink(proof),{recorded:true});assert.equal(sent.options.headers['X-Studio-Native-Pairing-Key'],pairingKey);assert.equal(sent.options.headers.Cookie,undefined);assert.deepEqual(JSON.parse(sent.options.body),proof);assert.equal(sent.options.redirect,'error');
 assert.throws(()=>createNativePairingProofSink({callbackUrl:'http://other.test/api/native/penpot/pairing/proof',pairingKey}));
 for(const response of [new Response('{}',{status:410}),Response.json({recorded:false}),new Response('x'.repeat(4097))])await assert.rejects(createNativePairingProofSink({callbackUrl:'http://localhost:3002/api/native/penpot/pairing/proof',pairingKey,fetchImpl:async()=>response})(proof));
});

test('private challenge reader requests only the fixed issuer descriptor and propagates expired rejection',async()=>{
 let sent;const read=createNativePairingChallengeReader({callbackUrl:'http://localhost:3002/api/native/penpot/pairing/challenge',pairingKey,nativeInstanceId,fetchImpl:async(url,options)=>{sent={url,options};return Response.json({studioActorLabel:'Founder',expiresAt:Date.now()+120000});}});
 assert.equal((await read(challenge)).studioActorLabel,'Founder');assert.equal(sent.url,'http://localhost:3002/api/native/penpot/pairing/challenge');assert.deepEqual(JSON.parse(sent.options.body),{challenge,nativeInstanceId});assert.equal(sent.options.headers.Cookie,undefined);assert.equal(sent.options.headers['X-Studio-Native-Pairing-Key'],pairingKey);
 const expired=createNativePairingChallengeReader({callbackUrl:'http://localhost:3002/api/native/penpot/pairing/challenge',pairingKey,nativeInstanceId,fetchImpl:async()=>new Response('{}',{status:410})});await assert.rejects(expired(challenge),{status:410});
});
