// Browser-only rendering of explicitly supplied media. No provider fetch or generated source.
export function clipInterval(start,end,duration){
 const values=[start,end,duration].map(Number);
 if(!values.every(Number.isFinite)||values[0]<0||values[1]<=values[0]||values[1]>values[2]+0.05||values[1]-values[0]>30)throw Error('Choose a source interval up to 30 seconds within the video.');
 return {start:values[0],end:Math.min(values[1],values[2]),duration:Math.min(values[1],values[2])-values[0]};
}
export function coverCrop(width,height,x=.5,y=.5){
 if(![width,height,x,y].every(Number.isFinite)||width<=0||height<=0||x<0||x>1||y<0||y>1)throw Error('Video dimensions or crop position are unavailable.');
 const ratio=9/16,sourceWidth=Math.min(width,height*ratio),sourceHeight=sourceWidth/ratio;
 return {x:(width-sourceWidth)*x,y:(height-sourceHeight)*y,width:sourceWidth,height:sourceHeight};
}
export function recordingMime(){
 if(typeof MediaRecorder==='undefined')return null;
 return ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type))||null;
}
function ready(element,event,signal){return new Promise((resolve,reject)=>{
 const finish=error=>{element.removeEventListener(event,onready);element.removeEventListener('error',onerror);signal?.removeEventListener('abort',onabort);clearTimeout(timer);error?reject(error):resolve();};
 const onready=()=>finish(),onerror=()=>finish(Error('The browser could not decode this media file.')),onabort=()=>finish(Error('Rendering cancelled.'));
 const timer=setTimeout(()=>finish(Error('Media did not become ready. Try a supported MP4 or WAV file.')),15000);
 element.addEventListener(event,onready,{once:true});element.addEventListener('error',onerror,{once:true});signal?.addEventListener('abort',onabort,{once:true});if(signal?.aborted)onabort();
 });}
export function paintClipFrame(canvas,video,proposal){
 const ctx=canvas.getContext('2d'),crop=coverCrop(video.videoWidth,video.videoHeight,proposal.cropX,proposal.cropY);
 ctx.fillStyle='#000';ctx.fillRect(0,0,1080,1920);ctx.drawImage(video,crop.x,crop.y,crop.width,crop.height,0,0,1080,1920);
 const words=proposal.caption.trim().split(/\s+/),lines=[];let line='';ctx.font='600 54px Inter, sans-serif';
 for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>920&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
 if(lines.length>3)throw Error('Shorten the caption to fit three lines.');
 if(lines.length){const top=1540-lines.length*72;ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(50,top-24,980,lines.length*72+40);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='top';lines.forEach((text,i)=>ctx.fillText(text,540,top+i*72,920));}
}
export async function renderManualClip({videoBlob,audioBlob,proposal,signal,onProgress=()=>{}}){
 const mimeType=recordingMime();if(!mimeType)throw Error('This browser cannot record MP4 with audio. Use a browser with MP4 MediaRecorder support.');
 if(![proposal.videoGain,proposal.audioGain].every(v=>Number.isFinite(v)&&v>=0&&v<=2))throw Error('Choose audio levels between 0 and 200%.');
 const urls=[],video=document.createElement('video'),audio=audioBlob?document.createElement('audio'):null;
 video.playsInline=true;video.preload='auto';video.muted=true;let context,recorder,frame,watchdog,stream;
 const url=blob=>{const value=URL.createObjectURL(blob);urls.push(value);return value;};
 try{
  const videoReady=ready(video,'loadeddata',signal);video.src=url(videoBlob);video.load();await videoReady;
  const interval=clipInterval(proposal.startSeconds,proposal.endSeconds,video.duration);
  if(audio){const audioReady=ready(audio,'loadeddata',signal);audio.src=url(audioBlob);audio.load();await audioReady;}
  if(interval.start>0){const seek=ready(video,'seeked',signal);video.currentTime=interval.start;await seek;}
  await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;paintClipFrame(canvas,video,proposal);
  context=new AudioContext();const destination=context.createMediaStreamDestination();
  const connect=(element,gain)=>{const source=context.createMediaElementSource(element),level=context.createGain();level.gain.value=gain;source.connect(level);level.connect(destination);};
  // Muting the element prevents local double playback; the source node supplies the recorded mix.
  video.muted=false;connect(video,proposal.videoGain);if(audio)connect(audio,proposal.audioGain);
  stream=canvas.captureStream(30);for(const track of destination.stream.getAudioTracks())stream.addTrack(track);
  recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:5_000_000,audioBitsPerSecond:128_000});
  const chunks=[];let finish,fail;
  const output=new Promise((resolve,reject)=>{finish=resolve;fail=reject;});
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onerror=()=>fail(Error('The browser could not finish this MP4. Your saved proposal is unchanged.'));
  recorder.onstop=()=>finish(new Blob(chunks,{type:recorder.mimeType}));
  const abort=()=>{if(recorder.state!=='inactive')recorder.stop();fail(Error('Rendering cancelled.'));};signal?.addEventListener('abort',abort,{once:true});
  try{
   await context.resume();recorder.start(250);await video.play();if(audio)await audio.play();
   const draw=()=>{try{paintClipFrame(canvas,video,proposal);onProgress(Math.min(1,(video.currentTime-interval.start)/interval.duration));if(video.currentTime>=interval.end||video.ended){video.pause();audio?.pause();recorder.stop();}else frame=requestAnimationFrame(draw);}catch(error){fail(error);if(recorder.state!=='inactive')recorder.stop();}};
   frame=requestAnimationFrame(draw);watchdog=setTimeout(()=>{fail(Error('Rendering took too long. Keep this tab active and retry.'));if(recorder.state!=='inactive')recorder.stop();},(interval.duration+20)*1000);
   const blob=await output;if(!blob.size||!blob.type.startsWith('video/mp4'))throw Error('The browser did not produce an MP4.');return blob;
  }finally{signal?.removeEventListener('abort',abort);}
 }finally{cancelAnimationFrame(frame);clearTimeout(watchdog);video.pause();audio?.pause();if(recorder?.state&&recorder.state!=='inactive')recorder.stop();stream?.getTracks().forEach(track=>track.stop());await context?.close();for(const value of urls)URL.revokeObjectURL(value);video.removeAttribute('src');audio?.removeAttribute('src');}
}
