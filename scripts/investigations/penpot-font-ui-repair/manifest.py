"""Original-owned build artifact inventory. Never fetches resources or deploys."""
import hashlib
import json
import sys
from pathlib import Path


def inventory(directory):
    root = Path(directory).resolve(strict=True)
    rows = {}
    for path in sorted(root.rglob('*')):
        if path.is_symlink():
            raise ValueError('Artifact graph must contain no symlinks')
        if path.is_file():
            data = path.read_bytes()
            rows[path.relative_to(root).as_posix()] = {
                'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()
            }
    return rows


if __name__ == '__main__':
    original, candidate = inventory(sys.argv[1]), inventory(sys.argv[2])
    result = {
        'kind': 'complete-frontend-build-inventory',
        'upstream': 'ff7a66f51938b2293260ea27a64e2c4e0833b5e3',
        'original': original, 'candidate': candidate,
        'changed': [name for name in sorted(set(original) | set(candidate))
                    if original.get(name) != candidate.get(name)],
        'limits': ['Compiler/build timestamps may change unrelated assets; not a semantic diff.',
                   'Complete candidate graph is retained; no guessed single-chunk overlay.',
                   'Successful CLJS compilation is not browser font upload or pixel proof.'],
    }
    Path(sys.argv[3]).write_text(json.dumps(result, indent=2) + '\n')
