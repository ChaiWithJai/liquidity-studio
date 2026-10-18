// First-party native identity proof only. This does not grant native editing.
import {timingSafeEqual} from 'node:crypto';
import {penpotPresentedSession} from './penpot-media-authorization.js';
import {fail} from './auth.js';
const UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const CHALLENGE=/^[A-Za-z0-9_-]{43}$/;
const ORIGINS={loopback:'http://localhost:39008','docker-host':'http://host.docker.internal:39008'};
const escape=x=>x.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function nativeConnectChallenge(value){if(typeof value!=='string'||!CHALLENGE.test(value))throw fail(400,'A current Studio connection request is required');return value;}
/** The only identity input is the native server's response to its presented session. */
export function createNativeProfileProof({transportMode='loopback',fetchImpl=fetch}={}){
 const origin=ORIGINS[transportMode];if(!origin)throw Error('Fixed native proof transport required');
 return async cookie=>{
  const session=penpotPresentedSession(cookie);
  const response=await fetchImpl(`${origin}/api/rpc/command/get-profile`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',Cookie:session,Origin:ORIGINS.loopback},body:'{}',redirect:'error',signal:AbortSignal.timeout(10000)});
  if(response.status!==200){await response.body?.cancel().catch(()=>{});throw fail([401,403].includes(response.status)?401:502,'Sign in to the native editor before connecting');}
  const reader=response.body?.getReader();if(!reader)throw fail(502,'Native profile response unavailable');const chunks=[];let size=0,complete=false;
  try{for(;;){const {value,done}=await reader.read();if(done){complete=true;break;}size+=value.byteLength;if(size>65536)throw fail(502,'Native profile response exceeds its bound');chunks.push(value);}}
  finally{if(!complete)await reader.cancel().catch(()=>{});reader.releaseLock();}
  let profile;try{profile=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail(502,'Native profile response invalid');}
  if(!UUID.test(profile?.id||'')||profile.id==='00000000-0000-0000-0000-000000000000')throw fail(401,'A signed-in native profile is required');
  const name=typeof profile.fullname==='string'&&profile.fullname.length<=120&&!/[\x00-\x1f\x7f]/.test(profile.fullname)?profile.fullname.trim():'';
  return {nativeProfileId:profile.id,...(name?{nativeProfileName:name}:{})};
 };
}
function privateGateway(req,key){const actual=req.headers['x-studio-native-gateway'];if(typeof actual!=='string'||!/^[a-f0-9]{64}$/.test(actual)||actual.length!==key.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(key)))throw fail(403,'Native connection gateway required');}
function page(content){return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connect Penpot</title><style>body{font:17px system-ui;line-height:1.5;max-width:34rem;margin:12vh auto;padding:24px;color:#202020}button,a{font:inherit}button{padding:10px 18px}</style><main>${content}</main></html>`;}
async function form(req){if(req.headers['content-type']!=='application/x-www-form-urlencoded')throw fail(415,'Connection form required');let size=0;const chunks=[];const timer=setTimeout(()=>req.destroy(),5000);try{for await(const chunk of req){size+=chunk.length;if(size>128)throw fail(413,'Connection request too large');chunks.push(chunk);}}finally{clearTimeout(timer);}const body=new URLSearchParams(Buffer.concat(chunks).toString('utf8'));if([...body.keys()].join(',')!=='challenge')throw fail(400,'Connection request invalid');return nativeConnectChallenge(body.get('challenge'));}
/** Gateway key and proof sink are server-only constructor dependencies. Never mount publicly without the gateway. */
export function createNativeConnectHandler({gatewayKey,nativeInstanceId,studioOrigin,recordProof,describeChallenge,readProfile=createNativeProfileProof()}={}){
 if(typeof gatewayKey!=='string'||!/^[a-f0-9]{64}$/.test(gatewayKey)||!UUID.test(nativeInstanceId||'')||typeof recordProof!=='function'||typeof describeChallenge!=='function')throw Error('Private native connection dependencies required');
 const studio=new URL(studioOrigin);if(!['http:','https:'].includes(studio.protocol)||studio.origin!==studioOrigin||studio.username||studio.password)throw Error('Fixed Studio origin required');
 return async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
  try{
   privateGateway(req,gatewayKey);const url=new URL(req.url,ORIGINS.loopback);
   let html;
   if(req.method==='GET'&&url.pathname==='/studio-connect'&&[...url.searchParams.keys()].join(',')==='challenge'){
    const challenge=nativeConnectChallenge(url.searchParams.get('challenge')),issuer=await describeChallenge(challenge);
    if(typeof issuer?.studioActorLabel!=='string'||!issuer.studioActorLabel.trim()||issuer.studioActorLabel.length>200||!Number.isFinite(issuer.expiresAt))throw fail(502,'Studio connection identity unavailable');
    const scopeLabel=[issuer.organizationLabel,issuer.brandLabel].filter(x=>typeof x==='string'&&x.length<=200).map(escape).join(' · ');
    html=page(`<h1>Connect your Penpot account</h1><p>Connect your Penpot account to Studio account <strong>${escape(issuer.studioActorLabel)}</strong>.</p>${scopeLabel?`<p>${scopeLabel}</p>`:''}<p>This request expires at ${escape(new Date(issuer.expiresAt).toISOString())}.</p><p>Connect the native account currently signed in here to this Studio request. This establishes identity only. It does not grant access to brand designs.</p><form method="post" action="/studio-connect/prove"><input type="hidden" name="challenge" value="${escape(challenge)}"><button type="submit">Connect this Penpot account</button></form><p>You will finish the connection in the same Studio session where you started.</p>`);
   }else if(req.method==='POST'&&url.pathname==='/studio-connect/prove'&&!url.search){
    if(req.headers['x-studio-native-origin']!==ORIGINS.loopback)throw fail(403,'Use the native connection page');
    const challenge=await form(req),profile=await readProfile(req.headers['x-studio-native-session']);
    if(!UUID.test(profile?.nativeProfileId||''))throw fail(401,'A signed-in native profile is required');
    const proof={challenge,nativeInstanceId,nativeProfileId:profile.nativeProfileId,...(profile.nativeProfileName?{nativeProfileName:profile.nativeProfileName}:{})};
    const result=await recordProof(proof);if(result?.recorded!==true)throw fail(502,'Connection proof was not acknowledged');
    html=page(`<h1>Penpot account verified</h1><p>Return to the same Studio session to finish connecting. Brand editing access has not been granted.</p><a href="${escape(studioOrigin)}/">Return to Studio</a>`);
   }else throw fail(404,'Connection page not found');
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);
  }catch(error){res.writeHead([400,401,403,404,409,410,413,415,429].includes(error.status)?error.status:502,{'Content-Type':'text/plain; charset=utf-8'});res.end(error.status&&error.status<500?error.message:'Connection could not be verified. Return to Studio and preserve the current request.');}
 };
}

/** Separate callback credential: native cookie never leaves the native reader. */
export function createNativePairingProofSink({callbackUrl,pairingKey,fetchImpl=fetch}={}){
 const url=new URL(callbackUrl);if(url.pathname!=='/api/native/penpot/pairing/proof'||url.search||url.hash||url.username||url.password||!(['https:'].includes(url.protocol)||(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))||typeof pairingKey!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(pairingKey))throw Error('Fixed private Studio pairing callback required');
 return async proof=>{
  const response=await fetchImpl(url.href,{method:'POST',headers:{'Content-Type':'application/json','X-Studio-Native-Pairing-Key':pairingKey},body:JSON.stringify(proof),redirect:'error',signal:AbortSignal.timeout(4000)});
  if(response.status!==200){await response.body?.cancel().catch(()=>{});throw fail([400,403,409,410,429].includes(response.status)?response.status:502,'Studio could not acknowledge this connection; preserve the current request');}
  const reader=response.body?.getReader();if(!reader)throw fail(502,'Studio connection acknowledgement missing');let size=0,done=false;const chunks=[];
  try{for(;;){const part=await reader.read();if(part.done){done=true;break;}size+=part.value.byteLength;if(size>4096)throw fail(502,'Studio connection acknowledgement exceeded its bound');chunks.push(part.value);}}
  finally{if(!done)await reader.cancel().catch(()=>{});reader.releaseLock();}
  let result;try{result=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail(502,'Studio connection acknowledgement invalid');}if(result?.recorded!==true)throw fail(502,'Studio connection was not recorded');return {recorded:true};
 };
}

/** Private read-only issuer lookup. No native cookie, browser label or activation. */
export function createNativePairingChallengeReader({callbackUrl,pairingKey,nativeInstanceId,fetchImpl=fetch}={}){
 const url=new URL(callbackUrl);if(url.pathname!=='/api/native/penpot/pairing/challenge'||url.search||url.hash||url.username||url.password||!(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))||!UUID.test(nativeInstanceId||'')||typeof pairingKey!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(pairingKey))throw Error('Fixed private Studio challenge callback required');
 return async challenge=>{
  nativeConnectChallenge(challenge);
  const response=await fetchImpl(url.href,{method:'POST',headers:{'Content-Type':'application/json','X-Studio-Native-Pairing-Key':pairingKey},body:JSON.stringify({challenge,nativeInstanceId}),redirect:'error',signal:AbortSignal.timeout(4000)});
  if(response.status!==200){await response.body?.cancel().catch(()=>{});throw fail([400,403,409,410,429].includes(response.status)?response.status:502,'Studio connection request unavailable');}
  const reader=response.body?.getReader();if(!reader)throw fail(502,'Studio connection identity missing');let size=0,done=false;const chunks=[];
  try{for(;;){const part=await reader.read();if(part.done){done=true;break;}size+=part.value.byteLength;if(size>4096)throw fail(502,'Studio connection identity exceeds its bound');chunks.push(part.value);}}finally{if(!done)await reader.cancel().catch(()=>{});reader.releaseLock();}
  let result;try{result=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail(502,'Studio connection identity invalid');}return result;
 };
}
