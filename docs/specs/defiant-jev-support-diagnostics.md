# Finite support response diagnostics

Actual historical evaluation retained only support-stage rejection, not its predicate. Existing sanitized receipts and observability recovery metadata do not identify the predicate; no model call or recovery request is authorized here.

Split the existing ordered support validation into six static stages: support-object, support-type, support-choice, support-labels, support-probability, support-sum. Keep legacy support readable. Same schemaVersion 1, no additional response values or keys retained, no request/rubric/configuration/acceptance tolerance changes. First failing predicate is reported; no claim about later predicates. Saved historical failure remains unchanged and cannot gain a retrospective diagnosis.

Modify server/defiant-jev-evaluation.js and its contracts plus the UI stage allowlist. Hosted Verify Node/Chromium jobs validate acceptance, finite redaction and legacy compatibility; no local application execution, dependencies, model calls, budget reset or provider changes. No push until independent/root review.
