import {DefiantStrategyService} from './defiant-strategy.js';
import {DefiantClips,CLIP_LIMITS} from './defiant-clips.js';
import {fail} from './auth.js';
// Binary transport enters only after Studio authentication, before JSON parsing.
export async function clipBinaryRequest({platform,user,route,req,res}){
 const match=route.match(/^\/api\/studio\/strategy\/([A-Za-z0-9_-]{1,128})\/inbox\/clips\/(?:uploads\/([a-f0-9-]{36})\/chunks\/(\d{1,3})|assets\/([a-f0-9-]{36}))$/);if(!match)return false;
 const service=new DefiantClips(new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:match[1]}));await service.authorize(user);
 if(match[2]){
  if(req.method!=='PUT'||req.headers['content-type']!=='application/octet-stream')throw fail(400,'Send one binary media chunk');
  if(req.headers['content-length']&&(!/^\d+$/.test(req.headers['content-length'])||Number(req.headers['content-length'])>CLIP_LIMITS.chunkBytes))throw fail(413,'Media chunk exceeds256KiB');
  let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>CLIP_LIMITS.chunkBytes)throw fail(413,'Media chunk exceeds256KiB');chunks.push(chunk);}
  const result=await service.chunk(user,match[2],Number(match[3]),Buffer.concat(chunks));res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(result));return true;
 }
 if(req.method!=='GET')throw fail(405,'Use the saved media download');
 const {asset,bytes}=await service.asset(user,match[4]);let start=0,end=bytes.length-1,status=200;
 if(req.headers.range){const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!range)throw fail(416,'Unsupported media range');start=Number(range[1]);end=range[2]?Number(range[2]):end;if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=bytes.length)throw fail(416,'Media range is unavailable');end=Math.min(end,bytes.length-1);status=206;}
 res.writeHead(status,{'Content-Type':asset.contentType,'Content-Length':end-start+1,'Cache-Control':'private, no-store','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','X-Studio-Media-Sha256':asset.sha256,...(status===206?{'Content-Range':`bytes ${start}-${end}/${bytes.length}`}:{})});res.end(bytes.subarray(start,end+1));return true;
}
