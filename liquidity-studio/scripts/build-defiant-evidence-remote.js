import {build} from 'esbuild';
import {builtinModules} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {writeDefiantBundleNotices} from './defiant-bundle-notices.js';
/** Hosted-only complete SDK/OAuth closure; no private configuration or data is read. */
export async function buildDefiantEvidenceRemote(){
 const root=fileURLToPath(new URL('..',import.meta.url));
 const result=await build({entryPoints:[resolve(root,'server/defiant-evidence-remote.js')],bundle:true,platform:'node',target:'node22',format:'esm',write:false,metafile:true,legalComments:'eof',banner:{js:"import {createRequire as __evidenceCreateRequire} from 'node:module';const require=__evidenceCreateRequire(import.meta.url);"}});
 const builtins=new Set(builtinModules.flatMap(name=>[name,`node:${name}`]));const outputs=Object.values(result.metafile.outputs);
 if(result.outputFiles.length!==1||outputs.length!==1||outputs[0].imports.some(item=>!item.external||!builtins.has(item.path)))throw Error('Remote evidence requires complete non-builtin dependency closure');
 for(const input of Object.keys(result.metafile.inputs))if(/defiant-(?:synthetic|unified-data|evidence-runtime|evidence-provider)|google-auth|platform\.js/.test(input))throw Error('Remote evidence bundle imported forbidden provider or data');
 const bytes=result.outputFiles[0].contents;if(!bytes.length||bytes.length>10*1024*1024)throw Error('Remote evidence bundle exceeds reviewed bound');
 await mkdir(resolve(root,'dist/mcp'),{recursive:true});await writeFile(resolve(root,'dist/mcp/defiant-evidence-remote.mjs'),bytes);await writeDefiantBundleNotices(root,result.metafile);
 console.log(`Built authenticated real-evidence remote MCP bundle: ${bytes.length} bytes`);
}
