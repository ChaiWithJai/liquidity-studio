"""Exact pinned-source logging patch; no runtime configuration or credentials."""
import hashlib,json,pathlib,subprocess,sys
root=pathlib.Path(sys.argv[1]).resolve();here=pathlib.Path(__file__).resolve().parent
manifest=json.loads((here/'source-manifest.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()==manifest['upstreamCommit'],'Unexpected native source'
patch=here/'redis-logs.patch';assert sha(patch)==manifest['patchSha256'],'Changed log patch'
for row in manifest['files']:
 p=root/row['path'];assert p.is_file() and not p.is_symlink() and p.resolve().is_relative_to(root)
 assert sha(p)==row['beforeSha256'],'Unexpected/already changed Redis source: '+row['path']
subprocess.run(['git','-C',str(root),'apply','--check',str(patch)],check=True)
subprocess.run(['git','-C',str(root),'apply',str(patch)],check=True)
for row in manifest['files']:assert sha(root/row['path'])==row['afterSha256'],'Patched Redis source mismatch'
print(json.dumps({'upstreamCommit':manifest['upstreamCommit'],'patchSha256':manifest['patchSha256'],'files':manifest['files'],'runtimeActivated':False}))
