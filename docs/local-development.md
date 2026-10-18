# Local developer profiles

Run the existing Studio application without a Google sign-in or cloud credentials:

```sh
cd liquidity-studio
npm run dev:studio
```

Open the printed `http://127.0.0.1:3002/__dev` address and choose a persona. A fresh profile grants Founder both default brands and Marketer Chai With Jai only. Later founder changes to users, brands, organizations, and grants remain authoritative and survive restart. The picker creates an ordinary existing password session; application and backend membership checks still apply. Passwords and session values are never displayed. This entrypoint requires the project's existing Node 22 and installed development dependencies. It does not install dependencies or build a distribution. The API and Vite share one child with a 384 MiB V8 old-space limit. This is not an RSS or browser memory cap. The launcher starts no media renderer or inference process.

`npm run dev` uses this same full-stack launcher. The previous UI-only Vite command is available as `npm run dev:ui` when a separate API is intentionally provided.

Select another isolated profile from the CLI:

```sh
npm run dev:studio -- --profile staging --port 3003
npm run dev:studio -- --profile production --port 3004
npm run dev:studio -- --check
```

**Every profile is local emulation**, including the labels `staging` and `production`. All run with `NODE_ENV=development`, source served by Vite, and SQLite. None selects the deployed staging/production service, Firestore, Cloud Tasks, Google authentication, or maintained local database. The page banner identifies the local profile and links back to the persona picker. Stop the launcher before switching its CLI profile. `--check` prints nonsecret configuration bounds without opening SQLite, starting Vite, or listening on a port.

Each profile owns `~/.config/liquidity-studio/development/<profile>/`, with private directory permissions, a marked SQLite database, a private profile configuration containing generated random persona passwords, and a separate Vite cache. IdentityService stores its normal salted password hashes and hashed opaque session records in that database. Marked profile data persists across launches, including organizations, brands, users, and grant changes legitimately made through the existing services. Startup never reapplies the initial memberships. Unmarked databases, symlinks, missing or altered fixed chooser personas, deployment markers, `NODE_ENV=production`, and arbitrary database paths are rejected. The launcher accepts no database or cloud-target option. It does not erase or repair existing data to make startup succeed.

Cookies use the fixed profile name `studio_dev_<profile>`. The developer wrapper maps only that cookie into the existing backend's `studio_session` name and maps backend session cookies back outward. Real maintained `studio_session` cookies and other local profiles are ignored. Thus separate profiles on different ports do not replace the maintained application's session. Switching persona revokes the current profile session and creates a new ordinary session. Normal application logout still revokes that session; reload `/` returns to the developer picker. Use the exact printed `127.0.0.1` origin, rather than `localhost`, a LAN address, or a forwarded hostname.

The child process receives a small operating-system environment allowlist. Google/ADC, provider API keys, remote storage/dispatcher settings, and operator configurations are not inherited. Generation uses the existing gateway's **offline-synthetic** fallback with `AI_ALLOW_SYNTHETIC=true`; its existing approved-source requirements and provenance remain in force. No human review or publication approval is invented. Remote model/provider `fetch` calls are denied in this developer process. Public source preparation is enabled through the existing HTTPS host, DNS-pinning, byte, status, and deadline guards. It does not use a paid model provider. This is an application boundary, not an operating-system network firewall.

Source jobs, source preparation, and typed helper controls are enabled. The existing durable local worker runs sequentially in the API/Vite process, with no separate service or new queue architecture. Preexisting queued work is paused on restart by the existing worker contract until explicitly resumed. Shutdown aborts and waits for that worker before closing SQLite; a10-second drain failure stops the child with an error and preserves its profile for recovery. Penpot, native editing, portable recovery, and cutout remain disabled. These profiles emulate the local role/session/data workflow, not full deployed feature parity or licensed native media distribution. No model, held upstream frame, or new service is downloaded or started. Vite HMR uses the same guarded loopback HTTP server and its cache remains profile-specific.

Stop with Ctrl+C. The launcher drains its local worker, then closes its Vite server and SQLite connection and removes only its own PID lock. A crash can leave `launcher.lock`: verify the recorded PID is no longer the owned launcher before manually removing **that lock only**. Never delete or replace the database to clear a lock. If startup left a marker but no database, preserve the directory for inspection; the launcher reports a marker mismatch rather than silently initializing over it. Bind failures and missing dependencies are reported without installing or changing a maintained service.

The loopback wrapper rejects foreign Host/Origin values and forwarded headers before the backend or Vite handler. Persona selection requires a same-origin bounded form with exactly one of the two fixed persona names. This developer-only picker is not a production authentication mode or a remotely deployable login bypass. Do not expose it through a tunnel or reverse proxy.


### Optional local Penpot Create/Open

To connect the developer profile to an existing local Penpot workspace, explicitly
pass a private operator configuration file:

```sh
npm run dev -- --profile development --port 3002 --penpot-config /absolute/private/operator.json
```

The file uses the existing pinned Penpot operator configuration schema, must be
private, and must select the fixed loopback service at `localhost:39008`. Its
per-brand workspace, native owner session and verified team-local fonts are server
configuration. They are never chosen by the browser. A current local founder can
create and reopen a design from saved, reviewed campaign copy. Marketers cannot
create designs through this developer adapter. Ordinary native project edit ACLs
still apply to creation.

This enables only Create/Open. It does not enable the full Penpot token, media,
callback or export integration, change production Google authentication, or prove
Studio-to-native human identity pairing. The developer profile and native owner
are separate identities. With no `--penpot-config`, the existing launcher behavior
is unchanged. Restart with the same profile and private configuration to recover
pending creation or reopen its existing saved native design.
