// Explicit planning records. Source observations and geographic facts are never edited here.
import {randomUUID} from 'node:crypto';
import {fail} from './auth.js';
const clone=x=>structuredClone(x);
export function exact(body,keys){if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!keys.includes(k)))throw fail(400,'Unsupported planning fields');}
function text(value,name,max=4000){if(typeof value!=='string'||!value.trim()||value.length>max)throw fail(422,`Invalid ${name}`);return value.trim();}
function ids(value=[],limit=64){if(!Array.isArray(value)||value.length>limit||value.some(x=>typeof x!=='string'||!x||x.length>128)||new Set(value).size!==value.length)throw fail(422,'Invalid finding selection');return [...value];}
const item=(state,id)=>[...state.graph.nodes,...state.graph.edges,...state.graph.clusters].find(x=>x.id===id);
function requireItem(state,id){const found=item(state,id);if(!found)throw fail(409,'A selected finding is unavailable; keep your working text');return found;}
function pathTarget(state,source){if(source?.kind==='cluster'){exact(source,['kind','id']);const cluster=state.graph.clusters.find(c=>c.id===source.id);if(!cluster)throw fail(409,'Working group is unavailable');return {kind:'cluster',id:cluster.id};}exact(source,['kind','edgeIds']);if(source.kind!=='path')throw fail(422,'Unsupported annotation target');const edgeIds=ids(source.edgeIds,16);if(!edgeIds.length)throw fail(422,'Choose a nonempty path');const edges=edgeIds.map(id=>{const edge=state.graph.edges.find(e=>e.id===id);if(!edge)throw fail(409,'A path edge is unavailable');return edge;});for(let i=1;i<edges.length;i++)if(edges[i-1].to!==edges[i].from)throw fail(422,'Selected route edges must form a continuous directed path');return {kind:'path',edgeIds};}
export function annotationRecord(state,input,actor,at){
 exact(input,['id','targetId','target','text','kind','labels','evidenceIds']);
 if(Boolean(input.targetId)===Boolean(input.target))throw fail(422,'Choose one annotation target');
 const target=input.target?pathTarget(state,input.target):{kind:state.graph.clusters.some(c=>c.id===input.targetId)?'cluster':state.graph.edges.some(e=>e.id===input.targetId)?'edge':'node',id:requireItem(state,input.targetId).id};
 if(!['note','question','hypothesis','decision'].includes(input.kind))throw fail(422,'Choose a note, question, hypothesis or decision');
 const evidenceIds=ids(input.evidenceIds);for(const id of evidenceIds)if(!state.evidence.some(e=>e.id===id))throw fail(409,'Annotation evidence is unavailable');
 const old=input.id?state.annotations.find(a=>a.id===input.id):null;if(input.id&&!old)throw fail(404,'Saved annotation is unavailable');
 if(!old&&state.annotations.length>=256)throw fail(429,'Annotation capacity reached');
 return {id:old?.id||randomUUID(),target,...(target.id?{targetId:target.id}:{}),text:text(input.text,'annotation',6000),kind:input.kind,labels:ids(input.labels,20),evidenceIds,sourceRevision:state.revision,revision:(old?.revision||0)+1,authorId:old?.authorId||actor.id,updatedBy:actor.id,createdAt:old?.createdAt||at,updatedAt:at};
}
export function viewRecord(state,input,actor,at){
 exact(input,['id','name','focus','selected','planIds','positions','filters','routeEdgeIds']);
 for(const k of ['focus','selected'])if(input[k])requireItem(state,input[k]);const planIds=ids(input.planIds);planIds.forEach(id=>requireItem(state,id));
 const routeEdgeIds=input.routeEdgeIds===undefined||Array.isArray(input.routeEdgeIds)&&input.routeEdgeIds.length===0?[]:pathTarget(state,{kind:'path',edgeIds:input.routeEdgeIds}).edgeIds;
 const positions=Object.create(null);if(input.positions!==undefined){exact(input.positions,state.graph.nodes.map(n=>n.id));for(const [id,p]of Object.entries(input.positions)){exact(p,['x','y']);if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>10000||Math.abs(p.y)>10000)throw fail(422,'Invalid view position');positions[id]={x:p.x,y:p.y};}}
 const filters=input.filters||{};exact(filters,['kinds','showExamples','query']);if(filters.query!==undefined&&(typeof filters.query!=='string'||filters.query.length>200))throw fail(422,'Invalid saved search');if(filters.showExamples!==undefined&&typeof filters.showExamples!=='boolean')throw fail(422,'Invalid example filter');const kinds=ids(filters.kinds,12);if(kinds.some(k=>!['region','artist','signal','person','resource','format','catalog','external','route'].includes(k)))throw fail(422,'Invalid graph filter');
 const old=input.id?state.views.find(v=>v.id===input.id):null;if(input.id&&!old)throw fail(404,'Saved view unavailable');if(!old&&state.views.length>=64)throw fail(429,'Saved-view capacity reached');
 return {id:old?.id||randomUUID(),name:text(input.name,'view name',200),focus:input.focus||'',selected:input.selected||'',planIds,positions,routeEdgeIds,filters:{kinds,showExamples:filters.showExamples!==false,...(filters.query?.trim()?{query:filters.query.trim()}:{})},revision:(old?.revision||0)+1,sourceRevision:state.revision,authorId:old?.authorId||actor.id,updatedBy:actor.id,createdAt:old?.createdAt||at,updatedAt:at};
}
function draftText(value,name,max){if(typeof value!=='string'||value.length>max)throw fail(422,`Invalid ${name}`);return value.trim();}
function sections(value={}){exact(value,['routes','partners','nextActions','openQuestions']);return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,draftText(v,k,6000)]));}
function reportSnapshot(state,input){
 const planIds=ids(input.planIds);if(!planIds.length)throw fail(422,'Choose at least one finding for the report');planIds.forEach(id=>requireItem(state,id));
 const chosen=input.annotationIds===undefined?state.annotations.filter(a=>a.targetId?planIds.includes(a.targetId):a.target.kind==='path'&&a.target.edgeIds.some(id=>planIds.includes(id))):ids(input.annotationIds).map(id=>{const a=state.annotations.find(a=>a.id===id);if(!a)throw fail(409,'Report annotation is unavailable');return a;});if(chosen.length>64)throw fail(422,'Select at most64 report annotations');
 const view=input.viewId?state.views.find(v=>v.id===input.viewId):null;if(input.viewId&&!view)throw fail(409,'Report view is unavailable');
 const findings=planIds.map(id=>{const n=requireItem(state,id),members=n.kind==='cluster'?n.nodeIds.map(nodeId=>requireItem(state,nodeId)):[],memberIds=new Set([id,...members.map(m=>m.id)]),notes=chosen.filter(a=>a.targetId===id||a.target.kind==='path'&&a.target.edgeIds.includes(id)),observations=state.observations.filter(o=>memberIds.has(o.nodeId)),resources=state.resources.filter(r=>memberIds.has(r.nodeId)),evidenceIds=new Set([...(n.evidenceIds||[]),...members.flatMap(m=>m.evidenceIds||[]),...notes.flatMap(a=>a.evidenceIds),...observations.map(o=>o.evidenceId),...resources.flatMap(r=>r.rights?.evidenceIds||[])]);return {id:n.id,name:n.name,kind:n.kind,description:n.description||n.profile||n.subtitle||'',verification:n.verification,record:clone(n),...(n.kind==='cluster'?{members:clone(members)}:{}),notes:clone(notes),evidence:clone(state.evidence.filter(e=>evidenceIds.has(e.id))),observations:clone(observations),resources:clone(resources)};});
 return {planIds,annotationIds:chosen.map(a=>a.id),annotations:clone(chosen),annotationEvidence:clone(state.evidence.filter(e=>chosen.some(a=>a.evidenceIds.includes(e.id)))),viewId:view?.id||null,viewRevision:view?.revision||null,view:clone(view),sourceRevision:state.revision,findings};
}
export function reportRecord(state,input,actor,at,{refreshId}={}){
 exact(input,refreshId?['expectedReportRevision','planIds','annotationIds','viewId']:['id','expectedReportRevision','title','thesis','planIds','annotationIds','viewId','sections']);
 const oldId=refreshId||input.id,old=oldId?state.reports.find(r=>r.id===oldId):null;if(oldId&&!old)throw fail(404,'Saved report is unavailable');
 if(old&&(input.expectedReportRevision!==old.revision))throw fail(409,'Report changed; compare before saving your text');if(!old&&input.expectedReportRevision!==undefined)throw fail(400,'New report has no previous revision');
 if(!old&&state.reports.length>=32)throw fail(429,'Report capacity reached');if(old?.history.length>=16)throw fail(429,'Report history capacity reached; prior snapshots are preserved');
 let snapshot;if(!old||refreshId)snapshot=reportSnapshot(state,input);else{if(input.planIds!==undefined&&JSON.stringify(input.planIds)!==JSON.stringify(old.planIds)||input.annotationIds!==undefined&&JSON.stringify(input.annotationIds)!==JSON.stringify(old.annotationIds)||input.viewId!==undefined&&input.viewId!==old.viewId)throw fail(409,'Use explicit Refresh from selection to change saved findings');snapshot=Object.fromEntries(['planIds','annotationIds','annotations','annotationEvidence','viewId','viewRevision','view','sourceRevision','findings'].map(k=>[k,clone(old[k])]));}
 const history=old?clone(old.history):[];if(old){const {history:_,...previous}=old;history.push(clone(previous));}
 return {id:old?.id||randomUUID(),title:refreshId?old.title:text(input.title,'report title',300),thesis:refreshId?old.thesis:draftText(input.thesis,'report thesis',12000),sections:refreshId||old&&input.sections===undefined?clone(old.sections):sections(input.sections),...snapshot,revision:(old?.revision||0)+1,authorId:old?.authorId||actor.id,updatedBy:actor.id,createdAt:old?.createdAt||at,updatedAt:at,history};
}

export function clusterRecord(state,input,actor,at){
 exact(input,['id','name','nodeIds']);const nodeIds=ids(input.nodeIds);if(!nodeIds.length)throw fail(422,'Choose at least one node for the working group');
 for(const id of nodeIds)if(!state.graph.nodes.some(n=>n.id===id))throw fail(409,'A working group member is unavailable');
 const old=input.id?state.graph.clusters.find(c=>c.id===input.id):null;if(input.id&&!old)throw fail(404,'Working group is unavailable');if(!old&&state.graph.clusters.length>=64)throw fail(429,'Working group capacity reached');
 return {id:old?.id||randomUUID(),kind:'cluster',verification:'working-selection',name:text(input.name,'working group name',200),nodeIds,revision:(old?.revision||0)+1,sourceRevision:state.revision,authorId:old?.authorId||actor.id,updatedBy:actor.id,createdAt:old?.createdAt||at,updatedAt:at};
}
