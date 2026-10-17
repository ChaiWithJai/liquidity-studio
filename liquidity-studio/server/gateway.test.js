import { test } from "node:test";
import assert from "node:assert/strict";
import { AIGateway } from "./gateway.js";
import {
  generateMultiFormatCampaign,
  BRAND_PRESETS,
  INITIAL_CONTENT_BACKLOG,
  evaluateCampaign,
} from "./domain.js";
import {
  campaignFromApprovedClaims,
  getApprovedClaims,
  validateCampaign,
} from "./source-integrity.js";

const story = {
  id: "reviewed",
  title: "Source notes",
  sourceClaims: [
    {
      id: "source-one",
      kind: "financial",
      text: "$80M reported revenue",
      sourceUrl: "https://example.test/report",
      status: "approved",
    },
  ],
};
const run = (gateway, input = story, brandProfile) =>
  generateMultiFormatCampaign({ gateway, story: input, brandProfile });
const successfulResponse = (campaign) => ({
  ok: true,
  text: async () =>
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(campaign) } }],
    }),
});
const gateway = (config = {}) =>
  new AIGateway({
    provider: "openai-gateway",
    gatewayUrl: "https://example.test/v1",
    ...config,
  });

test("legacy seed facts cannot become verified by synthetic generation", async () => {
  await assert.rejects(
    run(gateway({ allowSynthetic: true }), INITIAL_CONTENT_BACKLOG[0]),
    /Approve at least one sourced claim/,
  );
  assert.throws(
    () =>
      getApprovedClaims({
        sourceClaims: [{ ...story.sourceClaims[0], status: "unreviewed" }],
      }),
    /Approve at least/,
  );
});

test("missing credentials fail closed; explicit synthetic preserves approved excerpts", async () => {
  const saved = process.env.AI_GATEWAY_KEY;
  delete process.env.AI_GATEWAY_KEY;
  try {
    await assert.rejects(
      run(gateway({ allowSynthetic: false })),
      (error) => error.code === "PROVIDER_CREDENTIALS_MISSING",
    );
    const result = await run(gateway({ allowSynthetic: true }));
    assert.equal(result.trace.status, "degraded");
    assert.equal(result.output.provenance.mode, "synthetic");
    assert.equal(
      result.output.infographic.statRows[0],
      story.sourceClaims[0].text,
    );
    assert.deepEqual(result.output.provenance.claimIds, ["source-one"]);
    assert.equal(result.output.provenance.factualAccuracy, "not_assessed");
  } finally {
    saved === undefined
      ? delete process.env.AI_GATEWAY_KEY
      : (process.env.AI_GATEWAY_KEY = saved);
  }
});

test("changed units, source attribution, labels and unsupported qualitative claims are rejected", () => {
  for (const mutate of [
    (output) => (output.infographic.statRows[0] = "80% margin"),
    (output) => (output.carousel.slides[0].title = "Gross margin"),
    (output) => (output.infographic.caption = "This treatment cures anxiety"),
    (output) => (output.reel.beats[0].voiceover = "$80M profit"),
  ]) {
    const output = campaignFromApprovedClaims(story);
    mutate(output);
    assert.throws(
      () => validateCampaign(output, story),
      /approved source excerpts/,
    );
  }
});

test("clinical claims require separately recorded clinical review; malformed sources are blocked", () => {
  const clinical = {
    sourceClaims: [{ ...story.sourceClaims[0], kind: "clinical" }],
  };
  assert.throws(
    () => getApprovedClaims(clinical),
    /Clinical claims remain quarantined/,
  );
  clinical.sourceClaims[0].clinicalReview = {
    reviewerId: "reviewer",
    reviewedAt: "2026-10-17T12:00:00Z",
  };
  assert.equal(getApprovedClaims(clinical).length, 1);
  assert.throws(
    () =>
      getApprovedClaims({
        sourceClaims: [
          { ...story.sourceClaims[0], sourceUrl: "javascript:alert(1)" },
        ],
      }),
    /HTTPS source/,
  );
});

test("both presets evaluate source coverage without requiring financial numbers", () => {
  const culture = {
    ...story,
    sourceClaims: [
      {
        ...story.sourceClaims[0],
        kind: "cultural",
        text: "This archive records a cultural practice.",
      },
    ],
  };
  const campaign = campaignFromApprovedClaims(culture);
  const result = evaluateCampaign(
    campaign,
    culture,
    BRAND_PRESETS.vedic_dharma,
  );
  assert.equal(result.overallPass, true);
  assert.equal(result.domain, "culture-wellbeing");
  assert.equal(result.factualAccuracy, "not_assessed");
  assert.equal(result.editorialReviewRequired, true);
  assert.equal(BRAND_PRESETS.vedic_dharma.logoText, "CWJ // ॐ");
  assert.equal(
    BRAND_PRESETS.vedic_dharma.strategy.clinicalClaimsQuarantined,
    true,
  );
});

test("provider failure diagnostics, URLs and keys never escape public errors/traces", async () => {
  process.env.AI_GATEWAY_KEY = "test-only";
  try {
    const failed = gateway({
      allowSynthetic: false,
      fetch: async () => {
        throw new Error("https://secret.test?key=secret-key");
      },
    });
    await assert.rejects(run(failed), (error) => {
      assert.doesNotMatch(
        JSON.stringify({ message: error.message, trace: error.trace }),
        /secret|https:/,
      );
      return error.trace.status === "error";
    });
    const fallback = await run(
      gateway({
        allowSynthetic: true,
        fetch: async () => ({ ok: false, status: 503 }),
      }),
    );
    assert.equal(fallback.trace.status, "degraded");
    assert.equal(fallback.output.provenance.reason, "PROVIDER_HTTP_ERROR");
  } finally {
    delete process.env.AI_GATEWAY_KEY;
  }
});

test("provider response and source validation fail closed rather than approving malformed output", async () => {
  process.env.AI_GATEWAY_KEY = "test-only";
  try {
    await assert.rejects(
      run(
        gateway({
          allowSynthetic: false,
          fetch: async () => successfulResponse({ infographic: {} }),
        }),
      ),
      (error) => error.code === "UNSUPPORTED_GENERATED_CLAIM",
    );
    const result = await run(
      gateway({
        allowSynthetic: false,
        fetch: async () =>
          successfulResponse(campaignFromApprovedClaims(story)),
      }),
    );
    assert.equal(result.trace.provider, "openai-gateway");
    assert.equal(result.output.provenance.mode, "provider");
  } finally {
    delete process.env.AI_GATEWAY_KEY;
  }
});

test("deadline covers stalled fetch/response and resets the request", async () => {
  process.env.AI_GATEWAY_KEY = "test-only";
  try {
    let signal;
    await assert.rejects(
      run(
        gateway({
          allowSynthetic: false,
          timeoutMs: 10,
          fetch: async (_, options) => {
            signal = options.signal;
            return { ok: true, text: () => new Promise(() => {}) };
          },
        }),
      ),
      (error) => error.code === "PROVIDER_TIMEOUT",
    );
    assert.equal(signal.aborted, true);
  } finally {
    delete process.env.AI_GATEWAY_KEY;
  }
});

test("Gemini uses header authentication, one configured model and bounded generation", async () => {
  process.env.GEMINI_API_KEY = "test-only";
  try {
    const result = await run(
      new AIGateway({
        provider: "gcp-gemini",
        model: "gemini-3.8-flash",
        allowSynthetic: false,
        fetch: async (url, options) => {
          assert.equal(
            url,
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
          );
          assert.equal(options.headers["x-goog-api-key"], "test-only");
          assert.equal(
            JSON.parse(options.body).generationConfig.maxOutputTokens,
            4096,
          );
          assert.equal(options.redirect, "error");
          return {
            ok: true,
            text: async () =>
              JSON.stringify({
                candidates: [
                  {
                    content: {
                      parts: [
                        {
                          text: JSON.stringify(
                            campaignFromApprovedClaims(story),
                          ),
                        },
                      ],
                    },
                  },
                ],
              }),
          };
        },
      }),
    );
    assert.equal(result.trace.provider, "gcp-gemini");
  } finally {
    delete process.env.GEMINI_API_KEY;
  }
});

test("Vertex uses the documented OpenAI-compatible endpoint and OAuth token resolver", async () => {
  const result = await run(
    new AIGateway({
      provider: "gcp-vertex",
      projectId: "pilot-project",
      location: "us-central1",
      model: "gemini-2.5-flash",
      allowSynthetic: false,
      accessTokenProvider: async () => "test-oauth",
      fetch: async (url, options) => {
        assert.equal(
          url,
          "https://us-central1-aiplatform.googleapis.com/v1/projects/pilot-project/locations/us-central1/endpoints/openapi/chat/completions",
        );
        assert.equal(options.headers.Authorization, "Bearer test-oauth");
        assert.equal(JSON.parse(options.body).model, "google/gemini-2.5-flash");
        return successfulResponse(campaignFromApprovedClaims(story));
      },
    }),
  );
  assert.equal(result.trace.provider, "gcp-vertex");
});

test("configuration rejects invalid providers, credential URLs and unbounded limits", () => {
  assert.throws(
    () => gateway({ provider: "not-a-provider" }),
    /Invalid AI provider/,
  );
  assert.throws(
    () => gateway({ gatewayUrl: "https://example.test?key=secret" }),
    /HTTPS/,
  );
  assert.throws(() => gateway({ timeoutMs: 0 }), /Invalid AI limits/);
  assert.throws(
    () => new AIGateway({ provider: "gcp-vertex", projectId: "" }),
    /explicit project/,
  );
});

test("source claims require explicit classification instead of silently treating clinical content as general", () => {
  const unclassified = { sourceClaims: [{ ...story.sourceClaims[0] }] };
  delete unclassified.sourceClaims[0].kind;
  assert.throws(
    () => getApprovedClaims(unclassified),
    (error) => error.code === "SOURCE_KIND_REQUIRED",
  );
});

test("CWJ preserves founder positioning without promoting research tasks or titles to verified claims", async () => {
  const preset = BRAND_PRESETS.vedic_dharma;
  assert.equal(preset.websiteUrl, "https://chaiwithjai.com");
  assert.equal(preset.strategy.valueGroups.length, 4);
  assert.equal(preset.strategy.pillars.length, 5);
  assert.equal(preset.researchBacklog.length, 5);
  for (const task of preset.researchBacklog) {
    if (task.id !== "vedic_research_5") assert.deepEqual(task.sourceClaims, []);
    assert.deepEqual(task.verifiedFacts, []);
    await assert.rejects(
      run(gateway({ allowSynthetic: true }), task, preset),
      /Approve at least one sourced claim/,
    );
  }
  const yoga = preset.researchBacklog[4];
  assert.equal(yoga.title, "Yoga Sutras: yamas, niyamas and posture");
  assert.deepEqual(yoga.sourceClaims, [
    {
      id: "yoga-sutras-ii-29",
      text: "Yoga Sutra II.29 describes eight means of yoga, including ethical commandments, observances, posture, breath regulation and meditation.",
      sourceUrl: "https://www.gutenberg.org/cache/epub/2526/pg2526-images.html",
      kind: "cultural",
      status: "unreviewed",
    },
  ]);
  assert.equal(
    getApprovedClaims({
      ...yoga,
      sourceClaims: yoga.sourceClaims.map((claim) => ({
        ...claim,
        status: "approved",
      })),
    }).length,
    1,
  );
  const misleadingTitle = { ...story, title: "A $250M cure for every illness" };
  const campaign = campaignFromApprovedClaims(misleadingTitle);
  assert.doesNotMatch(JSON.stringify(campaign), /250M|cure|illness/);
});

test("provider prompts exclude internal source reviewer identity", async () => {
  const clinical = {
    ...story,
    sourceClaims: [
      {
        ...story.sourceClaims[0],
        kind: "clinical",
        clinicalReview: {
          reviewerId: "private-reviewer-id",
          reviewedAt: "2026-10-17T12:00:00Z",
        },
      },
    ],
  };
  const mock = {
    async generateStructured({ prompt }) {
      assert.doesNotMatch(prompt, /private-reviewer-id|clinicalReview/);
      return {};
    },
  };
  await run(mock, clinical);
});

test("financial research seed cites the club announcement without approving legacy claims", async () => {
  const { INITIAL_CONTENT_BACKLOG, normalizeLegacyResearch } = await import(
    "./domain.js"
  );
  const seed = normalizeLegacyResearch(INITIAL_CONTENT_BACKLOG[0]);
  assert.equal(seed.status, "In Backlog");
  assert.equal(seed.reviewStatus, "unreviewed");
  assert.equal(seed.trendBadge, "Source Review Required");
  assert.deepEqual(seed.verifiedFacts, []);
  assert.equal(
    seed.sourceClaims[0].sourceUrl,
    "https://angelcity.com/acfc-post/angel-city-ownership-agreement-announcement",
  );
  assert.match(
    seed.sourceClaims[0].text,
    /enterprise value, subject to closing conditions/,
  );
  assert.ok(
    seed.sourceClaims.every(
      (claim) => claim.status === "unreviewed" && claim.kind === "financial",
    ),
  );
  assert.ok(
    seed.sourceClaims.slice(1).every((claim) => claim.sourceUrl === null),
  );
  assert.throws(() => getApprovedClaims(seed), /Approve at least/);
  assert.ok(
    INITIAL_CONTENT_BACKLOG.map(normalizeLegacyResearch).every(
      (item) => item.status === "In Backlog",
    ),
  );
});

test("Vertex routes US/EU multi-region, global and standard regions to their documented hosts", async () => {
  for (const [location, hostname] of [
    ["us", "aiplatform.us.rep.googleapis.com"],
    ["eu", "aiplatform.eu.rep.googleapis.com"],
    ["global", "aiplatform.googleapis.com"],
    ["us-east4", "us-east4-aiplatform.googleapis.com"],
  ]) {
    let requested;
    const client = new AIGateway({
      provider: "gcp-vertex",
      projectId: "test-project",
      location,
      allowSynthetic: false,
      accessTokenProvider: async () => "test-only-token",
      fetch: async (url, options) => {
        requested = { url, body: JSON.parse(options.body) };
        return successfulResponse(campaignFromApprovedClaims(story));
      },
    });
    const result = await run(client);
    assert.equal(result.trace.status, "success");
    assert.equal(
      requested.url,
      `https://${hostname}/v1/projects/test-project/locations/${location}/endpoints/openapi/chat/completions`,
    );
    assert.equal(requested.body.max_tokens, 4096);
    assert.equal(requested.body.reasoning_effort, undefined);
  }
});

test("UTF-8 input byte policy rejects before access token, metadata, provider and synthetic fallback", async () => {
  let tokenCalls = 0,
    fetchCalls = 0;
  const previousMetadata = process.env.AI_VERTEX_USE_METADATA;
  process.env.AI_VERTEX_USE_METADATA = "true";
  try {
    for (const accessTokenProvider of [
      async () => {
        tokenCalls++;
        return "test-token";
      },
      undefined,
    ]) {
      const client = new AIGateway({
        provider: "gcp-vertex",
        projectId: "test-project",
        location: "us",
        allowSynthetic: true,
        accessTokenProvider,
        fetch: async () => {
          fetchCalls++;
          throw Error("I/O must not occur");
        },
      });
      await assert.rejects(
        client.generateStructured({
          systemInstruction: "A bounded system instruction",
          prompt: "ॐ".repeat(12000),
          responseSchema: {},
          traceMeta: { story },
        }),
        (error) =>
          error.code === "PROVIDER_INPUT_TOO_LARGE" &&
          error.status === 413 &&
          error.trace.inputBytes > 32768,
      );
      await assert.rejects(
        client.generateStructured({
          systemInstruction: "x".repeat(20000),
          prompt: "y".repeat(20000),
          responseSchema: {},
          traceMeta: { story },
        }),
        { code: "PROVIDER_INPUT_TOO_LARGE" },
      );
    }
    assert.equal(tokenCalls, 0);
    assert.equal(fetchCalls, 0);
  } finally {
    if (previousMetadata === undefined)
      delete process.env.AI_VERTEX_USE_METADATA;
    else process.env.AI_VERTEX_USE_METADATA = previousMetadata;
  }
});

test("operator input/output budgets cannot be bypassed by a brand output setting", async () => {
  const saved = {
    input: process.env.AI_MAX_INPUT_BYTES,
    output: process.env.AI_MAX_OUTPUT_TOKENS,
  };
  process.env.AI_MAX_INPUT_BYTES = "256";
  process.env.AI_MAX_OUTPUT_TOKENS = "4096";
  try {
    const client = gateway({ allowSynthetic: true });
    await assert.rejects(
      client.generateStructured({
        systemInstruction: "test",
        prompt: "a".repeat(257),
        responseSchema: {},
        traceMeta: { story },
      }),
      { code: "PROVIDER_INPUT_TOO_LARGE" },
    );
    assert.throws(
      () => client.updateConfig({ maxOutputTokens: 8192 }),
      /Invalid AI limits/,
    );
    process.env.AI_MAX_INPUT_BYTES = "NaN";
    assert.throws(() => gateway(), /Invalid server AI budget limits/);
  } finally {
    for (const [key, value] of [
      ["AI_MAX_INPUT_BYTES", saved.input],
      ["AI_MAX_OUTPUT_TOKENS", saved.output],
    ])
      value === undefined
        ? delete process.env[key]
        : (process.env[key] = value);
  }
});
