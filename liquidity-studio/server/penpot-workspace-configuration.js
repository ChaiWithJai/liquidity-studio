import {localNativeOrigin} from './penpot-origins.js';
// Explicit developer workspace bootstrap. Never a story/file authority manifest.
import {lstat,readFile} from 'node:fs/promises';
import {isAbsolute} from 'node:path';
import {validateEditorTargets} from './editor-boundary.js';
import {validatePenpotLocalConfiguration} from './penpot-local-configuration.js';
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(x);
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===[...keys].sort().join(',');
const invalid=()=>{throw Error('Invalid private developer Penpot workspace configuration');};
export async function loadDevelopmentPenpotConfiguration(path,env=process.env){
 if(env.K_SERVICE||env.K_REVISION||env.STUDIO_PENPOT_ENABLED!=='true'||!isAbsolute(path||''))invalid();
 const stat=await lstat(path);
 if(!stat.isFile()||(stat.mode&0o077)!==0||stat.size>1024*1024)invalid();
 return validateDevelopmentPenpotConfiguration(JSON.parse(await readFile(path,'utf8')),env);
}
export function validateDevelopmentPenpotConfiguration(value,env=process.env){
 if(env.K_SERVICE||env.K_REVISION||env.STUDIO_PENPOT_ENABLED!=='true')invalid();
 if(value?.version===1)return validatePenpotLocalConfiguration(value,env);
 const {nativeOrigin,localTools,...workspace}=value||{};
 if(nativeOrigin!==undefined)localNativeOrigin(nativeOrigin);
 if(localTools!==undefined&&localTools!==false)invalid();
 return {...validatePenpotWorkspaceConfiguration(workspace),...(nativeOrigin?{nativeOrigin}:{}),...(localTools===false?{localTools:false}:{})};
}
/** Strict workspace-only schema shared by explicit local and managed constructors. */
export function validatePenpotWorkspaceConfiguration(value){
 if(!exact(value,['version','transportMode','sessions','workspaces'])||value.version!==2||value.transportMode!=='loopback'||!Array.isArray(value.sessions)||!value.sessions.length||value.sessions.length>20||!Array.isArray(value.workspaces)||!value.workspaces.length||value.workspaces.length>50)invalid();
 const sessions=new Map(),workspaces=new Map(),scopes=new Set(),teams=new Set(),projects=new Set();
 for(const s of value.sessions){
  if(!exact(s,['ownerPrincipal','cookie'])||!uuid(s.ownerPrincipal)||typeof s.cookie!=='string'||!s.cookie.length||s.cookie.length>4096||/[\r\n]/.test(s.cookie)||sessions.has(s.ownerPrincipal))invalid();
  sessions.set(s.ownerPrincipal,{cookie:s.cookie});
 }
 const targets=[];
 for(const w of value.workspaces){
  if(!exact(w,['id','organizationId','brandId','ownerPrincipal','projectId','teamId','fonts'])||!uuid(w.ownerPrincipal)||!uuid(w.projectId)||!uuid(w.teamId)||!sessions.has(w.ownerPrincipal)||workspaces.has(w.id)||scopes.has(JSON.stringify([w.organizationId,w.brandId]))||teams.has(w.teamId)||projects.has(w.projectId)||!Array.isArray(w.fonts)||!w.fonts.length||w.fonts.length>20)invalid();
  const fontKeys=new Set();
  for(const f of w.fonts){
   if(!exact(f,['family','weight','fontId','fontVariantId','license','sha256'])||typeof f.family!=='string'||!f.family.trim()||f.family.length>100||!Number.isInteger(f.weight)||f.weight<100||f.weight>900||f.weight%100!==0||typeof f.fontId!=='string'||!f.fontId.startsWith('custom-')||!uuid(f.fontId.slice(7))||f.fontVariantId!==`normal-${f.weight}`||f.license!=='OFL-1.1'||typeof f.sha256!=='string'||!/^[a-f0-9]{64}$/.test(f.sha256)||fontKeys.has(`${f.family}:${f.weight}`))invalid();
   fontKeys.add(`${f.family}:${f.weight}`);
  }
  targets.push({id:w.id,organizationId:w.organizationId,brandId:w.brandId,adapter:'penpot',ownerPrincipal:w.ownerPrincipal,nativeProjectId:w.projectId,nativeRoomId:w.teamId,nativeDocumentVersion:'1',nativeVersionKind:'archive',editorVersion:'2.18.3',resources:[]});
  workspaces.set(w.id,structuredClone(w));scopes.add(JSON.stringify([w.organizationId,w.brandId]));teams.add(w.teamId);projects.add(w.projectId);
 }
 return {version:2,targets:validateEditorTargets(targets),sessions,workspaces,transportMode:'loopback'};
}
