import http from 'node:http';
import { startServer } from '../runtime.js';
const server = http.createServer((req, res) => {
  console.log('request_started');
  if (req.url === '/stalled') return;
  setTimeout(() => res.end('completed'), 150);
});
startServer(server, { port: Number(process.env.TEST_PORT || 0), host: '127.0.0.1', drainTimeoutMs: 400 });
