# Pinned native live-subscription hook (C3)

Source-only candidate for Penpot 2.18.3 `ff7a66f51938b2293260ea27a64e2c4e0833b5e3`.
No native runtime was changed, built or tested locally. Editing remains disabled.
This is not measured five-second revocation acceptance.

Apply `websocket.patch` to that exact upstream checkout. Copy `live.clj` to
`backend/src/app/studio/live.clj` and `live_test.clj` to
`backend/test/app/studio/live_test.clj`. The patch retains the upstream MPL notice.
The original module depends on the separately reviewed C2 `app.studio.access`
exports `file-team`, `governed-team?`, and `authorize-resource`.

The constructor supplies the exact local `::app.studio.access/governed-teams`
registry, current-authority callback and real `::app.http.session/manager`.
No configuration means the existing native path remains unchanged. The local
registry classifies personal teams without depending on Studio availability.
For governed resources, the callback is fail-closed and must use interruptible
I/O with a maximum one-second deadline. An outer one-second check also cancels
and denies a stalled callback. This is not a new public callback endpoint or a
caller-selected authority URL.

The middleware-authenticated `::session/session` record is captured and freshly
read through the native session manager. The verified middleware token issue time
and optional Instant-valued `exp` are retained separately. Pinned auth tokens
are JWE/Transit claims, not assumed numeric JWT timestamps. The hook enforces
the original token/cookie age and any explicit `exp`, plus the configured
`auth-token-cookie-max-age` against the current row's modified/created time. A
renewed database row cannot extend the old socket token. No session-GC delay
is treated as continuing authority. The browser's WS `session-id` remains
only the upstream collaboration correlation ID. It never proves authentication.
No native cookie/token is copied into a WebSocket message or portable record.

The wrapper admits each file/team subscription and exact-file pointer update.
File ownership is resolved through the C2 database helper, and moved/deleted
files cannot keep their old team authority. Existing native ACL checks still run.
Subscription channels attach an internal server-owned resource tag. Client tags
are discarded, queued output is checked immediately before sending, and the tag
is stripped before encoding. A revoked subscription is removed and purged without
erasing a document, editing buffer, unrelated subscription or personal workspace.

A persistent one-second IO-loop check also runs while idle and cannot be reset
by continuous incoming/outgoing traffic. Its timer is separate from the existing
heartbeat timer. A current-session, grant, epoch or expiry denial fences the
corresponding governed subscription. The source has bounded authority calls;
actual scheduling, native I/O stalls and the five-second result still require the
approved running measurement with a client ignoring UI notifications.

## Hosted path and remaining integration

The existing `penpot-font-ui-candidate.yml` builds the native frontend only and
cannot validate this backend hook. The smallest proposed hosted path is the same
pinned upstream checkout and official devenv image, apply the C2/C3 source, then
run the pinned backend's existing `clojure -M:dev:test --focus app.studio.live-test`
entry point. `backend/deps.edn` already defines the dev/test aliases and Kaocha;
`backend/tests.edn` includes `test` and `src`. No new runtime dependency is needed.
This command is a source-verified proposal, not an executed result. The integration
owner must review the actual image/toolchain and any upstream build prerequisites
before dispatching it. Studio's Node checks cannot prove Clojure compilation.

The focused hosted test source exercises authenticated-session deletion, current
revocation/expiry denial, queued-output suppression, unaffected personal work,
file moves, exact pointer binding, stripped caller tags and a stalled callback.
These controlled authority callbacks are not actual native revocation timing.
After compilation and independent source review, use one owned native runtime to
measure durable revoke to subscription fence, new-operation denial, natural
expiry, unaffected work and reconnect. Preserve the source/runtime backup and
leave editing off if the bound or the native contract fails.

Live subscription ownership requires C2 `access/current-file-team`, which excludes both deleted file and deleted project rows. RPC `access/file-team` intentionally retains deleted-record classification for native ACL semantics. The focused SQL contract test is a bounded database double, not an actual database integration result.

## Rejoin after a fenced live subscription (#261)

Actual distinct-profile native editing exposed a stale-open failure: a periodic denial purged the file subscription but left the socket open. The native frontend resubscribes only after its existing WebSocket reconnect event. Both profiles could still read/save the durable file; a peer reload saw the change. The original denial's precise cause is unproved: older transport layers collapsed authority rejection, timeout and malformed responses into false.

The hook now preserves finite failure categories through authority admission and logs one credential-free reason per fenced socket. No IDs, callback response, exception, key or session is logged. Fencing marks the socket first, purges the affected subscription, then closes once with 4003. Queued output and new work on that old socket remain denied. The unchanged native frontend reconnects and must obtain fresh server authorization before subscribing. An unavailable authority or check timeout during a fresh subscription closes that socket for the same existing reconnect path, including an outage lasting through repeated reconnects. An explicit authority denial or invalid native session stays refused without another close loop; no permission is restored by reconnecting. Unsaved editor state is not modified.

Hosted test source covers transient refusal, fresh authorized subscription, continuing revocation, queued late frames, one close/log per socket and finite HTTP failure classification. Existing deadlines, scope/session checks and native/frontend inputs are unchanged. This is not actual runtime live-edit/revocation acceptance; that remains a separate ordinary Neo journey after reviewed hosted native verification and artifact activation. Use the existing manual `penpot-native-hook-verification.yml` and existing reviewed backend artifact delivery workflow; do not build locally or dispatch duplicate jobs.
