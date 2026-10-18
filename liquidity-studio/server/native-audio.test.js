import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectPcmWav,validateAudioTracks,audioSource} from './native-audio.js';
import {pcmWav} from '../tests/fixtures/native-audio.js';
test('owned 30-second PCM fixture is bounded and measured from original bytes',()=>{const bytes=pcmWav();assert.equal(bytes.length,5760044);assert.deepEqual(inspectPcmWav(bytes),{durationMs:30000,channels:2,sampleRate:48000});assert.deepEqual(inspectPcmWav(pcmWav({sampleRate:44100})),{durationMs:30000,channels:2,sampleRate:44100});});
test('compressed, misleading, truncated, long and oversized audio is rejected without transcoding',()=>{
 for(const change of [b=>b.subarray(0,b.length-1),b=>{b.writeUInt16LE(3,20);return b;},b=>{b.writeUInt32LE(16001,28);return b;},b=>{b.writeUInt16LE(32,34);return b;},()=>pcmWav({durationMs:30001}),()=>pcmWav({durationMs:33000}),()=>pcmWav({sampleRate:8000}),()=>pcmWav({channels:1})])assert.throws(()=>inspectPcmWav(change(pcmWav())),{status:422});
});
test('native audio tracks retain only exact saved PCM usage and bounded timeline controls',()=>{
 const asset={id:'a'.repeat(32),kind:'audio',contentType:'audio/wav',durationMs:30000},track={id:'track',kind:'upload',name:'Original signal',assetId:asset.id,src:audioSource(asset.id),durationMs:30000,scope:{type:'design'},startMs:0,trimStartMs:0,trimEndMs:30000,volume:.7,fadeInMs:0,fadeOutMs:0,loop:false,muted:false},context={assets:[asset],pageIds:['page']};
 validateAudioTracks([track],context);
 for(const patch of [{src:'https://unregistered.example/sound.wav'},{durationMs:undefined},{trimEndMs:30001},{scope:{type:'page',pageId:'missing'}},{volume:2},{libraryId:'external'}])assert.throws(()=>validateAudioTracks([{...track,...patch}],context),{status:422});
 assert.throws(()=>validateAudioTracks(Array.from({length:5},(_,i)=>({...track,id:'t'+i})),context),{status:422});
});
