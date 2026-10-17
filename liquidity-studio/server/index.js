import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { verifySchedulerIdentity, schedulerScope } from "./scheduler-auth.js";
import { createPlatform } from "./platform.js";
import { fail } from "./auth.js";
import { computePreflight } from "./preflight.js";
import { validateFeedUrl, normalizeFeed } from "./discovery.js";
import { checkReadiness } from "./operational-health.js";
import { startServer } from "./runtime.js";
const DIST_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
const formats = ["infographic", "carousel", "story", "reel"];
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
function text(value, name, max = 300) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw fail(400, `Invalid ${name}`);
  return value.trim();
}
function claims(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30)
    throw fail(400, "At least one source claim is required");
  return value.map((claim) => {
    if (!claim || typeof claim !== "object" || Array.isArray(claim))
      throw fail(400, "Invalid source claim");
    const result = {
      id: text(claim.id, "claim id", 128),
      text: text(claim.text, "claim text", 2000),
      sourceUrl: text(claim.sourceUrl, "source URL", 2048),
      status: claim.status || "unreviewed",
    };
    let url;
    try {
      url = new URL(result.sourceUrl);
    } catch {
      throw fail(400, "Invalid source URL");
    }
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !["approved", "unreviewed", "rejected"].includes(result.status)
    )
      throw fail(400, "Invalid source claim");
    if (
      claim.kind !== undefined &&
      !["financial", "cultural", "clinical", "general"].includes(claim.kind)
    )
      throw fail(400, "Invalid claim classification");
    if (result.status === "approved" && !claim.kind)
      throw fail(400, "Classify claims before approval");
    if (claim.kind) result.kind = claim.kind;
    if (claim.clinicalReviewRequested === true)
      result.clinicalReviewRequested = true;
    return result;
  });
}
async function readBody(req, limit = 262144) {
  if (!(req.headers["content-type"] || "").startsWith("application/json"))
    throw fail(415, "Use application/json");
  if (Number(req.headers["content-length"]) > limit) {
    req.bodyTooLarge = true;
    throw fail(413, "Request body is too large");
  }
  return new Promise((resolve, reject) => {
    let bytes = 0,
      settled = false;
    const chunks = [];
    const rejectOnce = (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };
    req.on("data", (chunk) => {
      if (settled) return;
      bytes += chunk.length;
      if (bytes > limit) {
        req.bodyTooLarge = true;
        rejectOnce(fail(413, "Request body is too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (settled) return;
      let value;
      try {
        value = JSON.parse(Buffer.concat(chunks).toString() || "{}");
      } catch {
        rejectOnce(fail(400, "Malformed JSON"));
        return;
      }
      if (!value || Array.isArray(value) || typeof value !== "object") {
        rejectOnce(fail(400, "JSON object required"));
        return;
      }
      settled = true;
      resolve(value);
    });
    req.on("error", () => rejectOnce(fail(400, "Request body failed")));
    req.on("aborted", () => rejectOnce(fail(400, "Request aborted")));
  });
}

function token(req) {
  const cookie = (req.headers.cookie || "")
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("studio_session="));
  return cookie?.slice("studio_session=".length);
}
export function createHttpServer(
  appContainer = null,
  {
    platform = appContainer ? null : createPlatform(),
    trustedTestMode = false,
    distDir = DIST_DIR,
  } = {},
) {
  if (appContainer && !trustedTestMode && !platform)
    throw new Error(
      "Injected containers require an authenticated platform or explicit trustedTestMode",
    );
  const server = http.createServer(async (req, res) => {
    const requestId = randomUUID();
    let activeContainer;
    res.setHeader("X-Request-Id", requestId);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("Cache-Control", "no-store");
    const json = (status, payload) => {
      if (res.headersSent) return;
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
    };
    try {
      const origin = req.headers.origin;
      const hostOrigin = `${req.socket.encrypted || process.env.STUDIO_COOKIE_SECURE === "true" ? "https" : "http"}://${req.headers.host}`;
      const allowed = (process.env.STUDIO_ALLOWED_ORIGINS || "")
        .split(",")
        .filter(Boolean);
      if (origin && origin !== hostOrigin && !allowed.includes(origin))
        throw fail(403, "Origin is not allowed");
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
      if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type,X-Organization-Id,X-Brand-Id",
        );
        return json(204, {});
      }
      let decoded;
      try {
        decoded = decodeURIComponent((req.url || "/").split("?")[0]);
      } catch {
        throw fail(400, "Invalid path encoding");
      }
      if (
        decoded.includes("\0") ||
        decoded.includes("\\") ||
        decoded.split("/").includes("..")
      )
        throw fail(400, "Invalid path");
      const url = new URL(req.url, "http://localhost");
      const route = url.pathname;
      if (req.method === "GET" && route === "/healthz")
        return json(200, { status: "alive" });
      if (req.method === "GET" && route === "/readyz") {
        if (trustedTestMode) {
          const result = await checkReadiness(appContainer);
          return json(result.status === "ready" ? 200 : 503, result);
        }
        let timer;
        const available = await Promise.race([
          Promise.resolve(platform.ready)
            .then(() =>
              platform.store.checkHealth
                ? platform.store.checkHealth()
                : platform.store.get("identity"),
            )
            .then(
              () => true,
              () => false,
            ),
          new Promise((resolve) => {
            timer = setTimeout(() => resolve(false), 1000);
          }),
        ]).finally(() => clearTimeout(timer));
        return json(available ? 200 : 503, {
          status: available ? "ready" : "not_ready",
          checks: {
            repository: available ? "available" : "unavailable",
            generationProvider: "not_checked",
            artifacts: platform.store?.checkHealth
              ? available
                ? "available"
                : "unavailable"
              : "local-database",
          },
          scope: "studio_repository_access",
        });
      }
      if (!route.startsWith("/api/")) {
        if (req.method !== "GET") throw fail(405, "Method not allowed");
        const candidate = path.resolve(
          distDir,
          "." + (route === "/" ? "/index.html" : route),
        );
        const base = fs.realpathSync(distDir);
        let file;
        try {
          file = fs.realpathSync(candidate);
        } catch {
          throw fail(404, "Not found");
        }
        if (!file.startsWith(base + path.sep) || !fs.statSync(file).isFile())
          throw fail(404, "Not found");
        const types = {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".svg": "image/svg+xml",
          ".json": "application/json",
          ".woff2": "font/woff2",
        };
        res.writeHead(200, {
          "Content-Type":
            types[path.extname(file)] || "application/octet-stream",
        });
        const stream = fs.createReadStream(file);
        stream.on("error", () => res.destroy());
        return stream.pipe(res);
      }
      if (platform?.ready) await platform.ready;
      if (route === "/api/internal/scheduled-batch" && req.method === "POST") {
        await verifySchedulerIdentity(
          (req.headers.authorization || "").replace(/^Bearer /, ""),
        );
        const scope = schedulerScope(
          url.searchParams.get("organizationId"),
          url.searchParams.get("brandId"),
        );
        const state = await platform.store.get("identity");
        const org = state.organizations.find(
          (org) => org.id === scope.organizationId,
        );
        const brand = org?.brands.find((brand) => brand.id === scope.brandId);
        if (!brand) throw fail(403, "Scheduler scope denied");
        const body = await readBody(req);
        const idempotencyKey = text(
          body.idempotencyKey || req.headers["x-cloudscheduler-scheduletime"],
          "schedule idempotency key",
          128,
        );
        const maxStories = body.maxStories ?? 10;
        if (!Number.isInteger(maxStories) || maxStories < 1 || maxStories > 50)
          throw fail(400, "Invalid batch size");
        activeContainer = await platform.forScope({
          ...scope,
          preset: brand.preset,
        });
        return json(
          200,
          await activeContainer.services.batchProductionService.runWeeklyBatch({
            idempotencyKey,
            maxStories,
          }),
        );
      }
      const identity = platform?.identity;
      let user = trustedTestMode
        ? { id: "test", username: "test", role: "founder" }
        : await identity.authenticate(token(req));
      const session = async () => {
        const organizations = await identity.organizations(user);
        return {
          user,
          organizations,
          activeScope: organizations[0] && {
            organizationId: organizations[0].id,
            brandId: organizations[0].brands[0]?.id,
          },
          permissions: { admin: user.role === "founder", canEdit: true },
        };
      };
      const cookie = (value, expires = false) => {
        const secure =
          req.socket.encrypted || process.env.STUDIO_COOKIE_SECURE === "true";
        res.setHeader(
          "Set-Cookie",
          `studio_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${expires ? 0 : 8 * 3600}${secure ? "; Secure" : ""}`,
        );
      };
      if (route === "/api/auth/login" && req.method === "POST") {
        const body = await readBody(req);
        const login = await identity.login(
          text(body.username, "username", 128),
          typeof body.password === "string" && body.password.length <= 1024
            ? body.password
            : "",
        );
        if (!login) throw fail(401, "Invalid username or password");
        user = login.user;
        cookie(login.token);
        return json(200, await session());
      }
      if (route === "/api/auth/logout" && req.method === "POST") {
        await identity.logout(token(req));
        cookie("", true);
        return json(200, { user: null });
      }
      if (!user)
        return json(401, { user: null, error: "Sign in required", requestId });
      if (route === "/api/auth/session" && req.method === "GET")
        return json(200, await session());
      const founder = () => {
        if (user.role !== "founder") throw fail(403, "Founder access required");
      };
      const body =
        req.method === "POST"
          ? await readBody(
              req,
              route === "/api/admin/import" ? 32 * 1024 * 1024 : 262144,
            )
          : {};
      if (route === "/api/admin/organizations" && req.method === "POST") {
        founder();
        return json(201, {
          organization: await identity.createOrganization(
            user,
            text(body.name, "name"),
          ),
        });
      }
      if (route === "/api/admin/brands" && req.method === "POST") {
        founder();
        if (
          !["liquidity_desk", "vedic_dharma"].includes(
            body.preset || "liquidity_desk",
          )
        )
          throw fail(400, "Invalid brand preset");
        return json(201, {
          brand: await identity.createBrand(user, {
            organizationId: text(body.organizationId, "organization"),
            name: text(body.name, "name"),
            preset: body.preset,
          }),
        });
      }
      if (route === "/api/admin/memberships" && req.method === "POST") {
        founder();
        if (
          !Array.isArray(body.brandIds) ||
          body.brandIds.some((id) => typeof id !== "string")
        )
          throw fail(400, "Invalid brand IDs");
        return json(
          200,
          await identity.setMembership(user, {
            userId: text(body.userId, "user id"),
            organizationId: text(body.organizationId, "organization"),
            brandIds: body.brandIds,
          }),
        );
      }
      const scope = trustedTestMode
        ? { organizationId: "test", brandId: "test" }
        : await identity.authorize(
            user,
            url.searchParams.get("organizationId") ||
              req.headers["x-organization-id"],
            url.searchParams.get("brandId") || req.headers["x-brand-id"],
          );
      activeContainer = trustedTestMode
        ? appContainer
        : await platform.forScope(scope);
      const { repo, telemetry } = activeContainer.ports;
      const {
        backlogCalendarService: backlog,
        multiFormatFormatterService: formatter,
        batchProductionService: batch,
        adminObservabilityService: admin,
      } = activeContainer.services;
      if (route.startsWith("/api/admin/")) founder();
      if (route === "/api/studio/bootstrap" && req.method === "GET")
        return json(200, {
          ...(await backlog.getStudioBootstrap()),
          ...(trustedTestMode ? {} : await session()),
          activeScope: scope,
        });
      if (route === "/api/studio/brand-profile" && req.method === "POST") {
        const fields = [
          "brandName",
          "tagline",
          "primaryColor",
          "secondaryColor",
          "accentColor",
          "fontFamily",
          "logoText",
          "tone",
          "audience",
          "strategy",
          "valueGroups",
          "pillars",
          "colors",
          "fonts",
          "website",
          "mission",
          "websiteUrl",
          "id",
          "contentDomain",
          "ExportFormats",
        ];
        if (Object.keys(body).some((key) => !fields.includes(key)))
          throw fail(400, "Unknown brand profile field");
        if (
          body.colors &&
          (!Array.isArray(body.colors) ||
            body.colors.some(
              (color) =>
                !color ||
                typeof color.name !== "string" ||
                typeof color.hex !== "string" ||
                !/^#[0-9a-f]{6}$/i.test(color.hex),
            ))
        )
          throw fail(400, "Invalid brand colors");
        if (
          body.fonts &&
          (!body.fonts ||
            typeof body.fonts !== "object" ||
            Array.isArray(body.fonts) ||
            Object.values(body.fonts).some(
              (font) => typeof font !== "string" || font.length > 100,
            ))
        )
          throw fail(400, "Invalid fonts");
        if (body.website || body.websiteUrl) {
          let website;
          try {
            website = new URL(body.website || body.websiteUrl);
          } catch {
            throw fail(400, "Invalid website");
          }
          if (website.protocol !== "https:") throw fail(400, "Invalid website");
        }
        if (body.strategy !== undefined) {
          const strategy = body.strategy;
          if (
            !strategy ||
            typeof strategy !== "object" ||
            Array.isArray(strategy) ||
            Object.keys(strategy).some(
              (key) =>
                ![
                  "status",
                  "editorialReviewRequired",
                  "clinicalClaimsQuarantined",
                  "valueGroups",
                  "pillars",
                ].includes(key),
            ) ||
            strategy.editorialReviewRequired !== true ||
            (strategy.clinicalClaimsQuarantined !== undefined &&
              strategy.clinicalClaimsQuarantined !== true) ||
            (strategy.status !== undefined &&
              typeof strategy.status !== "string") ||
            !Array.isArray(strategy.valueGroups) ||
            strategy.valueGroups.length > 20 ||
            strategy.valueGroups.some(
              (group) =>
                !group ||
                Array.isArray(group) ||
                (typeof group === "string"
                  ? group.length > 500
                  : typeof group !== "object" ||
                    Object.values(group).some(
                      (value) =>
                        typeof value !== "string" || value.length > 500,
                    )),
            ) ||
            !Array.isArray(strategy.pillars) ||
            strategy.pillars.length > 20 ||
            strategy.pillars.some(
              (pillar) => typeof pillar !== "string" || pillar.length > 500,
            )
          ) {
            throw fail(400, "Invalid brand strategy");
          }
        }
        if (
          Object.entries(body)
            .filter(([key]) => !["fonts", "strategy"].includes(key))
            .some(
              ([, value]) => typeof value !== "string" && !Array.isArray(value),
            )
        )
          throw fail(400, "Invalid brand profile value");
        return json(200, await backlog.updateBrandProfile(body));
      }
      if (route === "/api/studio/backlog" && req.method === "POST") {
        const sourceClaims = claims(body.sourceClaims);
        if (body.scheduledDay && !days.includes(body.scheduledDay))
          throw fail(400, "Invalid scheduled day");
        return json(
          201,
          await backlog.addStory({
            ...body,
            title: text(body.title, "title"),
            sourceClaims,
          }),
        );
      }
      if (route === "/api/studio/source-claims" && req.method === "POST") {
        const sourceClaims = claims(body.sourceClaims).map((claim) => {
          const { clinicalReviewRequested, ...reviewed } = claim;
          if (claim.status === "approved") {
            reviewed.reviewedBy = user.id;
            reviewed.reviewedAt = new Date().toISOString();
          }
          if (clinicalReviewRequested && claim.kind === "clinical") {
            founder();
            reviewed.clinicalReview = {
              reviewerId: user.id,
              reviewedAt: new Date().toISOString(),
              attestation:
                "founder-recorded source review; not automated clinical verification",
            };
          }
          return reviewed;
        });
        return json(200, {
          story: await repo.updateSourceClaims(
            text(body.storyId, "story id"),
            sourceClaims,
            body.expectedRevision,
          ),
        });
      }
      if (route === "/api/studio/schedule" && req.method === "POST") {
        if (body.scheduledDay && !days.includes(body.scheduledDay))
          throw fail(400, "Invalid scheduled day");
        if (
          body.status &&
          ![
            "In Backlog",
            "Ready for Campaign",
            "Draft Ready",
            "Scheduled",
            "Published",
          ].includes(body.status)
        )
          throw fail(400, "Invalid story status");
        return json(
          200,
          await backlog.scheduleStory({
            ...body,
            storyId: text(body.storyId, "story id"),
          }),
        );
      }
      if (route === "/api/studio/generate-campaign" && req.method === "POST")
        return json(200, {
          ...(await formatter.generateCampaignForStory(
            text(body.storyId, "story id"),
          )),
          ...(await backlog.getStudioBootstrap()),
        });
      if (route === "/api/studio/save-edit" && req.method === "POST") {
        if (
          !formats.includes(body.format) ||
          !body.content ||
          typeof body.content !== "object" ||
          Array.isArray(body.content)
        )
          throw fail(400, "Invalid campaign edit");
        if (
          body.expectedRevision !== undefined &&
          !Number.isInteger(body.expectedRevision)
        )
          throw fail(400, "Invalid revision");
        return json(
          200,
          await formatter.saveInlineEdit({
            ...body,
            storyId: text(body.storyId, "story id"),
          }),
        );
      }
      if (route === "/api/studio/preflight" && req.method === "POST") {
        const storyId = text(body.storyId, "story id");
        const story = (await repo.listBacklog()).find(
          (story) => story.id === storyId,
        );
        if (!story) throw fail(404, "Story not found");
        if (
          body.expectedRevision !== undefined &&
          body.expectedRevision !== story.revision
        )
          throw fail(409, "Draft changed; rerun preflight");
        if (!formats.includes(body.format)) throw fail(400, "Invalid format");
        const measured = computePreflight(body);
        const record = await repo.savePreflight({
          storyId,
          format: body.format,
          storyRevision: story.revision,
          generationId: story.generationId || null,
          settings: { canvas: body.canvas, captionLimit: body.captionLimit },
          ...measured,
        });
        return json(200, { ...measured, evidenceId: record.id });
      }
      if (route === "/api/studio/export-asset" && req.method === "POST") {
        const result = await formatter.exportFormattedAsset({
          storyId: text(body.storyId, "story id"),
          format: body.format,
        });
        return json(201, {
          ...result,
          downloadUrl: `/api/studio/assets/${result.exportId}?organizationId=${encodeURIComponent(scope.organizationId)}&brandId=${encodeURIComponent(scope.brandId)}`,
        });
      }
      if (route.startsWith("/api/studio/assets/") && req.method === "GET") {
        const asset = await repo.getAsset(route.split("/").pop());
        if (!asset) throw fail(404, "Asset not found");
        res.writeHead(200, {
          "Content-Type": asset.contentType,
          "Content-Disposition": `attachment; filename="${asset.filename.replace(/[^a-zA-Z0-9_.-]/g, "_")}"`,
        });
        return res.end(Buffer.from(asset.base64, "base64"));
      }
      if (route === "/api/studio/ingest" && req.method === "POST") {
        return json(201, {
          added: await repo.ingestStories(normalizeFeed(body)),
        });
      }
      if (route === "/api/admin/discovery-config" && req.method === "POST") {
        const feedUrl = validateFeedUrl(body.feedUrl).href;
        await repo.mutate((state) => ({ ...state, discovery: { feedUrl } }));
        return json(200, { configured: true, feedUrl });
      }
      if (route === "/api/admin/users" && req.method === "GET")
        return json(200, {
          users: await identity.listUsers(user, scope.organizationId),
        });
      if (
        /^\/api\/admin\/users\/[^/]+\/password$/.test(route) &&
        req.method === "POST"
      )
        return json(
          200,
          await identity.rotatePassword(user, {
            userId: route.split("/")[4],
            password: body.password,
            organizationId: scope.organizationId,
          }),
        );
      if (route === "/api/admin/overview" && req.method === "GET")
        return json(200, await admin.getOverview());
      if (route === "/api/admin/context-graph" && req.method === "GET")
        return json(200, admin.getContextGraph());
      if (route === "/api/admin/gateway-config" && req.method === "POST") {
        if (
          Object.keys(body).some(
            (key) => !["provider", "model", "temperature"].includes(key),
          )
        )
          throw fail(400, "Unsupported gateway setting");
        if (
          body.provider &&
          !["gcp-gemini", "gcp-vertex", "openai-gateway"].includes(
            body.provider,
          )
        )
          throw fail(400, "Invalid provider");
        if (body.model) text(body.model, "model", 128);
        if (
          body.temperature !== undefined &&
          (!Number.isFinite(body.temperature) ||
            body.temperature < 0 ||
            body.temperature > 2)
        )
          throw fail(400, "Invalid temperature");
        return json(200, await admin.updateGatewayConfig(body));
      }
      if (route === "/api/admin/run-weekly-batch" && req.method === "POST") {
        if (!trustedTestMode) text(body.idempotencyKey, "idempotency key", 128);
        const maxStories = body.maxStories ?? 1;
        if (!Number.isInteger(maxStories) || maxStories < 1 || maxStories > 50)
          throw fail(400, "Invalid batch size");
        return json(
          200,
          await batch.runWeeklyBatch({
            idempotencyKey: body.idempotencyKey,
            maxStories,
          }),
        );
      }
      if (route === "/api/admin/backprop-jsonl" && req.method === "GET") {
        res.writeHead(200, {
          "Content-Type": "application/x-ndjson",
          "Content-Disposition": 'attachment; filename="feedback.jsonl"',
        });
        return res.end(await admin.exportBackpropDatasetJsonl());
      }
      if (route === "/api/admin/eject" && req.method === "GET")
        return json(200, await repo.exportData());
      if (route === "/api/admin/import" && req.method === "POST")
        return json(
          200,
          await repo.importData(body.bundle || body, {
            remapScope: body.remapScope === true,
          }),
        );
      throw fail(404, "Not found");
    } catch (error) {
      if (req.bodyTooLarge) res.setHeader("Connection", "close");
      const contentError = [
        "SOURCE_REVIEW_REQUIRED",
        "INVALID_SOURCE_CLAIM",
        "CLINICAL_REVIEW_REQUIRED",
        "UNSUPPORTED_GENERATED_CLAIM",
      ].includes(error.code);
      const providerError = [
        "PROVIDER_TIMEOUT",
        "PROVIDER_CREDENTIALS_MISSING",
        "PROVIDER_HTTP_ERROR",
        "PROVIDER_CONFIG_INVALID",
        "PROVIDER_RESPONSE_INVALID",
      ].includes(error.code);
      const status =
        error.status || (contentError ? 422 : providerError ? 502 : 500);
      const code =
        status < 500 || providerError ? error.message : "Request failed";
      try {
        await activeContainer?.ports.repo?.mutate?.((state) => {
          state.operationalEvents ||= [];
          state.operationalEvents.push({
            requestId,
            method: req.method,
            status,
            code: status >= 500 ? "INTERNAL_ERROR" : code,
            at: new Date().toISOString(),
          });
          state.operationalEvents = state.operationalEvents.slice(-1000);
          return state;
        });
      } catch {
        console.error(
          JSON.stringify({ event: "error_record_failed", requestId }),
        );
      }
      console.error(
        JSON.stringify({
          event: "request_failed",
          requestId,
          status,
          code: status >= 500 ? "INTERNAL_ERROR" : code,
        }),
      );
      return json(status, { error: code, requestId });
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 10000;
  return server;
}
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
)
  startServer(createHttpServer());
