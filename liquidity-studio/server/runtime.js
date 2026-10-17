/** Process lifecycle; callers own persistence flush hooks before enabling durable storage. */
export function startServer(server, {
  port = process.env.PORT || 3000,
  host = '0.0.0.0',
  drainTimeoutMs = 10000
} = {}) {
  let draining = false;
  server.on('request', (req, res) => {
    res.once('finish', () => {
      if (draining) server.closeIdleConnections();
    });
  });
  server.once('error', (error) => {
    console.error(JSON.stringify({ event: 'startup_failed', code: error.code || 'LISTEN_ERROR' }));
    process.exit(1);
  });
  const shutdown = (signal) => {
    if (draining) return;
    draining = true;
    console.log(JSON.stringify({ event: 'shutdown_started', signal }));
    const deadline = setTimeout(() => {
      console.error(JSON.stringify({ event: 'shutdown_timeout' }));
      server.closeAllConnections();
      process.exit(1);
    }, drainTimeoutMs);
    server.close(() => {
      clearTimeout(deadline);
      console.log(JSON.stringify({ event: 'shutdown_complete' }));
      process.exit(0);
    });
    server.closeIdleConnections();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  server.listen(port, host, () => {
    console.log(JSON.stringify({ event: 'listening', port: server.address().port }));
  });
  return server;
}
