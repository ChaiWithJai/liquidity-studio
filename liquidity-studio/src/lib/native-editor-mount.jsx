// Original Studio bridge; the editor source is locally prepared at the pinned commit.
import { createElement, createRef, useEffect, useState, Fragment } from "react";
import { createRoot } from "react-dom/client";
import { UploadError } from "../../.native-editor-source/editor/engine/assets";
import { useEditor } from "../../.native-editor-source/editor/context";
import { registerBackgroundRemover } from "../../.native-editor-source/editor/engine/bgRemoval";
import { createNativeCutoutRemover } from "./native-cutout-remover.js";
import { EditorApp } from "../../.native-editor-source/editor/EditorApp";
import "../../.native-editor-source/styles/tokens.css";

export function mountNativeEditor(element, props) {
  const root = createRoot(element);
  const ref = createRef();
  let engine = null;
  let reportStatus = () => {};
  const remover = props.cutoutRequest
    ? createNativeCutoutRemover({
        request: props.cutoutRequest,
        adapter: props.adapter,
        getEngine: () => engine,
        onStatus: (message) => {
          reportStatus(message);
          props.onCutoutStatus?.(message);
        },
      })
    : null;
  function CutoutContext() {
    const current = useEditor();
    const [status, setStatus] = useState("");
    useEffect(() => {
      engine = current;
      reportStatus = setStatus;
      if (remover) registerBackgroundRemover(remover);
      return () => {
        engine = null;
        reportStatus = () => {};
        if (remover) registerBackgroundRemover(null);
      };
    }, [current]);
    return status
      ? createElement(
          "span",
          {
            role: "status",
            "aria-live": "polite",
            "data-testid": "native-cutout-status",
            style: {
              maxWidth: "22rem",
              fontSize: "12px",
              overflowWrap: "anywhere",
            },
          },
          status,
        )
      : null;
  }
  const adapter = {
    ...props.adapter,
    async uploadAsset(...args) {
      try {
        return await props.adapter.uploadAsset(...args);
      } catch (error) {
        throw new UploadError(
          error instanceof Error
            ? error.message
            : "Native image upload failed.",
        );
      }
    },
  };
  root.render(
    createElement(EditorApp, {
      ...props,
      adapter,
      ref,
      topBarEnd: createElement(
        Fragment,
        null,
        props.topBarEnd,
        createElement(CutoutContext),
      ),
    }),
  );
  return {
    saveNow: () => ref.current?.saveNow(),
    getDocument: () => ref.current?.getDocument(),
    isDirty: () => ref.current?.isDirty() ?? false,
    destroy: () => {
      remover?.dispose();
      root.unmount();
    },
  };
}
