# Google-only pilot authentication

Current bounded acceptance and the distinction from unobserved marketer onboarding are recorded in the [October 18 deployment disposition](deployments/google-auth-acceptance.md).

The application defaults to `STUDIO_AUTH_MODE=google`. Google Identity Platform / Firebase Authentication owns accounts, sign-in and token refresh. The app retains only authorization principals (stable IDs, display usernames, role and allowlisted email) and organization/brand memberships. It stores no Google ID tokens, refresh tokens, app password hashes or app sessions in Google mode.

Configure the Google provider and authorized domains in the intended Firebase project, then supply:

```
STUDIO_AUTH_MODE=google
STUDIO_FIREBASE_PROJECT_ID=<explicit-project-id>
STUDIO_FIREBASE_API_KEY=<public-web-app-api-key>
STUDIO_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
STUDIO_FIREBASE_APP_ID=<public-web-app-id>
STUDIO_GOOGLE_FOUNDER_EMAIL=<verified-founder-google-email>
STUDIO_GOOGLE_MARKETER_EMAIL=<verified-marketer-google-email>
```

The two emails must differ. Local port 3001 and GCP must use the same project and allowlist. Public Firebase web configuration is returned by `GET /api/auth/config`; allowlisted emails and service-account credentials are never included. Production Google login still requires actual provider configuration, authorized domains, user interaction and operator verification; emulator tests do not establish these.

The browser uses the official Firebase App/Auth modules with GoogleAuthProvider, and sends the current Firebase ID token as `Authorization: Bearer <token>` on every protected request. The server uses pinned `firebase-admin` 14.5.0, supported on Node 22+, calling `verifyIdToken(token, true)` to validate signature/project/issuer/expiry and check account revocation/disabled state. It additionally requires `email_verified`, a Google `sign_in_provider`, and an exact allowlisted email. Verified identity alone never authorizes an organization, brand, artifact or admin operation: existing membership and role checks still apply. Cookie session tokens are ignored; app password login and password rotation return 405. Firebase client signOut clears local credentials; no app server session is created or logged. Revocation of a Google account's sessions is managed in Firebase, not an application password screen.

For revocation checks, the backend's ADC identity needs the minimal `firebaseauth.users.get` permission on the authentication project (for example a reviewed custom role). It does not need to create or modify authentication users. Local ADC credentials must also be configured for this read. Failing SDK verification or account lookup rejects the request; there is no password or unsigned-token fallback.

On first Google-mode startup, existing configured founder/marketer usernames map to their existing IDs. Existing organizations and membership IDs remain unchanged. Password hashes, salts and application authentication versions are removed from every principal; all old session and login-attempt documents are deleted. Additional old principals retain authorization records but cannot authenticate unless explicitly mapped. Ambiguous identity mapping fails closed for operator review. Existing database backups can still contain old credentials and must be treated as sensitive and retired according to retention policy; logical migration is not forensic erasure of older backups or database pages. Reverting an image does not restore deleted passwords: use Google mode or a separately reviewed backup restoration. Never restore a credential-containing snapshot into the Google deployment without running this migration again.

For isolated legacy tests only, explicitly select `STUDIO_AUTH_MODE=password`; production (`NODE_ENV=production`) and Cloud Run (`K_SERVICE`) reject it. Existing test factories can use `createPlatform({store, authMode:'password'})`. This compatibility mode is not evidence of Google provider readiness and is not the pilot configuration.

For the official local Firebase Auth Emulator, both `STUDIO_AUTH_EMULATOR_ENABLED=true` and `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:19099` must be set explicitly. Public config then adds `emulator.url`. Non-loopback emulator hosts, production and Cloud Run are rejected. Emulator-backed API requests must originate from loopback. This mode accepts emulator-issued tokens for local development only; never enable it on a deployed service. No environment option supplies a fake production verifier.

Evidence: `node --test server/google-auth.test.js` covers credential migration, stable authorization IDs, bearer-only HTTP, foreign-scope denial, provider/email/project/expiry policy, revoked/disabled failures, emulator restrictions, actual Admin SDK rejection of malformed/unsigned tokens, and safe failed readiness. Constructor-injected verifiers in policy unit tests are explicitly trusted test adapters, not production token acceptance.

Official references: [verify ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [revocation checks](https://firebase.google.com/docs/auth/admin/manage-sessions), [Firebase Authentication IAM permissions](https://docs.cloud.google.com/iam/docs/roles-permissions/firebaseauth).

The browser uses the public modular `firebase/app` and `firebase/auth` APIs. Firebase owns identity persistence and ID-token refresh; application code obtains `getIdToken()` for each API request and never copies tokens into its own storage. The API validates identity and grants the role. Artifact downloads also carry the bearer token, then download a short-lived browser Blob URL. Google mode has no password-form fallback. Popup cancellation stays on the sign-in view with an explicit retry button.

Browser regression: start the official Authentication Emulator with Firebase CLI `15.34.0`, demo project `demo-liquidity-auth`, Auth host `127.0.0.1:19099`, and UI disabled. Then run `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:19099 npm run test:browser -- tests/google-auth.spec.js` inside `liquidity-studio`. The suite provisions only temporary local SQLite state and emulator accounts. It verifies real SDK popup sign-in, Admin SDK backend verification, founder/marketer authorization, outsider denial, reload persistence, actual PNG download, popup cancellation/retry, and sign-out. Without an explicit emulator host the real-emulator journey is marked skipped; configuration failure checks still run.

Firebase `12.19.0` includes an unused Firestore gRPC transport pinned to an older vulnerable 1.x range. The lock applies a reviewed compatible 1.x override to `@grpc/grpc-js` `1.14.6`, covering [GHSA-m9gg-hp2v-232j](https://github.com/advisories/GHSA-m9gg-hp2v-232j). Browser code imports only App/Auth. `npm audit --omit=dev` reports zero findings after the override; this is dependency evidence, not a substitute for the integration tests.

Browser references: [Google popup sign-in](https://firebase.google.com/docs/auth/web/google-signin), [Auth SDK reference](https://firebase.google.com/docs/reference/js/auth), [official Authentication Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth).

Node 22 compatibility is pinned and verified with Node `22.23.1`: public Firebase `12.19.0`, App `0.16.2`, and App Compat `0.5.18` have Node >=20 support. Exact compatible peer overrides prevent broad peer ranges from selecting Node 24-only App releases. Clean `npm ci --engine-strict`, production build, and the real Auth Emulator browser journey passed under Node 22. The emulator fixture resets only its explicit loopback `demo-liquidity-auth` accounts, so repeated runs do not depend on retained demo account menus.

## Pending popup recovery

The Google popup can remain unresolved when its browser/provider exchange does not finish. After 90 seconds, the sign-in view says **Google sign-in has not completed. Finish the Google popup or try again.** The button becomes available for an explicit retry. This is a waiting limit, not evidence that Google rejected the account. There is no automatic new popup, password fallback or authentication based on elapsed time.

Retries use the same official Firebase popup API. Each attempt has its own sequence; an older promise rejection, completion or timer cannot replace a newer attempt's pending/error state. The Firebase auth-state observer invalidates outstanding UI timers, and only its backend-verified session opens the workspace. A valid identity that finishes after the waiting message can still be verified normally. Sign-out and component cleanup invalidate pending UI work. This does not alter backend token verification or add a general API-request timeout.

Regression evidence uses the real local Auth Emulator with [Playwright's clock](https://playwright.dev/docs/clock#test-inactivity-monitoring): leave the first SDK popup pending, advance elapsed time, assert no workspace/session or automatic popup, then explicitly retry and complete a real SDK sign-in with server verification. It also checks that cancellation of the older popup cannot clear the new attempt and that no stale timer appears after authentication. This evidence does not identify the cause of any particular live OAuth/browser failure.

## Add a collaborator without replacing an existing account

`STUDIO_GOOGLE_ADDITIONAL_EMAILS` is an optional server-only JSON array of up to 100 email addresses. For example: `["collaborator@example.com"]`. These accounts always receive the existing non-admin `marketer` role. The two bootstrap accounts remain configured separately. Duplicate addresses, conflicting usernames, malformed lists and ambiguous stored identities fail startup.

An additional account starts with **no organization or brand memberships**. A founder must grant the intended organization and explicit brand IDs through the existing membership controls (`POST /api/admin/memberships`). Inspect the persisted account and scope before sending a ready-to-use invitation. The recipient uses **Continue with Google** and the exact configured address; configuring an address does not create a Google account or prove its first sign-in.

Additional account IDs are deterministic, namespaced SHA-256 identifiers derived from normalized email addresses. They survive restarts and the legacy migration that retains IDs, usernames and roles. Existing memberships are never seeded or restored by restarting. Removing an address from the configured list prevents authentication; removing its brand membership prevents access to that brand. Re-adding an address reuses its original ID and current memberships, including any revocations.

Deploy the supporting image and configuration together through the normal reviewed release path. Rolling back to an image without this setting denies additional accounts; the two bootstrap accounts and membership records remain. Roll forward and verify scope before resending a ready note. Public `/api/auth/config` responses omit the entire principal list.
