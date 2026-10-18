"""Hosted-only exact pnpm registry/SRI and installed-native verification; no installer."""
import base64
import hashlib
import io
import json
import sys
import tarfile
import urllib.request
from pathlib import Path

recipe = Path(__file__).parent
pins = json.loads((recipe / 'runtime-provenance.json').read_text())['buildPnpm']
report = []
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
        installed = Path(sys.argv[1]).resolve(strict=True).read_bytes()
        if hashlib.sha256(native).digest() != hashlib.sha256(installed).digest():
            raise ValueError('Version-manager installed executable differs from pinned native package')
        item['nativeExecutableSha256'] = hashlib.sha256(native).hexdigest()
    report.append(item)
print(json.dumps(report, indent=2))
