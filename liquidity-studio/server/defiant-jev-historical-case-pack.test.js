import test from 'node:test';
import {historicalFixture} from './historical-jev-fixture.js';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createPinnedHistoricalComparabilityCasePack,HISTORICAL_COMPARABILITY_VERSION,EXPLICIT_COMPARABILITY_VERSION} from './defiant-jev-historical-case-pack.js';
const sha=v=>createHash('sha256').update(v).digest('hex'),encode=v=>Buffer.from(JSON.stringify(v));
const normalizer='a77152e9dd06fbcb7a2dfe335b26efb42d7c817c';
const limitation='Absence means no observation in the supplied grouping, not zero listening or missing provider delivery. Posting windows describe the whole source file, not this store, including when the store observation is absent. Mutually observed periods can still differ in posting and settlement maturity. Exact supplied-amount arithmetic, not causal demand analysis.';
function fixture(){
 const claim='Settlement periods are conclusively unequal.',answer=Buffer.from('🧭 Prefix. '+claim+' Tail.'),start=Array.from('🧭 Prefix. ').length;
 const observations=[{month:'2024-01',sourceHash:'b'.repeat(64),rowCount:2,amount:'1',postingWindow:{first:'2024-02-01',last:'2024-03-01'}},{month:'2025-01',sourceHash:'c'.repeat(64),rowCount:0,amount:null,postingWindow:null}];
 const snapshot={schemaVersion:1,organizationId:'org',storePeriodCoverage:[{schemaVersion:1,id:'coverage',comparisonId:'comparison',storeKey:'Invented store',observations}],comparisons:[{id:'comparison',dimension:'store',periodBasis:'filename-declared',beforeMonths:['2024-01'],afterMonths:['2025-01'],groups:[{id:'group',key:'Invented store'}],sourceReferences:observations.map(({month,sourceHash})=>({month,sourceHash}))}]};
 const state={claim,evidence:{storeKey:'Invented store',periodBasis:'filename-declared',beforeMonths:['2024-01'],afterMonths:['2025-01'],postingWindowScope:'source-file',postingWindowVerification:'producer-supplied-profile',observations:observations.map(({month,sourceHash,rowCount,postingWindow})=>({month,sourceHash,rowCount,postingWindow})),expectedDelivery:'unknown',settlementMaturityComparable:false,limitation}};
 const artifacts={answer,snapshot:encode(snapshot),state:encode(state)},descriptor=name=>({sha256:sha(artifacts[name]),bytes:artifacts[name].length});
 const row={caseId:'observed',caseType:'historical-store-period-comparability',origin:'observed-answer',datasetSha256:'d'.repeat(64),evidenceRevision:'e'.repeat(64),answer:{...descriptor('answer'),quote:{start,end:start+Array.from(claim).length,text:claim}},historicalSnapshot:descriptor('snapshot'),historicalNormalizerGitBlob:normalizer,selector:{coverageId:'coverage',comparisonId:'comparison'},state:descriptor('state')};
 const binding={schemaVersion:1,organizationId:'org',caseId:'observed',dataset:{kind:'retained-observed-report-cases-v1',sha256:row.datasetSha256},answer:{...descriptor('answer'),quoteStart:start,quoteEnd:row.answer.quote.end},historicalSnapshot:{...descriptor('snapshot'),evidenceRevision:row.evidenceRevision},neutralState:descriptor('state'),projection:{version:HISTORICAL_COMPARABILITY_VERSION,normalizerGitBlob:normalizer}};
 let allowed=true,loads=0,checks=0,hook=()=>{};
 const make=(change=()=>{},options={})=>{const pack={schemaVersion:2,organizationId:'org',cases:[structuredClone(row)]};change(pack);const bytes=encode(pack);return createPinnedHistoricalComparabilityCasePack({bytes,sha256:sha(bytes),loadAnswer:async p=>{loads++;hook('answer');assert.deepEqual(p,descriptor('answer'));return artifacts.answer;},loadHistoricalSnapshot:async p=>{loads++;hook('snapshot');assert.deepEqual(p,descriptor('snapshot'));return artifacts.snapshot;},loadState:async p=>{loads++;hook('state');assert.deepEqual(p,descriptor('state'));return artifacts.state;},trustedHistoricalBinding:binding,authorize:async()=>{checks++;if(!allowed)throw Object.assign(new Error('Denied'),{status:403});},...options});};
 return {claim,state,snapshot,artifacts,row,binding,make,counts:()=>({loads,checks}),hook:f=>hook=f,revoke:()=>allowed=false};
}
test('historical observed quote uses Unicode code points and exact neutral metadata, not an earnings assertion or semantic verdict',async()=>{
 const f=fixture(),pack=f.make(),r=await pack.resolve({id:'reader'},'observed');assert.equal(r.state.claim,f.claim);assert.deepEqual(JSON.parse(r.state.evidence),f.state.evidence);assert.equal(typeof r.state.evidence,'string');assert.equal(r.ref.origin,'observed-answer');assert.equal(r.deterministicVersion,HISTORICAL_COMPARABILITY_VERSION);assert.deepEqual(r.deterministic,{status:'pass',reasons:[]});assert.equal(r.provenance.historicalSnapshot.sha256,sha(f.artifacts.snapshot));assert.deepEqual(pack.list(),[{caseId:'observed',origin:'observed-answer',evidenceRevision:'e'.repeat(64),claim:f.claim}]);assert.equal(f.counts().loads,3);assert.ok(f.counts().checks>=8);assert.equal(Object.hasOwn(JSON.parse(r.state.evidence),'amount'),false);assert.ok(JSON.parse(r.state.evidence).observations.every(o=>!Object.hasOwn(o,'amount')));
});
test('unknown case, pack hash, expected labels and malformed descriptors fail before artifact loads',async()=>{
 const f=fixture();for(const change of [p=>p.expectedLabel='PRIVATE_LABEL',p=>p.cases[0].suggestedCorrection='PRIVATE_CORRECTION',p=>p.cases[0].answer.bytes=65537,p=>p.cases[0].historicalSnapshot.bytes=4194305,p=>p.cases[0].state.bytes=12001,p=>p.cases[0].historicalNormalizerGitBlob='a'.repeat(40),p=>p.cases[0].caseType='earnings'])assert.throws(()=>f.make(change),{status:503});await assert.rejects(f.make().resolve({},'other'),{status:404});assert.equal(f.counts().loads,0);
});
test('answer byte/hash, fatal UTF8, code-point range and quote mismatches cannot reach a resolved provider state',async()=>{
 for(const name of ['changed','utf8','span']){const f=fixture();let pack;if(name==='changed')pack=f.make(()=>{},{loadAnswer:async()=>Buffer.from('Other answer')});if(name==='utf8'){const bad=Uint8Array.of(255);pack=f.make(p=>{p.cases[0].answer={...p.cases[0].answer,sha256:sha(bad),bytes:1};},{loadAnswer:async()=>bad,trustedHistoricalBinding:{...f.binding,answer:{...f.binding.answer,sha256:sha(bad),bytes:1}}});}if(name==='span')pack=f.make(p=>p.cases[0].answer.quote.end+=100,{trustedHistoricalBinding:{...f.binding,answer:{...f.binding.answer,quoteEnd:f.row.answer.quote.end+100}}});await assert.rejects(pack.resolve({},'observed'),{status:503});}
});
test('current snapshot substitution, private correction fields or altered historic source links reject before result',async()=>{
 for(const mutate of [s=>s.organizationId='other',s=>s.storePeriodCoverage[0].observations[0].sourceHash='f'.repeat(64),s=>s.storePeriodCoverage[0].observations[0].postingWindow.first='2024-02-30',s=>s.comparisons.push(structuredClone(s.comparisons[0]))]){const f=fixture(),changed=structuredClone(f.snapshot);mutate(changed);const bytes=encode(changed);const pack=f.make(p=>p.cases[0].historicalSnapshot={sha256:sha(bytes),bytes:bytes.length},{loadHistoricalSnapshot:async()=>bytes,trustedHistoricalBinding:{...f.binding,historicalSnapshot:{...f.binding.historicalSnapshot,sha256:sha(bytes),bytes:bytes.length}}});await assert.rejects(pack.resolve({},'observed'),{status:503});}
 const f=fixture();await assert.rejects(f.make(()=>{},{loadHistoricalSnapshot:async()=>encode({...f.snapshot,revision:'f'.repeat(64)})}).resolve({},'observed'),{status:503});
 const g=fixture(),bad=encode({...g.state,evidence:{...g.state.evidence,suggestedCorrection:'PRIVATE'}});const pack=g.make(p=>p.cases[0].state={sha256:sha(bad),bytes:bad.length},{loadState:async()=>bad,trustedHistoricalBinding:{...g.binding,neutralState:{sha256:sha(bad),bytes:bad.length}}});await assert.rejects(pack.resolve({},'observed'),{status:503});
});
test('authority loss at each independently loaded artifact denies protected state and leaves no alternate source fallback',async()=>{
 for(const boundary of ['answer','snapshot','state']){const f=fixture();f.hook(stage=>{if(stage===boundary)f.revoke();});await assert.rejects(f.make().resolve({id:'reader'},'observed'),{status:403});assert.equal(f.counts().loads,['answer','snapshot','state'].indexOf(boundary)+1);}
});

test('independent trusted historical binding rejects current-revision or dataset self-assertion and missing configuration before loads',()=>{
 const f=fixture();for(const change of [p=>p.cases[0].evidenceRevision='f'.repeat(64),p=>p.cases[0].datasetSha256='f'.repeat(64),p=>p.cases[0].answer.quote.start++,p=>p.cases[0].historicalSnapshot.sha256='f'.repeat(64)])assert.throws(()=>f.make(change),{status:503});assert.throws(()=>f.make(()=>{},{trustedHistoricalBinding:undefined}));assert.throws(()=>f.make(()=>{},{sha256:'f'.repeat(64)}),{status:503});assert.equal(f.counts().loads,0);
});


test('explicit historical recipe distinguishes unestablished status from asserted inequality without inventing settlement proof',async()=>{
 const h=historicalFixture({version:EXPLICIT_COMPARABILITY_VERSION}),pack=h.make();assert.equal(pack.executionAvailable,true);assert.equal(pack.executionUnavailableReason,null);const resolved=await pack.resolve({},'observed'),evidence=JSON.parse(resolved.state.evidence);
 assert.deepEqual(evidence.settlementComparability,{status:'not-established',basis:'source-file-posting-windows-without-store-settlement-verification',normalizerGitBlob:normalizer,interpretationVersion:'settlement-comparability-status-v1'});assert.equal(Object.hasOwn(evidence,'settlementMaturityComparable'),false);assert.equal(resolved.deterministicVersion,EXPLICIT_COMPARABILITY_VERSION);assert.equal(resolved.provenance.projection.version,EXPLICIT_COMPARABILITY_VERSION);
 // An invented explicit-inequality assertion is a different meaning, not a synonym for absence of proof.
 for(const status of ['established-incomparable','established-comparable','unknown']){
  const f=historicalFixture({version:EXPLICIT_COMPARABILITY_VERSION});f.state.evidence.settlementComparability.status=status;f.artifacts.state=encode(f.state);const pin={sha256:sha(f.artifacts.state),bytes:f.artifacts.state.length};f.row.state=pin;f.binding.neutralState=pin;
  await assert.rejects(f.make().resolve({},'observed'),{status:503});
 }
 const legacy=historicalFixture(),old=legacy.make();assert.equal(old.executionAvailable,false);assert.equal(old.executionUnavailableReason,'ambiguous-evidence-semantics');assert.equal(JSON.parse((await old.resolve({},'observed')).state.evidence).settlementMaturityComparable,false);
});
