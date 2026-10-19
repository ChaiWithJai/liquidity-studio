export async function mediaHash(blob){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(v=>v.toString(16).padStart(2,'0')).join('');}
export async function uploadClipMedia(request,blob,metadata,key,onProgress=()=>{}){
 const sha256=await mediaHash(blob);
 const input={...metadata,idempotencyKey:key,bytes:blob.size,sha256};
 const upload=await request('/inbox/clips/uploads',{method:'POST',body:JSON.stringify(input)});
 if(!Number.isInteger(upload.chunkBytes)||upload.chunkBytes<1||upload.chunkBytes>262144||upload.chunkCount!==Math.ceil(blob.size/upload.chunkBytes))throw Error('The upload response is incomplete. Keep this file and retry.');
 for(let index=0;index<upload.chunkCount;index++){
  await request(`/inbox/clips/uploads/${encodeURIComponent(upload.uploadId)}/chunks/${index}`,{method:'PUT',headers:{'Content-Type':'application/octet-stream'},body:blob.slice(index*upload.chunkBytes,(index+1)*upload.chunkBytes)});
  onProgress((index+1)/upload.chunkCount);
 }
 return request(`/inbox/clips/uploads/${encodeURIComponent(upload.uploadId)}/complete`,{method:'POST',body:'{}'});
}
