# Minimal two-person GCP prerequisite provisioner

## Release checkpoint: 2026-10-18 00:16 UTC

Operator-reported evidence (2026-10-17 in America/New_York), following the preserved 00:11 snapshot below:

- Canonical Cloud Run traffic is now 100% on revision `00003-mos`, using image `sha256:1940959dac8ce3859a62d9af4e1069b154b745c33af44bbb7ddbc7e0558b604a` from source `6937c5338887d65d017d8c93dac2a9f2f79906c4`. Documentation changes do not alter that runtime source or image.
- The final cloud image passed managed founder Google sign-in and refresh, real-provider generation, GCS artifact SHA verification and recovery. CLI rollback to `00001-wud` and roll-forward to `00003-mos` were verified, including the persisted draft through the Google UI.
- A genuine outside Google service identity received application 401 and direct Firestore 403. Its test identity and grants were cleaned up. This establishes the tested service-identity boundary, not an ordinary human Google account browser result.
- Main local Docker on port 3001 uses the same final image. Review containers on 3109, 39004 and 39005 were stopped; their persistent volumes were retained. Original port 3000 remains untouched.
- The invited marketer has no managed Auth record yet and still needs the first managed Google sign-in. Issues #19 and #30 remain open for that acceptance. Issue #39 remains a Penpot/Doory investigation, not an implemented integration or authorization for new infrastructure.
- The USD100 all-service project alert budget and delayed USD20 Cloud Run / USD70 Vertex service caps remain configured. They do not guarantee a hard USD100 aggregate ceiling. Public records omit personal addresses, billing identifiers and private evidence.

## Earlier operator snapshot: 2026-10-18 00:11 UTC

This snapshot records operator-reported runtime evidence (2026-10-17 in America/New_York). It is not a statement that the two-person pilot is complete.

- Cloud Run exists in `us-east4`. The main service URL still assigns 100% traffic to revision `00001-wud`. The newer revision `00003-mos` is staged on its tagged URL; its image is `sha256:1940959dac8ce3859a62d9af4e1069b154b745c33af44bbb7ddbc7e0558b604a`, built from [source `6937c53`](https://github.com/ChaiWithJai/liquidity-studio/commit/6937c5338887d65d017d8c93dac2a9f2f79906c4). Staging has not moved canonical traffic to that revision. Tagged URLs remain reachable and can incur costs.
- Google Identity Platform's Google provider is enabled. The founder confirmed real Google sign-in on the final tagged revision. Actual sign-in with the invited marketer's account is still pending; emulator role tests are not that evidence.
- The final image passed local Docker Google sign-in, real-provider generation, artifact export and restore checks. A previous cloud image passed real Vertex generation, GCS-backed export and restore. Provider and recovery checks on the final cloud image remain in progress; earlier-image results do not establish those final-image checks.
- Outsider acceptance checks are in progress. Keep the two-user/outsider, final cloud provider/recovery and promotion gates open until their own results are recorded.
- A monthly USD100 project-wide, all-service alert budget is configured. Service spend caps are configured at USD20 for Cloud Run and USD70 for Vertex, with delayed enforcement. These controls do not guarantee a hard USD100 aggregate spending ceiling or cover every other service's charges.
- [Hosted CI for source `6937c53`](https://github.com/ChaiWithJai/liquidity-studio/actions/runs/39080934440) completed successfully. CI and local evidence remain distinct from live-account and final-revision cloud acceptance.

## Provisioned infrastructure and historical checkpoint

Verified on 2026-10-17: project `liquidity-studio-pilot-261017` is active in the `chaiwithjai.com` organization (`313384662705`), project number `504282493214`. Billing is linked and enabled. A monthly USD100 project-only, all-service budget has current-spend alerts at 50%, 80% and 100%. Alerts are notifications, not a guaranteed hard spending cap.

Prerequisites were provisioned: a named Firestore Native database `liquidity-studio-pilot` in `us-east4` with deletion protection and PITR, private GCS bucket `liquidity-studio-pilot-261017-liquidity-assets` with uniform access and public-access prevention, regional Artifact Registry repository `liquidity-studio`, and runtime service account `liquidity-runtime`. The initial password-based prerequisite run also created two regional password secrets. They are historical resources, not part of the Google deployment; the current deployment clears secret mounts. At the earlier checkpoint on 2026-10-17, no Cloud Run service had yet been deployed; the snapshot above supersedes that operational state.

Earlier checkpoint on 2026-10-17: Google Identity Platform and its Firebase web application were initialized, but only the auth handler response had been checked; provider configuration and live founder/marketer authentication awaited Console reauthentication. Local Application Default Credentials had been renewed and verified with an actual Firebase Admin read. Provider enablement and founder sign-in have since advanced as recorded above. The marketer account remains pending. Emulator and password-test evidence never establish live-account readiness.

## Current operator flow

`scripts/gcp-provision.mjs plan` prints proposed resources/IAM without invoking gcloud. `apply --apply` verifies the explicit project, organization, linked billing account and monthly project budget before any mutation; it reuses compatible existing resources. The Google default creates no application passwords or IAP user grants. It adds a minimal authentication read role for Admin SDK revocation checks. This Google-specific IAM increment has been applied and verified: the role contains only `firebaseauth.users.get` and is bound to the runtime identity.

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

Existing resource region, type, ownership, security and custom-role permissions are checked before reuse. Partial failures do not delete resources; inspect and rerun. Resource removal, historical secret retirement and IAM removal are separate reviewed operations. Provisioning is not deployment or live acceptance. Follow [the deployment evidence contract](deployment-evidence-contract.md) and [first-service versus revision behavior](gcp-first-deployment.md). A first service launches with 100% initial traffic; later revisions can be staged without assigned main-service traffic, tested through their tagged URLs and promoted only after acceptance.

## Historical password/IAP path

`PILOT_AUTH_MODE=legacy-password-iap` remains only for isolated command-contract regression tests and historical recovery review. It is not the current pilot path. Application production startup rejects password mode, and deployment/rollback both require Google-mode evidence. Do not use the provisioner's legacy `access` stage for Google mode; the script refuses it. Existing password secrets and accessor bindings must be retired after confirming no retained legacy workload needs them; the provisioner does not delete them automatically.

## Google managed application mode

The default provisioner now creates a runtime role containing only `firebaseauth.users.get` for Firebase Admin revoked/disabled-user checks. It creates no application passwords, Secret Manager versions, secret accessor bindings or IAP user grants. Existing legacy secrets are not deleted by this change; remove their old runtime access separately after confirming no legacy revision needs it. Legacy password/IAP provisioning requires explicit `PILOT_AUTH_MODE=legacy-password-iap` and is not the current pilot path.

The deployment candidate uses public Cloud Run transport with IAP disabled. Public static UI, health and sign-in endpoints are intentional; application data remains protected by verified Google tokens and explicit server-side role/membership checks. Before promoting traffic prove anonymous protected APIs return 401, both configured Google users can sign in, an outsider cannot access app data, tenant isolation holds, and restore works. Public invocation alone must never imply application authorization. A fresh exact-image acceptance report must carry `authMode: google` and passing `googleAuth` / `anonymousApi` checks; password-era evidence is rejected.

Supply actual public Firebase web configuration and principal email allowlist through environment variables (`STUDIO_FIREBASE_*`, `STUDIO_GOOGLE_FOUNDER_EMAIL`, `STUDIO_GOOGLE_MARKETER_EMAIL`). The deployment writes these to a private temporary environment file, removes it after deployment and clears all secret mounts. It reads Google provider configuration using the authenticated operator token, checks that the Google web provider is enabled, and never prints its response because it can contain the OAuth client secret. Provider enablement and founder sign-in now have the operational evidence summarized above; each remaining account and revision still requires its own live verification. Historical implementation note (2026-10-17): the provisioner code change itself did not execute cloud changes; subsequent operational runs are recorded separately.


Verification: `node --test scripts/gcp-provision.test.mjs scripts/gcp-google.test.mjs scripts/gcp-apply.test.mjs` covers command contracts using fake CLI/API adapters. Live inventory and user/browser acceptance remain separate evidence.

Official references: [Firestore creation](https://docs.cloud.google.com/sdk/gcloud/reference/firestore/databases/create), [Google web sign-in](https://docs.cloud.google.com/identity-platform/docs/web/google), [Firebase authentication IAM](https://docs.cloud.google.com/iam/docs/roles-permissions/firebaseauth).


## Explicit billing API bootstrap for a new project

Both `cloudbilling.googleapis.com` and `billingbudgets.googleapis.com` must be enabled in the selected project before the read-only billing/budget gates can run. Enabling only the Budget API is insufficient: linked-project billing reads use Cloud Billing. The provisioner's plan prints the required bootstrap separately, and both APIs are included in its required-service inventory.

```sh
gcloud services enable cloudbilling.googleapis.com billingbudgets.googleapis.com \
  --project="$PILOT_PROJECT" --billing-project="$PILOT_PROJECT"
```

This is an explicit operator bootstrap step, not a side effect of `preflight` or an automatic mutation ahead of verification. `apply` still verifies the explicit active project/organization, linked billing account and all-service project budget before provisioning application resources. A missing API or failed authentication remains a failure; it is not interpreted as an absent budget or permission grant. Run the read-only preflight again after enabling the APIs. Billing/project read commands pass the explicit project flag, and both CLI helpers add `--billing-project` for the selected project. A stale gcloud default project or global billing quota configuration therefore cannot silently select another quota project.

Cloud Billing is a prerequisite for inspecting billing state; enabling it does not configure a spend cap, change the USD100 budget, publish the app or authorize unrelated resources.
