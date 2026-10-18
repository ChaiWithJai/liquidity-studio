import { fail } from "./auth.js";
import { penpotActionDigest } from "./penpot-action-ledger.js";

const ORIGINS = Object.freeze({
  loopback: "http://localhost:39008",
  "docker-host": "http://host.docker.internal:39008",
});
const UUID = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;

/** Validate only the native session cookie; never forward unrelated Studio
 * cookies, a Google bearer, an operator session or caller-supplied URLs.
 */
export function penpotPresentedSession(cookie) {
  if (
    typeof cookie !== "string" ||
    cookie.length > 8192 ||
    /[\r\n\x00-\x1f]/.test(cookie)
  )
    throw fail(401, "Native session required");
  const values = cookie
    .split(";")
    .map((value) => value.trim())
    .filter((value) => value.startsWith("auth-token="));
  if (
    values.length !== 1 ||
    values[0].length <= 11 ||
    values[0].length > 4107 ||
    /[,\s]/.test(values[0])
  )
    throw fail(401, "Native session required");
  return values[0];
}

export function parsePenpotMediaPath(path) {
  if (typeof path !== "string" || path.length > 200)
    throw fail(404, "Native asset not found");
  const found =
    /^\/assets\/(by-id|by-file-media-id)\/([a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12})(\/thumbnail)?$/.exec(
      path,
    );
  if (!found || (found[1] === "by-id" && found[3]))
    throw fail(404, "Native asset not found");
  return { kind: found[1], id: found[2], thumbnail: Boolean(found[3]) };
}

export function createPenpotNativeReader({
  transportMode = "loopback",
  fetchImpl = fetch,
  runAuthorityPhase = (work) => work(),
} = {}) {
  const origin = ORIGINS[transportMode];
  if (!origin) throw Error("Fixed native reader transport required");
  return async function read(cookie, command, body) {
    const session = penpotPresentedSession(cookie);
    if (!["get-profile", "get-file"].includes(command))
      throw fail(400, "Unsupported native permission command");
    const response = await fetchImpl(`${origin}/api/rpc/command/${command}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: session,
        Origin: "http://localhost:39008",
      },
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok)
      throw fail(
        response.status === 401 ? 401 : 403,
        "Native asset access denied",
      );
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 2 * 1024 * 1024)
        throw fail(503, "Native permission response exceeded its bound");
      chunks.push(chunk);
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw fail(503, "Native permission response invalid");
    }
  };
}

/** Authorization only: it never returns media bytes or credentials. Registry and
 * actor revalidation are server-owned dependencies. No positive auth is cached.
 */
export function createPenpotMediaAuthorizer({
  resolve,
  authorize,
  transportMode = "loopback",
  fetchImpl = fetch,
}) {
  if (
    !Object.hasOwn(ORIGINS, transportMode) ||
    typeof resolve !== "function" ||
    typeof authorize !== "function" ||
    typeof runAuthorityPhase !== "function"
  )
    throw new Error("Fixed native media authorization dependencies required");
  const reader = createPenpotNativeReader({ transportMode, fetchImpl });
  let active = 0;
  async function checkRead({ path, cookie }) {
    const requested = parsePenpotMediaPath(path);
    const session = penpotPresentedSession(cookie);
    const rpc = (command, body) => reader(session, command, body);
    // Both calls use the PRESENTED native session, never the private operator
    // session. get-file itself applies the official current file read ACL.
    const profile = await rpc("get-profile", {});
    const record = await runAuthorityPhase(async () => {
      const record = await resolve(requested, profile.id);
      if (
        !record ||
        ![record.fileId, record.projectId, record.ownerPrincipal].every(
          (id) => typeof id === "string" && UUID.test(id),
        )
      )
        throw fail(404, "Registered native asset not found");
      await authorize(record);
      return record;
    });
    if (profile.id !== record.ownerPrincipal)
      throw fail(403, "Native asset owner mismatch");
    const file = await rpc("get-file", { id: record.fileId });
    if (file.id !== record.fileId || file.projectId !== record.projectId)
      throw fail(403, "Native asset file mismatch");
    if (
      record.kind === "legacy-native-copy" &&
      !Object.values(file.data?.pagesIndex || {}).some((page) =>
        Object.values(page.objects || {}).some((shape) =>
          shape.fills?.some(
            (fill) => fill.fillImage?.id === record.fileMediaId,
          ),
        ),
      )
    )
      throw fail(
        403,
        "Legacy image is not referenced by its registered native file",
      );
    if (
      record.kind === "native-export" &&
      (file.revn !== record.nativeRevision ||
        penpotActionDigest(file.data) !== record.nativeSha256)
    )
      throw fail(409, "Native export file changed");
    await runAuthorityPhase(async () => {
      const final = await resolve(requested, profile.id);
      if (!final || JSON.stringify(final) !== JSON.stringify(record))
        throw fail(403, "Native asset registration changed");
      await authorize(final);
    });
    return { authorized: true };
  }
  return async function authorizeRead(request) {
    if (active >= 8) throw fail(503, "Native permission lookup is busy");
    active++;
    try {
      return await checkRead(request);
    } finally {
      active--;
    }
  };
}
