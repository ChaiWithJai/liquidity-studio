import {createLocalEvidenceGrants} from './defiant-local-evidence-grants.js';
import {DefiantStrategyService} from './defiant-strategy.js';
import {fail} from './auth.js';
const prefix='/api/studio/local-evidence/';
const keys={list:['organizationId'],begin:['organizationId','verifierHash','clientName'],inspect:['organizationId','pairingId'],approve:['organizationId','pairingId'],exchange:['pairingId','verifier'],renew:['organizationId','renewalToken'],revoke:['organizationId','grantId']};
/** Separate scoped authority; never a fallback for general Studio authentication. */
export function createLocalEvidenceHttp({platform}){
 const identity=platform.identity;
 if(identity.mode!=='google'||typeof identity.authenticateLocalEvidenceApproval!=='function'||typeof identity.authorizeLocalEvidenceActor!=='function')throw Error('Managed Google evidence authority required');
 const strategy=organizationId=>new DefiantStrategyService({store:platform.store,identity,organizationId});
 const grants=createLocalEvidenceGrants({store:platform.store,
  approveActor:async({token},organizationId)=>{const user=await identity.authenticateLocalEvidenceApproval(token);await strategy(organizationId).raw(user);return {userId:user.id,uid:user.uid};},
  authorizeDelegate:async({userId,uid,organizationId,approvedAt})=>{const user=await identity.authorizeLocalEvidenceActor(userId,uid,approvedAt);await strategy(organizationId).raw(user);return true;}
 });
 let rateWindow=0,rateCount=0;
 return {
  matches:route=>route.startsWith(prefix),
  async request({route,method,body,bearer}){
   const window=Math.floor(Date.now()/60000);if(window!==rateWindow){rateWindow=window;rateCount=0;}if(++rateCount>180)throw fail(429,'Local evidence pairing rate exceeded');
   const operation=route.slice(prefix.length);
   if(!Object.hasOwn(keys,operation))throw fail(404,'Local evidence route unavailable');
   const expected=keys[operation];if(method!=='POST')throw fail(405,'Local evidence pairing requires POST');
   if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).sort().join(',')!==[...expected].sort().join(','))throw fail(400,'Invalid local evidence request');
   try{
    if(operation==='begin')return await grants.begin(body);
    if(operation==='exchange')return await grants.exchange(body.pairingId,body.verifier);
    if(operation==='renew')return await grants.renew(body.renewalToken,body.organizationId);
    if(!bearer||bearer.startsWith('ea.')||bearer.startsWith('er.'))throw fail(403,'Denied');
    if(operation==='list')return await grants.list({token:bearer},body.organizationId);
    if(operation==='inspect')return await grants.inspect({token:bearer},body.pairingId,body.organizationId);
    if(operation==='approve')return await grants.approve({token:bearer},body.pairingId,body.organizationId);
    return await grants.revoke({token:bearer},body.grantId,body.organizationId);
   }catch{throw fail(403,'Local evidence authorization unavailable');}
  },
  async authorize(bearer,organizationId){const grant=await grants.authorize(bearer,organizationId);return identity.authorizeLocalEvidenceActor(grant.userId,grant.uid);}
 };
}
