import {fail} from './auth.js';
import {exact} from './defiant-strategy-notes.js';
export function resourceConfirmation(state,resourceId,input,actor,at){
 exact(input,['purpose','availability','permission','start','end','timeZone','evidenceIds','notes']);
 const resource=state.resources.find(r=>r.id===resourceId);if(!resource)throw fail(404,'Resource unavailable');
 const node=state.graph.nodes.find(n=>n.id===resource.nodeId);if(!node)throw fail(404,'Resource reference unavailable');
 if(resource.verification==='example'||node.verification==='example')throw fail(422,'Import an owned resource before confirming planning details; sample references cannot become usable supply');
 if(!['confirmed','unknown','unavailable'].includes(input.availability)||!['confirmed','unknown','denied'].includes(input.permission))throw fail(422,'Choose availability and reported permission');
 if(typeof input.purpose!=='string'||!input.purpose.trim()||input.purpose.length>500||typeof input.notes!=='string'||input.notes.length>2000)throw fail(422,'Describe the proposed use and notes');
 const ids=input.evidenceIds;if(!Array.isArray(ids)||ids.length>64||new Set(ids).size!==ids.length||ids.some(id=>!state.evidence.some(e=>e.id===id)))throw fail(422,'Choose existing supporting evidence');
 if(input.permission==='confirmed'&&!ids.length)throw fail(422,'Reported permission needs supporting evidence');
 if(typeof input.start!=='string'||typeof input.end!=='string'||typeof input.timeZone!=='string'||input.start.length>80||input.end.length>80||input.timeZone.length>80)throw fail(422,'Use a dated availability window');
 if(input.availability==='confirmed'){if(!/(?:Z|[+-]\d{2}:\d{2})$/.test(input.start)||!/(?:Z|[+-]\d{2}:\d{2})$/.test(input.end)||!Number.isFinite(Date.parse(input.start))||!Number.isFinite(Date.parse(input.end))||Date.parse(input.start)>=Date.parse(input.end))throw fail(422,'Availability needs a valid start and end');try{new Intl.DateTimeFormat('en',{timeZone:input.timeZone});}catch{throw fail(422,'Choose a valid time zone');}}
 if((resource.confirmationHistory||[]).length>=16)throw fail(429,'Resource confirmation history capacity reached');
 const confirmation={purpose:input.purpose.trim(),availability:input.availability,permission:input.permission,start:input.start,end:input.end,timeZone:input.timeZone,evidenceIds:[...ids],notes:input.notes.trim(),actorId:actor.id,recordedAt:at,sourceRevision:state.revision,revision:(resource.confirmation?.revision||0)+1,method:'manager-reported'};
 resource.confirmationHistory=[...(resource.confirmationHistory||[]),...(resource.confirmation?[structuredClone(resource.confirmation)]:[])];resource.confirmation=confirmation;return resource;
}
