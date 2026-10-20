import {build} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const MAX_CHAT_HTML_BYTES=512*1024;
/** One static, self-contained MCP UI resource. Never embeds dataset or credentials. */
export async function buildDefiantChat(){
 const root=fileURLToPath(new URL('..',import.meta.url));
 const result=await build({root,configFile:false,plugins:[svelte()],esbuild:{legalComments:'eof'},build:{write:false,minify:'esbuild',cssCodeSplit:false,rollupOptions:{input:resolve(root,'src/defiant-chat.js'),output:{format:'iife',inlineDynamicImports:true}},},logLevel:'warn'});
 const outputs=Array.isArray(result)?result.flatMap(x=>x.output):result.output;
 const scripts=outputs.filter(x=>x.type==='chunk');
 if(scripts.length!==1||scripts[0].imports.length||scripts[0].dynamicImports.length)throw Error('Chat resource must be one self-contained script');
 const assets=outputs.filter(x=>x.type==='asset');
 if(assets.some(x=>!x.fileName.endsWith('.css')))throw Error('Chat resource contains an unreviewed external asset');
 const css=assets.map(x=>typeof x.source==='string'?x.source:Buffer.from(x.source).toString('utf8')).join('\n');
 const code=scripts[0].code;
 const html='<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Defiant guided research</title><style>html,body{margin:0;min-width:0}body{background:#fff}'+css.replace(/<\/style/gi,'<\\/style')+'</style></head><body><div id="defiant-chat"></div><script>'+code.replace(/<\/script/gi,'<\\/script')+'</script></body></html>\n';
 const bytes=Buffer.byteLength(html);if(bytes>MAX_CHAT_HTML_BYTES)throw Error(`Chat resource exceeds reviewed size: ${bytes}`);
 await mkdir(resolve(root,'dist/mcp'),{recursive:true});await writeFile(resolve(root,'dist/mcp/defiant-research.html'),html);
 console.log(`Built self-contained Defiant MCP UI: ${bytes} bytes`);
}
