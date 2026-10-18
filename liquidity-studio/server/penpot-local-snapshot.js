import { fail } from "./auth.js";
import { penpotRasterProof } from "./penpot-raster-proof.js";
const ENDPOINTS = Object.freeze({
  loopback: "http://localhost:39008/api/rpc/command/",
  "docker-host": "http://host.docker.internal:39008/api/rpc/command/",
});
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
/** Private owner sessions are constructor-only. No arbitrary native host or URL. */
export function createPenpotLocalSnapshot({
  sessions,
  fetchImpl = fetch,
  transportMode = "loopback",
}) {
  if (!Object.hasOwn(ENDPOINTS, transportMode))
    throw new Error("Unsupported fixed native transport mode");
  const BASE = ENDPOINTS[transportMode];
  return async (input, { manifest, colors, raster = null }) => {
    const session = sessions.get(input.binding.ownerPrincipal);
    if (
      !session ||
      typeof session.cookie !== "string" ||
      session.cookie.length > 4096 ||
      !UUID.test(input.resource.nativeId)
    )
      throw fail(403, "Registered native owner unavailable");
    async function rpc(command, body) {
      const response = await fetchImpl(BASE + command, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "http://localhost:39008",
          Cookie: session.cookie,
        },
        body: JSON.stringify(body),
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw fail(502, "Native owner lookup failed");
      let total = 0;
      const chunks = [];
      for await (const chunk of response.body) {
        total += chunk.length;
        if (total > 2 * 1024 * 1024) {
          await response.body.cancel?.().catch(() => {});
          throw fail(502, "Native document too large");
        }
        chunks.push(chunk);
      }
      try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        throw fail(502, "Native response invalid");
      }
    }
    const profile = await rpc("get-profile", {}),
      file = await rpc("get-file", { id: input.resource.nativeId });
    if (
      profile.id !== input.binding.ownerPrincipal ||
      file.id !== input.resource.nativeId ||
      file.projectId !== input.binding.nativeProjectId ||
      !Number.isInteger(file.revn) ||
      !file.data?.pagesIndex
    )
      throw fail(403, "Native owner or project mismatch");
    const tokenValues = [0, 1, 2, 3].map((i) =>
      file.data.tokensLib?.Studio?.studio?.["color" + i]?.$value?.toLowerCase(),
    );
    const imageBoards = [
      ...new Map(
        (manifest.layers || []).flatMap((layer) => {
          const page = file.data.pagesIndex[layer.pageId];
          const frameId = page?.objects?.[layer.nativeId]?.frameId;
          const frame = page?.objects?.[frameId];
          return frame?.type === "frame"
            ? [
                [
                  `${layer.pageId}:${frameId}`,
                  {
                    pageId: layer.pageId,
                    frameId,
                    name: frame.name,
                    x: frame.x,
                    y: frame.y,
                    width: frame.width,
                    height: frame.height,
                  },
                ],
              ]
            : [];
        }),
      ).values(),
    ];
    if (
      input.command?.operation === "import-private-raster" &&
      !manifest.layers.some(
        (layer) =>
          layer.pageId === input.command.pageId &&
          file.data.pagesIndex[layer.pageId]?.objects?.[layer.nativeId]
            ?.frameId === input.command.frameId,
      )
    )
      throw fail(403, "Image board is outside the registered source layout");
    let boundPaintsMatch =
      Array.isArray(manifest.layers) && manifest.layers.length > 0;
    for (const layer of manifest.layers || []) {
      const shape =
        file.data.pagesIndex[layer.pageId]?.objects?.[layer.nativeId];
      const index = Number(layer.tokenName.slice(-1));
      if (
        !shape ||
        shape.appliedTokens?.fill !== layer.tokenName ||
        !/^studio\.color[0-3]$/.test(layer.tokenName)
      ) {
        boundPaintsMatch = false;
        break;
      }
      let count = 0;
      function walk(value, depth = 0) {
        if (depth > 32) {
          boundPaintsMatch = false;
          return;
        }
        if (!value || typeof value !== "object") return;
        if (Array.isArray(value.fills)) {
          if (value.fills.length === 0) boundPaintsMatch = false;
          else count++;
          if (
            value.fills.some(
              (fill) =>
                typeof fill?.fillColor !== "string" ||
                fill.fillColor.toLowerCase() !==
                  colors[index].hex.toLowerCase(),
            )
          )
            boundPaintsMatch = false;
        }
        for (const [key, child] of Object.entries(value))
          if (key !== "positionData") walk(child, depth + 1);
      }
      walk(shape);
      if (!count) boundPaintsMatch = false;
    }
    return {
      ownerPrincipal: profile.id,
      fileId: file.id,
      projectId: file.projectId,
      editorVersion: "2.18.3",
      revision: file.revn,
      tokenValues,
      boundPaintsMatch,
      imageBoards,
      ...(input.command?.operation === "import-private-raster"
        ? penpotRasterProof(file, input.command, raster)
        : {}),
    };
  };
}
