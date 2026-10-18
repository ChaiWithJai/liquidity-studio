import { fail } from "./auth.js";
import { PenpotActionLedger } from "./penpot-action-ledger.js";

/** Durable projection and read-only reconciliation. Native capabilities remain ephemeral. */
export class PenpotStudioActions {
  constructor({ store, scope, identity, transport, boundaryFactory }) {
    this.scope = scope;
    this.identity = identity;
    this.transport = transport;
    this.boundaryFactory = boundaryFactory;
    this.ledger = new PenpotActionLedger({
      store,
      scope,
      authorize: async (actor) => {
        await identity.authorizeJobActor(actor.id, new Date().toISOString());
        await identity.authorize(actor, scope.organizationId, scope.brandId);
      },
    });
  }
  async input(actor, action) {
    await this.ledger.permitted(actor);
    await this.identity.authorizeJobActor(actor.id, action.createdAt);
    const boundary = this.boundaryFactory(this.transport);
    const binding = boundary.binding(await boundary.read(), action.bindingId);
    const resource = binding.resources.find(
      (item) =>
        item.id === action.resourceId &&
        item.kind === "tokens" &&
        item.nativeParentId === binding.nativeProjectId,
    );
    if (!resource || binding.adapter !== "penpot")
      throw fail(404, "Registered native token target not found");
    if (
      action.execution &&
      (action.execution.bindingEpoch !== binding.epoch ||
        action.execution.fileId !== resource.nativeId)
    )
      throw fail(
        409,
        "Native action binding changed; start a new reviewed attempt",
      );
    return {
      binding,
      resource,
      actor: { id: actor.id },
      action: "write",
      command: structuredClone(action.command),
      durableActionId: action.id,
      authorizedAt: action.createdAt,
      reauthorize: async () => {
        await this.ledger.permitted(actor);
        const current = boundary.binding(await boundary.read(), binding.id);
        if (current.epoch !== binding.epoch)
          throw fail(403, "Native registration revoked or changed");
      },
    };
  }
  async create(actor, intent) {
    if (
      !intent ||
      Array.isArray(intent) ||
      Object.keys(intent).some(
        (key) =>
          !["bindingId", "resourceId", "command", "idempotencyKey"].includes(
            key,
          ),
      )
    )
      throw fail(400, "Unknown native action field");
    const result = await this.ledger.create(actor, intent);
    if (!result.created)
      return {
        action: await this.get(actor, result.action.id),
        requiresReconciliation:
          result.action.status !== "native-state-verified",
        capabilityAvailable: false,
      };
    try {
      const input = await this.input(actor, result.action);
      this.transport.validateCommand(input);
      await this.ledger.bind(actor, result.action.id, {
        fileId: input.resource.nativeId,
        bindingEpoch: input.binding.epoch,
      });
      const issued = await this.transport.execute(input);
      return {
        action: await this.get(actor, result.action.id),
        nativeActionCapability: issued.nativeActionCapability,
        expiresAt: issued.expiresAt,
        capabilityAvailable: true,
      };
    } catch (error) {
      await this.ledger
        .transition(actor, result.action.id, "reconciliation-required")
        .catch(() => {});
      throw error;
    }
  }
  async get(actor, id) {
    const action = await this.ledger.get(actor, id);
    await this.input(actor, action);
    return action;
  }
  async list(actor) {
    const rows = await this.ledger.list(actor),
      result = [];
    for (const row of rows) {
      try {
        await this.input(actor, row);
        result.push(row);
      } catch (error) {
        if (![403, 404, 409].includes(error.status)) throw error;
      }
    }
    return result;
  }
  async reconcile(actor, id) {
    const action = await this.get(actor, id);
    // Completed records describe their immutable historical snapshot, never a new approval.
    if (action.status === "native-state-verified") return action;
    const input = await this.input(actor, action);
    const context = await this.transport.context(input);
    const snapshot = await this.transport.snapshot(
      input,
      context.manifest,
      context.colors,
    );
    if (
      snapshot.revision <= action.command.expectedNativeRevision ||
      snapshot.boundPaintsMatch !== true ||
      JSON.stringify(snapshot.tokenValues) !==
        JSON.stringify(context.colors.map((color) => color.hex))
    ) {
      return this.ledger.transition(actor, id, "reconciliation-required");
    }
    const finalContext = await this.transport.context(input);
    if (
      JSON.stringify(finalContext.bundle) !== JSON.stringify(context.bundle) ||
      JSON.stringify(finalContext.manifest) !== JSON.stringify(context.manifest)
    )
      throw fail(409, "Native action source changed during reconciliation");
    await input.reauthorize();
    return this.ledger.transition(actor, id, "native-state-verified", {
      nativeRevision: snapshot.revision,
      bindingEpoch: input.binding.epoch,
      method: "read-only-reconciliation",
    });
  }
  async issued({ input }) {
    await this.ledger.transition(
      input.actor,
      input.durableActionId,
      "pending-native-action",
    );
  }
  async verified({ input, nativeRevision }) {
    await this.ledger.transition(
      input.actor,
      input.durableActionId,
      "native-state-verified",
      {
        nativeRevision,
        bindingEpoch: input.binding.epoch,
        method: "acknowledgement",
      },
    );
  }
}
