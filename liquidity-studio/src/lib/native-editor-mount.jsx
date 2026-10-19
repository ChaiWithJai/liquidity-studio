// Original Studio bridge; the editor source is locally prepared at the pinned commit.
import { createElement, createRef, useEffect, useState, useRef, Fragment } from "react";
import { createRoot } from "react-dom/client";
import { UploadError } from "../../.native-editor-source/editor/engine/assets";
import { useEditor } from "../../.native-editor-source/editor/context";
import { registerBackgroundRemover } from "../../.native-editor-source/editor/engine/bgRemoval";
import { createNativeCutoutRemover } from "./native-cutout-remover.js";
import { EditorApp } from "../../.native-editor-source/editor/EditorApp";
import { runExport } from "../../.native-editor-source/editor/engine/export/exporter";
import "../../.native-editor-source/styles/tokens.css";

export function mountNativeEditor(element, props) {
  const root = createRoot(element);
  const ref = createRef();
  let engine = null;
  const remover = props.cutoutRequest
    ? createNativeCutoutRemover({
        request: props.cutoutRequest,
        adapter: props.adapter,
        getEngine: () => engine,
        onStatus: (message) => {
          props.onCutoutStatus?.(message);
        },
      })
    : null;
  function CutoutContext() {
    const current = useEditor();
    useEffect(() => {
      engine = current;
      if (remover) registerBackgroundRemover(remover);
      return () => {
        engine = null;
        if (remover) registerBackgroundRemover(null);
      };
    }, [current]);
    return null;
  }

  function ExportContext() {
    const current=useEditor();
    const pending=useRef(null);
    const renderController=useRef(null);
    useEffect(()=>()=>{renderController.current?.abort();pending.current=null;},[]);
    const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
    async function prepare(){
      if(busy)return;setBusy(true);setMessage('');
      const controller=new AbortController();renderController.current=controller;
      try{
        if(ref.current?.isDirty())throw new Error('Save native edits before preparing an approved export.');
        const review=await props.exportRequest(`/api/studio/native-editor/documents/${props.meta.id}/review`);
        if(!review||review.stage!=='Approved'||review.stale)throw new Error('Approve this saved layout before preparing its PNGs.');
        const before=JSON.stringify(ref.current?.getDocument());
        const fingerprint=JSON.stringify({before,reviewRevision:review.revision,nativeRevision:review.binding.nativeRevision});
        if(pending.current?.fingerprint!==fingerprint)pending.current=null;
        const files=pending.current?.files||await runExport(current,{formatId:'png',pages:{kind:'all'},options:{scale:1,transparent:false},bundle:false,signal:controller.signal});
        if(ref.current?.isDirty()||JSON.stringify(ref.current?.getDocument())!==before)throw new Error('The canvas changed during rendering. Save and review it again.');
        pending.current ||= {fingerprint,files,keys:files.map(()=>crypto.randomUUID())};
        for(let pageIndex=0;pageIndex<files.length;pageIndex++){
          if(controller.signal.aborted)throw new DOMException('Export cancelled','AbortError');
          const blob=files[pageIndex].blob;
          if(blob.size>4*1024*1024)throw new Error('A rendered PNG exceeds four MiB. It was not resized or marked exported.');
          const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});
          await props.exportRequest(`/api/studio/native-editor/documents/${props.meta.id}/exports`,{method:'POST',body:JSON.stringify({expectedReviewRevision:review.revision,expectedNativeRevision:review.binding.nativeRevision,pageIndex,base64,idempotencyKey:pending.current.keys[pageIndex]})});
        }
        pending.current=null;
        setMessage('PNGs prepared. Review each exact image in the export panel.');
      }catch(error){setMessage(error.message||'PNG preparation failed; saved content is unchanged.');}
      finally{setBusy(false);}
    }
    return createElement('span',null,createElement('button',{type:'button',disabled:busy,onClick:prepare},busy?'Preparing PNGs…':'Prepare approved PNGs'),message?createElement('span',{role:'status'},message):null);
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
        props.exportRequest ? createElement(ExportContext) : null,
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
