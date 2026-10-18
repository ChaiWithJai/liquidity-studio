"""Explicit disposable-local-QA post-import repair; never changes an original file."""
import argparse
import http.cookiejar
import json
import os
from pathlib import Path
import stat
import subprocess
import urllib.error
import urllib.request
parser = argparse.ArgumentParser()
parser.add_argument('--account-file', required=True)
parser.add_argument('--anchor-file', required=True)
parser.add_argument('--file-id', required=True)
parser.add_argument('--expected-revision', required=True, type=int)
parser.add_argument('--evidence-dir', required=True)
parser.add_argument('--apply', action='store_true')
args = parser.parse_args()
base = 'http://localhost:39008'

class NoRedirect(urllib.request.HTTPRedirectHandler):

    def redirect_request(self, *unused):
        raise RuntimeError('Local RPC redirect rejected')
credentials = Path(args.account_file)
if stat.S_IMODE(credentials.stat().st_mode) & 63:
    raise SystemExit('QA credentials must be private0600')
account = json.loads(credentials.read_text())['accounts'][0]
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()), NoRedirect())

def rpc(command, payload, transit=False):
    body = payload.encode() if transit else json.dumps(payload).encode()
    request = urllib.request.Request(base + '/api/rpc/command/' + command, data=body, headers={'Content-Type': 'application/transit+json' if transit else 'application/json', 'Accept': 'application/json', 'Origin': base})
    try:
        with opener.open(request, timeout=30) as response:
            raw = response.read(4 * 1024 * 1024 + 1)
            if len(raw) > 4 * 1024 * 1024:
                raise RuntimeError('Local response exceeds bound')
            return json.loads(raw)
    except urllib.error.HTTPError as error:
        raise SystemExit('Local RPC rejected: ' + str(error.code)) from None
rpc('login-with-password', {'email': account['email'], 'password': account['password']})
anchor = rpc('get-file', {'id': args.anchor_file})
file = rpc('get-file', {'id': args.file_id})
if file['id'] == anchor['id'] or file['projectId'] != anchor['projectId'] or (not file['name'].startswith('Studio SVG restore QA ')):
    raise SystemExit('Only an explicitly renamed disposable clone in the owned QA project is permitted')
compiler = Path(__file__).with_name('penpot-svg-repair-plan.mjs')
result = subprocess.run(['node', str(compiler), '2.18.3', str(args.expected_revision)], input=json.dumps(file), text=True, capture_output=True, timeout=15)
if result.returncode:
    raise SystemExit('Validated repair compilation rejected; no change submitted')
plan = json.loads(result.stdout)
out = Path(args.evidence_dir)
out.mkdir(mode=448, parents=True, exist_ok=True)
os.chmod(out, 448)
path = out / 'repair-plan.json'
path.write_text(json.dumps(plan, indent=2))
path.chmod(384)
if args.apply:
    rpc('update-file', plan['transitBody'], True)
    after = rpc('get-file', {'id': args.file_id})
    path = out / 'repaired-file.json'
    path.write_text(json.dumps(after, indent=2))
    path.chmod(384)
print(json.dumps({'mode': 'applied' if args.apply else 'dry-run', 'fileId': file['id'], 'expectedRevision': plan['expectedRevision'], 'changedShapes': len(plan['changedShapes']), 'limits': plan['limits']}))
