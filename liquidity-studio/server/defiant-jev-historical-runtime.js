import {createHash} from 'node:crypto';
import {createPinnedHistoricalComparabilityCasePack,checkedTrustedHistoricalBinding,HISTORICAL_COMPARABILITY_VERSION} from './defiant-jev-historical-case-pack.js';
import {createDurableClaimEvaluations} from './defiant-jev-durable.js';
import {createJevDecisionAdapter,jevEvaluationConfigurationSha256} from './defiant-jev-evaluation.js';
const PROJECT='liquidity-studio-pilot-261017',BUCKET='liquidity-studio-pilot-261017-liquidity-assets';
const LIMITS=Object.freeze({timeoutMs:15000,maxRequests:1,maxInputBytes:16384,maxResponseBytes:65536});
const invalid=()=>new Error('Invalid private historical evaluation configuration');
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const id=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}(?![\s\S])/.test(v);
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}(?![\s\S])/.test(v);
const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
function pin(p,max){if(!exact(p,['key','generation','bytes','sha256'])||typeof p.key!=='string'||p.key.length>1000||!p.key.startsWith('defiant-private/derived/')||p.key.split('/').some(x=>!x||x==='.'||x==='..')||/[\x00-\x20\x7f\\?#%]/.test(p.key)||typeof p.generation!=='string'||!/^[1-9]\d{0,29}(?![\s\S])/.test(p.generation)||!Number.isSafeInteger(p.bytes)||p.bytes<1||p.bytes>max||!hash(p.sha256))throw invalid();}
export function validateHistoricalJevRuntimeConfiguration(input){
 const c=structuredClone(input);
 if(!exact(c,['schemaVersion','organizationId','projectId','bucket','accountExperimentId','casePack','trustedHistoricalBinding','artifacts'])||c.schemaVersion!==2||!id(c.organizationId)||c.organizationId==='defiant_evidence_poc'||c.projectId!==PROJECT||c.bucket!==BUCKET||!id(c.accountExperimentId)||!exact(c.artifacts,['answer','historicalSnapshot','neutralState']))throw invalid();
 pin(c.casePack,262144);pin(c.artifacts.answer,65536);pin(c.artifacts.historicalSnapshot,4194304);pin(c.artifacts.neutralState,12000);
 const b=checkedTrustedHistoricalBinding(c.trustedHistoricalBinding);
 if(!b||b.organizationId!==c.organizationId)throw invalid();
 for(const [name,binding] of [['answer','answer'],['historicalSnapshot','historicalSnapshot'],['neutralState','neutralState']])if(c.artifacts[name].sha256!==b[binding]?.sha256||c.artifacts[name].bytes!==b[binding]?.bytes)throw invalid();
 // Independently configured binding is validated before storage creation; pack self-assertions are checked after its exact bytes arrive.
 return c;
}
/** Called only by the existing explicitly configured startup composition; no additional endpoint or destination. */
export async function configuredHistoricalJevProvider({configuration,environment,loadCredential,createStorage,fetch:fetchImpl,readPinnedObject}){
 const config=validateHistoricalJevRuntimeConfiguration(configuration);
 const storage=await createStorage({projectId:PROJECT}),bucket=storage.bucket(BUCKET);
 const bytes=await readPinnedObject(bucket,config.casePack);
 const options={bytes,sha256:config.casePack.sha256,trustedHistoricalBinding:config.trustedHistoricalBinding};
 const unavailable=async()=>{throw invalid();};
 const metadata=createPinnedHistoricalComparabilityCasePack({...options,loadAnswer:unavailable,loadHistoricalSnapshot:unavailable,loadState:unavailable,authorize:unavailable});
 if(metadata.organizationId!==config.organizationId)throw invalid();
 const deterministicVersion=metadata.deterministicVersion;
 const key=await loadCredential(environment.STUDIO_PENPOT_MANAGED_CONFIG);
 const bindingSha256=createHash('sha256').update(canonical(config.trustedHistoricalBinding)).digest('hex');
 const evaluatorConfigSha256=jevEvaluationConfigurationSha256(LIMITS,deterministicVersion,bindingSha256);
 return Object.freeze(({organizationId,store,strategy,authorizeCurrent})=>{
  if(organizationId!==config.organizationId)throw Object.assign(new Error('Evaluation unavailable for this organization'),{status:404});
  const authorize=async actor=>{const next=await authorizeCurrent(actor);if(!next||next.id!==actor.id||next.uid!==actor.uid)throw Object.assign(new Error('Evaluation authority changed'),{status:403});await strategy.raw(next);};
  const loader=name=>async descriptor=>{const pin=config.artifacts[name];if(descriptor.sha256!==pin.sha256||descriptor.bytes!==pin.bytes)throw invalid();return readPinnedObject(bucket,pin);};
  const pack=createPinnedHistoricalComparabilityCasePack({...options,loadAnswer:loader('answer'),loadHistoricalSnapshot:loader('historicalSnapshot'),loadState:loader('neutralState'),authorize});
  const adapter=createJevDecisionAdapter({deterministicVersion,enabled:true,getCredential:()=>key,fetch:fetchImpl,...LIMITS});
  return {cases:pack.list(),executionAvailable:!!key&&pack.executionAvailable,executionUnavailableReason:pack.executionUnavailableReason,service:createDurableClaimEvaluations({store,strategy,authorizeCurrent,pack,adapter,accountExperimentId:config.accountExperimentId,evaluatorConfigSha256,deterministicVersion})};
 });
}
