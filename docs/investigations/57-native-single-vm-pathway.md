# Native editor single-VM cost pathway

Dated 2026-10-18, for #57. USD on-demand prices, 730-hour infrastructure month, before tax, credits, free-tier offsets, discounts and operator labor. This is a source and read-only configuration audit, not a capacity benchmark, purchase quote, infrastructure approval or spending cap. No resources, authentication sessions or application state changed; no local tests, load, models, renders or builds ran.

## Corrected machine comparison

An initial unpublished review incorrectly generalized the **4-vCPU/16GiB e2-standard-4** compute price to every 16GiB option. That conclusion is withdrawn. The original private audit and correction receipt remain retained unchanged; the earlier committed [forecast](57-pilot-cost-forecast.md) is qualified with this correction.

Google's [machine table](https://docs.cloud.google.com/compute/docs/general-purpose-machines#e2-high-mem) lists **e2-highmem-2: 2 vCPU and 16GiB**. Its [region table](https://docs.cloud.google.com/compute/docs/regions-zones) lists E2 in all three us-east4 zones. These establish documented series support, not current project quota or available stock. [VM pricing](https://cloud.google.com/products/compute/pricing) bills predefined vCPU and memory separately.

A fresh official Billing Catalog read completed seven pages. The [sanitized regional receipt](57-vm-price-evidence.json) records ordinary Virginia E2 core at $0.02456745/core-hour and RAM at $0.00329199/GiB-hour, effective 2026-10-18T07:00:00Z. No custom, shared-core, Spot or commitment rate is substituted. The general-purpose page's default region must not be mistaken for Virginia.

| Predefined machine | vCPU / RAM | Virginia hourly compute | 730-hour compute |
| --- | --- | ---: | ---: |
| e2-standard-2 | 2 / 8GiB | $0.07547082 | $55.09 |
| e2-highmem-2 | 2 / 16GiB | $0.10180674 | $74.32 |
| e2-standard-4 | 4 / 16GiB | $0.15094164 | $110.19 |

For example, highmem-2 is `(2 × 0.02456745 + 16 × 0.00329199) × 730 = $74.3189202`. More memory does not automatically require four CPUs, but highmem-2 does not add CPU capacity for competing render/database work.

## Explicit combined scenario

Keep the current Cloud Run Studio, Firestore, Tasks and existing GCS design. The hypothetical VM hosts Penpot and Doory with their required Postgres and separate Redis/Valkey services. It has one zonal 80GiB balanced disk and one in-use external IPv4, with only governed TLS ingress exposed. No load balancer, NAT gateway, second VM, managed SQL/Redis, GPU or new model is included. Existing operator DNS is assumed; adding Cloud DNS would add its zone/query charges. OS/Docker/TLS/backup work remains operator responsibility.

| Native-host cost | Assumption | Monthly |
| --- | --- | ---: |
| Balanced persistent disk | 80GiB × verified Virginia $0.11/GiB-month | $8.80 |
| In-use IPv4 | 730 × $0.005/hour | $3.65 |
| Incremental regional snapshots | 20GiB actual retained chargeable bytes × conservative $0.06 allowance | $1.20 |
| Additional native GCS storage | 20GiB live, retained and soft-deleted bytes × Virginia $0.023 | $0.46 |
| Additional GCS operations | 20k writes and 100k reads at Standard flat-namespace rates | $0.14 |
| Native internet delivery | 10GiB to North America × $0.12, no free allowance | $1.20 |
| Native logs, registry and backup-operation contingency | Planning allowance | $2.00 |
| Noncompute subtotal | Additional to existing Studio scenario | **$17.45** |

Balanced disk is chosen rather than assuming cheap standard disk meets Postgres I/O needs. Snapshot $0.06 is a conservative allowance, **not a verified exact Virginia snapshot SKU**: the visible official regional table displays $0.05 but its default selection cannot establish Virginia here. Actual changed/retained bytes and the regional SKU need verification before purchase. Provisioned disk size is billed even when unused; incremental snapshots and recycle-bin retention are additional bytes. GCS operations and retained versions are not included merely by pricing live assets.

The existing [Studio scenario](57-pilot-cost-forecast.md) is approximately $10–17/month, including Run, Firestore/GCS, Tasks, 600 average text generations, internet delivery and adjacent-service allowances. Additional native GCS and delivery above are separate. No free tier or credits are deducted.

| VM | Native compute plus $17.45 | Including existing Studio | Headroom under $100 |
| --- | ---: | ---: | ---: |
| standard-2 / 8GiB | $72.54 | **$82.54–89.54** | $10.46–17.46 |
| highmem-2 / 16GiB | $91.77 | **$101.77–108.77** | Negative $1.77–8.77 |
| standard-4 / 16GiB | $127.64 | **$137.64–144.64** | Negative $37.64–44.64 |

Highmem-2 therefore narrowly exceeds the unchanged 24-hour balanced-disk scenario, rather than exceeding $100 in compute alone. Two sensitivities merit explicit review, not silent substitution:

- An 80GiB standard disk at the verified $0.044/GiB-month saves $5.28. Highmem-2 becomes $96.49–103.49 including Studio. Postgres I/O on that disk is unvalidated, and the lower scenario has only $3.51 headroom.
- Running highmem-2 for 600 hours gives $61.08 compute. Keeping all noncompute charges unchanged gives $88.53–95.53 combined, but requires 130 hours of explicit monthly downtime. Stopped-VM disk and attached IP charges remain. No stop/start automation is proposed.

The earlier higher-token example adds $9.58 relative to average generation usage, nearly exhausting the 8GiB scenario's headroom. Another 100GiB of native internet delivery adds about $12; Studio active time rising from 10 to 100 hours adds about $8.18. Existing Run/Vertex controls do not cap VM, disk or network charges. Alerts notify and may lag; this is not a hard $100 guarantee.

## Sampled capacity and operational tradeoffs

One read-only Docker sample, without requesting render/load, observed native services as follows:

| Service | Sample MiB / configured cap MiB |
| --- | ---: |
| Penpot frontend / exporter / backend | 341.9/384; 151.3/1024; 652.9/2048 |
| Penpot Postgres / Valkey | 135.4/384; 13.14/192 |
| Doory API / realtime | 147.6/768; 91.46/512 |
| Doory Redis / Postgres | 17.42/128; 23.78/384 |

The sum is **1574.9MiB sampled**, versus **5824MiB (5.6875GiB) configured caps**. This Apple/Docker Desktop idle sample is not an AMD64 E2 peak measurement. Assuming 1.25GiB for OS/Docker leaves about 1.06GiB on an 8GiB VM if every native cap is reached; that allowance is a hypothesis. The frontend sample was already about 89% of its cap. Penpot exporter/backend/frontend CPU limits total 3.25 CPU before Doory and databases, exceeding two physical vCPUs; limits do not reserve cores. Doory API/realtime currently have no NanoCPU cap. Limits alone establish neither safe concurrency nor acceptable latency.

A bounded evaluation candidate would allow two humans, one heavy export at a time, no inference or builds on the VM, and no HA claim. Database roles/connections must be separate; Redis indexes are not isolation, so use distinct credentials/instances and validate ACLs. A single VM/disk/zone is a single failure domain. Application-consistent backup, restore, OS patching, vacuum, TLS, monitoring and incident response become operator duties. Snapshot existence does not prove restoration.

The prior dedicated managed example remains over budget: $108.33 SQL compute + $35.77 Redis + $3.64 SQL disk = **$147.74 before editor compute or Studio**. Shared-core micro arithmetic is not a validated substitute. See [the regional evidence and assumptions](39-penpot-contracts-and-operations.md).

## Recommendation and unresolved acceptance

Retain the current deployment. Consider standard-2/8GiB only as a separately authorized capacity evaluation candidate, with representative edits and serialized exports, measured peaks/latency/OOM/storage growth and a real restore. Keep highmem-2/16GiB as a valid memory alternative requiring revised availability/storage assumptions with measured fit, or a modest budget revision. Do not exclude it using the erroneous standard-4 inference, or force spreadsheet fit by weakening security/backups.

Issue 52's Phase 1 spec is now approved; its Phase 2 plan PR190 still awaits human review. VM placement does not implement native identity reconciliation. Issue 54's fresh-owner finance output and remaining restored SVG/token checks are separate. Current Penpot archives contain zero font binaries: same-server font uploads, font-ID remaps and explicit Noto Om rendering do not prove a deletion-independent fresh installation. Studio packs include catalog font/license bytes but verify preinstalled destination bytes; they do not install Penpot team fonts or remap their IDs.

Issue 57 still needs its exact fresh-install byte/lineage, native editing/output, font packaging, backup/rollback, DB role/connection, Redis ACL, WebSocket reconnect/revocation and multi-instance requirements reconciled against actual evidence. Held editor distribution rights remain separate. No provisioning, license clearance or ticket closure follows from this forecast.

## Official sources and retained correction

- [Compute pricing and individual resource billing](https://cloud.google.com/products/compute/pricing), [general-purpose prices](https://cloud.google.com/products/compute/pricing/general-purpose), [machine specifications](https://docs.cloud.google.com/compute/docs/general-purpose-machines) and [regional support](https://docs.cloud.google.com/compute/docs/regions-zones).
- [Disk and snapshot pricing](https://cloud.google.com/compute/disks-image-pricing), [IPv4 pricing](https://cloud.google.com/vpc/pricing), [network and DNS pricing](https://cloud.google.com/vpc/network-pricing), [GCS dimensions/operations](https://cloud.google.com/storage/pricing), and [Cloud Run pricing](https://cloud.google.com/run/pricing), consulted 2026-10-18. The regional Catalog receipt above avoids default-region ambiguity for core/RAM/disk.
- Private original review SHA256 `3bbbff05d591f92890bfd248b43274e328a7a95f80c23869dc40710338ffae83` and correction SHA256 `0c23b35a6fa9472c3ec807a611a25d7aa9b9964109d0c440ecbf79ecdec40169` remain retained. Correction applied before publishing this single-VM audit; the earlier committed forecast is now qualified. No failed history or measurements were rewritten.
