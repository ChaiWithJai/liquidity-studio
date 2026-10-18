"""Hosted-only exact pnpm registry/SRI and installed-native verification; no installer."""
import base64
import hashlib
import io
import json
import sys
import stat
import tarfile
import urllib.request
from pathlib import Path

recipe = Path(__file__).parent
pins = json.loads((recipe / 'runtime-provenance.json').read_text())['buildPnpm']
report = []

def describe_owned(path):
    """Bounded metadata only; never execute a candidate or follow outside home."""
    root = Path('/review-tools/home')
    path = Path(path)
    resolved = path.resolve(strict=True)
    if not path.is_relative_to(root) or not resolved.is_relative_to(root):
        raise ValueError('Diagnostic executable escaped owned home')
    link = path.lstat()
    info = resolved.stat()
    if not stat.S_ISREG(info.st_mode) or info.st_size > 64 * 1024 * 1024:
        raise ValueError('Diagnostic executable is not a bounded regular file')
    data = resolved.read_bytes()
    kind = 'ELF' if data.startswith(b'\x7fELF') else 'script' if data.startswith(b'#!') else 'other'
    return {'path': str(path), 'resolvedPath': str(resolved),
            'isSymlink': stat.S_ISLNK(link.st_mode), 'isRegular': stat.S_ISREG(link.st_mode),
            'resolvedRegular': True, 'size': len(data),
            'sha256': hashlib.sha256(data).hexdigest(),
            'first16Hex': data[:16].hex(), 'type': kind}


def preserve_mismatch(installed_path, expected_native):
    receipt = {'reason': 'installed-native-integrity-mismatch',
               'expectedNativeSha256': hashlib.sha256(expected_native).hexdigest(),
               'installed': describe_owned(installed_path), 'knownPackageBins': []}
    # Exact pnpm global layout only, at most32 entries; no recursive filesystem walk.
    try:
        roots = sorted(Path('/review-tools/home/global/v11').iterdir())
        if len(roots) > 32:
            raise ValueError('Diagnostic global layout exceeds bound')
        for root in roots:
            for relative in ('node_modules/@pnpm/exe.linux-x64/pnpm',
                             'node_modules/pnpm/pnpm', 'node_modules/pnpm/bin/pnpm.cjs'):
                candidate = root / relative
                if candidate.exists():
                    if len(receipt['knownPackageBins']) >= 32:
                        raise ValueError('Diagnostic package inventory exceeds bound')
                    receipt['knownPackageBins'].append(describe_owned(candidate))
    except (OSError, ValueError) as error:
        # Retain installed identity even if optional layout inventory is unsupported.
        receipt['inventoryComplete'] = False
        receipt['inventoryErrorType'] = type(error).__name__
    else:
        receipt['inventoryComplete'] = True
    output = Path('/review-tools/pnpm-diagnostic.json')
    with output.open('x') as stream:
        json.dump(receipt, stream, indent=2)

for key in ('package', 'nativePackage'):
    pin = pins[key]
    name = pin['name'].replace('/', '%2f')
    request = urllib.request.Request('https://registry.npmjs.org/' + name + '/12.5.1')
    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read(1024 * 1024 + 1)
    if len(raw) > 1024 * 1024:
        raise ValueError('Registry metadata too large')
    current = json.loads(raw)
    if (current['name'], current['version'], current['dist']['integrity'], current['dist']['tarball']) != (
            pin['name'], pin['version'], pin['dist']['integrity'], pin['dist']['tarball']):
        raise ValueError('Pinned pnpm registry identity changed')
    url = pin['dist']['tarball']
    if not url.startswith('https://registry.npmjs.org/'):
        raise ValueError('Unsupported artifact origin')
    with urllib.request.urlopen(url, timeout=60) as response:
        data = response.read(64 * 1024 * 1024 + 1)
    if len(data) > 64 * 1024 * 1024:
        raise ValueError('Pinned package too large')
    actual_sri = 'sha512-' + base64.b64encode(hashlib.sha512(data).digest()).decode()
    if actual_sri != pin['dist']['integrity']:
        raise ValueError('Pinned package integrity mismatch')
    item = {'name': pin['name'], 'version': pin['version'], 'integrity': actual_sri,
            'tarballBytes': len(data)}
    if key == 'nativePackage':
        with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
            members = [m for m in archive.getmembers() if m.isfile() and m.name == 'package/pnpm']
            if len(members) != 1 or members[0].size > 64 * 1024 * 1024:
                raise ValueError('Unexpected native pnpm package layout; stop for review')
            native = archive.extractfile(members[0]).read()
        # The official global entry is an observed generated shell launcher.
        # Select only fixed package-relative binaries; never execute that launcher.
        roots = sorted(Path('/review-tools/home/global/v11').iterdir())
        if len(roots) > 32:
            raise ValueError('Native pnpm root inventory exceeds bound')
        unique = {}
        expected_hash = hashlib.sha256(native).hexdigest()
        for root in roots:
            if not root.resolve(strict=True).is_relative_to(Path('/review-tools/home')):
                raise ValueError('Native pnpm global root escaped owned home')
            candidate = root / 'node_modules/pnpm/pnpm'
            if not candidate.exists() and not candidate.is_symlink():
                continue
            descriptor = describe_owned(candidate)
            if descriptor['type'] != 'ELF' or descriptor['sha256'] != expected_hash:
                preserve_mismatch(sys.argv[1], native)
                raise ValueError('Installed package native executable integrity mismatch')
            unique[descriptor['resolvedPath']] = descriptor
        if len(unique) != 1:
            preserve_mismatch(sys.argv[1], native)
            raise ValueError('Expected one unique verified native pnpm executable')
        descriptor = next(iter(unique.values()))
        with Path('/review-tools/verified-pnpm.path').open('x') as stream:
            stream.write(descriptor['resolvedPath'] + '\n')
        with Path('/review-tools/verified-pnpm.sha256').open('x') as stream:
            stream.write(expected_hash + '\n')
        item['nativeExecutableSha256'] = expected_hash
        item['verifiedNative'] = descriptor
    report.append(item)
print(json.dumps(report, indent=2))
