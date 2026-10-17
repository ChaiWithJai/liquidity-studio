# Google provider provisioning

Use the supported [Firebase CLI Authentication configuration](https://firebase.google.com/docs/auth/configure-providers-cli), not the retired IAP OAuth Admin API. The reviewed official `firebase-tools@15.34.0` can create the Google OAuth brand/client through its auth-only deployment. Its implementation reuses an existing Firebase app. Set up the explicit project/Web App first; review that no unrelated apps would be selected.

Install the pinned CLI into a private temporary tools directory using `npm install --prefix "$TOOLS" firebase-tools@15.34.0`. Set `PILOT_FIREBASE_CLI` to its absolute `node_modules/firebase-tools/lib/bin/firebase.js`. For this pilot, the auth domain must exactly equal the explicit project ID plus `.firebaseapp.com`; other domains require a separately reviewed ownership-validation change. CLI operations have a 120-second deadline. Configure these inputs in private operator environment, never committed values:

```text
PILOT_PROJECT=your-project-id
PILOT_CONFIRM_PROJECT=your-project-id
PILOT_FIREBASE_APP_ID=1:PROJECT_NUMBER:web:APP_IDENTIFIER
PILOT_AUTH_DOMAIN=actual-domain.firebaseapp.com
PILOT_SUPPORT_EMAIL=operator@example.com
```

Run `node scripts/provision-google-provider.mjs plan` for an offline target check. After reviewing it, run the same script with `apply`. The script checks project ownership of the Web App and rejects enabled anonymous/email-password methods before deployment. It uses a private temporary configuration with only Google enabled, invokes `deploy --only auth` with an explicit project, then verifies enabled Google configuration and continued disabling of alternative methods. No OAuth secret is supplied, printed or returned. The CLI's `false` provider settings alone do not disable existing providers; an unexpected preexisting enabled provider stops this script and requires deliberate operator remediation.

The provider API can return OAuth secrets. Keep CLI/API responses out of logs and chat; this wrapper captures CLI output privately and removes its temporary directory, including debug files. ADC/operator access tokens stay in memory and are not command arguments. This operation provisions authentication configuration only; it does not deploy application code or prove live browser authentication. Afterward verify authorized domains, both invited accounts, outsider denial, anonymous API 401 and tenant isolation separately.

Sanitized operational evidence on 2026-10-17: the approved pilot's existing Firebase project and Web App were reused; official CLI 15.34.0 auth-only deployment exited successfully. Independent provider GET returned 200, enabled true and a valid configured Google web client. Operator inventory confirmed anonymous and email/password disabled, with localhost, loopback and the Firebase auth host authorized. No client ID, client secret, token or account email is included here. Live external-account sign-in was still pending at this evidence checkpoint. This continues issues #30 and #19 without closing them.
