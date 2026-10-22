import {createDefiantEvidenceLoader} from './defiant-evidence-loader.js';
const unavailable=()=>Object.assign(new Error('Worksheet cells unavailable'),{status:503});
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const text=(v,max)=>typeof v==='string'&&v.length<=max&&!/[\u0000-\u001f\u007f]/.test(v);
const cellText=(v,max)=>typeof v==='string'&&v.length<=max&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v);
const ref=v=>typeof v==='string'&&/^[A-Z]{1,3}[1-9]\d{0,6}$/.test(v);
/** Decode an already extracted cell. Formula text is evidence, never executable code. */
export function normalizeWorksheetCell(cell){
 if(!cell||!ref(cell.cellRef)||!text(cell.type,32)||!cellText(cell.value,4000)||!(cell.rawValue===null||cellText(cell.rawValue,4000))||!(cell.formula===null||cellText(cell.formula,4000))||cell.formulaExecuted!==false)throw unavailable();
 return {cellRef:cell.cellRef,type:cell.type,rawValue:cell.rawValue,value:cell.value,formula:cell.formula,formulaExecuted:false};
}
/** Host-owned workbook/sheet pins. No path, generation or hash is accepted from tool callers. */
export function createDefiantWorksheetCellResolver({organizationId,partitions,openObject,timeoutMs=15000}={}){
 if(typeof organizationId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(organizationId)||typeof openObject!=='function')throw new TypeError('Worksheet scope and opener required');
 if(!Array.isArray(partitions)||partitions.length>200||!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>30000)throw new TypeError('Bounded worksheet partitions and deadline required');
 const keys=new Set();
 const entries=partitions.map(part=>{
  if(!part||!hash(part.sourceHash)||!text(part.sheet,128)||!part.sheet)throw new TypeError('Invalid worksheet partition');
  const key=JSON.stringify([part.sourceHash,part.sheet]);if(keys.has(key))throw new TypeError('Duplicate worksheet partition');keys.add(key);
  return Object.freeze({sourceHash:part.sourceHash,sheet:part.sheet,load:createDefiantEvidenceLoader({organizationId,object:part.object,openObject})});
 });
 return async request=>{
  if(request?.organizationId!==organizationId||!hash(request.revision)||!hash(request.sourceHash)||!Array.isArray(request.cellRefs)||request.cellRefs.length>40||request.cellRefs.some(v=>!ref(v))||new Set(request.cellRefs).size!==request.cellRefs.length)throw unavailable();
  const wanted=[...request.cellRefs];const part=entries.find(row=>row.sourceHash===request.sourceHash&&row.sheet===request.sheet);if(!part)throw unavailable();
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
   const data=await part.load({organizationId},{signal:controller.signal});
   if(controller.signal.aborted||data.sourceHash!==part.sourceHash||data.sheet!==part.sheet||!Array.isArray(data.cells)||data.cells.length>1000)throw unavailable();
   const cells=new Map();for(const raw of data.cells){const cell=normalizeWorksheetCell(raw);if(cells.has(cell.cellRef))throw unavailable();cells.set(cell.cellRef,cell);}
   if(wanted.some(key=>!cells.has(key)))throw unavailable();
   return {sourceHash:part.sourceHash,sheet:part.sheet,cells:wanted.map(key=>structuredClone(cells.get(key)))};
  }catch{throw unavailable();}finally{clearTimeout(timer);}
 };
}
