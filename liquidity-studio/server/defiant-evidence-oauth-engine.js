import OAuth2Server from '@node-oauth/oauth2-server';
/** Actual standards engine; each request receives its own model/claim context. */
export function createEvidenceOAuthEngine(model){
 const server=new OAuth2Server({model,authorizationCodeLifetime:300,accessTokenLifetime:300,refreshTokenLifetime:28800,requirePKCE:true,enablePlainPKCE:false,alwaysIssueNewRefreshToken:true,allowEmptyState:false});
 const request=(method,body)=>new OAuth2Server.Request({method,headers:{'content-type':'application/x-www-form-urlencoded','content-length':String(Buffer.byteLength(new URLSearchParams(body).toString()))},query:{},body});
 const finite=error=>Object.assign(new Error('OAuth request unavailable'),{status:[400,401,403,429,503].includes(error.status||error.code)?(error.status||error.code):400,oauthCode:['invalid_client','invalid_grant','invalid_request','invalid_scope','access_denied','temporarily_unavailable'].includes(error.oauthCode||error.name)?(error.oauthCode||error.name):'invalid_request'});
 return {
  async authorize(input,user){const response=new OAuth2Server.Response();try{return await server.authorize(request('POST',input),response,{authenticateHandler:{handle:async()=>user}});}catch(error){throw finite(error);}},
  async token(input){const response=new OAuth2Server.Response();try{await server.token(request('POST',input),response,{requireClientAuthentication:{authorization_code:false,refresh_token:false}});return response.body;}catch(error){throw finite(error);}}
 };
}
