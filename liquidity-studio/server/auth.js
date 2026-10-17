import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
export function fail(status, message) {
  return Object.assign(new Error(message), { status });
}
const publicUser = ({ id, username, role }) => ({ id, username, role });
const digest = (token) => createHash("sha256").update(token).digest("hex");
export class IdentityService {
  constructor(store) {
    this.store = store;
    this.mode = "password";
    this.ready = store.update(
      "identity",
      (value) =>
        value || {
          users: [],
          organizations: [
            {
              id: "org_default",
              name: "Studio",
              brands: [
                {
                  id: "brand_default",
                  name: "The Liquidity Desk",
                  preset: "liquidity_desk",
                },
                {
                  id: "brand_vedic",
                  name: "Chai With Jai",
                  preset: "vedic_dharma",
                },
              ],
            },
          ],
          memberships: [],
        },
    );
    this.dummySalt = randomBytes(16).toString("hex");
  }
  async provision({ username, password, role }) {
    if (
      !["founder", "marketer"].includes(role) ||
      typeof username !== "string" ||
      !username.trim() ||
      username.length > 128 ||
      typeof password !== "string" ||
      password.length < 12
    )
      throw fail(
        400,
        "Username and a password of at least 12 characters are required",
      );
    await this.ready;
    return this.store.update("identity", (state) => {
      if (state.users.some((user) => user.username === username)) return state;
      const salt = randomBytes(16).toString("hex");
      const user = {
        id: randomUUID(),
        username,
        role,
        salt,
        passwordHash: scryptSync(password, salt, 64).toString("hex"),
      };
      state.users.push(user);
      state.memberships.push({
        userId: user.id,
        organizationId: "org_default",
        brandIds: ["brand_default", "brand_vedic"],
      });
      return state;
    });
  }
  async provisionFromEnvironment() {
    if (
      process.env.STUDIO_FOUNDER_PASSWORD &&
      process.env.STUDIO_MARKETER_PASSWORD &&
      (process.env.STUDIO_FOUNDER_USERNAME || "founder") ===
        (process.env.STUDIO_MARKETER_USERNAME || "marketer")
    )
      throw fail(503, "Founder and marketer usernames must differ");
    for (const role of ["founder", "marketer"]) {
      const prefix = `STUDIO_${role.toUpperCase()}`;
      if (process.env[`${prefix}_PASSWORD`])
        await this.provision({
          username: process.env[`${prefix}_USERNAME`] || role,
          password: process.env[`${prefix}_PASSWORD`],
          role,
        });
    }
  }
  async login(username, password) {
    await this.ready;
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      password.length > 1024
    )
      return null;
    const attempts = await this.store.get(`login:${username}`);
    if (attempts?.until > Date.now() && attempts.count >= 10)
      throw fail(429, "Too many login attempts; retry later");
    const user = (await this.store.get("identity")).users.find(
      (user) => user.username === username,
    );
    const hash = scryptSync(password, user?.salt || this.dummySalt, 64);
    if (
      !user?.passwordHash ||
      !timingSafeEqual(hash, Buffer.from(user.passwordHash, "hex"))
    ) {
      await this.store.update(`login:${username}`, (old) => ({
        until:
          old?.until > Date.now() ? old.until : Date.now() + 15 * 60 * 1000,
        count: old?.until > Date.now() ? old.count + 1 : 1,
      }));
      return null;
    }
    await this.store.delete(`login:${username}`);
    const token = randomBytes(32).toString("base64url");
    await this.store.update(`session:${digest(token)}`, () => ({
      userId: user.id,
      authVersion: user.authVersion || 0,
      expiresAt: Date.now() + 8 * 3600000,
    }));
    return { token, user: publicUser(user) };
  }
  async authenticate(token) {
    if (!token || typeof token !== "string" || token.length > 256) return null;
    const session = await this.store.get(`session:${digest(token)}`);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      await this.logout(token);
      return null;
    }
    const user = (await this.store.get("identity")).users.find(
      (user) => user.id === session.userId,
    );
    return user && (session.authVersion || 0) === (user.authVersion || 0)
      ? publicUser(user)
      : null;
  }
  async logout(token) {
    if (token) await this.store.delete(`session:${digest(token)}`);
  }
  async organizations(user) {
    await this.ready;
    const state = await this.store.get("identity");
    return state.organizations
      .filter((org) =>
        state.memberships.some(
          (member) =>
            member.userId === user.id && member.organizationId === org.id,
        ),
      )
      .map((org) => ({
        ...org,
        brands: org.brands.filter((brand) =>
          state.memberships.some(
            (member) =>
              member.userId === user.id &&
              member.organizationId === org.id &&
              member.brandIds.includes(brand.id),
          ),
        ),
      }));
  }
  async authorize(user, organizationId, brandId) {
    if (!user) throw fail(401, "Sign in required");
    const org = (await this.organizations(user)).find(
      (org) => org.id === organizationId,
    );
    const brand = org?.brands.find((brand) => brand.id === brandId);
    if (!brand) throw fail(403, "Organization or brand access denied");
    return { organizationId, brandId, preset: brand.preset };
  }
  requireFounder(user) {
    if (user?.role !== "founder") throw fail(403, "Founder access required");
  }
  async createOrganization(user, name) {
    this.requireFounder(user);
    const organization = { id: randomUUID(), name, brands: [] };
    await this.store.update("identity", (state) => {
      state.organizations.push(organization);
      state.memberships.push({
        userId: user.id,
        organizationId: organization.id,
        brandIds: [],
      });
      return state;
    });
    return organization;
  }
  async createBrand(user, { organizationId, name, preset = "liquidity_desk" }) {
    this.requireFounder(user);
    if (
      !(await this.organizations(user)).some((org) => org.id === organizationId)
    )
      throw fail(403, "Organization access denied");
    const brand = { id: randomUUID(), name, preset };
    await this.store.update("identity", (state) => {
      state.organizations
        .find((org) => org.id === organizationId)
        .brands.push(brand);
      state.memberships
        .find(
          (member) =>
            member.userId === user.id &&
            member.organizationId === organizationId,
        )
        .brandIds.push(brand.id);
      return state;
    });
    return brand;
  }
  async listUsers(user, organizationId) {
    this.requireFounder(user);
    if (
      !(await this.organizations(user)).some((org) => org.id === organizationId)
    )
      throw fail(403, "Organization access denied");
    const state = await this.store.get("identity");
    return state.users
      .filter((target) =>
        state.memberships.some(
          (member) =>
            member.userId === target.id &&
            member.organizationId === organizationId,
        ),
      )
      .map(publicUser);
  }
  async rotatePassword(user, { userId, password, organizationId }) {
    this.requireFounder(user);
    if (
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 1024
    )
      throw fail(400, "Password must have 12 to 1024 characters");
    if (
      !(await this.listUsers(user, organizationId)).some(
        (target) => target.id === userId,
      )
    )
      throw fail(403, "User access denied");
    const salt = randomBytes(16).toString("hex"),
      passwordHash = scryptSync(password, salt, 64).toString("hex");
    await this.store.update("identity", (state) => {
      const target = state.users.find((target) => target.id === userId);
      Object.assign(target, {
        salt,
        passwordHash,
        authVersion: (target.authVersion || 0) + 1,
      });
      return state;
    });
    return { rotated: true, sessionsRevoked: true };
  }
  async setMembership(user, { userId, organizationId, brandIds }) {
    this.requireFounder(user);
    const owned = (await this.organizations(user)).find(
      (org) => org.id === organizationId,
    );
    if (
      !owned ||
      brandIds.some((id) => !owned.brands.some((brand) => brand.id === id))
    )
      throw fail(403, "Organization or brand access denied");
    await this.store.update("identity", (state) => {
      if (!state.users.some((member) => member.id === userId))
        throw fail(404, "User not found");
      state.memberships = state.memberships.filter(
        (member) =>
          !(
            member.userId === userId && member.organizationId === organizationId
          ),
      );
      state.memberships.push({ userId, organizationId, brandIds });
      return state;
    });
    return { updated: true };
  }
}
