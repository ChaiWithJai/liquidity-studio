# Prepared source candidates

Issue: [103](https://github.com/ChaiWithJai/liquidity-studio/issues/103). Status: implementation in progress; no production acceptance yet.

An operator job may prepare an extractive visual candidate from retrieved source material. Preparation does not approve a claim, replace an approved campaign, or authorize export. It uses the existing durable job/outbox dispatcher and the same installation and organization reservation ceilings. The initial implementation calls no model provider.

## Network and evidence boundary

Only operator-allowlisted HTTPS hosts may be retrieved. URLs must have no credentials, fragment, IP literal, or alternate port. DNS must resolve exclusively to public addresses; the chosen address is pinned to the request. Redirects, compressed responses, non-text media and oversized responses fail closed. DNS plus the full response have a bounded deadline and cancellation. Retrieval is server-side; the browser receives neither an arbitrary fetch proxy nor source HTML. Extracted text is plain text and never executed as markup.

Each persisted evidence snapshot identifies the requested and actual URL, retrieval time, response media type, original response SHA-256, extraction version, extracted text SHA-256, and bounded excerpts. A failed or empty extraction produces an actionable failed job, not a filled canvas. Retrieved publisher wording remains an unreviewed excerpt. Clinical text remains quarantined and cannot acquire clinical review through preparation.

## Durable state and lineage

Jobs explicitly declare `purpose: source-preparation` or the existing `campaign-generation` default. Both purposes share retention, reviewed plan IDs, retries, actor reauthorization, leases, fences and reservation limits. Preparation plans capture source inputs, brand revision and the story content epoch (`contentRevision || 1`), plus a content fingerprint. Calendar assignment, status and assignee changes do not change the preparation input epoch; source/content edits do. Legacy native-origin migration is outside this change.

Evidence and candidate payloads live in a bounded scoped aggregate, separate from `campaignDraft`. Candidate identity includes organization, brand, story, preparation job/item/attempt, immutable preparation ID, content epoch, source fingerprint and brand revision. Only these small status fields are written to the story: `preparationStatus`, `preparationJobId`, `preparedCandidateId`, `preparationUpdatedAt`, and `preparationErrorCode`. They contain no hidden content. A commit rechecks the current actor, lease, content fingerprint/epoch and brand revision. A stale completion cannot overwrite a newer candidate or approved campaign.

The candidate has an explicit machine-prepared/unreviewed provenance contract and source-linked excerpts. It contains no invented statistics, synthetic factual connective copy, or claim of human approval. The first visible preview and editing controls use this candidate independently from the approved campaign. A deliberate whole-draft human confirmation reviews the exact saved copy and evidence digests, mandatory content classification and current source/brand/content revisions. The server derives exact per-field editorial review records and promotes that saved copy without a model call. Clinical review requires its separate current-founder confirmation. These records are editorial source review, never automatically verified facts or clinical accuracy. A reconstructive validator rejects any campaign field differing from its reviewed field record. Promotion is atomic with current membership and the scoped state, respects the restore lock, and retains same-key receipts. Native layout and artifact sign-off remain bound to their exact approved source and native revisions.

## Client and recovery

Selection does not start a provider request from a Svelte mount. An ingestion or explicit preparation plan schedules durable work before editor entry. The client reads the persisted candidate, actual queued/running/failed/stale status and retained receipt. Rejoining uses that identity rather than repeating preparation. Same-key retry recovers uncertain creation/control outcomes. Scope changes fence late results and dispose local candidate edits; unsaved work keeps its original revision base.

## Acceptance and rollback

Tests must cover actual bounded retrieval and extraction, both brands, no provider invocation, machine/human provenance separation, tenant denial, content and brand conflicts, metadata-only planning drift, cancellation/retry, duplicate delivery, quota, retention, reload and candidate editing. Browser evidence must distinguish the actual HTTP fixture from live source retrieval. Final operator acceptance requires actual primary-source retrieval for each brand, compact artwork-first presentation at 883 × 695 and desktop widths, evidence inspection and explicit current sign-off. No test pass alone establishes publication readiness.

A default-off feature gate preserves the existing campaign/export path. Disabling preparation stops new preparation plans without deleting evidence, candidates or receipts. Rollback never rewrites original generation content or turns candidates into approved campaigns.

## Existing-state rollout

Enable `STUDIO_SOURCE_PREPARATION_ENABLED=true` together with the existing `STUDIO_OPERATOR_JOBS_ENABLED=true` and configured dispatcher. The packaged operator command operates on an explicit existing scope and requires its current founder identity:

```sh
node server/run-source-preparation-bootstrap.js --organization ORG_ID --brand BRAND_ID
node server/run-source-preparation-bootstrap.js --organization ORG_ID --brand BRAND_ID --apply
```

Set `STUDIO_PREPARATION_BOOTSTRAP_ACTOR_ID` privately. SQLite requires an explicit existing absolute `STUDIO_DATABASE_PATH`; Firestore uses the existing configured store. Plan performs no writes or dispatch. Apply only queues existing durable jobs and dispatches their outbox; it does not fetch from the command process, approve sources, replace a campaign, or invoke a model. Repeating apply skips any previous attempt at the same input fingerprint, including failures; deliberate retry uses the normal job control.

The pilot-primary-v1 catalog selects three existing stories: Angel City ownership (club announcement), Huda Beauty ownership (issuer release dated June 3, 2025), and Yoga Sutras (historical translation). The remaining seven seeded topics explicitly need source research. Topic and brand must match the catalog pointer. Catalog coverage warns that the Huda release does not support the legacy 2024 date or margin estimates, and that the Angel City release does not establish legacy sponsorship/rights estimates. Existing claims and local editor buffers remain untouched by preparation.

Primary sources: [Angel City announcement](https://angelcity.com/acfc-post/angel-city-ownership-agreement-announcement), [Huda Beauty issuer release](https://www.prnewswire.com/news-releases/huda-beauty-reclaims-full-ownership-as-an-independent-beauty-brand-302471853.html), [Yoga translation](https://www.gutenberg.org/cache/epub/2526/pg2526-images.html). Catalog inclusion is retrieval configuration, not factual approval.

## Promotion and portability

A review plan binds candidate revision, content epoch, brand revision, canonical copy SHA-256 and evidence SHA-256. The promotion body carries those exact fences, a unique idempotency key, `reviewed: true`, and a mandatory kind. The resulting provenance mode is `human-reviewed-prepared-candidate`; its manifest maps every approved copy field to an `editorial_copy` source record containing the current reviewer/time and evidence hashes. `verifiedFacts` stays empty. No native layout or publication approval is inferred. Portable imports must treat these records and promotion receipts as historical evidence; current-owner per-candidate reattestation is required before promotion authority can be recreated. The portable pack currently rejects unsupported preparation extensions rather than silently dropping them; its follow-up integration is explicit remaining work.

## Editing reviewed copy again

A reviewed campaign exposes **Edit reviewed copy** instead of the ordinary unreviewed format-save form. The authenticated `POST /api/studio/preparations/stories/:id/fork` request binds `idempotencyKey`, `expectedRevision`, `expectedContentRevision`, `generationId`, and `brandRevision`. It creates an unreviewed working candidate from the current campaign and its retained exact evidence, with no fetch or model call. An existing active fork of that same generation is resumed after reload, preserving saved edits. Same-key recovery returns the original fork and explicitly reports if it no longer belongs to the current generation.

The original generation remains intact while the fork is edited. Whole-draft confirmation may replace a campaign only when this fork captured that exact current generation, content fingerprint/epoch and brand revision. A concurrent generation/content change returns 409. Successful confirmation records a new generation and content epoch, retains the previous campaign on the fork and the original immutable preparation/promotion history, and invalidates old native source/approval bindings. No layout approval is inherited. The ordinary no-campaign promotion rule still cannot overwrite an unrelated campaign.

A clean fork may return to the current handoff without deleting the saved review draft. Unsaved edits must be saved or explicitly discarded first. Reopening the review action resumes the same active candidate rather than minting a duplicate.

Portable historical entries carry `restoredHistorical: {packSha256, originalScope, originalCandidateId}`. They cannot be directly edited, reviewed or promoted. A deliberate current-generation fork may use their retained exact evidence to establish a fresh current-scope candidate; its current-owner confirmation is still required, including separate clinical sign-off. Execution IDs on such fresh forks are null, and imported execution/edit/promotion receipts never regain authority. The pack owner is integrating this projection separately.

Pending saves are distinguished from uncertain outcomes: the same request intent is retained during dispatch, but recovery controls appear only after a missing/error reply. A delayed read that discovers a different candidate ID or revision cannot replace dirty local text or advance its editing base. The server also fences edits and confirmation to the current selected candidate ID; a superseded same-revision candidate remains historical and returns a conflict rather than a misleading successful save.


## Unfinished portable drafts

An imported saved candidate without a campaign remains historical and unreviewed. Its retained evidence and working copy cannot be edited or promoted directly. The operator can explicitly choose **Continue editing restored draft** to create a fresh candidate in the current workspace, then edit and confirm the whole saved copy through the existing human review flow.

The historical fork plan captures the story revision, content epoch, brand digest, historical entry revision, pack digest, evidence digest, saved-copy digest and preparation fingerprint. The POST uses one retained idempotency key and rechecks those fences with current membership and the restore gate in the atomic transaction. It refuses any existing campaign; reviewed campaigns continue to use the separate current-generation replacement fork. A lost reply recovers the original receipt rather than creating another draft.

The new candidate retains exact evidence and saved copy but has no job execution identity, inherited approval or replacement authority. Known clinical classification remains quarantined. The original historical entry is unchanged. This operation retrieves no new source and calls no model. A different current brand can produce layout violations; the copy remains editable and review is unavailable until those violations are resolved.

Verification: four focused service cases cover both brands, explicit fresh-owner review, replay, stale fences, restore lock, existing campaign exclusion, membership and clinical policy. Three actual App journeys cover both brands, saved-copy reload and same-key recovery after a lost reply. A temporary combination with portable-pack PR119 exercises actual export and restore to a different founder and scope before this fresh fork; it does not substitute a fabricated import marker for that pack proof.
