# 001: One canonical Svelte frontend

**Status:** Implemented; recorded from current code on 2026-10-18.

**Context:** Early module proposals describe a generated UI beside a second Svelte implementation. Treating both as authoritative makes browser evidence and deployed assets ambiguous.

**Decision:** Svelte source is canonical. Local developer profiles serve it through Vite. The existing build creates the deployment distribution. A manual hosted artifact workflow can build an immutable source SHA before the final required checks.

**Alternatives/trade-offs:** Maintaining a second generated implementation would duplicate behavior. Building every candidate locally would consume the constrained development machine. Hosted assembly adds artifact provenance and a retrieval step.

**Consequences:** A source-only UI change still needs matching canonical assets before deployment. Exact source and build recipe identities remain distinct. Manual artifact creation does not skip final required checks or establish actual customer usability.

**Evidence:** [build script](../../liquidity-studio/scripts/build-dist.js), [manual workflow](../../.github/workflows/canonical-frontend-artifact.yml), [PR200](https://github.com/ChaiWithJai/liquidity-studio/pull/200), [PR201](https://github.com/ChaiWithJai/liquidity-studio/pull/201), [assembly instructions](../development/hosted-frontend-artifact.md).
