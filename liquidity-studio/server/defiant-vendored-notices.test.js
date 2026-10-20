import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,cp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defiantVendoredNotices} from '../scripts/defiant-vendored-notices.js';
async function fixture(t){
 const root=await mkdtemp(join(tmpdir(),'defiant-notices-contract-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'licenses'),{recursive:true});await cp(fileURLToPath(new URL('../licenses/defiant-vendored',import.meta.url)),join(root,'licenses/defiant-vendored'),{recursive:true});
 const directory=join(root,'node_modules/@modelcontextprotocol/server/dist');await mkdir(directory,{recursive:true});await writeFile(join(directory,'../package.json'),JSON.stringify({version:'2.3.1'}));
 const input='node_modules/@modelcontextprotocol/server/dist/fixture.mjs';
 await writeFile(join(root,input+'.map'),JSON.stringify({sources:['../../../node_modules/.pnpm/content-type@1.0.5/node_modules/content-type/index.js']}));
 return {root,input,metafile:{inputs:{[input]:{}}}};
}
test('retains exact supplemental full texts including upstream copyright and optional qualification',async t=>{
 const {root,metafile}=await fixture(t),text=await defiantVendoredNotices(root,metafile);
 assert.match(text,/content-type@1.0.5/);assert.match(text,/Douglas Christopher Wilson/);assert.match(text,/Gary Court/);assert.match(text,/optional\/tree-shaken|tree-shaken/);assert.match(text,/8.18.0/);
});
test('unknown source-map vendor, changed SDK publication and corrupted license fail closed',async t=>{
 const {root,input,metafile}=await fixture(t);
 await writeFile(join(root,input+'.map'),JSON.stringify({sources:['../../../node_modules/.pnpm/unknown@1.0.0/node_modules/unknown/index.js']}));await assert.rejects(defiantVendoredNotices(root,metafile),/Unresolved/);
 await writeFile(join(root,input+'.map'),JSON.stringify({sources:[]}));await writeFile(join(root,'node_modules/@modelcontextprotocol/server/package.json'),JSON.stringify({version:'2.4.0'}));await assert.rejects(defiantVendoredNotices(root,metafile),/pinned/);
 await writeFile(join(root,'node_modules/@modelcontextprotocol/server/package.json'),JSON.stringify({version:'2.3.1'}));const manifest=JSON.parse(await readFile(join(root,'licenses/defiant-vendored/manifest.json'),'utf8'));await writeFile(join(root,'licenses/defiant-vendored',manifest.packages[0].files[0].file),'corrupted');await assert.rejects(defiantVendoredNotices(root,metafile),/integrity/);
});
