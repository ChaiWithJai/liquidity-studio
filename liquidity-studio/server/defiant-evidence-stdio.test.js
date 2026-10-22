import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
/** Hosted build precedes contracts; invalid configuration must exit without protocol or credential output. */
test('built evidence stdio bundle fails closed without a configured credential path',async()=>{
 const result=await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[fileURLToPath(new URL('../dist/mcp/defiant-evidence-stdio.mjs',import.meta.url))],{env:{},stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';const timer=setTimeout(()=>{child.kill();reject(Error('Bundle did not terminate'));},10000);
  child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);child.on('error',error=>{clearTimeout(timer);reject(error);});child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr});});
 });
 assert.equal(result.code,1);assert.equal(result.stdout,'');assert.match(result.stderr,/Private evidence client unavailable/);assert.equal(result.stderr.includes('node_modules'),false);
});
