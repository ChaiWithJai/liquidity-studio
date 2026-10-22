import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
export const EVIDENCE_RESOURCE='https://studio.chaiwithjai.com/mcp/defiant-evidence';
export const EVIDENCE_ISSUER='https://studio.chaiwithjai.com/oauth/defiant-evidence';
export const EVIDENCE_SCOPE='evidence:read';
const KEY='defiant-evidence-oauth:v1',COOKIE='__Host-defiant_oauth',FIVE=300000,EIGHT=28800000;
const hash=s=>createHash('sha256').update(s).digest('hex');
const random=()=>randomBytes(32).toString('base64url');
const secret=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{43}$/.test(v);
const identifier=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(v)&&v!=='defiant_evidence_poc';
const error=(status,code)=>Object.assign(new Error(code),{status,oauthCode:code});
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===64&&b.length===64&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const exact=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join(',')===[...keys].sort().join(',');
const reject=()=>{throw error(400,'invalid_request');};
export function oauthHostConfiguration(input=['studio.chaiwithjai.com','liquidity-studio-x4fdad2sga-uk.a.run.app']){
 if(typeof input==='string'){if(input.length>1024)throw TypeError('Invalid remote evidence hosts');try{input=JSON.parse(input);}catch{throw TypeError('Invalid remote evidence hosts');}}
 const canonical='studio.chaiwithjai.com',run='liquidity-studio-x4fdad2sga-uk.a.run.app';
 if(!Array.isArray(input)||input.length<1||input.length>4||!input.includes(canonical)||new Set(input).size!==input.length||input.some(h=>typeof h!=='string'||!(h===canonical||h===run||/^[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?---liquidity-studio-x4fdad2sga-uk\.a\.run\.app$/.test(h))))throw TypeError('Invalid remote evidence hosts');
 const hosts=[...new Set([canonical,run,...input])];if(hosts.length>4)throw TypeError('Invalid remote evidence hosts');return Object.freeze(hosts);
}
export function oauthClientConfiguration(input=[]){
 if(!Array.isArray(input)||input.length>2)throw TypeError('Invalid configured OAuth clients');
 const seen=new Set();return input.map(c=>{
  if(!exact(c,['clientId','redirectUri','clientName'])||typeof c.clientId!=='string'||!/^https:\/\/chatgpt\.com\/oauth\/(?:client\.json|[A-Za-z0-9_-]{1,128}\/client\.json)$/.test(c.clientId)||seen.has(c.clientId)||typeof c.redirectUri!=='string'||!/^https:\/\/chatgpt\.com\/(?:connector_platform_oauth_redirect|connector\/oauth\/[A-Za-z0-9_-]{1,128})$/.test(c.redirectUri)||typeof c.clientName!=='string'||!c.clientName||c.clientName.length>200||/[\u0000-\u001f\u007f]/.test(c.clientName))throw TypeError('Invalid configured OAuth client');
  seen.add(c.clientId);return Object.freeze({...c});
 });
}
export function selectCimdAuthentication(metadata,configured){
 if(!metadata||metadata.client_id!==configured.clientId||!Array.isArray(metadata.redirect_uris)||!metadata.redirect_uris.includes(configured.redirectUri))throw error(400,'invalid_client');
 const offered=metadata.token_endpoint_auth_methods_supported===undefined?[metadata.token_endpoint_auth_method||'none']:metadata.token_endpoint_auth_methods_supported;
 if(!Array.isArray(offered)||!offered.length||offered.length>8||!offered.every(v=>typeof v==='string')||!offered.includes('none'))throw error(400,'invalid_client');return 'none';
}
export function authorizationCookie(transactionId,value,maxAge=300){
 if(!secret(transactionId)||!secret(value)||![0,300].includes(maxAge))throw error(400,'invalid_request');
 return `${COOKIE}=${maxAge?transactionId+'.'+value:''}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}
function cookieProof(header,transactionId){
 const matches=(typeof header==='string'?header:'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(COOKIE+'='));
 if(matches.length!==1)throw error(403,'access_denied');const parts=matches[0].slice(COOKIE.length+1).split('.');
 if(parts.length!==2||parts[0]!==transactionId||!secret(parts[0])||!secret(parts[1]))throw error(403,'access_denied');return hash(parts[1]);
}
/** Existing maintained store/managed authority are mandatory; no Google or local-grant token fallback. */
export function createEvidenceOAuth({store,clients=[],inspectClient,approveActor,authorizeDelegate,engineFactory,now=()=>Date.now()}={}){
 const configured=oauthClientConfiguration(clients);
 if(typeof store?.get!=='function'||typeof store?.update!=='function'||[inspectClient,approveActor,authorizeDelegate,engineFactory].some(v=>typeof v!=='function'))throw TypeError('OAuth authority, client verifier and engine required');
 const state=old=>{
  const s=old||{version:1,transactions:[],families:[],tombstones:[],rates:{window:0,authorize:0,token:0,revoke:0}};
  if(s.version!==1||!Array.isArray(s.transactions)||s.transactions.length>128||!Array.isArray(s.families)||s.families.length>64||!Array.isArray(s.tombstones)||s.tombstones.length>4096)throw error(503,'temporarily_unavailable');
  return {...s,transactions:s.transactions.filter(t=>t.expiresAt>now()),families:s.families.filter(g=>g.expiresAt>now()),tombstones:s.tombstones.filter(t=>t.expiresAt>now())};
 };
 const write=fn=>store.update(KEY,old=>fn(state(old)));
 const rate=(s,kind)=>{const window=Math.floor(now()/60000);const rates=s.rates.window===window?{...s.rates}:{window,authorize:0,token:0,revoke:0};if(++rates[kind]>(kind==='authorize'?30:120))throw error(429,'temporarily_unavailable');return {...s,rates};};
 const client=async id=>{const c=configured.find(c=>c.clientId===id);if(!c)throw error(400,'invalid_client');selectCimdAuthentication(await inspectClient(c),c);return {id:c.clientId,redirectUris:[c.redirectUri],grants:['authorization_code','refresh_token'],name:c.clientName};};
 const authority=async g=>{try{if(!await authorizeDelegate({userId:g.userId,uid:g.uid,organizationId:g.organizationId,approvedAt:g.approvedAt}))throw Error();}catch{throw error(403,'access_denied');}};
 const owner=async(bearer,org)=>{if(!identifier(org))reject();let subject;try{subject=await approveActor({token:bearer},org);}catch{throw error(403,'access_denied');}if(!identifier(subject?.userId)||typeof subject.uid!=='string'||!subject.uid||subject.uid.length>128||typeof subject.email!=='string'||subject.email.length>320)throw error(403,'access_denied');return subject;};
 const transaction=(s,id,header)=>{if(!secret(id))reject();const t=s.transactions.find(t=>t.id===id);if(!t||!equal(t.cookieHash,cookieProof(header,id)))throw error(403,'access_denied');return t;};
 function tokenModel(context){
  return {
   getClient:async(id,clientSecret)=>{if(clientSecret!==undefined&&clientSecret!==null&&clientSecret!=='')throw error(400,'invalid_client');return client(id);},
   validateScope:async(user,_client,scope)=>{if(!Array.isArray(scope)||scope.length!==1||scope[0]!==EVIDENCE_SCOPE)throw error(400,'invalid_scope');await authority(user);return [EVIDENCE_SCOPE];},
   generateAuthorizationCode:async()=>random(),generateAccessToken:async()=>random(),generateRefreshToken:async()=>random(),
   saveAuthorizationCode:async(code,c,user)=>{
    await authority(user);await write(s=>{const t=transaction(s,context.transactionId,context.cookie);if(t.status!=='approved'||t.subject.userId!==user.userId||t.subject.uid!==user.uid||t.organizationId!==user.organizationId||t.clientId!==c.id||t.codeHash)throw error(400,'invalid_grant');return {...s,transactions:s.transactions.map(x=>x.id===t.id?{...x,status:'code-issued',codeHash:hash(code.authorizationCode),codeConsumed:false}:x)};});return {...code,client:c,user};
   },
   getAuthorizationCode:async supplied=>{
    if(!secret(supplied))return false;const t=state(await store.get(KEY)).transactions.find(t=>equal(t.codeHash,hash(supplied))&&!t.codeConsumed&&t.status==='code-issued');if(!t||!secret(t.challenge))return false;
    const user={...t.subject,organizationId:t.organizationId,approvedAt:t.approvedAt,expiresAt:t.grantExpiresAt};await authority(user);context.codeId=t.id;context.codeHash=t.codeHash;return {authorizationCode:supplied,expiresAt:new Date(t.expiresAt),redirectUri:t.redirectUri,scope:[EVIDENCE_SCOPE],client:{id:t.clientId},user,codeChallenge:t.challenge,codeChallengeMethod:'S256'};
   },
   revokeAuthorizationCode:async()=>{let accepted=false;await write(s=>{accepted=false;const t=s.transactions.find(t=>t.id===context.codeId);if(!t||t.codeConsumed||!equal(t.codeHash,context.codeHash))return s;accepted=true;return {...s,transactions:s.transactions.map(x=>x.id===t.id?{...x,codeConsumed:true}:x)};});return accepted;},
   getRefreshToken:async supplied=>{
    if(!secret(supplied))return false;const digest=hash(supplied);const s=state(await store.get(KEY));const old=s.tombstones.find(t=>equal(t.hash,digest));if(old){await write(current=>({...current,families:current.families.map(g=>g.id===old.familyId&&g.clientId===context.clientId?{...g,revoked:true}:g)}));return false;}
    const g=s.families.find(g=>!g.revoked&&equal(g.refreshHash,digest)&&g.clientId===context.clientId);if(!g)return false;await authority(g);context.familyId=g.id;context.refreshHash=digest;context.expiresAt=g.expiresAt;return {refreshToken:supplied,refreshTokenExpiresAt:new Date(g.expiresAt),scope:[EVIDENCE_SCOPE],client:{id:g.clientId},user:{userId:g.userId,uid:g.uid,organizationId:g.organizationId,approvedAt:g.approvedAt,expiresAt:g.expiresAt}};
   },
   revokeToken:async()=>{let accepted=false;await write(s=>{accepted=false;const g=s.families.find(g=>g.id===context.familyId);if(!g||g.revoked||g.clientId!==context.clientId||!equal(g.refreshHash,context.refreshHash))return s;if(s.tombstones.length>=4096)throw error(503,'temporarily_unavailable');const window=Math.floor(now()/60000);const count=g.refreshWindow===window?(g.refreshCount||0):0;if(count>=10)throw error(429,'temporarily_unavailable');accepted=true;context.claim=random();return {...s,tombstones:[...s.tombstones,{hash:g.refreshHash,familyId:g.id,expiresAt:g.expiresAt}],families:s.families.map(x=>x.id===g.id?{...x,accessHash:null,refreshHash:null,claim:context.claim,refreshWindow:window,refreshCount:count+1}:x)};});return accepted;},
   saveToken:async(token,c,user)=>{
    await authority(user);const absolute=user.expiresAt;if(!Number.isSafeInteger(absolute)||absolute<=now())throw error(400,'invalid_grant');const accessExpiry=Math.min(now()+FIVE,absolute),familyId=context.familyId||randomBytes(16).toString('hex');
    await write(s=>{if(context.familyId){const g=s.families.find(g=>g.id===familyId);if(!g||g.revoked||g.claim!==context.claim||g.expiresAt!==absolute||g.clientId!==c.id)throw error(400,'invalid_grant');}else{const t=s.transactions.find(t=>t.id===context.codeId);if(!t?.codeConsumed||t.status!=='code-issued'||t.grantId||!equal(t.codeHash,context.codeHash))throw error(400,'invalid_grant');if(s.families.length>=64)throw error(503,'temporarily_unavailable');}
     const grant={id:familyId,userId:user.userId,uid:user.uid,organizationId:user.organizationId,approvedAt:user.approvedAt,expiresAt:absolute,accessExpiresAt:accessExpiry,clientId:c.id,clientName:c.name,resource:EVIDENCE_RESOURCE,scope:EVIDENCE_SCOPE,accessHash:hash(token.accessToken),refreshHash:hash(token.refreshToken),revoked:false};return {...s,transactions:s.transactions.map(t=>t.id===context.codeId?{...t,grantId:familyId}:t),families:context.familyId?s.families.map(g=>g.id===familyId?{...g,...grant,claim:null}:g):[...s.families,grant]};});
    return {...token,accessTokenExpiresAt:new Date(accessExpiry),refreshTokenExpiresAt:new Date(absolute),scope:[EVIDENCE_SCOPE],client:c,user};
   }
  };
 }
 return {
  configuredClients:configured,
  async begin(input){
   const keys=['client_id','redirect_uri','resource','scope','response_type','state','code_challenge','code_challenge_method'];
   // Optional presentation hint only: never changes issuer, resource, scope or authority.
   if((input&&typeof input==='object'&&!Array.isArray(input))&&Object.hasOwn(input,'ui_locales')){if(typeof input.ui_locales!=='string'||input.ui_locales.length>128||/[\u0000-\u001f\u007f]/.test(input.ui_locales)||!/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*(?: [A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*){0,3}(?![\s\S])/.test(input.ui_locales))reject();keys.push('ui_locales');}
   if(!exact(input,keys)||input.resource!==EVIDENCE_RESOURCE||input.scope!==EVIDENCE_SCOPE||input.response_type!=='code'||input.code_challenge_method!=='S256'||!secret(input.code_challenge)||typeof input.state!=='string'||!input.state||input.state.length>512||/[^\x20-\x7e]/.test(input.state))reject();await write(s=>rate(s,'authorize'));const c=await client(input.client_id);if(input.redirect_uri!==c.redirectUris[0])throw error(400,'invalid_client');
   const id=random(),cookie=random(),expiresAt=now()+FIVE;await write(s=>{if(s.transactions.length>=128)throw error(503,'temporarily_unavailable');return {...s,transactions:[...s.transactions,{id,cookieHash:hash(cookie),clientId:c.id,clientName:c.name,resource:EVIDENCE_RESOURCE,redirectUri:input.redirect_uri,state:input.state,challenge:input.code_challenge,expiresAt,status:'pending',inspections:[],attempts:0,decisionAttempts:0}]};});return {transactionId:id,location:`https://studio.chaiwithjai.com/?tab=strategy&remoteEvidenceTransaction=${id}`,cookie:authorizationCookie(id,cookie)};
  },
  async inspect({bearer,organizationId,transactionId,cookie}){
   const subject=await owner(bearer,organizationId),proof=random();let output;await write(s=>{const t=transaction(s,transactionId,cookie);if(t.status!=='pending'||t.attempts>=5)throw error(403,'access_denied');output={transactionId:t.id,organizationId,inspectionToken:proof,clientId:t.clientId,clientName:t.clientName,resource:t.resource,scope:EVIDENCE_SCOPE,maxLifetimeMs:EIGHT,expiresAt:t.expiresAt,status:'pending',owner:{userId:subject.userId,email:subject.email}};return {...s,transactions:s.transactions.map(x=>x.id===t.id?{...x,attempts:x.attempts+1,inspections:[...x.inspections,{hash:hash(proof),subject,organizationId}]}:x)};});return output;
  },
  async decide({bearer,organizationId,transactionId,inspectionToken,cookie,approved}){
   if(typeof approved!=='boolean'||!secret(inspectionToken))reject();const subject=await owner(bearer,organizationId);const approvedAt=new Date(now()).toISOString();await authority({...subject,organizationId,approvedAt});let accepted=false;await write(s=>{accepted=false;const t=transaction(s,transactionId,cookie);if(t.status!=='pending'||t.decisionAttempts>=5)throw error(403,'access_denied');const inspection=t.inspections.find(i=>equal(i.hash,hash(inspectionToken)));accepted=Boolean(inspection&&inspection.organizationId===organizationId&&inspection.subject.userId===subject.userId&&inspection.subject.uid===subject.uid);return {...s,transactions:s.transactions.map(x=>x.id!==t.id?x:accepted?{...x,status:approved?'approved':'denied',subject,organizationId,approvedAt,grantExpiresAt:now()+EIGHT,inspections:[],decisionAttempts:x.decisionAttempts+1}:{...x,decisionAttempts:x.decisionAttempts+1})};});if(!accepted)throw error(403,'access_denied');return {completed:true,completionUrl:`https://studio.chaiwithjai.com/oauth/defiant-evidence/complete?transaction=${transactionId}`};
  },
  async complete({transactionId,cookie}){
   const t=transaction(state(await store.get(KEY)),transactionId,cookie);if(!['approved','denied'].includes(t.status))throw error(403,'access_denied');let location;
   if(t.status==='denied'){await write(s=>{const current=transaction(s,transactionId,cookie);if(current.status!=='denied')throw error(403,'access_denied');return {...s,transactions:s.transactions.map(x=>x.id===t.id?{...x,status:'completed-denial'}:x)};});location=new URL(t.redirectUri);location.searchParams.set('error','access_denied');location.searchParams.set('state',t.state);}
   else{
    const context={transactionId,cookie},model=tokenModel(context),engine=await engineFactory(model);const response=await engine.authorize({client_id:t.clientId,redirect_uri:t.redirectUri,resource:t.resource,response_type:'code',scope:EVIDENCE_SCOPE,state:t.state,code_challenge:t.challenge,code_challenge_method:'S256'},{...t.subject,organizationId:t.organizationId,approvedAt:t.approvedAt,expiresAt:t.grantExpiresAt});location=new URL(t.redirectUri);location.searchParams.set('code',response.authorizationCode);location.searchParams.set('state',t.state);
   }
   location.searchParams.set('iss',EVIDENCE_ISSUER);return {location:location.href,cookie:authorizationCookie(transactionId,random(),0)};
  },
  async token(input){
   if(!input||typeof input!=='object'||Array.isArray(input)||input.resource!==EVIDENCE_RESOURCE||!['authorization_code','refresh_token'].includes(input.grant_type))reject();const required=input.grant_type==='authorization_code'?['grant_type','client_id','resource','code','redirect_uri','code_verifier']:['grant_type','client_id','resource','refresh_token'];if(!exact(input,required))reject();await write(s=>rate(s,'token'));const c=await client(input.client_id);if(input.grant_type==='authorization_code'&&input.redirect_uri!==c.redirectUris[0])reject();const context={clientId:c.id},engine=await engineFactory(tokenModel(context));return engine.token(input);
  },
  async verifyAccessToken(supplied){
   if(!secret(supplied))throw error(401,'invalid_token');let g=state(await store.get(KEY)).families.find(g=>!g.revoked&&equal(g.accessHash,hash(supplied)));if(!g||g.accessExpiresAt<=now()||g.expiresAt<=now()||g.resource!==EVIDENCE_RESOURCE||!configured.some(c=>c.clientId===g.clientId))throw error(401,'invalid_token');if(g.scope!==EVIDENCE_SCOPE)throw error(403,'insufficient_scope');await authority(g);const latest=state(await store.get(KEY)).families.find(x=>x.id===g.id&&!x.revoked&&equal(x.accessHash,hash(supplied))&&x.accessExpiresAt>now());if(!latest||latest.resource!==EVIDENCE_RESOURCE||latest.clientId!==g.clientId||latest.organizationId!==g.organizationId||latest.userId!==g.userId||latest.uid!==g.uid)throw error(401,'invalid_token');return {...latest};
  },
  async revokePublic({token,client_id}){
   await write(s=>{s=rate(s,'revoke');const c=configured.find(c=>c.clientId===client_id);if(!c||!secret(token))return s;const digest=hash(token),g=s.families.find(g=>g.clientId===c.clientId&&g.resource===EVIDENCE_RESOURCE&&(equal(g.accessHash,digest)||equal(g.refreshHash,digest)||s.tombstones.some(t=>t.familyId===g.id&&equal(t.hash,digest))));if(!g)return s;return {...s,families:s.families.map(x=>x.id===g.id?{...x,revoked:true}:x)};});return {};
  },
  async list({bearer,organizationId}){const subject=await owner(bearer,organizationId);return {organizationId,grants:state(await store.get(KEY)).families.filter(g=>!g.revoked&&g.organizationId===organizationId&&g.userId===subject.userId&&g.uid===subject.uid).map(g=>({grantId:g.id,clientId:g.clientId,clientName:g.clientName,organizationId:g.organizationId,approvedAt:g.approvedAt,expiresAt:g.expiresAt,scope:EVIDENCE_SCOPE,readOnly:true}))};},
  async revokeOwner({bearer,organizationId,grantId}){const subject=await owner(bearer,organizationId);if(typeof grantId!=='string'||!/^[a-f0-9]{32}$/.test(grantId))reject();await write(s=>{const g=s.families.find(g=>g.id===grantId&&g.organizationId===organizationId&&g.userId===subject.userId&&g.uid===subject.uid);if(!g)throw error(403,'access_denied');return {...s,families:s.families.map(x=>x.id===g.id?{...x,revoked:true}:x)};});return {revoked:true};}
 };
}
