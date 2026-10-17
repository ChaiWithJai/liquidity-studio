# Minimal two-person GCP prerequisite provisioner

## Recorded operator state

Verified on 2026-10-17: project `liquidity-studio-pilot-261017` is active in the `chaiwithjai.com` organization (`313384662705`), project number `504282493214`. Billing is linked and enabled. A monthly USD100 project-only, all-service budget has current-spend alerts at 50%, 80% and 100%. Alerts are notifications, not a guaranteed hard spending cap.

Prerequisites were provisioned: a named Firestore Native database `liquidity-studio-pilot` in `us-east4` with deletion protection and PITR, private GCS bucket `liquidity-studio-pilot-261017-liquidity-assets` with uniform access and public-access prevention, regional Artifact Registry repository `liquidity-studio`, and runtime service account `liquidity-runtime`. The initial password-based prerequisite run also created two regional password secrets. They are historical resources, not part of the Google deployment; the current deployment clears secret mounts. No Cloud Run service is deployed as of this verification.

Google Identity Platform is initialized and a Firebase web application is registered. Its auth handler responds, but this is not proof that the Google provider or live sign-in works. Google provider configuration and live founder/marketer authentication remain pending Console reauthentication. Local Application Default Credentials also need renewal. Do not use emulator or password-test evidence to declare live authentication ready.

## Current operator flow

`scripts/gcp-provision.mjs plan` prints proposed resources/IAM without invoking gcloud. `apply --apply` verifies the explicit project, organization, linked billing account and monthly project budget before any mutation; it reuses compatible existing resources. The Google default creates no application passwords or IAP user grants. It adds a minimal authentication read role for Admin SDK revocation checks. This Google-specific IAM increment must still be applied and verified before live acceptance.

Supply inputs explicitly; the CLI configured project never selects deployment:

```sh
export PILOT_PROJECT=liquidity-studio-pilot-261017
export PILOT_ORGANIZATION_ID=313384662705
export PILOT_REGION=us-east4
export PILOT_MONTHLY_BUDGET=100
export PILOT_FOUNDER_EMAIL='REPLACE_WITH_APPROVED_GOOGLE_ACCOUNT'
export PILOT_MARKETER_EMAIL='REPLACE_WITH_DISTINCT_APPROVED_GOOGLE_ACCOUNT'
node scripts/gcp-provision.mjs plan
```

Set `PILOT_BILLING_ACCOUNT` and `PILOT_BUDGET_ID` privately to the verified resources before `apply --apply`. Both users must be distinct. Real personal addresses, billing identifiers and credentials belong in private operator configuration, not this public repository. The current Google deployment uses `STUDIO_GOOGLE_FOUNDER_EMAIL` and `STUDIO_GOOGLE_MARKETER_EMAIL` for the application allowlist; see [Google authentication](google-auth.md).

Runtime access is `roles/datastore.user` in this dedicated pilot project; a custom prediction role with `aiplatform.endpoints.predict` and `serviceusage.services.use`; bucket-scoped get/create/delete object permissions and bucket metadata read; and `firebaseauth.users.get` for revoked/disabled-account checks. The runtime receives no project owner/editor, billing-admin, image-publisher or IAM-admin role. Do not reuse this project for unrelated customer databases.

Existing resource region, type, ownership, security and custom-role permissions are checked before reuse. Partial failures do not delete resources; inspect and rerun. Resource removal, historical secret retirement and IAM removal are separate reviewed operations. Provisioning is not deployment or live acceptance. Follow [the deployment evidence contract](deployment-evidence-contract.md) to build, validate, deploy a candidate without production traffic, test it and promote it.

## Historical password/IAP path

`PILOT_AUTH_MODE=legacy-password-iap` remains only for isolated command-contract regression tests and historical recovery review. It is not the current pilot path. Application production startup rejects password mode, and deployment/rollback both require Google-mode evidence. Do not use the provisioner's legacy `access` stage for Google mode; the script refuses it. Existing password secrets and accessor bindings must be retired after confirming no retained legacy workload needs them; the provisioner does not delete them automatically.

## Google managed application mode

The default provisioner now creates a runtime role containing only `firebaseauth.users.get` for Firebase Admin revoked/disabled-user checks. It creates no application passwords, Secret Manager versions, secret accessor bindings or IAP user grants. Existing legacy secrets are not deleted by this change; remove their old runtime access separately after confirming no legacy revision needs it. Legacy password/IAP provisioning requires explicit `PILOT_AUTH_MODE=legacy-password-iap` and is not the current pilot path.

The deployment candidate uses public Cloud Run transport with IAP disabled. Public static UI, health and sign-in endpoints are intentional; application data remains protected by verified Google tokens and explicit server-side role/membership checks. Before promoting traffic prove anonymous protected APIs return 401, both configured Google users can sign in, an outsider cannot access app data, tenant isolation holds, and restore works. Public invocation alone must never imply application authorization. A fresh exact-image acceptance report must carry `authMode: google` and passing `googleAuth` / `anonymousApi` checks; password-era evidence is rejected.

Supply actual public Firebase web configuration and principal email allowlist through environment variables (`STUDIO_FIREBASE_*`, `STUDIO_GOOGLE_FOUNDER_EMAIL`, `STUDIO_GOOGLE_MARKETER_EMAIL`). The deployment writes these to a private temporary environment file, removes it after deployment and clears all secret mounts. It reads Google provider configuration using the authenticated operator token, checks that the Google web provider is enabled, and never prints its response because it can contain the OAuth client secret. Provider setup and live Google login remain separate operator work. No cloud changes were performed while implementing this revision.


Verification: `node --test scripts/gcp-provision.test.mjs scripts/gcp-google.test.mjs scripts/gcp-apply.test.mjs` covers command contracts using fake CLI/API adapters. Live inventory and user/browser acceptance remain separate evidence.

Official references: [Firestore creation](https://docs.cloud.google.com/sdk/gcloud/reference/firestore/databases/create), [Google web sign-in](https://docs.cloud.google.com/identity-platform/docs/web/google), [Firebase authentication IAM](https://docs.cloud.google.com/iam/docs/roles-permissions/firebaseauth).
