import test from 'node:test';
import assert from 'node:assert/strict';
import {newCompletionKey,signCompletion,verifyCompletion} from './editor-completion-envelope.js';
const now=1792295000000;
const claims=()=>({bindingId:'a'.repeat(64),organizationId:'org',brandId:'brand',nativeId:'native',artifactId:'artifact',storyId:'story',generationId:'gen',expectedReviewRevision:4,expectedNativeRevision:2,sha256:'b'.repeat(64),size:1024,mime:'image/png',requestDigest:'c'.repeat(64)});
test('server completion authenticates exact scope, artifact bytes, revisions and original event',()=>{
 const key=newCompletionKey(),envelope=signCompletion(key,claims(),{now});
 assert.deepEqual(verifyCompletion([key],envelope,{now:now+1}),envelope);
 for(const [field,value] of Object.entries({brandId:'foreign',sha256:'d'.repeat(64),size:2048,expectedReviewRevision:5,nonce:'other',requestDigest:'e'.repeat(64)}))assert.throws(()=>verifyCompletion([key],{...envelope,[field]:value},{now}),{status:403});
 assert.throws(()=>verifyCompletion([newCompletionKey()],envelope,{now}),{status:403});
});
test('expiry, future issue time, unknown fields and caller-controlled server fields fail closed',()=>{
 const key=newCompletionKey(),envelope=signCompletion(key,claims(),{now});
 assert.throws(()=>verifyCompletion([key],envelope,{now:envelope.expiresAt}),{status:403});
 assert.throws(()=>verifyCompletion([key],envelope,{now:now-10001}),{status:403});
 assert.throws(()=>verifyCompletion([key],{...envelope,url:'https://example.com/asset'},{now}),{status:400});
 assert.throws(()=>signCompletion(key,{...claims(),eventId:'caller-chosen'},{now}),{status:400});
 assert.throws(()=>signCompletion(key,claims(),{now,ttlMs:300001}),{status:400});
 assert.throws(()=>verifyCompletion([key],{...envelope,signature:'x'},{now}),{status:403});
});
test('bounded rotation accepts retained old key and rejects it after removal; nonce is unique',()=>{
 const old=newCompletionKey(),current=newCompletionKey();const first=signCompletion(old,claims(),{now}),second=signCompletion(current,claims(),{now});
 assert.notEqual(first.nonce,second.nonce);assert.notEqual(first.eventId,second.eventId);
 assert.equal(verifyCompletion([current,old],first,{now}).keyId,old.id);
 assert.throws(()=>verifyCompletion([current],first,{now}),{status:403});
});
