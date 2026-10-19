# Destination-owned runtime cold restart

Actual root-operated BrowserOS checkpoint, October 19, 2026 UTC, following the [fresh customer-data restore during source outage](fresh-restore-during-source-outage.md). This adds destination-owned installation files and a cold restart; it does not close Issue #57. See the [public acceptance checkpoint](https://github.com/ChaiWithJai/liquidity-studio/issues/57#issuecomment-6259551238).

## Copied installation and restart

The retained private copy receipt verifies **791,239,438 bytes across 30,252 regular files**, with **24 destination-internal relative file links and zero external symlinks**. The finite hash inventory includes application source/public fonts/notices, cached installed dependencies, Node and its license, the private native bundle, the verified native JAR, and the three parent-relative files required by the native bundle verifier. Dependency directory links were materialized; no package installation or model download occurred.

Only the restored destination Studio and its native backend were cold-started from these owned files. The existing private application home, native database/assets and explicit imported-file mapping remained intact. Changing the native JAR bind required recreation of that destination backend container; this was not recreation of source services or replacement of data volumes.

The original Studio/callback processes and original native/Doory backends were unavailable for approximately **186 seconds**. Read-only observation after the destination exports still found those source processes stopped and containers paused. Both main and watchdog resumption paths recorded zero errors after release. Ordinary source navigation then reopened the backlog.

## Actual saved work and outputs

In the cold-restarted destination native editor, root removed the previously saved headline period, returning “Begin with ethics.” to “Begin with ethics”. Saved state and full reload confirmed the baseline text. Ordinary PNG export produced **58,530 bytes**, **1080 × 1920**, SHA-256 `84063eea51461ba33369a30fe3a538e2aa44af919dde2cfe3e979c0d054013fe`.

The same existing reviewed Doory copy fully reloaded with its original uploaded sound. Ordinary **Play all → Stop** worked. One **MP4 → all three pages → 1080p → 30fps → Include sound** export produced **839,827 bytes**, **1080 × 1920**, **30.08 seconds**, SHA-256 `97cab1786e189bcc2a454a8d5beee0fa2c56a900c794dc3d6177dce2d4165292`. The browser blob matched the downloaded file. Browser decoding found stereo 48 kHz audio, RMS 0.04322144; unmuted playback had no video error. This is decoding/playback evidence, not acoustic listening or exact 30.00-second encoded duration.

## Preserved failures and scope

The operation was not first-attempt success:

- An initial proposal missed symlinked dependency bytes. A partial copy then stopped at a canonical-path assertion. A shared plan was replaced while root's copier consumed it, causing a later schema-key failure before further copying. The final frozen inventory and completed copy receipt resolve those preparation failures; they are not hidden as successful initial runs.
- The first cold-restart attempt rejected Docker Desktop's bind-source path spelling at a post-recreation assertion and rolled back. The corrected second attempt used the actual path representation and completed without rollback. Backups and both attempt receipts remain private.
- A transient startup 502 occurred before the destination became usable; this is not seamless-startup acceptance.
- The local Vite development server automatically re-optimized dependencies after the path/config change. No explicit local production-build command or test suite was run; this does not claim zero local development transformation.

This proves a destination-owned cached-file closure and runtime cold restart, followed by saved native editing and sound-bearing media export while source service origins were unavailable. It does **not** prove deletion of source files, installation on a new machine/OS, internet independence, managed cloud recovery/sizing, human learner completion or full Issue #57 acceptance. Source data and rollback copies remain preserved. No model inference, new human account/SSO flow or cloud provisioning occurred.

Private evidence includes the per-file copy receipt, both cold-restart attempts, source-outage journal, post-export source-state observation, BrowserOS receipts and actual output byte checks. Raw customer assets, configurations and credentials are not published here.

A later [destination datastore restart/rejoin](destination-datastore-rejoin.md) separately restarted PostgreSQL and Valkey, retained the native backend process, and observed saved-work and same-identity live updates resume. Its graceful-process and ACL limitations are explicit.
