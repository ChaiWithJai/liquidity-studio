# First design in a developer workspace

The explicit local password launcher accepts an additive version 2 Penpot configuration. It describes an existing operator-owned team, project and uploaded fonts, without requiring a previously created design, token file, layer, story or generation. Version 1 still uses the original legacy manifest validator and adapters.

The private regular file must have no group/other permissions and be at most 1 MiB. Its exact shape is:

```json
{
  "version": 2,
  "transportMode": "loopback",
  "sessions": [{"ownerPrincipal": "<operator UUID>", "cookie": "<private native session cookie>"}],
  "workspaces": [{
    "id": "cwj-shared-workspace",
    "organizationId": "org_default",
    "brandId": "brand_vedic",
    "ownerPrincipal": "<same operator UUID>",
    "projectId": "<existing project UUID>",
    "teamId": "<existing team UUID>",
    "fonts": [{"family": "Inter", "weight": 400, "fontId": "custom-<font UUID>", "fontVariantId": "normal-400", "license": "OFL-1.1", "sha256": "<original font SHA-256>"}]
  }]
}
```

Use the actual uploaded font registry and its retained license/hash evidence. The loader does not manufacture a registry or attest font bytes. Before registration, the provider reads the actual native profile, project/team association and current team font variants. Version 2 requires exact family, custom font ID, weight and normal style. Current Studio membership and the existing founder-only first registration remain enforced. Paired access still uses its separate current grant and live-fence policy; workspace configuration does not enable it.

The normalized EditorBoundary target has `resources: []` and `nativeRoomId` equal to the team UUID. This registers workspace authority only. The existing story-design create service creates the first real file from current saved source copy through the normal UI. It does not invent a legacy resource or mark a design reviewed. Existing revoked/stale bindings are not replaced automatically.

Focused hosted tests cover empty-resource registration, current font-style refusal, malformed configuration and the unchanged version 1 flow. Local tests, builds and customer runtime activation were not performed for this source change.
