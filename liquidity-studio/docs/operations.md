# Operational checks

GET /healthz is a process liveness check. GET /readyz verifies repository read access with a one second deadline and returns 503 on failure or timeout. Neither endpoint generates content or checks remote provider availability. A ready response applies only to studio repository access; it does not certify AI generation, durable storage, authentication, or publishing. Dependency exception details, URLs, and credentials are excluded from probe responses.

Admin telemetry starts with no jobs and a null average evaluation score when there are no generations. Batch records describe actual admin invocations, including failures and how many formats completed before failure. Batch error records contain a stable error code, not raw provider errors. All telemetry remains process-local and is lost on restart.

Run regression checks with `node --test server/operational-health.test.js` from liquidity-studio. Tests listen on an ephemeral loopback port and do not touch the port 3000 service.

## Remaining issue #6 work

Build an admin view for failures, job history, and unavailable measurements; add request correlation and structured request/provider errors with redaction; make telemetry durable and bounded; instrument repository writes; and establish a provider-specific health contract once provider mode/error behavior is settled. Repository-read readiness alone cannot detect write failures or static bundle failures. No cloud scheduler has been verified. The dashboard must not interpret null evaluation scores as zero or a passed assessment.

## Rollout and rollback

Deploy only after the separate access-control and persistence work is reviewed. These changes do not migrate stored data or change the currently running service. Rollback restores the previous application revision; telemetry accumulated in this process is not durable and is lost on restart in either revision. Do not use a readiness probe as evidence that an external generation provider is reachable.
