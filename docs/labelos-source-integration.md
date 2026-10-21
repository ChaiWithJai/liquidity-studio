# LabelOS sandbox source intake

Owner-authorized source: https://api-sandbox.labelos.com/docs. Connection belongs to the **private Defiant organization**, never the public synthetic demo.

## Implemented source boundary

Authenticated GET `/api/studio/defiant-data/{organizationId}/labelos/{resource}`:

- `capabilities`, `coverage`
- `catalog/artists`, `catalog/releases`, `catalog/tracks`, `catalog/stores`, `catalog/countries`
- `analytics/summary`, `analytics/timeseries`, and the ten advertised analytics breakdowns

The existing Studio session and current organization/strategy membership are checked before the provider is resolved and again before results return. The server-only provider binds one explicit organization; another organization cannot select that credential. The route is default-off. No source data is mounted on the anonymous demo MCP endpoint.

Server configuration: `STUDIO_LABELOS_ORGANIZATION_ID` plus `STUDIO_LABELOS_API_KEY`, supplied through private runtime configuration/secret binding, never committed. Do not change the public demo's access model or add this source key to client code. A constructor-injected `defiantSourceProvider` supports controlled integration without environment configuration.

Fixed HTTPS upstream; GET-only; redirects forbidden; bounded response and timeout; page size <=200 catalog / <=500 analytics; repeated and unknown query arguments rejected. Daily time series does not support `limit`, `cursor` or `sort`, despite those fields appearing in generated OpenAPI. Source 422 means an unsupported query combination, not zero data. Source quotas remain explicit; there are no automatic polling/retry jobs.

Results retain original provider IDs, units, periods and pagination and add `source.id=labelos`, `environment=sandbox`, `provenance=provider-reported`, capture time and organization scope. This is a source lane in the unified API. It does not invent artist-ID joins from names or convert sandbox observations into approved real-world performance. The existing synthetic-only monthly domain model is not silently reused for this source.

## Actual discovery

Observed coverage: 2025-01-02 through 2026-10-19. API capabilities report24metrics,10breakdowns and EUR currency. No rights or royalty-statement endpoint is exposed in the supplied contract. Do not create fictional royalty rates, allocations or rights from analytics quantities. Metric support varies by breakdown; the backup discovers each supported combination by removing only explicitly rejected metrics from a bounded request.

## Backup

`scripts/backup-labelos.py --key-file /absolute/private/key --output /absolute/private/backup`

Creates an owner-only directory containing exact raw JSON, timestamped GET/query receipts, per-file SHA256, coverage/capabilities, paging counts and a completion ledger. Can resume using already captured successful URLs and checksums. Preserves unsupported-query error responses as evidence. Stops on unexpected errors or a request budget; incomplete exports are labelled incomplete. It is an API export over a capture interval, **not an atomic provider database backup**. Scope is full catalog pagination, unfiltered period summaries/breakdowns for supported metric combinations, and the global daily series. It does not exhaustively export every filtered track × country × date combination from the underlying provider fact store. Some breakdowns require an explicit sort metric; validation errors are retained and used to choose a supported query, not treated as missing data. It currently stops rather than truncates coverage that requires24-month window splitting. Credentials and source payloads stay outside the repository.

## Verification and rollout

- Actual provider discovery and backup are operational API reads; no model calls, local builds or dependency installation.
- `labelos-source.test.js` contains boundary, scope, secret-redaction and provider-error contracts for hosted CI.
- Release requires exact-head hosted validation plus private secret/org configuration and authenticated API acceptance. No shared deployment is changed from the side conversation. The parent source branch/runtime is preserved.
- Next domain-tool work: map provider catalog identifiers and capability-specific analytics into typed domain operations, preserving date/territory/platform grain. Country analytics must not be presented as US-state/New Jersey demand. Add rights and statement providers separately when available.

## Catalog join audit

The captured catalog contains2,566distinctartistIDs,2,233distinctreleaseIDs and8,001distincttrackIDs, with alltrack release references present. Only5,264track artist strings have an exact unique catalog-name candidate;2,737do not. Names are not authoritative IDs. Preserve native identifiers and source labels; do not silently turn these candidates into verified artist joins. Full catalog/analytics reconciliation remains separate from a successful transport connection.

## Observed time-series grain and export gap

A full-coverage time-series call returned94points with `meta.interval=week`. A19-day October query returned19points with `interval=day`. The exporter now captures calendar-month windows and verifies daily grain for each, retaining the original long-range response too. Missing observations are not interpolated.

Full-coverage playlist analytics timed out on two60-second attempts, and a streams-only attempt also timed out at40seconds. This establishes an unavailable export from this client, not a provider root cause or an empty dataset. `--skip-breakdown playlists` is an explicit operational opt-out to collect other resources; the manifest remains incomplete and names the gap. No timeout is turned into a successful empty response.

## Large-query recovery and observed source guards

The provider returned HTTP413 / `query_too_large` with a10,000scan-row guard while paginating a full-period playlist query. Large multi-metric song queries also returned HTTP504. These are preserved as distinct413/504 responses by the private source API; they are not authentication failures or zero data.

The exporter supports `--analytics-page-size 50` to reduce query work. It reuses explicit unsupported-metric responses from the same capture rather than repeating those probes. Smaller playlist pages and an October1–19/streams query returned data; this does not establish a complete playlist backfill. Narrower windows or a provider bulk extract may be required for complete analytics coverage.
