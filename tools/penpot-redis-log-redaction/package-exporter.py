"""Bind compiled overlay to pinned-base ARM dependencies; never install or run."""
import hashlib,json,pathlib,sys
work,out,base=map(pathlib.Path,sys.argv[1:]);target=work/'exporter/target'
metadata=[]
for name in ['package.json','pnpm-lock.yaml']:
 built=(target/name).read_bytes();original=(base/name).read_bytes()
 if built!=original:raise SystemExit('Pinned exporter dependency metadata differs: '+name)
 metadata.append({'path':name,'bytes':len(built),'sha256':hashlib.sha256(built).hexdigest()})
graph=json.loads((out/'exporter-manifest.json').read_text())['files']
# Dependencies remain in the exact ARM image; deliver/mount only compiled code
# and maps, never AMD build node_modules or the generated setup/install script.
mounts=[e for e in graph if e['path'].endswith(('.js','.mjs','.js.map','.mjs.map'))]
if not any(e['path']=='app.js' for e in mounts):raise SystemExit('Missing exporter entry')
if len(mounts)>2048:raise SystemExit('Unexpected compiled exporter graph')
(out/'exporter-mount-manifest.json').write_text(json.dumps({'upstreamCommit':'ff7a66f51938b2293260ea27a64e2c4e0833b5e3','base':'penpotapp/exporter@sha256:418232d6ca3120b1c2bfde298a56a05a1f41f567cd8494deac3fe7fbc186cfbd','platform':'linux/arm64','runtimeDirectory':'/opt/penpot/exporter','dependencyMetadata':metadata,'mountFiles':mounts,'nodeModulesReplaced':False,'runtimeActivated':False,'scope':'Overlay only these verified architecture-neutral files; preserve base ARM node_modules, Node, Chromium, system libraries and all other runtime files.'},indent=2)+'\n')
