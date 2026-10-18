"""Describe the completed hosted artifact without loading application code."""
import hashlib, json, os, pathlib, sys
root = pathlib.Path(sys.argv[1])
files = []
for path in sorted(root.iterdir()):
    if path.is_symlink():
        raise SystemExit('Symlink in artifact output')
    if not path.is_file() or path.name == 'candidate-manifest.json':
        continue
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    files.append({'path': path.name, 'bytes': path.stat().st_size, 'sha256': digest.hexdigest()})
reader_proof = json.loads((root / 'data-readers-merge.json').read_text())
if reader_proof.get('originalMappingsPreserved') is not True or reader_proof.get('readerSymbolsEvaluated') is not False:
    raise SystemExit('Merged reader-map preservation was not verified')
image = json.loads((root / 'candidate-image.json').read_text())[0]
expected = os.environ.get('EXPECTED_PLATFORM', 'linux/arm64')
if expected not in ('linux/arm64', 'linux/amd64') or image['Os'] + '/' + image['Architecture'] != expected:
    raise SystemExit('Wrong candidate platform')
(root / 'candidate-manifest.json').write_text(json.dumps({
    'schemaVersion': 1, 'sourceSha': os.environ['SOURCE_SHA'],
    'upstreamSha': 'ff7a66f51938b2293260ea27a64e2c4e0833b5e3',
    'imageId': image['Id'], 'platform': expected,
    'mergedDataReadersMappingsPreserved': True,
    'java26NamespaceLoadCompleted': True, 'nativeRuntimeActivated': False,
    'privateAccessConfigIncluded': False, 'publicImagePushed': False,
    'files': files,
}, indent=2) + '\n')
