import { jobDispatcherConfiguration, dispatchJobs } from "./job-dispatcher.js";
import { idempotencyKey as workspaceIdempotencyKey } from "./workspace-query.js";
import { revision as workspaceRevision } from "./workspace-schema.js";
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
function viewContext(value) {
  if (value === undefined) return null;
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some(
      (key) =>
        ![
          "mode",
          "frameIndex",
          "storyFrame",
          "pollVote",
          "measuredAt",
          "measurementRevision",
          "artworkId",
        ].includes(key),
    ) ||
    (value.measurementRevision !== undefined &&
      (typeof value.measurementRevision !== "string" ||
        value.measurementRevision.length > 200)) ||
    (value.artworkId !== undefined &&
      (typeof value.artworkId !== "string" ||
        !/^(infographic|carousel|story|reel)-page-[1-4]$/.test(
          value.artworkId,
        ))) ||
    !["instagram", "design"].includes(value.mode) ||
    !Number.isInteger(value.frameIndex) ||
    value.frameIndex < 0 ||
    value.frameIndex > 3 ||
    !Number.isInteger(value.storyFrame) ||
    value.storyFrame < 0 ||
    value.storyFrame > 3 ||
    ![null, "A", "B"].includes(value.pollVote) ||
    typeof value.measuredAt !== "string" ||
    !Number.isFinite(Date.parse(value.measuredAt))
  )
    throw fail(400, "Invalid preflight view context");
  return { ...value };
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

function token(req, mode) {
  if (mode === "google")
    return /^Bearer ([^\s]+)$/.exec(req.headers.authorization || "")?.[1];
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
    editorBoundaryEnabled = process.env.STUDIO_EDITOR_BOUNDARY_ENABLED ===
      "true",
    editorContractEnabled = process.env.STUDIO_EDITOR_CONTRACT_ENABLED ===
      "true",
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
          "Content-Type,Authorization,X-Organization-Id,X-Brand-Id",
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
      if (req.method === "GET" && ["/healthz", "/api/live"].includes(route))
        return json(200, { status: "alive" });
      if (req.method === "GET" && ["/readyz", "/api/ready"].includes(route)) {
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
      if (route === "/api/internal/operator-job" && req.method === "POST") {
        const configuration = jobDispatcherConfiguration();
        if (
          configuration.mode !== "cloud-tasks" ||
          process.env.STUDIO_OPERATOR_JOBS_ENABLED !== "true"
        )
          throw fail(404, "Not found");
        await verifySchedulerIdentity(
          (req.headers.authorization || "").replace(/^Bearer /, ""),
          { audience: configuration.endpoint, email: configuration.email },
        );
        const input = await readBody(req, 4096);
        if (
          Object.keys(input).some(
            (key) =>
              ![
                "organizationId",
                "brandId",
                "jobId",
                "itemId",
                "nextAttempt",
                "deliveryEpoch",
              ].includes(key),
          ) ||
          ![input.jobId, input.itemId].every(
            (id) => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id),
          ) ||
          !Number.isInteger(input.nextAttempt) ||
          input.nextAttempt < 1 ||
          !Number.isInteger(input.deliveryEpoch) ||
          input.deliveryEpoch < 1
        )
          throw fail(400, "Invalid job delivery");
        const configured = JSON.parse(process.env.STUDIO_JOB_SCOPES || "[]");
        if (
          !configured.some(
            (scope) =>
              scope.organizationId === input.organizationId &&
              scope.brandId === input.brandId,
          )
        )
          throw fail(403, "Worker scope denied");
        const identities = await platform.store.get("identity"),
          org = identities.organizations.find(
            (org) => org.id === input.organizationId,
          ),
          brand = org?.brands.find((brand) => brand.id === input.brandId);
        if (!brand) throw fail(403, "Worker scope no longer exists");
        const scope = {
            organizationId: org.id,
            brandId: brand.id,
            preset: brand.preset,
          },
          container = await platform.forScope(scope);
        const result = await platform
          .operatorJobs(scope, container)
          .runNext(
            undefined,
            input.jobId,
            input.itemId,
            input.nextAttempt,
            input.deliveryEpoch,
          );
        return json(200, { delivered: true, job: result });
      }
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
      if (
        identity?.configuration?.emulator &&
        !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
          req.socket.remoteAddress,
        )
      )
        throw fail(403, "Auth emulator requires a loopback client");
      if (route === "/api/auth/config" && req.method === "GET")
        return json(
          200,
          identity?.publicConfiguration?.() || { mode: "password" },
        );
      let user = trustedTestMode
        ? { id: "test", username: "test", role: "founder" }
        : await identity.authenticate(token(req, identity.mode));
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
        if (identity.mode === "google") throw fail(405, "Use Google sign-in");
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
        await identity.logout(token(req, identity.mode));
        if (identity.mode !== "google") cookie("", true);
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
      if (
        route === "/api/studio/jobs" ||
        route.startsWith("/api/studio/jobs/")
      ) {
        if (
          trustedTestMode ||
          process.env.STUDIO_OPERATOR_JOBS_ENABLED !== "true"
        )
          throw fail(404, "Not found");
        const jobs = platform.operatorJobs(scope, activeContainer);
        if (route === "/api/studio/jobs/plan" && req.method === "GET") {
          let dispatcher;
          try {
            const configuration = jobDispatcherConfiguration();
            dispatcher = {
              configured: true,
              mode: configuration.mode,
              message:
                configuration.mode === "local"
                  ? "A separate local worker must be running."
                  : "Cloud Tasks delivery configured; inspect job delivery status.",
            };
          } catch {
            dispatcher = {
              configured: false,
              message:
                "Ask the operator to configure a durable worker before queueing. Provider readiness is checked only when an item executes.",
            };
          }
          return json(200, { ...(await jobs.plan(user)), dispatcher });
        }
        if (route === "/api/studio/jobs" && req.method === "GET")
          return json(200, { jobs: await jobs.list(user) });
        if (route === "/api/studio/jobs" && req.method === "POST") {
          const dispatcherConfiguration = jobDispatcherConfiguration();
          if (
            dispatcherConfiguration.mode === "cloud-tasks" &&
            !dispatcherConfiguration.scopes.some(
              (allowed) =>
                allowed.organizationId === scope.organizationId &&
                allowed.brandId === scope.brandId,
            )
          )
            throw fail(403, "Worker scope is not configured");
          const job = await jobs.create(user, body);
          let dispatchError = null;
          try {
            await dispatchJobs(repo, job.id);
          } catch {
            dispatchError =
              "Queue delivery pending; operator must retry delivery. The reviewed job is saved.";
          }
          return json(202, { job, dispatchError });
        }
        const match = route.match(
          /^\/api\/studio\/jobs\/([0-9a-f-]{36})(?:\/(cancel|resume|retry))?$/i,
        );
        if (match && !match[2] && req.method === "GET")
          return json(200, { job: await jobs.detail(user, match[1]) });
        if (match?.[2] && req.method === "POST") {
          const job = await jobs.control(user, match[1], match[2], body);
          let dispatchError = null;
          try {
            await dispatchJobs(repo, job.id);
          } catch {
            dispatchError =
              "Queue delivery pending; retry the same control request.";
          }
          return json(200, { job, dispatchError });
        }
        throw fail(404, "Job operation not found");
      }

      if (route.startsWith("/api/studio/workspace/")) {
        if (trustedTestMode) throw fail(404, "Not found");
        const service = platform.workspace(scope, repo);
        const base = "/api/studio/workspace";
        if (route === base + "/members" && req.method === "GET")
          return json(200, { members: await service.members(user) });
        if (route === base + "/query" && req.method === "POST")
          return json(200, await service.query(user, body));
        if (route === base + "/calendar" && req.method === "GET")
          return json(
            200,
            await service.calendar(user, {
              startDate: url.searchParams.get("startDate"),
              endDate: url.searchParams.get("endDate"),
              timeZone: url.searchParams.get("timeZone"),
            }),
          );
        if (route === base + "/mutations" && req.method === "POST")
          return json(200, await service.mutate(user, body));
        const detail = route.match(
          /^\/api\/studio\/workspace\/stories\/([^/]+)$/,
        );
        if (detail && req.method === "GET")
          return json(200, await service.detail(user, detail[1]));
        if (route === base + "/operations" && req.method === "GET")
          return json(200, { operations: await service.operations(user) });
        const operation = route.match(
          /^\/api\/studio\/workspace\/operations\/([^/]+)\/undo$/,
        );
        if (operation && req.method === "POST")
          return json(200, await service.undo(user, operation[1], body));
        const view = route.match(
          /^\/api\/studio\/workspace\/views(?:\/([^/]+)(?:\/(delete|restore))?)?$/,
        );
        if (view) {
          if (!view[1] && req.method === "GET")
            return json(200, { views: await service.views.list(user) });
          if (req.method === "POST")
            return json(
              view[1] ? 200 : 201,
              await service.views.write(
                user,
                view[1],
                view[2] || (view[1] ? "update" : "create"),
                body,
              ),
            );
        }
        throw fail(404, "Not found");
      }
      if (route === "/api/studio/bootstrap" && req.method === "GET")
        return json(200, {
          ...(await backlog.getStudioBootstrap()),
          ...(trustedTestMode ? {} : await session()),
          activeScope: scope,
        });
      if (route.startsWith("/api/studio/editor-bindings")) {
        if (!editorBoundaryEnabled || trustedTestMode)
          throw fail(404, "Not found");
        const boundary = platform.editorBoundary(scope, repo);
        const match = route.match(
          /^\/api\/studio\/editor-bindings(?:\/([^/]+)(?:\/(revoke|operations|asset-grants|asset-delivery|room-grants|room-join|callbacks|public-share))?)?$/,
        );
        if (!match) throw fail(404, "Not found");
        const [, bindingId, operation] = match;
        if (!bindingId && req.method === "GET")
          return json(200, { bindings: await boundary.list(user) });
        if (!bindingId && req.method === "POST")
          return json(201, await boundary.register(user, body));
        if (operation === "revoke" && req.method === "POST")
          return json(200, await boundary.revoke(user, bindingId));
        if (operation === "operations" && req.method === "POST")
          return json(200, await boundary.execute(user, bindingId, body));
        if (operation === "asset-grants" && req.method === "POST")
          return json(201, await boundary.grantAsset(user, bindingId, body));
        if (operation === "room-grants" && req.method === "POST")
          return json(201, await boundary.grantRoom(user, bindingId, body));
        if (operation === "room-join" && req.method === "POST")
          return json(200, await boundary.joinRoom(user, bindingId, body));
        if (operation === "asset-delivery" && req.method === "GET") {
          const { asset, bytes } = await boundary.consumeAsset(
            user,
            bindingId,
            req.headers["x-editor-asset-grant"],
          );
          res.writeHead(200, {
            "Content-Type": asset.contentType,
            "Content-Disposition": `attachment; filename="${asset.filename.replace(/[^a-zA-Z0-9_.-]/g, "_")}"`,
            "Cache-Control": "private, no-store",
          });
          return res.end(bytes);
        }
        if (["callbacks", "public-share"].includes(operation))
          throw fail(
            403,
            "External callback and public-share capabilities are disabled",
          );
        throw fail(404, "Not found");
      }
      if (route === "/api/studio/multimodal-spec" && req.method === "GET") {
        if (!editorContractEnabled) throw fail(404, "Not found");
        const allowed = [
          "organizationId",
          "brandId",
          "schemaVersion",
          "storyId",
          "expectedRevision",
          "generationId",
          "expectedBrandRevision",
          "format",
          "nativeTargets",
          "requiredCapabilities",
        ];
        for (const key of url.searchParams.keys()) {
          if (
            !allowed.includes(key) ||
            url.searchParams.getAll(key).length !== 1
          )
            throw fail(400, "Unknown or duplicate editor query field");
        }
        const state = await repo.read();
        const story = state.backlog.find(
          (item) => item.id === url.searchParams.get("storyId"),
        );
        if (!story) throw fail(404, "Story not found");
        const parse = (key, fallback) => {
          const value = url.searchParams.get(key);
          if (value === null) return fallback;
          try {
            return JSON.parse(value);
          } catch {
            throw fail(400, "Invalid editor query JSON");
          }
        };
        return json(
          200,
          await activeContainer.ports.multimodalCanvas.compileMultimodalBundle({
            scope,
            brandProfile: state.brandProfile,
            story,
            request: {
              schemaVersion: Number(url.searchParams.get("schemaVersion")),
              storyId: story.id,
              expectedRevision: Number(
                url.searchParams.get("expectedRevision"),
              ),
              generationId: url.searchParams.get("generationId"),
              expectedBrandRevision: url.searchParams.get(
                "expectedBrandRevision",
              ),
              format: url.searchParams.get("format") || undefined,
              nativeTargets: parse("nativeTargets", undefined),
              requiredCapabilities: parse("requiredCapabilities", []),
            },
          }),
        );
      }
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
        if (
          Object.keys(body).some(
            (key) =>
              ![
                "storyId",
                "status",
                "scheduledDay",
                "expectedRevision",
                "idempotencyKey",
              ].includes(key),
          ) ||
          body.status !== "Scheduled"
        )
          throw fail(400, "Only an undated Scheduled assignment is supported");
        if (trustedTestMode) {
          workspaceIdempotencyKey(body.idempotencyKey);
          workspaceRevision(body.expectedRevision);
          const story = (await repo.listBacklog()).find(
            (story) => story.id === body.storyId,
          );
          if (!story) throw fail(404, "Story not found");
          if ((story.revision || 0) !== body.expectedRevision)
            throw fail(409, "Story revision changed");
          const result = await backlog.scheduleStory(body);
          result.story.revision = (story.revision || 0) + 1;
          return json(200, result);
        }
        const receipt = await platform.workspace(scope, repo).mutate(user, {
          idempotencyKey: body.idempotencyKey,
          changes: [
            {
              kind: "legacy.schedule",
              storyId: body.storyId,
              expectedRevision: body.expectedRevision,
              scheduledDay: body.scheduledDay,
            },
          ],
        });
        const outcome = receipt.outcomes[0];
        if (outcome.status !== "applied")
          throw fail(outcome.code, outcome.message);
        return json(200, {
          ...(await backlog.getStudioBootstrap()),
          story: (await repo.listBacklog()).find(
            (story) => story.id === body.storyId,
          ),
          receipt,
        });
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
        let measured;
        try {
          measured = computePreflight(body);
        } catch {
          throw fail(400, "Invalid preflight measurements");
        }
        const context = viewContext(body.viewContext);
        const lastFrame =
          body.format === "carousel" ? 3 : body.format === "reel" ? 2 : 0;
        if (context && context.frameIndex > lastFrame)
          throw fail(400, "Preflight frame does not exist for this format");
        if (
          context?.artworkId &&
          context.artworkId !== `${body.format}-page-${context.frameIndex + 1}`
        )
          throw fail(400, "Preflight artifact does not match format/frame");
        if (
          context?.artworkId &&
          body.textBoxes?.some(
            (box) =>
              box.artworkElementId &&
              !box.artworkElementId.startsWith(context.artworkId + "-"),
          )
        )
          throw fail(400, "Preflight element belongs to another artwork");
        const record = await repo.savePreflight({
          storyId,
          format: body.format,
          storyRevision: story.revision,
          generationId: story.generationId || null,
          settings: {
            canvas: body.canvas,
            captionLimit: body.captionLimit,
            viewContext: context,
          },
          ...measured,
        });
        return json(200, {
          ...measured,
          evidenceId: record.id,
          artifact: {
            storyId,
            storyRevision: story.revision,
            generationId: story.generationId || null,
            format: body.format,
            viewContext: context,
          },
        });
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
        if (body.retryOfJobId !== undefined)
          text(body.retryOfJobId, "previous batch id", 128);
        const maxStories = body.maxStories ?? 1;
        if (!Number.isInteger(maxStories) || maxStories < 1 || maxStories > 50)
          throw fail(400, "Invalid batch size");
        return json(
          200,
          await batch.runWeeklyBatch({
            idempotencyKey: body.idempotencyKey,
            retryOfJobId: body.retryOfJobId || null,
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
