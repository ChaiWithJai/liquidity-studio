#!/usr/bin/env python3
"""Exact pinned source preparation only. No compile, application or native action."""
import hashlib, json, pathlib, subprocess, sys

if len(sys.argv) != 2:
    raise SystemExit('Use apply.py /exact/pinned/native/root')
root = pathlib.Path(sys.argv[1]).resolve(strict=True)
source = pathlib.Path(__file__).resolve().parent
manifest = json.loads((source / 'upstream-source.json').read_text())
if subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True, timeout=10).strip() != manifest['commit']:
    raise SystemExit('Native source pin mismatch')
original = root / manifest['files'][0]['path']
if original.is_symlink() or hashlib.sha256(original.read_bytes()).hexdigest() != manifest['files'][0]['sha256']:
    raise SystemExit('Native assets source changed')
mapping = {'assets.clj': 'backend/src/app/studio/assets.clj',
           'assets_test.clj': 'backend/test/app/studio/assets_test.clj'}
for name, destination in mapping.items():
    path = source / name
    target = root / destination
    if path.is_symlink() or hashlib.sha256(path.read_bytes()).hexdigest() != manifest['originalSources'][name]:
        raise SystemExit('Original asset hook source changed')
    if target.exists() or not target.resolve().is_relative_to(root):
        raise SystemExit('Refusing existing or escaping asset hook target')
patch = source / 'assets.patch'
if hashlib.sha256(patch.read_bytes()).hexdigest() != manifest['patchSha256']:
    raise SystemExit('Asset patch changed')
subprocess.run(['git', '-C', str(root), 'apply', '--check', str(patch)], check=True, timeout=10)
subprocess.run(['git', '-C', str(root), 'apply', str(patch)], check=True, timeout=10)
for name, destination in mapping.items():
    target = root / destination
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes((source / name).read_bytes())
if hashlib.sha256(original.read_bytes()).hexdigest() != manifest['files'][0]['patchedSha256']:
    raise SystemExit('Patched assets source mismatch')
print(json.dumps({'sourcePin': manifest['commit'], 'installed': mapping,
                  'nativeRuntimeChanged': False, 'compiled': False}))
