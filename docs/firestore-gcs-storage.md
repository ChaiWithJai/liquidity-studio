# Firestore and GCS storage adapter

`server/cloud-store.js` supplies the agreed asynchronous store contract: `get(key)`, atomic `update(key, pureSynchronousCallback)`, `delete(key)`, `keys(prefix)`, `close()`. `createCloudStore()` imports the pinned official SDKs only in cloud mode. Backend startup must await the configured factory and select it with `STUDIO_STORAGE_MODE=firestore`; it must not silently fall back to local/ephemeral storage after cloud initialization failure.

Configuration: `GOOGLE_CLOUD_PROJECT`, `STUDIO_ASSET_BUCKET` (legacy alias `STUDIO_GCS_BUCKET`), optional `STUDIO_FIRESTORE_DATABASE` (default `(default)`) and `STUDIO_FIRESTORE_COLLECTION` (default `liquidity_state_v1`). Credentials come from ADC/attached service identity, never data exports or request bodies. Configure Firestore data access and private-bucket object get/create/delete permissions. Optional `checkHealth()` also checks bucket metadata and therefore needs `storage.buckets.get`. A successful check verifies access at that time, not backup correctness or provider readiness.

KV metadata and binary JSON chunks commit in one Firestore transaction; a four MiB per-key bound leaves headroom under service transaction limits. Larger values fail explicitly with `STORE_CAPACITY` before any write. Chunking avoids the one-MiB document limit; atomic reads and checksums detect incomplete/corrupted data. Callbacks can retry and must not perform network calls, generate IDs, mutate external state or emit billing events. Generate immutable IDs before entering the callback. Prefix listing is internal store discovery, not tenant authorization; services must authorize membership and constrain org/brand scope before resolving any key. Per-scope aggregate capacity is a documented pilot bound; archive or evolve the repository data layout before exceeding it.

Assets use `uploadArtifact({organizationId,brandId}, id, bytes, contentType)`, `downloadArtifact(scope, ref)` and `deleteArtifact(scope, ref)`. References contain a content-addressed scoped object name, bucket, immutable generation, byte length, SHA256 and content type. Upload preconditions prevent overwrite; repeat uploads verify metadata. Reads pin generation, check scope/metadata and verify bytes. These checks supplement application authorization and bucket IAM; they do not turn a client-provided org/brand ID into permission. Assets are bounded to20MiB and an explicit MIME allowlist. Orphan cleanup after a successful upload but failed repository commit is separate retention work; retries use the same immutable asset ID/content hash.

`backup(path)` deliberately rejects local-path backup requests in cloud mode. Use reviewed managed Firestore/GCS backup operations or the authorized portable export. A customer export must resolve its asset references to bytes/checksums and import by uploading under the destination scope; raw managed bucket references are not portable. Never treat a whole-database backup as an organization-scoped customer export. Application rollout/rollback must preserve compatible schema and data; reverting code alone does not undo remote writes.

## Evidence and reproducible checks

From repository root:

```sh
node --test liquidity-studio/server/cloud-store.test.js
# Java21, gcloud cloud-firestore-emulator component, npm ci required:
bash scripts/test-firestore-emulator.sh
```

The script owns a loopback JVM on8682 (override `STUDIO_TEST_FIRESTORE_PORT`), refuses occupied ports, and stops its own listener. It never resets Docker or contacts managed Firestore. The emulator contract refuses non-loopback hosts. It verifies actual SDK/client reopen,12 competing atomic increments, chunked Unicode, scoped key discovery, failed-update atomicity, no-op revision preservation and deletion. Recorded local run passed against gcloud emulator1.20.3 and Firestore SDK9.3.1. Nine separate SDK boundary tests cover GCS cross-org/brand rejection, checksum tampering, generation pinning, upload retries and invalid artifact inputs. GCS tests are injected transport-boundary tests, not evidence of a live bucket. Live IAM/storage/backup validation remains an explicit deployment gate.

Official references checked2026-10-17: [Firestore transactions](https://cloud.google.com/firestore/native/docs/manage-data/transactions), [Firestore Node client](https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/firestore), [Cloud Storage Node client](https://cloud.google.com/nodejs/docs/reference/storage/latest). No managed cloud resource or paid provider call was created during these checks. Test tooling installed Java21 and the Firestore emulator locally; no application process was restarted.
