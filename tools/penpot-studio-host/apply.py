#!/usr/bin/env python3
"""Apply the finite Studio UI-state bridge to the pinned native checkout."""
import hashlib,json,pathlib,subprocess,sys
root=pathlib.Path(sys.argv[1]);here=pathlib.Path(__file__).resolve().parent
manifest=json.loads((here/'source-manifest.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for name,entry in manifest['files'].items():
 p=root/name
 if p.is_symlink() or not p.is_file() or sha(p)!=entry['beforeSha256']:raise SystemExit('Native bridge input changed: '+name)
for name,digest in manifest['patches'].items():
 if sha(here/name)!=digest:raise SystemExit('Native bridge patch changed')
for name,entry in manifest['copies'].items():
 if sha(here/name)!=entry['sha256'] or (root/entry['destination']).exists():raise SystemExit('Native bridge copy changed or destination exists')
for name in manifest['patches']:
 subprocess.run(['git','apply','--check',str(here/name)],cwd=root,check=True)
 subprocess.run(['git','apply',str(here/name)],cwd=root,check=True)
for name,entry in manifest['copies'].items():
 p=root/entry['destination'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((here/name).read_bytes())
for name,entry in manifest['files'].items():
 if sha(root/name)!=entry['afterSha256']:raise SystemExit('Native bridge output changed: '+name)
print(json.dumps({'upstream':manifest['upstream'],'files':{name:sha(root/name) for name in manifest['files']},'copies':{entry['destination']:sha(root/entry['destination']) for entry in manifest['copies'].values()}}))
