# Local Docker demonstration

Prerequisites: Docker Desktop with a responding Linux engine, Compose v2, and Node 22 on the host for the smoke script. `docker version` must return both client and server details before starting.

From the repository root:

```sh
cp .env.example .env
docker compose up --build --detach --wait
```

Open http://127.0.0.1:3001. This binds only the local interface and leaves the existing port-3000 service alone. Set `STUDIO_LOCAL_PORT` in `.env` if 3001 is occupied; a port conflict fails rather than replacing another process. The configured generation mode is explicitly synthetic for demonstration and must not be used to verify provider health. Neither this container nor its health check proves GCP connectivity.

```sh
# Isolated build + HTTP/provider-mode + non-root + clean termination checks
bash scripts/docker-smoke.sh
# Logs and shutdown for the normal local instance
docker compose logs --follow studio
docker compose down --timeout 15
```

The smoke script uses a separate Compose project and removes only that project's container/network. It requires its selected local port to be free. It checks the real built image's page, liveness/readiness, bootstrap, synthetic generation provenance, non-root UID, and graceful exit status. GitHub Actions runs the same script on a Docker-enabled runner. The regular contract/QA jobs keep Python 3.12 on the test host; Python and test dependencies are intentionally absent from the application image.

The image pins the multi-platform Node 22 base by registry digest, generates the served UI from `scripts/build-dist.js`, and runs the API as the `node` user. Neither build nor runtime imports third-party packages, so the image performs no dependency install. The optional Svelte development toolchain has `package-lock.json` for `npm ci`; it is not the served application build. Build context uses an allowlist to exclude `.env`, credentials, source repositories, dependency folders, tests, and local artifacts. No keys are copied or injected. Changing provider mode/credentials is separate configuration work after access protection is ready.

The container filesystem is read-only except ephemeral `/tmp`; all current application and telemetry state is in process memory and is lost on stop/recreate. There is no durable volume or recovery guarantee. Health checks verify repository reads only. No tenant/authentication/billing features or cloud resources are introduced by this setup. Do not expose this container publicly before the access and persistence issues are resolved.

## Verification and rollback

Local verification passed on Docker Desktop 4.39.0, Engine 28.0.1, Linux ARM64. The actual image build and smoke script passed: page/liveness/readiness, bootstrap, synthetic generation provenance, non-root identity, and graceful termination with exit 0. Hosted CI also passed the same smoke script on Linux AMD64, along with all existing contract gates.

The local engine initially timed out on version and direct socket probes. After explicit user authorization to restart Docker Desktop, the official restart command failed its stop deadline. Quitting/relaunching the app required terminating its hung backend, after which the engine recovered. No reset, prune, image deletion, or unrelated container configuration changes were performed. The existing Node process on port 3000 remained intact.

To roll back a running demonstration, stop this Compose project and rebuild the earlier Git revision. There is no data migration; restarting either revision discards current memory state. Do not reset Docker Desktop as part of application rollback. GCP deployment and persistent storage recovery are subsequent work in sprint #19.
