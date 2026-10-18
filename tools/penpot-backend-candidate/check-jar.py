"""Hosted artifact inspection, not production validation or application startup."""
import hashlib, json, pathlib, sys, zipfile
root, output = map(pathlib.Path, sys.argv[1:])
jar = output / 'penpot.jar'
if not 0 < jar.stat().st_size <= 512 * 1024 * 1024:
    raise SystemExit('Unexpected JAR size')
files = []
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
        if archive.read(relative) != data:
            raise SystemExit('Packaged native source mismatch: ' + relative)
        files.append({'path': relative, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    if any(name.startswith('app/studio/') and name.endswith('_test.clj') for name in names):
        raise SystemExit('Test source in production JAR')
(output / 'jar-source-manifest.json').write_text(json.dumps({'files': files}, indent=2) + '\n')
