# Vertex pilot routing and request limits

The pilot deployer keeps Cloud Run, the named Firestore database, GCS and Artifact Registry in `us-east4`. Model routing is configured independently: set `PILOT_AI_LOCATION=us`. The deployer defaults to and accepts only this selected US multi-region for the pilot, sets `GOOGLE_CLOUD_LOCATION=us`, and explicitly selects `AI_MODEL=gemini-3.5-flash-lite`. A New York deployment preference does not imply that this model is available from a single `us-east4` inference endpoint.

The gateway uses these official endpoint hosts while preserving the location in the OpenAI-compatible request path:

| AI location | Host |
| --- | --- |
| `us` | `aiplatform.us.rep.googleapis.com` |
| `eu` | `aiplatform.eu.rep.googleapis.com` |
| `global` | `aiplatform.googleapis.com` |
| A supported standard region | `<location>-aiplatform.googleapis.com` |

An endpoint mapping is not a model-availability check. Confirm the selected model's published location availability before changing it. The generic gateway supports all mappings above; the pilot deployment chooses US. Official references checked 2026-10-17: [multi-region endpoints](https://docs.cloud.google.com/gemini-enterprise-agent-platform/resources/locations#multi-region_endpoints) and [Gemini 3.5 Flash-Lite](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash-lite). The model supports structured/chat output and defaults to minimal thinking. No extra OpenAI `reasoning_effort` parameter is sent because its precise supported mapping has not been established here. The model documentation says custom temperature values are ignored.

The deployer fixes `AI_MAX_INPUT_BYTES=32768` and `AI_MAX_OUTPUT_TOKENS=4096`. Before credential resolution, metadata lookup, provider I/O or synthetic fallback, the gateway measures UTF-8 bytes of JSON serialization of the system instruction, user prompt and response schema together. Oversize input fails with HTTP 413 and `PROVIDER_INPUT_TOO_LARGE`, retaining a redacted error trace and measured byte counts. This is a conservative input-envelope measurement, not provider token accounting; it includes schema metadata even when an adapter does not transmit that schema. It does not truncate approved claims. Integrity/source/clinical-review checks remain required for accepted requests.

The input byte policy is server environment configuration, not a brand-editable knob. Its default is 32768 bytes; explicit operator values must be integer 128–262144. The output policy uses a server environment ceiling; brand configuration cannot exceed it. Outside the pilot its default ceiling is 8192, with a default request of 4096; the pilot explicitly restricts both to 4096. Existing out-of-policy brand overrides must be reviewed before rollout. A token limit does not guarantee response completeness: truncated or unsupported output still fails validation.

The pilot explicitly sets both generation counters to 20: `STUDIO_GLOBAL_DAILY_GENERATION_LIMIT` aggregates all organizations/brands sharing the backing installation, and `STUDIO_DAILY_GENERATION_LIMIT` applies per organization. Both use UTC calendar days. Failed, synthetic, rejected-input and ambiguous/crashed attempts consume reservations; slots are not refunded. Global and organization reservations are separate transactions, so an organization-limit rejection can conservatively consume a global slot. Separate SQLite files or Firestore databases/collections have independent counters. These attempt/input/output bounds reduce exposure; they do not establish a hard USD100 monthly cap across provider tokens, independent installations, storage, logging or other resources. Budget alerts do not stop spend, and eligible service caps have enforcement latency.

Validation uses intercepted transport only: US/EU/global/regional endpoint paths, OAuth headers, output limits, multibyte/combined oversized input rejected before any credential or provider call, server policy enforcement, aggregate organization/brand attempt scope, and captured deployment configuration with storage/Run still `us-east4`. No paid inference was made for this change. The root operator must verify actual provider access and structured output from a newly built reviewed image before Cloud Run promotion.

The regional-only Vertex URL construction first appears in repository commit `f500237`; the initial deployment coupling of `GOOGLE_CLOUD_LOCATION` to the app/storage region appears in `401ca78`. This fix changes routing and limits without a data migration. Rollback restores prior source/config but would also restore the known unsupported current-model regional routing; keep traffic off that configuration and retain the existing data volume and backups.
