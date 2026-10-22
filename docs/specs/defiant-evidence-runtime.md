# Optional private evidence runtime binding

Authorized scope: connect the existing constructor-owned evidence provider to all Studio startup paths. This is source implementation, not private artifact publication or activation.

An absent STUDIO_DEFIANT_EVIDENCE_CONFIG leaves the provider disabled with no filesystem or Storage work. When explicitly configured, read an absolute regular JSON file with O_NOFOLLOW, a two MiB cap and exact schema. Validate the approved project/bucket, exact Studio organization, immutable object generations/bytes/SHA and finite source/worksheet partitions before constructing the existing provider. Never accept credentials, URLs, caller paths or source records in this configuration. Object paths remain operator-owned.

Mount compatibility: symlink paths are deliberately rejected. GCP secret-volume symlinks must be resolved by the operator/deployment into an independently reviewed regular read-only file before configuring this path; the application never follows a link silently. Full manifests may exceed secret-version size limits, so use a regular mounted configuration file; no new secret/bucket or infrastructure is provisioned by this change.

The same optional provider is forwarded through managed Penpot, ordinary Cloud Run and existing local Penpot startup. Google authentication and current organization membership are unchanged. The manifest cannot alias the prepared POC organization to a real tenant; artifact organization IDs must already match the operator-verified Studio organization.

Hosted contracts cover absent no-I/O, strict malformed configs, file bounds/symlinks, exact provider scope and startup forwarding. No local tests/builds. Runtime acceptance still requires actual verified pins, existing service-account read access, organization ownership and authenticated browser receipt readback. Private external MCP OAuth remains separate and is not mounted here.

### Pinned GCS configuration alternative

For configurations larger than Secret Manager's payload limit, `STUDIO_DEFIANT_EVIDENCE_CONFIG_GCS` accepts a JSON object containing exactly `key`, `generation`, `bytes` and `sha256`. The environment string is bounded to 2 KiB, configuration bytes to 2 MiB. The existing fixed project/bucket and derived-prefix path rules apply; no URL, credential, alternate bucket or latest-generation fallback is accepted. File and GCS modes are mutually exclusive; both absent remains disabled without filesystem, SDK or ADC work.

After pin validation, startup constructs one Storage client using the runtime identity. It reads the exact generation with CRC32C enabled, a 15-second stream deadline, incremental SHA256 and strict byte accounting in one preallocated buffer. Only Uint8Array chunks are accepted, with a 65,536-chunk limit that also bounds empty-chunk overhead. Only verified bytes are decoded as fatal UTF-8, parsed and passed to the existing exact configuration validator before platform initialization. Errors are finite and do not echo source records, paths or underlying provider messages. Oversize, failed and completed streams are closed. The same client supplies the configured evidence provider. No object listing, bucket mount, new IAM permission, private data in an image, or model call is required. Publication and live authenticated acceptance remain separate operator steps.
