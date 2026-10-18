"""Read-only local native SVG export matrix. No arbitrary host/download URL."""
import argparse
import hashlib
import json
import pathlib
import stat
import urllib.parse
import uuid
import xml.etree.ElementTree as ET
import requests

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--account-file", required=True)
parser.add_argument("--file-id", required=True)
parser.add_argument("--matrix", required=True)
parser.add_argument("--evidence-dir", required=True)
args = parser.parse_args()
credential = pathlib.Path(args.account_file)
if stat.S_IMODE(credential.stat().st_mode) & 0o077:
    raise SystemExit("QA credentials must be mode0600")
account = json.loads(credential.read_text())["accounts"][0]
root = pathlib.Path(args.evidence_dir)
root.mkdir(parents=True, exist_ok=True, mode=0o700)
base = "http://localhost:39008"
session = requests.Session()
session.trust_env = False


def rpc(command, body):
    response = session.post(base + "/api/rpc/command/" + command, json=body, headers={"Accept": "application/json", "Origin": base}, timeout=30, allow_redirects=False)
    if response.status_code != 200:
        raise SystemExit("Local native read failed; response omitted")
    return response.json()


class Keyword(str):
    pass


class NativeUUID(str):
    pass


def transit(value):
    if isinstance(value, Keyword):
        return "~:" + value
    if isinstance(value, NativeUUID):
        return "~u" + value
    if isinstance(value, dict):
        return ["^ "] + sum((["~:" + key, transit(child)] for key, child in value.items()), [])
    if isinstance(value, list):
        return [transit(child) for child in value]
    return value


if str(uuid.UUID(args.file_id)) != args.file_id:
    raise SystemExit("Invalid native file identity")
rpc("login-with-password", {"email": account["email"], "password": account["password"]})
profile, file = rpc("get-profile", {}), rpc("get-file", {"id": args.file_id})
pages = json.loads(pathlib.Path(args.matrix).read_text())["pages"]
if not 1 <= len(pages) <= 9:
    raise SystemExit("SVG matrix requires1–9pages")
rows = []
for index, page in enumerate(pages):
    frame = file["data"]["pagesIndex"].get(page["id"], {}).get("objects", {}).get(page["frameId"], {})
    if frame.get("type") != "frame" or frame.get("width") != page["width"] or frame.get("height") != page["height"] or page["width"] != 1080 or page["height"] not in [1350, 1920]:
        raise SystemExit("Native frame does not match matrix")
    text_shapes = [shape for shape in file["data"]["pagesIndex"][page["id"]]["objects"].values() if shape.get("type") == "text"]
    if any(not shape.get("positionData") for shape in text_shapes):
        raise SystemExit("Native text layout missing: open every recovered page in the native editor, allow save, then retry; no layout is fabricated")
    name = "native-board-" + str(index + 1)
    body = {"cmd": Keyword("export-shapes"), "profile-id": NativeUUID(profile["id"]), "wait": True, "exports": [{"file-id": NativeUUID(file["id"]), "page-id": NativeUUID(page["id"]), "object-id": NativeUUID(page["frameId"]), "type": Keyword("svg"), "suffix": "", "scale": 1, "name": name}]}
    response = session.post(base + "/api/export", data=json.dumps(transit(body)), headers={"Content-Type": "application/transit+json", "Accept": "application/transit+json", "Origin": base}, timeout=60, allow_redirects=False)
    if response.status_code != 200:
        raise SystemExit("Native SVG exporter failed")
    uri = response.json().get("~:uri", {}).get("~#uri", "")
    parsed = urllib.parse.urlparse(uri)
    if parsed.scheme != "http" or parsed.hostname != "localhost" or parsed.port != 39008 or not parsed.path.startswith("/assets/by-id/") or parsed.query or parsed.fragment or parsed.username or parsed.password:
        raise SystemExit("Unexpected native SVG download target")
    response = session.get(uri, timeout=30, allow_redirects=False)
    if response.status_code != 200 or len(response.content) > 4 * 1024 * 1024:
        raise SystemExit("Native SVG download failed or exceeded bound")
    svg = ET.fromstring(response.content)
    if svg.tag != "{http://www.w3.org/2000/svg}svg":
        raise SystemExit("Native SVG root invalid")
    for element in svg.iter():
        if element.tag.rsplit("}", 1)[-1] in ["script", "foreignObject"]:
            raise SystemExit("Unsupported executable SVG output")
        for key, value in element.attrib.items():
            if key.rsplit("}", 1)[-1] == "href" and not value.startswith(("#", "data:")):
                raise SystemExit("External SVG reference requires separate portability proof")
    destination = root / (name + ".svg")
    destination.write_bytes(response.content)
    destination.chmod(0o600)
    rows.append({"filename": destination.name, "format": page["format"], "bytes": len(response.content), "sha256": hashlib.sha256(response.content).hexdigest(), "svgElements": sum(1 for _ in svg.iter()), "renderer": "Actual local Penpot SVG exporter on fresh-team saved native frame", "selfContainedFonts": False, "fontDependency": "Native exported CSS references recovered team loopback assets; source fonts are separately included in the recovery pack"})
(root / "svg-matrix.json").write_text(json.dumps(rows, indent=2))
(root / "svg-matrix.json").chmod(0o600)
print("Actual native SVG matrix complete:", len(rows))
