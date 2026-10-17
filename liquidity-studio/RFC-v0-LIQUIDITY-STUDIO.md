# RFC-v0: "Liquidity Studio" — Pomelli-Class Multi-Format Content Engine on GCP

**Status:** Approved for v0 Ship  
**Architecture Pattern:** Hexagonal (Ports & Adapters) with Constructor Dependency Injection  
**Primary Runtime:** Single Docker Container on GCP Cloud Run + Vertex AI / Gemini + Multi-Federation AI Gateway  

---

## 1. Executive Summary & Core Jobs-To-Be-Done (JTBD)

Traditional female-targeted media over-indexes on consumer lifestyle ("what she bought") while ignoring enterprise mechanics ("what she owns"). **Liquidity Studio** is an internal creative and operational engine built around three non-negotiable v0 Jobs-To-Be-Done (JTBD):

1. **JTBD #1 — Weekly Batch Producing Content Drafts (`BatchProductionService`)**: Automatically ingest weekly cultural-financial stories and pre-generate draft campaign packs via scheduled batch jobs without human prompting.
2. **JTBD #2 — Formatting for Multi-Format Posting (`MultiFormatFormatterService`)**: Turn any backlog story into four cohesive, brand-styled social formats ready to post:
   - **Infographic (1080×1350 / 4:5)** — Pinned financial breakdown card
   - **Carousel (4-Slide Swipe Deck / 4:5)** — Narrative breakdown + visual notes
   - **Instagram Story (1080×1920 / 9:16)** — Vertical highlight + interactive poll sticker
   - **Reel Storyboard & Script (9:16 Video)** — 0–3s spoken dollar hook + timecoded VO/B-roll beats
3. **JTBD #3 — Curating & Managing a Content Calendar / Backlog (`BacklogCalendarService`)**: Give the marketing operator a zero-jargon, Google Labs Pomelli-inspired workspace to review the weekly backlog, drag/assign stories across the Monday–Sunday publishing calendar, tweak copy, and export.

Meanwhile, **all MLOps, silent evaluations, AI gateway switching, and implicit human preference collection for future offline backpropagation** are strictly isolated in a separate **Founder Admin Console (`AdminObservabilityService`)**.

---

## 2. Off-The-Shelf GCP Architecture (Zero-DevOps Overhead)

We use managed, serverless GCP primitives so there are zero Kubernetes clusters, zero custom CV servers, and zero idle compute costs:

| Layer | Off-The-Shelf GCP Service | Why This Tool for v0 | Multi-Federation / Portable Escape Hatch |
| :--- | :--- | :--- | :--- |
| **App & API Hosting** | **Cloud Run** (Single `Dockerfile`) | Deploys Svelte static UI + Node.js DI API in 1 container; scales to $0 when idle. | Standard OCI Docker image runs on AWS App Runner, Fly.io, Railway, or K8s. |
| **Weekly Batch Cron** | **Cloud Scheduler** | Triggers `POST /api/admin/run-weekly-batch` every Monday at 09:00 UTC via OIDC auth. | Standard HTTP webhook trigger (works with GitHub Actions cron or Temporal). |
| **LLM & Multimodal Generation** | **Vertex AI / Gemini API** (`gemini-3.8-flash` / `gemini-2.5-pro`) | Native structured JSON output (`responseSchema`) generates all 4 formats in one call. | Swappable at runtime via `AIProviderPort` to LiteLLM, Cloudflare AI Gateway, or OpenRouter. |
| **Backlog & Calendar State** | **Cloud Firestore** (Native Mode) | Serverless document store for `BrandProfile`, `BacklogStories`, and `CalendarSlots`. | Abstracted behind `BacklogCalendarRepositoryPort` (swap to Postgres/Supabase in 1 file). |
| **Asset & Export Storage** | **Google Cloud Storage (GCS)** | Stores exported PNG carousels, brand logos, and JSONL backprop snapshots. | S3-compatible object storage adapter. |
| **Observability & Backprop Sink** | **Cloud Logging → BigQuery Sink** | Automatically streams structured JSON traces and human preference pairs into BigQuery for offline DPO/backprop jobs. | Exportable directly as `.jsonl` via `GET /api/admin/backprop-jsonl`. |

---

## 3. Dependency Inversion & Dependency Injection Design

To prevent vendor lock-in and keep business logic 100% testable, `server/ports.js` and `server/container.js` enforce **Dependency Inversion**:

```
                     ┌──────────────────────────────────────────────┐
                     │          Svelte UI & HTTP Controllers        │
                     │    (/api/studio/*  and  /api/admin/*)        │
                     └──────────────────────┬───────────────────────┘
                                            │ Calls
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          Core JTBD Use-Case Services         │
                     │  • BatchProductionService                    │
                     │  • MultiFormatFormatterService               │
                     │  • BacklogCalendarService                    │
                     │  • AdminObservabilityService                 │
                     └──────┬───────────────┬────────────────┬──────┘
                            │ Depends on    │ Depends on     │ Depends on
                            ▼ (Port)        ▼ (Port)         ▼ (Port)
               ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
               │  AIProviderPort  │ │  RepositoryPort  │ │ TelemetrySinkPort│
               └────────▲─────────┘ └────────▲─────────┘ └────────▲─────────┘
                        │ Implements         │ Implements         │ Implements
               ┌────────┴─────────┐ ┌────────┴─────────┐ ┌────────┴─────────┐
               │   AIGateway      │ │ GCPFirestore /   │ │ Observability    │
               │ (Vertex/Gemini / │ │ InMemory Adapter │ │ Engine (Silent   │
               │  OpenAI Gateway) │ │                  │ │ Eval + Backprop) │
               └──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 4. Complete Screen Plan & User Journey (v0)

### Surface 1: The Marketing Operator Journey (Pomelli Benchmark UI)
* **Screen M1 — `Brand Overview` (Pomelli Bento Grid)**:
  * Displays Brand Name, URL, Tagline (*"They cover the lifestyle. We follow the liquidity."*), Logo uploader, Typography preview (`Aa Instrument Serif`, `Aa Mona Sans`), and 4 circular Brand Color Swatches.
* **Screen M2 — `Weekly Content Backlog`**:
  * Shows incoming stories from the weekly batch job with trend badges (`🔥 +340% Weekly Search Spike`), verified financial facts, quick-add bar for social listener finds, and a 1-click `Create Campaign →` button.
* **Screen M3 — `Content Calendar (Mon–Sun)`**:
  * Visual weekly schedule organizing stories by day (`Monday` through `Sunday`) and workflow status (`In Backlog` → `Draft Ready` → `Scheduled` → `Exported`), allowing the marketer to balance content pillars across the week.
* **Screen M4 — `Multi-Format Exporter` + `Liquidity Studio Agent` Sidebar**:
  * Instant tab switching across **📊 Infographic (4:5)**, **🗂️ Carousel Deck (4 Slides)**, **📱 IG Story (9:16 with Poll Sticker)**, and **🎬 Reel Script & Storyboard (0–3s hook + timecoded beats)**, with 1-click export buttons and conversational co-pilot pills on the right.

### Surface 2: The Founder / Admin Journey (`/admin` Toggle)
* **Screen A1 — `DI Container & AI Gateway Switchboard`**:
  * Displays active injected adapters (`AIProviderPort`, `RepositoryPort`, `TelemetrySinkPort`) and allows live switching between GCP Vertex/Gemini and any OpenAI-compatible AI Gateway.
* **Screen A2 — `Weekly Batch & Silent Eval Trace Monitor`**:
  * Triggers weekly batch jobs on demand, tracks generation latency, and displays the silent 3-check rubric (`hasHardNumbers`, `hasOwnershipAngle`, `conciseHook`) per format.
* **Screen A3 — `Backpropagation Preference Dataset Log & JSONL Export`**:
  * Logs every implicit human signal (`queued_to_backlog`, `scheduled_*`, `exported_to_social`) paired with the model output so a downstream offline batch job can fine-tune or optimize prompts.
