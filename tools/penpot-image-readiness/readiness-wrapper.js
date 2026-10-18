/* Original-owned experimental hook for pinned Penpot2.18.3.
 * The original compiled/MPL renderer and screenshot implementation are retained.
 * This file is injected before app.core.main(), never loaded as a browser script.
 */
(() => {
  "use strict";
  const config = /* STUDIO_READINESS_CONFIG */ null;
  const arity = "cljs$core$IFn$_invoke$arity$2";
  if (!config || typeof app.browser.screenshot[arity] !== "function")
    throw new Error("Pinned native screenshot readiness configuration missing");
  const original = app.browser.screenshot[arity];
  let nextCaptureId = 0;
  app.browser.screenshot[arity] = async function (frame, options) {
    const enteredAt = Date.now();
    const captureId = ++nextCaptureId;
    let ready;
    try {
      ready = await frame.evaluate(
        async (root, limits) => {
          const holdKey = "__studioNativeDecodedImageHoldV1";
          if (root[holdKey])
            throw new Error("Native image readiness already active");
          const hrefs = [
            ...new Set(
              Array.from(
                root.querySelectorAll("image"),
                (element) =>
                  element.getAttribute("href") ||
                  element.getAttributeNS(
                    "http://www.w3.org/1999/xlink",
                    "href",
                  ),
              ),
            ),
          ];
          if (
            hrefs.length > 8 ||
            hrefs.some((value) => typeof value !== "string" || !value)
          )
            throw new Error("Native image readiness count invalid");
          const startedAt = Date.now(),
            startedMs = performance.now();
          if (!hrefs.length)
            return {
              images: 0,
              enteredAt: startedAt,
              enteredMs: startedMs,
              decodedAt: startedAt,
              decodedMs: startedMs,
              resources: [],
            };
          if (!limits.frameIds.includes(root.id.replace(/^screenshot-/, "")))
            throw new Error("Native image frame is outside the owned fixture");
          if (
            !["http://penpot-frontend:8080", "http://localhost:39008"].includes(
              location.origin,
            )
          )
            throw new Error("Native render origin unsupported");
          const resources = hrefs.map((href, index) => {
            const url = new URL(href, location.href);
            if (
              url.origin !== location.origin ||
              url.search ||
              url.hash ||
              !limits.imagePaths.includes(url.pathname)
            )
              throw new Error(
                "Native image resource is outside the owned fixture",
              );
            const previous = performance
              .getEntriesByName(url.href)
              .filter((entry) => entry.entryType === "resource")
              .at(-1);
            return {
              url: url.href,
              index,
              responseEndAtEntryMs: previous?.responseEnd ?? null,
            };
          });
          const images = [],
            metrics = [];
          let timeout,
            pixels = 0,
            completed = false;
          try {
            const decode = Promise.all(
              resources.map(async (resource) => {
                const image = new Image();
                images.push(image);
                const decodeStartedMs = performance.now();
                image.src = resource.url;
                await image.decode();
                const width = image.naturalWidth,
                  height = image.naturalHeight;
                if (!width || !height || width > 1024 || height > 1024)
                  throw new Error(
                    "Native image dimensions exceed fixture limit",
                  );
                pixels += width * height;
                if (pixels > 8 * 1024 * 1024)
                  throw new Error("Native image decoded budget exceeded");
                metrics.push({
                  index: resource.index,
                  width,
                  height,
                  responseEndAtEntryMs: resource.responseEndAtEntryMs,
                  decodeStartedMs,
                  decodedMs: performance.now(),
                });
              }),
            ).then(
              () =>
                new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                ),
            );
            await Promise.race([
              decode,
              new Promise((_, reject) => {
                timeout = setTimeout(
                  () =>
                    reject(new Error("Native image decode deadline exceeded")),
                  15000,
                );
              }),
            ]);
            root[holdKey] = { captureId: limits.captureId, images };
            completed = true;
            return {
              images: images.length,
              enteredAt: startedAt,
              enteredMs: startedMs,
              decodedAt: Date.now(),
              decodedMs: performance.now(),
              resources: metrics.sort((a, b) => a.index - b.index),
            };
          } finally {
            clearTimeout(timeout);
            if (!completed) for (const image of images) image.src = "";
          }
        },
        { ...config, captureId },
      );
      console.info(
        "studio-native-image-readiness",
        JSON.stringify({ event: "ready", nodeEnteredAt: enteredAt, ...ready }),
      );
      const captureStartedAt = Date.now();
      const result = await original.call(this, frame, options);
      console.info(
        "studio-native-image-readiness",
        JSON.stringify({
          event: "captured",
          images: ready.images,
          captureStartedAt,
          capturedAt: Date.now(),
        }),
      );
      return result;
    } catch {
      // Never log URLs, cookies, option paths or raw upstream exception bodies.
      console.error(
        "studio-native-image-readiness",
        JSON.stringify({
          event: "failed",
          enteredAt,
          failedAt: Date.now(),
          images: ready?.images ?? null,
        }),
      );
      throw new Error("Owned native image readiness or screenshot failed");
    } finally {
      await frame
        .evaluate((root, currentCaptureId) => {
          const key = "__studioNativeDecodedImageHoldV1";
          if (root[key]?.captureId !== currentCaptureId) return;
          for (const image of root[key].images) image.src = "";
          delete root[key];
        }, captureId)
        .catch(() => {});
    }
  };
})();
