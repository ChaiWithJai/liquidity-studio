# Optional private native access constructor

Original source patch for Penpot `ff7a66f51938b2293260ea27a64e2c4e0833b5e3`.
No native build, tests, or runtime activation has been performed locally.

Copy `configuration.clj` to `backend/src/app/studio/configuration.clj` and
`configuration_test.clj` to `backend/test/app/studio/configuration_test.clj`.
Install the C2 access and HTTP authority namespaces and C3 live-fence patch,
then apply `main.patch` to the pinned source. GEN owns the separate RPC permission patch.
The hosted backend check can include `clojure -M:dev:test --focus app.studio.configuration-test`.
Compilation and actual integration remain to be verified by that hosted path.

Unset `STUDIO_NATIVE_ACCESS_CONFIG` leaves the existing constructor graph unchanged.
When set, it must name an absolute, owner-only regular file (0400 or 0600, no symlink,
maximum 16 KiB), owned by the native process user. Its exact JSON schema is:

```json
{"schemaVersion":1,"governedTeams":[{"teamId":"11111111-1111-1111-1111-111111111111","operatorProfileId":"22222222-2222-2222-2222-222222222222"}],"grantKey":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","callbackOrigin":"http://host.docker.internal:39044"}
```

These are non-secret examples; generate a real private key separately. Duplicate team
entries and unknown fields fail closed. The server derives UUID governed-team and
team-to-operator maps, supplied to actual RPC methods, WS routes and asset routes together with the
HTTP admission callback. RPC methods also receive the private reconciliation key and
callback. All three receive the shared live/context and live/session-current? functions.
RPC status reports constructor hook versions v1. Asset status is v1 only when both
loaded module and actual HTTP handler patch carry their fixed code markers and the
byte-delivery function is present; otherwise false. Neither marker comes from JSON.
This is not a runtime fence measurement. Existing native HTTP client and session-manager references are preserved.
The fixed callback is not browser configuration. No personal-team classification is
fetched from Studio, no paired editing is enabled by this patch alone, and no generic
RPC or asset relay is introduced. The C2 metadata-only operator exception remains
limited by its separate native resource/ACL hooks.

The normal native start and resume paths install the configuration before Integrant
expansion. Custom systems are intentionally outside this patch. A private file must
be consistently mounted for restart; malformed configured input aborts startup.

Asset integration depends on the reviewed private-asset module and handler patch, including their fixed `hook-version` and `studio-access-version` markers. Apply that exact patch before loading this constructor; the hosted configuration test checks both markers independently.
