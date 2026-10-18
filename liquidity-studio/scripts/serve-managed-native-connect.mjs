// Native gateway sidecar entry. Private config and fixed callbacks only; no SDK,
// account provisioning or general HTTP proxy. Publish through the native gateway.
import http from 'node:http';
import {loadManagedPenpotConfiguration} from '../server/penpot-managed.js';
import {createNativeConnectHandler,createNativeProfileProof,createNativePairingProofSink,createNativePairingChallengeReader} from '../server/penpot-native-connect-proof.js';
import {createPenpotNativeAccessForwarder} from '../server/penpot-native-access-forwarder.js';
if(process.argv.length!==4||process.argv[2]!=='--config')throw Error('Use --config /absolute/private/managed-native.json');
const configuration=await loadManagedPenpotConfiguration(process.argv[3]);
const gatewayKey=process.env.STUDIO_NATIVE_GATEWAY_KEY;
if(!/^[a-f0-9]{64}$/.test(gatewayKey||''))throw Error('Private native gateway key required');
const {studioOrigin,pairingKey,nativeInstanceId}=configuration;
const handler=createNativeConnectHandler({...configuration,gatewayKey,
 recordProof:createNativePairingProofSink({callbackUrl:studioOrigin+'/api/native/penpot/pairing/proof',pairingKey}),
 describeChallenge:createNativePairingChallengeReader({callbackUrl:studioOrigin+'/api/native/penpot/pairing/challenge',pairingKey,nativeInstanceId}),
 readProfile:createNativeProfileProof(configuration)});
const forward=createPenpotNativeAccessForwarder(configuration);
const server=http.createServer({requestTimeout:15000,headersTimeout:10000,maxHeaderSize:16384},(req,res)=>{
 Promise.resolve().then(async()=>{if(!await forward(req,res))await handler(req,res);}).catch(()=>{if(!res.headersSent){res.writeHead(502,{'Cache-Control':'no-store'});res.end('Native connection unavailable');}else res.destroy();});
});
server.listen(39044,'0.0.0.0');
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{server.close();server.closeAllConnections();});
