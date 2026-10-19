import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {PenpotStorySvg} from './penpot-story-svg.js';
import {createStorySvgGateway} from './penpot-story-svg-gateway.js';
const id=n=>`${String(n).padStart(8,'0')}-1111-4111-8111-111111111111`;
const key='k'.repeat(43),gatewayKey='a'.repeat(64),cookie='auth-token=presented-native-session';
const original=Buffer.from('licensed original TTF'),woff=Buffer.from('verified generated WOFF');
const sha=b=>createHash('sha256').update(b).digest('hex');
function fixture(){
 let revision=3,sourceRevision=2,profile=id(7),calls=[],wrongOriginal=false,changeDuringExport=false;
 const workspace={projectId:id(1),teamId:id(2),actingNativeProfileId:id(7),ownerPrincipal:id(8),fonts:[{family:'Mona Sans',weight:400,fontId:'custom-'+id(9),sha256:sha(original),license:'OFL-1.1'}]};
 const file=()=>({id:id(3),projectId:id(1),revn:revision,data:{pagesIndex:{[id(4)]:{objects:{['00000000-0000-0000-0000-000000000000']:{id:'00000000-0000-0000-0000-000000000000',type:'frame',parentId:'00000000-0000-0000-0000-000000000000',width:0.01,height:0.01},[id(5)]:{id:id(5),type:'frame',parentId:'00000000-0000-0000-0000-000000000000',width:1080,height:1350},[id(6)]:{id:id(6),type:'text',content:{fontId:'custom-'+id(9),text:'HUMAN ॐ & text'}}}}}}});
 const designs={context:async()=>({story:{revision:sourceRevision,generationId:'generation'},workspace,identity:{storyId:'story',revision:sourceRevision}}),designs:async()=>({design:{status:'ready',nativeRevision:revision,fileId:id(3),nativeUrl:`http://localhost:39008/#/workspace?team-id=${id(2)}&file-id=${id(3)}&page-id=${id(4)}`}}),rpc:async()=>file()};
 const fetchImpl=async(url,options)=>{
  calls.push({url,options});assert.equal(options.headers.Cookie,cookie);assert.equal(options.headers['X-Studio-Acting-Profile'],undefined);assert.equal(options.redirect,'error');
  const route=new URL(url).pathname;
  if(route.endsWith('/get-profile'))return Response.json({id:profile});
  if(route.endsWith('/get-font-variants'))return Response.json([{fontId:id(9),fontFamily:'Mona Sans',fontWeight:'400',fontStyle:'normal',ttfFileId:id(10),woff1FileId:id(11)}]);
  if(route==='/assets/by-id/'+id(10))return new Response(wrongOriginal?Buffer.from('changed font'):original);
  if(route==='/assets/by-id/'+id(11))return new Response(woff);
  if(route==='/api/export'){
   if(changeDuringExport)revision++;
   const body=JSON.parse(options.body);assert.equal(body['~:profile-id'],'~u'+id(7));assert.equal(body['~:exports'][0]['~:file-id'],'~u'+id(3));
   return new Response(JSON.stringify({'~:mtype':'image/svg+xml','~:name':'studio-infographic-draft','~:filename':'board.svg','~:id':'~u'+id(12),'~:uri':{'~#uri':'http://localhost:39008/assets/by-id/'+id(12)}}),{headers:{'Content-Type':'application/transit+json'}});
  }
  if(route==='/assets/by-id/'+id(12))return new Response(`<svg xmlns="http://www.w3.org/2000/svg"><style>@font-face {font-family: 'Mona Sans';font-style: normal;font-weight: 400;font-display: block;src: url(http://localhost:39008/assets/by-id/${id(11)}) format('woff');}</style><text>HUMAN ॐ &amp; text</text></svg>`);
  throw Error('Unexpected native request '+route);
 };
 let now=100;
 const service=new PenpotStorySvg({designs,grantKey:key,fetchImpl,now:()=>now,licensedFonts:()=>[{family:'Mona Sans',weight:400,extension:'ttf',sha256:sha(original),license:'OFL-1.1 retained notice --- licensed & original <font>'}]});
 const input={storyId:'story',format:'infographic',expectedRevision:2,generationId:'generation',expectedNativeRevision:3};
 return {service,input,calls,setRevision:v=>revision=v,setProfile:v=>profile=v,setNow:v=>now=v,setWrongOriginal:()=>wrongOriginal=true,setChangeDuringExport:()=>changeDuringExport=true};
}
test('one-use saved-board SVG uses presented human session and embeds exact licensed font with editable text',async()=>{
 const f=fixture(),permit=await f.service.prepare({id:id(20)},f.input,'s'.repeat(64)),token=new URL(permit.downloadUrl).searchParams.get('permit');
 const result=await f.service.download(key,token,cookie),svg=result.bytes.toString();
 assert.match(svg,/data:font\/woff;base64,/);assert.match(svg,/HUMAN ॐ &amp; text/);assert.match(svg,/OFL-1.1 retained notice --- licensed &amp; original &lt;font&gt;/);assert.match(svg,/<metadata id="studio-font-notices">/);assert.doesNotMatch(svg,/http:\/\/localhost:39008\/assets/);assert.equal(result.sha256,sha(result.bytes));
 await assert.rejects(f.service.download(key,token,cookie),{status:410});
});
test('changed saved revision, expired permit and wrong native account stop before rendering',async()=>{
 for(const mode of ['changed','expired','account']){
  const f=fixture(),p=await f.service.prepare({id:id(20)},f.input,'s'.repeat(64)),token=new URL(p.downloadUrl).searchParams.get('permit');
  if(mode==='changed')f.setRevision(4);if(mode==='expired')f.setNow(120101);if(mode==='account')f.setProfile(id(99));
  await assert.rejects(f.service.download(key,token,cookie),{status:mode==='expired'?410:409});assert.equal(f.calls.some(x=>x.url.endsWith('/api/export')),false);
 }
});
test('gateway forwards only fixed callback and native session; verifies bytes and denies untrusted gateway',async()=>{
 const bytes=Buffer.from('<svg/>');let calls=0;
 const handler=createStorySvgGateway({studioOrigin:'http://127.0.0.1:39043',grantKey:key,gatewayKey,fetchImpl:async(url,options)=>{calls++;assert.equal(url,'http://127.0.0.1:39043/api/native/penpot/designs/svg');assert.equal(options.headers['X-Studio-Native-Session'],cookie);assert.equal(options.headers.Cookie,undefined);return new Response(bytes,{headers:{'Content-Type':'image/svg+xml','Content-Disposition':'attachment; filename="studio-infographic-draft.svg"','X-Studio-Svg-Sha256':sha(bytes)}});}});
 const response=()=>({writeHead(status,headers){this.status=status;this.headers=headers;},end(body){this.body=body;}});
 const req={method:'GET',url:'/studio-save-svg?permit='+'p'.repeat(43),headers:{'x-studio-native-gateway':gatewayKey,'x-studio-native-session':cookie}};
 const ok=response();assert.equal(await handler(req,ok),true);assert.equal(ok.status,200);assert.deepEqual(ok.body,bytes);assert.equal(ok.headers['Referrer-Policy'],'no-referrer');
 const denied=response();await handler({...req,headers:{...req.headers,'x-studio-native-gateway':'b'.repeat(64)}},denied);assert.equal(denied.status,403);assert.equal(calls,1);
});

test('licensed original mismatch and concurrent native save never return a misleading SVG',async()=>{
 for(const mode of ['font','save']){
  const f=fixture(),p=await f.service.prepare({id:id(20)},f.input,'s'.repeat(64)),token=new URL(p.downloadUrl).searchParams.get('permit');
  if(mode==='font')f.setWrongOriginal();else f.setChangeDuringExport();
  await assert.rejects(f.service.download(key,token,cookie),{status:409});
  if(mode==='font')assert.equal(f.calls.some(x=>x.url.endsWith('/api/export')),false);
 }
});

test('native SVG gateway follows the exact localhost Studio callback origin',()=>{
 const grantKey='g'.repeat(43),gatewayKey='a'.repeat(64);
 assert.equal(typeof createStorySvgGateway({studioOrigin:'http://localhost:39052',grantKey,gatewayKey}),'function');
 for(const studioOrigin of ['http://app.localhost:39052','http://127.0.0.2:39052','http://localhost:39052/'])assert.throws(()=>createStorySvgGateway({studioOrigin,grantKey,gatewayKey}));
});
