import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createHash} from 'node:crypto';
import {createDefiantWorksheetCellResolver} from './defiant-worksheet-cells.js';
const sourceHash='a'.repeat(64),revision='b'.repeat(64);
const cell=(cellRef,value)=>({cellRef,type:'s',rawValue:value,value,formula:null,formulaExecuted:false});
const fixture=()=>({schemaVersion:1,organizationId:'org',sourceHash,sheet:'Rules',cells:[cell('A2','Invented rule'),{...cell('B2','3'),type:'n',formula:'SUM(A1:A2)'}]});
const setup=(data=fixture(),options={})=>{const bytes=Buffer.from(JSON.stringify(data));const object={key:'invented/worksheet.json',generation:'42',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};let opens=0;const resolver=createDefiantWorksheetCellResolver({organizationId:'org',partitions:[{sourceHash,sheet:'Rules',object}],openObject:async pin=>{opens++;assert.equal(pin.generation,'42');return {generation:'42',stream:Readable.from([bytes])};},...options});return {resolver,object,opens:()=>opens};};
const request={organizationId:'org',sourceHash,sheet:'Rules',cellRefs:['B2','A2'],revision};
test('pinned worksheet reader preserves requested order, formula text and no execution',async()=>{
 const {resolver,object}=setup();object.generation='99';const result=await resolver(request);assert.deepEqual(result.cells.map(c=>c.cellRef),['B2','A2']);assert.equal(result.cells[0].formula,'SUM(A1:A2)');assert.equal(result.cells[0].value,'3');assert.equal(result.cells[0].formulaExecuted,false);
});
test('wrong scope, source, absent or repeated cells fail without fallback',async()=>{
 const {resolver,opens}=setup();await assert.rejects(resolver({...request,organizationId:'other'}),{status:503});await assert.rejects(resolver({...request,sourceHash:revision}),{status:503});assert.equal(opens(),0);
 await assert.rejects(resolver({...request,cellRefs:['A2','A2']}),{status:503});assert.equal(opens(),0);await assert.rejects(resolver({...request,cellRefs:['C2']}),{status:503});
});
test('pinned content hash and worksheet schema violations are refused',async()=>{
 for(const mutate of [d=>d.sourceHash=revision,d=>d.sheet='Other',d=>d.organizationId='other',d=>d.cells.push(d.cells[0]),d=>d.cells[0].formulaExecuted=true,d=>d.cells[0].value='x'.repeat(4001)]){const d=fixture();mutate(d);await assert.rejects(setup(d).resolver(request),{status:503});}
 const corrupt=setup(fixture(),{openObject:async()=>({generation:'42',stream:Readable.from([Buffer.from('{}')])})});await assert.rejects(corrupt.resolver(request),{status:503});
});
test('worksheet manifest validates bounds and duplicate workbook-sheet pins',()=>{
 const bytes=Buffer.from(JSON.stringify(fixture()));const object={key:'invented',generation:'42',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};const part={sourceHash,sheet:'Rules',object};const openObject=async()=>{};
 assert.throws(()=>createDefiantWorksheetCellResolver({organizationId:'org',partitions:[part,part],openObject}),/Duplicate/);
 assert.throws(()=>createDefiantWorksheetCellResolver({organizationId:'org',partitions:Array(201).fill(part),openObject}),/Bounded/);
});
test('worksheet preserves legitimate line breaks and tabs while refusing malformed cell types',async()=>{
 const data=fixture();data.cells[0]=cell('A2','first\nsecond\tcolumn\rreturn');const result=await setup(data).resolver({...request,cellRefs:['A2']});assert.equal(result.cells[0].value,data.cells[0].value);
 for(const mutate of [d=>d.cells[0].rawValue=12,d=>d.cells[0].formula={},d=>d.cells[0].value='bad\u0000cell',d=>d.cells[0].cellRef='../A2',d=>d.cells[0].type=null]){const invalid=fixture();mutate(invalid);await assert.rejects(setup(invalid).resolver(request),{status:503});}
 assert.throws(()=>createDefiantWorksheetCellResolver({organizationId:'invalid scope',partitions:[],openObject:async()=>{}}),/scope/);
 assert.throws(()=>createDefiantWorksheetCellResolver({organizationId:'org',partitions:[]}),/opener/);
});
test('worksheet deadline destroys a stalled pinned stream and returns generic unavailable',async()=>{
 let stream;const {resolver}=setup(fixture(),{timeoutMs:10,openObject:async()=>{stream=new Readable({read(){}});return {generation:'42',stream};}});
 await assert.rejects(resolver(request),error=>error.status===503&&error.message==='Worksheet cells unavailable');assert.equal(stream.destroyed,true);
});
