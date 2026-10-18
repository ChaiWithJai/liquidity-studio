"""Hosted artifact inspection, not production validation or application startup."""
import hashlib, json, pathlib, sys, zipfile
root, output = map(pathlib.Path, sys.argv[1:])
jar = output / 'penpot.jar'
if not 0 < jar.stat().st_size <= 512 * 1024 * 1024:
    raise SystemExit('Unexpected JAR size')
files = []
merges = []
with zipfile.ZipFile(jar) as archive:
    names = archive.namelist()
    if len(names) != len(set(names)):
        raise SystemExit('Duplicate JAR entries')
    for source in sorted((root / 'backend/src').rglob('*')):
        if source.is_symlink():
            raise SystemExit('Symlink in native source')
        if not source.is_file():
            continue
        relative = str(source.relative_to(root / 'backend/src'))
        data = source.read_bytes()
        packaged = archive.read(relative)
        if relative == 'data_readers.clj':
            # tools.build intentionally merges reader maps across dependencies.
            # A separate bounded clojure.edn check must preserve every original
            # mapping; all ordinary application sources still require exact bytes.
            merges.append({'path': relative, 'sourceSha256': hashlib.sha256(data).hexdigest(),
                           'packagedSha256': hashlib.sha256(packaged).hexdigest(),
                           'verification': 'clojure.edn-map-preservation-required'})
        elif packaged != data:
            raise SystemExit('Packaged native source mismatch: ' + relative)
        files.append({'path': relative, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    if any(name.startswith('app/studio/') and name.endswith('_test.clj') for name in names):
        raise SystemExit('Test source in production JAR')
(output / 'jar-source-manifest.json').write_text(json.dumps({'files': files, 'mergedResources': merges}, indent=2) + '\n')
