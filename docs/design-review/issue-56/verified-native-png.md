# Reviewed native PNG export

The optional native editor now has an explicit adapter-owned PNG action. The public application keeps its existing native-editor availability gate. This change does not resolve the upstream source redistribution condition or enable the native editor on the GCP pilot.

The operator approves a saved layout, selects **Prepare approved PNGs** in the actual editor toolbar, opens each private PNG, and selects **Approve this PNG and download**. The server verifies complete PNG bytes, dimensions, SHA-256, current identity, source content epoch, native version and review binding. Exact-byte sign-off is attributed to a founder or designated brand approver. A separate authenticated completion records the export receipt. Approval, planning and export appear as separate facts.

## Integrity and recovery

- Content epochs advance for editorial changes, including restoring an older portable payload. Planning, assignment and preparation-progress metadata do not invalidate content. Legacy native records retain strict story-revision checks.
- Full-size PNGs are bounded at four MiB each. Every page has its own staged artifact and receipt; an incomplete multi-page export does not imply all pages were exported. No image is silently resized.
- The browser receives a fixed, tenant-bound signed envelope, never a signing secret. Server key rotation retains the preceding key. New completion requires an unexpired envelope; an identical already-committed receipt can be reconciled after expiry by a currently authorized actor.
- Membership, source, review and stage are rechecked after private-byte retrieval and in the commit transaction. Changed input under one idempotency key, altered envelopes, stale approval and corrupt payloads fail closed.
- Staged private artifacts survive browser reload. A per-document staging index bounds retained reservations at 32; the event journal is bounded at 256. Failed or interrupted reservations are retained for operator reconciliation, rather than silently evicting replay protection. A crash between payload persistence and metadata commit can leave a bounded unreferenced private payload; it cannot mark content Exported.
- Setting `STUDIO_EDITOR_COMPLETION_ENABLED=false` stops new completion while retaining staged artifacts, sign-offs and receipts.
- Raw generation and native origins remain unchanged. Export receipts retain human sign-off and completion provenance. No preference, training-consent or social-publication label is inferred.

## Acceptance evidence

The independent actual-editor test is `liquidity-studio/tests/editor-export-native.spec.js`. It mounts the real App and locally held pinned editor source, uses scoped HTTP and SQLite, approves the saved native version, renders PNG through the public upstream `runExport` API, reloads and recovers the same staged artifact, previews its bytes, deliberately loses the committed completion response, retries the same envelope, and downloads bytes identical to the preview. The review remains Approved and separately displays Exported; the durable receipt count remains one.

The test uses an explicitly isolated password fixture, not a real Google account or a production deployment. Root and an independent reviewer both ran the native journey successfully. Existing native save/reload, role and conflict journeys also passed; two optional MODNet journeys were skipped in this run because their local weight configuration was absent.

Domain tests cover both planning/export orders, real content invalidation, envelope tampering/expiry, current permission checks, byte corruption, changed replay, key handling and membership revocation during an awaited private download. An independent held-download probe failed on the original implementation and passed after the post-download authorization fence was added. Another actual-App test caught an invalid signing claim caused by spreading a tenant configuration field; explicit scope fields and a fixture containing `preset` now guard that case.

Full GCP/native acceptance, broader multi-page human workflow and the independent source-license and portability tickets keep their own criteria. This report is not a claim that those tickets are complete.
