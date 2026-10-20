import {build} from 'esbuild';
import {builtinModules} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {writeDefiantBundleNotices} from './defiant-bundle-notices.js';
/** Hosted-only dependency closure for the explicitly public fictional demo. No private inputs. */
export async function buildDefiantDemoServer(){
 const root=fileURLToPath(new URL('..',import.meta.url));
 const result=await build({entryPoints:[resolve(root,'server/defiant-synthetic-demo.js')],bundle:true,platform:'node',target:'node22',format:'esm',write:false,metafile:true,legalComments:'eof',banner:{js:"import {createRequire as __defiantCreateRequire} from 'node:module'; const require=__defiantCreateRequire(import.meta.url);"}});
 const builtins=new Set(builtinModules.flatMap(name=>[name,`node:${name}`]));
 const outputs=Object.values(result.metafile.outputs);
 if(result.outputFiles.length!==1||outputs.length!==1||outputs[0].imports.some(item=>!item.external||!builtins.has(item.path)))throw Error('Public demo bundle must contain every non-builtin dependency');
 const bytes=result.outputFiles[0].contents;
 if(!bytes.length||bytes.length>10*1024*1024)throw Error('Public demo bundle exceeds reviewed size');
 await mkdir(resolve(root,'dist/mcp'),{recursive:true});
 await writeFile(resolve(root,'dist/mcp/defiant-demo-server.mjs'),bytes);
 await writeDefiantBundleNotices(root,result.metafile);
 console.log(`Built isolated fictional demo server bundle: ${bytes.length} bytes`);
}
