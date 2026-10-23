const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}(?![\s\S])/.test(v);
const integer=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const filters=['query','sourceId','format','kind','sourceHash','fromMonth','toMonth','periodPresence'];
// Finite addressable return state, never a URL, credential or authority grant.
export function sourceTrail(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['sourceHash','revision','offset','retainedOffset','sessionId','sessionOffset','filters'].includes(k))||!hash(value.sourceHash)||!hash(value.revision)||!integer(value.offset,24400)||!integer(value.retainedOffset,5000)||!integer(value.sessionOffset,256)||!(value.sessionId===''||hash(value.sessionId))||!value.filters||typeof value.filters!=='object'||Array.isArray(value.filters)||Object.keys(value.filters).some(k=>!filters.includes(k)))return null;
 const safe={};for(const key of filters){const v=value.filters[key]??'';if(typeof v!=='string'||v.length>200||/[\u0000-\u001f\u007f]/.test(v))return null;safe[key]=v;}
 const result={sourceHash:value.sourceHash,revision:value.revision,offset:value.offset,retainedOffset:value.retainedOffset,sessionId:value.sessionId,sessionOffset:value.sessionOffset,filters:safe};return JSON.stringify(result).length<=2500?result:null;
}
export function readSourceTrail(text){try{return typeof text==='string'&&text.length<=2500?sourceTrail(JSON.parse(text)):null;}catch{return null;}}
export function createSourceTrail(sourceHash,location,revision){return sourceTrail({sourceHash,revision,offset:0,retainedOffset:location.evidenceOffset||0,sessionId:location.retainedSessionId||'',sessionOffset:location.retainedSessionOffset||0,filters:location.retainedFilters||{}});}
export function sourceTrailLocation(trail,{search=false}={}){const t=sourceTrail(trail);if(!t)return null;return {evidenceMode:'retained',evidenceRevision:t.revision,evidenceOffset:search?t.retainedOffset:t.offset,retainedSessionId:t.sessionId,retainedSessionOffset:t.sessionOffset,retainedFilters:t.filters,evidenceSourceHash:search?'':t.sourceHash,evidenceSourceTrail:search?null:t};}
const id=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}(?![\s\S])/.test(v);
export function sourceFollowUpLocation(input,trail){
 const t=sourceTrail(trail);if(!t||!input||input.revision!==t.revision)return null;
 const common={evidenceRevision:t.revision,evidenceSourceTrail:t,evidenceSourceHash:'',evidenceOffset:0};
 if(['selection','selection-receipts'].includes(input.resource)&&id(input.selectionId))return {...common,evidenceMode:'selections',evidenceSelectionId:input.selectionId};
 if(input.resource==='receipt'&&id(input.receiptId))return {...common,evidenceMode:'earnings',evidenceReceiptId:input.receiptId};
 if(['audience-definition','audience-cells'].includes(input.resource)&&id(input.audienceId))return {...common,evidenceMode:'audience',evidenceAudienceId:input.audienceId,evidenceAudienceCells:input.resource==='audience-cells'};
 if(input.resource==='comparison-examples'&&id(input.comparisonId)&&id(input.groupId)&&integer(input.referenceIndex,47))return {...common,evidenceMode:'changes',evidenceComparisonId:input.comparisonId,evidenceComparisonGroupId:input.groupId,evidenceReferenceIndex:input.referenceIndex};
 if(input.resource==='earnings'&&typeof input.month==='string'&&/^\d{4}-(0[1-9]|1[0-2])(?![\s\S])/.test(input.month)&&typeof input.currency==='string'&&/^[A-Z]{3}(?![\s\S])/.test(input.currency))return {...common,evidenceMode:'earnings',evidenceMonth:input.month,evidenceCurrency:input.currency};
 return null;
}
