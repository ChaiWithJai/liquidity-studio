# Prepared source passage selection — #127

An actual Google-authenticated check of the Yoga preview on localhost:3001 found source-backed but disconnected paragraphs. Keyword overlap selected the correct headline together with an introduction and a later meditation discussion. A source hash establishes provenance, not relevance.

The existing operator-owned source catalog now selects Book II verses 29, 30, 32 and 46 for this story: the eight means, commandments, rules, and posture. These are quotations from the Charles Johnston translation, not a claim of clinical evidence or a translation endorsed by the operator. Original wording, including edition errors, remains editable and unreviewed.

HTML selection requires unique actual section headings, excluding table-of-contents links. Each requested verse must appear exactly once inside the selected section. Missing, duplicated or inverted boundaries stop preparation with a source-research error. There is no fallback to unrelated keyword-ranked text. Other catalog entries retain existing extraction behavior.

The passage/version is part of the catalog data already included in the preparation fingerprint. Existing immutable candidates and their buffers are not rewritten; preparing this topic again requires a deliberate new candidate. Historical evidence validation remains unchanged. Snapshot metadata records the selection method and a hash of query plus passage policy. No paid model or infrastructure is added.

Validation: 21 focused Node tests passed, including table-of-contents duplication, omitted/duplicate verses, wrong headings, exact excerpt offsets, and existing retrieval/preparation behavior. An actual bounded HTTPS retrieval of the primary source returned 214,464 bytes and exactly the four selected verses. The running local/cloud image is unchanged pending review and rollout; actual refreshed browser acceptance remains required.
