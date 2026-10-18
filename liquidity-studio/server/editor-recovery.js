import { fail } from "./auth.js";
import { jsonDigest } from "./editor-pack.js";
// Read only. Never construct a ScopedRepository: recovery must work while the scope is reserved.
export async function editorRestoreStatus({ store, identity, actor, scope }) {
  const authorize = async () => {
    const snapshot = await store.get("identity"),
      current = snapshot?.users?.find((user) => user.id === actor?.id);
    if (current?.role !== "founder")
      throw fail(403, "Current founder access required");
    await identity.authorize(current, scope.organizationId, scope.brandId);
    return snapshot;
  };
  const snapshot = await authorize(),
    journal = await store.get(
      `editor-restore:${scope.organizationId}:${scope.brandId}`,
    );
  if (jsonDigest(await authorize()) !== jsonDigest(snapshot))
    throw fail(409, "Recovery membership changed; retry");
  if (!journal)
    return {
      status: "empty",
      scope: { organizationId: scope.organizationId, brandId: scope.brandId },
    };
  const originalActor = journal.actorId === actor.id;
  return {
    status: journal.status,
    installationId: journal.id,
    packSha256: journal.packSha256,
    createdAt: journal.createdAt,
    originalActor,
    canReplay: originalActor && journal.status === "completed",
    canRollback: ["installing", "rolling-back"].includes(journal.status),
    ...(originalActor ? { idempotencyKey: journal.key } : {}),
    ...(journal.status === "completed"
      ? { result: {restored: journal.result?.restored === true, packSha256: journal.packSha256,
          documents: journal.result?.documents, assets: journal.result?.assets,
          scope:{organizationId:scope.organizationId,brandId:scope.brandId}} }
      : {}),
    scope: { organizationId: scope.organizationId, brandId: scope.brandId },
  };
}
