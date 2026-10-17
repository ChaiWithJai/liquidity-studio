import test from "node:test";
import assert from "node:assert/strict";
import { validateFeedUrl, normalizeFeed, discoverInto } from "./discovery.js";
import { ScopedRepository } from "./repository.js";
import { DurableStore } from "./storage.js";
test("feed host policy blocks localhost/IP/nonHTTPS and all imported claims need review", async () => {
  const previous = process.env.STUDIO_DISCOVERY_HOSTS;
  process.env.STUDIO_DISCOVERY_HOSTS = "feed.example";
  try {
    for (const url of [
      "http://feed.example",
      "https://127.0.0.1",
      "https://feed.example.evil",
      "https://user:secret@feed.example",
      "https://feed.example:8443",
    ])
      assert.throws(() => validateFeedUrl(url));
    assert.equal(
      validateFeedUrl("https://feed.example/news").hostname,
      "feed.example",
    );
    const payload = {
      items: [
        {
          sourceId: "unique-feed-id",
          title: "Reported source",
          sourceClaims: [
            {
              text: "A reported claim",
              sourceUrl: "https://source.example/article",
              status: "approved",
            },
          ],
        },
      ],
    };
    const normalized = normalizeFeed(payload);
    assert.equal(normalized[0].sourceClaims[0].status, "unreviewed");
    const store = new DurableStore(":memory:");
    const repo = new ScopedRepository(store, {
      organizationId: "org",
      brandId: "brand",
      preset: "vedic_dharma",
    });
    await repo.mutate((state) => ({
      ...state,
      discovery: { feedUrl: "https://feed.example/news" },
    }));
    assert.equal((await discoverInto(repo, async () => payload)).added, 1);
    assert.equal((await discoverInto(repo, async () => payload)).added, 0);
    assert.equal((await repo.listBacklog())[0].verifiedFacts.length, 0);
    store.close();
  } finally {
    if (previous === undefined) delete process.env.STUDIO_DISCOVERY_HOSTS;
    else process.env.STUDIO_DISCOVERY_HOSTS = previous;
  }
});
