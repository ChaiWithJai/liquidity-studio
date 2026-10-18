# 003: Preparation, review and native design are distinct

**Status:** Implemented separation; recorded from current code on 2026-10-18. Remaining content and native-access acceptance is tracked separately.

**Context:** A useful sourced preview can be prepared before a person approves its copy. Native layout edits can later differ from that copy. Conflating these states would imply factual approval or synchronization that did not occur.

**Decision:** Source preparation retains bounded primary evidence and an editable unreviewed candidate. Whole-copy review/promotion and separate clinical confirmation use current identity and revisions. A Penpot design has its own persisted file and edits; Studio preview remains the reviewed source copy. Native approval/export and publication are separate operations.

**Alternatives/trade-offs:** Automatic approval on successful retrieval or generation would remove a deliberate review boundary. Automatic reverse synchronization from arbitrary native layout text would need an explicit conflict/review contract that the current linked-design path does not provide.

**Consequences:** UI copy must name the artifact being previewed/exported. Source edits can stale native origins; restoring historical bytes does not transfer approval. Engineering fixtures, published paper retrieval and real human learner acceptance are different evidence. Clinical candidates can be quarantined unreviewed without claiming treatment guidance.

**Evidence:** [candidate builder](../../liquidity-studio/server/prepared-source-candidate.js), [promotion service](../../liquidity-studio/server/prepared-promotion.js), [Penpot design service](../../liquidity-studio/server/penpot-story-design.js), [PR117](https://github.com/ChaiWithJai/liquidity-studio/pull/117), [PR179](https://github.com/ChaiWithJai/liquidity-studio/pull/179), [PR197](https://github.com/ChaiWithJai/liquidity-studio/pull/197), [#162](https://github.com/ChaiWithJai/liquidity-studio/issues/162).
