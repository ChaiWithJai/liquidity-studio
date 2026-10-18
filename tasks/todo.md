# Issue 56 tasks

- [ ] Add bounded multi-key transaction contract and SQLite implementation/tests. Verify actual two-connection contention and rollback; no weakened update semantics.
- [ ] Implement equivalent Firestore all-reads-before-writes arbitration and emulator race tests; verify unchanged data avoids writes and invalid callback/capacity errors roll back.
- [ ] Implement atomic review transitions and current native/source/brand stale checks; test two actors, exact replay, mismatched replay, revocation and immutable lineage.
- [ ] Add scoped HTTP endpoints and review panel; verify actual UI state, dirty navigation preservation and accessible errors using official Svelte MCP and built-App journeys.
- [ ] Add authenticated adapter completion/private byte verification and journal/recovery; test hashes, duplicates, out-of-order completion and restart.
- [ ] Independently review exact combined head, run all five CI gates and actual native artifact acceptance. Update issue with evidence and close only when every criterion is met.
