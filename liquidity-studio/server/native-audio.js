// Original bounded PCM-WAV host support. The existing native engine owns playback,
// undoable timing and AAC/Opus export; this module never transcodes audio.
export const AUDIO_LIMITS=Object.freeze({bytes:512*1024,durationMs:30000,tracks:4});
export const audioSource=id=>`/__studio_native_audio/${id}`;
const reject=message=>{throw Object.assign(new Error(message),{status:422});};
export function inspectPcmWav(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
 if(bytes.length<44||bytes.length>AUDIO_LIMITS.bytes)reject('Use a PCM WAV file of at most 512 KiB and 30 seconds.');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),tag=offset=>String.fromCharCode(...bytes.subarray(offset,offset+4));
 if(tag(0)!=='RIFF'||tag(8)!=='WAVE'||view.getUint32(4,true)+8!==bytes.length)reject('Use an uncompressed 16-bit PCM WAV file.');
 let format=null,data=null,offset=12,chunks=0;
 while(offset<bytes.length){
  if(++chunks>256||offset+8>bytes.length)reject('Invalid WAV chunk structure.');
  const name=tag(offset),length=view.getUint32(offset+4,true),start=offset+8,end=start+length;
  if(end>bytes.length)reject('Incomplete WAV data.');
  if(name==='fmt '){if(format||length<16||length>40)reject('Unsupported WAV format header.');format={encoding:view.getUint16(start,true),channels:view.getUint16(start+2,true),sampleRate:view.getUint32(start+4,true),byteRate:view.getUint32(start+8,true),blockAlign:view.getUint16(start+12,true),bits:view.getUint16(start+14,true)};}
  if(name==='data'){if(data!==null)reject('Use one PCM WAV data stream.');data=length;}
  offset=end+(length%2);if(offset>bytes.length)reject('Invalid WAV padding.');
 }
 if(!format||!data||format.encoding!==1||format.bits!==16||![1,2].includes(format.channels)||format.sampleRate<8000||format.sampleRate>48000||format.blockAlign!==format.channels*2||format.byteRate!==format.sampleRate*format.blockAlign||data%format.blockAlign)reject('Use 16-bit PCM WAV, mono or stereo, at 8–48 kHz.');
 const durationMs=data/format.byteRate*1000;
 if(durationMs<50||durationMs>AUDIO_LIMITS.durationMs)reject('Audio must be between 50 milliseconds and 30 seconds.');
 return {durationMs,channels:format.channels,sampleRate:format.sampleRate};
}
export function validateAudioTracks(tracks,{assets,pageIds}){
 if(tracks===undefined)return;
 if(!Array.isArray(tracks)||tracks.length>AUDIO_LIMITS.tracks)reject('Use at most four saved audio tracks.');
 const ids=new Set(),allowed=new Set(['id','kind','name','src','assetId','scope','startMs','durationMs','trimStartMs','trimEndMs','volume','fadeInMs','fadeOutMs','loop','muted','duckUnderVoiceover']);
 for(const track of tracks){
  if(!track||typeof track!=='object'||Object.keys(track).some(k=>!allowed.has(k))||typeof track.id!=='string'||!track.id.length||track.id.length>64||ids.has(track.id)||!['music','voiceover','sfx','upload'].includes(track.kind)||typeof track.name!=='string'||track.name.length>200)reject('Invalid native audio track.');ids.add(track.id);
  const asset=assets.find(a=>a.id===track.assetId&&a.kind==='audio'&&a.contentType==='audio/wav');
  if(!asset||track.src!==audioSource(asset.id)||!Number.isFinite(asset.durationMs)||!Number.isFinite(track.durationMs)||Math.abs(track.durationMs-asset.durationMs)>1)reject('Audio requires its saved scoped WAV asset and duration.');
  const scope=track.scope;
  if(!scope||!['design','page'].includes(scope.type)||Object.keys(scope).some(k=>!['type','pageId'].includes(k))||(scope.type==='page'?!pageIds.includes(scope.pageId):scope.pageId!==undefined))reject('Audio page scope is unavailable.');
  for(const key of ['startMs','trimStartMs','trimEndMs','fadeInMs','fadeOutMs'])if(!Number.isInteger(track[key])||track[key]<0||track[key]>AUDIO_LIMITS.durationMs)reject('Audio timing must stay within 30 seconds.');
  if(track.trimEndMs>Math.ceil(asset.durationMs)||track.trimEndMs-track.trimStartMs<50||!Number.isFinite(track.volume)||track.volume<0||track.volume>1||typeof track.loop!=='boolean'||typeof track.muted!=='boolean'||track.duckUnderVoiceover!==undefined&&typeof track.duckUnderVoiceover!=='boolean')reject('Invalid audio trim, volume or mute settings.');
 }
}
