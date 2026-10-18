/** Pinned Penpot2.18.3 public plugin API only. Never writes text/content/geometry. */
export async function applyRegisteredPenpotTokens(penpot, intent) {
  const file = penpot.currentFile;
  const owner = penpot.currentUser;
  if (
    intent?.editorVersion !== "2.18.3" ||
    !file ||
    file.id !== intent.fileId ||
    owner?.id !== intent.ownerPrincipal ||
    !Array.isArray(intent.tokens) ||
    intent.tokens.length !== 4
  )
    throw new Error("Native action context mismatch");
  const catalog = penpot.library.local.tokens;
  const sets = catalog.sets;
  const theme = catalog.themes.find((item) => item.id === intent.themeId);
  if (!theme || theme.active !== true)
    throw new Error("Registered native theme is not active");
  const activeSets = sets.filter((set) => set.active === true);
  if (
    catalog.themes.filter((item) => item.active === true).length !== 1 ||
    activeSets.length !== 1 ||
    activeSets[0].id !== intent.tokens[0]?.setId ||
    activeSets[0].tokens.length !== 4 ||
    activeSets[0].tokens.some((token) => token.type !== "color")
  )
    throw new Error("Unsupported active native token catalog");
  const seen = new Set();
  const targets = intent.tokens.map((entry, index) => {
    if (
      !entry ||
      entry.name !== `studio.color${index}` ||
      !/^#[a-f0-9]{6}$/i.test(entry.value) ||
      seen.has(entry.id)
    )
      throw new Error("Unsupported native token action");
    seen.add(entry.id);
    const set = sets.find((item) => item.id === entry.setId);
    const token = set?.getTokenById(entry.id);
    if (!token || token.name !== entry.name || token.type !== "color")
      throw new Error("Registered native token unavailable");
    // Token application is by name. Reject another set shadowing this name.
    if (
      sets.some(
        (item) =>
          item.id !== entry.setId &&
          item.tokens.some((other) => other.name === entry.name),
      )
    )
      throw new Error("Ambiguous native token name");
    return { token, value: entry.value };
  });
  if (
    penpot.currentFile.id !== intent.fileId ||
    penpot.currentUser.id !== intent.ownerPrincipal
  )
    throw new Error("Native context changed");
  // The native value setter updates tokens; reaffirming the already active theme
  // explicitly invokes native current-state propagation.
  // It does not deserialize a server snapshot over the editor's current text.
  for (const { token, value } of targets) token.value = value;
  theme.active = true;
  await penpot.waitForLayoutUpdate(10_000);
  return {
    receiptId: intent.receiptId,
    appliedTokenIds: targets.map(({ token }) => token.id),
    textWritten: false,
  };
}

/** Add one server-uploaded image to the current native board. Existing shapes,
 * text buffers, token values and geometry are never replaced or deserialized.
 * The action marker is a replay locator only; server readback remains authority.
 */
export async function applyRegisteredPenpotRaster(penpot, intent) {
  const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
  const page = penpot.currentPage;
  if (
    intent?.operation !== "import-private-raster" ||
    intent.editorVersion !== "2.18.3" ||
    !Number.isFinite(intent.expiresAt) ||
    intent.expiresAt <= Date.now() ||
    penpot.currentFile?.id !== intent.fileId ||
    penpot.currentUser?.id !== intent.ownerPrincipal ||
    !page ||
    page.id !== intent.pageId ||
    !uuid.test(intent.receiptId) ||
    !uuid.test(intent.frameId) ||
    !uuid.test(intent.media?.id) ||
    !["image/png", "image/jpeg", "image/webp"].includes(intent.media.mtype) ||
    !Number.isSafeInteger(intent.media.width) ||
    intent.media.width < 1 ||
    !Number.isSafeInteger(intent.media.height) ||
    intent.media.height < 1 ||
    !intent.placement ||
    Object.keys(intent.placement).sort().join() !== "height,width,x,y" ||
    !Object.values(intent.placement).every(Number.isFinite) ||
    intent.placement.width <= 0 ||
    intent.placement.height <= 0 ||
    intent.placement.width > 4096 ||
    intent.placement.height > 4096
  )
    throw new Error("Registered native raster action context mismatch");
  const frame = page.getShapeById(intent.frameId);
  if (!frame || frame.type !== "board")
    throw new Error(
      "Registered native board is unavailable on the current page",
    );
  const marker = `studio-private-raster:${intent.receiptId}`;
  const prior = page.findShapes({ name: marker });
  if (prior.length > 1)
    throw new Error("Ambiguous native raster recovery locator");
  if (prior.length === 1) {
    const saved = prior[0];
    const image = saved.fills?.[0]?.fillImage;
    if (
      saved.type !== "rectangle" ||
      saved.parent?.id !== frame.id ||
      saved.fills.length !== 1 ||
      image?.id !== intent.media.id ||
      ["x", "y", "width", "height"].some(
        (key) => Math.abs(saved[key] - intent.placement[key]) > 0.01,
      )
    )
      throw new Error(
        "Native raster recovery does not match the registered intent",
      );
    return {
      receiptId: intent.receiptId,
      nativeShapeId: saved.id,
      recovered: true,
      textWritten: false,
    };
  }
  // No await between final identity check and the additive setters.
  if (
    penpot.currentFile.id !== intent.fileId ||
    penpot.currentPage.id !== intent.pageId ||
    penpot.currentUser.id !== intent.ownerPrincipal
  )
    throw new Error("Native context changed before raster insertion");
  const shape = penpot.createRectangle();
  shape.name = marker;
  shape.resize(intent.placement.width, intent.placement.height);
  frame.appendChild(shape);
  shape.x = intent.placement.x;
  shape.y = intent.placement.y;
  shape.fills = [
    {
      fillOpacity: 1,
      fillImage: {
        id: intent.media.id,
        name: intent.media.name,
        width: intent.media.width,
        height: intent.media.height,
        mtype: intent.media.mtype,
        keepAspectRatio: true,
      },
    },
  ];
  await penpot.waitForLayoutUpdate(10_000);
  return {
    receiptId: intent.receiptId,
    nativeShapeId: shape.id,
    recovered: false,
    textWritten: false,
  };
}
