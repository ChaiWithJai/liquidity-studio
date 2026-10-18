# Public runtime rollout — 2026-10-18

The maintained local runtime and canonical GCP pilot now serve the public artifact from PR #139, source `af41c1d70e530f6908f0c9f926fd9ca8a768964a`. This includes the selected-passage source preparation, historical native continuation, document-scoped image retrieval and story-context notice fixes. Private native editor features remain disabled in the public runtime.

| Item | Verified value |
| --- | --- |
| Local image | `sha256:d80685341ae364f9072d3963f32f55710902fcdd82e580614a192dbaa164cfc7` |
| Registry digest | `sha256:e216d4f243ab420dcf78718d5f2bbcec2aa4c75e16639bd2af89c5944e9964b1` |
| Public JavaScript | `index-BWJKhL1L.js` |
| Cloud revision | `liquidity-studio-00022-lok`, 100% canonical traffic |
| Cloud rollback revision | `liquidity-studio-00019-gen` |
| Region | `us-east4` |

Both local Compose services use the same pinned image. Docker reported the web service healthy and the worker running. BrowserOS neo observed the new JavaScript bundle, readiness HTTP 200 and anonymous workspace HTTP 401 on localhost:3001, the staged cloud URL and the canonical cloud URL. The operator used separate tabs and did not reload the user's existing editor buffers.

The cloud candidate was staged with no traffic before promotion. The service runtime specification, including environment, service account, resources, concurrency and timeout, matched the prior revision after excluding the intended image change. Minimum and maximum instance settings also matched. Existing revision tags were retained. This patch does not introduce a new service or change the pilot budget assumptions; budget notifications remain alerts, not a hard spending cap.

A consistent local SQLite backup preceded rollout: 548,864 bytes, SHA-256 `62b2c408d4c2a53a937843494cfb0b7c54266dc839d11aa3576e7509c1cedec5`. The Firestore export to the private backup prefix `backups/pre-public-af41c1d` completed successfully before staging (18 documents, 231,473 bytes). Resolved configurations, backup files and detailed operation receipts remain private and are not included here.

PR #139 passed all five hosted checks and independent source review. Its authenticated application acceptance used the controlled BrowserOS neo fixture: same-story success feedback remained visible; changing stories removed previous-story feedback; fresh real-HTTPS preparation produced an unreviewed selected-passage preview and cleared the obsolete queued notice. That fixture evidence is distinct from the public deployment probes above.

Fresh Google login was not repeated for this patch. Prior real founder Google acceptance, unchanged authentication-source hashes and current provider/configuration checks are recorded separately in [Google authentication acceptance](google-auth-acceptance.md). Neither this rollout nor the fixture claims Nicole's manual onboarding, observed operator training, public native-editor licensing clearance or completion of the remaining native image, motion and recovery tickets.

Issue #138 closed after the maintained rollout and post-roll probes. The preparation-specific acceptance remains in #127 and its linked evidence; this release does not retrospectively review or approve any story.
