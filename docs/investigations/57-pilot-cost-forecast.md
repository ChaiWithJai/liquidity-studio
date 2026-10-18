# NYC pilot deployment and exit cost forecast

Dated 2026-10-18. USD on-demand estimates, 30-day workload / 730-hour infrastructure month, before tax, credits, negotiated discounts and operator labor. This is a forecast, not a bill, quote or spending cap. Pricing was read through BrowserOS neo; configuration through read-only gcloud. No resources changed or model calls made.

## Existing chosen system

Read-only Cloud Run service configuration captured on 2026-10-18: us-east4, 1 vCPU, 512MiB, concurrency 8, instance max 1, service max 1, min 0; Firestore named database `liquidity-studio-pilot`; private GCS artifacts; Google authentication. Cloud Tasks queue: 1 dispatch/second, 1 concurrent, 3 attempts, retry window 600s, 10–60s backoff. Vertex uses US multi-region (not NYC-only inference), `gemini-3.5-flash-lite`, 32,768-byte input ceiling, 4,096 output-token ceiling, global and scoped 20 daily generation reservations. Exact byte limits are not token counts or a dollar cap. Source preparation is bounded HTTPS/extractive and makes zero paid model calls.

This Studio-owned design needs neither Cloud SQL nor Redis. No external Penpot server is included in the current production forecast. The held native editor binary is not assumed cleared for public distribution.

## Monthly workload assumptions

Two operators, two brands; 600 successful model generations (20/day), average 6,000 input / 1,500 billed output tokens each; 100,000 HTTP requests and 10 active allocated Cloud Run hours; 300,000 Firestore document reads, 60,000 writes; 1GiB live database; 10GiB live asset objects +10GiB retained backup/soft-delete equivalents; 20,000 GCS writes and 100,000 reads; 10GiB internet delivery. Up to 10,000 billable task operations including enqueue/delivery/retry. Those are scenario inputs, not measured usage. Image exports and portable packs increase asset retention; each 48MiB pack downloaded 20 times adds about 0.94GiB of delivery before encoding overhead. Retries, cold starts, polling, growing whole-scope records and revisions must be measured.

| Component | Gross arithmetic / allowance | Monthly scenario |
| --- | --- | --- |
| Cloud Run request-based active compute | 36,000s ×(1×$0.000024 +0.5×$0.0000025) | $0.91 |
| Cloud Run requests | 0.1 million ×$0.40/million | $0.04 |
| Vertex standard non-global text | 600×(6,000×$0.33 +1,500×$2.75)/million | $3.66 |
| Firestore named DB operations | 300k×$0.033/100k +60k×$0.099/100k | $0.1584 |
| Database and backup/PITR storage | explicit planning allowance; retention/backup schedule not newly enabled | $1–3 |
| GCS Standard us-east4 | 20GiB×$0.023 | $0.46 |
| GCS operations | allowance for writes/metadata/read validation, not a verified request trace | $0.25–1 |
| Internet delivery | conservative $0.20/GiB planning allowance ×10GiB; actual proxy path/SKU/free allowances vary | $2 |
| Tasks | first account-wide million operations free; gross at $0.40/million for 10k | $0–0.004 |
| Registry/build retention, logs, scheduler and authentication | allowance; two users do not imply all adjacent services are free | $2–5 |
| Total | scenario, before free-tier offsets | approximately $10–17/month |

Cloud Run's account-wide free allowances may lower compute/request charges. The named Firestore database must NOT inherit the free quota displayed for the project's free/default database. Firestore was explicitly selected to Northern Virginia and Monthly: reads $0.033/100k, writes $0.099/100k, backup $0.033/GiB-month and PITR $0.165/GiB-month; backup/PITR are priced possibilities, not claimed enabled features. GCS was explicitly selected to Northern Virginia and Monthly: $0.023/GiB-month. No GCS free storage is assumed for Virginia. Existing recorded official Virginia Catalog evidence agrees.

The current model price page differentiates global ($0.30 input/$2.50 output per million) and non-global ($0.33/$2.75). Use the non-global row conservatively for selected `us` until billed SKU confirms classification. Output includes billed response and reasoning. Average token assumptions cost $3.66; 600 calls at 32,768 input tokens (illustrative, NOT derived from the byte cap) and 4,096 output tokens cost about $13.24. Duplicate provider attempts and other project users can increase this; paid grounding, image/video/audio generation are excluded and must not silently enter this forecast.

Startup CPU boost is enabled and no explicit CPU-throttling override was present. The 10-hour arithmetic excludes separate cold-start/startup-boost overhead; allow additional compute charges rather than treating it as an exact invoice.

At 100 active Run hours, gross compute rises to $9.09; at 730 active hours it is $66.36 for this request-based allocation, before network/storage/model. Max one instance limits parallelism, not cumulative monthly spend. Public static requests, a stuck worker, retries or excessive polling can keep it active.

## Local Compose / VM alternative

On an existing Mac, Studio Compose + SQLite + local immutable assets has no new GCP compute/database bill. It still costs electricity, disk, hardware replacement, off-machine backup, internet and patch/restore labor; remote Vertex calls still cost the same. Example energy assumption: incremental 30W continuously =21.9kWh/month; multiply the owner's actual tariff (at an assumed $0.25/kWh, $5.48). This is an assumption, not a measured power reading. Existing OOM/disk recovery incidents make zero-cost/no-operations claims false.

A Virginia GCE Compose VM quote was read from the official general-purpose page after selecting Northern Virginia:

| Hypothetical VM | On-demand rate | 730-hour compute only |
| --- | --- | --- |
| e2-standard-2, 2vCPU/8GiB | $0.07547082/hour | $55.09 |
| e2-standard-4, 4vCPU/16GiB | $0.15094164/hour | $110.19 |

Add explicit $10–20/month planning allowance for persistent disk, snapshots, external IPv4 and small internet transfer, plus model costs and labor. Thus Studio-only 8GiB VM planning range is roughly $69–89 including the above token scenarios; not a proven sizing recommendation. The listed 4-vCPU/16GiB e2-standard-4 starts above $100 in compute; this does not apply to every 16GiB shape. The later [single-VM audit](57-native-single-vm-pathway.md) verifies 2-vCPU/16GiB e2-highmem-2 at $74.32 compute and compares explicit all-in scenarios. These are single-failure-domain self-managed deployments: OS/Docker, TLS/proxy, SQLite backup consistency, restore drills and monitoring belong to the operator. No VM or migration is proposed here.

A full external Penpot Compose stack additionally runs JVM backend, frontend/export browser, Postgres and Valkey; Doory's full external Django stack adds its own services. Local native experiments are not capacity measurements for concurrent founder/marketer production. The 16GiB machine reference is a cost sensitivity, not an assertion that it is sufficient. Managed external Postgres + Redis has a separate floor: the existing dated Virginia Catalog records dedicated 2vCPU/8GiB SQL $108.33, 1GiB Redis $35.77 and 20GiB SQL storage $3.64, totaling $147.74/month BEFORE editor compute, existing Studio, model, egress or backups. Shared-core SQL micro arithmetic is cheaper but not validated fit/SLA. Do not charge these hypothetical services to the current chosen Studio-owned design.

## Budget and ejection implications

The approved $100 monthly project budget and service alerts notify; they do not stop usage or guarantee a hard cap. Keep reservations, task attempts, input/output bounds, maximum instances and public capability flags independent from alerts. Existing controls do not bound all project services or immutable-history growth. Review billing daily during rollout, retained artifacts/pack sizes weekly, and perform a real restore before deleting any original. A portable download is a durable data-exit artifact, not proof that an external host needs no paid storage or licensed fonts/models.

No new backup schedule or retention deletion is implied. Budget a bounded retention policy only after current original/derivative/final-export and source-evidence preservation requirements are reconciled. Account for GCS soft-deleted/versioned bytes and Firestore backup/PITR separately; use actual exported-byte and operation measurements to replace allowances.

## Primary sources and audit trail

All pricing pages read through Neo on 2026-10-18; own research pages 114 (Run), 119 (Compute, reused from Tasks), 120 (Storage), 121 (Vertex), 122 (Firestore). These IDs are ephemeral, not confidence scores.

- [Cloud Run pricing](https://cloud.google.com/run/pricing) — request-based active CPU/memory and instance-based distinctions; no idle-instance floor assumed for min0.
- [Vertex model pricing](https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing) — Gemini3.5 Flash-Lite standard global/non-global rows and token units.
- [Firestore pricing](https://cloud.google.com/firestore/pricing) — Northern Virginia selected explicitly; named-database free quota exclusion.
- [Cloud Storage pricing](https://cloud.google.com/storage/pricing) — Northern Virginia Monthly Standard selected explicitly; $0.023/GiB-month.
- [Cloud Tasks pricing](https://cloud.google.com/tasks/pricing) — first million account-wide operations free, then $0.40/million; operations are not merely successful jobs.
- [Compute general-purpose pricing](https://cloud.google.com/products/compute/pricing/general-purpose) — E2 standard table, Northern Virginia selected explicitly, default on-demand column.
- Existing repository `docs/investigations/39-virginia-price-evidence.json` — official Billing Catalog service/SKU/effective-time evidence, 2026-10-18.

Only the allowlisted allocation/model/quota configuration is published here; the raw Run environment is not included. This forecast is not cloud performance proof or an infrastructure-change request.
