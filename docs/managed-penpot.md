# Managed Penpot Create and Open

This opt-in composition uses normal Google authentication and current Studio memberships, pairing and brand-access records. It does not expose the password developer launcher, seed users, provision teams, activate grants or ship the private Doory frame/model.

Set `STUDIO_PENPOT_MANAGED_CONFIG` to an absolute private regular JSON file (0400 or 0600). When absent, startup and the existing pilot remain unchanged. The file has exactly:

```
{
  "schemaVersion": 1,
  "nativeInstanceId": "<registered native instance UUID>",
  "nativeOrigin": "https://design.example.com",
  "rpcOrigin": "http://penpot-frontend:8080",
  "studioOrigin": "https://studio.example.com",
  "pairingKey": "<43-character private base64url key>",
  "grantKey": "<different 43-character private base64url key>",
  "workspace": {
    "version": 2,
    "transportMode": "loopback",
    "sessions": [],
    "workspaces": []
  }
}
```

The workspace section uses the existing strict version-2 server-owned workspace schema: finite native owner sessions, Studio organization/brand IDs, distinct team/project IDs and verified OFL font IDs/hashes. Empty arrays above are placeholders, not a usable config. `transportMode` is retained for schema compatibility; managed requests use the explicit `rpcOrigin`. Neither origin nor workspace authority comes from browser input. Public native and Studio origins must be exact HTTPS origins; internal RPC may be HTTP on the private container network. Redirects are refused. Keep this file out of images, Git and browser responses.

The normal `server/index.js` entry composes the managed provider after Google/platform readiness. Existing scoped GET/POST `/api/studio/penpot/designs`, pairing and native admission/reconciliation callbacks are used. The bootstrap advertises the story capability. Create/reopen uses the same durable file intent and current paired human, and returns an addressable HTTPS native workspace URL. Native files remain under the immutable administrative workspace; acting humans retain their own paired profiles. No policy or grant is automatically acknowledged.

Run `node scripts/serve-managed-native-connect.mjs --config /run/studio/managed-native.json` on the private native network. Supply `STUDIO_NATIVE_GATEWAY_KEY` as the separate 64-hex gateway credential. The adapter listens on 39044 inside that network, not directly on a public port. The committed `tools/penpot-native-connect/managed-server.conf.example` mounts only `/studio-connect` and `/studio-connect/prove` using the existing first-party gateway snippet, using the actual browser Origin (checked against the exact configured public native origin). It must overwrite the private gateway/session/origin headers, forward the actual native cookie only to this adapter, and disable access logs/cache/referrers for challenge URLs. The adapter reads the actual native profile through the fixed internal RPC origin, and forwards only proof metadata to the fixed HTTPS Studio callback. Native Clojure access callbacks may target this private adapter's two fixed access paths using the existing grant key; it forwards to the configured Studio HTTPS origin. Do not expose a general RPC proxy.

Deployment still needs an actual HTTPS native gateway, private internal RPC routing, existing verified native workspace/font configuration, operator session secret delivery, Google allowed-origin configuration, and the approved native hook artifact/config. This change does not provision them or claim a deployed/signed-in cloud walkthrough. The native gateway's existing same-origin cookie/CSRF configuration must use the public native origin. Local loopback defaults remain unchanged.

This first managed slice intentionally does not advertise local-only color-plugin hosting or Save SVG. Those require managed delivery origins for their separate local transports; the Create/Open capability is independent. Native SVG's upstream embed limitation is unchanged. Private Doory editor distribution remains outside this composition.

Hosted checks cover distinct RPC/browser origins, HTTPS and exact-origin rejection, current local defaults, managed identity rejection and server-generated native links. Actual managed browser acceptance follows deployment: Google Studio → existing story → connect own native profile → Create/Open → edit/save/reopen the same file. No new account or RBAC acceptance matrix is introduced.

The native private hook configuration now also accepts the single fixed Compose callback alias `http://studio-native-connect:39044`; the historical `host.docker.internal` default remains accepted. Both bootstrap and HTTP authority require that finite set. This native source delta must be included in the next hosted, verified native artifact before managed activation. It is not active in the existing runtime.
