# Studio earnings and receipts explorer

Status: authorized implementation under the real-data medallion and evidence-serving goal. No private provider configuration or deployment is included.

## User outcome

Inside the existing Defiant workspace, open Earnings & receipts, understand current evidence coverage, inspect monthly reported earnings or source identity review groups, then navigate to source selections and original cells. Keep the same revision throughout a journey. Source cells are escaped text with a selected-field highlight and an exact logical-record locator; this is not a screenshot of an original worksheet.

## Existing host and interfaces

App's organization/session-bound scopedRequest supplies a separate evidenceRequest closure to DefiantWorkspace. Add one finite evidence view and a DefiantEvidenceExplorer component using existing ResearchToolbar/ResearchInspector chrome. The workspace remains strategy-authorized. The explorer reads the existing evidence HTTP resources only; no anonymous synthetic endpoint, model call, mutation, credentials, object URL or raw source path is accepted.

URL state contains finite mode (earnings/identity/selections), current revision, opaque group/selection/receipt IDs, and bounded page offset. No source cells or customer labels go into URLs. Organization/session changes remount through the existing host key. Async request epochs prevent stale results from replacing newer navigation. Every detail request includes the pinned revision. A conflict clears evidence and requires explicit refresh; forbidden/unauthenticated responses clear evidence. An unavailable provider has a truthful empty state and no demo fallback.

## Verification

Author meaningful hosted-only controller, URL and rendered browser contracts covering both drilldown paths, stale requests, revision conflicts, denied access, source-text escaping, field selection, pagination and compact layout. Use official Svelte MCP source review. No local builds/install/test suites/models. Independent source review and exact-head green hosted CI precede merge. Private runtime acceptance still requires verified organization ownership, scoped immutable artifact pins, authenticated provider configuration, actual source readback and BrowserOS Neo user journey.

All source selections are independently browsable, including unresolved identities. Example receipts are labeled as individual examples, not proof of monthly totals. Selection navigation drops identity-group context; mixed group and selection URLs are rejected rather than implying an unverified relationship. Refresh retries even at an unchanged root URL.
