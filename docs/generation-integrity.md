# Generation integrity operation

Generation fails when credentials are absent or the provider request/output is invalid. For an explicitly synthetic local demonstration set `AI_ALLOW_SYNTHETIC=true` before starting a separate process. Do not use that setting to establish provider health.

Synthetic campaigns carry `campaign.provenance.mode = synthetic`, `requiresReview = true`, and a trace with `status = degraded`. They copy supplied facts without inventing financial figures or relabeling broadcast revenue as gross margin. The supplied backlog facts are not externally verified by this service. Provider output also requires editorial review. The numeric allowlist and gross-margin label guard are conservative checks, not proof of factual correctness. Numbers reused with changed units or other semantic changes require editorial review.

The browser must show provenance for generation and reopened saved campaigns. That dependent UI work is tracked in issue #3; this server change alone does not complete its visibility acceptance criterion.

Validation: `npm run test:gateway`; existing isolated suites require explicit `AI_ALLOW_SYNTHETIC=true npm run test:backwards` and `AI_ALLOW_SYNTHETIC=true npm run qa:loop`.

Rollback: revert this change and restart through the normal deployment process. There is no data migration. The existing port-3000 process was not restarted or modified during verification. Reverting restores unsafe implicit fallback, so it should be treated as a temporary recovery step only.
