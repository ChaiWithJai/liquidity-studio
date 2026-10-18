# Reviewed durable operator jobs

Tracks #71. This optional path is distinct from legacy founder-only weekly batch execution and shared-control browser grants. Source baseline: main `9017682`. No production configuration, live data, cloud queues, model calls, or deployed UI were changed by these experiments.

## History and system position

`9d8e5f0` introduced the batch/formatter use cases; HTTP waited for the batch. `ba1ef0f` added durable scope storage and RUNNING leases. `d8c34a3` added partial retry lineage/completed-story tracking. Those changes did not establish a reviewed item-revision plan, a worker outbox, or browser-independent delivery. The empty historical S13 UI never proved either success or failure of those backend guarantees.

The new service sits between existing authenticated scope authorization and the existing multi-format formatter. `prepareCampaignForStory` is extracted from the same generation method: source approval, gateway integrity validation, quota reservation, four-format generation and evaluation are shared. Ordinary single-campaign generation retains its current commit path. Jobs commit the prepared draft, item receipt, trace, generation baseline and item usage in one scoped store transaction. Provider token counters are recorded only when actually returned and validated; missing counters remain `null`, never an estimated zero or dollar cost. Reported provider usage is independent of output mode: rejected provider output and synthetic fallback can still have billable provider usage. Those counters are preserved in the trace and failed-item attempt history rather than erased or labelled free.

Upstream: current Google/application identity, org/brand membership, approved source claims, saved story/brand revisions, gateway configuration, scoped storage and global/org generation ledgers. Downstream: canonical story revisions, editable campaign drafts, trace/feedback exports and the JobsPane status UI. A job does not approve artwork, publish, export, or inherit a browser/helper credential.

## API and UI contract

All public routes use existing authenticated request handling and explicit organizationId/brandId scope. `STUDIO_OPERATOR_JOBS_ENABLED=true` is required; otherwise the routes return 404. The mounted App exposes a separate Jobs navigation item for founder and marketer: `JobsPane` accepts `{request,scopeKey,onOpenStory}`. `request` is the existing scope/session guarded request function, using JSON string bodies. Scope/session changes remount/reset projections; polling never starts work. This component does not add organization administration or an auth system.

- GET `/api/studio/jobs/plan`: current brand hash, story IDs/titles/revisions/source-readiness, max 10 campaigns and dispatcher setup guidance. Each campaign generates all four content formats. No queued source approval occurs.
- POST `/api/studio/jobs`: `{idempotencyKey:UUID,reviewed:true,brandRevision,items:[{storyId,storyRevision}]}`. Plan is persisted before 202. An enqueue error is returned as `dispatchError` with the stable saved job; retrying the identical key recovers it. Changed payload/actor with the same key conflicts.
- GET `/api/studio/jobs` and `/:id`: scoped history and durable item detail, errors, attempt/retry lineage, receipts, actual reported usage and delivery state. No credentials or request hashes are exposed.
- POST `/:id/cancel`, `/:id/resume`: UUID control key. Resume applies only to paused/cancelled items; it does not rerun successes. POST `/:id/retry` additionally requires explicit `itemIds` for failed/conflicted/unknown items. These actions require the current job owner or founder. Input snapshots are immutable: changed source/story/brand requires a new reviewed plan.

At most 30 retained plans, 10 items/plan, 10 attempts/item and 50 control records/plan. The finite retention ceiling intentionally rejects additional jobs with an operator-maintenance message; no automatic deletion weakens replay protection. Scope storage's existing size limits still apply. No claim of permanent exactly-once behavior after administrator data deletion/import is made.

## Execution and recovery

Items progress queued → running → completed/failed/conflict/unknown/cancelled; local recovery can pause queued items. A partial job retains successful items and inspectable unsuccessful items. Job/item IDs are stable across browser close/rejoin. Per-item receipts retain input and output revisions, generation ID, actor principal, attempt ID, mode, usage and commit time.

A 120-second persisted lease and monotonic fence protect commits. Expired running work becomes unknown and requires explicit item retry. An old worker cannot commit after cancel, lease expiry, another claim or restored/replaced scope state. A new retry has attempt lineage and a new delivery epoch. Late or duplicate Cloud Tasks deliveries cannot claim a resumed plan under an old epoch. Quota reservations occur before provider execution and are checked again before commit. Failed and uncertain attempts conservatively retain their consumed reservation.

Current actor membership is checked before execution and immediately after the provider wait. Google mode additionally reads the current managed account, checks configured allowlist/provider/email verification/disabled state, and rejects job authorization revoked after plan approval (`tokensValidAfterTime`). No bearer or refresh token is stored. Identity is a separate store record and managed service: this does not claim atomic immediate revocation across the final membership-check-to-content-commit interval. Scope-local cancellation/lease fencing and content/receipt commit are atomic.

A crash after a provider call but before a durable commit may have incurred billing. Explicit retry may call the provider again. There is no exactly-once provider billing claim. If the draft/receipt commits but subsequent quota accounting fails, the completed item remains completed with an accounting warning rather than being regenerated. Operators inspect/reconcile that warning.

Portable exit excludes operator job execution state, leases, outbox and replay authority. Existing usage/traces preserve historical job/item IDs. Import cannot grant job execution. Full SQLite backups retain dormant job records: restore with workers stopped and the feature disabled, inspect, then explicitly resume selected reviewed items. A local worker pauses preexisting queued items on startup by default; expired running items become unknown. Do not enable the operator override below for an unreviewed restore.

## Local worker, no browser dependency

Run a separate Node22 process/container using the same SQLite volume and Google configuration/ADC policy as the existing application:

```sh
STUDIO_OPERATOR_JOBS_ENABLED=true STUDIO_JOB_DISPATCHER=local \
  node server/job-worker.js
```

For a separately reviewed local Docker run, opt into `compose.jobs.yaml` along with the existing base and optional ADC overlay. Start the web service with that same overlay only during an authorized rollout, then run a separate worker container sharing its SQLite volume/configuration:

```sh
docker compose -f compose.yaml -f compose.google-adc.yaml -f compose.jobs.yaml \
  run --rm --no-deps studio node server/job-worker.js
```

This command requires the existing explicit ADC path/Google configuration; it does not start a new public port. Do not run it against the live pilot volume as a test. The acceptance fixtures use separate temporary SQLite files and no Docker/service mutation.

`--once` processes at most one available item per stored scope and exits. Preexisting queued work is paused at process startup; the owner resumes it from the JobsPane while the worker runs. `STUDIO_JOB_RESUME_PENDING=true` is an explicit operator override for a reviewed pending queue, used in isolated acceptance fixtures. It is not a default restore setting. SIGTERM/SIGINT stop polling; provider calls remain bounded by the existing gateway deadline. A hard interruption is reconciled through the lease rather than falsely reporting completion.

Local mode is forbidden when `K_SERVICE` is set. A background promise on request-throttled Cloud Run is not a worker.

## Cloud Tasks adapter: prepared, not provisioned or live-tested

Official reference: [HTTP target creation and OIDC delivery](https://docs.cloud.google.com/tasks/docs/creating-http-target-tasks). Adapter uses the documented REST CreateTask shape, deterministic task name, bounded request and fixed HTTPS `.run.app` handler. No client-supplied endpoint, identity, queue or URL is accepted. No new package, queue, service account, cloud grant or cloud infrastructure is created here.

Future operator configuration:

```text
STUDIO_OPERATOR_JOBS_ENABLED=true
STUDIO_JOB_DISPATCHER=cloud-tasks
STUDIO_JOB_QUEUE=projects/PROJECT/locations/us-east4/queues/QUEUE
STUDIO_JOB_WORKER_URL=https://SERVICE.run.app/api/internal/operator-job
STUDIO_JOB_WORKER_EMAIL=TASK_CALLER@PROJECT.iam.gserviceaccount.com
STUDIO_JOB_SCOPES=[{"organizationId":"ORG","brandId":"BRAND"}]
```

The authenticated internal handler verifies a genuine Google-signed OIDC token's fixed audience and configured service-account email, then enforces configured scopes. It derives preset and job actor from trusted records, not task-supplied permissions. Each task addresses one job/item/attempt/delivery epoch. The dispatcher records a persisted outbox and accepts only successful/AlreadyExists enqueue outcomes. `node server/job-worker.js --dispatch` retries pending delivery from durable storage; this requires an independently scheduled/operator invocation, not a browser tab. A creation response with pending delivery is not completion. This adapter has mocked HTTP/OIDC shape tests and existing signature-verification coverage, not deployed Cloud Tasks proof.

Before enabling: review projected queue/worker costs within the existing 100 USD guide; keep the existing installation/org default 20 daily generation reservations; provision a low-concurrency queue (initial max concurrent 1, max dispatch 1/sec, bounded transport retries) and appropriate task-enqueue/actAs/service-agent permissions. Application validation still rejects nonapproved or stale items. Review request duration/dispatch deadline 120s against gateway max 60s plus identity/storage latency. Retained unknown attempts are not automatically reissued for paid generation. Validate real OIDC delivery, queue IAM, managed-account lookup and current revision/quota failures in a separate approved rollout. No new infrastructure or paid batch acceptance is claimed here.

## Verification and limits

Node tests cover actual independent child-worker execution and reopened SQLite; actual SIGKILL after persisted claim followed by restart/reconciliation and explicit retry; duplicate delivery; partial conflict; cancellation during provider wait; source/brand/quota/current-membership rejection; startup quarantine; and deterministic Cloud Tasks payloads. The interruption test advances only its injected lease clock instead of waiting two real minutes. Google policy tests inject a managed-user lookup at the constructor boundary and verify disabled/revoked rejection without persisting sessions.

Real Chromium component fixtures use authenticated local HTTP, SQLite and a separate child worker, explicit test-only password auth and synthetic generation. They close/rejoin a browser tab, inspect the same durable ID, preserve a conflicting human edit, retry a lost queue response with the same UUID, and switch brands without carrying prior job details. They are not live Google, paid-provider, Cloud Tasks, customer collaboration, or human-usability evidence. Versioned S13/S14 after-captures use the actual mounted App at a1280×720 viewport (full-page PNG dimensions are recorded separately). They retain the original canonical annotation references and explicitly distinguish the new Jobs path from the historical infrastructure readiness pane. Prototype component-only screenshots are not substituted.

Rollback: disable the feature and stop its local worker/delivery dispatcher; existing single-campaign generation and legacy batch routes remain. In-flight workers cannot be claimed undone; cancel/fence their jobs before rollback when reachable. Persisted inactive records can remain for inspection. Do not delete quotas, successful receipts, or drafts to simulate rollback.
