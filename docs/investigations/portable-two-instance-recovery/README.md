# Bounded two-instance portable recovery

Actual BrowserOS neo observation, 18 October 2026. This is a disposable local controlled-password/SQLite fixture, not Google, Cloud Run or a new remote-storage result. Parent [#57](https://github.com/ChaiWithJai/liquidity-studio/issues/57) remains open. The [sanitized evidence](evidence.json) records the measured results; credentials, session material, full packs, database and key manifests remain private.

## Source and procedure

All production server JavaScript files used by the fixture were compared byte-for-byte with [main bdb7df0](https://github.com/ChaiWithJai/liquidity-studio/commit/bdb7df0ca2b43297a07c9e4e370edf6620f11a7a). The frozen runtime was [a65bf368](https://github.com/ChaiWithJai/liquidity-studio/commit/a65bf3682fa99b26970e5ac1cab144d63f3924d7); its separately fingerprinted original public UI was served without a private native frame. No source production change was made for this experiment.

Two ordinary application processes shared one fresh SQLite database and a fresh disposable founder/organization. A listened on loopback port 39037 and B on 39040. Both used unchanged DurableStore, IdentityService, platform, HTTP server and portable service. A private wrapper armed by a trusted local process signal paused **after** the first real tagged staging transaction committed and released its SQLite lock. It introduced no HTTP fault/admin route and did not change transaction callbacks or database guards.

The input was the corrected combined PR148 fixture pack: 2,852,342 bytes, SHA256 `a5fc1f0abee9c5174955a698f88e2eec9e1826e70a0c75b208e6bc02e4f3f4fe`. Its earlier administrative trace repair remains historical fixture preparation, not new provider execution or human research approval. This experiment performed no model inference, native render, cloud operation or paid call.

## Actual results

1. Operations selected a sparse file of 50,331,649 logical bytes, with zero allocated payload blocks. The existing client refused it with “Choose a JSON pack no larger than 48 MiB.” No destination/install POST occurred before a genuine small pack was subsequently selected. This proves the client ceiling refusal, not successful near-ceiling JSON parsing or memory safety.
2. Ordinary UI created a new empty recovery brand (201) and began restoration on A. The private committed barrier captured the installation after its first staged record. A was then terminated using its independently verified owned PID/command.
3. B stayed alive. Its ordinary authenticated status endpoint returned 200, `installing`, original actor and rollback permitted. Normal target-brand bootstrap/data access returned 423. No direct rollback API mutation was used.
4. A root-reviewed fixed loopback proxy restored the original origin at 39037 while routing streamed requests only to live B at 39040. It preserved Host/Origin, had bounded status-only logs and no variable upstream or control endpoint. The browser's real retained intent stayed at its original origin; no browser storage or credentials were copied.
5. Through ordinary source-brand Operations at that stable origin, **Check retained recovery status → Recover interrupted empty destination** returned rollback 200. Read-only database observation confirmed the unrelated sentinel unchanged and zero remaining staged records tagged to the interrupted installation.
6. The operator reselected the exact pack, deliberately confirmed the owner/source acknowledgement and clicked **Retry retained recovery request**. The retained same-key install returned 200 and the UI showed completed. The final database contained exactly one completed installation journal. Original and alpha bytes/SHA256 plus full derivative lineage matched the input.
7. Full reload and retained-status check confirmed completion. The proxy was stopped; A was restarted against the same database and its ordinary UI status check also confirmed completion without reinstalling. Final target selection was observed only in its loading state before the tab was blanked; this report does **not** claim a completed final artwork/backlog rejoin or a new PNG export.

## Negative findings retained

Direct navigation to B's different port did not carry A's retained locator: browser local storage is origin/port scoped, while the same-host session cookie is shared. Stable-origin failover was therefore exercised explicitly, rather than pretending the different origin had the same client recovery state.

Selecting the locked destination also exposed a genuine product defect: bootstrap 423 made the App render “Workspace could not load,” including Operations, although the server status route remained usable. This is tracked separately as [#157](https://github.com/ChaiWithJai/liquidity-studio/issues/157). Successful recovery from the unlocked source brand does not waive that defect. No full interrupted database snapshot exists: the committed barrier, key/value hash-and-size manifest and request/status evidence were retained, while the database later advanced to completed state. It must not be reconstructed and represented as the original observation.

The private PID control helper safely refused a `/tmp` versus `/private/tmp` command-path alias. Independently verified exact owned process signals were used instead; the matching rule was not broadened and no database guard was bypassed.

## Bounds, backup and limits

Each operational process had a 256 MiB V8 old-space ceiling. Sampled RSS values included A 104,800 KiB and B 84,352 KiB; these are samples, not measured peaks or universal capacity guarantees. Disk headroom exceeded 5 GiB during startup. The observed SQLite/WAL/SHM footprint stayed below 1 MiB, under the reviewed 32 MiB stop threshold. No physical disk exhaustion, near-48 MiB valid pack allocation or OOM experiment occurred. Maximum accepted-pack peak memory remains unproved; a separately bounded experiment with enforced limits and measured headroom can be considered.

Both owned application processes and the proxy were stopped; both ports had no listener and the owned Neo tab was blank. A quiescent production `VACUUM INTO` backup retained 15 records, 421,888 bytes, SHA256 `a7677edf1b2a419845e3e1d4055c1cc755a92eefa4c13cb8ff5cb5eb2c14cdc9`. The sentinel was checked unchanged. Local backup, database, receipts and source fingerprints remain retained; no broad cleanup was run. No local test runner, Playwright process or new browser process was used.
