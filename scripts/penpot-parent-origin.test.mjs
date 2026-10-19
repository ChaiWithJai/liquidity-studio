// Hosted contract for the exact entrypoint patch's added constructor block.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
test('native entrypoint publishes only configured HTTPS or exact port-bound loopback HTTP origins',()=>{
 const directory=mkdtempSync(join(tmpdir(),'penpot-parent-origin-'));
 try{
  const config=join(directory,'config.js');
  const block=readFileSync(new URL('../tools/penpot-studio-host/entrypoint.patch',import.meta.url),'utf8').split('\n').filter(line=>line.startsWith('+')&&!line.startsWith('+++')).map(line=>line.slice(1)).join('\n').replaceAll('/var/www/app/js/config.js',config);
  for(const origin of ['https://studio.example.com','http://localhost:3002','http://127.0.0.1:39043','http://[::1]:3002','http://localhost:65535','']){
   writeFileSync(config,'var penpotStudioOrigin = "https://old.example";\n');
   const result=spawnSync('bash',['-c',block],{env:{PATH:process.env.PATH,PENPOT_STUDIO_ORIGIN:origin},encoding:'utf8',timeout:2000});
   assert.equal(result.status,0,result.stderr);const output=readFileSync(config,'utf8');assert.equal(output.includes('https://old.example'),false);
   assert.equal(output.includes(`var penpotStudioOrigin = "${origin}";`),Boolean(origin));
  }
  for(const origin of ['http://remote.example:3002','http://app.localhost:3002','http://127.0.0.2:3002','http://localhost','http://localhost:80','http://localhost:0','http://localhost:65536','http://localhost:03002','http://localhost:3002/','http://user@localhost:3002','http://localhost:3002?next=other']){
   writeFileSync(config,'');const result=spawnSync('bash',['-c',block],{env:{PATH:process.env.PATH,PENPOT_STUDIO_ORIGIN:origin},encoding:'utf8',timeout:2000});assert.equal(result.status,1,origin);assert.match(result.stderr,/Invalid Studio parent origin/);assert.equal(readFileSync(config,'utf8').includes('var penpotStudioOrigin'),false);
  }
 }finally{rmSync(directory,{recursive:true,force:true});}
});
