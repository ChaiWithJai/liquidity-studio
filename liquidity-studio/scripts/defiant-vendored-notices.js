import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
/** Covers the identified dependencies vendored inside the pinned SDK publications, not all products. */
export async function defiantVendoredNotices(root,metafile){
 const directory=resolve(root,'licenses/defiant-vendored');
 const manifest=JSON.parse(await readFile(resolve(directory,'manifest.json'),'utf8'));
 const known=new Map(manifest.packages.map(row=>[row.name,row]));
 const observed=new Set();
 for(const input of Object.keys(metafile.inputs)){
  const match=/node_modules\/(\@modelcontextprotocol\/(?:server|client|core))\//.exec(input);if(!match)continue;
  const packageDirectory=resolve(root,input.slice(0,input.indexOf(match[0])),'node_modules',match[1]);
  if(JSON.parse(await readFile(resolve(packageDirectory,'package.json'),'utf8')).version!==manifest.sdkVersion)throw Error('Vendored SDK notice assessment requires the pinned publication version');
  if(!input.endsWith('.mjs'))continue;
  const map=JSON.parse(await readFile(resolve(root,input)+'.map','utf8'));
  for(const source of map.sources??[]){
   const vendor=/\/\.pnpm\/([^/]+)\/node_modules\/((?:@[^/]+\/)?[^/]+)\//.exec(source);if(!vendor)continue;
   const name=vendor[2],prefix=name.replace('/','+')+'@',version=vendor[1].startsWith(prefix)?vendor[1].slice(prefix.length).split('_')[0]:null;
   if(!known.has(name)||known.get(name).version!==version)throw Error('Unresolved vendored SDK dependency notice');
   observed.add(`${name}@${version}`);
  }
 }
 const sections=[`\n===== Supplemental upstream-vendored SDK notices =====\n${manifest.scope}\nSDK publication: ${manifest.sdkVersion}\nVersion evidence: ${manifest.upstreamLockUrl}\nObserved source-map identities: ${[...observed].sort().join(', ')||'none in selected published chunks'}`];
 for(const row of manifest.packages){
  sections.push(`\n===== ${row.name}@${row.version} (${row.license}) — supplemental =====\nExact package metadata: ${row.metadataUrl}\nPublished archive integrity: ${row.tarballIntegrity}`);
  for(const file of row.files){
   if(!/^[A-Za-z0-9_.-]+$/.test(file.file))throw Error('Invalid supplemental notice path');
   const bytes=await readFile(resolve(directory,file.file));
   if(bytes.length!==file.bytes||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Supplemental notice integrity mismatch');
   sections.push(`\n--- ${file.file} ---\nSource: ${file.source}\n${bytes.toString('utf8')}`);
  }
 }
 return sections.join('\n');
}
