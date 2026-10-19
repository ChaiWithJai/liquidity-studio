// Only constructor-owned origins and a freshly resolved saved-design DTO may select a frame.
function configuredOrigin(value){
 try{const url=new URL(value);if(url.origin!==value)return false;if(url.protocol==='https:')return true;
  return url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)&&/^[1-9][0-9]{0,4}$/.test(url.port)&&Number(url.port)<=65535;
 }catch{return false;}
}
export function embeddingAvailable(embedding,studioOrigin){
 return Boolean(embedding&&configuredOrigin(embedding.studioOrigin)&&configuredOrigin(embedding.nativeOrigin)&&studioOrigin===embedding.studioOrigin&&embedding.nativeOrigin!==studioOrigin);
}
export function boundPenpotFrameUrl(design,{designId,storyId,generationId,embedding,studioOrigin}){
  if(!embeddingAvailable(embedding,studioOrigin)||!designId||design?.id!==designId||design.status!=='ready'||design.storyId!==storyId||design.generationId!==generationId)throw Error('This saved design is unavailable for the current story. Return to its preview and reopen the design.');
  try{
    const url=new URL(design.nativeUrl),hash=new URLSearchParams(url.hash.slice('#/workspace?'.length));
    const uuid=value=>/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value||'');
    if(url.origin!==embedding.nativeOrigin||url.username||url.password||url.pathname!=='/'||url.search||!url.hash.startsWith('#/workspace?')||!uuid(hash.get('team-id'))||!uuid(design.fileId)||hash.get('file-id')!==design.fileId||!uuid(hash.get('page-id'))||[...hash.keys()].sort().join(',')!=='file-id,page-id,team-id')throw Error();
    return url.href;
  }catch{throw Error('The saved design link is unavailable. Open the design from its preview.');}
}
export function readPenpotSaveState(event,{source,origin,nonce,fileId}){
  const data=event.data;
  if(!/^[A-Za-z0-9_-]{43}$/.test(nonce)||event.source!==source||event.origin!==origin||!data||data.type!=='studio-penpot-state'||data.version!==1||data.nonce!==nonce||data.fileId!==fileId||!['unknown','editing','pending','saving','saved','clean','error'].includes(data.status)||!(data.revision===null||Number.isSafeInteger(data.revision)&&data.revision>=0)||['saved','clean'].includes(data.status)&&data.revision===null)return null;
  return {status:data.status,revision:data.revision};
}

export function penpotMayHaveUnsavedChanges(status){return status!=='saved'&&status!=='clean';}
