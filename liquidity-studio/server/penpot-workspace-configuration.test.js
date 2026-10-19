import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDevelopmentPenpotConfiguration} from './penpot-workspace-configuration.js';
const id=n=>`${String(n).repeat(8)}-${String(n).repeat(4)}-4${String(n).repeat(3)}-8${String(n).repeat(3)}-${String(n).repeat(12)}`;
const env={STUDIO_PENPOT_ENABLED:'true'};
const value=()=>({version:2,transportMode:'loopback',sessions:[{ownerPrincipal:id(1),cookie:'auth-token=controlled-session'}],workspaces:[{id:'cwj-workspace',organizationId:'org_default',brandId:'brand_vedic',ownerPrincipal:id(1),projectId:id(2),teamId:id(3),fonts:[{family:'Inter',weight:400,fontId:'custom-'+id(4),fontVariantId:'normal-400',license:'OFL-1.1',sha256:'a'.repeat(64)}]}]});
test('workspace-only configuration derives empty resource authority without fictional file or story',()=>{
 const result=validateDevelopmentPenpotConfiguration(value(),env);
 assert.deepEqual(result.targets[0].resources,[]);assert.equal(result.targets[0].nativeRoomId,id(3));assert.equal(result.targets[0].nativeProjectId,id(2));assert.equal(result.workspaces.get('cwj-workspace').fonts[0].fontVariantId,'normal-400');assert.equal(result.manifests,undefined);
});
test('workspace configuration rejects manifest fields, missing operator, reused team/scope, unsupported variants and cloud transport',()=>{
 for(const mutate of [v=>v.manifests=[],v=>delete v.workspaces[0].teamId,v=>v.sessions=[],v=>v.workspaces.push({...v.workspaces[0],id:'duplicate'}),v=>v.transportMode='docker-host',v=>v.workspaces[0].fonts[0].fontVariantId='italic-400',v=>v.workspaces[0].fonts[0].sha256='unknown',v=>v.workspaces[0].fileId=id(5)]){
  const v=value();mutate(v);assert.throws(()=>validateDevelopmentPenpotConfiguration(v,env));
 }
 assert.throws(()=>validateDevelopmentPenpotConfiguration(value(),{...env,K_SERVICE:'cloud'}));
});


test('explicit local destination keeps workspace schema and disables auxiliary tools without changing defaults',()=>{
 const actual=validateDevelopmentPenpotConfiguration({...value(),nativeOrigin:'http://127.0.0.1:39046',localTools:false},env);
 assert.equal(actual.nativeOrigin,'http://127.0.0.1:39046');assert.equal(actual.localTools,false);
 for(const nativeOrigin of ['http://remote.example:39046','http://127.0.0.1:80','http://127.1:39046','http://127.0.0.1:39046/path','https://native.example'])assert.throws(()=>validateDevelopmentPenpotConfiguration({...value(),nativeOrigin},env));
 assert.throws(()=>validateDevelopmentPenpotConfiguration({...value(),localTools:true},env));
});

test('developer embedding origins are explicit loopback values and unset remains absent',()=>{
 const env={STUDIO_PENPOT_ENABLED:'true'},plain=validateDevelopmentPenpotConfiguration(value(),env);assert.equal(plain.studioOrigin,undefined);
 const configured=validateDevelopmentPenpotConfiguration({...value(),studioOrigin:'http://127.0.0.1:39042',nativeOrigin:'http://localhost:39008'},env);assert.equal(configured.studioOrigin,'http://127.0.0.1:39042');
 for(const studioOrigin of ['https://studio.example.com','http://127.0.0.1:39042/','http://user@localhost:39042','http://localhost:39042/path'])assert.throws(()=>validateDevelopmentPenpotConfiguration({...value(),studioOrigin},env));
});
