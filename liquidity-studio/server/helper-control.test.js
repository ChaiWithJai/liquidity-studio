import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { ScopedRepository } from "./repository.js";
import { HelperControlService } from "./helper-control.js";
async function fixture(t) {
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  const platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  for (const [username, role] of [
    ["control-owner", "founder"],
    ["control-helper", "marketer"],
  ])
    await platform.identity.provision({
      username,
      password: "fixture-control-2937!",
      role,
    });
  const users = (await store.get("identity")).users,
    owner = users.find((x) => x.username === "control-owner"),
    helper = users.find((x) => x.username === "control-helper");
  const scope = {
      organizationId: "org_default",
      brandId: "brand_default",
      preset: "liquidity_desk",
    },
    repo = new ScopedRepository(store, scope);
  await repo.ready;
  const workspace = platform.workspace(scope, repo),
    control = new HelperControlService({
      workspace,
      clock: () => Date.parse("2026-10-18T03:00:00Z"),
    });
  const story = (await repo.read()).backlog[0];
  const grant = await control.createGrant(owner, {
    helperId: helper.id,
    storyIds: [story.id],
    kinds: ["story.patch"],
    expiresAt: "2026-10-18T03:10:00Z",
  });
  const changes = [
    {
      kind: "story.patch",
      storyId: story.id,
      expectedRevision: story.revision,
      patch: { category: "Helper proposal" },
    },
  ];
  return {
    store,
    platform,
    owner,
    helper,
    scope,
    repo,
    workspace,
    control,
    story,
    grant,
    changes,
  };
}
test("approved scoped helper proposal commits through existing revision/receipt path and replay cannot run after pause", async (t) => {
  const f = await fixture(t);
  const p = await f.control.propose(f.helper, {
    grantId: f.grant.id,
    epoch: 1,
    changes: f.changes,
  });
  assert.equal((await f.repo.read()).backlog[0].category, f.story.category);
  await f.control.approve(f.owner, p.id, { expectedRevision: 1 });
  const input = {
    grantId: f.grant.id,
    proposalId: p.id,
    epoch: 1,
    idempotencyKey: randomUUID(),
  };
  const applied = await f.control.apply(f.helper, input);
  assert.equal(applied.outcomes[0].status, "applied");
  await f.control.transition(f.owner, f.grant.id, {
    expectedEpoch: 1,
    action: "pause",
  });
  assert.deepEqual(await f.control.apply(f.helper, input), applied);
  await assert.rejects(
    f.control.apply(f.helper, { ...input, idempotencyKey: randomUUID() }),
    /grant|proposal/i,
  );
  assert.equal((await f.repo.read()).backlog[0].revision, f.story.revision + 1);
  assert.equal((await f.workspace.operations(f.owner))[0].actorId, f.helper.id);
});
test("takeover fences pending helper, stale proposals preserve newer human metadata, and portable exports omit control authority", async (t) => {
  const f = await fixture(t);
  const p = await f.control.propose(f.helper, {
    grantId: f.grant.id,
    epoch: 1,
    changes: f.changes,
  });
  await f.control.approve(f.owner, p.id, { expectedRevision: 1 });
  await f.workspace.mutate(f.owner, {
    idempotencyKey: randomUUID(),
    changes: [{ ...f.changes[0], patch: { category: "Human newer" } }],
  });
  const applied = await f.control.apply(f.helper, {
    grantId: f.grant.id,
    proposalId: p.id,
    epoch: 1,
    idempotencyKey: randomUUID(),
  });
  assert.equal(applied.outcomes[0].status, "conflict");
  assert.equal((await f.repo.read()).backlog[0].category, "Human newer");
  const next = await f.control.propose(f.helper, {
    grantId: f.grant.id,
    epoch: 1,
    changes: [{ ...f.changes[0], expectedRevision: f.story.revision + 1 }],
  });
  await f.control.approve(f.owner, next.id, { expectedRevision: 1 });
  await f.control.transition(f.owner, f.grant.id, {
    expectedEpoch: 1,
    action: "takeover",
  });
  await assert.rejects(
    f.control.apply(f.helper, {
      grantId: f.grant.id,
      proposalId: next.id,
      epoch: 1,
      idempotencyKey: randomUUID(),
    }),
    /grant/i,
  );
  assert.equal((await f.repo.exportData()).data.operatorControl, undefined);
});
test("scope and action boundaries reject foreign IDs and source approvals without changing content", async (t) => {
  const f = await fixture(t),
    initial = await f.repo.read();
  await assert.rejects(
    f.control.propose(f.helper, {
      grantId: f.grant.id,
      epoch: 1,
      changes: [{ ...f.changes[0], storyId: "foreign-story" }],
    }),
    /grant/i,
  );
  await assert.rejects(
    f.control.propose(f.helper, {
      grantId: f.grant.id,
      epoch: 1,
      changes: [
        { ...f.changes[0], patch: { sourceReview: { approved: true } } },
      ],
    }),
    /field/i,
  );
  await assert.rejects(
    f.control.propose(f.owner, {
      grantId: f.grant.id,
      epoch: 1,
      changes: f.changes,
    }),
    /grant/i,
  );
  const p = await f.control.propose(f.helper, {
    grantId: f.grant.id,
    epoch: 1,
    changes: f.changes,
  });
  await assert.rejects(
    f.control.approve(f.helper, p.id, { expectedRevision: 1 }),
    /owner/i,
  );
  assert.deepEqual((await f.repo.read()).backlog, initial.backlog);
  assert.equal(p.preview[0].after.revision, p.preview[0].before.revision + 1);
  assert.notEqual(p.preview[0].before.category, p.preview[0].after.category);
});
test("pause between proposal observation and content transaction is fenced; resume requires a fresh epoch proposal", async (t) => {
  const f = await fixture(t),
    p = await f.control.propose(f.helper, {
      grantId: f.grant.id,
      epoch: 1,
      changes: f.changes,
    });
  await f.control.approve(f.owner, p.id, { expectedRevision: 1 });
  const original = f.workspace.mutate.bind(f.workspace);
  let pause = true;
  f.workspace.mutate = async (...args) => {
    if (pause) {
      pause = false;
      await f.control.transition(f.owner, f.grant.id, {
        expectedEpoch: 1,
        action: "pause",
      });
    }
    return original(...args);
  };
  await assert.rejects(
    f.control.apply(f.helper, {
      grantId: f.grant.id,
      proposalId: p.id,
      epoch: 1,
      idempotencyKey: randomUUID(),
    }),
    /grant/i,
  );
  assert.equal((await f.repo.read()).backlog[0].revision, f.story.revision);
  const resumed = await f.control.transition(f.owner, f.grant.id, {
    expectedEpoch: 2,
    action: "resume",
  });
  assert.equal(resumed.epoch, 3);
  await assert.rejects(
    f.control.apply(f.helper, {
      grantId: f.grant.id,
      proposalId: p.id,
      epoch: 3,
      idempotencyKey: randomUUID(),
    }),
    /proposal/i,
  );
});
test("expiry and current membership revocation prevent new execution", async (t) => {
  const f = await fixture(t),
    p = await f.control.propose(f.helper, {
      grantId: f.grant.id,
      epoch: 1,
      changes: f.changes,
    });
  await f.control.approve(f.owner, p.id, { expectedRevision: 1 });
  f.control.clock = () => Date.parse("2026-10-18T03:11:00Z");
  await assert.rejects(
    f.control.apply(f.helper, {
      grantId: f.grant.id,
      proposalId: p.id,
      epoch: 1,
      idempotencyKey: randomUUID(),
    }),
    /expired/i,
  );
  f.control.clock = () => Date.parse("2026-10-18T03:00:00Z");
  await f.store.update("identity", (state) => {
    state.memberships = state.memberships.filter(
      (m) => m.userId !== f.helper.id,
    );
    return state;
  });
  await assert.rejects(
    f.control.apply(f.helper, {
      grantId: f.grant.id,
      proposalId: p.id,
      epoch: 1,
      idempotencyKey: randomUUID(),
    }),
  );
  assert.equal((await f.repo.read()).backlog[0].revision, f.story.revision);
});

test("malformed helper observations fail as explicit client errors", async (t) => {
  const f = await fixture(t);
  for (const change of [
    null,
    [],
    42,
    { ...f.changes[0], actorId: f.owner.id },
  ]) {
    await assert.rejects(
      f.control.propose(f.helper, {
        grantId: f.grant.id,
        epoch: 1,
        changes: [change],
      }),
      (error) => error.status === 400,
    );
  }
  assert.equal((await f.repo.read()).backlog[0].revision, f.story.revision);
});
test("advisory presence expires and cannot claim another actor client or confer proposal rights", async (t) => {
  const f = await fixture(t),
    clientId = randomUUID();
  await f.control.heartbeat(f.owner, {
    clientId,
    clientKind: "model-helper",
    storyId: f.story.id,
    observedRevision: f.story.revision,
  });
  await assert.rejects(
    f.control.heartbeat(f.helper, {
      clientId,
      clientKind: "human",
      storyId: f.story.id,
      observedRevision: f.story.revision,
    }),
    (error) => error.status === 409,
  );
  assert.equal((await f.control.list(f.helper)).presence[0].connected, true);
  f.control.clock = () => Date.parse("2026-10-18T03:00:31Z");
  assert.equal((await f.control.list(f.helper)).presence[0].connected, false);
  await assert.rejects(
    f.control.propose(f.owner, {
      grantId: f.grant.id,
      epoch: 1,
      changes: f.changes,
    }),
    (error) => error.status === 403,
  );
});
