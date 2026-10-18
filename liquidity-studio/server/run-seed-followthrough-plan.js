// Explicit read-only SQLite SNAPSHOT audit. There is intentionally no --apply.
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {fail} from './auth.js';
import {pristineSeedPlan,plannedSeedQueueIds} from './seed-followthrough-plan.js';
export async function main(args){
 const names=['--database','--database-sha256','--organization','--brand','--actor','--out'];
 if(args.length!==12||args.some((value,index)=>index%2===0&&!names.includes(value))||names.some(name=>args.filter(value=>value===name).length!==1))throw fail(400,'Use explicit snapshot, SHA, organization, brand, current actor and private output; apply is unsupported');
 const value=name=>args[args.indexOf(name)+1],file=value('--database'),out=value('--out'),expected=value('--database-sha256');
 if(!path.isAbsolute(file)||!path.isAbsolute(out)||file===out||!/^[a-f0-9]{64}$/.test(expected))throw fail(400,'Absolute snapshot/output and exact SHA required');
 const digest=()=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 if(digest()!==expected)throw fail(409,'Snapshot fingerprint changed');
 const parent=path.dirname(out);if(!fs.existsSync(parent))fs.mkdirSync(parent,{recursive:true,mode:0o700});
 if((fs.statSync(parent).mode&0o777)!==0o700)throw fail(400,'Output parent must be private mode0700');
 if(fs.existsSync(out))throw fail(409,'Preserve earlier audit; choose a new output filename');
 const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:fileURLToPath(new URL('../../',import.meta.url)),encoding:'utf8'}).trim();
 const db=new DatabaseSync(file,{readOnly:true});
 try{
  const get=key=>{const row=db.prepare('SELECT value FROM documents WHERE key=?').get(key);return row?JSON.parse(row.value):null;};
  const identity=get('identity'),org=identity?.organizations?.find(org=>org.id===value('--organization')),brand=org?.brands?.find(brand=>brand.id===value('--brand'));
  if(!brand)throw fail(404,'Existing explicit brand required');
  const scope={organizationId:org.id,brandId:brand.id,preset:brand.preset},key=`scope:${org.id}:${brand.id}`,state=get(key);
  if(!state)throw fail(404,'Existing scope required; no factory seeding');
  const externalKeys=db.prepare('SELECT key FROM documents').all().map(row=>row.key).filter(item=>item!==key&&(item.includes(`:${org.id}:${brand.id}:`)||item.endsWith(`:${org.id}:${brand.id}`)));
  const plan=pristineSeedPlan({identity,actorId:value('--actor'),scope,state,externalKeys,sourceCommit}),queueIntersection=plannedSeedQueueIds(plan,state,scope);
  if(digest()!==expected)throw fail(409,'Snapshot changed during read-only audit');
  const manifest={snapshotSha256:expected,snapshotBytes:fs.statSync(file).size,meaning:'SQLite snapshot only, not asset-aware backup/current live fence; NO writes, jobs or approval',plan,queueIntersection};
  fs.writeFileSync(out,JSON.stringify(manifest,null,2)+'\n',{mode:0o600,flag:'wx'});
  return {readOnly:true,targets:plan.rows.length,dispositions:plan.rows.map(row=>({storyId:row.storyId,disposition:row.disposition})),planSha256:plan.planSha256};
 }finally{db.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main(process.argv.slice(2)).then(result=>console.log(JSON.stringify(result))).catch(error=>{console.error(JSON.stringify({status:error.status||500,error:'Read-only seed audit did not complete; no apply is supported'}));process.exitCode=1;});
