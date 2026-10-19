# Destination datastore restart and rejoin

Actual root-operated BrowserOS checkpoint, October 19, 2026 UTC, on the restored destination described in [Destination-owned runtime cold restart](destination-owned-runtime-coldrestart.md). This is a bounded Issue #57 recovery result, not whole-ticket closure.

The destination PostgreSQL and Valkey containers were restarted separately, with their existing IDs retained. Both subsequently became healthy. The native application backend kept the same container ID and start time throughout: no backend restart was needed for the observed saves and live changes to resume. Private consistent database, assets and Studio backups were retained before the operation.

## Actual customer journey

- After PostgreSQL restarted, the already-open native editor saved a headline period edit. A full reload retained that edit and showed Saved.
- After Valkey restarted, a second tab opened the same saved file using the **same existing native identity**. A headline change from the old tab appeared in the new tab without refresh; a change from the new tab appeared in the old tab without refresh.
- The baseline wording was restored, and full reloads in both tabs retained it with Saved status.

Private evidence comprises the before/after container metadata, separate restart receipts, BrowserOS observations and backup receipts. The first restart receipts show health still starting; the final observation records both datastore services healthy. Restart-command elapsed time is not presented as measured user-visible downtime or a recovery-time guarantee.

No source service, account, runtime code, role or ACL was changed. No container was recreated, data volume removed or Redis data deliberately flushed. This was a **graceful destination process restart**, not a prolonged outage, power loss, host failure, cross-host failover, distinct-user collaboration or Redis ACL acceptance. Dedicated containers/private networks remain a separate deployment boundary; this observation does not turn Redis database indexes into authorization.

The result establishes that ordinary saved-work and live-update workflows resumed after these two local datastore restarts without restarting the native backend. It does not establish every pending database-role, cache-isolation, capacity, cloud or broader Issue #57 requirement. Raw backups, credentials, runtime configuration and customer payloads remain private. No local test suite or build was run for this record.
