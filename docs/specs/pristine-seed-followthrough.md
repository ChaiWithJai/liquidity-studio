# Pristine seed follow-through: guarded SQLite operator path

This increment provides a reproducible read-only SQLite snapshot plan and an explicit internal guarded title/queue composition. No maintained migration or dispatch has been executed. It does not reset quotas, restore approvals or add an HTTP mutation API. The three clinical previews remain a separate source increment.

`server/run-seed-followthrough-plan.js` requires explicit snapshot path/SHA, organization, brand, current founder actor and a new private output. It opens SQLite with `readOnly:true`, checks the file hash before/after, never constructs a ScopedRepository or platform factory, and requires an output directory mode0700/file0600. There is no `--apply` argument. Source HEAD is a full Git SHA; catalog module and immutable registry source hashes are recorded. The snapshot is not a current live fence or a full asset-aware backup.

The registry pins the exact legacy normalized factory stories, claim hashes and neutral desired titles. AMC already has an acceptable title. Nykaa, LuckyChap and Ramanujan need a neutral title only if every original field/revision/content epoch still matches. Unknown fields or related human work mean owner choice, never a lossy automatic normalization. Source approvals and unsupported legacy claims remain untouched.

The plan derives current founder/membership and brand preset from the snapshot. It records full identity/principal/scope/story/title/claim hashes, exact revision/content epoch, catalog and copy-registry hashes. Other scopes with the same stable story IDs are excluded. It rejects related candidates, failed/active/uncertain jobs, assignments, receipts, feedback and unknown scope extensions. Existing scoped assets or external native/review records conservatively prevent automatic eligibility, even if a loose reference cannot associate them to a story.

`plannedSeedQueueIds` only intersects the existing official preparation dry-run with the reviewed four stable IDs. It does not dispatch. Old Nykaa framing lacks the catalog's `nykaa` topic, so it remains ineligible until an explicit neutral rename; a new source fingerprint must be computed afterward. Never run the unrestricted bootstrap apply and assume it queues only four topics.

`assertPristineSeedPlanRow` is a pure guard used through the existing WorkspaceService `control.guard` / `control.binding` seam. Hosted coverage holds a normal semantic title operation, commits a real concurrent human edit, then verifies the guard rejects the older migration intent and preserves the human title/revision. The SQLite composition below supplies current identity and the scoped collection inventory inside the same authoritative transaction. This same-connection protection is deliberately not claimed for Firestore.

Before maintained writes: fresh asset-aware backup (or explicitly scoped zero-asset proof plus consistent SQLite backup), fresh live manifest/root review, exact pristine/CAS and current membership checks inside the transaction, controlled Neo concurrent-edit negative acceptance, and explicit operational handoff. Reuse existing semantic title mutation, revision/content-epoch machinery and official bounded job creation. Keep every older candidate/edit/failed job. Unknown or human-modified records require deliberate owner choice. Rollback is a new revision-aware semantic edit while no later work exists, not a whole-database overwrite.

## SQLite apply composition (source checkpoint, not maintained execution)

`applyPristineSeedFollowthrough` composes the existing workspace title mutation and durable source-preparation job creation. It is an internal operator function, with no HTTP mutation route. It requires the actual `DurableStore` instance shared by the workspace and jobs repository; Firestore is deliberately unsupported.

The workspace guard reads current identity and the scoped key inventory on the same SQLite connection while `BEGIN IMMEDIATE` is held. It compares the entire reviewed plan, factory story/claims/revisions, source commit, catalog and copy-registry hashes before making any title change. The ordinary workspace receipt retains the fixed post-title story revisions, preparation fingerprints and a complete scoped-state hash. The job guard rechecks those exact values and current identity inside its own transaction. It does not call `createForIngestion` or substitute a later human revision. An intervening change leaves the title receipt available but refuses job creation; the operator must review that state rather than reset quotas or overwrite work. Accepted job replay uses the existing idempotency receipt.

The new test cases are authored for hosted execution and have not been run locally under the BrowserOS-only constraint. No maintained apply, dispatch, or migration has occurred. A fresh selected-scope asset-aware backup (or explicit zero-asset proof plus consistent SQLite backup), current manifest, exact source review and isolated Neo concurrent-edit acceptance remain required before maintained execution. Runtime source-commit pinning belongs to the reviewed operator assembly; a caller-provided hash alone is not deployment provenance.

## Concrete local operator entry

After the source is shipped into the reviewed local image, the operator uses that image's existing environment and database mount. The existing local worker remains responsible for processing; this command never starts a worker or changes worker scopes/configuration.

```sh
node server/run-seed-followthrough-apply.js \
  --database /absolute/current/studio.sqlite \
  --plan /absolute/private/reviewed-plan.json \
  --source-commit FULL_REVIEWED_IMAGE_SOURCE_SHA \
  --organization EXPLICIT_ORGANIZATION_ID --brand EXPLICIT_BRAND_ID \
  --actor CURRENT_FOUNDER_ID --title-key TITLE_OPERATION_UUID \
  --job-key PREPARATION_JOB_UUID --out /absolute/private/new-dry-run.json
```

The default opens the database read-only and reports whether the current plan exactly matches the reviewed one. An explicitly reviewed invocation adds `--apply` and uses a separate new output filename. Apply refuses Cloud Run, Firestore, disabled jobs/preparation, or a dispatcher other than the configured local durable worker mode. It uses the same explicit scope and current founder and keeps title/job keys stable during receipt recovery. A source SHA argument is an operator binding, not independent proof of the image; the release receipt and exact image/source hashes must be reviewed separately. No unrestricted bootstrap, repository replacement, factory-title reset, approval or quota reset is part of this entry point.

## Proposed Firestore operator composition (hosted gates required)

`applyFirestoreSeedFollowthrough` is a separate internal composition; the SQLite entry above still refuses Firestore. It creates a private per-invocation store/repository view, reuses the existing WorkspaceService/JobService semantic operations and receipts, and never initializes a missing scope. Current identity, selected scope and complete bounded parent-key inventory are read in the same Firestore read-write transaction before each title/queue guard. No shared store methods are patched. A committed human change between the phases leaves the title receipt intact and refuses fresh queue creation.

The new `transactWithKeyInventory` admits at most512 logical parent records for this one-off operator path, with two projected queries limited513 to detect overflow. One uses the indexed key field; the other document ID, detecting missing-key corruption. Unknown namespace and exact-suffix scope keys use the same conservative SQLite inventory rule. Unrelated scopes count toward admission but are not interpreted as related work. Named current/next JSON values are bounded4MiB aggregate; existing product record/transaction limits are unchanged. SDK retries can repeat pure guards, never external effects. The helper is not called by ordinary bootstrap or an HTTP route.

Installed `@google-cloud/firestore`9.3.1 primary declarations (`types/firestore.d.ts`, ReadWriteTransactionOptions and runTransaction documentation) expose `maxAttempts` and optional `readOnly:false`, not a per-transaction timeout override. The implementation explicitly retains maxAttempts5 and the SDK/service documented60-second no-read/270-second transaction limits. It does not invent a timeoutSeconds option or imply an outer HTTP deadline cancels SDK work. A future maintained operator command must bound its operational lifecycle separately and preserve unknown outcomes/receipt replay.

The hosted real emulator suite includes two-client absent-key/unknown-namespace insertion serialization, committed-insert visibility, identity/scope drift, capacity and corruption checks, plus full semantic title/job/replay and between-phase human-edit cases. Fake SDK serialization is not accepted as phantom proof. No local execution or maintained cloud writes accompanied this source increment. A green emulator gate and later reviewed backup/live plan/operational handoff remain necessary before maintained use. See [the bounded design proposal](../proposals/firestore-seed-followthrough.md).
