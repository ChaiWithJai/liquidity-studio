// Original host provider: pinned built-in catalog only, no Django HTTP request.
import { BUILTIN_PRESET_TREE } from "../../.native-editor-source/lib/sizePresets/builtin";
import { buildCatalogue } from "../../.native-editor-source/lib/sizePresets/catalogue";
const catalog = buildCatalogue(BUILTIN_PRESET_TREE);
export const getSizePresets = () => catalog;
export const useSizePresets = () => catalog;
export const loadSizePresets = async () => catalog;
export const sizePresetsReady = async () => catalog;
export const subscribeSizePresets = () => () => {};
export const BUILTIN_CATALOGUE = catalog;
// Export compatibility only; the host's catalog cannot be mutated through upstream test helpers.
export const resetSizePresetsForTests = () => {
  throw new Error("Host catalog is immutable");
};
export const setSizePresetsForTests = () => {
  throw new Error("Host catalog is immutable");
};
