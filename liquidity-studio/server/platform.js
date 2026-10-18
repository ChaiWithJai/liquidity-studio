import { EditorBoundary, validateEditorTargets } from "./editor-boundary.js";
import { DurableStore } from "./storage.js";
import { IdentityService } from "./auth.js";
import { GoogleIdentityService } from "./google-auth.js";
import { ScopedRepository } from "./repository.js";
import { DurableTelemetry } from "./durable-telemetry.js";
import { AIGateway } from "./gateway.js";
import { createAppContainer } from "./container.js";
export function createPlatform({
  store,
  authMode = process.env.STUDIO_AUTH_MODE || "google",
  googleAuth,
  editorTargets = JSON.parse(process.env.STUDIO_EDITOR_TARGETS_JSON || "[]"),
  editorTransport,
  editorNow,
} = {}) {
  const targets = validateEditorTargets(editorTargets);
  const platform = { store: null, identity: null };
  platform.editorBoundary = (scope, repo) =>
    new EditorBoundary({
      store: platform.store,
      scope,
      identity: platform.identity,
      repo,
      targets,
      transport: editorTransport,
      now: editorNow,
    });
  const initialize = async (activeStore) => {
    platform.store = activeStore;
    if (authMode === "google")
      platform.identity = new GoogleIdentityService(activeStore, googleAuth);
    else if (
      authMode === "password" &&
      !process.env.K_SERVICE &&
      process.env.NODE_ENV !== "production"
    )
      platform.identity = new IdentityService(activeStore);
    else throw new Error("Unsupported or unsafe authentication mode");
    return platform.identity.provisionFromEnvironment();
  };
  if (store) platform.ready = initialize(store);
  else if (process.env.STUDIO_STORAGE_MODE === "firestore")
    platform.ready = import("./cloud-store.js")
      .then((module) => module.createCloudStore())
      .then(initialize);
  else if (
    !process.env.STUDIO_STORAGE_MODE ||
    process.env.STUDIO_STORAGE_MODE === "sqlite"
  )
    platform.ready = initialize(new DurableStore());
  else platform.ready = Promise.reject(new Error("Unsupported storage mode"));
  // Prevent an early initialization rejection becoming unhandled before the first request.
  platform.ready.catch(() => {});
  platform.forScope = async (scope) => {
    await platform.ready;
    const repo = new ScopedRepository(platform.store, scope);
    const aiGateway = new AIGateway((await repo.read()).gatewayConfig || {});
    return createAppContainer({
      repo,
      aiGateway,
      telemetry: new DurableTelemetry(repo),
    });
  };
  return platform;
}
