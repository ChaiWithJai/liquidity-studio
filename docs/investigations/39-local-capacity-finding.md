# Investigation 39: local editor capacity finding

Observed 2026-10-18 UTC. This records an operational failure and a corrective gate, not editor acceptance or an abandoned experiment.

Before the Penpot experiment, Docker reported 12 CPUs, 15.6GiB configured RAM and about 1.1GiB aggregate current container memory. Host memory-pressure output reported 44% free, despite substantial existing swap. The proposed isolated five-service Penpot stack was capped at approximately 3.7GiB, with localhost port 39008, its own network/database/assets volumes, private fixture credentials and no SMTP/SSO/MCP/admin-console services.

The preflight checked RAM, ports, image availability and pinned upstream configuration, but **missed host filesystem capacity before starting image pulls**. This was an operator error. A later filesystem check found only about 850 MiB free, then 118 MiB while image extraction was underway. The experiment's Compose pull was interrupted immediately (exit 130). No Penpot container was launched. The exporter image was the only newly completed Penpot image observed, approximately 2.42 GB unpacked. Cancelling a client does not establish that all daemon extraction/storage work stops immediately.

Subsequent read-only Docker inspections returned overlay storage I/O errors, and the control plane became unresponsive. Disk exhaustion was contemporaneous with these failures; a definitive filesystem/daemon root cause requires recovery evidence. Existing local application URLs and the hosted pilot remained reachable according to the coordinating operator. No foreign containers, volumes or images were stopped, reset or pruned by this experiment.

The coordinating operator reclaimed only this session's disposable dependency/install caches; daemon recovery is handled separately. The pinned Compose, fixture SVGs and private logs were preserved. This is not evidence of Penpot startup, import, edit, native export, restore or performance.

## Corrective preflight

`node scripts/investigations/check-local-capacity.mjs <filesystem-path> <required-free-GiB>` checks host-available bytes with filesystem statistics and fails closed for insufficient space, invalid inputs or unreadable filesystems. It does not contact Docker. The [experiment wrapper](../../scripts/investigations/penpot-local.sh) invokes this gate before **both pull and up**, uses sequential pulls and targets only the uniquely named `penpot-native39` project. Its `down` action preserves volumes. Destructive volume cleanup is a separate, explicit owned-fixture operation.

The initial default is **12 GiB host free space** for this experiment, a conservative working allowance for compressed image downloads, unpacked layers and transient copies. It is an operator-selected floor, not an upstream minimum or a guarantee of adequate capacity. Record the estimate and increase it when observed image sizes or planned assets require more. Do not lower it merely to bypass a failure. Concurrent builds/downloads can invalidate a successful check; coordinate them and repeat the check immediately before each phase.

Before resuming, separately confirm Docker Desktop VM backing-store free capacity and responsive daemon operations with bounded commands, available host memory and sufficient disk reserve throughout extraction. A sparse VM's host backing space and its internal filesystem can fail independently. Do not treat the RAM figure, a stopped client, cached images, or the host-only script as proof of VM storage health. Stop only owned experimental work on renewed pressure and preserve evidence; never use a global prune or reset to make the test pass.

Once recovery and the Doory resource handoff are confirmed, inspect the pulled backend launch script/JVM heap against its container limit, start only the capped isolated stack, then complete actual native SVG/text/token import, edit, real artifact export and native bundle restore. Every one of those runtime results remains pending here.

Validation: `node --test scripts/local-capacity.test.mjs` exercises invalid/insufficient/missing-filesystem failures and proves that both wrapper phases never invoke even a fake Docker executable after a failed gate. This test does not contact the daemon or prove capacity for the editor.
