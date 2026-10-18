# Recovery controls remain available for an installing brand

Issue [157](https://github.com/ChaiWithJai/liquidity-studio/issues/157), within portable recovery issue 57.

## Failure and boundary

An interrupted installation reserves the target repository. Bootstrap correctly returns 423. The previous App placed its generic scope-load error before every tab and disposed the workspace client; the ordinary Operations recovery panel required that client and a capability from the failed bootstrap. The independent founder-authorized status route could return 200/installing/canRollback while the actual UI offered no recovery action for the selected target. This is an availability defect, not evidence of unauthorized data access.

The fix does not change authentication, API routes, repository locks, storage or rollback semantics. After a bootstrap 423 only a signed-in founder attempts the existing status request. A recovery-only shell appears only for a response matching the selected organization/brand, with status installing or rolling-back and canRollback true. The route still enforces current founder membership and enabled native/portable flags. Other errors, denied/disabled status endpoints and unrelated 423 responses keep the ordinary error state.

## UI and lifecycle

The shell mounts OperatorRecoveryPanel in recovery-only mode. It exposes status refresh and the existing interrupted-destination rollback action, plus retrying workspace load. Export, upload, destination creation, installation and retained-pack retry controls are absent. Operations navigation does not fetch the ordinary admin overview while this shell is active. General story, asset and editor access remains locked.

Shell identity captures actor, session epoch, scope epoch and organization/brand. Scope changes and logout clear it; existing scoped request guards reject late results. Svelte's [key block](https://svelte.dev/docs/svelte/key) destroys the previous panel when captured identity changes, and its existing [onDestroy lifecycle](https://svelte.dev/docs/svelte/lifecycle-hooks#onDestroy) guard prevents stale completion writes. A successful rollback reloads the ordinary workspace through bootstrap rather than granting client-side data access. If another process completes recovery, Refresh status can show the recorded result and Retry workspace performs the ordinary load.

## Verification

Hosted browser regressions extend tests/operator-recovery.spec.js with real HTTP authorization/repository gates: selected locked target and reload, restricted controls, UI rollback, no admin overview fetch, delayed status after brand switch/logout, unrelated 423 and marketer denial. Controlled fixture journals are labeled as such; they are not reconstructed original crash snapshots.

Local acceptance is BrowserOS Neo only under the user's memory constraint. No local Node/Playwright test runner or new test-browser process is authorized. One ordinary original-only build uses existing locked dependencies:

```sh
node scripts/build-dist.js
```

Run from liquidity-studio with Node 22. The canonical build retains the default native bundle exclusion. Exact-head hosted checks and independent source review precede a separately authorized owned Neo interruption/rollback journey. Existing production data and the prior two-instance evidence remain untouched. No runtime rollout follows merely from this source change.
