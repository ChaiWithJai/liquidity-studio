# Two-user US-east pilot cost forecast

Observed October 18, 2026 through public official Google Cloud pricing pages in BrowserOS Neo. USD list prices, Northern Virginia (`us-east4`), 730 running hours/month, Linux on-demand, no commitments, Spot, trial credits, free allowances, tax or support-plan discounts. This is an auditable forecast, not a bill or a provisioned deployment. The existing Cloud Run pilot was not changed or queried with account credentials.

**Recommended cost path: one 2-vCPU/8-GiB `e2-standard-2` VM with the private Compose services and persistent volumes, approximately $71/month for the explicit usage below; allow $75/month.** That leaves about $25 of a $100 total budget for the existing pilot and contingency. The combined budget is conditional on that existing Cloud Run/Firestore/Tasks/registry/logging spend fitting the allowance; no fresh billing-account total was inspected. Two users do not create a fixed per-seat infrastructure charge. Media transfers, storage and paid model usage still matter.

## Published prices and arithmetic

The region selectors were explicitly set to **Northern Virginia (us-east4)**. Rates below are the displayed on-demand column. Hourly storage rates avoid ambiguous month-length rounding.

| Item | Published unit rate | Forecast usage | Monthly USD |
| --- | ---: | ---: | ---: |
| E2 standard-2: 2 vCPU, 8 GiB | $0.07547082/hour | 730 h | $55.0937 |
| Standard Persistent Disk boot | $0.000060274/GiB-hour | 20 GiB × 730 h | $0.8800 |
| Balanced Persistent Disk data | $0.000150685/GiB-hour | 50 GiB × 730 h | $5.5000 |
| Regional standard snapshots | $0.000068493/GiB-hour | 50 GiB stored × 730 h | $2.5000 |
| In-use external IPv4 | $0.005/hour | 730 h | $3.6500 |
| Premium internet transfer to North America | $0.12/GiB, first paid tier | 20 GiB | $2.4000 |
| Regional Standard GCS backup objects | $0.000031507/GiB-hour | 20 GiB × 730 h | $0.4600 |
| Backup object operations | $0.005/1,000 Class A; $0.0004/1,000 Class B | 1,000 each | $0.0054 |
| **Explicit subtotal** | | | **$70.4891** |
| **Planning allowance** | DNS/extra backup operations and small usage variation | rounded reserve | **$75 total** |

Sources: [E2 machine prices](https://cloud.google.com/products/compute/pricing/general-purpose#e2-machine-types), [disks and regional snapshots](https://cloud.google.com/compute/disks-image-pricing), [IPv4 and network transfer](https://cloud.google.com/vpc/network-pricing), [regional GCS storage and operations](https://cloud.google.com/storage/pricing). The selected regional network table did not show the Iowa first-GiB free tier, so the forecast charges all 20 GiB. Snapshot cost is **stored incremental snapshot data**, not 50 GiB charged once per daily snapshot. Recycle-bin/soft-delete retention also consumes charged storage and must fit the stated retained-byte allowance.

The $75 allowance excludes a paid load balancer, Cloud NAT, managed SQL/Redis, new domain registration, paid models/GPUs and commercial support. Serve HTTPS on the VM's existing reverse proxy/public address; keep PostgreSQL/Valkey and internal callbacks private. Do not add a load balancer or NAT silently to this estimate. Reuse an existing domain if available; otherwise domain registration is an explicit additional charge. Incoming transfer is free, but response/download traffic is outgoing usage. Same-host container traffic does not incur VM-to-VM inter-zone charges.

## Why 8 GiB is a reasonable initial candidate

A read-only Docker sample of the existing owned native stack reported: Penpot backend 741.6 MiB, frontend 231.4 MiB, exporter 181.1 MiB, PostgreSQL 138.3 MiB and Valkey 13.14 MiB, approximately 1.28 GiB combined. Existing Studio and worker added 115.6/58.34 MiB. These are one idle/current sample, **not peak RSS or production capacity proof**.

The native containers currently have limits of 2 GiB backend, 384 MiB frontend, 1 GiB exporter, 384 MiB PostgreSQL and 192 MiB Valkey: 3.94 GiB combined. Allowing a planned 512 MiB each for Studio and its worker gives 4.94 GiB, leaving about 3 GiB for the host, page cache and ordinary variation on an 8-GiB VM. The Studio values are a proposed VM allocation, not claimed limits of the current maintained local containers. Two people editing is plausible within this shape; simultaneous exports and native JVM/render peaks still need ordinary deployment observation. No local render/load test was run for this estimate. Browser cutout inference/video encoding remain on the user's device and are not a cloud GPU budget item.

`e2-standard-4` is $0.15094164/hour or **$110.19/month for the VM alone** in this region, exceeding $100 before storage. More users or sustained heavy work therefore requires an explicit budget decision, not an invisible scale-up. Increasing internet downloads from 20 to 100 GiB adds $9.60/month; each additional 50 GiB balanced disk adds about $5.50/month and each additional 50 GiB stored regional snapshots adds $2.50. Existing pilot spend consumes the same total-budget headroom. Configure budget alerts and storage retention; alerts are notifications, not automatic spending caps.

## Managed PostgreSQL and Redis comparison

The same public region selectors showed these [Cloud SQL PostgreSQL prices](https://cloud.google.com/sql/pricing): shared `db-f1-micro` $0.0112/hour (0.6 GiB), `db-g1-small` $0.0375/hour (1.7 GiB); Enterprise general-purpose dedicated vCPU $0.0442/hour plus memory $0.0075/GiB-hour; SSD storage $0.000249178/GiB-hour and used backups $0.00011726/GiB-hour. [Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/pricing) Basic M1 costs $0.049/GiB-hour, minimum 1 GiB: **$35.77/month**. Standard M1 is $0.064/GiB-hour: $46.72 for 1 GiB.

| Same 8-GiB application VM plus managed services | Compute-only monthly subtotal |
| --- | ---: |
| E2 standard-2 + smallest SQL micro + 1-GiB Basic Redis | $99.04 |
| E2 standard-2 + SQL g1-small + 1-GiB Basic Redis | $118.24 |
| E2 standard-2 + SQL 1 vCPU / 3.75 GiB + 1-GiB Basic Redis | $143.66 |

These **exclude** VM disk/IP/egress, SQL storage/backups, network integration and the existing pilot. Thus even the tiny shared SQL option is over $100 after ordinary extras in this like-for-like 8-GiB application profile; the practical dedicated option is substantially over. This is not a claim that every imaginable smaller managed configuration costs over $100. Downsizing the application VM to force the forecast under budget would need actual memory evidence; 4 GiB is already below the current native container-limit sum plus host/Studio overhead. Managed services buy operations/failover features, not a necessary first two-user feature. Self-managed PostgreSQL/Valkey avoid their minimum bills but leave maintenance, backup and recovery with the operator.

## Concrete deployment boundary

The cost-compatible layout is one us-east4 VM, internal Compose network, persistent PostgreSQL and native asset volumes, Studio durable storage, private Valkey, the existing original native admission adapter, and a public HTTPS reverse proxy. Use coordinated application-aware PostgreSQL/Studio backups plus native asset bytes/manifests to regional object storage; disk snapshots supplement those backups and are not by themselves proof of cross-service consistency. Retain the existing Cloud Run pilot and rollback data while validating the candidate; no source data migration is implied here.

This is **not turnkey from current localhost settings**: `penpot-story-design.js` constructs native links at `http://localhost:39008` and chooses fixed local RPC origins; the developer launcher intentionally enables only local password composition. A production deployment needs narrowly constructor-configured public HTTPS origins/internal service addresses and the existing Google production composition wired to the same real native services. Do not expose a local developer mode or weaken paired-authority/private callback checks to make it reachable. This is concrete deployment configuration work, not a new platform, account-test matrix or infrastructure redesign. No resource was provisioned, image built, service started, account action taken or runtime modified by this research.
