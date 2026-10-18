import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {zipSync,unzipSync,strToU8,strFromU8} from 'fflate';
import {PenpotStoryRecovery,parseRecoveryExport} from './penpot-story-recovery.js';
import {validatePenpotFontPack} from './penpot-font-pack.js';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const id=n=>`${n.repeat(8)}-${n.repeat(4)}-4${n.repeat(3)}-8${n.repeat(3)}-${n.repeat(12)}`;
const fileId=id('1'),teamId=id('2'),projectId=id('3'),owner=id('4'),fontId=id('5'),sourceId=id('6'),outputId=id('7');
const key='k'.repeat(43),cookie='auth-token=owned-native-cookie',actor={id:'founder'},input={storyId:'saved-story',format:'infographic',expectedRevision:4,generationId:'generation',expectedNativeRevision:9};
const source=Buffer.concat([Buffer.from([0,1,0,0]),Buffer.from('exact licensed fixture font')]);
const archive=Buffer.from(zipSync({'manifest.json':strToU8(JSON.stringify({type:'penpot/export-files',generatedBy:'penpot/2.18.3',files:[{id:fileId}],relations:[]})),['files/'+fileId+'/pages/page.json']:strToU8(JSON.stringify({content:{fontId:'custom-'+fontId,text:'human-edited title'}})),['objects/'+id('8')+'.png']:new Uint8Array([137,80,78,71])},{level:0}));
function setup(){
 let now=1000,changed=false,allowed=true,legacy=false;const calls=[];
 const font={fontId:'custom-'+fontId,family:'Inter',weight:400,sha256:hash(source),license:'OFL-1.1'};
 const file=()=>({id:fileId,projectId,revn:9,data:{pages:['one','two'],pagesIndex:{one:{objects:{text:{type:'text',content:{fontId:font.fontId,text:changed?'changed':'human-edited title'}}}},two:{objects:{text:{type:'text',content:{fontId:font.fontId,text:'second page'}}}}}}});
 const designs={scope:{organizationId:'owned-org',brandId:'owned-brand'},async context(){if(!allowed)throw Object.assign(Error('Current membership changed'),{status:403});return {story:{revision:4,generationId:'generation'},identity:{storyId:'saved-story',sourceHash:'original-source'},bundle:{sourceCampaign:{infographic:{headline:'saved'},carousel:{slides:[]},story:{hook:'saved'},reel:{beats:[]}}},workspace:{ownerPrincipal:owner,projectId,teamId,fonts:[font]}};},async designs(){return {design:{status:'ready',fileId,nativeRevision:9}};},async rpc(workspace,name,body){assert.equal(name,'get-file');assert.equal(body.id,fileId);return file();}};
 const service=new PenpotStoryRecovery({designs,grantKey:key,now:()=>now,licensedFonts:()=>[{family:'Inter',weight:400,sourceName:'InterVariable.ttf',noticeName:'Inter-LICENSE.txt',bytes:source,licenseBytes:Buffer.from('SIL OPEN FONT LICENSE Version 1.1\nfixture notice')}],fetchImpl:async(url,options)=>{
  calls.push({url,options});assert.equal(new URL(url).origin,'http://localhost:39008');assert.equal(options.headers.Cookie,cookie);assert.equal(options.redirect,'error');
  if(url.endsWith('/get-profile'))return Response.json({id:owner});
  if(url.endsWith('/get-font-variants'))return Response.json([{fontId,fontFamily:'Inter',fontWeight:'400',fontStyle:'normal',ttfFileId:sourceId}]);
  if(url.endsWith('/assets/by-id/'+sourceId))return new Response(source);
  if(url.endsWith('/export-binfile')){
   assert.deepEqual(JSON.parse(options.body),{'file-id':fileId,'include-libraries':false,'embed-assets':true,'studio-recovery':true});
   const payload=legacy?'http://localhost:39008/assets/by-id/'+outputId:{'~:uri':'http://localhost:39008/assets/by-id/'+outputId,'~:studio-export-version':'v1','~:file-id':'~u'+fileId};
   return new Response('event: end\ndata: '+JSON.stringify(payload)+'\n\n', {headers:{'Content-Type':'text/event-stream;charset=UTF-8'}});
  }
  if(url.endsWith('/assets/by-id/'+outputId))return new Response(archive);
  throw Error('Unexpected native request');
 }});
 return {service,calls,setChanged:value=>changed=value,setAllowed:value=>allowed=value,setNow:value=>now=value,setLegacy:value=>legacy=value};
}
const permit=value=>new URL(value.downloadUrl).searchParams.get('permit');
test('registered recovery contains exact native archive, all font source bytes/notices and verifiable sidecar without identities',async()=>{
 const f=setup(),prepared=await f.service.prepare(actor,input,'current-studio-session');
 assert.match(prepared.downloadUrl,/^http:\/\/localhost:39008\/studio-recovery-kit\?permit=[\w-]{43}$/);
 const downloaded=await f.service.download(key,permit(prepared),cookie),entries=unzipSync(downloaded.bytes);
 assert.deepEqual(Buffer.from(entries['design.penpot']),archive);
 assert.deepEqual(Buffer.from(entries['fonts/InterVariable.ttf']),source);
 const pack=JSON.parse(strFromU8(entries['penpot-font-recovery.json']));validatePenpotFontPack(pack);
 assert.equal(pack.fonts[0].oldFontId,'custom-'+fontId);assert.equal(pack.archive.sha256,hash(archive));
 const manifest=JSON.parse(strFromU8(entries['recovery-manifest.json']));assert.deepEqual(manifest.scope,{organizationId:'owned-org',brandId:'owned-brand'});assert.equal(manifest.nativeRevision,9);assert.equal(manifest.identityIncluded,false);assert.equal(manifest.authorityRestored,false);
 for(const line of strFromU8(entries.SHA256SUMS).trim().split('\n')){const [digest,name]=line.split('  ');assert.equal(hash(entries[name]),digest);}
 assert.match(strFromU8(entries['RESTORE.md']),/does NOT reconnect Studio automatically/);
 assert.equal(downloaded.sha256,hash(downloaded.bytes));
 await assert.rejects(()=>f.service.download(key,permit(prepared),cookie),{status:410});
 assert.equal(f.calls.filter(x=>x.url.endsWith('/export-binfile')).length,1);
});
test('source mutation or current membership revocation denies before native export and consumes the permit',async()=>{
 for(const field of ['source','membership']){
  const f=setup(),prepared=await f.service.prepare(actor,input,'session');field==='source'?f.setChanged(true):f.setAllowed(false);
  await assert.rejects(()=>f.service.download(key,permit(prepared),cookie),{status:field==='source'?409:403});assert.equal(f.calls.length,0);
  await assert.rejects(()=>f.service.download(key,permit(prepared),cookie),{status:410});
 }
});
test('old public-tempfile backend fails before any archive fetch; expired permit makes no native request',async()=>{
 const f=setup(),prepared=await f.service.prepare(actor,input,'session');f.setLegacy(true);
 await assert.rejects(()=>f.service.download(key,permit(prepared),cookie),/private native recovery export hook/);
 assert.equal(f.calls.some(x=>x.url.endsWith('/assets/by-id/'+outputId)),false);
 const second=await f.service.prepare(actor,input,'session');f.setNow(second.expiresAt);
 const count=f.calls.length;await assert.rejects(()=>f.service.download(key,permit(second),cookie),{status:410});assert.equal(f.calls.length,count);
});
test('pinned SSE accepts only exact source-file private end, with no URL redirect, query or duplicate end',()=>{
 const event=value=>'event: end\ndata: '+JSON.stringify(value)+'\n\n';
 const good={'~:uri':'http://localhost:39008/assets/by-id/'+outputId,'~:studio-export-version':'v1','~:file-id':'~u'+fileId};
 assert.equal(parseRecoveryExport(Buffer.from(event(good)),fileId),'/assets/by-id/'+outputId);
 for(const bad of [{...good,'~:file-id':'~u'+id('9')},{...good,'~:uri':'https://foreign.example/assets/by-id/'+outputId},{...good,'~:uri':good['~:uri']+'?share=x'}, {...good,extra:'browser-authority'}])assert.throws(()=>parseRecoveryExport(Buffer.from(event(bad)),fileId));
 assert.throws(()=>parseRecoveryExport(Buffer.from(event(good)+event(good)),fileId));
 assert.throws(()=>parseRecoveryExport(Buffer.from('event: error\ndata: {}\n\n'),fileId));
});

test('embedded unknown font or foreign archive is rejected without a misleading portable kit',async()=>{
 const {inspectNativeRecoveryArchive}=await import('./penpot-story-recovery.js');
 const manifest={type:'penpot/export-files',generatedBy:'penpot/2.18.3',files:[{id:fileId}],relations:[]};
 const build=(m,font)=>Buffer.from(zipSync({'manifest.json':strToU8(JSON.stringify(m)),'files/text.json':strToU8(JSON.stringify({'font-id':font}))},{level:0}));
 assert.throws(()=>inspectNativeRecoveryArchive(build(manifest,'custom-'+id('9')),fileId,new Set(['custom-'+fontId])),/unverified font/);
 assert.throws(()=>inspectNativeRecoveryArchive(build({...manifest,files:[{id:id('9')}]},'custom-'+fontId),fileId,new Set(['custom-'+fontId])),/registered file/);
 const inventory=inspectNativeRecoveryArchive(build(manifest,'custom-'+fontId),fileId,new Set(['custom-'+fontId]));assert.equal(inventory.entries,2);
});

test('recovery gateway forwards only presented native cookie, checks ZIP digest and keeps output private',async()=>{
 const {createStorySvgGateway}=await import('./penpot-story-svg-gateway.js');let calls=0;
 const bytes=Buffer.from('bounded kit'),gatewayKey='a'.repeat(64);
 const gateway=createStorySvgGateway({studioOrigin:'http://127.0.0.1:39043',grantKey:key,gatewayKey,fetchImpl:async(url,options)=>{
  calls++;assert.equal(url,'http://127.0.0.1:39043/api/native/penpot/designs/recovery');assert.equal(options.headers['X-Studio-Native-Session'],cookie);assert.equal(options.headers.Cookie,undefined);assert.equal(options.redirect,'error');
  return new Response(bytes,{headers:{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="studio-penpot-recovery-kit.zip"','X-Studio-Recovery-Sha256':hash(bytes)}});
 }});
 const response=()=>({writeHead(status,headers){this.status=status;this.headers=headers;},end(body){this.body=body;}}),request={method:'GET',url:'/studio-recovery-kit?permit='+'p'.repeat(43),headers:{'x-studio-native-gateway':gatewayKey,'x-studio-native-session':cookie}};
 const ok=response();assert.equal(await gateway(request,ok),true);assert.equal(ok.status,200);assert.deepEqual(ok.body,bytes);assert.equal(ok.headers['Cache-Control'],'private, no-store');
 const denied=response();await gateway({...request,headers:{...request.headers,'x-studio-native-gateway':'b'.repeat(64)}},denied);assert.equal(denied.status,403);assert.equal(calls,1);
});
