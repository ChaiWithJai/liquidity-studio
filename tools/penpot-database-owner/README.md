# Native application database owner

This is a supported deployment configuration, with no Penpot patch or migration switch. The application login owns its dedicated database and restored application objects, so normal native startup migrations remain enabled. It has no superuser, database-creation, role-creation, replication or RLS-bypass attributes. This is database ownership, not DML-only access or per-brand authorization.

The existing bootstrap `penpot` role also owns system objects in the observed PostgreSQL cluster. Do not demote it, reassign its objects, or run `REASSIGN OWNED`. Keep that role and its credential operator-only. Keep the original application database intact for rollback. Backend receives a distinct login for a new database.

## Source basis and preparation

Pinned Penpot source is `ff7a66f51938b2293260ea27a64e2c4e0833b5e3`. `backend/src/app/main.clj:187–204` provides one normal pool to migrations; `migrations.clj:507–521` applies migrations; `util/migrations.clj:22–41` skips recorded steps and lines 55–64 check/create the migration ledger. The first migration installs trusted `uuid-ossp`; PostgreSQL 15 permits a database owner to install it. Later pinned migrations use ordinary owned-object DDL. No superuser-only migration operation was identified. Future upstream upgrades still require review.

Prepare files once, under an existing private operator directory:

```sh
python3 tools/penpot-database-owner/generate.py --output /absolute/private/application-db
```

The new directory is 0700; its files are exclusive 0600 writes. The generator makes a URI-safe password and a fixed new `penpot_app` role/database plan. It refuses an existing or partial directory and does not connect to PostgreSQL. The private SQL deliberately uses CREATE, never ALTER or DROP: an existing role/database is a conflict, not a reason to replace human data. If preparation or application partially fails, retain the files and inspect current state before deciding recovery. Do not blindly rerun or generate another password.

`application.env` is for backend only. `create-owner.sql` is for the existing operator only and includes the private password. Do not print it, enable shell tracing, log statement bodies, or put a password in argv. The managed template keeps the existing bootstrap username/password separate from backend environment. PostgreSQL initialization variables do not rotate an existing volume's credentials.

## Existing-instance cutover runbook

These steps require an exact owned-instance operational packet and later activation review. They have not been executed by this source change.

1. Record exact Compose files, container identities, backend argv/environment-file hashes, database version, ownership, migration ledger, native secret and matching asset backup. Retain private operator connection material outside backend. Verify operator recovery access before changing backend configuration. Preserve existing pool sizes and connection settings; do not add a parallel native backend. Allow space for the dump and second database plus the existing free-space reserve. The observed database was about 12.2 MB with 163 migration rows; remeasure before use.
2. Quiesce all native database writers, including the owned backend and exporter; keep the original frontend, database and asset volumes. Confirm no other writer or operator mutation is active. Retain existing service configuration for rollback. Do not delete volumes, flush caches, or modify source database roles.
3. Make a private custom-format dump of the existing application database using the operator: `pg_dump --format=custom --no-owner --no-acl --dbname=penpot`. Capture its actual bytes/hash, success, schema/migration identity and a private table-by-table row lineage manifest while writers stay stopped. Use existing private file/environment delivery for authentication, never password arguments. A new dump excludes cluster roles/system catalogs; retain existing operator recovery material separately.
4. Apply the generated private SQL through the existing operator connection to database `postgres`, with psql `-X -v ON_ERROR_STOP=1 -f /private/create-owner.sql`. This creates only the new application role and empty database. The login is explicitly NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOREPLICATION and NOBYPASSRLS, with no membership in the operator role.
5. Restore the retained dump using the operator with `pg_restore --dbname=penpot_app --role=penpot_app --no-owner --no-acl --exit-on-error /private/retained.dump`. Setting the role makes restored application objects belong to the new owner. It does not transfer bootstrap/system ownership. Preserve a failed partial target for inspection; never restore over the original database. Do not resume writers before verification.
6. Compare source and target table counts and logical row hashes, migration names/rows, object definitions and asset references before backend startup. Verify the new database owner, all application relation owners, role attributes and absence of inherited operator memberships. Extension-owned internal functions can remain owned by PostgreSQL's bootstrap superuser; do not reassign those. Verify the original database and system ownership are unchanged. Record the intentionally omitted owner/ACL metadata separately from preserved application rows.
7. Point the single existing backend at generated `application.env`, keeping the same assets/native secret and normal migration behavior. The optional overlay changes only its three database connection values. The managed template loads the application file and does not pass operator credentials to backend. Start the existing backend/exporter after verification, retaining current cache configuration and pool behavior. Confirm normal startup and migration completion before serving the existing browser journey.
8. After backend/exporter recreation, the stock frontend may retain old Docker upstream IPs. This occurred in the owned fixture. Once services are ready, `docker compose exec penpot-frontend nginx -s reload` refreshes addresses without recreating frontend. An existing browser error screen may require full reload. This is a bounded operational remedy, not a proxy redesign.
9. Through the ordinary browser, reopen the same saved design, make a reversible neutral edit, save and full reload, observe the existing live peer update, and export a PNG. Retain the actual result and restore the baseline. These actions are pending for this configuration, not proven by the hosted SQL check.

Rollback before any new writes: stop the owned backend/exporter and restore their retained original connection configuration, then restart and reload frontend upstreams as needed. Keep both databases and dumps. If the new database has accepted edits, first quiesce and back it up; simply switching to the older database would lose those newer edits. Reconcile or restore the newer application data through a reviewed owner-neutral path instead. No DROP DATABASE or volume removal is part of this runbook.

## Optional local overlay

Use `local-recovery.overlay.yaml` after the existing private Compose configuration, with `PENPOT_DATABASE_OWNER_DIRECTORY` pointing at the generated directory and its `application.env` supplied as a second private `--env-file`. The overlay replaces only backend URI, username and password. It does not change PostgreSQL initialization variables, role attributes, volumes, cache settings or connection-pool sizing. Inspect resolved output privately; do not publish environment/config dumps.

## Hosted evidence boundary

The existing Docker job uses a disposable pinned PostgreSQL 15 container. It exercises private exclusive preparation, owner-neutral dump/restore, unchanged source rows/owner, application ownership, absence of cluster privileges and role memberships, authenticated application writes, rejected role/database creation, and representative pinned startup DDL including trusted UUID extension and a trigger. It is not a full native startup or browser acceptance claim. No local functional tests, builds or live database changes are performed by preparing this source.
