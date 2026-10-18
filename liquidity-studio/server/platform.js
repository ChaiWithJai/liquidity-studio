import { NativeCutoutService } from "./native-cutout.js";
import { createNativeCutoutModel } from "./native-cutout-model.js";
import { NativeEditorService } from "./native-editor.js";
import { EditorApprovalService } from "./editor-approval.js";
import { EditorExportService } from "./editor-export.js";
import { nativeFontRegistry } from "./native-editor-fonts.js";
import { EditorBoundary, validateEditorTargets } from "./editor-boundary.js";
import { DurableJobService } from "./operator-jobs.js";
import { SourcePreparationService } from "./source-preparation.js";
import { PreparedPromotionService } from "./prepared-promotion.js";
import { WorkspaceService } from "./workspace.js";
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
  sourceRetriever,
  nativeCutoutModel = createNativeCutoutModel({
    enabled: process.env.STUDIO_NATIVE_CUTOUT_ENABLED === "true",
    path: process.env.STUDIO_NATIVE_MODNET_PATH,
  }),
  penpotConfigurationPath = process.env.STUDIO_PENPOT_OPERATOR_CONFIG,
} = {}) {
  const targets = validateEditorTargets(editorTargets);
  const platform = { store: null, identity: null };
  let penpotRuntime;
  platform.getPenpotRuntime = async () => {
    await platform.ready;
    if (process.env.K_SERVICE)
      throw new Error("Local Penpot integration is unavailable in Cloud Run");
    penpotRuntime ||= import("./penpot-studio-runtime.js").then((module) =>
      module.createPenpotStudioRuntime({
        store: platform.store,
        identity: platform.identity,
        configurationPath: penpotConfigurationPath,
      }),
    );
    return penpotRuntime;
  };
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
  platform.operatorJobs = (scope, container) =>
    new DurableJobService({
      repo: container.ports.repo,
      identity: platform.identity,
      scope,
      formatter: container.services.multiFormatFormatterService,
      preparation: new SourcePreparationService({
        repo: container.ports.repo,
        scope,
        retrieve: sourceRetriever,
      }),
    });
  platform.preparedPromotion = (scope, repo) =>
    new PreparedPromotionService({ repo, scope, identity: platform.identity });
  platform.workspace = (scope, repo) =>
    new WorkspaceService({
      store: platform.store,
      identity: platform.identity,
      scope,
      repo,
    });
  platform.nativeEditor = (scope, repo) =>
    new NativeEditorService({
      repo,
      identity: platform.identity,
      scope,
      availableFonts: nativeFontRegistry(),
    });
  platform.editorApproval = (scope, repo) =>
    new EditorApprovalService({
      repo,
      scope,
      identity: platform.identity,
      native: platform.nativeEditor(scope, repo),
    });
  platform.nativeCutout = (scope, repo) =>
    new NativeCutoutService({
      native: platform.nativeEditor(scope, repo),
      model: nativeCutoutModel,
    });
  platform.editorExport = (scope, repo) => new EditorExportService({
    approval: platform.editorApproval(scope, repo),
    enabled: process.env.STUDIO_EDITOR_COMPLETION_ENABLED !== "false",
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
