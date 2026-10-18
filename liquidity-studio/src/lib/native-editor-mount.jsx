// Original Studio bridge; the editor source is locally prepared at the pinned commit.
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { UploadError } from '../../.native-editor-source/editor/engine/assets';
import { EditorApp } from '../../.native-editor-source/editor/EditorApp';
import '../../.native-editor-source/styles/tokens.css';

export function mountNativeEditor(element, props) {
  const root = createRoot(element);
  const ref = createRef();
  const adapter = { ...props.adapter, async uploadAsset(...args) {
    try { return await props.adapter.uploadAsset(...args); }
    catch (error) { throw new UploadError(error instanceof Error ? error.message : 'Native image upload failed.'); }
  } };
  root.render(createElement(EditorApp, { ...props, adapter, ref }));
  return {
    saveNow: () => ref.current?.saveNow(),
    getDocument: () => ref.current?.getDocument(),
    isDirty: () => ref.current?.isDirty() ?? false,
    destroy: () => root.unmount(),
  };
}
