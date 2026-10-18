import sharp from 'sharp';
import {fail} from './auth.js';
import {digest,exact} from './editor-pack.js';
const fields=['eventId','artifactId','nativeId','reviewRevision','sha256','size','mime','pageIndex','exportedAt','signedOffBy','completedBy'];
export async function validateFinalPng(bytes, receipt, {nativeId,format}) {
  exact(receipt,fields);
  if(receipt.nativeId!==nativeId || !/^[a-f0-9]{64}$/.test(receipt.artifactId) ||
    !/^[a-f0-9]{64}$/.test(receipt.sha256) || receipt.mime!=='image/png' ||
    !Number.isSafeInteger(receipt.size) || receipt.size<1 || receipt.size>4*1024*1024 ||
    bytes.length!==receipt.size || digest(bytes)!==receipt.sha256 ||
    !Number.isSafeInteger(receipt.reviewRevision) || receipt.reviewRevision<1 ||
    !Number.isInteger(receipt.pageIndex) || receipt.pageIndex<0 || receipt.pageIndex>=({infographic:1,carousel:4,story:1,reel:3}[format]||0) ||
    !Number.isFinite(typeof receipt.exportedAt === "number" ? receipt.exportedAt : Date.parse(receipt.exportedAt)) || !receipt.signedOffBy || !receipt.completedBy || !receipt.eventId)
    throw fail(422,'Invalid historical final PNG receipt or bytes');
  const image=sharp(bytes,{limitInputPixels:4_000_000}),info=await image.metadata();
  const height=['story','reel'].includes(format)?1920:1350;
  if(info.format!=='png'||info.width!==1080||info.height!==height||(info.pages||1)!==1)
    throw fail(422,'Invalid historical final PNG dimensions');
  await image.raw().toBuffer();
  return {width:1080,height};
}
/** Retain completed bytes, never signing keys, nonces, envelopes or resumable callbacks. */
export async function projectFinalPngs({nativeId,format,receipts,loadStage,loadBytes,onArtifact}) {
  if(!Array.isArray(receipts)||receipts.length>256)throw fail(413,'Historical export receipt limit');
  const ids=new Set(),result=[];
  for(const receipt of receipts){
    if(ids.has(receipt.eventId))throw fail(422,'Duplicate historical export event');
    ids.add(receipt.eventId);
    const stage=await loadStage(receipt.artifactId);
    if(!stage || stage.nativeId!==nativeId || stage.artifactId!==receipt.artifactId ||
       stage.sha256!==receipt.sha256 || stage.size!==receipt.size || stage.mime!==receipt.mime ||
       stage.pageIndex!==receipt.pageIndex || stage.reviewRevision!==receipt.reviewRevision ||
       stage.signoff?.actorId!==receipt.signedOffBy)
      throw fail(422,'Completed export is missing its exact staged bytes or signoff');
    const bytes=Buffer.from(await loadBytes(stage));
    const dimensions=await validateFinalPng(bytes,receipt,{nativeId,format});
    const artifact={authority:'historical-only',receipt:structuredClone(receipt),nativeRevision:stage.nativeRevision,...dimensions,bytes};
    if(onArtifact)await onArtifact(artifact);else result.push(artifact);
  }
  return result;
}
