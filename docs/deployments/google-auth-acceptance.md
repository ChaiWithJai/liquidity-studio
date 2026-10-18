# Google-only pilot acceptance disposition

Reviewed October 18, 2026 against the original acceptance criteria in [issue 30](https://github.com/ChaiWithJai/liquidity-studio/issues/30). This records existing managed-Google observations and a new read-only configuration/source audit. It does not claim a new human login or that Nicole has completed onboarding.

| Original requirement | Evidence and bounded conclusion |
| --- | --- |
| Google sign-in locally and on GCP, with refresh/sign-out/errors | Actual founder Google sessions opened both maintained runtimes, both brands and rejoined a saved preview after reload in [PR121's release evidence](prepared-source-pilot.md). Earlier human workspace confirmations and the separately labeled SDK/emulator journeys cover their stated observations; emulator results do not establish production provider readiness. |
| Cryptographic token checks, Google provider, two approved identities and server-owned roles | [Authentication implementation and regression evidence](../google-auth.md): Admin SDK revoked-token verification plus issuer/audience/expiry/verified-email/provider checks, exact two-email allowlist and current membership. Existing actual uninvited Google-issued service-identity denial is an API observation, not a third human browser login. |
| No application password/session credentials or password bypass; authorization preserved | Google migration strips application credential fields and old login/session records while retaining authorization IDs and memberships. Password endpoints cannot bypass managed mode. Existing migration/HTTP evidence is separate from managed browser captures. Older backups remain sensitive; no forensic-erasure claim is made. |
| Public SDK settings only; secrets not exported | Public auth configuration excludes the allowlist and provider credentials. Browser uses the Firebase SDK and scoped bearer requests; portable exports exclude credentials/security grants. |
| Explicit loopback emulator plus real Google evidence | Both evidence types exist and remain separately identified. Current maintained configurations have emulator mode disabled. |
| Explicit managed mode and a new immutable Google image | Both maintained local containers run immutable image `sha256:3223fad15bf169f3b3ff9f01c6d3ee93f310f341dd509ec0b20963914a26d536` in Google mode. Canonical cloud revision `liquidity-studio-00019-gen` is the Google release documented in PR121; candidate `00021-dar` remains at zero traffic. These are not password-fixture images. |

## Current configuration and unchanged source

The read-only audit inspected actual Docker container configuration and current Cloud Run service configuration, publishing only these facts: explicit Google mode, intended Firebase project, the two distinct approved principals, emulator disabled, and production native-editor capability disabled. The official Identity Platform Google provider configuration reports enabled. No raw environment, OAuth secret, credential, token or email allowlist is included here.

Source comparison against PR121's actual Google runtime (`9a005d2`) found these files byte-identical in the subsequent combined release candidate `af41c1d`:

| File | SHA-256 |
| --- | --- |
| `server/auth.js` | `853b808b21370d7a2f0d57a615fc568c576629ceef9496e2842c786a8573a7e5` |
| `server/google-auth.js` | `31a3d70312bac32b316629cf04b00039c21d01fc288a8c6d2e16bcd964ed6eb9` |
| `server/platform.js` | `83e3bb39e4a8c9684d66def1f3fae79a9f10204e00a797cf9904b715dee70730` |
| `src/lib/google-auth.js` | `88ec7b9c7186300654486e2dbaf9a0b247a195e8c8ca78010a1731bfb7dd893c` |

The candidate comparison is source evidence, not a claim that PR139 is deployed. Its ordinary release gates remain independent. No local test runner or additional browser process was started for this disposition; current user-requested browser acceptance uses BrowserOS neo only.

## Onboarding and remaining work

Nicole's first real account session remains unobserved. Later requests for that check were additional onboarding evidence, not an explicit original requirement that every named person or an unrelated human account manually retest every image. They are not reported as completed. Existing actual founder Google evidence, provider/cryptographic/policy evidence and current configuration satisfy the original bounded authentication contract without inventing that observation.

Native editor identity/assets, external rooms and client GCS interoperability remain [issue52](https://github.com/ChaiWithJai/liquidity-studio/issues/52) work. Consented human practice remains [issue58](https://github.com/ChaiWithJai/liquidity-studio/issues/58). This disposition neither enables held upstream binaries nor closes those requirements or the rolling ownership queue.
