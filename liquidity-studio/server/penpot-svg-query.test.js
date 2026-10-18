import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('native SVG render query compatibility preserves the entire request and redirects only once',async()=>{
 const source=await readFile(new URL('../../tools/penpot-svg-export-query/server.conf',import.meta.url),'utf8');
 const pattern=source.match(/if \(\$request_uri ~ "([^"]+)"\)/)?.[1];assert.ok(pattern);
 const matches=new RegExp(pattern);
 const native='/render.html?file-id=file&page-id=page&render-embed=true&object-id=board&route=objects';
 assert.equal(matches.test(native),true);
 const corrected=native+'&embed=true';
 assert.equal(matches.test(corrected),false);
 assert.deepEqual([...new URL('http://localhost'+corrected).searchParams],[...new URL('http://localhost'+native).searchParams,['embed','true']]);
 for(const url of ['/render.html?render-embed=true','/render.html?route=objects&render-embed=true'])assert.equal(matches.test(url),true);
 for(const url of ['/render.html','/render.html?render-embed=false','/render.html?xrender-embed=true','/render.html?render-embed=truex','/render.html?embed=false&render-embed=true','/render.html?render-embed=true&embed=true','/elsewhere?render-embed=true','/render.html/other?render-embed=true'])assert.equal(matches.test(url),false,url);
 assert.match(source,/return 302 "\$request_uri&embed=true";/);
 assert.doesNotMatch(source,/proxy_pass|auth_request|location\s|add_header/);
});
