import test from 'node:test';
import assert from 'node:assert/strict';
import {nativePublicOrigin,nativeRpcOrigin} from './penpot-origins.js';
import {createManagedPenpot,validateManagedPenpotConfiguration} from './penpot-managed.js';
import {createPenpotStoryRpc,PenpotStoryDesigns} from './penpot-story-design.js';
import {PenpotProfilePairing} from './penpot-profile-pairing.js';
const uuid='11111111-1111-4111-8111-111111111111';
test('managed browser and internal RPC origins remain independent and constructor owned',async()=>{
 assert.equal(nativePublicOrigin('https://design.example.com'),'https://design.example.com');
 assert.equal(nativeRpcOrigin('http://penpot-frontend:8080'),'http://penpot-frontend:8080');
 for(const value of ['http://design.example.com','https://design.example.com/path','https://user:pass@design.example.com','https://design.example.com?next=x'])assert.throws(()=>nativePublicOrigin(value));
 const calls=[];const rpc=createPenpotStoryRpc({sessions:new Map([[uuid,{cookie:'auth-token=private'}]]),nativeOrigin:'https://design.example.com',rpcOrigin:'http://penpot-frontend:8080',fetchImpl:async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify({id:uuid}),{status:200});}});
 assert.deepEqual(await rpc({ownerPrincipal:uuid},'get-profile',{}),{id:uuid});
 assert.equal(calls[0].url,'http://penpot-frontend:8080/api/rpc/command/get-profile');assert.equal(calls[0].options.headers.Origin,'https://design.example.com');assert.equal(calls[0].options.redirect,'error');
 const designs=new PenpotStoryDesigns({scope:{organizationId:'org',brandId:'brand'},nativeOrigin:'https://design.example.com'});
 const dto=designs.dto({id:uuid,status:'ready',identity:{storyId:'story',generationId:'gen',brandRevision:'rev'},teamId:uuid,fileId:uuid,pages:[{format:'infographic',id:uuid}]},'infographic',{id:uuid});
 assert.equal(new URL(dto.nativeUrl).origin,'https://design.example.com');assert.match(dto.nativeUrl,/#\/workspace\?team-id=/);
 const pairing=new PenpotProfilePairing({nativeInstanceId:uuid,nativeOrigin:'https://design.example.com',pairingKey:'a'.repeat(43)});assert.equal(pairing.nativeOrigin,'https://design.example.com');
});
test('managed constructor never accepts password composition and exact config has no caller extension',async()=>{
 await assert.rejects(createManagedPenpot({identity:{mode:'password'},configurationPath:'/does-not-exist'}),/Google identity/);
 assert.throws(()=>validateManagedPenpotConfiguration({schemaVersion:1,nativeOrigin:'https://design.example.com',extra:true}),/Exact managed/);
});

test('managed private config binds finite workspace and separate keys without enabling local tools',()=>{
 const id=n=>`${String(n).repeat(8)}-${String(n).repeat(4)}-4${String(n).repeat(3)}-8${String(n).repeat(3)}-${String(n).repeat(12)}`;
 const value={schemaVersion:1,nativeInstanceId:id(8),nativeOrigin:'https://design.example.com',rpcOrigin:'http://penpot-frontend:8080',studioOrigin:'https://studio.example.com',pairingKey:'a'.repeat(43),grantKey:'b'.repeat(43),workspace:{version:2,transportMode:'loopback',sessions:[{ownerPrincipal:id(1),cookie:'auth-token=controlled'}],workspaces:[{id:'brand-native',organizationId:'org_default',brandId:'brand_vedic',ownerPrincipal:id(1),projectId:id(2),teamId:id(3),fonts:[{family:'Inter',weight:400,fontId:'custom-'+id(4),fontVariantId:'normal-400',license:'OFL-1.1',sha256:'a'.repeat(64)}]}]}};
 assert.equal(validateManagedPenpotConfiguration({...value,authorityTimeoutMs:2500}).authorityTimeoutMs,2500);
 for(const authorityTimeoutMs of [0,799,2501,'2500'])assert.throws(()=>validateManagedPenpotConfiguration({...value,authorityTimeoutMs}));
 const nativeWithout=validateManagedPenpotConfiguration(value);assert.deepEqual(validateManagedPenpotConfiguration({...value,jevGatewayApiKey:'invented-private-key'}),nativeWithout);assert.equal(Object.hasOwn(nativeWithout,'jevGatewayApiKey'),false);
 for(const key of [null,1,'','contains space','x'.repeat(8193)])assert.throws(()=>validateManagedPenpotConfiguration({...value,jevGatewayApiKey:key}));assert.throws(()=>validateManagedPenpotConfiguration({...value,arbitraryEvaluationKey:'no'}));
 const actual=validateManagedPenpotConfiguration(value);assert.equal(actual.workspace.targets[0].nativeProjectId,id(2));assert.deepEqual(actual.workspace.targets[0].resources,[]);
 for(const mutate of [v=>v.workspace.workspaces[0].fileId=id(9),v=>v.workspace.sessions=[],v=>v.nativeOrigin='http://localhost:39008',v=>v.grantKey=v.pairingKey,v=>v.rpcOrigin='http://native/path']){const bad=structuredClone(value);mutate(bad);assert.throws(()=>validateManagedPenpotConfiguration(bad));}
});

test('native proof uses actual presented cookie at fixed internal origin and HTTPS callback receives no cookie',async()=>{
 const {createNativeProfileProof,createNativePairingProofSink}=await import('./penpot-native-connect-proof.js');
 let call;const read=createNativeProfileProof({nativeOrigin:'https://design.example.com',rpcOrigin:'http://penpot-frontend:8080',fetchImpl:async(url,options)=>{call={url,options};return Response.json({id:uuid,fullname:'Native editor'});}});
 assert.deepEqual(await read('auth-token=presented-native-session'),{nativeProfileId:uuid,nativeProfileName:'Native editor'});
 assert.equal(call.url,'http://penpot-frontend:8080/api/rpc/command/get-profile');assert.equal(call.options.headers.Origin,'https://design.example.com');assert.equal(call.options.headers.Cookie,'auth-token=presented-native-session');
 const sink=createNativePairingProofSink({callbackUrl:'https://studio.example.com/api/native/penpot/pairing/proof',pairingKey:'a'.repeat(43),fetchImpl:async(url,options)=>{call={url,options};return Response.json({recorded:true});}});
 await sink({challenge:'b'.repeat(43),nativeInstanceId:uuid,nativeProfileId:uuid});assert.equal(call.options.headers.Cookie,undefined);assert.equal(call.options.headers.Authorization,undefined);assert.equal(call.options.redirect,'error');
});

import {readFile} from 'node:fs/promises';
test('managed adapter deployment entrypoint forwards its validated private timeout configuration',async()=>{
 const dockerfile=await readFile(new URL('../../deployments/managed-penpot/Dockerfile.adapter',import.meta.url),'utf8');
 const entry=await readFile(new URL('../scripts/serve-managed-native-connect.mjs',import.meta.url),'utf8');
 assert.match(dockerfile,/serve-managed-native-connect\.mjs/);
 assert.match(entry,/loadManagedPenpotConfiguration/);
 assert.match(entry,/createPenpotNativeAccessForwarder\(configuration\)/);
});
