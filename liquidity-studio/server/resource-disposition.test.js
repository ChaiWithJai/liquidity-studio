import test from 'node:test';
import assert from 'node:assert/strict';
import {resourceDisposition} from './resource-disposition.js';
const at='2026-10-18T12:00:00Z';
const resource={confirmation:{actorId:'planner',recordedAt:at,purpose:'Planning use',availability:'confirmed',permission:'confirmed',start:'2026-10-18T10:00:00Z',end:'2026-10-19T10:00:00Z',timeZone:'Europe/London',evidenceIds:['permission']},capabilities:['Production'],location:'London',verification:'user-reported',rights:{status:'confirmed',evidenceIds:['permission']},availability:{status:'confirmed',start:'2026-10-18T10:00:00Z',end:'2026-10-19T10:00:00Z',timeZone:'Europe/London'}};
test('planning disposition explains uncertainty, expiry and explicit denial without modifying source records',()=>{
 const original=structuredClone(resource);assert.equal(resourceDisposition(resource,at).status,'eligible');assert.deepEqual(resource,original);
 const imported={...resource,confirmation:undefined,rights:{status:'unverified',notes:'All rights cleared in free text',evidenceIds:['permission']},availability:{...resource.availability,status:'user-reported'}};
 assert.equal(resourceDisposition(imported,at).status,'needs-information');
 for(const r of [{...resource,confirmation:{...resource.confirmation,permission:'denied'}},{...resource,confirmation:{...resource.confirmation,availability:'unavailable'}},{...imported,availability:{...imported.availability,end:'2026-10-18T11:00:00Z'}}])assert.equal(resourceDisposition(r,at).status,'unavailable');
 for(const r of [{...resource,capabilities:[]},{...resource,location:''},{...resource,verification:'example'},{...resource,confirmation:{...resource.confirmation,start:'2026-10-19T09:00:00Z'}},{...resource,confirmation:{...resource.confirmation,evidenceIds:[]}}])assert.equal(resourceDisposition(r,at).status,'needs-information');
 assert.equal(resourceDisposition(resource,'invalid').status,'needs-information');
});

import {resourceConfirmation} from './defiant-resource-confirmation.js';
test('explicit manager confirmation preserves imported facts and prior reports, requires evidence, and records provenance',()=>{
 const imported={id:'resource',capabilities:['Production'],location:'London',verification:'user-reported',rights:{status:'unverified',notes:'Imported uncertainty'},availability:{status:'unknown'}},report={findings:[{resources:[structuredClone(imported)]}]},state={revision:7,resources:[structuredClone(imported)],evidence:[{id:'permission'}],reports:[report]},input={purpose:'Internal planning consultation',availability:'confirmed',permission:'confirmed',start:'2026-10-18T10:00:00Z',end:'2026-10-19T10:00:00Z',timeZone:'Europe/London',evidenceIds:['permission'],notes:'Manager reported for this use only'};
 assert.equal(resourceDisposition(imported,at).status,'needs-information');
 assert.throws(()=>resourceConfirmation(state,'resource',{...input,evidenceIds:[]},{id:'planner'},at),{status:422});assert.equal(state.resources[0].confirmation,undefined);
 const saved=resourceConfirmation(state,'resource',input,{id:'planner'},at);assert.equal(resourceDisposition(saved,at).status,'eligible');assert.equal(saved.confirmation.actorId,'planner');assert.equal(saved.confirmation.recordedAt,at);assert.equal(saved.confirmation.sourceRevision,7);assert.deepEqual(saved.rights,imported.rights);assert.deepEqual(saved.availability,imported.availability);assert.deepEqual(report.findings[0].resources[0],imported);
 resourceConfirmation(state,'resource',{...input,availability:'unavailable'},{id:'other-planner'},at);assert.equal(resourceDisposition(saved,at).status,'unavailable');assert.equal(saved.confirmationHistory[0].actorId,'planner');
 assert.throws(()=>resourceConfirmation(state,'resource',{...input,actorId:'forged'},{id:'planner'},at),{status:400});
});
