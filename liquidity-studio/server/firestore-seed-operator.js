// Internal operator files only. No HTTP route, worker, provisioning or login.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {fail,IdentityService} from './auth.js';
import {ScopedRepository,scopeKey} from './repository.js';
import {WorkspaceService} from './workspace.js';
import {DurableJobService} from './operator-jobs.js';
import {createCloudStore} from './cloud-store.js';
import {pristineSeedPlan,plannedSeedQueueIds,seedPlanHash} from './seed-followthrough-plan.js';
import {applyFirestoreSeedFollowthrough} from './seed-followthrough-firestore.js';
import {jobDispatcherConfiguration,dispatchJobs} from './job-dispatcher.js';
const appRoot=fileURLToPath(new URL('../',import.meta.url));
const hex=/^[a-f0-9]{64}$/,sha=value=>createHash('sha256').update(value).digest('hex');
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,128}$/.test(value);
const same=(a,b)=>{if(seedPlanHash(a)!==seedPlanHash(b))throw fail(409,'Operator binding changed; preserve intent and review current state');};
const common=['--project','--database','--collection','--bucket','--organization','--brand','--actor','--source-commit','--source-manifest','--source-manifest-sha256','--out'];
const applyOnly=['--plan','--plan-sha256','--title-key','--job-key','--intent'];
function privatePath(value,existing){
 if(!path.isAbsolute(value)||path.normalize(value)!==value||fs.realpathSync(path.dirname(value))!==path.dirname(value)||(fs.statSync(path.dirname(value)).mode&0o777)!==0o700)throw fail(400,'Exact private mode0700 directory required');
 if(existing){const stat=fs.lstatSync(value);if(!stat.isFile()||stat.isSymbolicLink()||(stat.mode&0o777)!==0o600)throw fail(400,'Private regular mode0600 input required');}
 else if(fs.existsSync(value))throw fail(409,'Preserve previous output; select a new path');
 return value;
}
function readJson(file,digest,max){privatePath(file,true);if(!hex.test(digest)||fs.statSync(file).size>max)throw fail(400,'Bounded input and exact SHA required');const bytes=fs.readFileSync(file);if(sha(bytes)!==digest)throw fail(409,'Operator file hash changed');return JSON.parse(bytes);}
function durable(file,value,replace=false){
 const target=replace?`${file}.${randomUUID()}.tmp`:file;let fd;
 try{fd=fs.openSync(target,'wx',0o600);fs.writeFileSync(fd,JSON.stringify(value,null,2)+'\n');fs.fsyncSync(fd);}finally{if(fd!==undefined)fs.closeSync(fd);}
 if(replace)fs.renameSync(target,file);
 const directory=fs.openSync(path.dirname(file),'r');try{fs.fsyncSync(directory);}finally{fs.closeSync(directory);}
}
function filesAt(root,relative='server'){
 return fs.readdirSync(path.join(root,relative),{withFileTypes:true}).flatMap(entry=>{const name=`${relative}/${entry.name}`;if(entry.isSymbolicLink())throw fail(400,'Source inventory cannot contain symlinks');if(entry.isDirectory())return filesAt(root,name);if(!entry.isFile())throw fail(400,'Source inventory requires regular files');return [name];});
}
function verifySource(manifest,sourceCommit,target,root){
 if(manifest?.schemaVersion!==1||manifest.sourceCommit!==sourceCommit||!Array.isArray(manifest.files)||manifest.files.length>512)throw fail(409,'Exact bounded source manifest required');same(manifest.target,target);
 const expected=[...filesAt(root),'package.json','package-lock.json'].sort(),actual=manifest.files.map(file=>file.path).sort();same(actual,expected);
 for(const file of manifest.files){if(Object.keys(file).sort().join('|')!=='path|sha256'||!hex.test(file.sha256)||fs.realpathSync(path.join(root,file.path))!==path.join(root,file.path)||sha(fs.readFileSync(path.join(root,file.path)))!==file.sha256)throw fail(409,'Executing source differs from reviewed manifest');}
}
export function operatorArguments(args,mode,{env=process.env,root=appRoot}={}){
 const applying=mode==='apply'&&args.includes('--apply'),names=[...common,...(mode==='apply'?applyOnly:[])],pairs=args.filter(value=>value!=='--apply');
 if(args.filter(value=>value==='--apply').length>(mode==='apply'?1:0)||pairs.length!==names.length*2||pairs.some((value,index)=>index%2===0&&!names.includes(value))||names.some(name=>pairs.filter(value=>value===name).length!==1))throw fail(400,'Explicit operator target, scope, source and private paths required');
 const get=name=>{const index=pairs.indexOf(name);return index<0?undefined:pairs[index+1];},target={projectId:get('--project'),databaseId:get('--database'),collection:get('--collection'),bucketName:get('--bucket')};
 if(!/^[a-z][a-z0-9-]{4,62}$/.test(target.projectId)||(target.databaseId!=='(default)'&&!id(target.databaseId))||!id(target.collection)||!/^[a-z0-9][a-z0-9._-]{1,220}[a-z0-9]$/.test(target.bucketName)||!['--organization','--brand','--actor'].every(name=>id(get(name)))||!/^[a-f0-9]{40}$/.test(get('--source-commit')))throw fail(400,'Invalid explicit operator target');
 if(env.STUDIO_STORAGE_MODE!=='firestore')throw fail(409,'Existing Firestore runtime configuration required');
 same(target,{projectId:env.GOOGLE_CLOUD_PROJECT,databaseId:env.STUDIO_FIRESTORE_DATABASE,collection:env.STUDIO_FIRESTORE_COLLECTION,bucketName:env.STUDIO_ASSET_BUCKET||env.STUDIO_GCS_BUCKET});
 const out=privatePath(get('--out'),false),sourceFile=privatePath(get('--source-manifest'),true),manifest=readJson(sourceFile,get('--source-manifest-sha256'),256*1024);
 verifySource(manifest,get('--source-commit'),target,fs.realpathSync(root));
 let plan,intent;
 if(mode==='apply'){
  plan=readJson(get('--plan'),get('--plan-sha256'),1024*1024);plan=plan.plan||plan;
  same(plan.sourceCommit,get('--source-commit'));same(plan.scope.organizationId,get('--organization'));same(plan.scope.brandId,get('--brand'));
  const {planSha256,...body}=plan;same(seedPlanHash(body),planSha256);
  if(!['--title-key','--job-key'].every(name=>/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(get(name)))||get('--title-key')===get('--job-key'))throw fail(400,'Two distinct stable operation UUIDs required');
  intent=get('--intent');privatePath(intent,fs.existsSync(intent));
  if(new Set([out,sourceFile,get('--plan'),intent]).size!==4)throw fail(400,'Distinct private files required');
 }else if(out===sourceFile)throw fail(400,'Distinct private files required');
 return {get,target,out,manifest,plan,intent,applying,sourceCommit:get('--source-commit'),actorId:get('--actor'),scope:{organizationId:get('--organization'),brandId:get('--brand')}};
}
export async function currentFirestoreSeedPlan(store,config){
 const key=scopeKey(config.scope);
 return store.inspectWithKeyInventory(['identity',key],([identity,state],keys)=>{
  const org=identity?.organizations?.find(row=>row.id===config.scope.organizationId),brand=org?.brands?.find(row=>row.id===config.scope.brandId);
  if(!state||!brand)throw fail(404,'Existing scope required; no initialization');
  const scope={...config.scope,preset:brand.preset},externalKeys=keys.filter(item=>item!==key&&(item.includes(`:${scope.organizationId}:${scope.brandId}:`)||item.endsWith(`:${scope.organizationId}:${scope.brandId}`)));
  const plan=pristineSeedPlan({identity,actorId:config.actorId,scope,state,externalKeys,sourceCommit:config.sourceCommit});
  return {plan,queueIntersection:plannedSeedQueueIds(plan,state,scope),inventoryCount:keys.length,meaning:'Read-only Firestore snapshot, potentially historical; apply rechecks live transaction. No changes, jobs or approval.'};
 });
}
function existingAssembly(store,scope){
 const identity=Object.assign(Object.create(IdentityService.prototype),{store,ready:Promise.resolve()});
 const repo=Object.assign(Object.create(ScopedRepository.prototype),{store,scope,key:scopeKey(scope),ready:Promise.resolve()});
 const workspace=new WorkspaceService({store,identity,repo,scope}),jobs=new DurableJobService({repo,identity,scope});
 return {identity,repo,workspace,jobs};
}
function cloudConfiguration(config,env){
 if(env.STUDIO_OPERATOR_JOBS_ENABLED!=='true'||env.STUDIO_SOURCE_PREPARATION_ENABLED!=='true')throw fail(409,'Existing jobs and source preparation must be enabled');
 const dispatcher=jobDispatcherConfiguration(env);if(dispatcher.mode!=='cloud-tasks')throw fail(409,'Existing Cloud Tasks dispatcher required');same(dispatcher,config.manifest.dispatcher);
 if(!dispatcher.scopes.some(scope=>scope.organizationId===config.scope.organizationId&&scope.brandId===config.scope.brandId))throw fail(403,'Scope is not configured for delivery');
 return dispatcher;
}
export async function runFirestoreSeedOperator(args,mode,{env=process.env,root=appRoot,createStore=createCloudStore,dispatch=dispatchJobs}={}){
 const config=operatorArguments(args,mode,{env,root});
 const binding={schemaVersion:1,purpose:'firestore-seed-followthrough',target:config.target,sourceCommit:config.sourceCommit,sourceManifestSha256:config.get('--source-manifest-sha256'),scope:config.scope,actorId:config.actorId,planSha256:config.plan?.planSha256||null,titleKey:config.get('--title-key'),jobKey:config.get('--job-key')};
 let intent;
 if(config.applying){
  cloudConfiguration(config,env);
  if(fs.existsSync(config.intent)){if(fs.statSync(config.intent).size>65536)throw fail(400,'Intent exceeds private receipt bound');intent=JSON.parse(fs.readFileSync(config.intent,'utf8'));same(intent.binding,binding);if(!['prepared','apply-unknown','accepted','dispatch-unknown','dispatched'].includes(intent.stage))throw fail(409,'Unknown intent stage');}
  else{intent={binding,stage:'prepared'};durable(config.intent,intent);} // BEFORE SDK construction or apply.
 }
 const store=await createStore(config.target);
 try{
  if(mode==='plan'){const result=await currentFirestoreSeedPlan(store,config);durable(config.out,result);return {readOnly:true,planSha256:result.plan.planSha256,rows:result.plan.rows.map(({storyId,disposition})=>({storyId,disposition}))};}
  if(!config.applying){const observed=await currentFirestoreSeedPlan(store,config),result={apply:false,exactCurrentMatch:observed.plan.planSha256===config.plan.planSha256,currentPlanSha256:observed.plan.planSha256,reviewedPlanSha256:config.plan.planSha256,rows:observed.plan.rows.map(({storyId,disposition})=>({storyId,disposition}))};durable(config.out,result);return result;}
  const scope=config.plan.scope,assembly=existingAssembly(store,scope);
  let accepted;
  try{
   const current=await store.get('identity'),actor=current?.users?.find(row=>row.id===config.actorId);
   if(!actor||actor.role!=='founder')throw fail(403,'Current existing founder required');
   accepted=await applyFirestoreSeedFollowthrough({...assembly,store,actor,scope,plan:config.plan,sourceCommit:config.sourceCommit,titleIdempotencyKey:binding.titleKey,jobIdempotencyKey:binding.jobKey});
   intent={binding,stage:'accepted',operationId:accepted.titleOperation.operationId,jobId:accepted.job.id};durable(config.intent,intent,true); // BEFORE Cloud Tasks.
  }catch(error){if(intent.stage!=='accepted'&&intent.stage!=='dispatch-unknown'&&intent.stage!=='dispatched'){intent={...intent,stage:'apply-unknown'};durable(config.intent,intent,true);}throw error;}
  try{
   cloudConfiguration(config,env);
   const current=await store.get('identity'),actor=current?.users?.find(row=>row.id===config.actorId);
   if(!actor||actor.role!=='founder')throw fail(403,'Current founder required before delivery');
   await assembly.identity.authorize(actor,scope.organizationId,scope.brandId);
   const state=await assembly.repo.read(),job=state.operatorJobs?.find(row=>row.id===intent.jobId),receipt=state.workspace?.receipts?.find(row=>row.idempotencyKey===binding.titleKey)?.seedFollowthrough;
   if(!job||job.actorId!==actor.id||job.purpose!=='source-preparation'||!receipt||job.items.length!==receipt.items.length||job.items.some(item=>!receipt.items.some(expected=>expected.storyId===item.storyId&&expected.storyRevision===item.storyRevision&&expected.inputFingerprint===item.inputFingerprint)))throw fail(409,'Accepted source job differs from its reviewed receipt');
   const delivery=await dispatch(assembly.repo,intent.jobId);
   if(delivery?.error)throw fail(503,'Dispatcher reported uncertain delivery; retain the accepted job');
   const delivered=(await assembly.repo.read()).operatorJobs?.find(row=>row.id===intent.jobId);
   if(!delivered||!['delivered','worker_received'].includes(delivered.outbox?.state))throw fail(503,'Persisted delivery acknowledgement unavailable; retain the accepted job');
   intent={...intent,stage:'dispatched'};durable(config.intent,intent,true);
  }catch(error){intent={...intent,stage:'dispatch-unknown'};durable(config.intent,intent,true);throw error;}
  const result={apply:true,sourceCommit:config.sourceCommit,planSha256:config.plan.planSha256,scope,operationId:intent.operationId,jobId:intent.jobId,meaning:'Existing source-preparation job delivered; output unreviewed, no source/clinical approval'};durable(config.out,result);return result;
 }finally{await store.close();}
}
