// Opt-in managed composition. No password identity, seeding, workspace creation,
// private editor frame, model assets or public sharing is enabled here.
import {lstat,readFile} from 'node:fs/promises';
import {isAbsolute} from 'node:path';
import {validatePenpotWorkspaceConfiguration} from './penpot-workspace-configuration.js';
import {createPenpotStoryProvider} from './penpot-story-development.js';
import {PenpotProfilePairing} from './penpot-profile-pairing.js';
import {PenpotBrandAccess,createPenpotMembershipReconciler} from './penpot-brand-access.js';
import {createNativeAccessController} from './penpot-native-access-controller.js';
import {publicHttpsOrigin,nativeRpcOrigin} from './penpot-origins.js';
export function validateManagedPenpotConfiguration(value){
 const keys=['schemaVersion','nativeInstanceId','nativeOrigin','rpcOrigin','studioOrigin','pairingKey','grantKey','workspace'];
 if(!value||Object.keys(value).sort().join(',')!==keys.sort().join(',')||value.schemaVersion!==1||!value.workspace||value.workspace.version!==2||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(value.nativeInstanceId||'')||![value.pairingKey,value.grantKey].every(x=>typeof x==='string'&&/^[A-Za-z0-9_-]{43}$/.test(x))||value.pairingKey===value.grantKey)throw Error('Exact managed native configuration required');
 publicHttpsOrigin(value.nativeOrigin);publicHttpsOrigin(value.studioOrigin);nativeRpcOrigin(value.rpcOrigin);
 // Reuse the strict workspace/UUID/font schema only, not its developer runtime.
 const workspace=validatePenpotWorkspaceConfiguration(value.workspace);
 return {...value,workspace};
}
export async function loadManagedPenpotConfiguration(filename){
 if(!isAbsolute(filename||''))throw Error('Absolute managed native configuration required');
 const stat=await lstat(filename);if(!stat.isFile()||stat.isSymbolicLink()||(stat.mode&0o077)||stat.size>1024*1024)throw Error('Private regular managed native configuration required');
 return validateManagedPenpotConfiguration(JSON.parse(await readFile(filename,'utf8')));
}
export async function createManagedPenpot({store,identity,configurationPath,fetchImpl=fetch}){
 if(identity?.mode!=='google'||identity.configuration?.mode!=='google')throw Error('Managed native integration requires Google identity');
 const configuration=await loadManagedPenpotConfiguration(configurationPath);
 const nativePairing=new PenpotProfilePairing({store,identity,...configuration});
 const provider=createPenpotStoryProvider({store,identity,configuration:configuration.workspace,grantKey:configuration.grantKey,fetchImpl,nativeOrigin:configuration.nativeOrigin,rpcOrigin:configuration.rpcOrigin,localTools:false,
  brandAccessFor:({scope,workspaceFor,rpc,nativeSessions})=>new PenpotBrandAccess({store,identity,pairing:nativePairing,scope,workspaceFor,rpc,reconcileMembership:createPenpotMembershipReconciler({sessions:nativeSessions,grantKey:configuration.grantKey,nativeOrigin:configuration.nativeOrigin,rpcOrigin:configuration.rpcOrigin,fetchImpl})})});
 provider.pairedAccess=true;
 const nativeAccess=createNativeAccessController({store,nativeInstanceId:configuration.nativeInstanceId,grantKey:configuration.grantKey,accessFor:async scope=>(await provider(scope)).brandAccess});
 return {storyDesigns:provider,nativePairing,nativeAccess};
}
