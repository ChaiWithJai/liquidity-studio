import { createHmac, timingSafeEqual, randomBytes, randomUUID } from 'node:crypto';
import { fail } from './auth.js';
const fields=['version','eventId','bindingId','organizationId','brandId','nativeId','artifactId','storyId','generationId','expectedReviewRevision','expectedNativeRevision','sha256','size','mime','issuedAt','expiresAt','nonce','requestDigest','keyId'];
const id=value=>typeof value==='string'&&/^[A-Za-z0-9_.:-]{1,200}$/.test(value);
const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const integer=value=>Number.isSafeInteger(value)&&value>0;
const canonical=envelope=>JSON.stringify(Object.fromEntries(fields.map(field=>[field,envelope[field]])));
function validate(envelope) {
 if(!envelope||typeof envelope!=='object'||Array.isArray(envelope)||Object.keys(envelope).some(key=>![...fields,'signature'].includes(key))||fields.some(key=>!Object.hasOwn(envelope,key))||envelope.version!==1||
  !['eventId','organizationId','brandId','nativeId','artifactId','storyId','generationId','nonce','keyId'].every(field=>id(envelope[field]))||
  !['bindingId','sha256','requestDigest'].every(field=>digest(envelope[field]))||
  !integer(envelope.expectedReviewRevision)||!integer(envelope.expectedNativeRevision)||!integer(envelope.size)||envelope.size>4*1024*1024||envelope.mime!=='image/png'||
  !integer(envelope.issuedAt)||!integer(envelope.expiresAt)||envelope.expiresAt<=envelope.issuedAt||envelope.expiresAt-envelope.issuedAt>300000)
  throw fail(400,'Invalid editor completion envelope');
}
function secret(key) {
 if(!key||!id(key.id)||typeof key.secret!=='string'||!/^[a-f0-9]{64}$/.test(key.secret))throw fail(503,'Editor completion signing key is unavailable');
 return Buffer.from(key.secret,'hex');
}
/** Server-only key material. Persistence/rotation and nonce journals belong to the service. */
export function newCompletionKey() {return {id:randomUUID(),secret:randomBytes(32).toString('hex')};}
export function signCompletion(key,claims,{now=Date.now(),ttlMs=120000}={}) {
 const bytes=secret(key);
 if(!claims||Object.keys(claims).some(field=>!fields.includes(field)||['version','eventId','issuedAt','expiresAt','nonce','keyId'].includes(field)))throw fail(400,'Invalid editor completion claims');
 const envelope={...structuredClone(claims),version:1,eventId:randomUUID(),issuedAt:now,expiresAt:now+ttlMs,nonce:randomBytes(24).toString('hex'),keyId:key.id};
 validate(envelope);
 return {...envelope,signature:createHmac('sha256',bytes).update(canonical(envelope)).digest('hex')};
}
export function verifyCompletion(keys,envelope,{now=Date.now()}={}) {
 validate(envelope);
 if(typeof envelope.signature!=='string'||!/^[a-f0-9]{64}$/.test(envelope.signature))throw fail(403,'Editor completion signature is invalid');
 if(!Number.isSafeInteger(now)||envelope.issuedAt>now+10000||envelope.expiresAt<=now)throw fail(403,'Editor completion expired or is not yet valid');
 const key=keys.find(value=>value.id===envelope.keyId);
 if(!key)throw fail(403,'Editor completion signing key is not recognized');
 const expected=createHmac('sha256',secret(key)).update(canonical(envelope)).digest();
 if(!timingSafeEqual(expected,Buffer.from(envelope.signature,'hex')))throw fail(403,'Editor completion signature is invalid');
 return structuredClone(envelope);
}
