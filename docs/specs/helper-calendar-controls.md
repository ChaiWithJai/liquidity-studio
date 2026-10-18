# Calendar proposals in shared control

This extends the default-off shared-control capability from PR89. It does not enable a deployed service or identify a model agent. The proposal operator is a current authenticated brand member; the server remains the authority for identity, membership, ownership and grant limits.

The owner can grant category changes, calendar plans, or both for the current story for ten minutes. Calendar permission permits dated placement/movement and removal, subject to exact owner approval of each proposal. Existing epoch, expiry, current-membership, attempt-limit and source restrictions remain in force.

The helper chooses a whole campaign or one of the four format plans, an explicit local date and IANA timezone, then selects **Load calendar observation**. The pane reads the saved story and relevant source/destination day buckets. It captures story, assignment and order revisions. Settings must match that observation, and adopting a newer canonical story revision invalidates it. Submission uses the captured observation; it does not silently fetch a newer base to defeat a concurrency check. A stale proposal requires explicit observation and review again.

Placement appends to the destination day. Existing placement moves preserve unit identity. Removal names the existing assignment and its source order revision. A format plan does not assert that an artifact exists, and a dated assignment does not publish content. The server stores an exact before/after preview and retains explicit approval, application receipts, same-key recovery and compensating undo.

An owner can pause or take over while an approved apply request is pending. Changing the grant epoch before dispatch rejects the older apply without changing the story or calendar. Resume requires a fresh proposal and approval. Takeover is terminal for that grant. Work already accepted before a transition is not retroactively undone.

The pane does not select a story, navigate or focus an editor. Known receipts notify the existing canonical workspace client. Dirty human buffers retain their original optimistic base and focus; newer saved revisions produce a conflict rather than overwriting local wording.

## Verification

From `liquidity-studio`, using the supported Node22 runtime:

```sh
npm run build
NODE_ENV=test node node_modules/@playwright/test/cli.js test tests/helper-calendar.spec.js tests/helper-control.spec.js tests/helper-app.spec.js --output=/tmp/helper-calendar-review
```

The new tests run the actual production App build with two password-mode test identities, real scoped HTTP routes and disposable SQLite. A clearly identified controlled source fixture generates a synthetic campaign without a paid provider. Coverage includes all four format plans, whole-campaign placement, cross-timezone movement, removal/undo/reload, changed settings, a competing destination edit, and held applies fenced by actual owner Pause/Take over controls. Existing mounted App tests cover dirty artwork/source buffers, lost-response retry, session/scope invalidation and default-off capability hiding.

These deterministic checks are not a human usability study, Google login certification, autonomous-model benchmark, publication result or proof of arbitrary remote-agent identity. Issue70 remains open for combined release/evaluation acceptance.
