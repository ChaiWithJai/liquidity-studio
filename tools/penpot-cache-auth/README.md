# Private native cache authentication

This configuration is for one dedicated Penpot deployment. Backend and exporter share the named `studio_runtime` user; the default user is disabled. The separate `studio_health` user can only PING. Runtime access retains all commands, keys and channels required by the existing application. This is not per-brand authorization or a least-privilege claim.

Activation requires the reviewed Redis logging patches in both backend and exporter artifacts. The source recipe alone does not change a running deployment. No credentials or runtime have been activated by this change.

## Prepare once

From the repository root, choose a new directory under an existing private operator directory:

```sh
python3 tools/penpot-cache-auth/generate.py --output /absolute/private/cache-auth
```

The generator creates a 0700 directory and exclusive 0600 files. `users.acl` contains SHA-256 password hashes, `client.env` contains the private named-user URI, and `health.password` contains the separate health credential. The manifest records file hashes without passwords. Existing or partial directories are refused; startup never generates or rotates credentials. Do not print resolved Compose configuration, environment files, or container environment inspections.

Set `PENPOT_CACHE_AUTH_DIRECTORY` to that directory and `PENPOT_CACHE_AUTH_TOOLS` to the absolute path of this reviewed tool directory. The managed template loads `client.env` into backend and exporter. Its cache wrapper verifies the pinned official entrypoint, copies the two host files into private tmpfs, and gives the copies to Valkey. Host ownership and 0600 permissions remain unchanged. The official entrypoint drops the server to its existing Valkey account. The outer `tini` process remains in use.

The pinned image and inspected entrypoint hash are recorded in `source-basis.json`. A different entrypoint fails closed and requires source review. The health command reads its password file into `REDISCLI_AUTH`; no password enters its argv. Readiness requires an actual authenticated PONG.

## Optional existing recovery fixture overlay

Keep the existing fixture Compose file and its private environment file. Supply the generated client file as a second Compose interpolation file so the overlay replaces existing inline backend/exporter URIs:

```sh
docker compose --env-file /absolute/private/existing.env \
  --env-file /absolute/private/cache-auth/client.env \
  -f /absolute/private/existing-compose.json \
  -f tools/penpot-cache-auth/local-recovery.overlay.yaml config
```

Inspect that output privately only. This is a review command, not an instruction to activate. The overlay retains the existing network, service identity, database, volumes and cache memory/eviction settings. It introduces no host port. Preserve all original configuration before any separately reviewed activation.

## Readiness and recovery

The existing hosted Docker check runs an isolated disposable cache: authenticated runtime SET/GET, anonymous and wrong-password rejection, health PING with GET denied, and restart with the same credential files. It also checks host modes/hashes and credential-free server logs. No customer fixture is used. Local customer acceptance remains the ordinary browser save/reload and live rejoin journey after activation.

Retain the same private credential directory across restarts and include it in the existing encrypted private recovery material. Never commit it or regenerate it during restore. Rollback changes the cache and both clients together to their retained prior configuration; it does not flush cache data, change database volumes, or alter Studio identities. Keep failed candidate receipts and private files for diagnosis.
