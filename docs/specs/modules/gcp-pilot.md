# Proposed spec: gcp-pilot

Historical proposal, retained from the 2026-10-17 planning baseline. Its status and implementation descriptions below are historical, not current release claims or new approval gates. See the [current system map](../../architecture/system-map.md) and [documentation index](../../README.md).

Status: **Specify, pending founder review**. Module `gcp-pilot` in the founder-approved capability map. Related: #19, #18, #12. Evidence date: 2026-10-17. Agent-skills workflow pinned at `aeac41d4d005999432bb7312f7ff06383a91d59d`.

## Objective and assumptions

Provide a private working service for the founder and one invited marketer, after reproducible Docker operation locally. One Organization owns the `liquidity_desk` and `vedic_dharma` Brands. Organization membership and narrower Brand grants authorize each request. A brand preset or UI switch never grants access. Future agencies may manage explicitly linked client organizations; arbitrary recursive tenancy is outside this pilot.

Assumptions for review: use a dedicated pilot GCP project selected by the founder; keep a single region for compute/data where supported; use a private Cloud Run container service, Firestore Native as the proposed managed repository, Cloud Storage for assets and backup objects, Secret Manager for provider/identity credentials, and Clerk for application identity. These are proposed choices, not deployed infrastructure. The pilot does not activate customer billing or prove demand for a managed SaaS.

Dependencies follow the approved order: `container-runtime` → `durable-storage` → `identity-tenant-access` → `operator-workflow` → `gcp-pilot` → `managed-billing-exit`. Provider integrity and operational health are cross-cutting gates. This document specifies the pilot boundary; the other module owners define their internal implementations. It does not approve later Plan, Tasks or Implement phases.

## Verified versus planned

| Surface | Verified evidence | Still required |
|---|---|---|
| Source baseline | Reviewed `fdd8d99`; Node ESM API and generated `dist` UI; Svelte source is a second implementation. Declared Node container major 22, Svelte `^5.1.0`, Vite `^6.0.0`; exact lock/install reproducibility not verified here. | Canonical build and pinned install/container evidence from #7/#11. |
| Runtime | `/healthz`, `/readyz`, configurable `PORT`, lifecycle shutdown tests exist. | Container probe smoke, workload recovery and managed datastore readiness. |
| Storage | `InMemoryGCPFirestoreAdapter` remains the default repository in `server/container.js`. Its name is not a Firestore connection. | #2 durable adapter and cloud integration; local disk/volume persistence is not Cloud Run persistence. |
| Cloud CLI | `gcloud version --format=json` reports SDK 558.0.0; active account entry exists; configured project `claude-code-jai-2025`, region `us-central1`. Account identifier intentionally omitted from this public document. | Founder project/region decision and usable credentials. |
| Cloud inventory | `projects describe` failed: token refresh requires interactive reauthentication. No successful remote inventory. | Project access, APIs, billing, IAM, existing resources, provider quotas and datastore location unknown. |
| App access | Current prototype does not establish Organization/Brand access isolation. | #4/#18 authentication, server authorization and negative tests. |
| Local container | Separate #11 workstream owns Docker build/run evidence. No new Docker test claimed by this spec. | Founder + marketer UI, persistence/restart, isolation, reproducible image and secret exclusion. |

The SDK printed a missing `environment` project-tag advisory. No tag was created. Chained service listing did not execute after reauthentication failure. No APIs, billing, resources, IAM or deployed services were changed. Port 3000 was untouched.

## Proposed service and module contracts

Cloud Run serves the API and static UI from the same immutable image digest. It must listen on `0.0.0.0:$PORT`, tolerate termination, and keep durable state outside the writable container filesystem. [Cloud Run container contract](https://docs.cloud.google.com/run/docs/container-contract).

The proposed deployment starts with minimum zero, maximum one instance, bounded request concurrency and generation quotas. A one-instance setting limits exposure but provides neither durability nor tenant security. Use a separate runtime service account with only required datastore access, bucket object permissions and access to individual required secrets. Keep deployer/image-publisher permissions separate. Reference explicit secret versions so rollback is reproducible; never bake credentials into images. [Secret integration](https://docs.cloud.google.com/run/docs/configuring/services/secrets).

The `durable-storage` module must provide optimistic concurrency, idempotent writes and a documented transaction boundary for draft + generation metadata. Every repository method requires an authorized `{organizationId, brandId}` scope; server code derives actor identity from verified sessions. Firestore layout is proposed as `organizations/{orgId}/brands/{brandId}/...`; server SDK authorization remains application responsibility. No unrestricted client datastore access. Usage/job/outbox events retain immutable org, brand, actor and generation IDs. Retries do not duplicate records or charges. Readiness checks datastore reachability without exposing private metadata.

Cloud Storage object names include organization and brand scope. Bucket public access is prohibited; only the server can resolve authorized asset IDs. If signed URLs are added, issue short-lived links only after membership and ownership checks; possession permits access until expiry, so URL logs and exports must be protected. [Signed URL behavior](https://docs.cloud.google.com/storage/docs/access-control/signed-urls).

The proposed operator entry is a direct HTTPS browser link protected by Cloud Run's direct Identity-Aware Proxy (IAP) integration. Grant IAP access only to the founder and marketer; retain the service's invoker IAM check and grant the IAP service identity the required invocation permission. The marketer needs no CLI or local proxy. IAP guards the perimeter; Clerk/application sessions still enforce Organization/Brand grants. Test their combined sign-in, redirects, cookies and logout; do not assume IAP proves Clerk identity. External identities or projects without a GCP organization may require custom OAuth setup. [Current IAP integration and access requirements](https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run).

This is a proposed choice requiring founder approval and an integration test. If IAP cannot support the invited marketer's identity or the chosen UX, a separately approved alternative is HTTPS Cloud Run transport reachable publicly with mandatory application authentication and authorization on every protected request; that removes the IAP perimeter and changes the exposure/cost model. Never activate that alternative implicitly or expose the current prototype. `gcloud run services proxy` is a developer diagnostic only, and may require additional programmatic IAP authorization; it is not pilot-user onboarding. [Developer diagnostics](https://docs.cloud.google.com/run/docs/authenticating/developers).

Organization membership comes from Clerk's verified session context; Brand membership is application-owned and checked server-side on every operation. Deny unknown/revoked membership. Founder can manage both brands; marketer grants are explicit per brand. Admin operational views require founder/operator privileges and scoped/redacted content. Background jobs resolve recorded authorization/scopes instead of inheriting a process-global active brand. [Clerk Organizations](https://clerk.com/docs/guides/organizations/overview), [roles and permissions](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions).

## Commands and execution boundaries

Commands below are specifications, **not evidence of execution**, except the four inventory commands already described. `PILOT_*` inputs must be supplied after founder approval; the discovered CLI defaults are deliberately not reused.

Founder can repair interactive CLI login, then rerun read-only discovery (do not print tokens):

```sh
gcloud auth login
gcloud auth list --filter=status:ACTIVE --format='value(account)'
gcloud config list --format='json(core.account,core.project,run.region)'
export PILOT_PROJECT='REPLACE_WITH_APPROVED_PROJECT_ID'
export PILOT_REGION='REPLACE_WITH_APPROVED_REGION'
gcloud projects describe "$PILOT_PROJECT" --format='json(projectId,lifecycleState)'
gcloud services list --enabled --project="$PILOT_PROJECT" --limit=30 --format='value(config.name)' --quiet
gcloud run services list --project="$PILOT_PROJECT" --region="$PILOT_REGION" --limit=10 --format='table(metadata.name,status.url)' --quiet
gcloud artifacts repositories list --project="$PILOT_PROJECT" --location="$PILOT_REGION" --limit=10 --format='table(name,format)' --quiet
gcloud firestore databases list --project="$PILOT_PROJECT" --limit=10 --format='table(name,locationId,type)' --quiet
gcloud storage buckets list --project="$PILOT_PROJECT" --limit=10 --format='value(name)' --quiet
gcloud secrets list --project="$PILOT_PROJECT" --limit=10 --format='value(name)' --quiet
gcloud billing projects describe "$PILOT_PROJECT" --format='json(billingEnabled)'
```

Do not authenticate application-default credentials until an approved SDK workflow requires them. No login, API enablement or project reconfiguration was executed by this investigation. Reauthentication does not approve spending or deployment. If read-only discovery prompts to enable an API, decline and report it.

Current source validation, from `liquidity-studio/`:

```sh
npm run build
npm run test:gateway
node server/navigation-test.js
node --test server/runtime.test.js server/operational-health.test.js
AI_ALLOW_SYNTHETIC=true npm run test:backwards
AI_ALLOW_SYNTHETIC=true npm run qa:loop
git diff --exit-code -- dist
```

Synthetic contract tests do not establish provider readiness. A later approved provider probe must use a model actually supported by the selected API/project, a small bounded request, source-grounded content, visible provider provenance and a recorded cost/quota limit.

**After spec approval and a separately approved implementation/deployment plan only**, populate the following inputs: `PILOT_PROJECT`, `PILOT_REGION`, `PILOT_REPOSITORY`, `PILOT_SERVICE`, `PILOT_IMAGE` (digest, not mutable tag), `PILOT_RUNTIME_SA`, `PILOT_GEMINI_SECRET_VERSION`, `PILOT_CLERK_SECRET_VERSION`, and two `PILOT_*_IAP_MEMBER` identities. The datastore/bucket configuration contract must be defined by #2 before deployment; this draft does not invent environment variables that the current application ignores.

Illustrative deployment acceptance command, requiring existing approved resources, configured durable adapter and identity integration in the image:

```sh
gcloud run deploy "$PILOT_SERVICE" --project="$PILOT_PROJECT" --region="$PILOT_REGION" \
  --image="$PILOT_IMAGE" --service-account="$PILOT_RUNTIME_SA" \
  --no-allow-unauthenticated --invoker-iam-check --iap --ingress=all \
  --min=0 --max=1 --concurrency=4 --cpu=1 --memory=512Mi --timeout=120 \
  --port=8080 --update-env-vars=AI_ALLOW_SYNTHETIC=false \
  --update-secrets="GEMINI_API_KEY=$PILOT_GEMINI_SECRET_VERSION,CLERK_SECRET_KEY=$PILOT_CLERK_SECRET_VERSION" \
  --startup-probe=httpGet.path=/healthz,httpGet.port=8080 --no-traffic --tag=pilot-candidate
```

`--ingress=all` allows browser traffic to reach the IAP perimeter; it does not grant unauthenticated application access. The approved resource plan must configure/verify IAP's service identity and OAuth client, then grant only the two intended IAP principals. Do not disable the invoker IAM check. The future approved resource plan must specify API enablement, registry/image publishing, datastore, buckets, backup retention, service-account bindings, two IAP-access bindings and budget controls before this command becomes runnable. No such resources were created here. Full deployment command syntax was checked against installed SDK help and [official deploy reference](https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy). [Maximum instances](https://docs.cloud.google.com/run/docs/configuring/max-instances) remains an operational limit, not a cost guarantee.

After an approved candidate exists, validate its direct HTTPS link in each user's browser, including a denied third identity. The commands below are developer-only diagnostics, requiring approved IAM/programmatic IAP setup; they are not marketer setup steps:

```sh
gcloud run services describe "$PILOT_SERVICE" --project="$PILOT_PROJECT" --region="$PILOT_REGION" --format='yaml(status.traffic,status.conditions)'
gcloud run services proxy "$PILOT_SERVICE" --project="$PILOT_PROJECT" --region="$PILOT_REGION" --tag=pilot-candidate --port=3107
# Separate terminal, while the authenticated loopback proxy is running:
curl --fail --silent --show-error http://127.0.0.1:3107/healthz
curl --fail --silent --show-error http://127.0.0.1:3107/readyz
```

Capture a last-known-good revision and datastore schema compatibility before approved traffic movement. Rollback is a separate authorized operational action:

```sh
gcloud run services update-traffic "$PILOT_SERVICE" --project="$PILOT_PROJECT" --region="$PILOT_REGION" --to-revisions="$PILOT_PREVIOUS_REVISION=100"
```

The candidate's tagged URL must also be checked/restricted during rollback; traffic rollback does not delete a reachable candidate tag, undo data writes or revoke exposed secrets. See [revision traffic and rollback](https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration).

## Backup, restore and customer exit contract

Before pilot writes: agree recovery targets (proposed RPO 24h and RTO 4h, not measured), retention and owner; enable approved backups and execute a restore drill in a separate isolated database. For a later approved whole-database backup, these are the explicit admin operations (not performed now):

```sh
gcloud firestore export "gs://$PILOT_BACKUP_BUCKET/$PILOT_BACKUP_PREFIX" --project="$PILOT_PROJECT" --database="$PILOT_DATABASE"
gcloud firestore import "gs://$PILOT_BACKUP_BUCKET/$PILOT_BACKUP_PREFIX" --project="$PILOT_PROJECT" --database="$PILOT_RESTORE_DATABASE"
```

Export/import is billable and privileged. Never import over the live database as a routine rollback. Verify counts, scoped draft content, lineage, asset checksums and memberships before routing to a restored database. Restore configuration switch requires a reviewed datastore-adapter contract. Firestore backups are not a single-customer export: they can contain every organization's data. [Managed export/import](https://firebase.google.com/docs/firestore/manage-data/export-import).

The `managed-billing-exit` module must later produce an organization-scoped portable package: schema/version manifest, all owned brands, data/assets, lineage and non-secret configuration, with checksums and import validation into local Docker. Exclude other organizations, managed credentials and provider secrets. Customer supplies replacement identity/provider configuration. Licensing, source redistribution and termination/deletion obligations need explicit agreement; a public GitHub repository does not decide these rights.

## Clerk billing and metering research boundary

Verified 2026-10-17: Clerk Billing supports B2B Organization subscriptions and feature/plan authorization. Stripe processes payments; Clerk subscriptions/plans are separate from Stripe Billing and do not synchronize as Stripe subscriptions. Production payment setup must be explicitly chosen; development flows can use the test gateway. [Clerk billing overview](https://clerk.com/docs/guides/billing/overview), [B2B billing](https://clerk.com/docs/expressjs/guides/billing/for-b2b).

Clerk's current [Billing FAQ](https://clerk.com/billing) explicitly says native usage-based/metered billing is not yet supported. Its [feature board](https://feedback.clerk.com/request) also lists metered billing in backlog. Do not confuse Clerk's own account usage charges with a product feature that meters this application's customer consumption. Reverify this before implementation.

Proposed application accounting is independent: append idempotent usage events keyed by operation ID, with organization/brand/actor, model/provider, measured units, completion status, pricing-version reference and timestamps. Reserve quota before dispatch; reconcile actual usage; retries share the operation identity. Synthetic events are identifiable and never charged as provider work. Entitlement checks, quota limits and payment collection are distinct boundaries. Any later consumption invoice integration requires its own provider decision and reconciliation design. Clerk billing webhooks require signature verification and deduplication on event ID; [Clerk webhook delivery](https://clerk.com/docs/guides/development/webhooks/overview) can retry.

Pilot access remains complimentary and no payment product is activated. Proposed commercial offers from #18 are hypotheses; upfront entitlement duration, renewal, licensing, tax/refund handling and customer exit are unresolved. They do not imply a configured plan or a revenue forecast.

## Cost controls and scale decision

Estimate from measured request CPU/memory duration + datastore reads/writes/storage + object storage/egress/exports + registry + secrets + logs + AI input/output usage + identity/payment fees. Use the approved region's current calculators/rate cards and a seven-day measured pilot workload; no price numbers are asserted here. Founder selects total monthly budget, generation/day and per-request token caps before resource creation.

Set minimum zero and a small maximum, request/generation quotas, bounded provider retries/timeouts, log retention/redaction, bucket retention/lifecycle and a tested generation kill switch. Standard alerts-only budgets do not cap spend. Current GCP also documents a separate spend-cap budget capability; service coverage and project eligibility must be checked before claiming enforcement. Use [budget alerts](https://docs.cloud.google.com/billing/docs/how-to/budgets) and evaluate [spend-cap budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets-spend-caps). Neither server autoscaling nor alerts cover every downstream cost automatically.

Do not scale beyond the founder + marketer pilot until isolation tests and restore drill pass; observed p95 interactive read latency meets a proposed 1-second target under two-user load; provider timeouts/errors are tracked separately; the founder accepts measured spend; and waitlist/webinar validation supports another cohort. Increased concurrency, another instance or another organization requires a reviewed capacity/isolation test. No automatic provisioning loop is proposed.

## Project structure and code style

Current source: `liquidity-studio/server/{index,container,gateway,runtime}.js`; `server/*.test.js` for Node unit tests; `server/navigation-test.js` for served-JS behavior; `scripts/build-dist.js` emits `dist`; `src/App.svelte` remains the parallel UI. Proposed cloud adapter/config and infrastructure locations must be selected in the later Plan phase; no framework migration is approved by this spec.

Retain ESM, two-space indentation and dependency injection. Example contract only, not an implemented API:

```js
// Example: identity-tenant-access owns authorization before durable-storage access.
const scope = await authorizeBrandAccess(session, requestedBrandId, 'campaign:read');
const draft = await repository.getCampaign({ ...scope, campaignId });
```

Never accept actor/organization permission claims from query strings or rely on object-name prefixes alone.

## Testing and pilot success criteria

Use Node's test runner for repository/authorization/idempotency, HTTP tests for API isolation, and real browser tests for operator flows. No coverage percentage substitutes for the following gates:

- Docker image builds reproducibly without credentials; non-3000 loopback smoke passes health/readiness and both users' workflows. Explicit synthetic demonstration and real-provider readiness are distinct.
- Saving an edit, recreating the container and starting a new Cloud Run revision retains drafts, settings, schedule and lineage. Concurrent edits detect conflicts.
- Both users sign in; founder sees both brands; marketer sees only granted brands. Forged organization/brand/asset IDs, batch jobs, cache entries, telemetry and export paths cannot cross scopes. Membership revocation takes effect within a documented, tested limit.
- Unknown users fail both the IAP perimeter and application authorization. The two named identities alone receive IAP access; no public binding exists. `/readyz` fails safely on datastore failure without leaking identifiers or secrets.
- New/reopened provider and synthetic drafts identify provenance; generation failures preserve edits and reset loading. Clinical claims in `vedic_dharma` remain quarantined until sourced/editorially approved.
- Export actions reflect real deliverables (#5); queueing/scheduling does not pretend to publish. Browser/API isolation (#8), tenant batch (#9), scoped portable export (#10) and honest telemetry (#6) have recorded results before the pilot is called complete.
- Candidate health, traffic rollback, backup/restore and secret-rotation drills succeed with evidence. Live data is never overwritten to prove rollback.
- Founder approves resource/project/billing inputs and measured cost controls before any cloud mutation. Two named users complete the operator workflow without developer intervention.

## Boundaries and open decisions

Always: distinguish observed from proposed, cite current official sources, preserve port 3000, scope every data operation, record tests/rollback and retain reviewable specs.

Ask before the next gated phase: approve this spec or request changes, then review the implementation plan and tasks separately. Deployment, API activation, IAM/billing changes and new paid services require explicit resource/cost authorization.

Never: create resources while investigating, publish this in-memory unauthenticated prototype, commit secrets, print access tokens, infer authorization from a brand selector, choose a license implicitly, or call synthetic scores factual evidence.

Founder decisions still needed: project/region and billing owner; both pilot identities and exact Brand grants; Firestore versus another durable adapter after #2 review; direct-browser IAP identity/OAuth and Clerk UX acceptance; retention/RPO/RTO; generation/token/monthly caps; provider/model/API and data policy; and later commercial entitlement/license/tax/exit terms.

**Stop at Specify.** The applied [spec-driven-development skill](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/spec-driven-development/SKILL.md) says: “Stop after writing the spec.” Human approval in a later turn is required before Plan, Tasks or Implement. This PR supplies the concrete review artifact; it does not request approval of uncreated cloud resources.
