import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { googleDeploymentEnv, verifyGoogleProvider } from "./gcp-google.mjs";
import {
  validateConfig,
  validateBudget,
  validateReport,
} from "./gcp-validation.mjs";

const mode = process.argv[2] || "plan";
const project = process.env.PILOT_PROJECT;
const region = process.env.PILOT_REGION || "us-east4";
const aiLocation = process.env.PILOT_AI_LOCATION || "us";
const aiModel = "gemini-3.5-flash-lite";
const budget = Number(process.env.PILOT_MONTHLY_BUDGET || 100);
const service = process.env.PILOT_SERVICE || "liquidity-studio";
const database = process.env.PILOT_DATABASE || "liquidity-studio-pilot";
const bucket =
  process.env.PILOT_ASSET_BUCKET || (project && `${project}-liquidity-assets`);
const image = process.env.PILOT_IMAGE;
const runtimeAccount =
  project && `liquidity-runtime@${project}.iam.gserviceaccount.com`;

function requireValue(value, name, pattern) {
  if (!value || (pattern && !pattern.test(value)))
    throw new Error(`Set a valid ${name}`);
  return value;
}
function command(args, { execute = false, capture = false } = {}) {
  if (!args.includes(`--billing-project=${project}`))
    args = [...args, `--billing-project=${project}`];
  if (!execute) {
    console.log(JSON.stringify({ executable: "gcloud", args }));
    return;
  }
  const result = spawnSync("gcloud", args, {
    encoding: "utf8",
    timeout: 60000,
    stdio: capture ? "pipe" : "inherit",
    env: { ...process.env, CLOUDSDK_CORE_DISABLE_PROMPTS: "1" },
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `gcloud ${args[0]} ${args[1]} failed. Resolve access/configuration before retrying.`,
    );
  return capture ? result.stdout : undefined;
}

try {
  validateConfig({ project, region, budget, service, database, bucket, image });
  if (aiLocation !== "us")
    throw new Error("PILOT_AI_LOCATION must use the selected us multi-region");
  if (!["plan", "preflight", "deploy", "rollback"].includes(mode))
    throw new Error("Use plan, preflight, deploy or rollback");
  const readOnly = [
    [
      "projects",
      "describe",
      project,
      `--project=${project}`,
      "--format=json(projectId,projectNumber,lifecycleState)",
    ],
    [
      "billing",
      "projects",
      "describe",
      project,
      `--project=${project}`,
      "--format=json(billingEnabled,billingAccountName)",
    ],
    [
      "services",
      "list",
      "--enabled",
      `--project=${project}`,
      "--format=value(config.name)",
    ],
    [
      "run",
      "services",
      "list",
      `--project=${project}`,
      `--region=${region}`,
      "--format=json(metadata.name)",
    ],
    [
      "firestore",
      "databases",
      "describe",
      `--project=${project}`,
      `--database=${database}`,
      "--format=json(name,locationId,type)",
    ],
    [
      "storage",
      "buckets",
      "describe",
      `gs://${bucket}`,
      "--raw",
      "--format=json(name,projectNumber,location,iamConfiguration)",
    ],
  ];
  if (mode === "plan") {
    console.log(
      JSON.stringify({
        project,
        region,
        aiLocation,
        aiModel,
        aiMaxInputBytes: 32768,
        aiMaxOutputTokens: 4096,
        monthlyBudgetUSD: budget,
        database,
        bucket,
        runtimeAccount,
        target: "founder and one marketer",
        storage:
          "Firestore and private GCS; never ephemeral SQLite on Cloud Run",
        readiness: "not deployed; preflight and local acceptance required",
        costLimits:
          "budget alerts are not hard caps; eligible service caps have enforcement latency; generation quotas and single-instance limit required",
      }),
    );
    for (const args of readOnly) command(args);
    console.log(
      JSON.stringify({
        prerequisites: [
          "Reauthenticate gcloud",
          "Explicitly enable cloudbilling.googleapis.com and billingbudgets.googleapis.com on the selected project before billing verification; see gcp-prerequisites.md",
          "Verify project ownership/billing and us-east4 resources",
          "Set USD100 aggregate alerts and separately eligible Cloud Run/AI spend caps with headroom for storage/logging",
          "Create runtime identity with firebaseauth.users.get and scoped data access; no app passwords",
          "Configure Google provider and application email allowlist; public UI with signed-token data APIs",
          "Pass local persistence, isolation, export and restore tests",
          "Build linux/amd64 image and record immutable digest",
          "Record current Cloud Run revision and backup manifest before deployment",
        ],
      }),
    );
  } else if (mode === "preflight") {
    for (const args of readOnly) command(args, { execute: true });
  } else {
    if (process.argv[3] !== "--apply")
      throw new Error(
        "Deployment/rollback requires --apply and explicit configured resources",
      );
    const reportFile = requireValue(
      process.env.PILOT_ACCEPTANCE_REPORT,
      "PILOT_ACCEPTANCE_REPORT",
    );
    const stat = fs.statSync(reportFile);
    if (!stat.isFile() || stat.size > 1024 * 1024)
      throw new Error(
        "Acceptance report must be a JSON file no larger than one MiB",
      );
    let report;
    try {
      report = JSON.parse(fs.readFileSync(reportFile, "utf8"));
    } catch {
      throw new Error("Acceptance report must contain valid JSON");
    }
    const targetImage =
      image || (mode === "rollback" ? report.image : undefined);
    validateConfig({
      project,
      region,
      budget,
      service,
      database,
      bucket,
      image: targetImage,
    });
    validateReport(report, {
      project,
      region,
      image: targetImage,
      commit: process.env.PILOT_TESTED_COMMIT,
    });
    if (
      report.authMode !== "google" ||
      report.checks?.anonymousApi !== "passed" ||
      report.checks?.googleAuth !== "passed"
    )
      throw new Error(
        "Google-mode image acceptance must prove anonymous API denial and managed sign-in before deployment",
      );
    requireValue(
      process.env.PILOT_BUDGET_ID,
      "PILOT_BUDGET_ID",
      /^[a-zA-Z0-9_-]{1,128}$/,
    );
    requireValue(
      process.env.PILOT_BILLING_ACCOUNT,
      "PILOT_BILLING_ACCOUNT",
      /^[a-fA-F0-9]{6}-[a-fA-F0-9]{6}-[a-fA-F0-9]{6}$/,
    );
    // Verify authentication and the actual project before checking any budget or
    // reaching the first resource mutation. CLI defaults never select a project.
    const projectInfo = JSON.parse(
      command(readOnly[0], { execute: true, capture: true }),
    );
    if (
      projectInfo.projectId !== project ||
      projectInfo.lifecycleState !== "ACTIVE"
    )
      throw new Error(
        "The explicitly selected project must be active and accessible",
      );
    const billingInfo = JSON.parse(
      command(readOnly[1], { execute: true, capture: true }),
    );
    if (
      !billingInfo.billingEnabled ||
      billingInfo.billingAccountName !==
        `billingAccounts/${process.env.PILOT_BILLING_ACCOUNT}`
    )
      throw new Error(
        "The project must use the explicitly verified billing account",
      );
    const accountBudget = JSON.parse(
      command(
        [
          "billing",
          "budgets",
          "describe",
          process.env.PILOT_BUDGET_ID,
          `--billing-account=${process.env.PILOT_BILLING_ACCOUNT}`,
          `--project=${project}`,
          "--format=json",
        ],
        { execute: true, capture: true },
      ),
    );
    if (
      accountBudget.name !==
      `billingAccounts/${process.env.PILOT_BILLING_ACCOUNT}/budgets/${process.env.PILOT_BUDGET_ID}`
    )
      throw new Error(
        "Budget identity does not match the approved account and ID",
      );
    validateBudget(accountBudget, {
      projectNumber: String(projectInfo.projectNumber),
      budget,
    });
    if (mode === "rollback") {
      const revision = requireValue(
        process.env.PILOT_PREVIOUS_REVISION,
        "PILOT_PREVIOUS_REVISION",
        /^[a-z0-9-]+$/,
      );
      const previous = JSON.parse(
        command(
          [
            "run",
            "revisions",
            "describe",
            revision,
            `--project=${project}`,
            `--region=${region}`,
            "--format=json(spec.containers)",
          ],
          { execute: true, capture: true },
        ),
      );
      if (previous.spec?.containers?.[0]?.image !== targetImage)
        throw new Error(
          "Rollback revision image does not match the acceptance report",
        );
      command(
        [
          "run",
          "services",
          "update-traffic",
          service,
          `--project=${project}`,
          `--region=${region}`,
          `--to-revisions=${revision}=100`,
        ],
        { execute: true },
      );
    } else {
      requireValue(
        image,
        "PILOT_IMAGE with immutable sha256 digest",
        /@sha256:[a-f0-9]{64}$/,
      );
      const googleEnv = googleDeploymentEnv(process.env, project);
      const tokenResult = spawnSync(
        "gcloud",
        ["auth", "print-access-token", `--project=${project}`],
        { encoding: "utf8", stdio: "pipe" },
      );
      if (tokenResult.status !== 0)
        throw new Error(
          "Google provider verification requires authenticated project access",
        );
      await verifyGoogleProvider({ project, token: tokenResult.stdout.trim() });
      const datastore = JSON.parse(
        command(readOnly[4], { execute: true, capture: true }),
      );
      if (
        datastore.locationId !== region ||
        datastore.type !== "FIRESTORE_NATIVE"
      )
        throw new Error(
          "Datastore must use Firestore Native in the authorized region",
        );
      const assetBucket = JSON.parse(
        command(readOnly[5], { execute: true, capture: true }),
      );
      if (
        assetBucket.name !== bucket ||
        String(assetBucket.projectNumber) !==
          String(projectInfo.projectNumber) ||
        assetBucket.location?.toLowerCase() !== region ||
        assetBucket.iamConfiguration?.publicAccessPrevention !== "enforced" ||
        assetBucket.iamConfiguration?.uniformBucketLevelAccess?.enabled !== true
      )
        throw new Error(
          "Asset bucket must belong to the verified project/region with public access prevention and uniform access enforced",
        );
      command(readOnly[2], { execute: true });
      // A successful authoritative list is required. Authentication, permission,
      // network and malformed responses must never be mistaken for absence.
      const services = JSON.parse(
        command(readOnly[3], { execute: true, capture: true }),
      );
      if (
        !Array.isArray(services) ||
        services.some(
          (item) =>
            !item ||
            typeof item.metadata?.name !== "string" ||
            !/^[a-z][a-z0-9-]{0,62}$/.test(item.metadata.name),
        )
      ) {
        throw new Error("Cloud Run service existence response is invalid");
      }
      const names = services.map((item) => item.metadata.name);
      if (new Set(names).size !== names.length)
        throw new Error("Cloud Run service existence response is ambiguous");
      const existingService = names.includes(service);
      const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), "liquidity-cloud-env-"),
      );
      fs.chmodSync(directory, 0o700);
      const envFile = path.join(directory, "environment.json");
      fs.writeFileSync(
        envFile,
        JSON.stringify({
          ...googleEnv,
          STUDIO_STORAGE_MODE: "firestore",
          GOOGLE_CLOUD_PROJECT: project,
          STUDIO_FIRESTORE_DATABASE: database,
          STUDIO_ASSET_BUCKET: bucket,
          STUDIO_COOKIE_SECURE: "true",
          AI_PROVIDER: "gcp-vertex",
          GOOGLE_CLOUD_LOCATION: aiLocation,
          AI_MODEL: aiModel,
          AI_MAX_INPUT_BYTES: "32768",
          AI_MAX_OUTPUT_TOKENS: "4096",
          AI_VERTEX_USE_METADATA: "true",
          AI_ALLOW_SYNTHETIC: "false",
          STUDIO_DAILY_GENERATION_LIMIT: "20",
          STUDIO_GLOBAL_DAILY_GENERATION_LIMIT: "20",
        }),
        { mode: 0o600 },
      );
      try {
        command(
          [
            "run",
            "deploy",
            service,
            `--project=${project}`,
            `--region=${region}`,
            `--image=${image}`,
            `--service-account=${runtimeAccount}`,
            "--execution-environment=gen2",
            "--cpu=1",
            "--memory=512Mi",
            "--min-instances=0",
            "--max-instances=1",
            "--max=1",
            "--concurrency=8",
            "--timeout=60",
            "--no-invoker-iam-check",
            "--no-iap",
            "--ingress=all",
            ...(existingService ? ["--no-traffic"] : []),
            "--tag=pilot-candidate",
            `--env-vars-file=${envFile}`,
            "--clear-secrets",
          ],
          { execute: true },
        );
      } finally {
        fs.rmSync(directory, { recursive: true, force: true });
      }
      // Probe the tagged candidate, including when main traffic remains on an older revision.
      const deployed = JSON.parse(
        command(
          [
            "run",
            "services",
            "describe",
            service,
            `--project=${project}`,
            `--region=${region}`,
            "--format=json(status.traffic)",
          ],
          { execute: true, capture: true },
        ),
      );
      const candidate = deployed.status?.traffic?.find(
        (entry) => entry.tag === "pilot-candidate",
      );
      const candidateUrl = new URL(candidate?.url || "invalid:");
      if (
        candidateUrl.protocol !== "https:" ||
        !candidateUrl.hostname.endsWith(".run.app") ||
        candidateUrl.username ||
        candidateUrl.password ||
        candidateUrl.pathname !== "/" ||
        candidateUrl.search ||
        candidateUrl.hash
      ) {
        throw new Error(
          "Deployment completed but candidate URL could not be verified; public acceptance failed",
        );
      }
      for (const [route, status] of [
        ["/", 200],
        ["/api/auth/config", 200],
        ["/api/auth/session", 401],
        ["/api/studio/bootstrap", 401],
      ]) {
        const response = await fetch(new URL(route, candidateUrl), {
          redirect: "manual",
          signal: AbortSignal.timeout(10000),
        });
        if (response.status !== status)
          throw new Error(
            `Deployment completed but public acceptance failed for ${route}: expected ${status}, received ${response.status}`,
          );
        if (route === "/api/auth/config") {
          const config = await response.json();
          if (
            config.mode !== "google" ||
            config.firebase?.projectId !== project ||
            config.emulator
          )
            throw new Error(
              "Deployment completed but public Google configuration acceptance failed",
            );
        } else {
          await response.body?.cancel();
        }
      }
      console.log(
        "Candidate public transport passed: sign-in surface and Google configuration reachable; anonymous session/studio access denied. Authorized Google sign-in and runtime dependency acceptance remain separate checks.",
      );
      console.log(
        existingService
          ? "Candidate revision created with no assigned main-service traffic; its tagged URL can still receive requests. Verify anonymous API 401, Google sign-in, outsider rejection, isolation, real provider, restore and spend controls before promoting traffic."
          : "First pilot service created with 100% initial traffic. Sign-in/static surfaces are public; studio/admin data APIs remain Google-protected. Verify anonymous API 401, both authorized users, outsider rejection, isolation, real provider, restore and spend controls before inviting users. This is not a zero-traffic deployment.",
      );
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
