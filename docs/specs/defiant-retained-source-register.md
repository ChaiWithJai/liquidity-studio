# Retained source and archive-member register

## Objective and scope
Implement the accepted bronze discovery capability as deterministic, scoped metadata search over an explicitly retained intake register. Answer what files and nested members were retained, their format/size/source/hash, and which declared periods they describe. This is one capability; semantic retrieval, new parsing, aggregate proofs and report composition remain subsequent work.

Owner authorization covers implementation without another planning approval. Root and independent source/schema review precede code and push. Existing authority, private data and hosted verification requirements remain mandatory.

## Contract
Add optional `retainedSourceRegister` to the normalized evidence snapshot. Absence preserves the exact legacy normalized shape/revision and returns an explicit unavailable register response, not an empty complete inventory. Presence contributes to the existing evidence revision. Schema version1 contains `scopeDescription`, `capturedAt` (valid calendar UTC), `provenance` (input-manifest and member-inventory SHA256), `roots`, and `members`.

Root records: `id`, `sourceId`, `filename`, `format`, `bytes`, `sha256`, `generation`, `retentionVerification:{size,crc32c,md5}` (each boolean or null, supplied verification observations), `memberInventory:{status:'enumerated'|'not-enumerated',scope}` and `periods`. Generation is a pinned original-object generation only. A root hash is recorded provenance, not a claim the service downloaded/rehashed the object. File labels such as “No PII” and “Sandbox” remain source labels; no privacy or real-production-data certification follows.

Member records: `id`, `rootId`, `chain` (ordered relative member paths, including nested containers), `sha256`, `bytes`, `format`, `container` and `periods`. Member sourceId is inherited from the referenced root, never independently supplied. Each occurrence is distinct: stable id is derived by the private publisher from root hash + exact chain + member hash. Equal member hashes do not collapse occurrences or deduplicate financial rows. No member generation or fabricated parent hash is introduced. Nested container rows remain searchable.

Duplicate identical month/basis/sourceText triples are rejected; distinct filename segments may each declare the same month. Periods are zero or more `{month,periodKind:'sales'|'reporting',basis:'filename-declared',sourceText}` observations, where sourceText is the exact registered filename/final member segment containing the explicit month. This slice accepts only explicit CSV basename sales_period-MM-YYYY, sales-period-MM-YYYY or reporting_period-MM-YYYY markers in the reviewed publisher; ambiguous/year-only/arrival, backup, date_report, sent and directory-range dates yield no period. The normalizer requires sourceText to equal the actual root filename or final member chain segment (never an ancestor container) and the month to equal the supported unambiguous filename parser result; mismatch rejects the snapshot with503. No row-content verification is inferred. A future content-profile period requires a separately reviewed typed provenance extension; it cannot overwrite the filename basis.

Bounds: roots1–64, members0–4096, each root/member ID1–128 safeidentifier chars, sourceId1–128, filename1–500, format finite `csv|xlsx|xls|pdf|png|jpg|zip|tar.gz|json|other`, member chain1–8 with each segment1–500, bytes nonnegative safeinteger, generation1–30 positive canonical decimal characters, hashes64lowerhex, scope text1–2000, capturedAt ISO UTC, periods0–24. Reject absolute paths, backslashes, dot/dotdot components, control characters, duplicate IDs/occurrence keys, unknown root references and conflicting same-hash byte sizes. Input registers must fit2MiB serialized. Do not expose local paths, GCS URIs, credentials, source rows, contact fields or archive payloads.

## Read interface and reuse
Add one finite read resource `retained-sources` and MCP tool `defiant_search_retained_sources`, using existing service/provider authorization before and after snapshot read and exact supplied revision checks. No external filesystem/network reads. Existing `coverage` discovery remains explicitly served-reference-only.

Arguments: optional revision, query<=200, sourceId, format, kind=`root|member`, sourceHash64hex, fromMonth/toMonth, offset0–5000 and limit1–100. Unknown fields and invalid/inverted ranges fail closed. Query is NFC/case-insensitive substring over retained filenames/chains/sourceId/hash only, never semantic rank. Filters AND together. Period filters include only explicit registered periods; undated metadata is counted and excluded. Sort deterministically by rootId/kind/member occurrence id, not score.

Absent register returns availability:false with inventory counts:null and no items; null means unavailable, not zero retained objects. Present response names globalCounts and matchingCounts separately; uniqueLeafHashes excludes root/container hashes.

Response: scope/revision, availability, inventoryKind=`retained-intake-metadata`, scopeDescription, counts separating root objects/member occurrences/leaves/unique leaf hashes/duplicate-hash groups, filters/paging/items, and explicit `providerComplete:false`, `downloadsComplete:false`, `financialRowsDeduplicated:false`. These false flags mean no completeness claim, not proof of a missing provider record. Each item retains exact metadata and period basis. Undated counts refer to records with zero registered periods, separated by global and matched scope. Derive served association by exact sourceHash from existing months, receipts, selections, comparison sourceReferences and audienceDefinitions only (never from the register itself); report only referenced/not-referenced, never parsed/unparsed or whole-file-served. Root container absence from served references says nothing about its descendants. Bound response<=3MiB. No arbitrary path/hash fetch, writes, formula execution or automatic joins.

## Implementation plan and tasks
1. Pure register normalizer/projection with explicit bounds, stable occurrence semantics and optional-field compatibility. Add source-only invented fixtures and rejection/filter/paging contracts.
2. Integrate snapshot normalization + finite HTTP/service/MCP resource. Update existing stdio bridge resource/query allowlists and actual SDK client contracts; preserve all17 existing tools, private OAuth scope and local authority. New tool makes18, with no capability expansion to writes.
3. Add browser discovery entry in the existing evidence explorer only after backend contract review, using current epoch/revision/scope fencing and bounded paging. Official Svelte MCP required; explicit no-data/unavailable versus no-match states.
4. Independently review the private metadata projection and publication plan. Do not publish real manifests in Git. Materialization/publication/adoption are separate root-owned actions after review; this spec does not authorize an upload.
5. Hosted Verify only after root push authorization. Verify full source/artifact provenance before canonical import and exact-head checks; actual scoped Studio/MCP acceptance remains separate.

## Commands, structure and style
Use existing Node/Svelte/official MCP dependencies; add no packages. Module: `liquidity-studio/server/defiant-retained-sources.js` with `.test.js`; integrate `defiant-evidence.js`, HTTP/MCP/bridge and existing explorer conventions. Prefer pure helpers returning explicit qualification objects, e.g. `{inventoryKind:'retained-intake-metadata', providerComplete:false}`.
Hosted-only verification: existing `.github/workflows/verify.yml` runs `NODE_ENV=production npm run build`, `node --test server/*.test.js`, `node --test ../scripts/*.test.mjs`, `npm run test:backwards`, `npm run qa:loop`, and `npm run test:browser -- --project=chromium` from liquidity-studio. These are hosted workflow commands, not commands to run locally. No local test/build/install/model command is authorized. Read-only review: `git diff --check` and `git diff --stat`.

## Acceptance and boundaries
- Old snapshot without the field retains its exact revision, legacy tools and responses.
- Invented fixtures prove root/member distinctions, nested containers, duplicate-content occurrences, no generation on members, per-object null verification, filename periods and undated exclusion.
- Scope descriptions/source IDs/filenames/labels are untrusted data, escaped by UI and never treated as instructions.
- Scope mismatch/revocation/stale revision fail before disclosure; actual SDK resource filters match HTTP, with no hidden arbitrary storage access.
- No public private-manifest values; no claim that intake captures all Downloads/provider data or that repeated hashes are duplicate sales.
- UI/MCP result counts and source references agree at one revision, with reload/paging and no unsafe rendering.
- Full gold/report/model/human requirements remain open. Proof attachment and broader report composition are deferred, not removed.
