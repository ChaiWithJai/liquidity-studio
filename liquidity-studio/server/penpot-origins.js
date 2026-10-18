// Constructor-only endpoints. Request bodies never select a native destination.
function origin(value){const url=new URL(value);if(url.origin!==value||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('Exact native origin required');return url;}
export function nativePublicOrigin(value){const url=origin(value);if(value!=='http://localhost:39008'&&(url.protocol!=='https:'||url.hostname==='localhost'||url.hostname==='127.0.0.1'||url.hostname==='[::1]'))throw Error('Public HTTPS native origin required');return value;}
export function nativeRpcOrigin(value){const url=origin(value);if(!['http:','https:'].includes(url.protocol))throw Error('Fixed HTTP native RPC origin required');return value;}
export function publicHttpsOrigin(value){const result=nativePublicOrigin(value);if(!result.startsWith('https://'))throw Error('Managed public HTTPS origin required');return result;}
