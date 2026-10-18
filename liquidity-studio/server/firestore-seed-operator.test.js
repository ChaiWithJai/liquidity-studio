import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {operatorArguments,runFirestoreSeedOperator} from './firestore-seed-operator.js';
import {operatorFixture} from './firestore-seed-operator-fixtures.js';
const hash=value=>createHash('sha256').update(value).digest('hex');
test('cloud operator: explicit config, complete executing source and private immutable output before SDK',async t=>{
 const f=operatorFixture(t);assert.equal(operatorArguments(f.args,'plan',f).target.projectId,f.target.projectId);
 for(const change of [a=>a.concat('--apply'),a=>a.concat('--unknown','x'),a=>a.map(value=>value===f.target.projectId?'foreign-project':value)])assert.throws(()=>operatorArguments(change([...f.args]),'plan',f));
 assert.throws(()=>operatorArguments(f.args,'plan',{...f,env:{...f.env,STUDIO_FIRESTORE_COLLECTION:'other'}}),error=>error.status===409);
 let created=0;await assert.rejects(runFirestoreSeedOperator(f.args.map(value=>value===f.args[f.args.indexOf('--source-manifest-sha256')+1]?'0'.repeat(64):value),'plan',{...f,createStore:()=>{created++;}}));assert.equal(created,0);
 fs.writeFileSync(path.join(f.dir,'plan-result.json'),'preserved',{mode:0o600});assert.throws(()=>operatorArguments(f.args,'plan',f),error=>error.status===409);
});
test('cloud plan: missing scope never invokes a constructor/write or produces an apply intent',async t=>{
 const f=operatorFixture(t);let closed=0;
 await assert.rejects(runFirestoreSeedOperator(f.args,'plan',{...f,createStore:async()=>({inspectWithKeyInventory:async(keys,callback)=>callback([null,null],[]),close:async()=>closed++})}),error=>error.status===404);
 assert.equal(closed,1);assert.equal(fs.existsSync(path.join(f.dir,'plan-result.json')),false);
});
test('cloud apply: exact stable intent is fsynced before even constructing SDK; changed keys cannot replace it',async t=>{
 const f=operatorFixture(t),plan={sourceCommit:f.manifest.sourceCommit,scope:{organizationId:'org_default',brandId:'brand_default',preset:'liquidity_desk'},rows:[]};
 const {seedPlanHash}=await import('./seed-followthrough-plan.js');plan.planSha256=seedPlanHash(plan);
 const file=path.join(f.dir,'reviewed.json'),intent=path.join(f.dir,'intent.json');fs.writeFileSync(file,JSON.stringify(plan),{mode:0o600});
 const args=[...f.args,'--plan',file,'--plan-sha256',hash(fs.readFileSync(file)),'--title-key',randomUUID(),'--job-key',randomUUID(),'--intent',intent,'--apply'];let calls=0;
 const createStore=async()=>{calls++;assert.equal(JSON.parse(fs.readFileSync(intent)).stage,'prepared');throw new Error('controlled unavailable SDK, no cloud call');};
 await assert.rejects(runFirestoreSeedOperator(args,'apply',{...f,createStore}),/controlled unavailable SDK/);assert.equal(calls,1);
 await assert.rejects(runFirestoreSeedOperator(args,'apply',{...f,createStore}),/controlled unavailable SDK/);assert.equal(calls,2);
 const changed=[...args];changed[changed.indexOf('--job-key')+1]=randomUUID();await assert.rejects(runFirestoreSeedOperator(changed,'apply',{...f,createStore}),error=>error.status===409);assert.equal(calls,2);
});

test('cloud operator: explicit default database is accepted only when exact environment and manifest match',async t=>{
 const f=operatorFixture(t);f.manifest.target.databaseId='(default)';f.env.STUDIO_FIRESTORE_DATABASE='(default)';fs.writeFileSync(f.source,JSON.stringify(f.manifest),{mode:0o600});
 const args=[...f.args];args[args.indexOf('--database')+1]='(default)';args[args.indexOf('--source-manifest-sha256')+1]=hash(fs.readFileSync(f.source));
 assert.equal(operatorArguments(args,'plan',f).target.databaseId,'(default)');
 assert.throws(()=>operatorArguments(args,'plan',{...f,env:{...f.env,STUDIO_FIRESTORE_DATABASE:undefined}}),error=>error.status===409);
 const changed=[...args];changed[changed.indexOf('--database')+1]='(other)';assert.throws(()=>operatorArguments(changed,'plan',f),error=>error.status===400);
});
