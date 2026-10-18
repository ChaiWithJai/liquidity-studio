#!/usr/bin/env python3
"""Apply only reviewed original C2 files to exact pinned native source. No build."""
import hashlib,json,pathlib,subprocess,sys
PIN='ff7a66f51938b2293260ea27a64e2c4e0833b5e3'
RPC_SHA='2856f53b0a1c1e64bc96e35ad6ae02c9603c91bd88fc7a67be0194c7562984fe'
if len(sys.argv)!=2:raise SystemExit('Use apply.py /exact/pinned/native/root')
root=pathlib.Path(sys.argv[1]).resolve(strict=True)
if subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True,timeout=10).strip()!=PIN:raise SystemExit('Native source pin mismatch')
source=pathlib.Path(__file__).resolve().parent
manifest=json.loads((source/'source-manifest.json').read_text())
mapping={'access.clj':'backend/src/app/studio/access.clj','http_authority.clj':'backend/src/app/studio/http_authority.clj','studio_access.clj':'backend/src/app/rpc/commands/studio_access.clj','access_test.clj':'backend/test/app/studio/access_test.clj','http_authority_test.clj':'backend/test/app/studio/http_authority_test.clj','reconciliation_test.clj':'backend/test/app/studio/reconciliation_test.clj'}
if set(manifest['files'])!=set(mapping):raise SystemExit('Incomplete C2 source inventory')
for name in mapping:
 p=source/name
 if p.is_symlink() or not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=manifest['files'][name]:raise SystemExit('C2 source hash mismatch')
rpc=root/'backend/src/app/rpc.clj';original=rpc.read_bytes()
anchor=b"'app.rpc.commands.access-token\n"
if hashlib.sha256(original).hexdigest()!=RPC_SHA or original.count(anchor)!=1:raise SystemExit('Native RPC source changed')
for name,target in mapping.items():
 p=root/target
 if not p.resolve().is_relative_to(root) or p.exists():raise SystemExit('Refusing existing or escaping C2 target')
patched=original.replace(anchor,b"'app.rpc.commands.studio-access\n          "+anchor)
for name,target in mapping.items():
 p=root/target;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((source/name).read_bytes())
rpc.write_bytes(patched)
print(json.dumps({'nativePin':PIN,'installed':mapping,'rpcBeforeSha256':RPC_SHA,'rpcAfterSha256':hashlib.sha256(patched).hexdigest(),'testNamespaces':['app.studio.access-test','app.studio.http-authority-test','app.studio.reconciliation-test'],'built':False}))
