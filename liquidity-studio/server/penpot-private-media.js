import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { fail } from "./auth.js";

const UUID = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const SHA = /^[a-f0-9]{64}$/;
const ORIGINS = Object.freeze({
  loopback: "http://localhost:39008",
  "docker-host": "http://host.docker.internal:39008",
});
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function bounded(response, limit) {
  let size = 0;
  const chunks = [];
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > limit) {
      await response.body.cancel?.().catch(() => {});
      throw fail(502, "Native media response exceeded its bound");
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** Fixed local Penpot upload. assetFor and current are trusted server dependencies.
 * No URL, cookie, object reference or source bytes are taken from a client intent.
 * The caller reserves mediaId durably before invoking upload, and keeps it on an
 * unknown response. Repeating that exact ID is supported by the pinned upstream.
 */
export function createPenpotPrivateMedia({
  sessions,
  assetFor,
  current,
  transportMode = "loopback",
  fetchImpl = fetch,
  assertPrivateDelivery = null,
  onUploaded = async () => {},
}) {
  if (!Object.hasOwn(ORIGINS, transportMode))
    throw new Error("Unsupported fixed native media transport");
  const origin = ORIGINS[transportMode];
  if (typeof assetFor !== "function" || typeof current !== "function")
    throw new Error(
      "Current scoped asset and native context resolvers required",
    );

  return async function upload(input, reservation) {
    // The pinned upstream explicitly makes file-media-object public by id.
    // Scoped upload permission does not make that delivery private. Runtime does
    // not supply this dependency until a governed byte-delivery path is proven.
    if (typeof assertPrivateDelivery !== "function")
      throw fail(
        422,
        "Private raster delivery is unsupported by the current native asset server",
      );
    await assertPrivateDelivery(input);
    if (
      !reservation ||
      !UUID.test(reservation.mediaId) ||
      !/^[a-f0-9]{32}$/.test(reservation.assetId) ||
      !SHA.test(reservation.sha256) ||
      typeof reservation.generation !== "string" ||
      !reservation.generation.length ||
      reservation.generation.length > 200
    )
      throw fail(400, "Invalid server-reserved private media intent");
    // current() verifies managed actor, current membership, registered owner,
    // source/generation/brand and exact native revision before any native write.
    const context = await current(input);
    const session = sessions.get(context.ownerPrincipal);
    if (
      context.editorVersion !== "2.18.3" ||
      !UUID.test(context.fileId) ||
      !UUID.test(context.projectId) ||
      !UUID.test(context.ownerPrincipal) ||
      !session?.cookie ||
      session.cookie.length > 4096 ||
      /[\r\n]/.test(session.cookie)
    )
      throw fail(403, "Registered native media owner unavailable");
    const asset = await assetFor(input, reservation.assetId);
    if (
      asset.id !== reservation.assetId ||
      asset.sha256 !== reservation.sha256 ||
      asset.generation !== reservation.generation ||
      typeof asset.rightsDeclaration !== "string" ||
      !asset.rightsDeclaration.trim() ||
      asset.rightsDeclaration.length > 500 ||
      !["confirmed", "not_personal_data"].includes(asset.consent) ||
      !["image/png", "image/jpeg", "image/webp"].includes(asset.contentType) ||
      !Number.isSafeInteger(asset.width) ||
      asset.width < 1 ||
      !Number.isSafeInteger(asset.height) ||
      asset.height < 1 ||
      asset.width * asset.height > 4_000_000 ||
      typeof asset.base64 !== "string"
    )
      throw fail(
        409,
        "Current private asset provenance changed or is unsupported",
      );
    const bytes = Buffer.from(asset.base64, "base64");
    if (
      !bytes.length ||
      bytes.length > 512 * 1024 ||
      bytes.length !== asset.size ||
      digest(bytes) !== reservation.sha256 ||
      bytes.toString("base64") !== asset.base64
    )
      throw fail(409, "Current private asset integrity mismatch");
    const headers = {
      Accept: "application/json",
      Origin: "http://localhost:39008",
      Cookie: session.cookie,
    };
    const beforeUpload = await current(input);
    if (!isDeepStrictEqual(beforeUpload, context))
      throw fail(409, "Native registration or source changed before upload");
    await assertPrivateDelivery(input);
    const form = new FormData();
    form.set("id", reservation.mediaId);
    form.set("file-id", context.fileId);
    form.set("is-local", "false");
    form.set("name", `Studio private ${reservation.assetId}`);
    form.set(
      "content",
      new Blob([bytes], { type: asset.contentType }),
      "studio-private-raster",
    );
    const response = await fetchImpl(
      `${origin}/api/rpc/command/upload-file-media-object`,
      {
        method: "POST",
        headers,
        body: form,
        redirect: "error",
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!response.ok)
      throw fail(502, "Native private media upload was not confirmed");
    let media;
    try {
      media = JSON.parse((await bounded(response, 32 * 1024)).toString("utf8"));
    } catch (error) {
      if (error.status) throw error;
      throw fail(502, "Native private media response invalid");
    }
    if (
      media.id !== reservation.mediaId ||
      media.fileId !== context.fileId ||
      !UUID.test(media.mediaId) ||
      media.width !== asset.width ||
      media.height !== asset.height ||
      media.mtype !== asset.contentType
    )
      throw fail(409, "Native media collision or registration mismatch");
    const descriptor = {
      id: media.id,
      name: `Studio private ${reservation.assetId}`,
      width: asset.width,
      height: asset.height,
      mtype: asset.contentType,
      provenance: {
        assetId: asset.id,
        sha256: asset.sha256,
        generation: asset.generation,
        rightsDeclaration: asset.rightsDeclaration,
        consent: asset.consent,
        fileId: context.fileId,
        projectId: context.projectId,
        ownerPrincipal: context.ownerPrincipal,
        mediaObjectId: media.mediaId,
      },
    };
    // Retain an unverified upload locator before the governed byte readback.
    // It grants no editorial/native completion and survives an unknown reply.
    await onUploaded(input, reservation, descriptor);
    // Compare actual served object bytes, not the name or caller-selected UUID.
    // This also makes replay collision detection independent of upstream upsert.
    const readback = await fetchImpl(
      `${origin}/assets/by-id/${media.mediaId}`,
      {
        headers: { Cookie: session.cookie },
        redirect: "error",
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (
      !readback.ok ||
      digest(await bounded(readback, 512 * 1024)) !== asset.sha256
    )
      throw fail(
        409,
        "Native media byte readback did not match the scoped asset",
      );
    if (!isDeepStrictEqual(await current(input), context))
      throw fail(
        409,
        "Native registration or source changed during media upload; reconcile the reserved media ID",
      );
    await assertPrivateDelivery(input);
    return descriptor;
  };
}
