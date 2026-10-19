# Manual discovery and supplied-source clips (#281)

This follows the approved Nipsey inbox sequence. Imported records and manager decisions remain intact. Live API metadata, supplied media permission declarations, manual clip proposals and actual render artifacts are distinct records. A source link or catalog selection never grants media permission.

## Manual metadata contract

Organization route `/api/studio/strategy/:org/inbox/discovery` reads configuration, saved queries and the latest run. `/queries` saves up to eight `{id,query}` records using the existing strategy revision/idempotency contract; query text is at most300 characters. `/run` accepts the saved query ID, request key, expected strategy revision and optional page token. One user action fetches one search page of at most25 videos and one batched video metadata/statistics response. No scheduled search, media retrieval, scraping or paid model is used.

The optional server-only `STUDIO_YOUTUBE_API_KEY` enables the fixed official adapter; absence returns `configured:false` and no provider request. Tests inject a provider explicitly; fabricated results are not presented as live discovery. Provider failures have saved finite error states. Replaying an accepted request never repeats the external query. Manager proposals, imported originals and unknown historical observation dates are preserved.

Public metadata observations live only in `defiant-youtube-observations:<org>:<run>` records. They expire after30 days and are excluded from permanent report snapshots. Firestore stores the bounded cache inline in its parent document, with a typed Timestamp `expiresAt`; no observation subcollections survive parent expiry. Enable the existing database TTL policy on collection group `liquidity_state_v1`, field `expiresAt`, before live operation. Other records never receive that field. Local reads remove expired cache data. Query/run identities and human notes remain durable.

Current official documentation uses a separate Search Queries quota bucket:100 search calls per day, one unit per search call. Do not reuse the obsolete100-units/search assumption. `videos.list` costs one unit. Actual configured-project quota and API enablement are operator setup, not inferred from these defaults. No API was enabled or called during source implementation.

Primary sources: [search.list](https://developers.google.com/youtube/v3/docs/search/list), [videos.list](https://developers.google.com/youtube/v3/docs/videos/list), [data retention and audiovisual restrictions](https://developers.google.com/youtube/terms/developer-policies).

## Supplied media contract

Organization route `/api/studio/strategy/:org/inbox/clips` lists saved assets, proposals and immutable artifacts. Upload begins with metadata at `/uploads`, then raw binary chunks of at most256 KiB at `/uploads/:id/chunks/:index`, then `/uploads/:id/complete`. MP4 source/output is at most20 MiB; PCM WAV audio is at most6 MiB. No large base64 JSON body is accepted. Current organization membership is checked before media operations and in final metadata transactions. Original bytes have server-computed SHA256/size checks, scoped immutable storage and unchanged permission declarations.

`/proposals` saves source/recording/asset IDs, manual interval (maximum30 seconds), normalized crop point, caption and source/music gains. Editing uses `expectedProposalRevision`; media acknowledgements carry `clipRevision`, not the strategy aggregate revision. Render upload binds the exact saved proposal revision and `{source:sha,audio:shaOrNull}` input hashes. The server checks input lineage and MP4 container signature; it does not pretend to decode, independently render or validate acoustic quality. Actual browser rendering/playback is acceptance work.

Media uses the existing artifact store with a trusted organization strategy prefix, `organizations/:org/strategy/artifacts/`; no publishing brand is invented. Stores without artifact support retain the bounded immutable chunks. Private asset reads support ordinary authenticated blob retrieval and byte ranges. Browser playback uses an authenticated fetch/object URL, not an unauthenticated raw media URL.

A rendered artifact carries its exact saved proposal and input asset references/hashes. Existing report commands accept `clipRefs:[{artifactId}]` with the source selected, and retain immutable `clipSnapshots`. Title edits and later proposal changes preserve historical snapshots; explicit report refresh can change the selection. Existing deliberate destination/objective/deliverables handoff carries the same snapshot into the unreviewed, unscheduled campaign brief. No publishing, clearance or official audio linkage is implied.

## Verification and remaining input

Focused regression sources cover provider normalization/replay/expiry, retained manager proposals, TTL parent byte deletion, organization-private media, chunk upload beyond generic transaction capacity, immutable render lineage and report/draft handoff. They are for hosted execution only. No local test runner, build, installation, model or source download was used.

Functional acceptance must use BrowserOS neo: supplied MP4 + permitted WAV → interval/crop/caption/gain → real MP4 render → playback → saved artifact/full reload → report/campaign handoff. The renderer capability probe supports MP4 H264/AAC; a WebM-only placeholder is not the target. A cleared real Nipsey source/audio pair remains operator/user input. Existing generated Studio videos or synthetic audio do not establish rights to creator/catalog media.
