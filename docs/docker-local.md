# Docker locally with Google sign-in

The normal local runtime uses Google Identity Platform / Firebase Authentication and defaults to Google-only sign-in. It does not create application passwords. Use the same Google authentication project and verified founder/marketer allowlist for local port 3001 and the private GCP pilot. Provider setup and actual Google consent must be completed separately; a synthetic content fixture or emulator login does not prove production Google access.

## Configure and start

```sh
node scripts/setup-local.mjs
# Edit .env locally: supply the six Firebase/email values listed below.
docker compose --env-file .env up --build --detach --wait
```

Setup writes a private ignored `.env` template with `STUDIO_AUTH_MODE=google`, `STUDIO_NODE_ENV=production`, and no passwords. It preserves an existing file. Remove obsolete password values from an old local file; the normal Compose file never passes them to the container. Missing Google configuration fails readiness instead of falling back to passwords. Configure:

```
STUDIO_FIREBASE_PROJECT_ID=<explicit-authentication-project>
STUDIO_FIREBASE_API_KEY=<public-web-app-api-key>
STUDIO_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
STUDIO_FIREBASE_APP_ID=<public-web-app-id>
STUDIO_GOOGLE_FOUNDER_EMAIL=<verified-founder-google-email>
STUDIO_GOOGLE_MARKETER_EMAIL=<verified-marketer-google-email>
```

The project must enable Google as an authentication provider, register the web application, and authorize localhost plus the intended cloud hostname. Firebase web configuration is public; do not substitute service-account private keys. Founder and marketer emails must differ. See [Google identity setup and migration](google-auth.md) for token checks, account authorization and revocation permissions.

The backend also needs Application Default Credentials (ADC) with `firebaseauth.users.get` on the authentication project to check revoked/disabled accounts. The optional local-only overlay mounts an explicitly chosen existing ADC file read-only:

```sh
STUDIO_LOCAL_ADC_PATH=/absolute/private/path/application_default_credentials.json \
  docker compose --env-file .env -f compose.yaml -f compose.google-adc.yaml up --build --detach --wait
```

The overlay refuses to create a missing source path. The non-root container user must be able to read that file; verify local ownership/access without printing its content. Do not make credentials world-readable or bake them into the image. This mount and its `GOOGLE_APPLICATION_CREDENTIALS` environment variable are for local Docker only. Cloud Run uses its attached service identity and must not receive a local ADC path. Keep local ADC files and `.env` outside version control.

A separate environment file can live outside the checkout:

```sh
STUDIO_ENV_FILE=/private/path/studio.env node scripts/setup-local.mjs
docker compose --env-file /private/path/studio.env up --build --detach --wait
```

The destination directory must exist. `STUDIO_ENV_FILE` selects setup's output; pass that file explicitly to Compose. Open http://127.0.0.1:3001 and choose **Continue with Google**. The port binds to loopback and leaves port 3000 intact. `STUDIO_LOCAL_PORT` selects another unused port. `AI_ALLOW_SYNTHETIC=true` only enables visibly marked source-excerpt generation after source review; it does not alter authentication or verify factual claims.

## Build, persistence and recovery

The pinned Node 22 Dockerfile uses the lockfile and canonical Svelte/Vite build, installs runtime Firebase Admin/Google SDKs and Sharp, includes fonts, and runs as non-root with a read-only filesystem except `/tmp` and `/data`. The named `studio-data` volume contains SQLite authorization memberships, brand profiles, reviews, drafts, calendar, jobs, usage, telemetry, preflight evidence and artifacts. In Google mode it contains no application password hashes or application session tokens. Google accounts and refresh tokens are managed by Firebase and the browser SDK, respectively.

Normal stop/recreate preserves the volume. `docker compose down --volumes` deletes it and is not normal shutdown. The first Google-mode migration preserves stable principal IDs/memberships and removes legacy app credentials; historical backups may still contain them. Back up before migration and use only a compatible image for rollback. Reverting an image does not restore removed passwords. See [backend recovery](backend-operations.md) and [Google migration](google-auth.md).

```sh
docker compose --env-file .env logs --follow studio
docker compose --env-file .env down --timeout 15
```

`/healthz` checks serving-process liveness. `/readyz` bounds repository readiness and cloud artifact access when applicable. It does not certify a live Google login, paid content provider or external publication. Real Google sign-in and revocation lookup need their own operator acceptance.

## Separate verification boundaries

```sh
# Official Auth Emulator + actual Chromium Google popup and backend SDK verification.
# Requires application dependencies, built dist, and installed Playwright Chromium.
NODE_ENV=test bash scripts/test-google-auth-emulator.sh

# Disposable legacy API/container persistence contract only.
bash scripts/docker-smoke.sh
```

The Google script uses `firebase-tools@15.34.0` in a separate private development-tool cache, a `demo-*` project, and a temporary loopback Auth Emulator (default port 19098). `emulators:exec` owns readiness and shutdown and propagates browser failures. It checks the actual compiled Google sign-in UI, popup cancellation, Google token refresh/persistence, backend verification, real download, role restrictions, outsider denial and signout. It never provisions cloud resources. Emulator credentials are not accepted by a production deployment; the backend forbids emulator mode on Cloud Run/production and requires loopback clients. Override `STUDIO_AUTH_EMULATOR_PORT` only to another unused local port.

The Docker smoke explicitly applies `compose.test-password.yaml`, sets `NODE_ENV=test` and password authentication, generates disposable credentials, and uses its own Compose project, loopback port and volume. It verifies lifecycle, scoped edits/calendar, actual PNG downloads and ejection/import recovery after recreation. It cleans up only that disposable project. This validates persistence/container behavior, not production Google authentication. Production and Cloud Run reject password mode even if explicitly configured. Do not apply the test overlay to the local Google pilot.

CI runs legacy contracts/browser cases with explicit password-mode fixture constructors in a test environment, real Chromium Google sign-in separately against the official Auth Emulator, actual Firestore emulator transactions with Java 21, and Docker acceptance. Source inspection and synthetic providers do not prove deployed service connectivity. Earlier Docker Desktop recovery and local ARM64 acceptance remain baseline evidence; evaluate all checks against the final integrated Google commit.

Local success is not cloud deployment. Project/IAM/Identity Platform configuration, authorized cloud domains, Firestore/GCS, paid-provider access, scheduling, budget and rollback need their own recorded pilot evidence. This setup does not activate billing or select a software license.

## Optional renewable local Vertex credentials

Google sign-in and AI generation use separate managed services. The normal Compose configuration can run Google sign-in without AI metadata access. The existing `compose.google-adc.yaml` mount supplies the same operator ADC file to Firebase Admin for account revocation checks; merely mounting it does not enable Vertex calls.

For a reviewed **local** real-provider acceptance run, use the already configured explicit Google project and readonly ADC file. Select Vertex ADC deliberately and disable synthetic fallback:

```sh
export AI_PROVIDER=gcp-vertex
export AI_VERTEX_USE_ADC=true
export AI_ALLOW_SYNTHETIC=false
export GOOGLE_CLOUD_LOCATION=us
export AI_MODEL=gemini-3.5-flash-lite
# STUDIO_FIREBASE_PROJECT_ID and STUDIO_LOCAL_ADC_PATH must already be set explicitly.
docker compose --env-file .env.local -f compose.yaml -f compose.google-adc.yaml up --build -d
```

The overlay passes the selected Firebase project as `GOOGLE_CLOUD_PROJECT` and defaults to the selected pilot's US routing/model. These settings are configuration, not a provider availability or pricing guarantee. Input bytes, output tokens and daily generation attempts retain server ceilings; approved sourced content is still required. A bounded actual-provider campaign must be verified separately by the operator. No real provider call is made by the unit tests.

The pinned official `google-auth-library` uses its public `GoogleAuth.getAccessToken()` API to cache and refresh access credentials from `GOOGLE_APPLICATION_CREDENTIALS`. An explicit file is required; missing/invalid/revoked ADC fails without provider fetch or synthetic substitution when `AI_ALLOW_SYNTHETIC=false`. There is no application credential database, token file, hourly copy/paste token step, token API response or token logging. Keep the ADC file outside the repository, image, tenant data and backups, mount it readonly, and grant only the approved project permissions. Refresh-token rotation or revocation remains an operator action through Google.

`AI_VERTEX_USE_ADC` defaults off. Cloud Run rejects this local-only flag and continues to use `AI_VERTEX_USE_METADATA=true` with its runtime service identity. When metadata is explicitly selected locally it takes precedence over ADC; a metadata failure never falls through to local ADC. Existing explicitly supplied short-lived tokens retain their existing precedence for controlled diagnostics, but are not the normal local workflow. The configured request deadline includes credential resolution. The SDK's credential lookup may settle after cancellation, but an abort guard prevents any subsequent model fetch after the deadline.

Verification under Node 22: `node --test server/vertex-adc.test.js server/gateway.test.js`. These tests use trusted constructor adapters for token/provider I/O and an actual SDK missing-file failure. They do not prove live ADC permissions, Vertex model readiness or production generation quality.

Official references: [Google Auth Library public API](https://googleapis.dev/nodejs/google-auth-library/latest/classes/GoogleAuth.html), [Google Auth Library ADC guidance](https://github.com/googleapis/google-auth-library-nodejs#application-default-credentials), [ADC file selection](https://docs.cloud.google.com/docs/authentication/application-default-credentials).
