import { randomUUID } from "node:crypto";
import { fail } from "./auth.js";
import { getApprovedClaims } from "./source-integrity.js";
import {
  exact,
  text,
  revision,
  localDate,
  timeZone,
  bucketId,
  workspace,
  hash,
  FORMATS,
  DAYS,
} from "./workspace-schema.js";
import {
  queryStories,
  storyRow,
  idempotencyKey,
  WorkspaceViews,
} from "./workspace-query.js";

// All changes and their receipts share one repository transaction. Callbacks are
// synchronous and deterministic so the Firestore adapter can safely retry them.
export class WorkspaceService {
  constructor({ store, identity, repo, scope }) {
    Object.assign(this, { store, identity, repo, scope });
    this.views = new WorkspaceViews(this);
  }
  async authorize(actor) {
    return this.identity.authorize(
      actor,
      this.scope.organizationId,
      this.scope.brandId,
    );
  }
  async members(actor) {
    await this.authorize(actor);
    const state = await this.store.get("identity");
    return state.users
      .filter((user) =>
        state.memberships.some(
          (m) =>
            m.userId === user.id &&
            m.organizationId === this.scope.organizationId &&
            m.brandIds.includes(this.scope.brandId),
        ),
      )
      .map((user) => ({
        id: user.id,
        displayName: user.displayName || user.username || user.id,
        role: user.role,
      }));
  }
  async operations(actor) {
    await this.authorize(actor);
    const state = await this.repo.read(),
      data = workspace(state);
    const calendarHash = hash({
      assignments: data.assignments,
      buckets: data.buckets,
    });
    return data.receipts
      .filter(
        (receipt) => receipt.actorId === actor.id || actor.role === "founder",
      )
      .map((receipt) => ({
        operationId: receipt.result.operationId,
        actorId: receipt.actorId,
        createdAt: receipt.createdAt,
        outcomes: receipt.result.outcomes,
        undone: !!receipt.undone,
        canUndo:
          receipt.undo.length > 0 &&
          !receipt.undone &&
          receipt.afterWorkspaceHash === calendarHash &&
          receipt.undo.every(
            (item) =>
              state.backlog.find((story) => story.id === item.storyId)
                ?.revision === item.afterRevision,
          ),
      }));
  }
  async query(actor, input) {
    await this.authorize(actor);
    return queryStories(await this.repo.read(), this.scope, input);
  }
  async detail(actor, id) {
    await this.authorize(actor);
    const state = await this.repo.read(),
      story = state.backlog.find((s) => s.id === id);
    if (!story) throw fail(404, "Story not found");
    return { story, row: storyRow(story, state) };
  }
  async calendar(actor, input) {
    await this.authorize(actor);
    exact(input, ["startDate", "endDate", "timeZone"]);
    const start = localDate(input.startDate),
      end = localDate(input.endDate),
      zone = timeZone(input.timeZone);
    if (start > end) throw fail(400, "Invalid date range");
    const state = await this.repo.read(),
      data = workspace(state);
    return {
      timeZone: zone,
      startDate: start,
      endDate: end,
      assignments: data.assignments.filter(
        (a) =>
          !a.deletedAt &&
          a.timeZone === zone &&
          a.date >= start &&
          a.date <= end,
      ),
      buckets: Object.fromEntries(
        Object.entries(data.buckets).filter(
          ([, b]) => b.timeZone === zone && b.date >= start && b.date <= end,
        ),
      ),
      unscheduled: state.backlog
        .map((s) => storyRow(s, state))
        .filter((s) => !s.assignments.some((a) => a.unit === "campaign")),
      unscheduledUnits: state.backlog.flatMap((story) => {
        const row = storyRow(story, state);
        return [
          { unit: "campaign", format: null },
          ...FORMATS.map((format) => ({ unit: "format", format })),
        ]
          .filter(
            (unit) =>
              !row.assignments.some(
                (a) => a.unit === unit.unit && a.format === unit.format,
              ),
          )
          .map((unit) => ({
            storyId: story.id,
            storyRevision: story.revision,
            ...unit,
            legacyWeekday: unit.unit === "campaign" ? row.legacyWeekday : null,
          }));
      }),
      legacyWeekdays: state.backlog
        .map((s) => storyRow(s, state))
        .filter((s) => s.legacyWeekday),
    };
  }
  async mutate(actor, input) {
    await this.authorize(actor);
    exact(input, ["idempotencyKey", "changes"]);
    idempotencyKey(input.idempotencyKey);
    if (
      !Array.isArray(input.changes) ||
      !input.changes.length ||
      input.changes.length > 25
    )
      throw fail(400, "Select 1 to 25 changes");
    const seen = new Set();
    for (const c of input.changes) {
      exact(c, [
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
        "scheduledDay",
      ]);
      text(c.storyId, "story");
      revision(c.expectedRevision);
      if (seen.has(c.storyId))
        throw fail(400, "One change per story per request");
      seen.add(c.storyId);
      if (
        ![
          "story.patch",
          "assignment.place",
          "assignment.remove",
          "legacy.schedule",
        ].includes(c.kind)
      )
        throw fail(400, "Unsupported workspace action");
    }
    const memberIds = new Set(
      (await this.members(actor)).map((member) => member.id),
    );
    const requestHash = hash(input),
      operationId = randomUUID(),
      eventId = randomUUID(),
      now = new Date().toISOString(),
      ids = input.changes.map(() => randomUUID());
    let result;
    await this.repo.mutate((state) => {
      const data = workspace(state),
        prior = data.receipts.find(
          (r) => r.idempotencyKey === input.idempotencyKey,
        );
      if (prior) {
        if (prior.actorId !== actor.id || prior.requestHash !== requestHash)
          throw fail(409, "Idempotency key already used");
        result = structuredClone(prior.result);
        return state;
      }
      if (
        data.receipts.some(
          (receipt) => receipt.undoKey === input.idempotencyKey,
        )
      )
        throw fail(409, "Idempotency key already used for undo");
      const outcomes = [],
        undo = [],
        beforeWorkspace = structuredClone({
          assignments: data.assignments,
          buckets: data.buckets,
        });
      input.changes.forEach((change, index) => {
        // A rejected item must not leave partial ordering or metadata changes.
        const candidate = structuredClone(state);
        try {
          const story = candidate.backlog.find((s) => s.id === change.storyId);
          if (!story) throw fail(404, "Story not found");
          if (story.revision !== change.expectedRevision)
            throw fail(409, "Story revision changed");
          const before = Object.fromEntries(
            [
              "title",
              "category",
              "assigneeId",
              "status",
              "scheduledDay",
              "scheduleSchemaVersion",
            ]
              .filter((key) => story[key] !== undefined)
              .map((key) => [key, story[key]]),
          );
          this.apply(candidate, story, change, ids[index], now, memberIds);
          story.revision++;
          story.updatedAt = now;
          state.backlog = candidate.backlog;
          state.workspace = candidate.workspace;
          undo.push({
            storyId: story.id,
            before,
            afterRevision: story.revision,
          });
          outcomes.push({
            storyId: story.id,
            status: "applied",
            row: storyRow(story, state),
          });
        } catch (error) {
          outcomes.push({
            storyId: change.storyId,
            status: error.status === 409 ? "conflict" : "rejected",
            code: error.status || 400,
            message: error.message,
          });
        }
      });
      const active = workspace(state);
      result = { operationId, outcomes };
      active.events.push({
        id: eventId,
        operationId,
        actorId: actor.id,
        createdAt: now,
        action: "workspace.mutate",
        storyIds: outcomes
          .filter((o) => o.status === "applied")
          .map((o) => o.storyId),
      });
      active.events = active.events.slice(-500);
      // Undo is operation-wide and guarded against any subsequent workspace change.
      const receipt = {
        idempotencyKey: input.idempotencyKey,
        requestHash,
        createdAt: now,
        actorId: actor.id,
        result: structuredClone(result),
        undo,
        beforeWorkspace,
        afterWorkspaceHash: hash({
          assignments: active.assignments,
          buckets: active.buckets,
        }),
      };
      active.receipts.push(receipt);
      active.receipts = active.receipts.slice(-20);
      while (
        active.receipts.length > 1 &&
        Buffer.byteLength(JSON.stringify(active.receipts)) > 1024 * 1024
      )
        active.receipts.shift();
      return state;
    });
    return result;
  }
  apply(state, story, c, id, now, memberIds) {
    const data = workspace(state);
    const common = ["kind", "storyId", "expectedRevision"];
    const fields = {
      "story.patch": ["patch"],
      "legacy.schedule": ["scheduledDay"],
      "assignment.remove": [
        "assignmentId",
        "expectedAssignmentRevision",
        "sourceBucketRevision",
      ],
      "assignment.place": [
        "assignmentId",
        "expectedAssignmentRevision",
        "unit",
        "format",
        "date",
        "timeZone",
        "targetBucketRevision",
        "sourceBucketRevision",
        "beforeAssignmentId",
      ],
    };
    exact(c, [...common, ...fields[c.kind]]);
    if (c.kind === "story.patch") {
      exact(c.patch, ["title", "category", "status", "assigneeId"]);
      if (!Object.keys(c.patch).length) throw fail(400, "Empty patch");
      if (c.patch.assigneeId !== undefined) {
        if (c.patch.assigneeId !== null && !memberIds.has(c.patch.assigneeId))
          throw fail(400, "Assignee must be a current brand member");
        story.assigneeId = c.patch.assigneeId;
      }
      for (const key of ["title", "category"])
        if (c.patch[key] !== undefined)
          story[key] = text(c.patch[key], key, key === "title" ? 500 : 100);
      if (c.patch.status !== undefined) {
        if (
          data.assignments.some(
            (a) =>
              !a.deletedAt && a.storyId === story.id && a.unit === "campaign",
          )
        )
          throw fail(
            400,
            "Remove the campaign assignment before changing its derived status",
          );
        if (
          !["In Backlog", "Ready for Campaign", "Draft Ready"].includes(
            c.patch.status,
          )
        )
          throw fail(400, "Status is derived or not editable");
        if (c.patch.status === "Ready for Campaign") getApprovedClaims(story);
        if (c.patch.status === "Draft Ready" && !story.campaignDraft)
          throw fail(400, "A saved campaign is required");
        if (story.status === "Exported")
          throw fail(400, "Export state is derived");
        story.status = c.patch.status;
      }
      return;
    }
    if (c.kind === "legacy.schedule") {
      if (!DAYS.includes(c.scheduledDay)) throw fail(400, "Invalid weekday");
      if (
        data.assignments.some(
          (a) =>
            !a.deletedAt && a.storyId === story.id && a.unit === "campaign",
        )
      )
        throw fail(
          409,
          "Remove the dated campaign assignment before using undated weekdays",
        );
      story.scheduledDay = c.scheduledDay;
      story.scheduleSchemaVersion = 0;
      if (story.status !== "Exported") story.status = "Scheduled";
      return;
    }
    let assignment = c.assignmentId
      ? data.assignments.find(
          (a) =>
            a.id === c.assignmentId && !a.deletedAt && a.storyId === story.id,
        )
      : null;
    if (c.assignmentId && !assignment) throw fail(404, "Assignment not found");
    if (
      assignment &&
      revision(c.expectedAssignmentRevision) !== assignment.revision
    )
      throw fail(409, "Assignment revision changed");
    const source = assignment
      ? data.buckets[bucketId(assignment.date, assignment.timeZone)]
      : null;
    if (source && revision(c.sourceBucketRevision) !== source.revision)
      throw fail(409, "Source bucket order changed");
    if (c.kind === "assignment.remove") {
      if (!assignment) throw fail(404, "Assignment not found");
      source.assignmentIds = source.assignmentIds.filter(
        (value) => value !== assignment.id,
      );
      source.revision++;
      assignment.deletedAt = now;
      assignment.revision++;
      if (assignment.unit === "campaign") {
        story.scheduledDay = null;
        story.scheduleSchemaVersion = 1;
        if (story.status === "Scheduled")
          story.status = story.campaignDraft ? "Draft Ready" : "In Backlog";
      }
      return;
    }
    const date = localDate(c.date),
      zone = timeZone(c.timeZone),
      key = bucketId(date, zone),
      target = data.buckets[key] || {
        date,
        timeZone: zone,
        revision: 0,
        assignmentIds: [],
      };
    if (revision(c.targetBucketRevision) !== target.revision)
      throw fail(409, "Target bucket order changed");
    if (
      !["campaign", "format"].includes(c.unit) ||
      (c.unit === "format"
        ? !FORMATS.includes(c.format)
        : c.format !== undefined && c.format !== null)
    )
      throw fail(400, "Specify campaign or a supported format unit");
    const format = c.unit === "campaign" ? null : c.format;
    if (
      assignment &&
      (assignment.unit !== c.unit || assignment.format !== format)
    )
      throw fail(400, "Assignment unit cannot change");
    if (
      data.assignments.some(
        (a) =>
          !a.deletedAt &&
          a.storyId === story.id &&
          a.unit === c.unit &&
          a.format === format &&
          a.id !== assignment?.id,
      )
    )
      throw fail(409, "Unit is already assigned");
    if (data.assignments.length >= 1000 && !assignment)
      throw fail(409, "Workspace assignment capacity reached");
    const anchor = c.beforeAssignmentId ?? null;
    if (
      anchor !== null &&
      (!target.assignmentIds.includes(anchor) || anchor === assignment?.id)
    )
      throw fail(409, "Order anchor no longer exists");
    if (source) {
      source.assignmentIds = source.assignmentIds.filter(
        (value) => value !== assignment.id,
      );
      if (source !== target) source.revision++;
    }
    if (!assignment) {
      assignment = {
        id,
        storyId: story.id,
        unit: c.unit,
        format,
        revision: 0,
        organizationId: this.scope.organizationId,
        brandId: this.scope.brandId,
      };
      data.assignments.push(assignment);
    }
    Object.assign(assignment, {
      date,
      timeZone: zone,
      revision: assignment.revision + 1,
      deletedAt: null,
    });
    const position =
      anchor === null
        ? target.assignmentIds.length
        : target.assignmentIds.indexOf(anchor);
    target.assignmentIds.splice(position, 0, assignment.id);
    target.revision++;
    data.buckets[key] = target;
    if (c.unit === "campaign") {
      story.scheduleSchemaVersion = 1;
      story.scheduledDay = DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
      if (story.status !== "Exported") story.status = "Scheduled";
    }
  }
  async undo(actor, operationId, input) {
    await this.authorize(actor);
    const memberIds = new Set(
      (await this.members(actor)).map((member) => member.id),
    );
    const eventId = randomUUID(),
      now = new Date().toISOString();
    exact(input, ["idempotencyKey"]);
    idempotencyKey(input.idempotencyKey);
    let result;
    await this.repo.mutate((state) => {
      const data = workspace(state),
        receipt = data.receipts.find(
          (r) => r.result.operationId === operationId,
        );
      if (!receipt) throw fail(404, "Operation receipt expired or not found");
      if (receipt.actorId !== actor.id && actor.role !== "founder")
        throw fail(403, "Operation belongs to another actor");
      if (receipt.undone) {
        if (receipt.undoKey !== input.idempotencyKey)
          throw fail(409, "Operation already undone");
        result = receipt.undoResult;
        return state;
      }
      if (!receipt.undo.length)
        throw fail(409, "Operation has no applied changes to undo");
      if (
        data.receipts.some(
          (r) =>
            r.idempotencyKey === input.idempotencyKey ||
            r.undoKey === input.idempotencyKey,
        )
      )
        throw fail(409, "Idempotency key already used");
      if (
        hash({ assignments: data.assignments, buckets: data.buckets }) !==
          receipt.afterWorkspaceHash ||
        receipt.undo.some(
          (u) =>
            state.backlog.find((s) => s.id === u.storyId)?.revision !==
            u.afterRevision,
        )
      )
        throw fail(409, "Workspace changed; undo would overwrite newer work");
      if (
        receipt.undo.some(
          (item) =>
            item.before.assigneeId && !memberIds.has(item.before.assigneeId),
        )
      )
        throw fail(409, "An original assignee no longer belongs to this brand");
      for (const item of receipt.undo) {
        const current = state.backlog.find((s) => s.id === item.storyId);
        for (const key of [
          "title",
          "category",
          "assigneeId",
          "status",
          "scheduledDay",
          "scheduleSchemaVersion",
        ]) {
          if (item.before[key] === undefined) delete current[key];
          else current[key] = item.before[key];
        }
        current.revision++;
        current.updatedAt = now;
      }
      // Restore the pre-operation ordering but advance every surviving revision.
      const first = receipt.undo[0];
      if (first) {
        const before = receipt.beforeWorkspace;
        const currentBuckets = structuredClone(data.buckets);
        data.assignments = before.assignments.map((a) => ({
          ...a,
          revision:
            Math.max(
              a.revision,
              state.workspace.assignments.find((v) => v.id === a.id)
                ?.revision || 0,
            ) + 1,
        }));
        data.buckets = Object.fromEntries(
          Object.entries(currentBuckets).map(([key, b]) => [
            key,
            {
              ...b,
              assignmentIds: before.buckets[key]?.assignmentIds || [],
              revision: b.revision + 1,
            },
          ]),
        );
      }
      data.events.push({
        id: eventId,
        operationId,
        actorId: actor.id,
        createdAt: now,
        action: "workspace.undo",
        storyIds: receipt.undo.map((item) => item.storyId),
      });
      data.events = data.events.slice(-500);
      receipt.undone = true;
      receipt.undoKey = input.idempotencyKey;
      result = {
        operationId,
        undone: true,
        rows: receipt.undo.map((u) =>
          storyRow(
            state.backlog.find((s) => s.id === u.storyId),
            state,
          ),
        ),
      };
      receipt.undoResult = structuredClone(result);
      return state;
    });
    return result;
  }
}
