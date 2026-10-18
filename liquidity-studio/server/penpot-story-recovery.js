import {createHash,randomBytes} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {zipSync,unzipSync,strToU8} from 'fflate';
import {fail} from './auth.js';
import {nativeSvgPrivateKey} from './penpot-story-svg.js';
import {penpotPresentedSession} from './penpot-media-authorization.js';
import {readBoundedPenpotExportResponse as bounded} from './penpot-native-export.js';
import {createPenpotFontPack} from './penpot-font-pack.js';
const ORIGIN='http://localhost:39008',UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const digest=value=>sha(JSON.stringify(value));
const exact=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join(',')===[...keys].sort().join(',');
const FONT_FILES=[['Instrument Serif',400,'InstrumentSerif-Regular.ttf','InstrumentSerif-OFL.txt'],['Mona Sans',400,'MonaSans-Regular.otf','MonaSans-OFL.txt'],['Mona Sans',700,'MonaSans-Bold.otf','MonaSans-OFL.txt'],['Inter',400,'InterVariable.ttf','Inter-LICENSE.txt'],['Noto Sans Devanagari',400,'NotoSansDevanagari.ttf','NotoSansDevanagari-OFL.txt']];
export function recoveryLicensedFonts(){
 const local=fileURLToPath(new URL('../public/fonts/',import.meta.url)),directory=fs.existsSync(local)?local:'/usr/local/share/fonts/liquidity';
 return FONT_FILES.map(([family,weight,sourceName,noticeName])=>({family,weight,sourceName,noticeName,bytes:fs.readFileSync(path.join(directory,sourceName)),licenseBytes:fs.readFileSync(path.join(directory,noticeName))}));
}
/** Pinned app.http.sse uses JSON-verbose Transit, not ordinary JSON RPC DTOs. */
export function parseRecoveryExport(bytes,fileId){
 const text=bytes.toString('utf8');if(text.includes('\r')||text.includes('\0'))throw fail(502,'Native archive response invalid');
 let end;
 for(const block of text.split('\n\n').filter(value=>value.trim())){
  const lines=block.split('\n');if(lines.length!==2||!lines[0].startsWith('event: ')||!lines[1].startsWith('data: '))throw fail(502,'Native archive response invalid');
  const event=lines[0].slice(7);if(end||event==='error')throw fail(502,'Native archive export did not finish');
  if(event!=='end')continue;
  let value;try{value=JSON.parse(lines[1].slice(6));}catch{throw fail(502,'Native archive response invalid');}
  if(!exact(value,['~:uri','~:studio-export-version','~:file-id'])||value['~:studio-export-version']!=='v1'||value['~:file-id']!=='~u'+fileId)throw fail(502,'Install the private native recovery export hook before downloading this kit');
  let url;try{url=new URL(value['~:uri']);}catch{throw fail(502,'Native archive location invalid');}
  if(url.origin!==ORIGIN||url.search||url.hash||url.username||url.password||!/^\/assets\/by-id\/[a-f0-9-]{36}$/.test(url.pathname)||!UUID.test(url.pathname.split('/').at(-1)))throw fail(502,'Native archive location invalid');
  end=url.pathname;
 }
 if(!end)throw fail(502,'Native archive export did not finish');return end;
}
export function inspectNativeRecoveryArchive(archive,fileId,verifiedFontIds){
 const seen=new Set();let total=0;
 const files=unzipSync(new Uint8Array(archive),{filter:entry=>{
  if(seen.size>=2048||seen.has(entry.name)||entry.name.length>256||entry.name.startsWith('/')||/^[A-Za-z]:/.test(entry.name)||entry.name.includes('\\')||/[\x00-\x1f]/.test(entry.name)||entry.name.split('/').some(part=>part==='.'||part==='..')||!Number.isSafeInteger(entry.originalSize)||entry.originalSize<0||entry.originalSize>16*1024*1024)throw fail(422,'Native archive contains an unsupported entry');
  seen.add(entry.name);total+=entry.originalSize;if(total>32*1024*1024)throw fail(413,'Native archive expands beyond the recovery limit');return true;
 }});
 let manifest;try{manifest=JSON.parse(Buffer.from(files['manifest.json']||[]).toString('utf8'));}catch{throw fail(502,'Native archive manifest unavailable');}
 if(manifest.type!=='penpot/export-files'||manifest.generatedBy!=='penpot/2.18.3'||manifest.files?.length!==1||manifest.files[0].id!==fileId||!Array.isArray(manifest.relations)||manifest.relations.length)throw fail(422,'Recovery supports this registered file with embedded assets, not external library archives');
 const found=new Set();
 for(const [name,bytes]of Object.entries(files))if(name.endsWith('.json')){
  let value;try{value=JSON.parse(Buffer.from(bytes).toString('utf8'));}catch{throw fail(502,'Native archive JSON invalid');}
  const pending=[value];let nodes=0;
  while(pending.length){const item=pending.pop();if(!item||typeof item!=='object')continue;if(++nodes>200000)throw fail(413,'Native archive JSON exceeds the recovery limit');
   for(const [key,child]of Object.entries(item)){if((key==='fontId'||key==='font-id')&&typeof child==='string'){if(!verifiedFontIds.has(child))throw fail(422,'Embedded native archive uses an unverified font');found.add(child);}if(child&&typeof child==='object')pending.push(child);}
  }
 }
 if(!found.size)throw fail(422,'Native archive has no verified font bindings');return {entries:seen.size,uncompressedBytes:total};
}
export function createNativeRecoveryKit({archive,fonts,file,scope,storyId,format}){
 if(archive.subarray(0,4).toString('hex')!=='504b0304')throw fail(502,'Native archive is not a Penpot ZIP');
 const archiveInventory=inspectNativeRecoveryArchive(archive,file.id,new Set(fonts.map(font=>font.oldFontId)));
 const sidecar=createPenpotFontPack({archive,fonts}),entries={'design.penpot':new Uint8Array(archive),'penpot-font-recovery.json':strToU8(JSON.stringify(sidecar))};
 for(const font of fonts){for(const [name,bytes]of [[font.sourceName,font.bytes],[font.noticeName,font.licenseBytes]]){const key='fonts/'+name;if(entries[key]&&sha(entries[key])!==sha(bytes))throw fail(422,'Conflicting font filenames');entries[key]=new Uint8Array(bytes);}}
 const manifest={kind:'studio-registered-penpot-recovery',schemaVersion:1,editorVersion:'2.18.3',scope,storyId,format,fileId:file.id,nativeRevision:file.revn,archiveSha256:sha(archive),archiveInventory,fontVariants:sidecar.fonts.map(({family,weight,style,oldFontId,sourceName,sourceSha256,licenseSha256})=>({family,weight,style:style||'normal',oldFontId,sourceName,sourceSha256,licenseSha256})),identityIncluded:false,authorityRestored:false};
 entries['recovery-manifest.json']=strToU8(JSON.stringify(manifest,null,2)+'\n');
 entries['RESTORE.md']=strToU8(`# Restore this Penpot design\n\nKeep this kit private. It contains the saved native design and licensed original fonts, not sign-in accounts or Studio authority.\n\n1. Keep the source and its backups until recovery is usable. Also download the separate Studio recovery kit in Operations. That kit preserves the brand, saved sources, Studio layouts and media; this Penpot kit does not replace it.\n2. On the destination, use the release's existing scripts/penpot-font-recovery.mjs operator page with penpot-font-recovery.json and a private configuration fixed to the new native profile, team and project. See liquidity-studio/docs/penpot-font-recovery.md. Check the explicit destination acknowledgement before restoring fonts. The tool checks ALL font UUID conflicts before uploading; it preserves original UUIDs only when absent in that fresh destination, and verifies original bytes and generated variants. Keep its same intent/journal if interrupted.\n3. In that destination's normal Penpot dashboard, import design.penpot into the intended project. Do not assume the archive includes font binaries. It includes the native archive's embedded media. Fonts and OFL notices are separately retained in fonts/.\n4. Open all pages and compare text, fonts, images, geometry and your PNG/SVG output with the source. This download is not proof that an import or rendering has succeeded.\n5. Importing does NOT reconnect Studio automatically. The destination gets new native file/project identifiers. Record those actual identifiers for explicit destination registration. Existing Studio layout adopt actions do not adopt an imported Penpot campaign file; this kit adds no automatic campaign-record adoption. This kit does not transfer grants, pairing, sessions or identity snapshots, and does not perform a font remap or replace an existing file. A same-install UUID conflict requires explicit destination/remap handling, not overwrite.\n\nRun shasum -a 256 -c SHA256SUMS (macOS) or sha256sum -c SHA256SUMS (Linux) in the extracted directory. Preserve every OFL notice.\n`);
 entries.SHA256SUMS=strToU8(Object.entries(entries).map(([name,bytes])=>`${sha(bytes)}  ${name}`).join('\n')+'\n');
 if(Object.values(entries).reduce((sum,value)=>sum+value.length,0)>40*1024*1024)throw fail(413,'Native recovery kit exceeds its bounded size');
 const bytes=Buffer.from(zipSync(entries,{level:0}));if(bytes.length>40*1024*1024)throw fail(413,'Native recovery kit exceeds its bounded size');
 return {bytes,filename:'studio-penpot-recovery-kit.zip',manifest};
}
export class PenpotStoryRecovery {
 constructor({designs,grantKey,fetchImpl=fetch,licensedFonts=recoveryLicensedFonts,now=Date.now}){Object.assign(this,{designs,grantKey,fetchImpl,licensedFonts,now});this.permits=new Map();this.active=false;}
 has(permit){for(const [key,row]of this.permits)if(row.expiresAt<=this.now())this.permits.delete(key);return typeof permit==='string'&&/^[\w-]{43}$/.test(permit)&&this.permits.has(sha(permit));}
 async current(actor,input,sessionContext){
  const context=await this.designs.context(actor,input.storyId,sessionContext),lookup=await this.designs.designs(actor,{storyId:input.storyId,format:input.format},sessionContext),design=lookup.design;
  if(context.story.revision!==input.expectedRevision||context.story.generationId!==input.generationId||design?.status!=='ready'||design.nativeRevision!==input.expectedNativeRevision)throw fail(409,'Save and reopen the current campaign design before downloading its recovery kit');
  const file=await this.designs.rpc(context.workspace,'get-file',{id:design.fileId});
  if(file.id!==design.fileId||file.projectId!==context.workspace.projectId||file.revn!==input.expectedNativeRevision||!file.data)throw fail(409,'Saved native design changed');
  return {context,file,fingerprint:digest({source:context.identity,data:file.data,revision:file.revn})};
 }
 async prepare(actor,input,sessionContext){
  if(!exact(input,['storyId','format','expectedRevision','generationId','expectedNativeRevision'])||!['infographic','carousel','story','reel'].includes(input.format)||!Number.isSafeInteger(input.expectedRevision)||!Number.isSafeInteger(input.expectedNativeRevision))throw fail(400,'Current saved campaign and native revision required');
  const current=await this.current(actor,input,sessionContext);this.has('');if(this.permits.size>=2||this.active)throw fail(429,'Finish the current recovery download first');
  const permit=randomBytes(32).toString('base64url'),expiresAt=this.now()+120000;this.permits.set(sha(permit),{actor:structuredClone(actor),input:structuredClone(input),sessionContext,fingerprint:current.fingerprint,expiresAt});
  return {downloadUrl:ORIGIN+'/studio-recovery-kit?permit='+permit,expiresAt};
 }
 async download(key,permit,cookie){
  if(!nativeSvgPrivateKey(this.grantKey,key))throw fail(403,'Private native download relay required');
  if(!this.has(permit))throw fail(410,'Recovery download expired; prepare it again in Studio');
  if(this.active)throw fail(429,'Finish the current recovery download first');
  const row=this.permits.get(sha(permit));this.permits.delete(sha(permit));this.active=true;
  try{
   const current=await this.current(row.actor,row.input,row.sessionContext);if(current.fingerprint!==row.fingerprint)throw fail(409,'Saved design changed; prepare a new recovery kit');
   const session=penpotPresentedSession(cookie),signal=AbortSignal.timeout(55000);
   const request=async(resource,{body=null,max=2*1024*1024,sse=false}={})=>{
    const response=await this.fetchImpl(ORIGIN+resource,{method:body===null?'GET':'POST',headers:{Cookie:session,Origin:ORIGIN,...(body===null?{}:{'Content-Type':'application/json',Accept:sse?'text/event-stream':'application/json'})},body:body===null?undefined:JSON.stringify(body),redirect:'error',signal,cache:'no-store'});
    if(response.status!==200){await response.body?.cancel().catch(()=>{});throw fail([401,403].includes(response.status)?403:502,'Native recovery resources could not be read; saved work is unchanged');}
    if(sse&&!response.headers.get('content-type')?.startsWith('text/event-stream')){await response.body?.cancel().catch(()=>{});throw fail(502,'Native recovery export response invalid');}
    return bounded(response,max);
   };
   const rpc=async(name,body)=>JSON.parse((await request('/api/rpc/command/'+name,{body})).toString('utf8'));
   const profile=await rpc('get-profile',{}),workspace=current.context.workspace;
   if(profile.id!==(workspace.actingNativeProfileId||workspace.ownerPrincipal))throw fail(409,'Use the Penpot account connected to this Studio workspace');
   const variants=await rpc('get-font-variants',{'team-id':workspace.teamId});if(!Array.isArray(variants))throw fail(502,'Native font registry unavailable');
   const ids=new Set();const visit=value=>{if(!value||typeof value!=='object')return;if(typeof value.fontId==='string')ids.add(value.fontId);for(const child of Object.values(value))visit(child);};visit(current.file.data);
   const licensed=this.licensedFonts(),fonts=[];
   if(!ids.size||ids.size>8)throw fail(422,'This design needs one to eight verified licensed font variants');
   for(const id of ids){
    const configured=workspace.fonts.find(font=>font.fontId===id),variant=variants.find(font=>'custom-'+font.fontId===id&&font.fontStyle==='normal'&&font.fontFamily===configured?.family&&Number(font.fontWeight)===configured?.weight),source=licensed.find(font=>font.family===configured?.family&&font.weight===configured?.weight&&sha(font.bytes)===configured?.sha256);
    if(!configured||!variant||!source||configured.license!=='OFL-1.1')throw fail(422,'This saved design uses a font outside the verified licensed recovery set; its text is unchanged');
    const sourceId=variant[path.extname(source.sourceName).slice(1)+'FileId'];if(!UUID.test(sourceId||''))throw fail(422,'Original native font source is unavailable');
    const actual=await request('/assets/by-id/'+sourceId,{max:3*1024*1024});if(sha(actual)!==configured.sha256)throw fail(409,'Native font bytes differ from the licensed source');
    fonts.push({...source,bytes:actual,oldFontId:id});
   }
   const exported=await request('/api/rpc/command/export-binfile',{body:{'file-id':current.file.id,'include-libraries':false,'embed-assets':true,'studio-recovery':true},max:64*1024,sse:true}),resource=parseRecoveryExport(exported,current.file.id);
   const archive=await request(resource,{max:10*1024*1024});
   if((await rpc('get-profile',{})).id!==profile.id)throw fail(403,'Current native session changed during recovery export');
   const after=await this.current(row.actor,row.input,row.sessionContext);if(after.fingerprint!==row.fingerprint)throw fail(409,'Saved design changed during export; prepare it again');
   const result=createNativeRecoveryKit({archive,fonts,file:current.file,scope:this.designs.scope,storyId:row.input.storyId,format:row.input.format});return {...result,sha256:sha(result.bytes)};
  }finally{this.active=false;}
 }
}
export function storyRecoveryDispatcher(services,grantKey){return async(key,permit,cookie)=>{if(!nativeSvgPrivateKey(grantKey,key))throw fail(403,'Private native download relay required');for(const service of services.values())if(service.recovery?.has(permit))return service.recovery.download(key,permit,cookie);throw fail(410,'Recovery download expired; prepare it again in Studio');};}
