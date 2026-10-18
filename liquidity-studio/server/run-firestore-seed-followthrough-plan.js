import {pathToFileURL} from 'node:url';
import {runFirestoreSeedOperator} from './firestore-seed-operator.js';
export const main=(args,dependencies)=>runFirestoreSeedOperator(args,'plan',dependencies);
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main(process.argv.slice(2)).then(result=>console.log(JSON.stringify(result))).catch(error=>{console.error(JSON.stringify({status:error.status||500,error:'Read-only cloud seed plan failed; no apply was requested'}));process.exitCode=1;});
