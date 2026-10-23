import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
const sourceHash='a'.repeat(64);
function snapshot(){return {schemaVersion:1,organizationId:'invented',coverage:'Invented contract only',months:[],receipts:[],selections:[],retainedSourceRegister:{schemaVersion:1,scopeDescription:'Invented file only',capturedAt:'2026-01-02T03:04:05Z',provenance:{manifestSha256:'d'.repeat(64),memberInventorySha256:'e'.repeat(64)},roots:[{id:'root',sourceId:'invented',filename:'invented.csv',format:'csv',bytes:20,sha256:sourceHash,generation:'123',retentionVerification:{size:true,crc32c:true,md5:null},memberInventory:{status:'not-enumerated',scope:'Not an archive'},periods:[]}],members:[]}};}
test('HTTP resource distinguishes absent register, registered without references, unknown source, stale revision and invalid old-resource filters',async()=>{
 let loads=0,allowed=true,raw=snapshot();const service=createDefiantEvidenceService({organizationId:'invented',authorize:()=>allowed,loadSnapshot:async()=>{loads++;return raw;}});
 const call=async(resource,query={},method='GET')=>defiantEvidenceRequest({service,user:'actor',route:'/api/studio/defiant-evidence/invented/'+resource,method,url:new URL('https://fixture.invalid/?'+new URLSearchParams(query))});
 let manifest=await call('manifest');const empty=await call('source-evidence',{sourceHash,revision:manifest.revision});assert.equal(empty.availability,true);assert.equal(empty.reason,'no-supported-evidence-reference');assert.equal(empty.total,0);
 await assert.rejects(call('source-evidence',{sourceHash:'c'.repeat(64),revision:manifest.revision}),{status:404});await assert.rejects(call('source-evidence',{sourceHash,revision:'f'.repeat(64)}),{status:409});
 const before=loads;await assert.rejects(call('earnings',{sourceHash}),{status:400});await assert.rejects(call('source-evidence',{sourceHash,revision:manifest.revision},'POST'),{status:405});assert.equal(loads,before);
 delete raw.retainedSourceRegister;manifest=await call('manifest');const unavailable=await call('source-evidence',{sourceHash,revision:manifest.revision});assert.equal(unavailable.availability,false);assert.equal(unavailable.total,null);
 allowed=false;const deniedAt=loads;await assert.rejects(call('source-evidence',{sourceHash,revision:manifest.revision}),{status:403});assert.equal(loads,deniedAt);
});
