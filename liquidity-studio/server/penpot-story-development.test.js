import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {createDevelopmentPenpotStoryDesigns} from './penpot-story-development.js';
const owner='11111111-1111-4111-8111-111111111111',project='22222222-2222-4222-8222-222222222222',team='33333333-3333-4333-8333-333333333333',file='44444444-4444-4444-8444-444444444444',font='55555555-5555-4555-8555-555555555555';
async function setup(t){
 const dir=await mkdtemp(join(tmpdir(),'studio-dev-penpot-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const store=new DurableStore(join(dir,'studio.sqlite'));t.after(()=>store.close());const identity=new IdentityService(store);await identity.ready;
 await identity.provision({username:'local-founder',password:'controlled-password-only-1234567890',role:'founder'});const actor=(await store.get('identity')).users.find(u=>u.username==='local-founder');
 const config={version:1,targets:[{id:'local-native',organizationId:'org_default',brandId:'brand_default',adapter:'penpot',ownerPrincipal:owner,nativeProjectId:project,nativeRoomId:team,nativeDocumentVersion:'1',nativeVersionKind:'archive',editorVersion:'2.18.3',resources:[{id:'tokens',kind:'tokens',nativeId:file,nativeParentId:project}]}],sessions:[{ownerPrincipal:owner,cookie:'auth-token=controlled-native-session'}],manifests:[{targetId:'local-native',teamId:team,manifest:{ownerPrincipal:owner,projectId:project,fileId:file,layers:[{id:'layer'}],tokens:[1,2,3,4],fonts:{},nativeFonts:[{fontId:'custom-'+font,family:'Mona Sans',weight:400,license:'OFL-1.1',sha256:'a'.repeat(64)}],sourceApprovals:[],storyId:'legacy-only-not-new-story',generationId:'legacy-generation',storyRevision:1}}]};
 const path=join(dir,'operator.json');await writeFile(path,JSON.stringify(config),{mode:0o600});let profileId=owner,editable=true,fontStyle='normal';const calls=[];
 const fetchImpl=async(url,options)=>{calls.push({url,options});const command=url.split('/').at(-1);return new Response(JSON.stringify(command==='get-profile'?{id:profileId}:command==='get-project'?{id:project,teamId:team,permissions:{canEdit:editable}}:[{fontId:font,fontFamily:'Mona Sans',fontWeight:'400',fontStyle}]),{status:200});};
 const make=(options={})=>createDevelopmentPenpotStoryDesigns({store,identity,configurationPath:path,env:{NODE_ENV:'development'},fetchImpl,...options});return {store,identity,actor,path,make,calls,setProfile:id=>profileId=id,setEditable:value=>editable=value,setFontStyle:value=>fontStyle=value};
}
test('developer native workspace registers real scoped authority after native reads and observes later revocation',async t=>{
 const f=await setup(t),provider=await f.make(),service=await provider({organizationId:'org_default',brandId:'brand_default'});
 const workspace=await service.workspaceFor(f.actor);assert.equal(workspace.ownerPrincipal,owner);assert.equal(workspace.fonts[0].fontId,'custom-'+font);
 const key='editor-security:org_default:brand_default';let security=await f.store.get(key);assert.equal(security.bindings.length,1);assert.equal(security.bindings[0].registeredBy,f.actor.id);
 assert.deepEqual(f.calls.map(c=>c.url.split('/').at(-1)),['get-profile','get-project','get-font-variants']);assert.ok(f.calls.every(c=>c.url.startsWith('http://localhost:39008/api/rpc/command/')));
 await service.workspaceFor(f.actor);assert.equal((await f.store.get(key)).bindings.length,1);
 await f.store.update(key,s=>{s.bindings[0].revokedAt='2026-10-18T00:00:00Z';s.bindings[0].epoch++;return s;});await assert.rejects(()=>service.workspaceFor(f.actor),/binding not found/);assert.equal((await f.store.get(key)).bindings.length,1);
});
test('developer native configuration and current native/Studio authority fail closed without fake Google claims',async t=>{
 const f=await setup(t);await assert.rejects(()=>createDevelopmentPenpotStoryDesigns({store:f.store,identity:f.identity,configurationPath:f.path,env:{NODE_ENV:'production'}}),/local password launcher/);
 const provider=await f.make(),service=await provider({organizationId:'org_default',brandId:'brand_default'});f.setProfile(team);await assert.rejects(()=>service.workspaceFor(f.actor),/native owner/);assert.equal(await f.store.get('editor-security:org_default:brand_default'),null);
 f.setProfile(owner);f.setEditable(false);await assert.rejects(()=>service.workspaceFor(f.actor),/editable project/);
 await f.identity.provision({username:'local-marketer',password:'controlled-password-only-1234567890',role:'marketer'});const marketer=(await f.store.get('identity')).users.find(u=>u.username==='local-marketer');await assert.rejects(()=>service.workspaceFor(marketer),/founder/i);await assert.rejects(()=>provider({organizationId:'org_default',brandId:'brand_vedic'}),/exactly one/);
});
test('paired provider retains the fixed administrative workspace without letting a marketer set it up',async t=>{
 const f=await setup(t),scope={organizationId:'org_default',brandId:'brand_default'};
 await f.identity.provision({username:'paired-marketer',password:'controlled-paired-marketer-password',role:'marketer'});
 const marketer=(await f.store.get('identity')).users.find(x=>x.username==='paired-marketer');
 await f.identity.setMembership(f.actor,{userId:marketer.id,organizationId:scope.organizationId,brandIds:[scope.brandId]});
 let administrativeWorkspaceFor;
 const admission={require:async()=>{throw Object.assign(Error('Native live enforcement pending'),{status:503});}};
 const provider=await f.make({brandAccessFor:async dependencies=>{administrativeWorkspaceFor=dependencies.workspaceFor;return admission;}});
 const service=await provider(scope);
 assert.equal(service.brandAccess,admission);
 await assert.rejects(administrativeWorkspaceFor(marketer),/founder/i);
 assert.equal(await f.store.get('editor-security:org_default:brand_default'),null);
 const registered=await service.workspaceFor(f.actor);
 const shared=await administrativeWorkspaceFor(marketer);
 assert.equal(shared.ownerPrincipal,owner);assert.equal(shared.bindingId,registered.bindingId);
 assert.equal(shared.teamId,registered.teamId);assert.equal(shared.projectId,registered.projectId);
 await assert.rejects(service.workspaceFor(marketer),/founder/i,'default developer path remains founder-only');
 await f.identity.setMembership(f.actor,{userId:marketer.id,organizationId:scope.organizationId,brandIds:[]});
 await assert.rejects(administrativeWorkspaceFor(marketer),e=>e.status===403);
});

test('fresh workspace-only provider registers without legacy file and refuses wrong current font style',async t=>{
 const f=await setup(t),old=JSON.parse(await readFile(f.path,'utf8'));
 const fonts=old.manifests[0].manifest.nativeFonts.map(x=>({...x,fontVariantId:'normal-400'}));
 await writeFile(f.path,JSON.stringify({version:2,transportMode:'loopback',sessions:old.sessions,workspaces:[{id:'fresh-workspace',organizationId:'org_default',brandId:'brand_default',ownerPrincipal:owner,projectId:project,teamId:team,fonts}]}));
 const provider=await f.make(),service=await provider({organizationId:'org_default',brandId:'brand_default'});
 f.setFontStyle('italic');await assert.rejects(()=>service.workspaceFor(f.actor),/team fonts/);
 assert.equal(await f.store.get('editor-security:org_default:brand_default'),null);
 f.setFontStyle('normal');const workspace=await service.workspaceFor(f.actor);
 assert.equal(workspace.teamId,team);assert.equal(workspace.projectId,project);
 const state=await f.store.get('editor-security:org_default:brand_default');
 assert.equal(state.bindings.length,1);
 assert.ok(f.calls.every(c=>!['get-file','create-file','update-file'].includes(c.url.split('/').at(-1))));
});
