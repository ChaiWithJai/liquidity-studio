import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {FirestoreStore} from './cloud-store.js';
import {createPlatform} from './platform.js';
import {pristineSeedPlan} from './seed-followthrough-plan.js';
import {applyFirestoreSeedFollowthrough} from './seed-followthrough-firestore.js';
const host=process.env.FIRESTORE_EMULATOR_HOST;
if(host&&!/^(127\.0\.0\.1|localhost):\d+$/.test(host))throw new Error('Only loopback emulator permitted');
const opts={skip:!host,timeout:120000};
async function stores(t){const {Firestore}=await import('@google-cloud/firestore'),collection=`seed_${randomUUID().replaceAll('-','')}`, clients=[0,1].map(()=>new Firestore({projectId:'liquidity-emulator-contract'})),all=clients.map(firestore=>new FirestoreStore({firestore,collection}));t.after(async()=>{await Promise.all(clients.map(client=>client.terminate()));});return all;}
async function fixture(t){
 const [store,other]=await stores(t);process.env.NODE_ENV='test';process.env.STUDIO_SOURCE_PREPARATION_ENABLED='true';
 const platform=createPlatform({store,authMode:'password'});await platform.ready;
 await platform.identity.provision({username:'cloud-seed-auditor',password:'controlled-emulator-only-239!',role:'founder'});
 const identity=await store.get('identity'),actor=identity.users.find(user=>user.username==='cloud-seed-auditor'),scope=await platform.identity.authorize(actor,'org_default','brand_default'),container=await platform.forScope(scope),repo=container.ports.repo;await repo.ready;
 await store.update(repo.key,state=>{for(const story of state.backlog){if(story.id==='story_nykaa_ipo')story.title='Falguni Nayar’s $13B Omnichannel Beauty IPO in India';if(story.id==='story_margot_luckychap')story.title='Margot Robbie & LuckyChap’s $50M Producer Backend Check';story.contentRevision=1;}return state;});
 const workspace=platform.workspace(scope,repo),jobs=platform.operatorJobs(scope,container),plan=pristineSeedPlan({identity,actorId:actor.id,scope,state:await repo.read(),externalKeys:[],sourceCommit:'a'.repeat(40)});
 return {store,other,platform,actor,scope,repo,workspace,jobs,plan,sourceCommit:'a'.repeat(40),titleIdempotencyKey:randomUUID(),jobIdempotencyKey:randomUUID()};
}
test('Firestore operator: semantic titles/epochs + fixed source job, exact replay and changed request denial',opts,async t=>{
 const f=await fixture(t),done=await applyFirestoreSeedFollowthrough(f),again=await applyFirestoreSeedFollowthrough(f);
 assert.equal(done.job.id,again.job.id);assert.equal(done.job.items.length,3);
 const state=await f.repo.read();assert.equal(state.operatorJobs.length,1);
 for(const row of f.plan.rows){const story=state.backlog.find(story=>story.id===row.storyId);assert.equal(story.title,row.desiredTitle);assert.equal(story.contentRevision,row.contentRevision+(row.disposition==='pristine-rename-eligible'?1:0));assert.equal(story.sourceClaims.some(claim=>claim.status==='approved'),false);}
 await assert.rejects(applyFirestoreSeedFollowthrough({...f,sourceCommit:'b'.repeat(40)}),error=>error.status===409);
});
test('Firestore operator: between-phase human work and current authority stay authoritative',opts,async t=>{
 const f=await fixture(t),raw=f.store.transactWithKeyInventory.bind(f.store);let phase=0;
 f.store.transactWithKeyInventory=async(...args)=>{if(++phase===2)await f.other.update(f.repo.key,state=>{state.backlog.find(story=>story.id==='story_nykaa_ipo').title='CURRENT HUMAN WORK';return state;});return raw(...args);};
 await assert.rejects(applyFirestoreSeedFollowthrough(f),error=>error.status===409);
 assert.equal((await f.repo.read()).backlog.find(story=>story.id==='story_nykaa_ipo').title,'CURRENT HUMAN WORK');assert.equal((await f.repo.read()).operatorJobs?.length||0,0);
 const g=await fixture(t);await g.other.update('identity',identity=>({...identity,memberships:[]}));await assert.rejects(applyFirestoreSeedFollowthrough(g),error=>error.status===403);assert.equal((await g.repo.read()).workspace?.receipts?.length||0,0);
});
test('Firestore operator: matching unknown namespace/suffix, restore marker, and absent scope refuse without initialization',opts,async t=>{
 for(const kind of ['unknown','suffix','lock','missing']){
  const f=await fixture(t);
  if(kind==='unknown')await f.other.update(`future:${f.scope.organizationId}:${f.scope.brandId}:x`,()=>({retained:true}));
  if(kind==='suffix')await f.other.update(`future:${f.scope.organizationId}:${f.scope.brandId}`,()=>({retained:true}));
  if(kind==='lock')await f.other.update(f.repo.key,state=>({...state,editorRestore:{status:'installing'}}));
  if(kind==='missing')await f.other.delete(f.repo.key);
  await assert.rejects(applyFirestoreSeedFollowthrough(f),error=>[409,423].includes(error.status));
  if(kind==='missing')assert.equal(await f.store.get(f.repo.key),null);
 }
});
test('Firestore query transaction: concurrent absent-key insertion is serialized, not a stale pre-query guard',opts,async t=>{
 for(const added of ['native-editor:org:brand:new','future:org:brand:new','future:org:brand']){
  const [a,b]=await stores(t);await a.update('scope:org:brand',()=>({commits:0}));
  let release,entered;const barrier=new Promise(resolve=>release=resolve),queried=new Promise(resolve=>entered=resolve),run=a.firestore.runTransaction.bind(a.firestore);let held=false;
  a.firestore.runTransaction=(callback,options)=>run(async tx=>{const get=tx.get.bind(tx);let queries=0;tx.get=async ref=>{const result=await get(ref);if(typeof ref.limit==='function'&&++queries===2&&!held){held=true;entered();await barrier;}return result;};return callback(tx);},options);
  const guarded=a.transactWithKeyInventory(['scope:org:brand'],([state],keys)=>{if(keys.includes(added))throw Object.assign(new Error('external work'),{status:409});return [{commits:state.commits+1}];});
  await queried;
  // B must enter an actual SDK transaction and issue its document read while
  // A is still held. Merely starting the async update() promise is insufficient.
  let readIssued, bCallback=false, bIssued=false, bCommitted=false;
  const issued=new Promise(resolve=>readIssued=resolve), bRun=b.firestore.runTransaction.bind(b.firestore);
  b.firestore.runTransaction=(callback,options)=>bRun(async tx=>{
   bCallback=true;const get=tx.get.bind(tx);
   tx.get=ref=>{const pending=get(ref);bIssued=true;readIssued();return pending;};
   return callback(tx);
  },options);
  const inserted=b.update(added,()=>({human:true})).then(value=>{bCommitted=true;return value;});
  let watchdog;
  try{await Promise.race([issued,new Promise((_,reject)=>{watchdog=setTimeout(()=>reject(new Error('B never issued its SDK read while A was held')),5000);})]);}
  finally{clearTimeout(watchdog);if(!bIssued)release();}
  assert.equal(bCallback,true);assert.equal(bIssued,true);
  // Give B a bounded opportunity to commit before A resumes. A pessimistic
  // query lock may block it; that outcome must not deadlock this test.
  let overlapTimer;
  try{await Promise.race([inserted,new Promise(resolve=>{overlapTimer=setTimeout(resolve,500);})]);}
  finally{clearTimeout(overlapTimer);release();}
  const committedBeforeRelease=bCommitted;
  const [result]=await Promise.allSettled([guarded,inserted]);await inserted;
  if(committedBeforeRelease){assert.equal(result.status,'rejected','a B commit before A resumes must force retry/guard rejection');assert.equal(result.reason.status,409);}
  const state=await a.get('scope:org:brand');
  if(result.status==='fulfilled'){
   assert.equal(state.commits,1);
   const [guardParent,newParent]=await Promise.all([a.ref('scope:org:brand').get(),b.ref(added).get()]);
   assert.ok(guardParent.updateTime.seconds<newParent.updateTime.seconds||(guardParent.updateTime.seconds===newParent.updateTime.seconds&&guardParent.updateTime.nanoseconds<=newParent.updateTime.nanoseconds),'guard must serialize before the concurrent insertion');
   t.diagnostic(JSON.stringify({case:added,bSdkReadBeforeRelease:true,bCommittedBeforeRelease:committedBeforeRelease,outcome:'guard-before-insert',guardCommit:guardParent.updateTime.toDate().toISOString(),guardNanos:guardParent.updateTime.nanoseconds,insertCommit:newParent.updateTime.toDate().toISOString(),insertNanos:newParent.updateTime.nanoseconds}));
  }else{assert.equal(result.reason.status,409);assert.equal(state.commits,0);const newParent=await b.ref(added).get();t.diagnostic(JSON.stringify({case:added,bSdkReadBeforeRelease:true,bCommittedBeforeRelease:committedBeforeRelease,outcome:'insert-detected-guard-rejected',insertCommit:newParent.updateTime.toDate().toISOString(),insertNanos:newParent.updateTime.nanoseconds}));}
  await assert.rejects(a.transactWithKeyInventory(['scope:org:brand'],([state],keys)=>{assert.ok(keys.includes(added));throw Object.assign(new Error('preserved'),{status:409});}),error=>error.status===409);
 }
});
test('Firestore operator inventory: exact512 admission, overflow/missing-key corruption and capacities fail before callback',opts,async t=>{
 const [a]=await stores(t);await a.update('scope',()=>({count:0}));
 // Parent metadata-only unrelated records avoid large payload allocations. No
 // callback reads these chunks; they are administrative emulator fixtures only.
 for(let offset=0;offset<511;offset+=250){const batch=a.firestore.batch();for(let i=offset;i<Math.min(511,offset+250);i++)batch.set(a.ref(`unrelated:${i}`),{key:`unrelated:${i}`});await batch.commit();}
 await a.transactWithKeyInventory(['scope'],([state],keys)=>{assert.equal(keys.length,512);return [{count:state.count+1}];});
 await a.ref('overflow').set({key:'overflow'});let called=false;
 await assert.rejects(a.transactWithKeyInventory(['scope'],values=>{called=true;return values;}),{code:'OPERATOR_INVENTORY_CAPACITY'});assert.equal(called,false);assert.equal((await a.get('scope')).count,1);
 await a.ref('overflow').delete();await a.collection.doc('invalid-missing-key').set({schemaVersion:1});
 await assert.rejects(a.transactWithKeyInventory(['scope'],values=>{called=true;return values;}),error=>['STORE_CORRUPT','OPERATOR_INVENTORY_CAPACITY'].includes(error.code));assert.equal(called,false);
});

test('Firestore operator: membership/source/native drift arriving at the actual transaction guard rejects stale intent',opts,async t=>{
 for(const kind of ['membership','title','epoch','external']){
  const f=await fixture(t),raw=f.store.transactWithKeyInventory.bind(f.store);let held=false;
  f.store.transactWithKeyInventory=async(...args)=>{if(!held){held=true;if(kind==='membership')await f.other.update('identity',identity=>({...identity,memberships:[]}));else if(kind==='external')await f.other.update(`new-namespace:${f.scope.organizationId}:${f.scope.brandId}:retained`,()=>({human:true}));else await f.other.update(f.repo.key,state=>{const story=state.backlog.find(story=>story.id==='story_nykaa_ipo');if(kind==='title')story.title='new human title';else story.contentRevision++;return state;});}return raw(...args);};
  await assert.rejects(applyFirestoreSeedFollowthrough(f),error=>[403,409].includes(error.status));
  assert.equal((await f.repo.read()).workspace?.receipts?.length||0,0);assert.equal((await f.repo.read()).operatorJobs?.length||0,0);
 }
});
test('Firestore inventory callback rollback, selected-value budgets and current checksum corruption',opts,async t=>{
 const [a]=await stores(t);await a.update('one',()=>({text:'x'.repeat(2100000)}));await a.update('two',()=>({text:'y'.repeat(2100000)}));let called=false;
 await assert.rejects(a.transactWithKeyInventory(['one','two'],values=>{called=true;return values;}),{code:'STORE_CAPACITY'});assert.equal(called,false);
 await a.update('one',()=>({count:1}));await a.update('two',()=>({count:2}));
 await assert.rejects(a.transactWithKeyInventory(['one','two'],()=>[{text:'x'.repeat(4194304)},{}]),{code:'STORE_CAPACITY'});
 await assert.rejects(a.transactWithKeyInventory(['one'],async values=>values),{code:'INVALID_TRANSACTION'});
 await assert.rejects(a.transactWithKeyInventory(['one'],()=>{throw new Error('guard refusal');}),/guard refusal/);
 assert.deepEqual(await a.get('one'),{count:1});
 const before=(await a.ref('one').get()).updateTime;await a.transactWithKeyInventory(['one'],values=>values);assert.ok((await a.ref('one').get()).updateTime.isEqual(before));
 await a.ref('two').collection('chunks').doc('0').set({bytes:Buffer.from('{}')});
 await assert.rejects(a.transactWithKeyInventory(['two'],values=>values),{code:'STORE_CORRUPT'});
 const [b]=await stores(t);await b.update('scope',()=>({count:0}));await b.collection.doc('corrupt-parent').set({schemaVersion:1});
 await assert.rejects(b.transactWithKeyInventory(['scope'],values=>values),{code:'STORE_CORRUPT'});
 await b.collection.doc('corrupt-parent').delete();await b.collection.doc('wrong-digest').set({key:'other'});await assert.rejects(b.transactWithKeyInventory(['scope'],values=>values),{code:'STORE_CORRUPT'});
});
