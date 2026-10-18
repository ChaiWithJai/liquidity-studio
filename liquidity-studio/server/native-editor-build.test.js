import test from "node:test";
import {createHash} from "node:crypto";
import assert from "node:assert/strict";
import {
  assertOriginalOnlyNativeBundle,
  canonicalizeLegalFooter,
  fixNativeVideoResult,
  fixNativeWebmContainer,
  fixNativeAudioUi,
} from "../scripts/native-editor-vite.js";
test("original-only build blocks upstream source, dependencies and emitted frame assets", () => {
  assert.doesNotThrow(() =>
    assertOriginalOnlyNativeBundle({
      main: { fileName: "index.js", modules: { "/src/App.svelte": {} } },
    }),
  );
  for (const id of [
    "/.native-editor-source/editor/EditorApp.tsx",
    "/node_modules/react/index.js",
    "/node_modules/react-dom/client.js",
    "/node_modules/fabric/dist/index.js",
    "/node_modules/onnxruntime-web/dist/ort.wasm.js",
  ])
    assert.throws(
      () =>
        assertOriginalOnlyNativeBundle({
          main: { fileName: "index.js", modules: { [id]: {} } },
        }),
      /Upstream native module/,
    );
  for (const fileName of [
    "native-editor-frame.html",
    "native-editor-license.txt",
    "assets/ort-wasm-simd-threaded.wasm",
    "assets/modnet-worker-123.js",
  ])
    assert.throws(
      () => assertOriginalOnlyNativeBundle({ asset: { fileName } }),
      /Upstream native asset/,
    );
});

test("legal footer canonicalization preserves all notices and executable bytes across traversal order", () => {
  const body = 'const text = "/* ordinary inline data */"; console.log(text);';
  const a = "/** @license Copyright A */";
  const b = "/** @license Copyright B */";
  assert.equal(
    canonicalizeLegalFooter(body + "\n" + a + "\n" + b),
    canonicalizeLegalFooter(body + "\n" + b + "\n" + a + "\n" + a),
  );
  assert.equal(
    canonicalizeLegalFooter(body + "\n" + a + "\n" + b),
    body + "\n" + a + "\n" + b + "\n",
  );
  assert.equal(canonicalizeLegalFooter(body), body);
});

test("production server imports with the Docker runtime layout and no frontend src tree", async () => {
  const { mkdtempSync, cpSync, writeFileSync, symlinkSync, rmSync } =
    await import("node:fs");
  const { tmpdir } = await import("node:os");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const { spawnSync } = await import("node:child_process");
  const directory = mkdtempSync(path.join(tmpdir(), "studio-runtime-layout-"));
  try {
    cpSync(
      fileURLToPath(new URL(".", import.meta.url)),
      path.join(directory, "server"),
      { recursive: true, filter: (source) => !source.endsWith(".test.js") },
    );
    writeFileSync(
      path.join(directory, "package.json"),
      JSON.stringify({ type: "module" }),
    );
    symlinkSync(
      fileURLToPath(new URL("../node_modules", import.meta.url)),
      path.join(directory, "node_modules"),
      "dir",
    );
    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", "await import('./server/index.js');"],
      {
        cwd: directory,
        timeout: 15000,
        encoding: "utf8",
        env: { ...process.env, NODE_ENV: "production" },
      },
    );
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("private video result effect discards Promise-valued scrolling instead of returning React cleanup", () => {
  const source = "useEffect(() => root.current?.scrollIntoView?.({ block: 'nearest' }), [])";
  const digest = createHash("sha256").update(source).digest("hex");
  const fixed = fixNativeVideoResult(source, digest);
  let effect, calls = 0;
  // Execute only the small controlled effect fixture, not upstream source or an editor.
  const root = {current:{scrollIntoView(){calls++;return Promise.resolve();}}};
  new Function("useEffect", "root", fixed)((callback) => {effect=callback;}, root);
  assert.equal(effect(), undefined);
  assert.equal(calls, 1);
  assert.throws(()=>fixNativeVideoResult(source+" ",digest),/pristine source mismatch/);
  const repeated=source+"\n"+source;
  assert.throws(()=>fixNativeVideoResult(repeated,createHash("sha256").update(repeated).digest("hex")),/anchor mismatch/);
});

test("private WebM transform applies exactly the reviewed container patch and binds its helper", async () => {
  const {readFile}=await import('node:fs/promises');
  const patch=await readFile(new URL('../../scripts/investigations/doory-webm-duration/webm-duration.patch',import.meta.url),'utf8');
  const hunks=patch.split('diff --git ')[1].split(/@@[^\n]*\n/).slice(1);
  const before=hunks.map(hunk=>hunk.split('\n').filter(line=>/^[ -]/.test(line)).map(line=>line.slice(1)).join('\n')+'\n').join('/* controlled gap */\n');
  const fixed=fixNativeWebmContainer(before,createHash('sha256').update(before).digest('hex'),patch);
  assert.match(fixed,/correctMuxedWebmDuration\(target.buffer, endUs\)/);
  assert.match(fixed,/endUs = Math.max\(endUs, end\)/);
  assert.throws(()=>fixNativeWebmContainer(before,createHash('sha256').update(before).digest('hex'),patch+' '),/patch mismatch/);
  const expectedHelper=patch.split('+++ b/frontend/src/editor/engine/export/video/muxedWebmDuration.ts\n')[1].split('\n').filter(line=>line.startsWith('+')).map(line=>line.slice(1)).join('\n')+'\n';
  assert.equal(await readFile(new URL('../src/lib/native-webm-duration.ts',import.meta.url),'utf8'),expectedHelper);
});

test("reviewed WebM duration helper repairs the actual 900-frame muxer metadata without changing payload bytes", async () => {
  const {readFile}=await import('node:fs/promises');
  const {transformWithEsbuild}=await import('vite');
  const {Muxer,ArrayBufferTarget}=await import('webm-muxer');
  const source=await readFile(new URL('../src/lib/native-webm-duration.ts',import.meta.url),'utf8');
  const {code}=await transformWithEsbuild(source,'native-webm-duration.ts',{loader:'ts'});
  const {correctMuxedWebmDuration}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  const target=new ArrayBufferTarget(),muxer=new Muxer({target,video:{codec:'V_VP8',width:16,height:16,frameRate:30}});
  for(let i=0;i<900;i++)muxer.addVideoChunkRaw(new Uint8Array([0,0,0]),'key',Math.round(i*1e6/30));
  muxer.finalize();const original=target.buffer.slice(0),fixed=correctMuxedWebmDuration(target.buffer,30000000);
  const b=new Uint8Array(original),at=b.findIndex((_,i)=>b[i]===0x44&&b[i+1]===0x89&&b[i+2]===0x88)+3;
  assert.equal(new DataView(original).getFloat64(at),29966);
  assert.equal(new DataView(fixed).getFloat64(at),30000);
  assert.equal(fixed.byteLength,original.byteLength);
  assert.deepEqual(new Uint8Array(target.buffer),b);
  const changed=[...b.keys()].filter(i=>b[i]!==new Uint8Array(fixed)[i]);
  assert.ok(changed.length>0&&changed.every(i=>i>=at&&i<at+8));
  assert.throws(()=>correctMuxedWebmDuration(original,0),/positive actual chunk end/);
});


test("private audio overlay presents only supported uploads without loading unavailable source components", async () => {
  const {readFile}=await import('node:fs/promises');
  const {transformWithEsbuild}=await import('vite');
  const patch=await readFile(new URL('../../scripts/investigations/doory-audio-ui/studio-audio-ui.patch.json',import.meta.url),'utf8');
  const entries=JSON.parse(patch).files;
  const panel=entries.find(file=>file.path==='editor/panels/AudioPanel.tsx');
  const original=panel.edits.slice(0,2).map(edit=>edit.before).join('')+
    "type TabId = 'library' | 'uploads' | 'record';\n"+panel.edits[2].before+
    "\nexport function Audio(){const tab=memory.tab;return <div>"+panel.edits[3].before+"</div>;}";
  const digest=createHash('sha256').update(original).digest('hex');
  const fixed=fixNativeAudioUi(original,panel.path,digest,patch);
  assert.match(fixed,/tab: 'uploads'/);
  assert.doesNotMatch(fixed,/import.*Audio(?:Library|Record)Tab/);
  assert.match(fixed,/role="status"/);
  assert.match(fixed,/Studio does not provide a music library/);
  assert.match(fixed,/Microphone recording is not available in Studio/);
  const compiled=await transformWithEsbuild(fixed,'AudioPanel.tsx',{loader:'tsx'});
  assert.match(compiled.code,/AudioUploadsTab/);
  assert.doesNotMatch(compiled.code,/AudioRecordTab|AudioLibraryTab/);
  assert.throws(()=>fixNativeAudioUi(original+' ',panel.path,digest,patch),/pristine source mismatch/);
  assert.throws(()=>fixNativeAudioUi(original,panel.path,digest,patch+' '),/patch mismatch/);
  const duplicate=original+panel.edits[2].before;
  assert.throws(()=>fixNativeAudioUi(duplicate,panel.path,createHash('sha256').update(duplicate).digest('hex'),patch),/anchor mismatch/);
  for(const entry of entries.filter(file=>file!==panel)){
    const source=entry.edits.map(edit=>edit.before).join('\n');
    const result=fixNativeAudioUi(source,entry.path,createHash('sha256').update(source).digest('hex'),patch);
    assert.doesNotMatch(result,/25 MB|MP3, OGG, WAV, M4A|MAX_AUDIO_BYTES/);
    if(entry.path.endsWith('files.ts')){assert.match(result,/AUDIO_ACCEPT = 'audio\/wav,audio\/x-wav,audio\/wave,audio\/vnd.wave,\.wav'/);assert.match(result,/maxBytes = 6 \* 1024 \* 1024/);}
    else assert.match(result,/16-bit stereo PCM WAV, 44.1 or 48 kHz, up to 6 MiB and 30 seconds/);
  }
});
