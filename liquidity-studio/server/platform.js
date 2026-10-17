import { DurableStore } from "./storage.js";
import { IdentityService } from "./auth.js";
import { ScopedRepository } from "./repository.js";
import { DurableTelemetry } from "./durable-telemetry.js";
import { AIGateway } from "./gateway.js";
import { createAppContainer } from "./container.js";
export function createPlatform({ store } = {}) {
  const platform = { store: null, identity: null };
  const initialize = (activeStore) => {
    platform.store = activeStore;
    platform.identity = new IdentityService(activeStore);
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
