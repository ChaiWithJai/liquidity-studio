# Google-only pilot authentication

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
