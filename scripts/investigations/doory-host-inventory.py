"""Read-only reachable-import inventory; does not install or execute upstream code."""
import hashlib
import json
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1]).resolve() / 'frontend' / 'src'
seen, packages, missing = set(), set(), []
queue = [root / 'editor' / 'EditorApp.tsx']
while queue:
    path = queue.pop()
    if path in seen:
        continue
    seen.add(path)
    for value in re.findall(r'''(?:from\s*|import\s*\(\s*|import\s*|new\s+URL\s*\(\s*)['"]([^'"]+)['"]''', path.read_text()):
        if value.startswith('.') or value.startswith('@/'):
            base = root / value[2:] if value.startswith('@/') else path.parent / value
            candidates = [base] + [pathlib.Path(str(base) + suffix) for suffix in ['.ts', '.tsx', '.js', '.json', '.css']] + [base / 'index.ts', base / 'index.tsx']
            match = next((candidate.resolve() for candidate in candidates if candidate.is_file()), None)
            if match:
                if not match.is_relative_to(root):
                    raise ValueError('Import escapes pinned source root')
                queue.append(match)
            else:
                missing.append({'file': str(path.relative_to(root)), 'import': value})
        elif re.fullmatch(r'(?:@[a-z0-9_.-]+/)?[a-z0-9_.-]+(?:/[a-zA-Z0-9_./-]+)?', value):
            packages.add('/'.join(value.split('/')[:2]) if value.startswith('@') else value.split('/')[0])
print(json.dumps({
    'sourceCommit': '27b6f68221fdbf1ef1bedc182e303210ca9e39f5',
    'method': 'static literal imports from actual EditorApp; dynamic/generated references require separate review',
    'licenseSha256': hashlib.sha256((root.parent.parent / 'LICENSE').read_bytes()).hexdigest(),
    'styleTokensSha256': hashlib.sha256((root / 'styles/tokens.css').read_bytes()).hexdigest(),
    'packages': sorted(packages), 'unresolved': missing,
    'files': [{'path': str(path.relative_to(root)), 'bytes': path.stat().st_size,
               'sha256': hashlib.sha256(path.read_bytes()).hexdigest()} for path in sorted(seen)]
}, indent=2))
