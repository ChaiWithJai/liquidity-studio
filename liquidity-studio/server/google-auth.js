import { randomUUID } from "node:crypto";
import { IdentityService, fail } from "./auth.js";

function email(value) {
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    throw fail(503, "Google principal email configuration required");
  return value.trim().toLowerCase();
}
export function googleAuthConfiguration(env = process.env) {
  const projectId = env.STUDIO_FIREBASE_PROJECT_ID;
  if (!projectId || !/^[a-z][a-z0-9-]{4,62}$/.test(projectId))
    throw fail(503, "Firebase project configuration required");
  const principals = ["founder", "marketer"].map((role) => ({
    role,
    email: email(env[`STUDIO_GOOGLE_${role.toUpperCase()}_EMAIL`]),
    username: env[`STUDIO_${role.toUpperCase()}_USERNAME`] || role,
  }));
  if (principals[0].email === principals[1].email)
    throw fail(503, "Google principal emails must differ");
  let emulator;
  if (
    env.FIREBASE_AUTH_EMULATOR_HOST ||
    env.STUDIO_AUTH_EMULATOR_ENABLED === "true"
  ) {
    if (
      env.STUDIO_AUTH_EMULATOR_ENABLED !== "true" ||
      env.K_SERVICE ||
      env.NODE_ENV === "production" ||
      !/^(127\.0\.0\.1|localhost):\d{1,5}$/.test(
        env.FIREBASE_AUTH_EMULATOR_HOST || "",
      )
    )
      throw fail(
        503,
        "Auth emulator is restricted to explicit local development",
      );
    emulator = { url: `http://${env.FIREBASE_AUTH_EMULATOR_HOST}` };
  }
  const firebase = {
    projectId,
    apiKey: env.STUDIO_FIREBASE_API_KEY,
    authDomain: env.STUDIO_FIREBASE_AUTH_DOMAIN,
    appId: env.STUDIO_FIREBASE_APP_ID,
  };
  if (
    Object.values(firebase).some(
      (value) => typeof value !== "string" || !value.trim(),
    )
  )
    throw fail(503, "Firebase public web configuration required");
  return {
    mode: "google",
    firebase,
    ...(emulator ? { emulator } : {}),
    principals,
  };
}

export class GoogleIdentityService extends IdentityService {
  constructor(
    store,
    { configuration = googleAuthConfiguration(), verifyIdToken } = {},
  ) {
    super(store);
    if (
      !configuration?.firebase?.projectId ||
      !Array.isArray(configuration.principals)
    )
      throw fail(503, "Google authentication configuration required");
    this.mode = "google";
    this.configuration = configuration;
    this.verifier = verifyIdToken;
    const baseReady = this.ready;
    this.ready = (async () => {
      await baseReady;
      await store.update("identity", (state) => {
        // Preserve authorization IDs and memberships while destroying application credentials.
        state.users = state.users.map(({ id, username, role }) => ({
          id,
          username,
          role,
        }));
        for (const principal of configuration.principals) {
          const matches = state.users.filter(
            (user) =>
              user.role === principal.role &&
              user.username === principal.username,
          );
          if (matches.length > 1)
            throw fail(
              503,
              "Ambiguous principal migration requires operator review",
            );
          let user = matches[0];
          if (!user) {
            user = {
              id: randomUUID(),
              username: principal.username,
              role: principal.role,
            };
            state.users.push(user);
            state.memberships.push({
              userId: user.id,
              organizationId: "org_default",
              brandIds: ["brand_default", "brand_vedic"],
            });
          }
          user.email = principal.email;
          user.authProvider = "google";
        }
        return state;
      });
      for (const prefix of ["session:", "login:"])
        for (const key of await store.keys(prefix)) await store.delete(key);
    })();
  }
  async provisionFromEnvironment() {
    await this.ready;
  }
  async provision() {
    throw fail(405, "Application passwords are disabled");
  }
  async login() {
    throw fail(405, "Use Google sign-in");
  }
  async rotatePassword() {
    throw fail(405, "Application passwords are disabled");
  }
  async logout() {
    /* Client Firebase signOut destroys its local token; no application session exists. */
  }
  publicConfiguration() {
    const { principals, ...publicConfig } = this.configuration;
    return publicConfig;
  }
  async getVerifier() {
    if (!this.verifierPromise)
      this.verifierPromise = (async () => {
        if (this.verifier) return this.verifier;
        const { initializeApp } = await import("firebase-admin/app");
        const { getAuth } = await import("firebase-admin/auth");
        const app = initializeApp(
          { projectId: this.configuration.firebase.projectId },
          `studio-${randomUUID()}`,
        );
        const auth = getAuth(app);
        return (token, checkRevoked) => auth.verifyIdToken(token, checkRevoked);
      })();
    return this.verifierPromise;
  }
  async authenticate(token) {
    await this.ready;
    if (typeof token !== "string" || !token || token.length > 16384)
      return null;
    let claims;
    try {
      claims = await (await this.getVerifier())(token, true);
    } catch {
      return null;
    }
    const now = Date.now() / 1000;
    if (
      claims.aud !== this.configuration.firebase.projectId ||
      claims.iss !==
        `https://securetoken.google.com/${this.configuration.firebase.projectId}` ||
      typeof claims.sub !== "string" ||
      !claims.sub ||
      claims.sub.length > 128 ||
      !Number.isFinite(claims.exp) ||
      claims.exp <= now ||
      !Number.isFinite(claims.iat) ||
      claims.iat > now + 60 ||
      claims.email_verified !== true ||
      claims.firebase?.sign_in_provider !== "google.com"
    )
      return null;
    const allowed = this.configuration.principals.find(
      (principal) =>
        typeof claims.email === "string" &&
        principal.email === claims.email.toLowerCase(),
    );
    if (!allowed) return null;
    const user = (await this.store.get("identity")).users.find(
      (user) =>
        user.email === allowed.email &&
        user.authProvider === "google" &&
        user.role === allowed.role,
    );
    return user
      ? {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
        }
      : null;
  }
}
