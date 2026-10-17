# Local Docker operation

The current delivery branch runs the canonical Svelte application with authenticated founder/marketer accounts and a persistent SQLite volume. Local container acceptance has passed; remote CI and independent review remain merge gates. The original imported prototype had a different generated UI and process-local data. Those limitations describe the baseline, not this implementation.

Prerequisites: a responding Docker Desktop Linux engine, Compose v2, and Node 22 for setup and acceptance scripts. `docker version` must return server details before building.

From the repository root:

```sh
node scripts/setup-local.mjs
docker compose --env-file .env up --build --detach --wait
```

Setup creates independent random founder and marketer passwords in a private, ignored `.env` file. It preserves an existing file instead of overwriting credentials. Read that file locally to sign in; never paste its contents into issues, logs or chat. If an existing file lacks the account variables, configure them before starting. Username/password bootstrap values are used to create missing accounts; changing an environment password does not silently rotate a persisted account. Use the account rotation endpoint described in backend-operations.md.

An alternative private file can live outside the checkout:

```sh
STUDIO_ENV_FILE=/private/path/studio.env node scripts/setup-local.mjs
docker compose --env-file /private/path/studio.env up --build --detach --wait
```

`STUDIO_ENV_FILE` selects the setup script's destination. Pass the same file explicitly to Compose; Compose does not infer that variable as its own env-file option. The destination directory must already exist and be private. Setup does not print passwords.

Open http://127.0.0.1:3001. The port binds only to loopback and leaves the existing port-3000 process intact. `STUDIO_LOCAL_PORT` selects another unused port. The default local mode explicitly allows synthetic source-excerpt generation; users must supply, classify and approve source claims before generating. Clinical review remains a separate recorded act. Synthetic success is not provider connectivity or factual verification.

## Build and state

The Dockerfile pins its multi-platform Node 22 base by digest, runs `npm ci` against the committed lockfile, builds the real Svelte/Vite UI, and prunes development packages from the runtime. Runtime dependencies include Sharp for PNG rendering and Google SDKs for the configured cloud adapter. The image contains fallback fonts, runs as the non-root `node` user, drops capabilities and uses a read-only filesystem except `/tmp` and `/data`.

The named `studio-data` volume mounts at `/data`; `STUDIO_DATABASE_PATH=/data/studio.sqlite` persists accounts, sessions, profiles, source reviews, drafts/edits, calendar, jobs, usage, telemetry, preflight evidence and local artifact bytes. Normal stop/recreate preserves this volume. `docker compose down --volumes` deletes it and is not a normal shutdown command. The build context excludes credentials, local databases, dependency folders, tests and repository metadata.

```sh
# Normal operator logs and stop; keep the data volume.
docker compose --env-file .env logs --follow studio
docker compose --env-file .env down --timeout 15
# Isolated acceptance project with disposable credentials and its own volume.
bash scripts/docker-smoke.sh
```

The acceptance script creates a separate Compose project, generates temporary credentials, uses an alternate loopback port, then cleans up only its own container/network/volume. It exercises real sign-in and role restrictions, scoped generation/edit/calendar behavior, an actual PNG download, cross-brand denial, non-root identity, graceful shutdown and retained records/downloads after container recreation. The main local instance and its volume are separate.

Python 3.12 is a CI/test-host requirement for structural QA, not an application runtime dependency. The browser CI job runs actual Chromium against the compiled UI and authenticated APIs. The Firestore emulator job uses Java 21 and real Google SDK transactions without provisioning cloud resources.

## Health, recovery and rollout

`/healthz` checks the serving process. `/readyz` bounds repository readiness; cloud mode additionally checks the artifact bucket. Neither endpoint certifies provider connectivity or publication. A process that cannot access its data is not ready even if liveness responds.

Local acceptance passed on Docker Desktop 4.39.0 / Engine 28.0.1, Linux ARM64. The initial Docker engine hang was resolved only after the user authorized a Desktop restart. No reset or prune was used. Hosted checks must be evaluated on the final integrated commit; the earlier prototype image's green smoke does not validate the current authenticated/persistent image.

Before rollback, take a consistent SQLite backup and preserve the current data directory. Stop only this Compose project, rebuild the intended prior application revision, and retain the volume unless performing a reviewed restore. A pre-persistence prototype revision cannot operate the new authenticated data contract and is not a safe substitute for restoring a compatible release. Database startup rejects newer schema versions. The backup/restore CLI validates snapshots, refuses overwrite and revokes recovered sessions; full commands and account recovery are in backend-operations.md.

Local success is not a deployed GCP pilot. Cloud project resources, IAM, secrets, Firestore/GCS access, scheduling, budget settings and rollback require their own recorded deployment evidence. This setup does not activate billing or grant a software license.
