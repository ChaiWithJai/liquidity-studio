import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {createHash} from 'node:crypto';
import {configuredDefiantEvidenceProvider,loadDefiantEvidenceRuntimeConfiguration,validateDefiantEvidenceRuntimeConfiguration} from './defiant-evidence-runtime.js';
const pin=(key='snapshot')=>({key:`defiant-private/derived/invented/${key}.json`,generation:'12',bytes:12,sha256:'a'.repeat(64)});
const fixture=()=>({schemaVersion:1,organizationId:'verified_fixture_org',projectId:'liquidity-studio-pilot-261017',bucket:'liquidity-studio-pilot-261017-liquidity-assets',snapshotObject:pin(),sourcePartitions:[{sourceHash:'b'.repeat(64),firstRecord:2,lastRecord:3,object:pin('rows')}],worksheetPartitions:[{sourceHash:'c'.repeat(64),sheet:'xl/worksheets/sheet2.xml',object:pin('cells')}]});
test('disabled runtime does no filesystem or Storage work',async()=>{
 let calls=0;for(const environment of [{},{STUDIO_DEFIANT_EVIDENCE_CONFIG:''}])assert.equal(await configuredDefiantEvidenceProvider({environment,loadConfiguration:async()=>{calls++;},createStorage:async()=>{calls++;}}),null);assert.equal(calls,0);
});
test('all malformed config fails before Storage creation',async()=>{
 const mutations=[x=>x.organizationId='defiant_evidence_poc',x=>x.projectId='other-project',x=>x.bucket='other-bucket',x=>x.credentials={},x=>x.snapshotObject.generation=null,x=>x.snapshotObject.bytes=8388609,x=>x.snapshotObject.key='https://example.invalid/source',x=>x.snapshotObject.key='defiant-private/derived/../source',x=>x.snapshotObject.key='defiant-private/derived/%2e/source',x=>x.sourcePartitions.push({...x.sourcePartitions[0],object:pin('second')}),x=>x.worksheetPartitions.push({...x.worksheetPartitions[0],object:pin('second')}),x=>x.sourcePartitions[0].lastRecord=1002,x=>x.sourcePartitions[0].extra=true,x=>x.worksheetPartitions[0].sheet='../source',x=>x.sourcePartitions=Array(2001).fill(x.sourcePartitions[0])];
 let calls=0;for(const mutate of mutations){const data=fixture();mutate(data);await assert.rejects(configuredDefiantEvidenceProvider({environment:{STUDIO_DEFIANT_EVIDENCE_CONFIG:'/invented'},loadConfiguration:async()=>data,createStorage:async()=>{calls++;}}),/Invalid private evidence runtime configuration/);}assert.equal(calls,0);
});
test('validated configuration owns frozen pin copies',()=>{
 const input=fixture(),config=validateDefiantEvidenceRuntimeConfiguration(input);input.snapshotObject.generation='99';input.sourcePartitions[0].firstRecord=20;assert.equal(config.snapshotObject.generation,'12');assert.equal(config.sourcePartitions[0].firstRecord,2);assert.equal(Object.isFrozen(config.sourcePartitions[0].object),true);
});
test('descriptor reader accepts regular file and rejects symlink, oversized and malformed text',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'evidence-config-'));t.after(()=>rm(dir,{recursive:true,force:true}));const file=join(dir,'config.json');await writeFile(file,JSON.stringify(fixture()));assert.equal((await loadDefiantEvidenceRuntimeConfiguration(file)).organizationId,'verified_fixture_org');
 const link=join(dir,'link.json');await symlink(file,link);await assert.rejects(loadDefiantEvidenceRuntimeConfiguration(link),/Invalid private evidence runtime configuration/);await assert.rejects(loadDefiantEvidenceRuntimeConfiguration(dir),/Invalid private evidence runtime configuration/);
 await writeFile(file,Buffer.alloc(2*1024*1024+1,32));await assert.rejects(loadDefiantEvidenceRuntimeConfiguration(file),/Invalid private evidence runtime configuration/);await writeFile(file,Buffer.from([255]));await assert.rejects(loadDefiantEvidenceRuntimeConfiguration(file),/Invalid private evidence runtime configuration/);
});
test('configured provider uses ADC project and exact bucket/pin while wrong organization performs no reads',async()=>{
 const input=fixture(),bytes=Buffer.from(JSON.stringify({organizationId:input.organizationId,schemaVersion:1,coverage:'Invented',months:[],receipts:[]}));input.snapshotObject.bytes=bytes.length;input.snapshotObject.sha256=createHash('sha256').update(bytes).digest('hex');let reads=0;
 const provider=await configuredDefiantEvidenceProvider({environment:{STUDIO_DEFIANT_EVIDENCE_CONFIG:'/invented'},loadConfiguration:async()=>input,createStorage:async options=>{assert.deepEqual(options,{projectId:input.projectId});return {bucket:name=>{assert.equal(name,input.bucket);return {file:(key,{generation})=>{assert.equal(key,input.snapshotObject.key);assert.equal(generation,'12');return {createReadStream:options=>{reads++;assert.deepEqual(options,{validation:'crc32c',decompress:false});return Readable.from([bytes]);}};}};}};}});
 assert.equal(provider({organizationId:'other'}),null);assert.equal(reads,0);const binding=provider({organizationId:input.organizationId});assert.equal((await binding.loadSnapshot({organizationId:input.organizationId})).coverage,'Invented');assert.equal(reads,1);
});
import {startConfiguredStudio} from './index.js';
test('actual startup rejects malformed evidence configuration before every platform or listener branch',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'evidence-startup-'));t.after(()=>rm(dir,{recursive:true,force:true}));const filename=join(dir,'invalid.json');await writeFile(filename,'{}');
 const keys=['STUDIO_DEFIANT_EVIDENCE_CONFIG','STUDIO_PENPOT_MANAGED_CONFIG','STUDIO_PENPOT_ENABLED','STUDIO_DEFIANT_SYNTHETIC_DEMO_ENABLED'];const prior=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.STUDIO_DEFIANT_EVIDENCE_CONFIG=filename;process.env.STUDIO_DEFIANT_SYNTHETIC_DEMO_ENABLED='false';
  for(const branch of ['managed','plain','local']){
   delete process.env.STUDIO_PENPOT_MANAGED_CONFIG;process.env.STUDIO_PENPOT_ENABLED=branch==='local'?'true':'false';
   if(branch==='managed')process.env.STUDIO_PENPOT_MANAGED_CONFIG='/never-read-managed-config.json';
   await assert.rejects(startConfiguredStudio({port:0}),{message:'Invalid private evidence runtime configuration'});
  }
 }finally{for(const key of keys)if(prior[key]===undefined)delete process.env[key];else process.env[key]=prior[key];}
});
