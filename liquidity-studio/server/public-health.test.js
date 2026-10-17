import test from 'node:test';
import assert from 'node:assert/strict';
import {DurableStore} from './storage.js';
import {createPlatform} from './platform.js';
import {createHttpServer} from './index.js';
import {googleAuthConfiguration} from './google-auth.js';
const configuration=googleAuthConfiguration({STUDIO_FIREBASE_PROJECT_ID:'test-health-project',STUDIO_FIREBASE_API_KEY:'public-key',STUDIO_FIREBASE_AUTH_DOMAIN:'test-health-project.firebaseapp.com',STUDIO_FIREBASE_APP_ID:'public-app',STUDIO_GOOGLE_FOUNDER_EMAIL:'founder@example.test',STUDIO_GOOGLE_MARKETER_EMAIL:'marketer@example.test'});
for(const mode of ['google','password']) test(`public non-z health aliases preserve truth and API authorization in ${mode} mode`,async t=>{
 const store=new DurableStore(':memory:');const platform=createPlatform({store,authMode:mode,googleAuth:{configuration,verifyIdToken:async()=>{throw Error('no verification should be requested');}}});await platform.ready;
 const server=createHttpServer(null,{platform});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{await new Promise(resolve=>server.close(resolve));await store.close();});
 const base='http://127.0.0.1:'+server.address().port;
 for(const [alias,existing] of [['/api/live','/healthz'],['/api/ready','/readyz']]){
  const a=await fetch(base+alias),b=await fetch(base+existing);assert.equal(a.status,200);assert.deepEqual(await a.json(),await b.json());
 }
 assert.equal((await fetch(base+'/api/auth/session')).status,401);
 assert.equal((await fetch(base+'/api/studio/bootstrap?organizationId=org_default&brandId=brand_default')).status,401);
 store.checkHealth=async()=>{throw Error('private dependency detail');};
 assert.deepEqual(await (await fetch(base+'/api/live')).json(),{status:'alive'});
 const unavailable=await fetch(base+'/api/ready');assert.equal(unavailable.status,503);const body=await unavailable.json();assert.equal(body.checks.repository,'unavailable');assert.equal(body.checks.generationProvider,'not_checked');assert.doesNotMatch(JSON.stringify(body),/private|email|user|token/);
});
