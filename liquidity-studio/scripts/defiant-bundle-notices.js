import {defiantVendoredNotices} from './defiant-vendored-notices.js';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
let retainedInputs={};
/** Retain installed license texts for the union of hosted MCP bundle closures. */
export async function writeDefiantBundleNotices(root,metafile){
 retainedInputs={...retainedInputs,...metafile.inputs};
 metafile={...metafile,inputs:retainedInputs};
 const packages=new Map();
 async function add(directory){
  let current=directory;
  while(current!==dirname(current)){
   try{const info=JSON.parse(await readFile(join(current,'package.json'),'utf8'));if(info.name&&info.version){packages.set(`${info.name}@${info.version}`,{directory:current,info});return;}}catch(error){if(error.code!=='ENOENT')throw error;}
   current=dirname(current);
  }
  throw Error('Bundled dependency has no package identity');
 }
 for(const input of Object.keys(metafile.inputs))if(input.includes('node_modules/'))await add(dirname(resolve(root,input)));
 // Conservative retention of all nine newly locked OAuth closure entries, including nested safe-buffer.
 if(Object.keys(retainedInputs).some(input=>input.includes('@node-oauth/oauth2-server')))for(const name of ['@node-oauth/oauth2-server','@node-oauth/formats','basic-auth','basic-auth/node_modules/safe-buffer','content-type','media-typer','mime-db','mime-types','type-is'])await add(resolve(root,'node_modules',name));
 for(const name of ['@modelcontextprotocol/server','@modelcontextprotocol/client','@modelcontextprotocol/core','@modelcontextprotocol/node','@modelcontextprotocol/ext-apps','zod','svelte','esm-env','clsx'])await add(resolve(root,'node_modules',name));
 const sections=['Third-party notices for the Defiant MCP bundles. No project or commercial license is granted by this file.'];
 for(const [name,{directory,info}] of [...packages].sort(([a],[b])=>a.localeCompare(b))){
  const files=(await readdir(directory,{withFileTypes:true})).filter(file=>file.isFile()&&/^(licen[sc]e|copying|notice)([-.].*)?$/i.test(file.name)).map(file=>file.name).sort();
  if(!files.length)throw Error(`Installed bundled dependency is missing license text: ${name}`);
  sections.push(`\n===== ${name} (${info.license||'see included license'}) =====`);
  for(const file of files){const text=await readFile(join(directory,file),'utf8');if(Buffer.byteLength(text)>512*1024)throw Error('Dependency notice exceeds bound');sections.push(`\n--- ${file} ---\n${text}`);}
 }
 sections.push(await defiantVendoredNotices(root,metafile));
 const text=sections.join('\n')+'\n';if(Buffer.byteLength(text)>2*1024*1024)throw Error('Combined dependency notices exceed bound');
 await writeFile(resolve(root,'dist/mcp/defiant-third-party-notices.txt'),text);
}
