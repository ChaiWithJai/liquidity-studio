// Drive the same disclosure controls as the hosted native-editor user journey.
export async function setNativeTool(page, tool, open = true) {
  const menu = page.locator(`.native-tools > details[data-native-tool="${tool}"]`);
  if ((await menu.getAttribute('open') !== null) !== open)
    await menu.locator(':scope > summary').click();
}
export async function closeNativeTools(page) {
  const openMenus = page.locator('.native-tools > details[open]');
  while (await openMenus.count()) await openMenus.first().locator(':scope > summary').click();
}
