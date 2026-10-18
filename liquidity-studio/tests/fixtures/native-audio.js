// Original generated signal fixture; no recording, sample library or third-party audio.
export function pcmWav({durationMs=30000,sampleRate=8000,channels=1}={}){
 const frames=Math.round(durationMs*sampleRate/1000),bytes=Buffer.alloc(44+frames*channels*2);bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(channels,22);bytes.writeUInt32LE(sampleRate,24);bytes.writeUInt32LE(sampleRate*channels*2,28);bytes.writeUInt16LE(channels*2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(bytes.length-44,40);
 for(let i=0;i<frames;i++)for(let c=0;c<channels;c++)bytes.writeInt16LE(Math.round(Math.sin(i/sampleRate*2*Math.PI*220)*1200),44+(i*channels+c)*2);return bytes;
}
