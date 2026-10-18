# AMD64 hosted candidate recipe

Source-only, 2026-10-18. `penpot-amd64-candidate-artifact.yml` is manual and has not been dispatched by this change. It targets the x86_64 E2 VM in the managed deployment packet. The existing ARM workflow and native-hook verification workflow remain unchanged.

One `ubuntu-24.04` job consumes the successful reviewed native-hook verification artifact through the existing exact native-input/recipe correspondence check, constructs the same production-basis JAR using the pinned official AMD64 development toolchain, preserves dependencies/common classes/source and `data_readers` mapping correspondence, then assembles a JAR-only derivative. It does not rerun unchanged hook tests. Namespace smoke uses no access configuration, network, database, listener or private workspace. Runtime acceptance remains separate.

The explicit runtime base is `penpotapp/backend@sha256:47d33d6c94685332fb115f815be2414cefbf022d93d79fa03a8d439ea587c109`. Read-only Docker Registry manifest/config metadata from the official `penpotapp/backend:2.18.3` tag is retained alongside this file. The exact child digest resolves linux/amd64; its config reports `bundle_version=2.18.3`, user `penpot:penpot`, working directory `/opt/penpot/backend`, command `/bin/bash run.sh`, and `JAVA_HOME=/opt/jre`. The config blob's SHA was checked against the immutable manifest descriptor. No image layer was downloaded, image pulled, or process run locally. This is source/metadata compatibility, **not** proof of Java version or successful JAR loading. Hosted admission requires the exact image/platform/version label and actual Java **26.0.2** followed by all integrated namespace loads; a mismatch stops rather than swapping bases/versions.

The upstream source remains `ff7a66f51938b2293260ea27a64e2c4e0833b5e3`; immutable official toolchain remains `912d522803d94fa3e5c9f304088887a45fa6d90517751094f22a14a8754d2b37`. Source SHA, verification run/source, recipe SHA, unchanged dependency declarations, full corresponding patched source/MPL notices, source/JAR correspondence, reader merge, image inspect, Java smoke log and all delivery hashes are packaged. `record-artifact.py` now accepts only an explicit linux/amd64 or the unchanged default linux/arm64 platform. There is no tag-based fallback, QEMU or public registry push.

## Encrypted operator delivery

Dispatch requires the operator's public RSA PEM in base64 and its independently checked SPKI DER SHA256; the private key never enters Actions. JAR, corresponding source and image archives remain within the **same job**. No plaintext intermediate or final archive is uploaded. Only `encrypted-penpot-amd64-candidate-<run>` is uploaded for three days.

The final tar is bounded to 3 GiB, split into at most twelve ordered 256 MiB parts. Each part uses the existing streaming RSA-OAEP-SHA256 + AES-256-GCM envelope implementation with its unchanged 512 MiB limit. No cryptography is copied and no global bound is raised. The delivery index records exact part count/order/names, each plaintext size/hash, total archive size/hash, ciphertext and envelope filenames. An interrupted/failed build never reaches upload; successful upload contains only encrypted parts, envelopes and bounded reconstruction metadata/instructions.

On the operator machine, inspect the index and require schema1, `1..12` sequential indices, exact `penpot.part-NNN` names, no duplicate/escaping paths, each part ≤256 MiB and total ≤3 GiB. For each listed part run the existing helper:

```
node liquidity-studio/scripts/native-artifact-envelope.mjs open <ciphertextFile> <new-private/plaintextFile> <envelopeFile> <local-private-key.pem>
```

Use a fresh 0700 directory, refuse overwrites, verify each decrypted size/SHA and concatenate **only the index's explicit ordered plaintext filenames**; never concatenate an unrestricted glob containing ciphertext or envelopes. Require the final tar's exact size/SHA before inspecting/extracting it into another fresh private directory. Inspect the inner candidate manifest/image/source/Java evidence before any `docker load`. No load/start/push is part of this recipe or preparation.

Penpot's MPL corresponding-source/license obligations accompany the artifact. This Penpot backend recipe does not build, distribute or grant rights to the separate Doory AAL/GPG evaluation frame or MODNet weights. Encryption is delivery privacy, not a license clearance.

Bounds remain JAR build 8 GiB/no swap/4 CPU, 25 minutes; candidate smoke 1536 MiB/no swap/2 CPU, 180 seconds; image assembly120 seconds and image save180 seconds with image archive≤2 GiB. Job deadline60 minutes includes source/dependency download, build, smoke and encryption. These are hosted budgets, not customer VM memory/capacity claims. Missing source proof, insufficient hosted headroom, registry unavailability, unavailable matching runtime, incompatible Java or oversized delivery fails without automatic retry or deployment.
