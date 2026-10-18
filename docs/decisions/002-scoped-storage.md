# 002: Scoped domain authority over interchangeable stores

**Status:** Implemented boundary; recorded from current code on 2026-10-18.

**Context:** Local restart/recovery and managed deployment need different storage implementations, while the same organization/brand permissions and domain mutations must hold.

**Decision:** Services authorize verified identity and scope, then use scoped repositories and bounded store transactions. SQLite supplies local persistence; the configured Firestore/GCS adapter supplies managed records and artifacts. Storage key listing is not authorization. Initialization failure does not silently choose another store.

**Alternatives/trade-offs:** Direct client datastore access or process-global active-brand state would weaken the service boundary. An aggregate-record interface keeps domain operations consistent but imposes explicit capacity and transaction-key bounds; it is not an unlimited data model.

**Consequences:** Changes to records must preserve revision, restore-lock and transaction semantics. SQLite backups, managed Firestore exports, GCS generation copies and portable customer packs have different coverage. Cloud metadata backup alone cannot recover referenced bytes. Imported identity/review metadata cannot become current destination permission.

**Evidence:** [platform factory](../../liquidity-studio/server/platform.js), [repository](../../liquidity-studio/server/repository.js), [SQLite store](../../liquidity-studio/server/storage.js), [cloud store](../../liquidity-studio/server/cloud-store.js), [storage guide](../firestore-gcs-storage.md), [portable spec](../specs/editor-portable-pack.md), [#57](https://github.com/ChaiWithJai/liquidity-studio/issues/57).
