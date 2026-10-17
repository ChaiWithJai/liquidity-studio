# Node server lifecycle

Start from `liquidity-studio` with `PORT=3000 npm start` using Node 22. PORT defaults to 3000. An occupied configured port now exits with code 1 and a structured startup_failed record; it never silently selects a different listener. The listener binds all interfaces, so application access controls and deployment network policy remain required before hosting.

SIGTERM and SIGINT stop accepting connections and drain in-flight HTTP requests for up to ten seconds. Successful draining exits 0; the deadline destroys remaining HTTP connections and exits 1 with a shutdown_timeout record. Idle keepalive connections close during shutdown, including connections that become idle after a request completes. Repeated termination signals do not extend the deadline. A process manager should allow more than ten seconds before sending SIGKILL.

Run `node --test server/runtime.test.js` from liquidity-studio. Child-process tests use ephemeral loopback ports and cover port collision, both termination signals with active requests, and a stalled request hitting the deadline. They never interact with the existing port-3000 process.

This is the process lifecycle slice of issue #11. Container reproducibility, locked dependency installation, image build verification, and Python QA runtime declaration remain open. This process currently has no durable storage flush contract; persistence work must add and test a bounded flush hook before claiming restart-safe data recovery. HTTP draining alone does not make background tasks durable. Health/readiness probe scope is documented with the separate operational-health change.

Rollback restores the earlier application revision through the normal deployment process. There is no migration; current in-memory state is lost on process restart with either revision. Reverting also restores silent port switching and immediate signal termination. No running service was restarted or deployed during this change.
