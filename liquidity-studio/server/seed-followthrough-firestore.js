// Explicit internal operator composition. No CLI execution or HTTP route.
import {FirestoreStore} from './cloud-store.js';
import {ScopedRepository} from './repository.js';
import {WorkspaceService} from './workspace.js';
import {DurableJobService} from './operator-jobs.js';
import {applyGuardedSeedFollowthrough} from './seed-followthrough-apply.js';
import {fail} from './auth.js';

export async function applyFirestoreSeedFollowthrough(options){
 const {store,workspace,jobs,scope}=options;
 if(!(store instanceof FirestoreStore)||!(workspace instanceof WorkspaceService)||!(jobs instanceof DurableJobService)||!(workspace.repo instanceof ScopedRepository)||workspace.store!==store||workspace.repo.store!==store||jobs.repo.store!==store||jobs.repo.key!==workspace.repo.key)throw fail(400,'Same Firestore operator composition required');
 const key=workspace.repo.key;
 // No shared store/repository patching or eager ScopedRepository constructor.
 // Context exists only while the pure synchronous SDK transaction callback runs.
 let context=null;
 const facade={
  get(item){if(context){if(item==='identity')return structuredClone(context.identity);throw fail(400,'Unexpected synchronous operator read');}return store.get(item);},
  keys(prefix){if(!context||prefix!=='')throw fail(400,'Operator inventory requires its current transaction');return [...context.keys];},
  async update(item,callback){
   if(item!==key||typeof callback!=='function')throw fail(400,'Unexpected operator mutation target');
   const result=await store.transactWithKeyInventory(['identity',key],([identity,state],keys)=>{
    if(!identity||!state)throw fail(409,'Existing operator identity and scope required; no initialization');
    if(context)throw fail(400,'Reentrant operator transaction');
    context={identity,keys};
    try{const next=callback(state);if(next?.then instanceof Function){next.catch?.(()=>{});throw fail(400,'Operator callback must be synchronous');}return [identity,next];}finally{context=null;}
   });
   return result[1];
  }
 };
 const repo=Object.assign(Object.create(Object.getPrototypeOf(workspace.repo)),workspace.repo,{store:facade,ready:Promise.resolve()});
 const scopedWorkspace=new WorkspaceService({store:facade,repo,scope:workspace.scope,identity:workspace.identity});
 const scopedJobs=new DurableJobService({repo,scope:jobs.scope,identity:jobs.identity,formatter:jobs.formatter,preparation:jobs.preparation,now:jobs.now});
 // No formatter/preparation call occurs: this only commits the existing queue.
 return applyGuardedSeedFollowthrough({...options,store:facade,workspace:scopedWorkspace,jobs:scopedJobs,scope});
}
