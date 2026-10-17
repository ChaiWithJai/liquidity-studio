# Minimal two-person GCP prerequisite provisioner

Recorded operator status on 2026-10-17: project `liquidity-studio-pilot-261017` was created ACTIVE in organization `313384662705` (`chaiwithjai.com`), project number `504282493214`. Root reported no visible billing accounts (`[]`), so linking and all paid-service provisioning remain blocked pending the owner's billing-console action. Only project-creation default APIs were enabled. This script's changes have not been applied; its tests use a fake CLI.

`scripts/gcp-provision.mjs` has three stages. `plan` prints intended resources/IAM without invoking gcloud. `apply --apply` creates prerequisite resources only, after verifying the selected project's organization, linked billing account and positive monthly project budget at most USD100. `access --apply` runs only after a separately deployed private IAP-enabled service exists. It grants the two explicitly named Google users IAP access and the IAP service agent Cloud Run invocation. No app/customer payments are configured.

Supply non-secret inputs explicitly; the CLI's configured project never selects the deployment:

```sh
export PILOT_PROJECT=liquidity-studio-pilot-261017
export PILOT_ORGANIZATION_ID=313384662705
export PILOT_REGION=us-east4
export PILOT_MONTHLY_BUDGET=100
export PILOT_FOUNDER_EMAIL='REPLACE_WITH_APPROVED_GOOGLE_ACCOUNT'
export PILOT_MARKETER_EMAIL='REPLACE_WITH_DISTINCT_APPROVED_GOOGLE_ACCOUNT'
node scripts/gcp-provision.mjs plan
```

Invalid/missing identities prevent even a plan from appearing ready. Both user emails must be provided. External Google accounts require separately verified OAuth configuration and `PILOT_EXTERNAL_IAP_OAUTH_READY=true`; IAM bindings alone do not establish that external-user OAuth works. Browser checks after deployment remain required.

Before the coordinated resource step, set `PILOT_BILLING_ACCOUNT` and `PILOT_BUDGET_ID` to verified resources. The budget must cover exactly project number 504282493214, all services and a monthly period, with current-spend alert delivery enabled. An alert is not a hard spending cap. Do not bypass the check when the billing account list is empty. Budget creation/linking and real resource provisioning are separate operator actions.

For the actual prerequisite step, provide `PILOT_FOUNDER_PASSWORD` and `PILOT_MARKETER_PASSWORD` through a trusted local secret/environment mechanism. Do not put values in shell history, committed files, chat, CLI arguments or public CI logs. Each initial password must be 16–256 characters without newlines. The child gcloud environment strips password/provider-key values; Secret Manager receives the intended password only through stdin (`--data-file=-`). CLI output/diagnostics are captured and never echoed. Secret version metadata is printed as a deployable version pointer; payloads are not printed. Existing enabled secret versions are preserved on rerun, so this is not a password-rotation tool.

```sh
# Only after root coordinates billing/budget and resource creation:
node scripts/gcp-provision.mjs apply --apply
# Then deploy through the separate evidence-checked gcp-pilot.mjs flow.
node scripts/gcp-provision.mjs access --apply
```

The prerequisite set is limited to required APIs, a named Firestore Native database in us-east4 with deletion protection/PITR, private GCS with uniform access/public-access prevention, a regional Docker registry, one runtime service identity and two password secrets replicated in us-east4. Firestore PITR and other resources are billable after creation; managed restore/backups and cost acceptance still need live verification.

Runtime permissions are `roles/datastore.user` in this dedicated pilot project, a custom prediction-only role (`aiplatform.endpoints.predict`, `serviceusage.services.use`), a bucket-scoped custom role (`storage.buckets.get`, object get/create/delete), and secret accessor on only the two named secrets. The runtime receives no project owner/editor, secret-admin, billing-admin, image-publisher or IAM-admin role. Datastore permission covers this dedicated project's databases; do not reuse the project for unrelated customer systems. The deployment/operator identity remains separate and must already hold the administrative permissions required to create these resources.

Existing resources are inspected before creation; different database regions/types, bucket ownership/security or custom-role permission sets are rejected rather than silently replaced. API enablement and individual IAM additions are retryable; partial failure does not delete already-created resources. Rerun after inspecting the failure. This script has no destructive cleanup or billing disablement path. Secret rotation, removal of IAM access, deletion and data retention require their own reviewed operation.

The access stage refuses disabled IAP and unexpected direct/project/organization `roles/iap.httpsResourceAccessor` bindings. It cannot substitute for a complete effective-permissions audit, OAuth configuration and real two-account/unknown-account browser tests. It adds resource-specific user permissions rather than granting a domain or all authenticated users; it does not revoke existing policies automatically.

Verification: `node --test scripts/gcp-provision.test.mjs`. The five mock-CLI tests cover no-call plans, pre-mutation billing/auth/budget denial, secret stdin/environment/output handling, idempotent resource/secret reuse and separate denied/allowed IAP stages. They are command-contract evidence, not live GCP/IAM proof.

Official references: [Firestore creation](https://docs.cloud.google.com/sdk/gcloud/reference/firestore/databases/create), [secret stdin versions](https://docs.cloud.google.com/sdk/gcloud/reference/secrets/versions/add), [native Cloud Run IAP](https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run), [scoped IAP bindings](https://docs.cloud.google.com/sdk/gcloud/reference/iap/web/add-iam-policy-binding). Installed SDK help confirmed bucket security and role commands; existing custom roles are separately described to inspect their full permission set.

## External pilot access

Prerequisite provisioning is independent of OAuth configuration. The access stage observes a custom OAuth client ID in effective service settings and ignores `PILOT_EXTERNAL_IAP_OAUTH_READY`; a boolean is not evidence. Client presence alone does not prove External audience or successful login: verify both users in separate browser sessions before claiming acceptance.

The [IAP OAuth Admin API was retired in March 2026](https://docs.cloud.google.com/iap/docs/programmatic-oauth-clients). Create the custom client in Console, not `gcloud iap oauth-clients create`. Configure Google Auth Platform branding and External audience; in IAP Applications choose the Cloud Run resource, Settings, Custom OAuth, Auto Generate Credentials, then Save. The [official custom OAuth guide](https://docs.cloud.google.com/iap/docs/custom-oauth-configuration) documents this path and automatically configured redirect. A manual Web application client instead needs `https://iap.googleapis.com/v1/oauth/clientIds/CLIENT_ID:handleRedirect`.

Prefer Console direct configuration to avoid handling the secret locally. If applying existing credentials through CLI, write settings into a private mode-0600 temporary file with a private parent directory, invoke `gcloud iap settings set FILE --project=PROJECT --resource-type=cloud-run --region=us-east4 --service=SERVICE`, then remove the file. Never place credentials in command arguments, shell history, logs, Git, or chat. Only the two explicit pilot identities receive service-scoped IAP access; External audience does not itself grant IAM access.
