# Generation integrity operation

Generation fails when credentials are absent or the provider request/output is invalid. For an explicitly synthetic local demonstration set `AI_ALLOW_SYNTHETIC=true` before starting a separate process. Do not use that setting to establish provider health.

Synthetic campaigns carry `campaign.provenance.mode = synthetic`, `requiresReview = true`, and a trace with `status = degraded`. They copy supplied facts without inventing financial figures or relabeling broadcast revenue as gross margin. The supplied backlog facts are not externally verified by this service. Provider output also requires editorial review. The numeric allowlist and gross-margin label guard are conservative checks, not proof of factual correctness. Numbers reused with changed units or other semantic changes require editorial review.

Both browser implementations show provenance for new, reopened and legacy drafts and preserve existing drafts on HTTP/network generation failures. Issue #3 remains open: addBacklogStory in container.js still inserts fabricated default facts when facts are omitted, and the gateway cannot determine whether a supplied fact was fabricated upstream. Remove those defaults and require explicit source facts before closing #3.

Validation: `npm run test:gateway`; existing isolated suites require explicit `AI_ALLOW_SYNTHETIC=true npm run test:backwards` and `AI_ALLOW_SYNTHETIC=true npm run qa:loop`.

Rollback: revert this change and restart through the normal deployment process. There is no data migration. The existing port-3000 process was not restarted or modified during verification. Reverting restores unsafe implicit fallback, so it should be treated as a temporary recovery step only.
