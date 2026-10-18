// Explicit developer launcher integration, never production identity or pairing.
import {EditorBoundary} from './editor-boundary.js';
import {ScopedRepository} from './repository.js';
import {loadPenpotLocalConfiguration} from './penpot-local-configuration.js';
import {PenpotStoryDesigns,createPenpotStoryRpc} from './penpot-story-design.js';
import {fail} from './auth.js';
export async function createDevelopmentPenpotStoryDesigns({store,identity,configurationPath,brandAccessFor=null,env=process.env,fetchImpl=fetch}) {
 if(env.NODE_ENV!=='development'||env.K_SERVICE||env.K_REVISION||identity.mode!=='password')throw Error('Penpot developer integration requires the local password launcher');
 // Same strict private-file schema; this does not change process feature flags.
 const configuration=await loadPenpotLocalConfiguration(configurationPath,{STUDIO_PENPOT_ENABLED:'true'});
 if(configuration.transportMode!=='loopback')throw Error('Developer Penpot requires fixed loopback transport');
 const rpc=createPenpotStoryRpc({sessions:configuration.sessions,transportMode:'loopback',fetchImpl});
 const services=new Map();
 return async scope=>{
  const key=JSON.stringify([scope.organizationId,scope.brandId]);
  if(services.has(key))return services.get(key);
  const targets=configuration.targets.filter(t=>t.organizationId===scope.organizationId&&t.brandId===scope.brandId);
  if(targets.length!==1)throw fail(503,'Configure exactly one native workspace for this local brand');
  const target=targets[0],entry=configuration.manifests.get(target.id),fonts=entry?.manifest.nativeFonts;
  if(!Array.isArray(fonts)||!fonts.length)throw fail(422,'Verified team-local fonts are required');
  const repo=new ScopedRepository(store,scope),boundary=new EditorBoundary({store,identity,scope,repo,targets:[target]});
  let registration;
  const administrativeWorkspaceFor=async actor=>{
   await identity.authorize(actor,scope.organizationId,scope.brandId);
   const native={targetId:target.id,ownerPrincipal:target.ownerPrincipal,projectId:target.nativeProjectId,teamId:entry.teamId,fonts:structuredClone(fonts)};
   // get-project JSON has no permission DTO in pinned 2.18.3;
   // create-file independently enforces actual project edit ACL at the write.
   const profile=await rpc(native,'get-profile',{}),project=await rpc(native,'get-project',{id:native.projectId});
   if(profile.id!==native.ownerPrincipal||project.id!==native.projectId||project.teamId!==native.teamId||project.permissions?.canEdit===false)throw fail(403,'Current native owner or editable project is unavailable');
   const variants=await rpc(native,'get-font-variants',{'team-id':native.teamId});
   if(!Array.isArray(variants)||fonts.some(font=>!variants.some(v=>'custom-'+v.fontId===font.fontId&&v.fontFamily===font.family&&Number(v.fontWeight)===font.weight)))throw fail(422,'Current native team fonts differ from the configured fonts');
   // Serialize first registration. Existing revoked/stale registrations are never
   // silently replaced; explicit operator configuration cannot revive a revoke.
   if(!registration){registration=(async()=>{const state=await boundary.read(),matching=state.bindings.filter(b=>b.targetId===target.id);if(matching.length){const active=matching.filter(b=>!b.revokedAt);if(active.length!==1)throw fail(403,'Native workspace registration requires operator review');return boundary.binding(state,active[0].id);}identity.requireFounder(actor);const current=(await store.get('identity'))?.users?.find(x=>x.id===actor.id);if(current?.role!=='founder')throw fail(403,'Current founder permission required for native workspace setup');return boundary.register(actor,{targetId:target.id});})();try{await registration;}catch(error){registration=null;throw error;}}
   const registered=await registration,current=boundary.binding(await boundary.read(),registered.id);
   await identity.authorize(actor,scope.organizationId,scope.brandId);
   return {...native,bindingId:current.id,bindingEpoch:current.epoch};
  };
  const workspaceFor=async actor=>{
   identity.requireFounder(actor);
   const workspace=await administrativeWorkspaceFor(actor);
   const current=(await store.get('identity'))?.users?.find(x=>x.id===actor.id);
   if(current?.role!=='founder')throw fail(403,'Current founder permission required');
   return workspace;
  };
  // Only the constructor chooses paired access. The actor never selects an
  // operator identity, project, session, or alternate workspace in HTTP input.
  const brandAccess=brandAccessFor?await brandAccessFor({scope,workspaceFor:administrativeWorkspaceFor,rpc,repo,boundary}):null;
  const service=new PenpotStoryDesigns({store,identity,scope,repo,workspaceFor,rpc,brandAccess});services.set(key,service);return service;
 };
}
