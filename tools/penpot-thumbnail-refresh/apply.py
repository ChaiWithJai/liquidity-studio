#!/usr/bin/env python3
"""Apply only the reviewed thumbnail source/test delta to pinned native source."""
import hashlib,json,pathlib,subprocess,sys
if len(sys.argv)!=2:raise SystemExit('Use apply.py /pinned/native/source')
root=pathlib.Path(sys.argv[1]).resolve(strict=True)
source=pathlib.Path(__file__).resolve().parent
manifest=json.loads((source/'source-manifest.json').read_text())
if subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True,timeout=10).strip()!=manifest['upstream']:raise SystemExit('Native upstream pin changed')
for name,entry in manifest['files'].items():
 p=root/name
 if p.is_symlink() or not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=entry['beforeSha256']:raise SystemExit('Native thumbnail input changed: '+name)
patches=[]
for name,digest in manifest['patches'].items():
 p=source/name
 if p.is_symlink() or not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=digest:raise SystemExit('Thumbnail patch changed')
 patches.append(str(p))
subprocess.run(['git','-C',str(root),'apply','--check',*patches],check=True,timeout=10)
subprocess.run(['git','-C',str(root),'apply',*patches],check=True,timeout=10)
for name,entry in manifest['files'].items():
 if hashlib.sha256((root/name).read_bytes()).hexdigest()!=entry['afterSha256']:raise SystemExit('Native thumbnail output changed: '+name)
print(json.dumps({'upstream':manifest['upstream'],'files':manifest['files'],'documentContentChanged':False,'buildOrTestsExecuted':False},indent=2))
