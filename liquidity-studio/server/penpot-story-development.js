import {PenpotStoryReconnect} from './penpot-story-reconnect.js';
import {PenpotStoryRecovery,storyRecoveryDispatcher} from './penpot-story-recovery.js';
import {PenpotStorySvg,storySvgDispatcher} from './penpot-story-svg.js';
import {PenpotStoryStyles,storyStylePluginTransport} from './penpot-story-styles.js';
import {createPenpotPluginLocalHost} from './penpot-plugin-local-host.js';
// Explicit developer launcher integration, never production identity or pairing.
import {EditorBoundary} from './editor-boundary.js';
import {ScopedRepository} from './repository.js';
import {loadDevelopmentPenpotConfiguration} from './penpot-workspace-configuration.js';
import {PenpotStoryDesigns,createPenpotStoryRpc} from './penpot-story-design.js';
import {fail} from './auth.js';
export async function createDevelopmentPenpotStoryDesigns({store,identity,configurationPath,brandAccessFor=null,grantKey=null,env=process.env,fetchImpl=fetch}) {
 if(env.NODE_ENV!=='development'||env.K_SERVICE||env.K_REVISION||identity.mode!=='password')throw Error('Penpot developer integration requires the local password launcher');
 // Same strict private-file schema; this does not change process feature flags.
 const configuration=await loadDevelopmentPenpotConfiguration(configurationPath,{STUDIO_PENPOT_ENABLED:'true'});
 if(configuration.transportMode!=='loopback')throw Error('Developer Penpot requires fixed loopback transport');
 return createPenpotStoryProvider({store,identity,configuration,brandAccessFor,grantKey,fetchImpl,nativeOrigin:configuration.nativeOrigin,rpcOrigin:configuration.nativeOrigin||null,localTools:configuration.localTools!==false});
}
/** Shared composition; callers validate their deployment-specific configuration. */
export function createPenpotStoryProvider({store,identity,configuration,brandAccessFor=null,grantKey=null,fetchImpl=fetch,nativeOrigin='http://localhost:39008',rpcOrigin=null,localTools=true}) {
 const rpc=createPenpotStoryRpc({sessions:configuration.sessions,transportMode:configuration.transportMode,grantKey,fetchImpl,nativeOrigin,rpcOrigin});
 const services=new Map();
 const provider=async scope=>{
  const key=JSON.stringify([scope.organizationId,scope.brandId]);
  if(services.has(key))return services.get(key);
  const targets=configuration.targets.filter(t=>t.organizationId===scope.organizationId&&t.brandId===scope.brandId);
  if(targets.length!==1)throw fail(503,'Configure exactly one native workspace for this brand');
  const target=targets[0],entry=configuration.version===2?configuration.workspaces.get(target.id):configuration.manifests.get(target.id),fonts=configuration.version===2?entry?.fonts:entry?.manifest.nativeFonts;
  if(!Array.isArray(fonts)||!fonts.length)throw fail(422,'Verified team-local fonts are required');
  const repo=new ScopedRepository(store,scope),boundary=new EditorBoundary({store,identity,scope,repo,targets:[target]});
  let registration;
  const administrativeWorkspaceFor=async actor=>{
   await identity.authorize(actor,scope.organizationId,scope.brandId);
   const native={targetId:target.id,ownerPrincipal:target.ownerPrincipal,projectId:target.nativeProjectId,teamId:entry.teamId,fonts:structuredClone(fonts)};
   // get-project JSON has no permission DTO in pinned 2.18.3;
   // create-file independently enforces actual project edit ACL at the write.
   const profile=await rpc(native,'get-profile',{});
   if(profile.id!==native.ownerPrincipal)throw fail(403,'Current native owner session is unavailable; renew the registered operator account');
   const project=await rpc(native,'get-project',{id:native.projectId});
   if(project.id!==native.projectId||project.teamId!==native.teamId||project.permissions?.canEdit===false)throw fail(403,'Current native owner or editable project is unavailable');
   const variants=await rpc(native,'get-font-variants',{'team-id':native.teamId});
   if(!Array.isArray(variants)||fonts.some(font=>!variants.some(v=>'custom-'+v.fontId===font.fontId&&v.fontFamily===font.family&&Number(v.fontWeight)===font.weight&&(configuration.version!==2||v.fontStyle==='normal'))))throw fail(422,'Current native team fonts differ from the configured fonts');
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
  const brandAccess=brandAccessFor?await brandAccessFor({scope,workspaceFor:administrativeWorkspaceFor,rpc,repo,boundary,nativeSessions:configuration.sessions}):null;
  const service=new PenpotStoryDesigns({store,identity,scope,repo,workspaceFor,rpc,brandAccess,nativeOrigin});if(localTools)service.styles=new PenpotStoryStyles({designs:service,sessions:configuration.sessions,grantKey,fetchImpl});if(localTools&&grantKey){service.svg=new PenpotStorySvg({designs:service,grantKey,fetchImpl});service.recovery=new PenpotStoryRecovery({designs:service,grantKey,fetchImpl});}service.reconnect=new PenpotStoryReconnect(service);services.set(key,service);return service;
 };
 if(localTools)provider.createStylePluginHost=()=>createPenpotPluginLocalHost(storyStylePluginTransport(services),{port:39039});
 if(localTools&&grantKey){provider.svgDownload=storySvgDispatcher(services,grantKey);provider.recoveryDownload=storyRecoveryDispatcher(services,grantKey);}
 return provider;
}
