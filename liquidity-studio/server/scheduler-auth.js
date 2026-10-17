import { createPublicKey, verify } from "node:crypto";
import { fail } from "./auth.js";
let cachedKeys = null,
  cacheUntil = 0;
export async function verifySchedulerIdentity(
  token,
  {
    audience = process.env.STUDIO_SCHEDULER_AUDIENCE,
    email = process.env.STUDIO_SCHEDULER_EMAIL,
    keys,
  } = {},
) {
  if (!audience || !email || typeof token !== "string" || token.length > 16000)
    throw fail(401, "Scheduler identity required");
  let header, payload, signature, signingInput;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error();
    header = JSON.parse(Buffer.from(parts[0], "base64url"));
    payload = JSON.parse(Buffer.from(parts[1], "base64url"));
    signature = Buffer.from(parts[2], "base64url");
    signingInput = Buffer.from(parts.slice(0, 2).join("."));
  } catch {
    throw fail(401, "Invalid scheduler identity");
  }
  if (
    header.alg !== "RS256" ||
    typeof header.kid !== "string" ||
    !["accounts.google.com", "https://accounts.google.com"].includes(
      payload.iss,
    ) ||
    payload.aud !== audience ||
    payload.email !== email ||
    payload.email_verified !== true ||
    !Number.isFinite(payload.exp) ||
    payload.exp * 1000 < Date.now() ||
    !Number.isFinite(payload.iat) ||
    payload.iat * 1000 > Date.now() + 60000
  )
    throw fail(401, "Invalid scheduler identity");
  if (!keys) {
    if (!cachedKeys || Date.now() > cacheUntil) {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/certs",
        { signal: AbortSignal.timeout(5000), redirect: "error" },
      );
      if (!response.ok)
        throw fail(503, "Scheduler identity verification unavailable");
      const body = await response.json();
      if (!Array.isArray(body.keys))
        throw fail(503, "Scheduler identity verification unavailable");
      cachedKeys = body.keys;
      cacheUntil = Date.now() + 3600000;
    }
    keys = cachedKeys;
  }
  const jwk = keys.find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) throw fail(401, "Unknown scheduler signing key");
  let valid = false;
  try {
    valid = verify(
      "RSA-SHA256",
      signingInput,
      createPublicKey({ key: jwk, format: "jwk" }),
      signature,
    );
  } catch {}
  if (!valid) throw fail(401, "Invalid scheduler signature");
  return payload;
}
export function schedulerScope(organizationId, brandId) {
  let allowed;
  try {
    allowed = JSON.parse(process.env.STUDIO_SCHEDULER_SCOPES || "[]");
  } catch {
    throw fail(503, "Scheduler scopes are not configured");
  }
  if (
    !Array.isArray(allowed) ||
    !allowed.some(
      (scope) =>
        scope.organizationId === organizationId && scope.brandId === brandId,
    )
  )
    throw fail(403, "Scheduler scope denied");
  return { organizationId, brandId };
}
