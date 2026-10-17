import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verifyGoogleProvider} from './gcp-google.mjs';
test('provider gate validates enabled Google client and never returns credential payload',async()=>{
 const valid={name:'projects/test-project/defaultSupportedIdpConfigs/google.com',enabled:true,clientId:'client.apps.googleusercontent.com',clientSecret:'DO-NOT-RETURN'};
 for(const patch of [{enabled:false},{clientId:''},{name:'projects/test-project/defaultSupportedIdpConfigs/password'}]) await assert.rejects(verifyGoogleProvider({project:'test-project',token:'private-token',fetchImpl:async()=>({ok:true,json:async()=>({...valid,...patch})})}));
 const result=await verifyGoogleProvider({project:'test-project',token:'private-token',fetchImpl:async(url,options)=>{assert.match(url,/test-project/);assert.equal(options.headers['x-goog-user-project'],'test-project');return{ok:true,json:async()=>valid};}});
 assert.equal(result,true);
});
