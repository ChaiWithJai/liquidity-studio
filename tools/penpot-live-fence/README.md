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
read through the native session manager. The browser's WS `session-id` remains
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
