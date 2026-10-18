// Original metadata regression; dummy encoded chunks are not media decoding proof.
import { expect, it } from 'vitest'
import { createContainer } from './container'
import { bytesOf } from './testing'
import { inspectWebm } from './inspect'
it('declares the full900-frame30fps span including the last frame duration', async () => {
 const c=await createContainer({kind:'webm',family:'vp8',width:16,height:16,fps:30,audio:null})
 for(let i=0;i<900;i++)c.addVideo({data:new Uint8Array([0,0,0]),key:true,timestampUs:Math.round(i*1e6/30),durationUs:Math.round((i+1)*1e6/30)-Math.round(i*1e6/30)})
 expect(inspectWebm(await bytesOf(c.finish())).durationMs).toBe(30000)
})
