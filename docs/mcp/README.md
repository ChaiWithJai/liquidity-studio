# Connect an agent to Defiant OS evidence

Use Defiant OS MCP to ask what retained royalty statements show and inspect the original evidence. Royalty Evidence Review combines existing checked selections, comparisons and coverage. You do not need to run Studio, copy a private dataset or connect to GCS.

## Choose a connection

| Client | Connection | Authorization |
| --- | --- | --- |
| Dev's coding agent with stdio MCP support | The checked-in evidence bridge described below | Dev pairs a separate read-only grant in Studio. |
| Ordinary ChatGPT with the existing approved Defiant OS app | Streamable HTTP at `https://studio.chaiwithjai.com/mcp/defiant-evidence` | Studio sign-in and OAuth approval for `evidence:read`. |

The remote OAuth service accepts configured clients and exact callbacks. A generic coding agent is not automatically an approved remote client. Use the stdio bridge unless the operator has explicitly configured that client's remote registration. A repository file alone does not install an MCP server in an agent host.

## Set up the stdio bridge

You need Node.js 22 or later, a current checkout of this repository, and your own Google sign-in with membership in the intended Studio organization. The grant files require a POSIX filesystem with owner permissions. The client rejects symlinks, shared directories and unsupported ownership checks.

1. Obtain the organization ID from the organization you are authorized to use in Studio. Ask its administrator for membership if needed. Do not copy another person's grant.
2. Create a private directory outside the repository. For example:

   ```sh
   mkdir -p "$HOME/.config/defiant-evidence"
   chmod 700 "$HOME/.config/defiant-evidence"
   ```

3. Save `config.json` in that directory with these fields. Replace both placeholders with your own values. `credentialFile` must be an absolute path inside an existing directory with mode `700`; the credential file must not exist before first pairing.

   ```json
   {
     "version": 1,
     "organizationId": "YOUR_ORGANIZATION_ID",
     "origin": "https://studio.chaiwithjai.com",
     "credentialFile": "/absolute/private/directory/grant.json"
   }
   ```

   ```sh
   chmod 600 "$HOME/.config/defiant-evidence/config.json"
   ```

4. From the repository root, start explicit pairing using the shipped bundle. No package installation or build is needed for this bundle.

   ```sh
   node liquidity-studio/dist/mcp/defiant-evidence-stdio.mjs --pair "$HOME/.config/defiant-evidence/config.json"
   ```

   Keep the command running. Open the printed Studio URL, sign in, and expand **Local evidence clients**. Enter the printed pairing code, inspect the organization and read-only access, and approve. Complete this within the displayed pairing window. The client writes its own scoped grant to the configured private file. It does not export your Google credentials.

5. Add a stdio MCP server to your agent host. Use absolute paths because the host may start it from a different working directory. This is the common `mcpServers` JSON shape; use your host's equivalent settings if its format differs.

   ```json
   {
     "mcpServers": {
       "defiant-evidence": {
         "command": "node",
         "args": [
           "/absolute/repository/liquidity-studio/dist/mcp/defiant-evidence-stdio.mjs",
           "/absolute/private/directory/config.json"
         ]
       }
     }
   }
   ```

   Do not put `--pair` in the host configuration. Pairing is an explicit setup step, not server startup.

6. Enable or refresh the server in the host and discover its tools. Ask it to call `defiant_evidence_manifest`. Confirm that the returned organization is the one you approved. Never paste the grant file into a chat to diagnose a connection.

Read [the repository agent instructions](../../AGENTS.md) before querying private evidence.

## First useful request

> Use Defiant OS evidence to review an available royalty period. Discover the available selections first. Explain what the reported amount covers and what is missing, then show one original receipt. Use the current revision and keep the answer within the returned evidence.

The agent should follow this sequence:

1. Call `defiant_evidence_manifest` for authorized scope and the current revision.
2. Discover a selection with `defiant_list_evidence_selections`, or a comparison with `defiant_list_change_comparisons`. Use `defiant_store_period_coverage` for available store-specific comparison context. Read the host's discovered input schemas rather than guessing arguments.
3. Call `defiant_royalty_evidence_review` with that revision and exactly one discovered `selectionId` or `comparisonId`. `storeCoverageId` is optional and applies only to comparison mode. Local stdio tools require `organizationId`.
4. Follow a returned receipt reference. Use `defiant_read_selection_receipts` for selection cells, `defiant_read_comparison_examples` for comparison examples, or `defiant_show_receipt` for an actual returned receipt ID. Preserve the source locator, source hash and revision in your explanation.
5. Distinguish the selected amount from whole-period totals. Explain missing coverage without turning an absent observation into zero. One example receipt does not prove every record in an aggregate.

For keyword source discovery use `defiant_search_retained_sources` in keyword mode. `defiant_source_evidence` connects a registered source hash to served references; use its returned kind navigation to reach receipts without walking unrelated comparison pages. Semantic search is a separate embedding operation. Start it only when the user explicitly requests it and the configured route is approved. Reuse its returned session for pagination and the same idempotency key and arguments after an uncertain start. Do not start a replacement search to retrieve another page.

## Connection lifetime and recovery

The local grant lasts up to eight hours. Access credentials renew on demand within that fixed window; renewal does not extend it. Revoke a local client through **Local evidence clients** in Studio. ChatGPT OAuth connections are managed separately under remote client access.

| Symptom | Next step |
| --- | --- |
| The review tool is absent | Update to the current reviewed checkout and refresh the host's tool inventory. ChatGPT may need **Refresh tools** in the existing app settings. |
| Access is expired or revoked | Stop reads. Revoke or retain the prior grant deliberately before explicit re-pairing. Do not overwrite a live grant. |
| A revision is stale | Read the manifest again and rediscover the affected IDs. Do not combine different revisions in one result. |
| The client reports a private-file error | Check absolute paths, file ownership, directory mode `700` and config/grant mode `600`. Do not print credential contents. |
| A renewal lock remains after an uncertain request | Stop and ask the operator to resolve it. Do not delete the lock or replay the renewal automatically. |
| A product or receipt is unavailable | State that exact limitation. Do not replace it with synthetic data or claim the entire period is missing. |

## Known data limits

Missing provider completeness and settlement evidence limits explanations of reported changes. Compatible units and adjustment linkage are needed for complete attribution. An approved crosswalk is needed to combine uncertain recording identities. Rights, consent and commercial inputs are needed for activation.

These are known limits in [#374](https://github.com/ChaiWithJai/liquidity-studio/issues/374), with fuller inputs estimated two to three months from 24 October 2026. That estimate is not a delivery promise. Supported factual reviews can proceed with current golden data.

## Source contracts

- [Royalty Evidence Review](../../liquidity-studio/docs/specs/royalty-evidence-review.md)
- [Local client pairing and renewal](../specs/defiant-local-evidence-client.md)
- [Local grant authority](../specs/defiant-local-evidence-grants.md)
- [Remote OAuth design](../specs/defiant-chatgpt-evidence-oauth.md). This is a dated implementation specification; current connection instructions are above.

These instructions were checked against the merged source from PR #375. Documentation work did not perform a new pairing, private-data query, embedding or classifier run.
