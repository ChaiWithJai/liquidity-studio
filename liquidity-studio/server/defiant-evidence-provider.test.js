import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {Readable} from 'node:stream';
import {createHash} from 'node:crypto';
import {createDefiantEvidenceProvider} from './defiant-evidence-provider.js';

test('provider binds immutable pins to one organization without I/O for other scopes', async()=>{
 const organizationId='invented_org', sourceHash='a'.repeat(64);
 const snapshot=Buffer.from(JSON.stringify({organizationId, schemaVersion:1, coverage:'Invented provider fixture', months:[], receipts:[]}));
 const cells=Buffer.from(JSON.stringify({organizationId,sourceHash,receipts:[{id:'r_2',member:'invented.csv',record:2,sourceHash,cells:{title:'invented',amount:'1.25'}}]}));
 const pin=(key,bytes)=>({key,generation:'123',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 const snapshotObject=pin('snapshot',snapshot), part={sourceHash,firstRecord:2,lastRecord:2,object:pin('cells',cells)};
 const opened=[];
 const bucket={file(key,options){opened.push({key,options});return {createReadStream(options){assert.deepEqual(options,{validation:'crc32c',decompress:false});return Readable.from([key==='snapshot'?snapshot:cells]);}};}};
 const provider=createDefiantEvidenceProvider({organizationId,bucket,snapshotObject,sourcePartitions:[part]});
 assert.equal(provider({organizationId:'other'}),null);assert.equal(provider(),null);assert.equal(opened.length,0);
 snapshotObject.key='changed';snapshotObject.generation='456';part.object.key='changed';part.firstRecord=999;
 const binding=provider({organizationId});assert.ok(Object.isFrozen(binding));
 assert.equal((await binding.loadSnapshot({organizationId})).organizationId,organizationId);
 const rows=await binding.loadSourceRecords({organizationId,sourceHash,revision:'b'.repeat(64),sourceRecords:[2]});
 assert.deepEqual(rows[0].cells,{title:'invented',amount:'1.25'});
 assert.deepEqual(opened,[{key:'snapshot',options:{generation:'123'}},{key:'cells',options:{generation:'123'}}]);
 const service=createDefiantEvidenceService({organizationId,authorize:async actor=>actor==='fixture-actor',...binding});
 const result=await service.read('fixture-actor',{resource:'manifest'});assert.equal(result.scope.organizationId,organizationId);
 const count=opened.length;await assert.rejects(()=>service.read('denied',{resource:'manifest'}),error=>error.status===403);assert.equal(opened.length,count);
});

test('provider refuses unverified pins at construction',()=>{
 const bucket={file(){throw Error('must not access storage');}};
 assert.throws(()=>createDefiantEvidenceProvider({organizationId:'invented',bucket,snapshotObject:{generation:null},sourcePartitions:[]}),/Pinned bounded/);
});
