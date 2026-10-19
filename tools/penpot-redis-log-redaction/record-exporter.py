"""Finite hosted output/source inventory; no runtime start or secrets."""
import hashlib,json,pathlib,sys,tarfile
root,out=map(pathlib.Path,sys.argv[1:]);target=root/'exporter/target'
files=[]
for p in sorted(target.rglob('*')):
 if p.is_symlink():raise SystemExit('Unexpected symlink in exporter build')
 if p.is_file():
  data=p.read_bytes()
  if len(data)>64*1024*1024:raise SystemExit('Exporter member too large')
  files.append({'path':p.relative_to(target).as_posix(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
if not files or len(files)>4096 or sum(x['bytes'] for x in files)>256*1024*1024:raise SystemExit('Unexpected exporter graph size')
# Inventory the exact graph delivered by tar, not only a directory snapshot.
with tarfile.open(out/'exporter-bundle.tar.gz') as t:
 members={m.name.removeprefix('./'):m for m in t.getmembers() if m.isfile()}
 if set(members)!={e['path'] for e in files}:raise SystemExit('Exporter archive pathset differs')
 for e in files:
  data=t.extractfile(members[e['path']]).read()
  if len(data)!=e['bytes'] or hashlib.sha256(data).hexdigest()!=e['sha256']:raise SystemExit('Exporter archive mismatch')
(out/'exporter-manifest.json').write_text(json.dumps({'upstreamCommit':'ff7a66f51938b2293260ea27a64e2c4e0833b5e3','files':files,'runtimeActivated':False,'scope':'Compiled ESM graph; existing pinned exporter base supplies unchanged runtime dependencies.'},indent=2)+'\n')
