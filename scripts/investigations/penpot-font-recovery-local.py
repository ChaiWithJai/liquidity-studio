"""Restore a verified outer pack into a NEW owned local Penpot QA team only."""
import argparse
import base64
import hashlib
import json
import os
import pathlib
import stat
import subprocess
import uuid
import requests
from penpot_archive_contract import validate_native_archive

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--account-file", required=True)
parser.add_argument("--pack", required=True)
parser.add_argument("--evidence-dir", required=True)
parser.add_argument("--node", default="node")
parser.add_argument("--apply", action="store_true")
args = parser.parse_args()
credential = pathlib.Path(args.account_file)
if stat.S_IMODE(credential.stat().st_mode) & 0o077:
    raise SystemExit("Account input must be mode0600")
helper = pathlib.Path(__file__).with_name("penpot-font-pack.mjs")
subprocess.run([args.node, str(helper), "validate", args.pack], check=True, timeout=15)
pack = json.loads(pathlib.Path(args.pack).read_text())
archive = base64.b64decode(pack["archive"]["bytes"], validate=True)
archive_contract = validate_native_archive(archive)
if not args.apply:
    print("Pack validated. --apply creates a new owned local QA team.")
    raise SystemExit(0)
root = pathlib.Path(args.evidence_dir)
if root.exists() and list(root.iterdir()):
    raise SystemExit("Evidence directory must be fresh and empty")
root.mkdir(mode=0o700, parents=True, exist_ok=True)
os.chmod(root, 0o700)
base = "http://localhost:39008"
account = json.loads(credential.read_text())["accounts"][0]
pack = json.loads(pathlib.Path(args.pack).read_text())
session = requests.Session()
session.trust_env = False


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def rpc(command, payload):
    response = session.post(
        base + "/api/rpc/command/" + command,
        json=payload,
        headers={"Accept": "application/json", "Origin": base},
        timeout=30,
        allow_redirects=False,
    )
    require(response.status_code == 200, "Local native RPC failed; response omitted")
    return response.json()


def save(name, value):
    descriptor = os.open(root / name, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w") as handle:
        json.dump(value, handle, indent=2)


rpc("login-with-password", {"email": account["email"], "password": account["password"]})
team = rpc("create-team", {"name": "Studio font recovery QA " + str(uuid.uuid4())[:8]})
save("archive-contract.json", archive_contract)
save("fresh-team.json", team)
variants = rpc("get-font-variants", {"team-id": team["id"]})
require(variants == [], "Fresh team must have no font variants")
archive = base64.b64decode(pack["archive"]["bytes"], validate=True)
require(hashlib.sha256(archive).hexdigest() == pack["archive"]["sha256"], "Archive checksum mismatch")
response = session.post(
    base + "/api/rpc/command/import-binfile",
    data={"project-id": team["defaultProjectId"], "name": "Studio fresh team font recovery QA"},
    files={"file": ("native-export.penpot", archive, "application/zip")},
    headers={"Accept": "text/event-stream", "Origin": base},
    timeout=60,
    allow_redirects=False,
)
require(response.status_code == 200 and "event: error" not in response.text, "Native archive import failed")
result = json.loads(response.text.split("event: end\ndata: ")[1].split("\n")[0])
require(isinstance(result, list) and len(result) == 1 and isinstance(result[0], str) and result[0].startswith("~u"), "Unexpected native archive result")
file = rpc("get-file", {"id": result[0][2:]})
require(file["projectId"] == team["defaultProjectId"], "Fresh target project mismatch")
save("before-font-rebind.json", file)
families, uploads = {}, []
for font in pack["fonts"]:
    source = base64.b64decode(font["sourceBytes"], validate=True)
    license_bytes = base64.b64decode(font["licenseBytes"], validate=True)
    require(hashlib.sha256(source).hexdigest() == font["sourceSha256"], "Font checksum mismatch")
    require(hashlib.sha256(license_bytes).hexdigest() == font["licenseSha256"], "License checksum mismatch")
    font_id = families.setdefault(font["family"], str(uuid.uuid4()))
    mime = "font/otf" if font["sourceName"].endswith(".otf") else "font/ttf"
    upload_id = rpc("create-upload-session", {"total-chunks": 1})["sessionId"]
    response = session.post(
        base + "/api/rpc/command/upload-chunk",
        data={"session-id": upload_id, "index": "0"},
        files={"content": (font["sourceName"], source, mime)},
        headers={"Accept": "application/json", "Origin": base},
        timeout=30,
        allow_redirects=False,
    )
    require(response.status_code == 200, "Font upload failed")
    variant = rpc("create-font-variant", {"team-id": team["id"], "font-id": font_id, "font-family": font["family"], "font-weight": font["weight"], "font-style": "normal", "uploads": {mime: upload_id}})
    asset = variant["otfFileId" if mime == "font/otf" else "ttfFileId"]
    require(isinstance(asset, str) and str(uuid.UUID(asset)) == asset, "Native font asset identity invalid")
    served = session.get(base + "/assets/by-id/" + asset, timeout=15, allow_redirects=False)
    require(served.status_code == 200 and hashlib.sha256(served.content).hexdigest() == font["sourceSha256"], "Served native font differs")
    uploads.append({"oldFontId": font["oldFontId"], "fontId": "custom-" + font_id, "weight": font["weight"], "family": font["family"], "sourceSha256": font["sourceSha256"], "licenseSha256": font["licenseSha256"], "nativeVariantId": variant["id"], "servedBytesMatch": True})
    print("Fresh-team pinned source font verified:", font["family"], font["weight"])
save("verified-uploads.json", uploads)
save("target.json", {"fileId": file["id"], "teamId": team["id"], "projectId": team["defaultProjectId"], "beforeVariantCount": 0, "afterVariantCount": len(rpc("get-font-variants", {"team-id": team["id"]}))})
subprocess.run([args.node, str(helper), "remap", str(root / "before-font-rebind.json"), args.pack, str(root / "verified-uploads.json"), str(root / "rebind-plan.json")], check=True, timeout=15)
plan = json.loads((root / "rebind-plan.json").read_text())
current = rpc("get-file", {"id": file["id"]})
require(current["id"] == plan["fileId"] and current["projectId"] == team["defaultProjectId"] == plan["projectId"] and current["revn"] == plan["expectedRevision"], "Fresh owned target changed; refusing recovery write")
# This newly imported target has not been opened for concurrent editing. Old revn
# is not a native CAS; this recovery path must never target an interactive file.
rpc("update-file", {"id": current["id"], "session-id": str(uuid.uuid4()), "revn": current["revn"], "vern": current["vern"], "changes": plan["changes"]})
restored = rpc("get-file", {"id": current["id"]})
save("after-font-rebind.json", restored)
print("Fresh-team font rebind saved:", restored["id"])
print("Native browser/export verification remains a separate required step.")
