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
