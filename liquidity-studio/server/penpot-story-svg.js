import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fail} from './auth.js';
import {embedPenpotSvg} from './penpot-svg-embed.js';
import {penpotPresentedSession} from './penpot-media-authorization.js';
import {parsePenpotSingleExport,parsePenpotExportResponse,readBoundedPenpotExportResponse as bounded} from './penpot-native-export.js';
const ORIGIN='http://localhost:39008',UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const digest=value=>sha(JSON.stringify(value));
const exact=(value,keys)=>value&&Object.keys(value).sort().join(',')===[...keys].sort().join(',');
export function nativeSvgPrivateKey(expected,actual){return typeof expected==='string'&&/^[\w-]{43}$/.test(expected)&&typeof actual==='string'&&/^[\w-]{43}$/.test(actual)&&timingSafeEqual(Buffer.from(expected),Buffer.from(actual));}
const fontDirectory=()=>{const local=fileURLToPath(new URL('../public/fonts/',import.meta.url));return fs.existsSync(local)?local:'/usr/local/share/fonts/liquidity';};
const FONT_FILES=[['Instrument Serif',400,'InstrumentSerif-Regular.ttf','InstrumentSerif-OFL.txt'],['Mona Sans',400,'MonaSans-Regular.otf','MonaSans-OFL.txt'],['Mona Sans',700,'MonaSans-Bold.otf','MonaSans-OFL.txt'],['Inter',400,'InterVariable.ttf','Inter-LICENSE.txt'],['Noto Sans Devanagari',400,'NotoSansDevanagari.ttf','NotoSansDevanagari-OFL.txt']];
export function storySvgLicensedFonts(){return FONT_FILES.map(([family,weight,filename,notice])=>{const bytes=fs.readFileSync(path.join(fontDirectory(),filename)),license=fs.readFileSync(path.join(fontDirectory(),notice),'utf8');return {family,weight,extension:path.extname(filename).slice(1),sha256:sha(bytes),license};});}
/** Read-only export permits. Native cookies live only in the one download call. */
export class PenpotStorySvg {
 constructor({designs,grantKey,fetchImpl=fetch,licensedFonts=storySvgLicensedFonts,now=Date.now}){Object.assign(this,{designs,grantKey,fetchImpl,licensedFonts,now});this.permits=new Map();}
 prune(){for(const [key,row]of this.permits)if(row.expiresAt<=this.now())this.permits.delete(key);}
 has(permit){this.prune();return typeof permit==='string'&&/^[\w-]{43}$/.test(permit)&&this.permits.has(sha(permit));}
 async current(actor,input,sessionContext){
  const context=await this.designs.context(actor,input.storyId,sessionContext);
  if(context.story.revision!==input.expectedRevision||context.story.generationId!==input.generationId)throw fail(409,'Saved campaign changed; reopen this design before saving SVG');
  const lookup=await this.designs.designs(actor,{storyId:input.storyId,format:input.format},sessionContext),design=lookup.design;
  if(design?.status!=='ready'||design.nativeRevision!==input.expectedNativeRevision)throw fail(409,'Save and reopen the current native design before saving SVG');
  const pageId=new URLSearchParams(new URL(design.nativeUrl).hash.split('?')[1]||'').get('page-id');
  const file=await this.designs.rpc(context.workspace,'get-file',{id:design.fileId});
  const frames=Object.values(file.data?.pagesIndex?.[pageId]?.objects||{}).filter(shape=>shape.type==='frame'&&shape.id!=='00000000-0000-0000-0000-000000000000'&&shape.parentId==='00000000-0000-0000-0000-000000000000');
  if(file.id!==design.fileId||frames[0]?.width<=0||frames[0]?.height<=0||file.projectId!==context.workspace.projectId||file.revn!==input.expectedNativeRevision||!UUID.test(pageId||'')||frames.length!==1||!UUID.test(frames[0].id)||!Number.isFinite(frames[0].width)||!Number.isFinite(frames[0].height)||frames[0].width*frames[0].height>16*1024*1024)throw fail(422,'This saved page needs one supported board for SVG export');
  return {context,file,pageId,objectId:frames[0].id,fingerprint:digest({source:context.identity,file:file.data,revision:file.revn})};
 }
 async prepare(actor,input,sessionContext){
  if(!exact(input,['storyId','format','expectedRevision','generationId','expectedNativeRevision'])||!['infographic','carousel','story','reel'].includes(input.format)||!Number.isSafeInteger(input.expectedRevision)||!Number.isSafeInteger(input.expectedNativeRevision))throw fail(400,'Current saved campaign and native revision required');
  const current=await this.current(actor,input,sessionContext);this.prune();
  if(this.permits.size>=20)throw fail(429,'Finish an existing SVG download or wait two minutes');
  const permit=randomBytes(32).toString('base64url'),expiresAt=this.now()+120000;
  this.permits.set(sha(permit),{actor:structuredClone(actor),input:structuredClone(input),sessionContext,fingerprint:current.fingerprint,expiresAt});
  return {downloadUrl:ORIGIN+'/studio-save-svg?permit='+permit,expiresAt,draft:true,format:input.format,firstBoardOnly:true};
 }
 async download(presentedKey,permit,cookie){
  if(!nativeSvgPrivateKey(this.grantKey,presentedKey))throw fail(403,'Private native download relay required');
  if(!this.has(permit))throw fail(410,'SVG download expired; prepare it again in Studio');
  const row=this.permits.get(sha(permit));this.permits.delete(sha(permit)); // one export request; no blind repeat after an unknown reply
  const current=await this.current(row.actor,row.input,row.sessionContext);
  if(current.fingerprint!==row.fingerprint)throw fail(409,'The saved design changed; prepare a fresh SVG');
  const session=penpotPresentedSession(cookie),signal=AbortSignal.timeout(55000);
  const request=async(resource,{body=null,max=2*1024*1024,type=null}={})=>{
   const response=await this.fetchImpl(ORIGIN+resource,{method:body===null?'GET':'POST',headers:{Cookie:session,Origin:ORIGIN,...(body===null?{}:{'Content-Type':type||'application/json',Accept:type||'application/json'})},body:body===null?undefined:typeof body==='string'||Buffer.isBuffer(body)?body:JSON.stringify(body),redirect:'error',signal,cache:'no-store'});
   if(response.status!==200){await response.body?.cancel().catch(()=>{});throw fail([401,403].includes(response.status)?403:502,'Native SVG resources could not be read; saved work is unchanged');}
   return {bytes:await bounded(response,max),contentType:response.headers.get('content-type')?.split(';')[0]};
  };
  const rpc=async(name,body)=>JSON.parse((await request('/api/rpc/command/'+name,{body})).bytes);
  const profile=await rpc('get-profile',{}),expected=current.context.workspace.actingNativeProfileId||current.context.workspace.ownerPrincipal;
  if(profile.id!==expected)throw fail(409,'Use the Penpot account connected to this Studio workspace');
  const workspace=current.context.workspace,variants=await rpc('get-font-variants',{'team-id':workspace.teamId}),licensed=this.licensedFonts(),fontResources=new Map(),notices=new Set(),verifiedFontIds=new Set();
  if(!Array.isArray(variants))throw fail(502,'Current native font variants unavailable');
  for(const configured of workspace.fonts){
   const source=licensed.find(font=>font.family===configured.family&&font.weight===configured.weight&&font.sha256===configured.sha256);
   const variant=variants.find(font=>'custom-'+font.fontId===configured.fontId&&font.fontFamily===configured.family&&Number(font.fontWeight)===configured.weight&&font.fontStyle==='normal');
   if(!source||!variant||configured.license!=='OFL-1.1')continue;
   const sourceId=variant[source.extension+'FileId'];if(!UUID.test(sourceId||''))continue;
   const original=await request('/assets/by-id/'+sourceId,{max:4*1024*1024});if(sha(original.bytes)!==source.sha256)throw fail(409,'Native source font differs from its licensed original');
   verifiedFontIds.add(configured.fontId);
   for(const [field,mime]of [['woff1FileId','font/woff'],['woff2FileId','font/woff2'],['ttfFileId','font/ttf'],['otfFileId','font/otf']])if(UUID.test(variant[field]||''))fontResources.set('/assets/by-id/'+variant[field],{contentType:mime,license:source.license});
  }
  const usedFontIds=new Set();
  const collectFonts=value=>{if(!value||typeof value!=='object')return;if(typeof value.fontId==='string')usedFontIds.add(value.fontId);for(const child of Object.values(value))collectFonts(child);};
  for(const shape of Object.values(current.file.data.pagesIndex[current.pageId].objects))if(shape.type==='text')collectFonts(shape.content);
  if([...usedFontIds].some(id=>!verifiedFontIds.has(id)))throw fail(422,'This board uses a font outside the verified licensed export set; its saved text and font are unchanged');
  const name='studio-'+row.input.format+'-draft';
  const dto={'~:wait':true,'~:exports':[{'~:type':'~:svg','~:suffix':'','~:scale':1,'~:page-id':'~u'+current.pageId,'~:file-id':'~u'+current.file.id,'~:name':name,'~:object-id':'~u'+current.objectId}],'~:profile-id':'~u'+profile.id,'~:cmd':'~:export-shapes','~:is-wasm':false};
  const parsed=parsePenpotSingleExport(Buffer.from(JSON.stringify(dto)),'application/transit+json');
  const exported=await request('/api/export',{body:parsed.canonicalBody,type:'application/transit+json',max:32768});
  const output=parsePenpotExportResponse(exported.bytes,exported.contentType,parsed.request);
  const raw=await request('/assets/by-id/'+output.objectId,{max:1024*1024});
  const embedded=await embedPenpotSvg(raw.bytes,async resource=>{
   const registered=fontResources.get(resource.path);
   if(resource.kind!=='font'||!registered)throw fail(422,'This SVG uses an image or font outside the verified licensed export set');
   const value=await request(resource.path,{max:512*1024});notices.add(registered.license);
   return {bytes:value.bytes,sha256:sha(value.bytes),contentType:registered.contentType};
  });
  const after=await this.current(row.actor,row.input,row.sessionContext);
  if(after.fingerprint!==row.fingerprint)throw fail(409,'The saved design changed during export; prepare it again');
  const noticeText='Studio draft SVG. Not publication approval. Embedded font notices:\n'+[...notices].join('\n\n');
  const notice='\n<metadata id="studio-font-notices">'+noticeText.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')+'</metadata>\n';
  const svg=embedded.bytes.toString('utf8'),at=svg.indexOf('>')+1,bytes=Buffer.from(svg.slice(0,at)+notice+svg.slice(at));
  return {bytes,filename:name+'.svg',sha256:sha(bytes),nativeRevision:current.file.revn,draft:true};
 }
}
export function storySvgDispatcher(services,grantKey){return async(key,permit,cookie)=>{if(!nativeSvgPrivateKey(grantKey,key))throw fail(403,'Private native download relay required');for(const service of services.values())if(service.svg?.has(permit))return service.svg.download(key,permit,cookie);throw fail(410,'SVG download expired; prepare it again in Studio');};}
