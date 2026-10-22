import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
const KEY='defiant-local-evidence-grants:v1';
const denied=()=>Object.assign(new Error('Local evidence authorization unavailable'),{status:403});
const digest=v=>createHash('sha256').update(v).digest('hex');
const match=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===64&&b.length===64&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const scope=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(v)&&v!=='defiant_evidence_poc';
const secret=()=>randomBytes(32).toString('base64url');
const id=()=>randomBytes(16).toString('hex');
const validSecret=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{43}$/.test(v);
const token=(kind,grantId,value)=>`${kind}.${grantId}.${value}`;
function parse(value,kind){if(typeof value!=='string'||value.length>100)throw denied();const [k,g,s,...rest]=value.split('.');if(k!==kind||rest.length||!/^[a-f0-9]{32}$/.test(g)||!validSecret(s))throw denied();return {id:g,hash:digest(s)};}
/** Injected authority is mandatory; this module does not create or impersonate Studio identities. */
export function createLocalEvidenceGrants({store,approveActor,authorizeDelegate,now=()=>Date.now()}={}){
 if(typeof store?.update!=='function'||typeof store?.get!=='function'||typeof approveActor!=='function'||typeof authorizeDelegate!=='function')throw TypeError('Maintained delegated authority required');
 const state=old=>{const value=old||{version:1,pairs:[],grants:[],window:0,starts:0};if(value.version!==1||!Array.isArray(value.pairs)||!Array.isArray(value.grants)||value.pairs.length>128||value.grants.length>64)throw denied();return {...value,pairs:value.pairs.filter(p=>p.expiresAt>now()),grants:value.grants.filter(g=>g.expiresAt>now())};};
 const authority=async g=>{try{if(!await authorizeDelegate({userId:g.userId,uid:g.uid,organizationId:g.organizationId,approvedAt:g.approvedAt}))throw denied();}catch{throw denied();}};
 const find=async grantId=>{const g=state(await store.get(KEY)).grants.find(g=>g.id===grantId);if(!g||g.revoked)throw denied();return g;};
 return {
  async begin({organizationId,verifierHash,clientName}){
   if(!scope(organizationId)||typeof verifierHash!=='string'||!/^[a-f0-9]{64}$/.test(verifierHash)||typeof clientName!=='string'||!clientName.trim()||clientName.length>80||/[\x00-\x1f\x7f]/.test(clientName))throw denied();
   const pairingId=id(),expiresAt=now()+300000;
   await store.update(KEY,old=>{const s=state(old),window=Math.floor(now()/60000),starts=s.window===window?s.starts:0;if(s.pairs.length>=128||starts>=30)throw denied();return {...s,window,starts:starts+1,pairs:[...s.pairs,{id:pairingId,organizationId,verifierHash,clientName,expiresAt,attempts:0}]};});
   return {pairingId,expiresAt,organizationId,clientName};
  },
  async inspect(actor,pairingId,organizationId){
   if(!scope(organizationId)||typeof pairingId!=='string'||!/^[a-f0-9]{32}$/.test(pairingId))throw denied();
   let subject;try{subject=await approveActor(actor,organizationId);}catch{throw denied();}
   if(!scope(subject?.userId)||typeof subject.uid!=='string'||!subject.uid)throw denied();
   const p=state(await store.get(KEY)).pairs.find(p=>p.id===pairingId);if(!p||p.organizationId!==organizationId||p.attempts>=5)throw denied();
   return {pairingId:p.id,organizationId:p.organizationId,clientName:p.clientName,expiresAt:p.expiresAt,approved:Boolean(p.subject),scope:'evidence:read',maximumGrantLifetimeMs:28800000};
  },
  async approve(actor,pairingId,organizationId){
   if(!scope(organizationId)||typeof pairingId!=='string'||!/^[a-f0-9]{32}$/.test(pairingId))throw denied();
   let subject;try{subject=await approveActor(actor,organizationId);}catch{throw denied();}
   if(!scope(subject?.userId)||typeof subject.uid!=='string'||!subject.uid||subject.uid.length>128)throw denied();
   const approvedAt=new Date(now()).toISOString();
   await authority({...subject,organizationId,approvedAt});
   await store.update(KEY,old=>{const s=state(old),p=s.pairs.find(p=>p.id===pairingId);if(!p||p.organizationId!==organizationId||p.subject||p.attempts>=5)throw denied();return {...s,pairs:s.pairs.map(p=>p.id===pairingId?{...p,subject:{userId:subject.userId,uid:subject.uid},approvedAt,grantExpiresAt:Date.parse(approvedAt)+28800000}:p)};});
   return {approved:true,organizationId};
  },
  async exchange(pairingId,verifier){
   if(typeof pairingId!=='string'||!/^[a-f0-9]{32}$/.test(pairingId)||!validSecret(verifier))throw denied();
   const p=state(await store.get(KEY)).pairs.find(p=>p.id===pairingId);if(!p?.subject)throw denied();await authority({...p.subject,organizationId:p.organizationId,approvedAt:p.approvedAt});
   const grantId=id(),access=secret(),renewal=secret();let accepted=false,result;
   await store.update(KEY,old=>{accepted=false;const s=state(old),pair=s.pairs.find(p=>p.id===pairingId);if(!pair?.subject||pair.attempts>=5||s.grants.length>=64)throw denied();if(!match(pair.verifierHash,digest(verifier)))return {...s,pairs:s.pairs.map(p=>p.id===pairingId?{...p,attempts:p.attempts+1}:p)};
    if(pair.subject.userId!==p.subject.userId||pair.subject.uid!==p.subject.uid||pair.organizationId!==p.organizationId||pair.approvedAt!==p.approvedAt)throw denied();
    const grant={id:grantId,...pair.subject,organizationId:pair.organizationId,approvedAt:pair.approvedAt,expiresAt:pair.grantExpiresAt,accessExpiresAt:Math.min(now()+300000,pair.grantExpiresAt),accessHash:digest(access),renewalHash:digest(renewal),revoked:false};accepted=true;result=grant;return {...s,pairs:s.pairs.filter(p=>p.id!==pairingId),grants:[...s.grants,grant]};});
   if(!accepted)throw denied();return {organizationId:result.organizationId,accessToken:token('ea',grantId,access),renewalToken:token('er',grantId,renewal),accessExpiresAt:result.accessExpiresAt,expiresAt:result.expiresAt};
  },
  async renew(renewalToken,organizationId){
   const supplied=parse(renewalToken,'er'),g=await find(supplied.id);if(g.organizationId!==organizationId||!match(g.renewalHash,supplied.hash))throw denied();await authority(g);const access=secret(),renewal=secret();let result;
   await store.update(KEY,old=>{const s=state(old),current=s.grants.find(g=>g.id===supplied.id);if(!current||current.revoked||current.organizationId!==organizationId||!match(current.renewalHash,supplied.hash))throw denied();result={...current,accessHash:digest(access),renewalHash:digest(renewal),accessExpiresAt:Math.min(now()+300000,current.expiresAt)};return {...s,grants:s.grants.map(g=>g.id===current.id?result:g)};});
   return {organizationId,accessToken:token('ea',g.id,access),renewalToken:token('er',g.id,renewal),accessExpiresAt:result.accessExpiresAt,expiresAt:result.expiresAt};
  },
  async authorize(accessToken,organizationId){
   const supplied=parse(accessToken,'ea');let g=await find(supplied.id);if(g.organizationId!==organizationId||g.accessExpiresAt<=now()||!match(g.accessHash,supplied.hash))throw denied();await authority(g);g=await find(supplied.id);if(g.organizationId!==organizationId||g.accessExpiresAt<=now()||!match(g.accessHash,supplied.hash))throw denied();return {userId:g.userId,uid:g.uid,organizationId:g.organizationId,grantId:g.id};
  },
  async revoke(actor,grantId,organizationId){
   const g=await find(grantId);let subject;try{subject=await approveActor(actor,organizationId);}catch{throw denied();}if(g.organizationId!==organizationId||subject?.userId!==g.userId||subject?.uid!==g.uid)throw denied();
   await store.update(KEY,old=>{const s=state(old),current=s.grants.find(g=>g.id===grantId);if(!current||current.userId!==subject.userId||current.uid!==subject.uid||current.organizationId!==organizationId)throw denied();return {...s,grants:s.grants.map(g=>g.id===grantId?{...g,revoked:true}:g)};});return {revoked:true};
  }
 };
}
