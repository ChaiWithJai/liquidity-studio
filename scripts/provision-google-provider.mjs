import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
export function validateProviderInput(env) {
 const project=env.PILOT_PROJECT, appId=env.PILOT_FIREBASE_APP_ID, supportEmail=env.PILOT_SUPPORT_EMAIL;
 if(!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project||'') || !/^1:\d+:web:[a-f0-9]+$/.test(appId||'') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail||'')) throw new Error('Explicit valid project, Firebase Web App ID and support email required');
 const authDomain=env.PILOT_AUTH_DOMAIN;
 if(authDomain !== `${project}.firebaseapp.com`) throw new Error('Pilot Firebase auth domain must match the explicit project');
 return {project,appId,supportEmail,authDomain};
}
export function assertDisabled(config) {
 if(config.signIn?.anonymous?.enabled === true || config.signIn?.email?.enabled === true) throw new Error('Anonymous and email/password providers must be disabled explicitly before this Google-only operation');
}
export async function provisionGoogleProvider({mode,env=process.env,run=spawnSync,fetchImpl=fetch}) {
 const input=validateProviderInput(env);
 if(!['plan','apply'].includes(mode)) throw new Error('Use plan or apply');
 if(mode==='plan') return {operation:'Google provider only',project:input.project,appId:input.appId,tool:'firebase-tools@15.34.0',anonymous:false,emailPassword:false};
 if(env.PILOT_CONFIRM_PROJECT!==input.project) throw new Error('PILOT_CONFIRM_PROJECT must match explicit target before mutation');
 const cli=env.PILOT_FIREBASE_CLI;
 if(!cli || !path.isAbsolute(cli)) throw new Error('Absolute pinned Firebase CLI entrypoint required');
 const packageFile=path.resolve(path.dirname(cli),'../../package.json');
 if(JSON.parse(fs.readFileSync(packageFile,'utf8')).version!=='15.34.0') throw new Error('Only reviewed firebase-tools 15.34.0 supported');
 const auth=run('gcloud',['auth','print-access-token',`--project=${input.project}`],{encoding:'utf8',stdio:'pipe',timeout:120000});
 if(auth.status!==0) throw new Error('Operator authentication unavailable');
 const request=async url=>{const r=await fetchImpl(url,{headers:{Authorization:`Bearer ${auth.stdout.trim()}`,'x-goog-user-project':input.project},signal:AbortSignal.timeout(15000),redirect:'error'});if(!r.ok)throw new Error('Provider inventory verification failed');return r.json();};
 const base=`https://identitytoolkit.googleapis.com/admin/v2/projects/${input.project}`;
 const app=await request(`https://firebase.googleapis.com/v1beta1/projects/${input.project}/webApps/${input.appId}`);
 if(app.appId!==input.appId || app.projectId!==input.project) throw new Error('Web app is not owned by explicit project');
 assertDisabled(await request(base+'/config'));
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'liquidity-provider-'));fs.chmodSync(dir,0o700);
 try {
  const file=path.join(dir,'firebase.json');fs.writeFileSync(file,JSON.stringify({auth:{providers:{anonymous:false,emailPassword:false,googleSignIn:{oAuthBrandDisplayName:'Liquidity Studio',supportEmail:input.supportEmail,authorizedRedirectUris:[`https://${input.authDomain}/__/auth/handler`]}}}}),{mode:0o600});
  const result=run(process.execPath,[cli,'deploy','--only','auth','--project',input.project,'--config',file,'--non-interactive'],{cwd:dir,encoding:'utf8',stdio:'pipe',timeout:120000,env:{...env,CLOUDSDK_CORE_LOG_HTTP:'false'}});
  if(result.status!==0) throw new Error('Pinned Firebase auth-only provisioning failed; no CLI diagnostic payload is exposed');
  const provider=await request(base+'/defaultSupportedIdpConfigs/google.com');
  if(provider.enabled!==true || !provider.clientId?.endsWith('.apps.googleusercontent.com')) throw new Error('Enabled Google provider was not confirmed');
  assertDisabled(await request(base+'/config'));
  return {project:input.project,googleEnabled:true,anonymous:false,emailPassword:false};
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) provisionGoogleProvider({mode:process.argv[2]||'plan'}).then(result=>console.log(JSON.stringify(result))).catch(error=>{console.error(error.message);process.exitCode=1;});
