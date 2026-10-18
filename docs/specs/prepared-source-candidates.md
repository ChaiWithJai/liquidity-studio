# Prepared source candidates

Issue: [103](https://github.com/ChaiWithJai/liquidity-studio/issues/103). Status: implementation in progress; no production acceptance yet.

An operator job may prepare an extractive visual candidate from retrieved source material. Preparation does not approve a claim, replace an approved campaign, or authorize export. It uses the existing durable job/outbox dispatcher and the same installation and organization reservation ceilings. The initial implementation calls no model provider.

## Network and evidence boundary

Only operator-allowlisted HTTPS hosts may be retrieved. URLs must have no credentials, fragment, IP literal, or alternate port. DNS must resolve exclusively to public addresses; the chosen address is pinned to the request. Redirects, compressed responses, non-text media and oversized responses fail closed. DNS plus the full response have a bounded deadline and cancellation. Retrieval is server-side; the browser receives neither an arbitrary fetch proxy nor source HTML. Extracted text is plain text and never executed as markup.

Each persisted evidence snapshot identifies the requested and actual URL, retrieval time, response media type, original response SHA-256, extraction version, extracted text SHA-256, and bounded excerpts. A failed or empty extraction produces an actionable failed job, not a filled canvas. Retrieved publisher wording remains an unreviewed excerpt. Clinical text remains quarantined and cannot acquire clinical review through preparation.

## Durable state and lineage

Jobs explicitly declare `purpose: source-preparation` or the existing `campaign-generation` default. Both purposes share retention, reviewed plan IDs, retries, actor reauthorization, leases, fences and reservation limits. Preparation plans capture source inputs, brand revision and the story content epoch (`contentRevision || 1`), plus a content fingerprint. Calendar assignment, status and assignee changes do not change the preparation input epoch; source/content edits do. Legacy native-origin migration is outside this change.

Evidence and candidate payloads live in a bounded scoped aggregate, separate from `campaignDraft`. Candidate identity includes organization, brand, story, preparation job/item/attempt, immutable preparation ID, content epoch, source fingerprint and brand revision. Only these small status fields are written to the story: `preparationStatus`, `preparationJobId`, `preparedCandidateId`, `preparationUpdatedAt`, and `preparationErrorCode`. They contain no hidden content. A commit rechecks the current actor, lease, content fingerprint/epoch and brand revision. A stale completion cannot overwrite a newer candidate or approved campaign.

The candidate has an explicit machine-prepared/unreviewed provenance contract and source-linked excerpts. It contains no invented statistics, synthetic factual connective copy, or claim of human approval. The first visible preview and editing controls use this candidate independently from the approved campaign. Explicit adoption of candidate evidence writes normal unreviewed source claims through the existing revisioned source-review path. Human approval and later generation remain separate operations. Native layout and artifact sign-off remain bound to their exact approved source and native revisions.

## Client and recovery

Selection does not start a provider request from a Svelte mount. An ingestion or explicit preparation plan schedules durable work before editor entry. The client reads the persisted candidate, actual queued/running/failed/stale status and retained receipt. Rejoining uses that identity rather than repeating preparation. Same-key retry recovers uncertain creation/control outcomes. Scope changes fence late results and dispose local candidate edits; unsaved work keeps its original revision base.

## Acceptance and rollback

Tests must cover actual bounded retrieval and extraction, both brands, no provider invocation, machine/human provenance separation, tenant denial, content and brand conflicts, metadata-only planning drift, cancellation/retry, duplicate delivery, quota, retention, reload and candidate editing. Browser evidence must distinguish the actual HTTP fixture from live source retrieval. Final operator acceptance requires actual primary-source retrieval for each brand, compact artwork-first presentation at 883 × 695 and desktop widths, evidence inspection and explicit current sign-off. No test pass alone establishes publication readiness.

A default-off feature gate preserves the existing campaign/export path. Disabling preparation stops new preparation plans without deleting evidence, candidates or receipts. Rollback never rewrites original generation content or turns candidates into approved campaigns.
