import {createHash} from 'node:crypto';
import {privateGateway} from './penpot-native-connect-proof.js';
import {penpotPresentedSession} from './penpot-media-authorization.js';
import {readBoundedPenpotExportResponse as bounded} from './penpot-native-export.js';
import {fail} from './auth.js';

// This route accepts only the native gateway's presented cookie. It is not an
// operator session relay and cannot select a URL, account, file, or page.
export function createStorySvgGateway({studioOrigin,grantKey,gatewayKey,fetchImpl=fetch}) {
 const origin=new URL(studioOrigin);
 if(origin.origin!==studioOrigin||origin.hostname!=='127.0.0.1'||origin.protocol!=='http:'||!origin.port||!/^[\w-]{43}$/.test(grantKey)||!/^[a-f0-9]{64}$/.test(gatewayKey))throw Error('Fixed local SVG gateway configuration required');
 return async(req,res)=>{
  const url=new URL(req.url,'http://localhost:39008');
  if(url.pathname!=='/studio-save-svg')return false;
  const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"};
  try {
   privateGateway(req,gatewayKey);
   if(req.method!=='GET'||[...url.searchParams.keys()].join(',')!=='permit'||!/^[\w-]{43}$/.test(url.searchParams.get('permit')||''))throw fail(400,'Prepare a fresh SVG download in Studio');
   const cookie=penpotPresentedSession(req.headers['x-studio-native-session']);
   const response=await fetchImpl(studioOrigin+'/api/native/penpot/designs/svg',{method:'POST',headers:{'Content-Type':'application/json','X-Studio-Native-Grant-Key':grantKey,'X-Studio-Native-Session':cookie},body:JSON.stringify({permit:url.searchParams.get('permit')}),redirect:'error',signal:AbortSignal.timeout(60000),cache:'no-store'});
   if(response.status!==200){await response.body?.cancel().catch(()=>{});throw fail([400,401,403,409,410,422,429].includes(response.status)?response.status:502,'SVG could not be saved. Return to Studio, check the saved design and connected Penpot account, and prepare it again.');}
   const bytes=await bounded(response,6*1024*1024),disposition=response.headers.get('content-disposition');
   if(response.headers.get('content-type')!=='image/svg+xml'||!/^attachment; filename="studio-(infographic|carousel|story|reel)-draft\.svg"$/.test(disposition||'')||response.headers.get('x-studio-svg-sha256')!==createHash('sha256').update(bytes).digest('hex'))throw fail(502,'SVG download response invalid');
   res.writeHead(200,{...headers,'Content-Type':'image/svg+xml','Content-Disposition':disposition});res.end(bytes);
  }catch(error){res.writeHead(Number.isInteger(error.status)?error.status:502,{...headers,'Content-Type':'text/plain; charset=utf-8'});res.end(error.status?error.message:'SVG could not be saved. Return to Studio and prepare it again.');}
  return true;
 };
}
