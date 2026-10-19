"""Require successful same-repository verification and exact immutable inputs."""
import base64, hashlib, json, os, pathlib, re, subprocess, sys
root = pathlib.Path(sys.argv[1])
run = json.loads((root / 'run.json').read_text())
expected = os.environ['SOURCE_SHA']
if (run['conclusion'] != 'success' or run['status'] != 'completed'
        or run['event'] != 'workflow_dispatch'
        or run['path'] != '.github/workflows/penpot-native-hook-verification.yml'
        or run['repository']['full_name'] != os.environ['GITHUB_REPOSITORY']):
    raise SystemExit('Verification run is not the required successful workflow')
proof = root / 'proof'
manifest = json.loads((proof / 'manifest.json').read_text())
if (not re.fullmatch(r'[a-f0-9]{40}', manifest['studioSourceSha'])
        or manifest['upstreamSourceSha'] != 'ff7a66f51938b2293260ea27a64e2c4e0833b5e3'
        or manifest['officialDevenv'] != 'penpotapp/devenv@sha256:912d522803d94fa3e5c9f304088887a45fa6d90517751094f22a14a8754d2b37'
        or manifest['namespaceAndFocusedTestsCompleted'] is not True):
    raise SystemExit('Verification manifest does not match requested source')
seen = set()
for entry in manifest['files']:
    relative = pathlib.PurePosixPath(entry['path'])
    if relative.is_absolute() or '..' in relative.parts or str(relative) in seen:
        raise SystemExit('Unsafe or duplicate verification path')
    seen.add(str(relative))
    path = proof.joinpath(*relative.parts)
    if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(proof.resolve()):
        raise SystemExit('Invalid verification file')
    data = path.read_bytes()
    if len(data) != entry['bytes'] or len(data) > 32 * 1024 * 1024 or hashlib.sha256(data).hexdigest() != entry['sha256']:
        raise SystemExit('Verification evidence hash mismatch')
if not {'verification-complete.txt', 'hook-inputs.sha256', 'focused-clojure-tests.log', 'namespace-compilation.log'} <= seen:
    raise SystemExit('Incomplete verification evidence')
# Source SHA already binds tracked files; this also checks actual hosted inputs.
verified_paths = set()
for line in (proof / 'hook-inputs.sha256').read_text().splitlines():
    digest, path = line.split(maxsplit=1)
    relative = pathlib.PurePosixPath(path)
    if relative.parts[:2] != ('studio', 'tools') or '..' in relative.parts:
        raise SystemExit('Unexpected verification input path')
    if str(relative) in verified_paths:
        raise SystemExit('Duplicate verified input')
    verified_paths.add(str(relative))
    actual = pathlib.Path('studio').joinpath(*relative.parts[1:])
    if actual.is_symlink() or hashlib.sha256(actual.read_bytes()).hexdigest() != digest:
        raise SystemExit('Verified hook input differs from checkout')
actual_paths = set()
for directory in ['penpot-brand-access', 'penpot-live-fence', 'penpot-native-access-bootstrap', 'penpot-private-asset-access', 'penpot-redis-log-redaction']:
    for path in (pathlib.Path('studio/tools') / directory).rglob('*'):
        if path.is_symlink():
            raise SystemExit('Symlink in hook inputs')
        if path.is_file():
            actual_paths.add(path.as_posix())
if actual_paths != verified_paths:
    raise SystemExit('Verified native hook pathset differs from requested source')
# The successful run can predate a frontend/docs-only commit. Require byte-exact
# verification recipe equivalence too; never assume arbitrary old tests suffice.
verified_recipe = (proof / 'recipe-source-sha.txt').read_text().strip()
if not re.fullmatch(r'[a-f0-9]{40}', verified_recipe):
    raise SystemExit('Missing immutable verification recipe')
for name in ['.github/workflows/penpot-native-hook-verification.yml',
             'tools/penpot-native-hook-verification/verify.sh',
             'tools/penpot-native-hook-verification/kaocha.edn']:
    encoded = subprocess.check_output(['gh', 'api',
        f"repos/{os.environ['GITHUB_REPOSITORY']}/contents/{name}?ref={verified_recipe}",
        '--jq', '.content'], timeout=30)
    if base64.b64decode(encoded) != (pathlib.Path('recipe') / name).read_bytes():
        raise SystemExit('Verification recipe differs from successful run: ' + name)
print(json.dumps({'requestedSource': expected, 'verifiedSource': manifest['studioSourceSha'],
                  'nativeInputEquivalence': True, 'verificationRecipe': verified_recipe,
                  'verificationRun': run['id'], 'testsRerun': False}))
