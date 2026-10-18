import { randomUUID } from "node:crypto";
import { fail } from "./auth.js";
import { exact, text, revision, hash } from "./workspace-schema.js";
import { idempotencyKey, storyRow } from "./workspace-query.js";
const KINDS = ["story.patch", "assignment.place", "assignment.remove"];
const controls = (state) =>
  (state.operatorControl ||= {
    schemaVersion: 1,
    grants: [],
    proposals: [],
    presence: [],
  });
const copy = (value) => structuredClone(value);
function bounded(data) {
  if (Buffer.byteLength(JSON.stringify(data)) > 512 * 1024)
    throw fail(409, "Helper control retention capacity reached");
}
export class HelperControlService {
  constructor({ workspace, clock = Date.now }) {
    this.workspace = workspace;
    this.clock = clock;
  }
  async principal(actor) {
    const state = await this.workspace.store.get("identity");
    const current = state.users.find((user) => user.id === actor.id);
    if (!current) throw fail(403, "Current principal is unavailable");
    await this.workspace.authorize(current);
    return current;
  }
  async pair(actor, grant) {
    const current = await this.principal(actor);
    const state = await this.workspace.store.get("identity");
    let owner = state.users.find((user) => user.id === grant.ownerId);
    let helper = state.users.find((user) => user.id === grant.helperId);
    if (!owner || !helper) throw fail(403, "Grant principal is unavailable");
    // Delegated execution must also honor managed Google disable/revoke policy
    // for the absent grant owner. Never authorize from a stored role alone.
    if (this.workspace.identity.authorizeJobActor) {
      owner = await this.workspace.identity.authorizeJobActor(
        grant.ownerId,
        grant.createdAt,
      );
      helper = await this.workspace.identity.authorizeJobActor(
        grant.helperId,
        grant.createdAt,
      );
    } else if (this.workspace.identity.mode === "google") {
      throw fail(
        503,
        "Managed delegated-principal verification is unavailable",
      );
    }
    await this.workspace.authorize(owner);
    await this.workspace.authorize(helper);
    return current;
  }
  active(grant, epoch) {
    if (
      !grant ||
      grant.status !== "active" ||
      grant.epoch !== epoch ||
      Date.parse(grant.expiresAt) <= this.clock()
    )
      throw fail(409, "Helper grant changed, paused or expired");
  }
  async list(actor) {
    actor = await this.principal(actor);
    const state = await this.workspace.repo.read();
    const data = controls(state),
      grants = data.grants.filter(
        (g) => g.ownerId === actor.id || g.helperId === actor.id,
      );
    return copy({
      grants,
      presence: (data.presence || []).map((p) => ({
        ...p,
        connected: this.clock() - p.lastSeenAt < 30000,
      })),
      proposals: data.proposals.filter((p) =>
        grants.some((g) => g.id === p.grantId),
      ),
    });
  }
  async heartbeat(actor, input) {
    actor = await this.principal(actor);
    exact(input, ["clientId", "clientKind", "storyId", "observedRevision"]);
    idempotencyKey(input.clientId);
    if (
      !["human", "scripted-helper", "model-helper"].includes(input.clientKind)
    )
      throw fail(400, "Unknown advisory client kind");
    if (input.storyId !== null) {
      text(input.storyId, "story", 100);
      revision(input.observedRevision);
    } else if (input.observedRevision !== null)
      throw fail(400, "No story revision without a story");
    const now = this.clock();
    let result;
    await this.workspace.repo.mutate((state) => {
      const data = controls(state);
      data.presence ||= [];
      const prior = data.presence.find((p) => p.clientId === input.clientId);
      if (prior && prior.actorId !== actor.id)
        throw fail(409, "Presence client belongs to another actor");
      if (
        input.storyId !== null &&
        !state.backlog.some((s) => s.id === input.storyId)
      )
        throw fail(404, "Presence story not found");
      data.presence = data.presence.filter(
        (p) => p.clientId !== input.clientId && now - p.lastSeenAt < 300000,
      );
      if (data.presence.length >= 100)
        throw fail(409, "Presence capacity reached");
      result = { ...input, actorId: actor.id, lastSeenAt: now };
      data.presence.push(result);
      bounded(data);
      return state;
    });
    return copy(result);
  }
  async createGrant(actor, input) {
    actor = await this.principal(actor);
    exact(input, ["helperId", "storyIds", "kinds", "expiresAt"]);
    text(input.helperId, "helper", 100);
    if (
      !Array.isArray(input.storyIds) ||
      !input.storyIds.length ||
      input.storyIds.length > 25 ||
      new Set(input.storyIds).size !== input.storyIds.length
    )
      throw fail(400, "Grant needs 1 to 25 unique stories");
    if (
      !Array.isArray(input.kinds) ||
      !input.kinds.length ||
      input.kinds.some((k) => !KINDS.includes(k)) ||
      new Set(input.kinds).size !== input.kinds.length
    )
      throw fail(400, "Unsupported helper actions");
    const expiry = Date.parse(input.expiresAt),
      now = this.clock();
    if (
      !Number.isFinite(expiry) ||
      expiry <= now ||
      expiry > now + 30 * 60 * 1000
    )
      throw fail(400, "Grant expiry must be within 30 minutes");
    const members = await this.workspace.members(actor);
    if (!members.some((m) => m.id === input.helperId))
      throw fail(403, "Helper must be a current brand member");
    const grant = {
      id: randomUUID(),
      ownerId: actor.id,
      helperId: input.helperId,
      storyIds: copy(input.storyIds),
      kinds: copy(input.kinds),
      expiresAt: new Date(expiry).toISOString(),
      createdAt: new Date(now).toISOString(),
      epoch: 1,
      status: "active",
      attemptedItems: 0,
    };
    await this.workspace.repo.mutate((state) => {
      const data = controls(state);
      if (data.grants.length >= 50)
        throw fail(409, "Helper grant retention capacity reached");
      for (const id of grant.storyIds)
        if (!state.backlog.some((s) => s.id === id))
          throw fail(404, "Grant story not found");
      data.grants.push(grant);
      bounded(data);
      return state;
    });
    return copy(grant);
  }
  async transition(actor, id, input) {
    actor = await this.principal(actor);
    exact(input, ["expectedEpoch", "action"]);
    revision(input.expectedEpoch);
    if (!["pause", "stop", "takeover", "resume"].includes(input.action))
      throw fail(400, "Unknown grant transition");
    let result;
    await this.workspace.repo.mutate((state) => {
      const grant = controls(state).grants.find((g) => g.id === id);
      if (!grant || grant.ownerId !== actor.id)
        throw fail(403, "Only the grant owner controls delegation");
      if (grant.epoch !== input.expectedEpoch)
        throw fail(409, "Helper grant epoch changed");
      if (
        input.action === "resume" &&
        (grant.status !== "paused" ||
          Date.parse(grant.expiresAt) <= this.clock())
      )
        throw fail(409, "Grant cannot resume");
      if (["stopped", "completed"].includes(grant.status))
        throw fail(409, "Grant is terminal");
      grant.status =
        input.action === "resume"
          ? "active"
          : input.action === "pause"
            ? "paused"
            : "stopped";
      grant.epoch++;
      result = copy(grant);
      return state;
    });
    return result;
  }
  async propose(actor, input) {
    actor = await this.principal(actor);
    exact(input, ["grantId", "epoch", "changes"]);
    revision(input.epoch);
    if (
      !Array.isArray(input.changes) ||
      !input.changes.length ||
      input.changes.length > 25 ||
      Buffer.byteLength(JSON.stringify(input)) > 32768
    )
      throw fail(400, "Bounded helper changes required");
    const initial = (
      await this.workspace.repo.read()
    ).operatorControl?.grants.find((g) => g.id === input.grantId);
    if (!initial || initial.helperId !== actor.id)
      throw fail(403, "Helper grant not available");
    await this.pair(actor, initial);
    const members = new Set(
        (await this.workspace.members(actor)).map((m) => m.id),
      ),
      id = randomUUID(),
      now = new Date(this.clock()).toISOString(),
      previewIds = input.changes.map(() => randomUUID());
    let result;
    await this.workspace.repo.mutate((state) => {
      const data = controls(state),
        grant = data.grants.find((g) => g.id === input.grantId);
      this.active(grant, input.epoch);
      if (data.proposals.length >= 100)
        throw fail(409, "Helper proposal retention capacity reached");
      const seen = new Set(),
        preview = [];
      for (const [index, change] of input.changes.entries()) {
        exact(change, [
          "kind",
          "storyId",
          "expectedRevision",
          "patch",
          "assignmentId",
          "expectedAssignmentRevision",
          "unit",
          "format",
          "date",
          "timeZone",
          "targetBucketRevision",
          "sourceBucketRevision",
          "beforeAssignmentId",
        ]);
        if (
          !grant.kinds.includes(change.kind) ||
          !grant.storyIds.includes(change.storyId) ||
          seen.has(change.storyId)
        )
          throw fail(400, "Change exceeds helper grant");
        seen.add(change.storyId);
        revision(change.expectedRevision);
        const candidate = copy(state),
          story = candidate.backlog.find((s) => s.id === change.storyId);
        if (!story || story.revision !== change.expectedRevision)
          throw fail(409, "Proposal observation is stale");
        const before = copy(storyRow(story, candidate));
        this.workspace.apply(
          candidate,
          story,
          change,
          previewIds[index],
          now,
          members,
        );
        story.revision++;
        preview.push({
          storyId: story.id,
          before,
          after: copy(storyRow(story, candidate)),
        });
      }
      result = {
        id,
        grantId: grant.id,
        epoch: grant.epoch,
        helperId: actor.id,
        revision: 1,
        status: "proposed",
        createdAt: now,
        changes: copy(input.changes),
        preview,
      };
      data.proposals.push(result);
      bounded(data);
      return state;
    });
    return copy(result);
  }
  async approve(actor, id, input) {
    actor = await this.principal(actor);
    exact(input, ["expectedRevision"]);
    revision(input.expectedRevision);
    let result;
    await this.workspace.repo.mutate((state) => {
      const data = controls(state),
        proposal = data.proposals.find((p) => p.id === id),
        grant = data.grants.find((g) => g.id === proposal?.grantId);
      if (!grant || grant.ownerId !== actor.id)
        throw fail(403, "Only the grant owner approves");
      this.active(grant, proposal.epoch);
      if (
        proposal.status !== "proposed" ||
        proposal.revision !== input.expectedRevision
      )
        throw fail(409, "Proposal changed");
      for (const change of proposal.changes)
        if (
          state.backlog.find((s) => s.id === change.storyId)?.revision !==
          change.expectedRevision
        )
          throw fail(409, "Proposal observation is stale");
      proposal.status = "approved";
      proposal.revision++;
      proposal.approvedAt = new Date(this.clock()).toISOString();
      result = copy(proposal);
      return state;
    });
    return result;
  }
  async apply(actor, input) {
    actor = await this.principal(actor);
    exact(input, ["grantId", "proposalId", "epoch", "idempotencyKey"]);
    idempotencyKey(input.idempotencyKey);
    revision(input.epoch);
    const initial = await this.workspace.repo.read(),
      grant = initial.operatorControl?.grants.find(
        (g) => g.id === input.grantId,
      ),
      proposal = initial.operatorControl?.proposals.find(
        (p) => p.id === input.proposalId,
      );
    if (
      !grant ||
      grant.helperId !== actor.id ||
      !proposal ||
      proposal.grantId !== grant.id
    )
      throw fail(403, "Helper proposal not available");
    await this.pair(actor, grant);
    const binding = {
      grantId: grant.id,
      proposalId: proposal.id,
      epoch: input.epoch,
      changesHash: hash(proposal.changes),
    };
    return this.workspace.mutate(
      actor,
      { idempotencyKey: input.idempotencyKey, changes: proposal.changes },
      {
        binding,
        guard: (state, prior) => {
          const data = controls(state),
            g = data.grants.find((x) => x.id === binding.grantId),
            p = data.proposals.find((x) => x.id === binding.proposalId);
          // WorkspaceService still checks actor and complete fingerprint for replay.
          if (prior) return;
          this.active(g, binding.epoch);
          if (
            !p ||
            p.helperId !== actor.id ||
            p.status !== "approved" ||
            p.epoch !== g.epoch ||
            hash(p.changes) !== binding.changesHash
          )
            throw fail(
              409,
              "Helper proposal is not approved for this grant epoch",
            );
          if (g.attemptedItems + p.changes.length > 25)
            throw fail(409, "Helper grant item budget exhausted");
        },
        committed: (state, result) => {
          const data = controls(state),
            g = data.grants.find((x) => x.id === binding.grantId),
            p = data.proposals.find((x) => x.id === binding.proposalId);
          p.status = "applied";
          p.revision++;
          p.operationId = result.operationId;
          p.appliedAt = new Date(this.clock()).toISOString();
          g.attemptedItems += p.changes.length;
        },
      },
    );
  }
}
