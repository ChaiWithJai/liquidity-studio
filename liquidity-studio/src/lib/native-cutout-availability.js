/** Probe only the existing authenticated manifest, never model chunks/inference.
 * Keep the editor usable and report a safe recovery path if its tool is absent. */
export async function nativeCutoutAvailability(request) {
  try {
    await request("/api/studio/native-editor/cutout/model");
    return { enabled: true, message: "" };
  } catch (error) {
    return {
      enabled: false,
      message: error?.code === "CUTOUT_UNAVAILABLE"
        ? "Background removal is unavailable in this workspace. You can still upload and edit images; the original is unchanged."
        : "Background removal could not connect. Save your edits, then reopen the editor to try again; the original image is unchanged.",
    };
  }
}
