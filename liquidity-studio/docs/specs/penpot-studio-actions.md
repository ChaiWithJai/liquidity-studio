# Private Studio-to-Penpot actions

Issue #54 integration follow-up to PR #113. The feature is off by default and unavailable on Cloud Run. Existing production Google identity, current organization/brand membership and the registered #52 target remain authority. Penpot and Studio principals are separate identities joined only by the operator's private mapping.

## API and current-state checks

All endpoints use the existing authenticated scoped Studio request helper. No endpoint accepts a native URL, cookie, owner identity, palette or caller-provided verification result.

- `GET/POST /api/studio/penpot/bindings`: read configured targets/current registered context, or founder-only registration of one configured target ID. A marketer may use an existing registration but cannot create a new owner mapping.
- `GET/POST /api/studio/penpot/actions`: read the creator's recent 100 records, or prepare a revision-bound command with a stable idempotency key.
- `GET /api/studio/penpot/actions/:id`: read an authorized durable record after rejoin.
- `POST /api/studio/penpot/actions/:id/reconcile`, empty body: independently compare current native state without reapplying an action.

The command is `refresh-brand-tokens` with story ID/revision, generation ID, current brand revision and expected native revision. Approved source and manifest checks use the existing compiler and transport. The immutable execution mapping includes file ID, binding epoch and a canonical manifest digest. Reconciliation after restart rejects a changed manifest, even when source IDs happen to match.

The one-use action code lives only in memory and the transient panel field. It expires within one minute, is not in browser storage, and is cleared when the keyed story/scope component is destroyed. Current managed Google account lookup and membership checks run again for claim, verification and reconciliation. There is no persisted Google token or native cookie in the ledger.

## Durability and unknown outcomes

`penpot-action-security:<organization>:<brand>` is separate from portable scoped story data. It retains the actor principal ID, command/revisions, request fingerprint, immutable native mapping and observed verification snapshot. Full local database backup retains this history; story ejection/import does not confer authority or import these records. History is bounded at 1,000 records per scope and fails explicitly rather than silently evicting uncertain actions.

An intent is persisted before exposing a native action code. Verification is persisted before consuming its ephemeral grant. Losing the acknowledgement response can therefore recover the same action record after restart. Losing the process after native application but before acknowledgement requires read-only reconciliation; the old capability remains unusable. A matching later native state establishes an observed state, not attribution or exactly-once action execution.

The panel retries a lost preparation response with the identical request key and body. It never blindly reapplies the native action. Its history explicitly distinguishes acknowledgement from read-only recovery. `native-state-verified` is an immutable observed native version; it is not current editorial approval, publication, exact pixel fidelity or general font/media portability. Those remain separate acceptance facts.

## Local Node and Docker Desktop

The operator supplies an absolute, private mode-0600 regular JSON file through `STUDIO_PENPOT_OPERATOR_CONFIG`. Configuration version 1 contains registered targets, private native owner sessions and verified manifests. It is never accepted through the browser or stored in a portable repository payload. No symlink, oversized file or arbitrary endpoint is accepted.

`transportMode` has exactly two supported values:

| Mode                 | Server RPC base                                      | Plugin listener                                            |
| -------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| `loopback` (default) | `http://localhost:39008/api/rpc/command/`            | `127.0.0.1:39019`                                          |
| `docker-host`        | `http://host.docker.internal:39008/api/rpc/command/` | Container `0.0.0.0:39019`, published only on host loopback |

Browser native/editor origins remain `http://localhost:39008` and `http://localhost:39019` in both modes. The same pinned native owner/project/file, redirect rejection, response bounds and token/paint checks apply. `K_SERVICE` fails closed regardless of the selected mode.

`server/run-penpot-local.js` launches an owned private Google Studio on port 39021. The normal `server/index.js` executable starts the optional plugin listener only when the explicit feature flag is true. Default startup remains unchanged. The Docker runtime copies only the own plugin directory; no private configuration enters the image.

`compose.penpot-local.yaml` is an explicit overlay with a read-only private configuration mount and `127.0.0.1:39019:39019` publication. It requires `STUDIO_PENPOT_CONFIG_HOST`; the file must remain private and readable by the runtime user. Do not broaden permissions to bypass a failed startup. Combine with the maintained Google/ADC configuration only after candidate acceptance. This work does not itself modify the maintained container or cloud service.

## Evidence boundary and rollback

The new deterministic HTTP test uses the real GoogleIdentityService, registered boundary, scoped repository and SQLite reopen with constructor-only Google/native test adapters. It proves durable protocol and rejection behavior, not a live Google sign-in or native browser action. Component Chromium tests exercise the actual panel against original HTTP fixtures, including a committed reply aborted before browser delivery and a delayed old-scope response. PR #113's separate real native browser/token/font/export evidence remains applicable to its optional modules.

At this source checkpoint, private Node readiness and an actual managed Google lookup succeeded. A fresh-port normal Google popup did not complete. Real Google-authenticated full UI/native acceptance and Docker Desktop execution must be recorded separately before claiming them. No custom token, allowlist expansion or production password fallback is permitted.

Rollback disables the feature flag and removes only this opt-in overlay/listener. Original story drafts, native human edits and recorded verification snapshots are retained; disabling the feature does not revoke or undo a native edit already applied. Existing exporter/approval/scheduling paths are separate. Issue #54 remains open until its complete accepted pipeline is demonstrated.
