penpot.ui.open("Studio governed token refresh", "http://localhost:39019/", {
  width: 420,
  height: 300,
});
let busy = false;
penpot.ui.onMessage(async (message) => {
  if (message?.type === "context") {
    penpot.ui.sendMessage({
      type: "context",
      fileId: penpot.currentFile?.id,
      ownerPrincipal: penpot.currentUser?.id,
    });
  } else if (message?.type === "apply" && !busy) {
    busy = true;
    try {
      const result =
        message.intent?.operation === "import-private-raster"
          ? await applyRegisteredPenpotRaster(penpot, message.intent)
          : await applyRegisteredPenpotTokens(penpot, message.intent);
      penpot.ui.sendMessage({ type: "applied", result });
    } catch (error) {
      penpot.ui.sendMessage({ type: "failed", error: String(error.message) });
    } finally {
      busy = false;
    }
  }
});
