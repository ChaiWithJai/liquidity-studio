#!/usr/bin/env python3
"""Prepare a private exact-version overlay; never run Docker or start a renderer."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re

IMAGE = 'penpotapp/exporter@sha256:418232d6ca3120b1c2bfde298a56a05a1f41f567cd8494deac3fe7fbc186cfbd'
ORIGINAL_SHA = '1dcf708c47a47c2f2c6e858553359b2a22b1a6ace6cd92fec7e481cafdbab02f'
ORIGINAL_SIZE = 6054249
UPSTREAM = 'ff7a66f51938b2293260ea27a64e2c4e0833b5e3'
UUID = re.compile(r'^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$')

def sha(value):
    return hashlib.sha256(value).hexdigest()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--original', required=True)
    parser.add_argument('--observed-image', required=True)
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--output-directory', required=True)
    args=parser.parse_args()
    if args.observed_image != IMAGE:
        raise SystemExit('Exact official image digest required')
    original_path=Path(args.original)
    if original_path.is_symlink() or not original_path.is_file():
        raise SystemExit('Private regular original file required')
    original=original_path.read_bytes()
    if len(original)!=ORIGINAL_SIZE or sha(original)!=ORIGINAL_SHA:
        raise SystemExit('Original compiled renderer differs: stop without output')
    source=original.decode('utf8')
    seam='app.browser.screenshot.cljs$core$IFn$_invoke$arity$2 = function($frame$$, $full_page_QMARK__options$$) {'
    entry='\napp.core.main();\n'
    if source.count(seam)!=1 or source.count(entry)!=1 or 'studio-native-image-readiness' in source:
        raise SystemExit('Pinned CLJS screenshot dispatch/entry seam differs')
    manifest=json.loads(Path(args.manifest).read_text())
    if not isinstance(manifest,dict) or set(manifest)!={'frameIds','imagePaths'}:
        raise SystemExit('Only bounded owned frame/image lists allowed')
    frames=manifest['frameIds']; paths=manifest['imagePaths']
    if not isinstance(frames,list) or not 1<=len(frames)<=8 or not all(isinstance(v,str) and UUID.fullmatch(v) for v in frames) or len(set(frames))!=len(frames):
        raise SystemExit('Invalid owned frame list')
    if not isinstance(paths,list) or not 1<=len(paths)<=8 or not all(isinstance(v,str) and re.fullmatch(r'/assets/(by-file-media-id|by-id)/'+UUID.pattern[1:-1],v) for v in paths) or len(set(paths))!=len(paths):
        raise SystemExit('Invalid owned native image path list')
    wrapper_path=Path(__file__).with_name('readiness-wrapper.js')
    wrapper=wrapper_path.read_text()
    placeholder='/* STUDIO_READINESS_CONFIG */ null'
    if wrapper.count(placeholder)!=1:
        raise SystemExit('Original-owned hook placeholder differs')
    injected=wrapper.replace(placeholder,json.dumps(manifest,separators=(',',':')))
    patched=source.replace(entry,'\n'+injected+'\napp.core.main();\n').encode('utf8')
    directory=Path(args.output_directory)
    if directory.resolve().is_relative_to(Path(__file__).resolve().parents[2]):
        raise SystemExit('Compiled upstream artifact must remain outside the Git checkout')
    if directory.exists():
        raise SystemExit('Output directory already exists: preserve old packet')
    directory.mkdir(mode=0o700,parents=False)
    result=directory/'app.private.js'
    with result.open('xb') as output:
        os.chmod(result,0o600);output.write(patched)
    receipt={'method':'Source-only experimental upstream hook, not runtime acceptance','officialImage':IMAGE,'upstreamCommit':UPSTREAM,'originalSha256':sha(original),'wrapperSha256':sha(wrapper_path.read_bytes()),'manifestSha256':sha(Path(args.manifest).read_bytes()),'patchedSha256':sha(patched),'originalBytes':len(original),'patchedBytes':len(patched),'runtimeStarted':False,'originalScreenshotImplementationPreserved':True,'upstreamLicense':'MPL-2.0; original app.js notices/source-map retained'}
    target=directory/'patch-receipt.json'
    with target.open('x') as output:
        os.chmod(target,0o600);json.dump(receipt,output,indent=2)
    print(json.dumps({'prepared':True,'patchedSha256':sha(patched),'runtimeStarted':False}))

if __name__=='__main__':
    main()
