# Exact selected revision text in answer observations

Approved bounded follow-up to an observed revision-transcription error. No model, new data source or MCP write.

Capture retains its1–5 numeric assertions and may additionally include `revisionAssertions`, an array of1–5 exact `{span:{start,end,text}}` entries. Omission preserves legacy payload hashing and stored shape. Spans use Unicode codepoint indices and exact original answer slices,1–128codepoints; bounded malformed revision text is accepted so transcription errors can be saved. Expected revision comes only from the captured request's revision, verified by the existing authorized evidence reads.

Store separate optional `revisionResults`, each with original span, expectedRevision, exact match/mismatch, basis `exact-selected-text-equals-captured-evidence-revision`, validatorVersion `exact-revision-text-v1`, and semanticSupport unknown. No trimming, case normalization, automatic scan or whole-answer correctness inference. Existing numeric results and hypothesis assertion indices remain unchanged.

Reuse current managed authority, scope/revision checks, request/store bounds, immutable replay and separately attributed correction. Changed optional assertions conflict under an existing idempotency key. Existing stored observations are not retroactively rewritten. UI explicitly adds/removes quoted revision checks, preserves exact original text, and shows expected/observed result after save/reopen. This slice retains required numeric assertions rather than adding revision-only capture.

Authored acceptance: analogous invented extra-character mismatch, exact match, uppercase/whitespace mismatch, Unicode offsets, malformed/forged spans, bounds, currentrevision denial, unchanged old replay, changed new assertions conflict, immutable correction, separate numeric indices and explicit UI capture/readback/escaping/compact fit. Hosted execution and actual acceptance remain separate gates. Broader semantic/classifier/human evaluation requirements remain open.
