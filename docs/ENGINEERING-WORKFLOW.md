# Engineering workflow

Use GitHub #12 for the queue, #18 for organization/brand architecture, #19 for local Docker then GCP. Read current issue comments and open PRs before starting work. Use an isolated codex/ branch and worktree per issue. Keep port3000 intact; verify changes on isolated ports/containers.

For this sprint we used Addy Osmani's agent-skills at commit aeac41d4d005999432bb7312f7ff06383a91d59d: https://github.com/addyosmani/agent-skills/tree/aeac41d4d005999432bb7312f7ff06383a91d59d . Load the relevant SKILL.md directly from a full clone so its shared reference paths resolve. Start with using-agent-skills, then spec-driven-development for architecture, ci-cd-and-automation for container/CI changes and code-review-and-quality before merge. The skills remain their upstream author's work; no third-party skill files are vendored here.

The capability map was founder-approved. New module specs remain proposed until human review; do not silently turn a planning ticket into cloud provisioning or billing activation. Existing bug/container work may continue against its approved issue acceptance criteria.

Use official Svelte MCP for documentation and autofixer whenever editing Svelte; re-run the autofixer after correction. Verify the UI actually served by Node, since the legacy generator and Svelte source are separate. Use BrowserOS neo for operator journeys and screenshots, and the user's visual tools when a diagram clarifies a decision. Structural QA scores are not browser evidence or factual validation.

Before merge: meaningful regression coverage, all CI steps green, no unresolved blocking review, independent agent evidence, docs and rollback limits. Public review comments use the owner's GitHub identity; label agent evidence accurately rather than representing it as independent human approval. Partial issue acceptance stays open.

Never publish credentials, local runtime state, raw conversation attachments or private archives. Record verified CLI facts separately from proposed resources. Do not select a license, charge customers, or deploy an unauthenticated prototype based on a plan alone.
