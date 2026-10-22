/** Only a preconfigured exact OpenAI CIMD URL; no caller-selected fetching. */
export function createCimdInspector({fetchImpl=fetch,now=()=>Date.now()}={}){
 const cache=new Map();return async configured=>{
  const previous=cache.get(configured.clientId);if(previous&&previous.until>now())return structuredClone(previous.value);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);let reader;
  try{
   const response=await fetchImpl(configured.clientId,{redirect:'error',credentials:'omit',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});
   if(!response.ok||!/^application\/json(?:;|$)/i.test(response.headers.get('content-type')||''))throw Error();reader=response.body?.getReader();if(!reader)throw Error();const bytes=new Uint8Array(16384);let size=0,chunks=0;
   for(;;){const part=await reader.read();if(part.done)break;if(!(part.value instanceof Uint8Array)||++chunks>16384||part.value.byteLength>bytes.length-size)throw Error();bytes.set(part.value,size);size+=part.value.byteLength;}
   const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(0,size)));if(cache.size>=2&&!cache.has(configured.clientId))throw Error();cache.set(configured.clientId,{value,until:now()+300000});return structuredClone(value);
  }catch{throw Object.assign(new Error('OAuth client unavailable'),{status:503,oauthCode:'temporarily_unavailable'});}finally{clearTimeout(timer);controller.abort();await reader?.cancel().catch(()=>{});}
 };
}
