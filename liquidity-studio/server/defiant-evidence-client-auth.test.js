import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,chmod,lstat,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {createEvidenceClientAuth} from './defiant-evidence-client-auth.js';
const org='example_org',grant='1'.repeat(32),start=1700000000000;
const credentials=(char='a',accessExpiresAt=start+300000)=>({organizationId:org,accessToken:`ea.${grant}.${char.repeat(43)}`,renewalToken:`er.${grant}.${char.toUpperCase().repeat(43)}`,accessExpiresAt,expiresAt:start+28800000});
async function fixture(t,fetchImpl,initial){
 const dir=await mkdtemp(join(tmpdir(),'scoped-evidence-client-'));await chmod(dir,0o700);t.after(()=>rm(dir,{recursive:true,force:true}));
 const configurationPath=join(dir,'config'),credentialFile=join(dir,'credential');await writeFile(configurationPath,JSON.stringify({version:1,organizationId:org,origin:'https://studio.chaiwithjai.com',credentialFile}),{mode:0o600});if(initial)await writeFile(credentialFile,JSON.stringify({version:2,...initial}),{mode:0o600});
 let clock=start;const options={configurationPath,fetchImpl,now:()=>clock,sleep:async ms=>{clock+=ms;}};
 return {dir,credentialFile,options,auth:await createEvidenceClientAuth(options),advance:ms=>clock+=ms};
}
test('explicit pairing outputs only manual code URL and stores only scoped owner credentials',async t=>{
 let verifierHash,attempts=0;const reports=[];const f=await fixture(t,async(url,init)=>{
  assert.equal(init.cache,'no-store');assert.equal(init.redirect,'error');assert.equal(init.headers.Authorization,undefined);const body=JSON.parse(init.body);
  if(url.endsWith('/begin')){verifierHash=body.verifierHash;assert.equal(body.verifier,undefined);return Response.json({pairingId:'2'.repeat(32),organizationId:org,clientName:body.clientName,expiresAt:start+300000});}
  assert.ok(url.endsWith('/exchange'));assert.equal(createHash('sha256').update(body.verifier).digest('hex'),verifierHash);if(++attempts===1)return new Response('',{status:403});return Response.json(credentials());
 });
 await f.auth.pair({report:item=>reports.push(item)});assert.equal(attempts,2);assert.deepEqual(reports,[{pairingId:'2'.repeat(32),url:'https://studio.chaiwithjai.com/?org=example_org&tab=strategy',expiresAt:start+300000}]);
 const stored=JSON.parse(await readFile(f.credentialFile));assert.equal(stored.version,2);assert.equal(stored.accessToken,credentials().accessToken);assert.equal((await lstat(f.credentialFile)).mode&0o777,0o600);assert.equal(JSON.stringify(reports).includes(stored.renewalToken),false);await assert.rejects(f.auth.pair());
});
test('on-demand renewal singleflight rotates once and preserves absolute expiry',async t=>{
 let calls=0;const f=await fixture(t,async(url,init)=>{calls++;assert.ok(url.endsWith('/renew'));assert.equal(JSON.parse(init.body).renewalToken,credentials().renewalToken);return Response.json(credentials('b'));},credentials('a',start+1000));
 const [a,b]=await Promise.all([f.auth.credential(),f.auth.credential()]);assert.equal(calls,1);assert.equal(a.accessToken,b.accessToken);assert.equal(a.expiresAt,credentials().expiresAt);assert.equal(JSON.parse(await readFile(f.credentialFile)).renewalToken,credentials('b').renewalToken);
 await f.auth.credential();assert.equal(calls,1);
});
test('independent clients coordinate through exclusive lock and reread rotated credential',async t=>{
 let calls=0;const f=await fixture(t,async()=>{calls++;await new Promise(r=>setTimeout(r,20));return Response.json(credentials('b'));},credentials('a',start+1000));
 const opts={...f.options,sleep:ms=>new Promise(r=>setTimeout(r,Math.min(ms,10)))};const a=await createEvidenceClientAuth(opts),b=await createEvidenceClientAuth(opts);const results=await Promise.all([a.credential(),b.credential()]);assert.equal(calls,1);assert.equal(results[0].accessToken,results[1].accessToken);
});
test('lost renewal response retains lock and never replays consumed credential on later call',async t=>{
 let calls=0;const f=await fixture(t,async()=>{calls++;throw Error('private bearer detail');},credentials('a',start+1000));await assert.rejects(f.auth.credential(),{message:'Private evidence authorization unavailable'});await assert.rejects(f.auth.credential());assert.equal(calls,1);assert.equal((await lstat(f.credentialFile+'.lock')).mode&0o777,0o600);
});
test('write failure after remote rotation retains lock without replay and no broad bearer fallback',async t=>{
 let f,calls=0;f=await fixture(t,async()=>{calls++;await chmod(f.credentialFile,0o644);return Response.json(credentials('b'));},credentials('a',start+1000));await assert.rejects(f.auth.credential());await chmod(f.credentialFile,0o600);await assert.rejects(f.auth.credential());assert.equal(calls,1);
 await writeFile(f.credentialFile,JSON.stringify({version:1,token:'firebase.bearer.token',expiresAt:start+300000}));await assert.rejects(f.auth.credential());assert.equal(calls,1);
});
test('rotation cannot extend authorization lifetime or change organization',async t=>{
 for(const patch of [{expiresAt:start+28800001},{organizationId:'other_org'}]){let calls=0;const f=await fixture(t,async()=>{calls++;return Response.json({...credentials('b'),...patch});},credentials('a',start+1000));await assert.rejects(f.auth.credential());await assert.rejects(f.auth.credential());assert.equal(calls,1);}
});
test('pairing stops at finite pending deadline and never overwrites an existing envelope',async t=>{
 let calls=0;const f=await fixture(t,async(url,init)=>{calls++;return url.endsWith('/begin')?Response.json({pairingId:'2'.repeat(32),organizationId:org,clientName:JSON.parse(init.body).clientName,expiresAt:start+10000}):new Response('',{status:403});});await assert.rejects(f.auth.pair());assert.equal(calls,3);await assert.rejects(lstat(f.credentialFile),{code:'ENOENT'});
});

test('pair response validation rejects wrong origin-shaped scope and oversized response without credential output',async t=>{
 for(const fetchImpl of [async()=>Response.json({pairingId:'2'.repeat(32),organizationId:'other_org',clientName:'Studio local evidence client',expiresAt:start+300000}),async()=>new Response(new Uint8Array(65537),{headers:{'content-type':'application/json'}})]){
  const f=await fixture(t,fetchImpl),reports=[];await assert.rejects(f.auth.pair({report:item=>reports.push(item)}));assert.equal(reports.length,0);await assert.rejects(lstat(f.credentialFile),{code:'ENOENT'});
 }
});
test('renewal HTTP deadline aborts without a second attempt',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let ready;const started=new Promise(r=>ready=r);let calls=0;
 const f=await fixture(t,async(_url,{signal})=>{calls++;ready();return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('private detail')),{once:true}));},credentials('a',start+1000));
 const pending=assert.rejects(f.auth.credential(),{message:'Private evidence authorization unavailable'});await started;t.mock.timers.tick(30000);await pending;await assert.rejects(f.auth.credential());assert.equal(calls,1);
});

test('two actual child processes share one renewal through the owner lock',async t=>{
 const {createServer}=await import('node:http');const {execFile}=await import('node:child_process');const {promisify}=await import('node:util');let calls=0;
 const server=createServer(async(req,res)=>{calls++;for await(const _chunk of req){}await new Promise(r=>setTimeout(r,150));res.setHeader('content-type','application/json');res.end(JSON.stringify(credentials('b')));});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const f=await fixture(t,async()=>{throw Error('Parent must not renew');},credentials('a',start+1000));
 const source=new URL('./defiant-evidence-client-auth.js',import.meta.url).href,url=`http://127.0.0.1:${server.address().port}`;
 const program=`import {createEvidenceClientAuth} from ${JSON.stringify(source)};const auth=await createEvidenceClientAuth({configurationPath:process.argv[1],now:()=>${start},fetchImpl:(_url,init)=>fetch(process.argv[2],init)});await auth.credential();console.log('connected');`;
 const run=()=>promisify(execFile)(process.execPath,['--input-type=module','-e',program,f.options.configurationPath,url],{env:{},timeout:10000,maxBuffer:1024});
 const results=await Promise.all([run(),run()]);assert.equal(calls,1);assert.ok(results.every(r=>r.stdout.trim()==='connected'&&r.stderr===''));
});
