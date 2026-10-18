// Explicit local first-party native proof adapter. Never starts from the normal app.
import http from 'node:http';
import {loadNativePairingConfiguration} from './local-native-pairing.mjs';
import {createNativeConnectHandler, createNativePairingProofSink, createNativePairingChallengeReader} from '../server/penpot-native-connect-proof.js';

if (process.argv.length !== 4 || process.argv[2] !== '--config')
  throw Error('Use node scripts/serve-native-connect.mjs --config /absolute/private/pairing.json');
if (process.env.K_SERVICE || process.env.K_REVISION || process.env.NODE_ENV === 'production')
  throw Error('Local native proof adapter is unavailable in a deployment');
const configuration = loadNativePairingConfiguration(process.argv[3]);
const recordProof = createNativePairingProofSink({
  callbackUrl: configuration.studioOrigin + '/api/native/penpot/pairing/proof',
  pairingKey: configuration.pairingKey,
});
const describeChallenge = createNativePairingChallengeReader({
  callbackUrl: configuration.studioOrigin + '/api/native/penpot/pairing/challenge',
  pairingKey: configuration.pairingKey,
});
const handler = createNativeConnectHandler({...configuration, recordProof, describeChallenge});
const server = http.createServer({requestTimeout: 15000, headersTimeout: 10000, maxHeaderSize: 16384}, (req, res) => {
  Promise.resolve(handler(req, res)).catch(() => {
    if (!res.headersSent) { res.writeHead(502, {'Cache-Control': 'no-store'}); res.end('Connection could not be verified. Return to Studio and try again.'); }
    else res.destroy();
  });
});
server.listen(39044, '127.0.0.1', () => console.log('Local native connection adapter listening on 127.0.0.1:39044'));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { server.close(); server.closeAllConnections(); });
