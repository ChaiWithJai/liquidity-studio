import {build} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const MAX_DOMAIN_HTML_BYTES=512*1024;
/** Hosted build only. Fixed self-contained resource, no embedded dataset or credentials. */
export async function buildDefiantDomain(){
 const root=fileURLToPath(new URL('..',import.meta.url));
 const result=await build({root,configFile:false,plugins:[svelte()],esbuild:{legalComments:'eof'},build:{write:false,minify:'esbuild',cssCodeSplit:false,rollupOptions:{input:resolve(root,'src/defiant-domain.js'),output:{format:'iife',inlineDynamicImports:true}}},logLevel:'warn'});
 const outputs=Array.isArray(result)?result.flatMap(row=>row.output):result.output;
 const scripts=outputs.filter(row=>row.type==='chunk'),assets=outputs.filter(row=>row.type==='asset');
 if(scripts.length!==1||scripts[0].imports.length||scripts[0].dynamicImports.length||assets.some(row=>!row.fileName.endsWith('.css')))throw Error('Domain review must contain one inline script and CSS only');
 const css=assets.map(row=>typeof row.source==='string'?row.source:Buffer.from(row.source).toString('utf8')).join('\n');
 const html='<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Defiant domain review</title><style>html,body{margin:0;min-width:0;background:#fff}'+css.replace(/<\/style/gi,'<\\/style')+'</style></head><body><div id="defiant-domain"></div><script>'+scripts[0].code.replace(/<\/script/gi,'<\\/script')+'</script></body></html>\n';
 const bytes=Buffer.byteLength(html);if(bytes>MAX_DOMAIN_HTML_BYTES)throw Error(`Domain resource exceeds reviewed size: ${bytes}`);
 await mkdir(resolve(root,'dist/mcp'),{recursive:true});await writeFile(resolve(root,'dist/mcp/defiant-domain-review.html'),html);
 console.log(`Built self-contained Defiant domain UI: ${bytes} bytes`);
}
