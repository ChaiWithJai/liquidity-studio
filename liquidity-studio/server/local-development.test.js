// Hosted CI only under the current Neo-only local testing constraint.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {
  parseLocalArguments, rejectDeployment, requestAllowed, sanitizedChildEnvironment,
  developerCookieName, mapRequestCookie, mapResponseCookie, privateHomeSettings,
  createDevelopmentServer, localFrameSource,
} from '../scripts/local-development-support.mjs';

const token='A'.repeat(43);
const origin='http://127.0.0.1:3002';
const request=(patch={})=>({socket:{remoteAddress:'127.0.0.1'},headers:{host:'127.0.0.1:3002'},...patch});

test('local CLI parsing refuses ambiguous profiles, duplicate flags and privileged/public bindings',()=>{
  assert.deepEqual(parseLocalArguments(['--host','localhost']),{profile:'development',port:3002,check:false,hostname:'localhost'});
  for(const host of ['[::1]','example.com','localhost.localdomain','127.0.0.2'])assert.throws(()=>parseLocalArguments(['--host',host]));
  assert.deepEqual(parseLocalArguments([]),{profile:'development',port:3002,check:false});
  assert.deepEqual(parseLocalArguments(['--profile','production','--port','43127','--check']),{profile:'production',port:43127,check:true});
  for(const args of [
    ['--profile','prod'],['--profile'],['--port','0'],['--port','80'],['--port','65536'],
    ['--host','0.0.0.0'],['--database','/data/live.sqlite'],['--profile','development','--profile','staging'],
    ['--port','3002','--port','3003'],['--check','--check'],
  ])assert.throws(()=>parseLocalArguments(args),undefined,JSON.stringify(args));
});

test('portable recovery is an explicit local option requiring the private native editor',async()=>{
 assert.throws(()=>parseLocalArguments(['--portable-recovery']),/requires --native-assets/);
 assert.deepEqual(parseLocalArguments(['--native-assets','/private/current-native','--portable-recovery']),{profile:'development',port:3002,check:false,nativeAssetsDirectory:'/private/current-native',portableRecovery:true});
 assert.throws(()=>parseLocalArguments(['--native-assets','/private/current-native','--portable-recovery','--portable-recovery']),/Duplicate/);
 await assert.rejects(createDevelopmentServer({portableRecovery:true}),/requires --native-assets/);
});

test('deployed production cannot activate the developer wrapper',()=>{
  for(const marker of ['K_SERVICE','K_REVISION','CLOUD_RUN_JOB','FUNCTION_TARGET','GAE_ENV','AWS_LAMBDA_FUNCTION_NAME']){
    assert.throws(()=>rejectDeployment({NODE_ENV:'development',[marker]:'present'}),undefined,marker);
  }
  assert.throws(()=>rejectDeployment({NODE_ENV:'production'}));
  assert.doesNotThrow(()=>rejectDeployment({NODE_ENV:'development'}));
});

test('child environment strips cloud identity, provider, maintained data and runtime override settings',()=>{
  const inherited={PATH:'/usr/bin',HOME:'/owned/home',USER:'developer',LANG:'en_US.UTF-8',NODE_ENV:'test',
    GOOGLE_APPLICATION_CREDENTIALS:'/private/adc.json',GOOGLE_CLOUD_PROJECT:'maintained',GOOGLE_OAUTH_ACCESS_TOKEN:'secret',
    FIREBASE_AUTH_EMULATOR_HOST:'remote:9099',STUDIO_AUTH_MODE:'google',STUDIO_STORAGE_MODE:'firestore',
    STUDIO_DATABASE_PATH:'/data/maintained.sqlite',STUDIO_FOUNDER_PASSWORD:'secret',STUDIO_JOB_DISPATCHER:'cloud-tasks',
    STUDIO_GOOGLE_FOUNDER_EMAIL:'private@example.invalid',GEMINI_API_KEY:'secret',OPENAI_API_KEY:'secret',
    AI_PROVIDER:'gcp-vertex',PORT:'8080',NODE_OPTIONS:'--require /untrusted.cjs',HTTP_PROXY:'http://untrusted.invalid'};
  assert.deepEqual(sanitizedChildEnvironment(inherited),{
    NODE_ENV:'development',LOCAL_STUDIO_DEVELOPMENT_CHILD:'1',PATH:'/usr/bin',HOME:'/owned/home',USER:'developer',LANG:'en_US.UTF-8',
  });
  assert.equal(inherited.STUDIO_STORAGE_MODE,'firestore','sanitization must not mutate the parent configuration');
});

test('peer, Host and Origin checks do not trust forwarding headers or lookalike loopback names',()=>{
  assert.equal(requestAllowed(request(),origin),true);
  assert.equal(requestAllowed(request({socket:{remoteAddress:'::ffff:127.0.0.1'}}),origin),true);
  for(const req of [
    request({socket:{remoteAddress:'192.0.2.20'}}),
    request({headers:{host:'localhost:3002'}}),
    request({headers:{host:'127.0.0.1.attacker.invalid:3002'}}),
    request({headers:{host:'127.0.0.1:3002',origin:'http://127.0.0.1:3003'}}),
    request({headers:{host:'127.0.0.1:3002',forwarded:'for=127.0.0.1'}}),
    request({headers:{host:'127.0.0.1:3002','x-forwarded-host':'127.0.0.1:3002'}}),
  ])assert.equal(requestAllowed(req,origin),false);
});

test('developer cookies never adopt production or another profile session, including duplicates',()=>{
  assert.equal(developerCookieName('staging'),'studio_dev_staging');
  assert.throws(()=>developerCookieName('unknown'));
  assert.equal(mapRequestCookie(`studio_session=${token}; studio_dev_production=${token}`,'development'),'');
  assert.equal(mapRequestCookie(`studio_session=other; studio_dev_development=${token}`,'development'),`studio_session=${token}`);
  assert.equal(mapRequestCookie(`studio_dev_development=${token}; studio_dev_development=${token}`,'development'),'');
  assert.equal(mapRequestCookie('studio_dev_development=bad','development'),'');
  assert.equal(mapResponseCookie('studio_session=; Path=/; Max-Age=0','development'),'studio_dev_development=; Path=/; Max-Age=0');
  assert.deepEqual(mapResponseCookie([`studio_session=${token}; HttpOnly; SameSite=Strict`,'other=value'],'staging'),[`studio_dev_staging=${token}; HttpOnly; SameSite=Strict`,'other=value']);
});

function httpRequest(base,pathname,{method='GET',headers={},body=''}={}){
  return new Promise((resolve,reject)=>{
    const url=new URL(pathname,base),req=http.request(url,{method,headers,family:4},res=>{
      const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('error',reject);
      res.on('end',()=>{const text=Buffer.concat(chunks).toString('utf8');let json;try{json=JSON.parse(text);}catch{}resolve({status:res.statusCode,headers:res.headers,text,json});});
    });req.on('error',reject);req.end(body);
  });
}
const select=async(app,persona,cookie)=>httpRequest(app.origin,'/__dev/session',{method:'POST',headers:{origin:app.origin,'content-type':'application/x-www-form-urlencoded',...(cookie?{cookie}:{})},body:'persona='+persona});
function sessionCookie(response){const set=response.headers['set-cookie'];assert.ok(Array.isArray(set)&&set.length===1);assert.match(set[0],/HttpOnly/);assert.match(set[0],/SameSite=Strict/);return set[0].split(';')[0];}
function restoreEnvironment(before){for(const key of Object.keys(process.env))if(!(key in before))delete process.env[key];Object.assign(process.env,before);}

test('actual developer HTTP sessions preserve memberships, reject foreign scope and remain isolated across profiles/restarts',async()=>{
  const before={...process.env},beforeFetch=globalThis.fetch,home=fs.mkdtempSync(path.join(os.tmpdir(),'studio-local-profiles-'));
  let app;
  try{
    delete process.env.K_SERVICE;delete process.env.K_REVISION;delete process.env.CLOUD_RUN_JOB;delete process.env.FUNCTION_TARGET;delete process.env.GAE_ENV;delete process.env.AWS_LAMBDA_FUNCTION_NAME;process.env.NODE_ENV='test';
    app=await createDevelopmentServer({profile:'development',port:0,hostname:'localhost',home});
    assert.match(app.origin,/^http:\/\/localhost:[0-9]+$/);
    assert.equal(app.server.address().address,'127.0.0.1');
    assert.match((await httpRequest(app.origin,'/__dev')).headers['content-security-policy'],new RegExp('ws://localhost:'+app.server.address().port));
    assert.equal((await httpRequest(app.origin,'/__dev',{headers:{Host:'127.0.0.1:'+app.server.address().port}})).status,403);
    assert.equal((await httpRequest(app.origin,'/api/auth/session')).status,401);
    assert.equal((await httpRequest(app.origin,'/')).headers.location,'/__dev');
    assert.equal((await httpRequest(app.origin,'/__dev')).status,200);
    assert.equal((await httpRequest(app.origin,'/__dev/session',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'persona=founder'})).status,403);
    assert.equal((await select(app,'administrator')).status,400);
    assert.equal((await httpRequest(app.origin,'/__dev/session',{method:'POST',headers:{origin:app.origin,'content-type':'application/x-www-form-urlencoded'},body:'persona=founder&role=founder'})).status,400);
    assert.equal((await httpRequest(app.origin,'/api/auth/config',{headers:{Host:'attacker.invalid'}})).status,403);
    const workflow='/?org=org_default&brand=brand_default&tab=studio&story=story_huda_buyback&format=carousel&page=2';
    const pickerRedirect=await httpRequest(app.origin,workflow);
    assert.equal(new URL(pickerRedirect.headers.location,app.origin).searchParams.get('returnTo'),workflow);
    const picker=await httpRequest(app.origin,pickerRedirect.headers.location);
    assert.match(picker.text,/name="returnTo"/);assert.ok(picker.text.includes('org=org_default&amp;brand=brand_default'));
    for(const returnTo of ['https://example.org/','//example.org/','/\\example.org/'])assert.equal((await httpRequest(app.origin,'/__dev/session',{method:'POST',headers:{origin:app.origin,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({persona:'founder',returnTo}).toString()})).status,400);
    const founderReply=await httpRequest(app.origin,'/__dev/session',{method:'POST',headers:{origin:app.origin,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({persona:'founder',returnTo:workflow}).toString()});assert.equal(founderReply.status,303);assert.equal(founderReply.headers.location,workflow);
    const founderCookie=sessionCookie(founderReply);assert.match(founderCookie,/^studio_dev_development=/);
    const founder=(await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:founderCookie}}));
    assert.equal(founder.status,200);assert.equal(founder.json.user.role,'founder');
    assert.deepEqual(founder.json.organizations[0].brands.map(b=>b.id).sort(),['brand_default','brand_vedic']);
    const founderId=founder.json.user.id;
    const marketerReply=await select(app,'marketer',founderCookie),marketerCookie=sessionCookie(marketerReply);
    assert.equal((await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:founderCookie}})).status,401,'switching persona invalidates the previous session');
    const marketer=await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:marketerCookie}});
    assert.equal(marketer.json.user.role,'marketer');assert.deepEqual(marketer.json.organizations[0].brands.map(b=>b.id),['brand_vedic']);
    assert.equal((await httpRequest(app.origin,'/api/studio/bootstrap?organizationId=org_default&brandId=brand_default',{headers:{cookie:marketerCookie}})).status,403);
    await app.close();app=null;
    app=await createDevelopmentServer({profile:'staging',port:0,home});
    assert.equal((await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:marketerCookie}})).status,401);
    const stagedCookie=sessionCookie(await select(app,'founder'));
    assert.match(stagedCookie,/^studio_dev_staging=/);
    const staged=await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:stagedCookie}});
    assert.notEqual(staged.json.user.id,founderId,'separate profile owns independent identity records');
    await app.close();app=null;
    app=await createDevelopmentServer({profile:'development',port:0,home});
    const restored=await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:marketerCookie}});
    assert.equal(restored.status,200);assert.equal(restored.json.user.role,'marketer');
    assert.equal((await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:stagedCookie}})).status,401);
    const loggedOut=await httpRequest(app.origin,'/api/auth/logout',{method:'POST',headers:{cookie:marketerCookie,origin:app.origin}});
    assert.equal(loggedOut.status,200);assert.match(loggedOut.headers['set-cookie'][0],/^studio_dev_development=;/);
    assert.equal((await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:marketerCookie}})).status,401);
  }finally{await app?.close();globalThis.fetch=beforeFetch;restoreEnvironment(before);fs.rmSync(home,{recursive:true,force:true});}
});

test('existing unmarked or linked database is refused without modifying its contents',async()=>{
  const before={...process.env},beforeFetch=globalThis.fetch;
  const homes=[];
  try{
    for(const name of ['K_SERVICE','K_REVISION','CLOUD_RUN_JOB','FUNCTION_TARGET','GAE_ENV','AWS_LAMBDA_FUNCTION_NAME'])delete process.env[name];process.env.NODE_ENV='test';
    for(const linked of [false,true]){
      const home=fs.mkdtempSync(path.join(os.tmpdir(),'studio-local-unsafe-'));homes.push(home);
      const root=path.join(home,'.config','liquidity-studio','development','development');fs.mkdirSync(root,{recursive:true,mode:0o700});
      const owner=path.join(home,'preserved.sqlite');fs.writeFileSync(owner,'PRESERVE EXISTING DATABASE',{mode:0o600});
      const target=path.join(root,'studio.sqlite');if(linked)fs.symlinkSync(owner,target);else fs.copyFileSync(owner,target);
      await assert.rejects(createDevelopmentServer({profile:'development',port:0,home}),/unmarked|Private regular/);
      assert.equal(fs.readFileSync(owner,'utf8'),'PRESERVE EXISTING DATABASE');
      assert.equal(fs.existsSync(path.join(root,'profile.json')),false);
      if(!linked)assert.equal(fs.readFileSync(target,'utf8'),'PRESERVE EXISTING DATABASE');
    }
  }finally{globalThis.fetch=beforeFetch;restoreEnvironment(before);for(const home of homes)fs.rmSync(home,{recursive:true,force:true});}
});

test('legitimate extra users, organizations, brands and changed marketer grants survive profile restart without repair',async()=>{
  const before={...process.env},beforeFetch=globalThis.fetch;
  const home=fs.mkdtempSync(path.join(os.tmpdir(),'studio-local-grant-persist-'));
  let app;
  try{
    for(const name of ['K_SERVICE','K_REVISION','CLOUD_RUN_JOB','FUNCTION_TARGET','GAE_ENV','AWS_LAMBDA_FUNCTION_NAME'])delete process.env[name];
    process.env.NODE_ENV='test';
    app=await createDevelopmentServer({profile:'development',port:0,home});
    const founderCookie=sessionCookie(await select(app,'founder'));
    const founderSession=await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:founderCookie}});
    assert.equal(founderSession.status,200);
    const founder=founderSession.json.user;
    const existing=await app.store.get('identity');
    const marketer=existing.users.find(user=>user.username==='local-marketer');
    const org=await app.platform.identity.createOrganization(founder,'Owned additional organization');
    const brand=await app.platform.identity.createBrand(founder,{organizationId:org.id,name:'Additional retained brand',preset:'liquidity_desk'});
    await app.platform.identity.provision({username:'additional-editor',password:'Hosted-only-extra-user-password',role:'marketer'});
    const extra=(await app.store.get('identity')).users.find(user=>user.username==='additional-editor');
    await app.platform.identity.setMembership(founder,{userId:marketer.id,organizationId:'org_default',brandIds:['brand_default']});
    await app.platform.identity.setMembership(founder,{userId:marketer.id,organizationId:org.id,brandIds:[brand.id]});
    await app.platform.identity.setMembership(founder,{userId:extra.id,organizationId:org.id,brandIds:[brand.id]});
    const marketerCookie=sessionCookie(await select(app,'marketer',founderCookie));
    const beforeRestart=await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:marketerCookie}});
    assert.deepEqual(beforeRestart.json.organizations.find(row=>row.id==='org_default').brands.map(row=>row.id),['brand_default']);
    assert.deepEqual(beforeRestart.json.organizations.find(row=>row.id===org.id).brands.map(row=>row.id),[brand.id]);
    const savedIdentity=await app.store.get('identity');
    await app.close();app=null;
    app=await createDevelopmentServer({profile:'development',port:0,home});
    assert.deepEqual(await app.store.get('identity'),savedIdentity,'startup must preserve the exact existing identity and grant record');
    const restored=await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:marketerCookie}});
    assert.equal(restored.status,200);assert.equal(restored.json.user.id,marketer.id);
    assert.deepEqual(restored.json.organizations.find(row=>row.id==='org_default').brands.map(row=>row.id),['brand_default']);
    assert.deepEqual(restored.json.organizations.find(row=>row.id===org.id).brands.map(row=>row.id),[brand.id]);
    assert.equal((await httpRequest(app.origin,'/api/studio/bootstrap?organizationId=org_default&brandId=brand_vedic',{headers:{cookie:marketerCookie}})).status,403,'initial CWJ grant must not be silently restored');
    assert.equal((await httpRequest(app.origin,`/api/studio/bootstrap?organizationId=${org.id}&brandId=${brand.id}`,{headers:{cookie:marketerCookie}})).status,200);
    const extraLogin=await app.platform.identity.login('additional-editor','Hosted-only-extra-user-password');
    assert.equal(extraLogin.user.id,extra.id,'additional legitimate account and credentials survive');
    await app.platform.identity.logout(extraLogin.token);
    const nextFounderCookie=sessionCookie(await select(app,'founder'));
    const nextFounder=await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:nextFounderCookie}});
    assert.equal(nextFounder.json.user.id,founder.id);
    assert.ok(nextFounder.json.organizations.some(row=>row.id===org.id&&row.brands.some(item=>item.id===brand.id)));
  }finally{await app?.close();globalThis.fetch=beforeFetch;restoreEnvironment(before);fs.rmSync(home,{recursive:true,force:true});}
});


test('private homes namespace normal opaque sessions without changing default profile cookies',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'studio-private-home-'));
 try{
  fs.chmodSync(dir,0o700);const settings=privateHomeSettings(dir);
  assert.equal(settings.home,fs.realpathSync(dir));assert.match(settings.cookieNamespace,/^[a-f0-9]{16}$/);
  assert.equal(developerCookieName('production'),'studio_dev_production');
  const own=developerCookieName('production',settings.cookieNamespace),other=developerCookieName('production','f'.repeat(16));
  assert.notEqual(own,'studio_dev_production');
  assert.equal(mapRequestCookie(`studio_dev_production=${token}; ${other}=${token}`,'production',settings.cookieNamespace),'');
  assert.equal(mapRequestCookie(`${own}=${token}`,'production',settings.cookieNamespace),'studio_session='+token);
  assert.equal(mapResponseCookie('studio_session='+token+'; HttpOnly','production',settings.cookieNamespace),own+'='+token+'; HttpOnly');
  assert.deepEqual(parseLocalArguments(['--private-home',dir,'--port','39050']),{profile:'development',port:39050,check:false,privateHome:dir});
  assert.throws(()=>parseLocalArguments(['--private-home','relative']));
  fs.chmodSync(dir,0o755);assert.throws(()=>privateHomeSettings(dir),/0700/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('actual private-home HTTP picker and backend accept only the namespaced cookie',async()=>{
 const before={...process.env},home=fs.mkdtempSync(path.join(os.tmpdir(),'studio-private-http-'));let app;
 try{
  fs.chmodSync(home,0o700);const settings=privateHomeSettings(home);
  for(const key of ['K_SERVICE','K_REVISION','CLOUD_RUN_JOB','FUNCTION_TARGET','GAE_ENV','AWS_LAMBDA_FUNCTION_NAME'])delete process.env[key];process.env.NODE_ENV='test';
  app=await createDevelopmentServer({profile:'production',port:0,...settings});
  const reply=await select(app,'founder'),cookie=sessionCookie(reply);
  assert.ok(cookie.startsWith(developerCookieName('production',settings.cookieNamespace)+'='));
  assert.equal((await httpRequest(app.origin,'/api/auth/session',{headers:{cookie}})).status,200);
  assert.equal((await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:cookie.replace(developerCookieName('production',settings.cookieNamespace),'studio_dev_production')}})).status,401);
  assert.equal((await httpRequest(app.origin,'/api/auth/session',{headers:{cookie:'studio_session='+cookie.split('=')[1]}})).status,401);
 }finally{await app?.close();restoreEnvironment(before);fs.rmSync(home,{recursive:true,force:true});}
});

test('local iframe CSP allows only the fixed YouTube privacy host and explicit current workspace origin',()=>{
 assert.equal(localFrameSource(origin,undefined),"'self' https://www.youtube-nocookie.com");
 assert.doesNotMatch(localFrameSource(origin,undefined),/\*|https:\/\/www\.youtube\.com|https:\/\/youtube-nocookie\.com(?:\s|$)/);
 assert.equal(localFrameSource(origin,{studioOrigin:origin,nativeOrigin:'http://localhost:39008'}),"'self' https://www.youtube-nocookie.com http://localhost:39008");
 assert.throws(()=>localFrameSource(origin,{studioOrigin:'http://127.0.0.1:39052',nativeOrigin:'http://localhost:39008'}),/another local origin/);
 assert.throws(()=>localFrameSource(origin,{studioOrigin:origin,nativeOrigin:'http://remote.example:39008'}),/loopback/);
});
