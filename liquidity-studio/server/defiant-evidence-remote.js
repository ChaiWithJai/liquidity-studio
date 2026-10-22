import {createMcpHandler,McpServer,requireBearerAuth,oauthMetadataResponse,OAuthError,OAuthErrorCode} from '@modelcontextprotocol/server';
import {toNodeHandler} from '@modelcontextprotocol/node';
import {registerDefiantEvidenceTools} from './defiant-evidence-mcp.js';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {createEvidenceOAuth,EVIDENCE_RESOURCE,EVIDENCE_ISSUER,EVIDENCE_SCOPE,oauthClientConfiguration} from './defiant-evidence-oauth.js';
import {createEvidenceOAuthEngine} from './defiant-evidence-oauth-engine.js';
import {createCimdInspector} from './defiant-evidence-oauth-client.js';
const AUTH='/oauth/defiant-evidence',API='/api/studio/remote-evidence/';
const fail=(status,code)=>Object.assign(new Error(code),{status,oauthCode:code});
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
const exact=(v,keys)=>plain(v)&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Pragma':'no-cache','Referrer-Policy':'no-referrer',...headers}});
export async function readRemoteBody(request,max,signal=request.signal){
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();const buffer=new Uint8Array(max);let size=0,chunks=0;let aborted;const abort=new Promise((_,reject)=>{aborted=()=>reject(fail(408,'temporarily_unavailable'));if(signal?.aborted)aborted();else signal?.addEventListener('abort',aborted,{once:true});});
 try{for(;;){const p=await Promise.race([reader.read(),abort]);if(p.done)break;if(!(p.value instanceof Uint8Array)||++chunks>65536||p.value.byteLength>buffer.length-size)throw fail(400,'invalid_request');buffer.set(p.value,size);size+=p.value.byteLength;}return buffer.subarray(0,size);}finally{signal?.removeEventListener('abort',aborted);void reader.cancel().catch(()=>{});}
}
function fields(params){const data={};for(const [k,v] of params){if(Object.hasOwn(data,k)||k==='__proto__'||k==='constructor'||v.length>2048)throw fail(400,'invalid_request');data[k]=v;}return data;}
export function remoteEvidenceConfiguration(raw='[]'){if(typeof raw!=='string'||raw.length>8192)throw TypeError('Invalid remote evidence clients');return oauthClientConfiguration(JSON.parse(raw));}
/** Constructor-only private provider and managed current authority. No anonymous or synthetic fallback. */
export function createRemoteEvidence({platform,provider,authorizeEvidence,clients=[],allowedHosts=['studio.chaiwithjai.com'],fetchImpl=fetch}={}){
 if(platform?.identity?.mode!=='google'||typeof provider!=='function'||typeof authorizeEvidence!=='function'||!Array.isArray(allowedHosts)||!allowedHosts.length||allowedHosts.length>4||allowedHosts.some(h=>typeof h!=='string'||!h||/[\s/:]/.test(h)))throw TypeError('Managed private remote evidence wiring required');
 const identity=platform.identity,strategy=organizationId=>({raw:actor=>authorizeEvidence(actor,organizationId)});
 const oauth=createEvidenceOAuth({store:platform.store,clients,inspectClient:createCimdInspector({fetchImpl}),engineFactory:createEvidenceOAuthEngine,
  approveActor:async({token},organizationId)=>{const user=await identity.authenticateLocalEvidenceApproval(token);await strategy(organizationId).raw(user);return {userId:user.id,uid:user.uid,email:user.email};},
  authorizeDelegate:async grant=>{const user=await identity.authorizeLocalEvidenceActor(grant.userId,grant.uid,grant.approvedAt);await strategy(grant.organizationId).raw(user);return true;}});
 const oauthMetadata={issuer:EVIDENCE_ISSUER,authorization_endpoint:EVIDENCE_ISSUER+'/authorize',token_endpoint:EVIDENCE_ISSUER+'/token',revocation_endpoint:EVIDENCE_ISSUER+'/revoke',response_types_supported:['code'],grant_types_supported:['authorization_code','refresh_token'],code_challenge_methods_supported:['S256'],scopes_supported:[EVIDENCE_SCOPE],token_endpoint_auth_methods_supported:['none'],client_id_metadata_document_supported:true,authorization_response_iss_parameter_supported:true};
 const challenge=()=>`Bearer resource_metadata="https://studio.chaiwithjai.com/.well-known/oauth-protected-resource/mcp/defiant-evidence", scope="${EVIDENCE_SCOPE}"`;
 const gate=requireBearerAuth({verifier:{verifyAccessToken:async token=>{try{const g=await oauth.verifyAccessToken(token);return {token,clientId:g.clientId,scopes:[g.scope],expiresAt:g.accessExpiresAt/1000,resource:new URL(EVIDENCE_RESOURCE)};}catch(error){if(error.status===403)throw error;throw new OAuthError(OAuthErrorCode.InvalidToken,'Authorization required');}}},requiredScopes:[EVIDENCE_SCOPE],expectedResource:new URL(EVIDENCE_RESOURCE),resourceMetadataUrl:new URL('https://studio.chaiwithjai.com/.well-known/oauth-protected-resource/mcp/defiant-evidence')});
 async function route(request,operationSignal){
  const url=new URL(request.url),path=url.pathname;
  if(!allowedHosts.includes(url.host)||(request.headers.has('origin')&&!['https://studio.chaiwithjai.com','https://chatgpt.com'].includes(request.headers.get('origin'))))return json({error:'access_denied'},403);
  if(path==='/.well-known/oauth-authorization-server/oauth/defiant-evidence'){if(url.search)return json({error:'invalid_request'},400);if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, OPTIONS'}});if(request.method!=='GET')return json({error:'invalid_request'},405);return json(oauthMetadata,200,{'Access-Control-Allow-Origin':'*'});}
  const metadata=oauthMetadataResponse(request,{oauthMetadata,resourceServerUrl:new URL(EVIDENCE_RESOURCE),scopesSupported:[EVIDENCE_SCOPE]});if(metadata)return metadata;
  try{
   if(path===AUTH+'/authorize'){
    if(request.method!=='GET')return json({error:'invalid_request'},405);const result=await oauth.begin(fields(url.searchParams));return new Response(null,{status:302,headers:{Location:result.location,'Set-Cookie':result.cookie,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
   }
   if(path===AUTH+'/complete'){
    if(request.method!=='GET')return json({error:'invalid_request'},405);const input=fields(url.searchParams);if(!exact(input,['transaction']))throw fail(400,'invalid_request');const result=await oauth.complete({transactionId:input.transaction,cookie:request.headers.get('cookie')});return new Response(null,{status:302,headers:{Location:result.location,'Set-Cookie':result.cookie,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
   }
   if(path===AUTH+'/token'||path===AUTH+'/revoke'){
    if(request.method!=='POST'||url.search||!/^application\/x-www-form-urlencoded(?:;|$)/i.test(request.headers.get('content-type')||''))throw fail(400,'invalid_request');const input=fields(new URLSearchParams(new TextDecoder('utf-8',{fatal:true}).decode(await readRemoteBody(request,8192))));
    if(path.endsWith('/revoke')){if(!exact(input,['token','client_id']))throw fail(400,'invalid_request');return json(await oauth.revokePublic(input));}return json(await oauth.token(input));
   }
   if(path.startsWith(API)){
    const operation=path.slice(API.length),keys={inspect:['organizationId','transactionId'],approve:['organizationId','transactionId','inspectionToken'],deny:['organizationId','transactionId','inspectionToken'],list:['organizationId'],revoke:['organizationId','grantId']};
    if(!Object.hasOwn(keys,operation))return json({error:'not_found'},404);if(request.method!=='POST'||url.search||!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))throw fail(400,'invalid_request');const input=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await readRemoteBody(request,4096)));if(!exact(input,keys[operation]))throw fail(400,'invalid_request');const bearer=/^Bearer ([^\s]+)$/.exec(request.headers.get('authorization')||'')?.[1];if(!bearer||bearer.startsWith('ea.')||bearer.startsWith('er.'))throw fail(403,'access_denied');const args={...input,bearer,cookie:request.headers.get('cookie')};
    if(operation==='inspect')return json(await oauth.inspect(args));if(operation==='approve'||operation==='deny')return json(await oauth.decide({...args,approved:operation==='approve'}));if(operation==='list')return json(await oauth.list(args));return json(await oauth.revokeOwner(args));
   }
   if(path==='/mcp/defiant-evidence'){
    if(url.search)return json({error:'invalid_request'},400);
    // Check managed authority before SDK gate to retain current-membership403 rather than500.
    const supplied=/^Bearer ([^\s]+)$/.exec(request.headers.get('authorization')||'')?.[1];let verified;
    if(supplied){try{verified=await oauth.verifyAccessToken(supplied);}catch(error){if(error.status===403)return json({error:error.oauthCode},403,error.oauthCode==='insufficient_scope'?{'WWW-Authenticate':challenge()+', error="insufficient_scope"'}:{});}}
    const auth=await gate(request);if(auth instanceof Response)return auth;if(!verified)return json({error:'invalid_token'},401,{'WWW-Authenticate':challenge()});
    const handler=createMcpHandler(()=>{const server=new McpServer({name:'defiant-private-evidence',version:'1.0.0'});const registration={registerTool:(name,config,callback)=>server.registerTool(name,{...config,securitySchemes:[{type:'oauth2',scopes:[EVIDENCE_SCOPE]}],_meta:{...config._meta,securitySchemes:[{type:'oauth2',scopes:[EVIDENCE_SCOPE]}]},callback)};registerDefiantEvidenceTools(registration,{unauthorizedChallenge:challenge()+', error="invalid_token", error_description="Evidence authorization required"',resolveEvidence:async({organizationId})=>{
     const grant=await oauth.verifyAccessToken(auth.token);if(grant.organizationId!==organizationId)throw fail(403,'access_denied');const user=await identity.authorizeLocalEvidenceActor(grant.userId,grant.uid,grant.approvedAt);await strategy(organizationId).raw(user);let binding;try{binding=await provider({organizationId,actor:user});}catch{throw fail(503,'temporarily_unavailable');}if(!binding||typeof binding.loadSnapshot!=='function')throw fail(403,'access_denied');
     const service=createDefiantEvidenceService({organizationId,loadSnapshot:binding.loadSnapshot,loadSourceRecords:binding.loadSourceRecords,loadWorksheetCells:binding.loadWorksheetCells,authorize:async actor=>{const current=await oauth.verifyAccessToken(auth.token);if(current.organizationId!==organizationId||current.userId!==actor.id)throw fail(403,'access_denied');await strategy(organizationId).raw(actor);return true;}});return {organizationId,actor:user,service};}});return server;},{responseMode:'json'});
    try{const response=await handler.fetch(request,{authInfo:auth});const body=await readRemoteBody(response,4*1024*1024,operationSignal);return new Response(body,{status:response.status,headers:response.headers});}finally{await handler.close();}
   }
   return json({error:'not_found'},404);
  }catch(error){const status=[400,401,403,429,503].includes(error.status)?error.status:400;return json({error:['invalid_request','invalid_client','invalid_grant','invalid_scope','invalid_token','insufficient_scope','access_denied','temporarily_unavailable'].includes(error.oauthCode)?error.oauthCode:'invalid_request'},status,status===401?{'WWW-Authenticate':challenge()}:{});}
 }
 // Raw Node adapter bounds the body before SDK parsing. Deadline destroys the request;
 // no API credential is read from cookies on the MCP route.
 async function serve(request){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),new URL(request.url).pathname.startsWith('/mcp/')?30000:5000);let onAbort;const abort=new Promise((_,reject)=>{onAbort=()=>{controller.abort();reject(fail(408,'temporarily_unavailable'));};if(request.signal.aborted)onAbort();else request.signal.addEventListener('abort',onAbort,{once:true});controller.signal.addEventListener('abort',()=>reject(fail(408,'temporarily_unavailable')),{once:true});});try{return await Promise.race([route(new Request(request,{signal:controller.signal}),controller.signal),abort]);}catch{return json({error:'temporarily_unavailable'},408);}finally{clearTimeout(timer);request.signal.removeEventListener('abort',onAbort);controller.abort();}}
 const node=toNodeHandler({fetch:serve},{maxRequestBodySize:65536});
 return {handle:async(req,res)=>{if(typeof req.headers.host!=='string'||!allowedHosts.includes(req.headers.host)||(req.headers.origin!==undefined&&(typeof req.headers.origin!=='string'||!['https://studio.chaiwithjai.com','https://chatgpt.com'].includes(req.headers.origin)))){res.writeHead(403,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'access_denied'}));return;}const timer=setTimeout(()=>{req.destroy();if(!res.headersSent){res.writeHead(408);res.end();}},req.url?.startsWith('/mcp/')?30000:5000);try{await node(req,res);}finally{clearTimeout(timer);}},fetch:serve};
}
