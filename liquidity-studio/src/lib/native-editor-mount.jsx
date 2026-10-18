// Original Studio bridge; the editor source is locally prepared at the pinned commit.
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorApp } from '../../.native-editor-source/editor/EditorApp';
import '../../.native-editor-source/styles/tokens.css';

export function mountNativeEditor(element, props) {
  const root = createRoot(element);
  const ref = createRef();
  root.render(createElement(EditorApp, { ...props, ref }));
  return {
    saveNow: () => ref.current?.saveNow(),
    getDocument: () => ref.current?.getDocument(),
    isDirty: () => ref.current?.isDirty() ?? false,
    destroy: () => root.unmount(),
  };
}
