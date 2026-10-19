// CLI-only adapter. No secret/config path enters browser responses or child env.
export async function localPenpotDevelopment({configurationPath,studioOrigin,platform,nativePairing,nativePairingConfigurationPath}) {
 if(!configurationPath)return undefined;
 const {rejectDeployment}=await import('./local-development-support.mjs');rejectDeployment(process.env);
 const {createDevelopmentPenpotStoryDesigns}=await import('../server/penpot-story-development.js');
 const {loadNativePairingConfiguration}=await import('./local-native-pairing.mjs');
 const configuration=nativePairingConfigurationPath?loadNativePairingConfiguration(nativePairingConfigurationPath):null;
 if(!configuration?.grantKey)return createDevelopmentPenpotStoryDesigns({store:platform.store,identity:platform.identity,configurationPath,studioOrigin});
 if(!nativePairing||nativePairing.nativeInstanceId!==configuration.nativeInstanceId)throw Error('Current local native pairing required');
 const {PenpotBrandAccess,createPenpotMembershipReconciler}=await import('../server/penpot-brand-access.js');
 const {createNativeAccessController}=await import('../server/penpot-native-access-controller.js');
 const provider=await createDevelopmentPenpotStoryDesigns({store:platform.store,identity:platform.identity,configurationPath,studioOrigin,grantKey:configuration.grantKey,
  brandAccessFor:({scope,workspaceFor,rpc,nativeSessions})=>new PenpotBrandAccess({store:platform.store,identity:platform.identity,pairing:nativePairing,scope,workspaceFor,rpc,
   reconcileMembership:createPenpotMembershipReconciler({sessions:nativeSessions,grantKey:configuration.grantKey})})});
 provider.nativeAccess=createNativeAccessController({store:platform.store,nativeInstanceId:configuration.nativeInstanceId,grantKey:configuration.grantKey,
  accessFor:async scope=>(await provider(scope)).brandAccess});
 provider.pairedAccess=true;
 return provider;
}
