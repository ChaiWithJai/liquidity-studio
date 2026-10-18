import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createPenpotFontPack, validatePenpotFontPack } from './penpot-font-pack.js';
import { PenpotFontRecovery, createPenpotFontRecoveryTransport, fontRecoveryEndpoints } from './penpot-font-recovery.js';

const ids = {
  profile: '11111111-1111-4111-8111-111111111111', team: '22222222-2222-4222-8222-222222222222',
  project: '33333333-3333-4333-8333-333333333333', font: '44444444-4444-4444-8444-444444444444',
  intent: '55555555-5555-4555-8555-555555555555', session: '66666666-6666-4666-8666-666666666666',
};
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function pack(styles = false) {
  return createPenpotFontPack({ archive: Buffer.from('controlled original archive bytes'), fonts: [400, styles ? 400 : 700].map((weight, index) => ({
    family: 'Mona Sans', weight, ...(styles ? { style: index ? 'italic' : 'normal' } : {}), oldFontId: 'custom-' + ids.font,
    sourceName: weight === 400 ? 'MonaSans-Regular.otf' : 'MonaSans-Bold.otf',
    bytes: readFileSync(new URL(`../public/fonts/MonaSans-${weight === 400 ? 'Regular' : 'Bold'}.otf`, import.meta.url)),
    licenseBytes: readFileSync(new URL('../public/fonts/MonaSans-OFL.txt', import.meta.url)),
  })) });
}
function fixture(styles = false) {
  const source = pack(styles), variants = [], assets = new Map(), calls = [];
  let journal = null, profile = ids.profile, chunk, lostCreate = false;
  const service = new PenpotFontRecovery({ pack: source, profileId: ids.profile, teamId: ids.team, projectId: ids.project,
    readJournal: async () => structuredClone(journal), writeJournal: async value => { journal = structuredClone(value); },
    readAsset: async id => assets.get(id),
    rpc: async (op, body) => {
      calls.push({ op, body });
      if (op === 'get-profile') return { id: profile };
      if (op === 'get-project') return { id: ids.project, teamId: ids.team };
      if (op === 'get-font-variants') return structuredClone(variants);
      if (op === 'create-upload-session') { assert.equal(body['total-chunks'], 1); return { sessionId: ids.session }; }
      if (op === 'upload-chunk') { assert.equal(body.index, 0); chunk = body.content; return {}; }
      if (op === 'create-font-variant') {
        const font = source.fonts.find(f => f.weight === body['font-weight'] && (f.style || 'normal') === body['font-style']);
        assert.equal(body['font-id'], ids.font);
        assert.equal(body.uploads['font/otf'], ids.session);
        assert.equal(sha(chunk), font.sourceSha256);
        const variantKey = font.weight + (font.style === 'italic' ? 1 : 0);
        const id = `${String(variantKey).padStart(8, '0')}-7777-4777-8777-777777777777`;
        const asset = `${String(variantKey).padStart(8, '0')}-8888-4888-8888-888888888888`;
        variants.push({ id, fontId: ids.font, teamId: ids.team, fontFamily: 'Mona Sans',
          fontWeight: String(font.weight), fontStyle: font.style || 'normal', otfFileId: asset });
        assets.set(asset, chunk);
        if (lostCreate) { lostCreate = false; throw new Error('Original native creation reply lost'); }
        return variants.at(-1);
      }
      throw Error('Unexpected operation');
    },
  });
  return { source, service, calls, variants, assets, getJournal: () => journal,
    loseCreate: () => { lostCreate = true; }, changeProfile: () => { profile = ids.team; } };
}
const input = service => ({ packSha256: service.packSha256, destinationAcknowledged: ids.team, intentId: ids.intent });

test('font sidecar roundtrip preserves original bytes/notices; fresh restore preserves family UUID and verifies both original variants', async () => {
  const f = fixture();
  validatePenpotFontPack(JSON.parse(JSON.stringify(f.service.export())));
  assert.equal(sha(f.service.archive()), f.source.archive.sha256);
  const result = await f.service.restore(input(f.service));
  assert.equal(result.completed, true); assert.equal(result.archiveImported, false); assert.equal(result.authorityRestored, false);
  assert.equal(result.fonts.length, 2);
  assert.deepEqual(result.fonts.map(x => x.sourceSha256), f.source.fonts.map(x => x.sourceSha256));
  assert.deepEqual(result.fonts.map(x => x.licenseSha256), f.source.fonts.map(x => x.licenseSha256));
  assert.ok(result.fonts.every(x => x.fontId === 'custom-' + ids.font));
  await f.service.restore(input(f.service));
  assert.equal(f.calls.filter(c => c.op === 'create-font-variant').length, 2);
  assert.equal((await f.service.status()).completed, true);
  f.variants.splice(0, 1);
  await assert.rejects(f.service.status(), /previously restored font is missing/);
});

test('all UUID conflicts are rejected before any upload, even when later family is the conflicting one', async () => {
  const f = fixture();
  f.variants.push({ id: ids.intent, fontId: ids.font, fontWeight: '900', fontStyle: 'normal' });
  await assert.rejects(f.service.restore(input(f.service)), /already exists/);
  assert.equal(f.calls.filter(c => c.op.includes('upload') || c.op === 'create-font-variant').length, 0);
  assert.equal(f.getJournal(), null);
});

test('same family and weight normal/italic variants preserve both styles and replay without duplicate creation', async () => {
  // Controlled RPC-contract fixture: these licensed bytes exercise transport and
  // persistence selection, not a claim that the regular binary is a real italic.
  const f = fixture(true);
  const result = await f.service.restore(input(f.service));
  assert.equal(result.completed, true);
  assert.deepEqual(result.fonts.map(x => [x.fontId, x.weight, x.style]), [
    ['custom-' + ids.font, 400, 'normal'], ['custom-' + ids.font, 400, 'italic'],
  ]);
  assert.equal(new Set(result.fonts.map(x => x.variantId)).size, 2);
  assert.ok(result.fonts.every(x => x.sourceSha256 === f.source.fonts[0].sourceSha256));
  await f.service.restore(input(f.service));
  assert.equal(f.calls.filter(c => c.op === 'create-font-variant').length, 2);
  assert.equal((await f.service.status()).completed, true);
});

test('lost creation response reconciles exact same intent/bytes without another create; another intent rejects', async () => {
  const f = fixture(); f.loseCreate();
  await assert.rejects(f.service.restore(input(f.service)), /reply lost/);
  assert.equal(f.getJournal().items[`custom-${ids.font}:400:normal`].phase, 'create-pending');
  await assert.rejects(f.service.restore({ ...input(f.service), intentId: ids.profile }), /original recovery intent/);
  const result = await f.service.restore(input(f.service));
  assert.equal(result.completed, true);
  assert.equal(f.calls.filter(c => c.op === 'create-font-variant').length, 2);
});

test('current native profile mismatch and tampered original readback fail closed, never report complete', async () => {
  const a = fixture(); a.changeProfile();
  await assert.rejects(a.service.restore(input(a.service)), /account changed/);
  assert.equal(a.getJournal(), null);
  const b = fixture(); b.loseCreate();
  await assert.rejects(b.service.restore(input(b.service)), /reply lost/);
  for (const id of b.assets.keys()) b.assets.set(id, Buffer.from('tampered'));
  await assert.rejects(b.service.restore(input(b.service)), /original font bytes/);
  assert.equal(b.getJournal().completed, false);
});

test('fixed transport sends official chunked multipart and rejects unrecognized operations/redirects, without exposing session', async () => {
  const requests = [];
  const t = createPenpotFontRecoveryTransport({ cookie: 'owned-private-cookie', fetchImpl: async (url, options) => {
    requests.push({ url, options }); return new Response(JSON.stringify({ 'session-id': ids.session }), { status: 200 });
  } });
  await t.rpc('upload-chunk', { 'session-id': ids.session, index: 0, content: Buffer.from('owned'), filename: 'font.ttf', mime: 'font/ttf' });
  const r = requests[0];
  assert.equal(r.url, 'http://localhost:39008/api/rpc/command/upload-chunk');
  assert.equal(r.options.redirect, 'error'); assert.equal(r.options.headers.Origin, 'http://localhost:39008');
  assert.equal(r.options.body.get('session-id'), ids.session); assert.equal(r.options.body.get('index'), '0');
  assert.equal(await r.options.body.get('content').text(), 'owned');
  await assert.rejects(t.rpc('delete-font', {}), /Unsupported/);
  await assert.rejects(t.readAsset('../foreign'), /Invalid/);
});


test('private loopback destination and operator endpoints retain defaults and reject public or ambiguous origins',()=>{
  assert.deepEqual(fontRecoveryEndpoints(),{nativeOrigin:'http://localhost:39008',operatorPort:39045,operatorOrigin:'http://127.0.0.1:39045'});
  assert.deepEqual(fontRecoveryEndpoints({nativeOrigin:'http://127.0.0.1:39046',operatorPort:39049}),{nativeOrigin:'http://127.0.0.1:39046',operatorPort:39049,operatorOrigin:'http://127.0.0.1:39049'});
  for(const nativeOrigin of ['https://localhost:39046','http://remote.example:39046','http://127.0.0.2:39046','http://127.1:39046','http://localhost','http://localhost:80','http://localhost:39046/','http://localhost:39046/path','http://localhost:39046?next=other','http://localhost:39046#fragment','http://user:secret@localhost:39046','http://[::1]:39046',null,46])assert.throws(()=>fontRecoveryEndpoints({nativeOrigin}),{status:422});
  for(const operatorPort of [0,80,1023,65536,39049.5,'39049',null])assert.throws(()=>fontRecoveryEndpoints({operatorPort}),{status:422});
});

test('configured native origin binds every official RPC, multipart and asset request without changing defaults',async()=>{
  const calls=[],nativeOrigin='http://127.0.0.1:39046';
  const transport=createPenpotFontRecoveryTransport({cookie:'private-owned-session',nativeOrigin,fetchImpl:async(url,options)=>{calls.push({url,options});assert.equal(options.headers.Origin,nativeOrigin);assert.equal(options.headers.Cookie,'private-owned-session');assert.equal(options.redirect,'error');return new Response(url.includes('/assets/')?Buffer.from('original'):'{}');}});
  await transport.rpc('get-profile',{});await transport.rpc('upload-chunk',{'session-id':ids.session,index:0,content:Buffer.from('owned'),filename:'font.ttf',mime:'font/ttf'});await transport.readAsset(ids.font);
  assert.deepEqual(calls.map(x=>x.url),[nativeOrigin+'/api/rpc/command/get-profile',nativeOrigin+'/api/rpc/command/upload-chunk',nativeOrigin+'/assets/by-id/'+ids.font]);
  assert.equal(calls[1].options.body.get('session-id'),ids.session);
  assert.throws(()=>createPenpotFontRecoveryTransport({cookie:'private-owned-session',nativeOrigin:'https://public.example'}),{status:422});
});

test('operator CLI uses configured port and binds Host/Origin to it while targeting only the configured native instance', {timeout:30000}, async t=>{
  // Hosted-only actual HTTP/CLI fixture. No native server or account is created.
  const {createServer,request}=await import('node:http');
  const {spawn}=await import('node:child_process');
  const {mkdtemp,writeFile,rm}=await import('node:fs/promises');
  const {tmpdir}=await import('node:os');const {join}=await import('node:path');const {fileURLToPath}=await import('node:url');
  const directory=await mkdtemp(join(tmpdir(),'font-recovery-operator-')),nativeCalls=[],nativeErrors=[];
  const native=createServer(async(req,res)=>{
    try{
      for await(const ignored of req){} // Fully consume each request before replying.
      nativeCalls.push(req.url);assert.equal(req.headers.cookie,'owned-fixture-native-cookie');
      assert.equal(req.headers.origin,nativeOrigin);
      const body=req.url.endsWith('/get-profile')?{id:ids.profile}:req.url.endsWith('/get-project')?{id:ids.project,teamId:ids.team}:req.url.endsWith('/get-font-variants')?[]:null;
      assert.notEqual(body,null);res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(body));
    }catch(error){nativeErrors.push(error.message);res.writeHead(500);res.end('{}');}
  });
  await new Promise(resolve=>native.listen(0,'127.0.0.1',resolve));const nativeOrigin=`http://127.0.0.1:${native.address().port}`;
  const reservation=createServer();await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));const operatorPort=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
  const operatorOrigin=`http://127.0.0.1:${operatorPort}`,packPath=join(directory,'pack.json'),cookieFile=join(directory,'cookie.txt'),configPath=join(directory,'config.json');
  await writeFile(packPath,JSON.stringify(pack()),{mode:0o600});await writeFile(cookieFile,'owned-fixture-native-cookie',{mode:0o600});
  await writeFile(configPath,JSON.stringify({packPath,cookieFile,journalPath:join(directory,'journal.json'),profileId:ids.profile,teamId:ids.team,projectId:ids.project,nativeOrigin,operatorPort}),{mode:0o600});
  const env={...process.env};delete env.K_SERVICE;
  const child=spawn(process.execPath,[fileURLToPath(new URL('../scripts/penpot-font-recovery.mjs',import.meta.url)),'--config',configPath],{env,stdio:['ignore','pipe','pipe']});
  const exited=new Promise(resolve=>child.once('exit',(code,signal)=>resolve({code,signal})));let stderr='';child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-4096);});
  t.after(async()=>{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM');await exited;await new Promise(resolve=>native.close(resolve));await rm(directory,{recursive:true,force:true});});
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{child.kill('SIGTERM');reject(Error('Operator readiness timed out'));},15000);let output='';
    child.stdout.on('data',chunk=>{output+=chunk;if(output.includes(`Font recovery operator: ${operatorOrigin}`)){clearTimeout(timer);resolve();}});
    child.once('error',error=>{clearTimeout(timer);reject(error);});exited.then(result=>{clearTimeout(timer);reject(Error(`Operator exited before readiness: ${result.code}; ${stderr}`));});
  });
  const send=(path,{method='GET',headers={},body=''}={})=>new Promise((resolve,reject)=>{
    const req=request(operatorOrigin+path,{method,headers},res=>{const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>resolve({status:res.statusCode,body:Buffer.concat(chunks).toString()}));});req.once('error',reject);req.end(body);
  });
  const page=await send('/');assert.equal(page.status,200);assert.match(page.body,/Restore Penpot fonts/);
  const status=await send('/status');assert.equal(status.status,200);assert.equal(JSON.parse(status.body).target.teamId,ids.team);assert.deepEqual(nativeErrors,[]);assert.equal(nativeCalls.length,3);
  const count=nativeCalls.length,wrongPort=operatorPort===39045?39044:39045;
  assert.equal((await send('/status',{headers:{Host:`127.0.0.1:${wrongPort}`}})).status,403);
  assert.equal((await send('/restore',{method:'POST',headers:{Origin:`http://127.0.0.1:${wrongPort}`,'Content-Type':'application/json'},body:'{}'})).status,403);
  assert.equal((await send('/status',{headers:{'X-Forwarded-Host':`127.0.0.1:${operatorPort}`}})).status,403);
  assert.equal(nativeCalls.length,count); // All three replies fully handled before teardown.
});
