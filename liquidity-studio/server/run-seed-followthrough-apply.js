// Internal operator entry point. Dry-run is the default; never starts a worker.
import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import {fail} from './auth.js';
import {DurableStore} from './storage.js';
import {createPlatform} from './platform.js';
import {jobDispatcherConfiguration,dispatchJobs} from './job-dispatcher.js';
import {pristineSeedPlan,seedPlanHash} from './seed-followthrough-plan.js';
import {applyPristineSeedFollowthrough} from './seed-followthrough-apply.js';

export async function main(args){
 const names=['--database','--plan','--source-commit','--organization','--brand','--actor','--title-key','--job-key','--out'],apply=args.includes('--apply'),pairs=args.filter(arg=>arg!=='--apply');
 if(args.filter(arg=>arg==='--apply').length>1||pairs.length!==names.length*2||pairs.some((value,index)=>index%2===0&&!names.includes(value))||names.some(name=>pairs.filter(value=>value===name).length!==1))throw fail(400,'Use explicit database, reviewed plan, source commit, organization, brand, founder, title/job UUIDs and new private output; --apply is optional');
 const value=name=>pairs[pairs.indexOf(name)+1],database=value('--database'),planFile=value('--plan'),out=value('--out'),sourceCommit=value('--source-commit');
 if(![database,planFile,out].every(path.isAbsolute)||new Set([database,planFile,out]).size!==3||!fs.existsSync(database)||!fs.existsSync(planFile)||!/^[a-f0-9]{40}$/.test(sourceCommit)||!['--title-key','--job-key'].every(name=>/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value(name))))throw fail(400,'Existing absolute database/plan, distinct output, full source SHA and explicit UUIDs required');
 if(fs.existsSync(out)||!fs.existsSync(path.dirname(out))||(fs.statSync(path.dirname(out)).mode&0o777)!==0o700)throw fail(400,'Use a new output in an existing private mode0700 directory');
 const reviewed=JSON.parse(fs.readFileSync(planFile,'utf8')),plan=reviewed.plan||reviewed;
 if(plan.sourceCommit!==sourceCommit||plan.scope?.organizationId!==value('--organization')||plan.scope?.brandId!==value('--brand'))throw fail(409,'Explicit source/scope differs from reviewed plan');
 const {planSha256,...body}=plan;if(seedPlanHash(body)!==planSha256)throw fail(409,'Reviewed plan fingerprint changed');
 // Read-only preflight creates neither a repository nor identity/factory records.
 const db=new DatabaseSync(database,{readOnly:true});
 let observed;
 try{
  const get=key=>{const row=db.prepare('SELECT value FROM documents WHERE key=?').get(key);return row?JSON.parse(row.value):null;},key=`scope:${plan.scope.organizationId}:${plan.scope.brandId}`,state=get(key);
  if(!state)throw fail(404,'Existing scope required; no seed creation');
  const externalKeys=db.prepare('SELECT key FROM documents').all().map(row=>row.key).filter(item=>item!==key&&(item.includes(`:${plan.scope.organizationId}:${plan.scope.brandId}:`)||item.endsWith(`:${plan.scope.organizationId}:${plan.scope.brandId}`)));
  observed=pristineSeedPlan({identity:get('identity'),actorId:value('--actor'),scope:plan.scope,state,externalKeys,sourceCommit});
 }finally{db.close();}
 if(!apply){const result={apply:false,reviewedPlanSha256:planSha256,currentPlanSha256:observed.planSha256,exactCurrentMatch:observed.planSha256===planSha256,scope:plan.scope,rows:observed.rows.map(({storyId,disposition})=>({storyId,disposition})),meaning:'Read-only current SQLite plan; no title change, job, dispatch or approval'};fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});return result;}
 if(process.env.K_SERVICE||(process.env.STUDIO_STORAGE_MODE&&process.env.STUDIO_STORAGE_MODE!=='sqlite')||process.env.STUDIO_OPERATOR_JOBS_ENABLED!=='true'||process.env.STUDIO_SOURCE_PREPARATION_ENABLED!=='true'||jobDispatcherConfiguration().mode!=='local')throw fail(409,'Explicit existing local SQLite durable worker and source preparation configuration required');
 const store=new DurableStore(database);
 try{
  const platform=createPlatform({store});await platform.ready;
  const identity=store.get('identity'),actor=identity.users.find(user=>user.id===value('--actor'));
  if(!actor)throw fail(403,'Existing current founder required');
  const scope=await platform.identity.authorize(actor,plan.scope.organizationId,plan.scope.brandId);
  const container=await platform.forScope(scope),workspace=platform.workspace(scope,container.ports.repo),jobs=platform.operatorJobs(scope,container);
  const accepted=await applyPristineSeedFollowthrough({store,workspace,jobs,actor,scope,plan,sourceCommit,titleIdempotencyKey:value('--title-key'),jobIdempotencyKey:value('--job-key')});
  await dispatchJobs(container.ports.repo,accepted.job.id);
  const result={apply:true,planSha256,sourceCommit,scope,operationId:accepted.titleOperation.operationId,jobId:accepted.job.id,storyIds:accepted.job.items.map(item=>item.storyId),meaning:'Existing durable source-preparation job only; unreviewed output, no source or clinical approval'};
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});return result;
 }finally{store.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main(process.argv.slice(2)).then(result=>console.log(JSON.stringify(result))).catch(error=>{console.error(JSON.stringify({status:error.status||500,error:'Guarded seed operation did not complete; retain receipts and inspect current state before retry'}));process.exitCode=1;});
