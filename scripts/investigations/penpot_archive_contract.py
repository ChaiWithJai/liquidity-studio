"""Conservative pinned native-archive gate for the font-only recovery path."""
import io
import json
import pathlib
import uuid
import zipfile


def validate_native_archive(data):
    if not isinstance(data, bytes) or not 0 < len(data) <= 10 * 1024 * 1024:
        raise ValueError("Native archive size unsupported")
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = archive.infolist()
        names = [entry.filename for entry in entries]
        if not 1 <= len(entries) <= 1000 or len(names) != len(set(names)):
            raise ValueError("Native archive entries unsupported")
        if sum(entry.file_size for entry in entries) > 20 * 1024 * 1024:
            raise ValueError("Native archive expansion exceeds bound")
        for name in names:
            path = pathlib.PurePosixPath(name)
            if path.is_absolute() or ".." in path.parts or "\\" in name:
                raise ValueError("Native archive path unsupported")
        manifest = json.loads(archive.read("manifest.json"))
        if manifest.get("type") != "penpot/export-files" or (type(manifest.get("version")) is not int or manifest.get("version") != 1) or manifest.get("generatedBy") != "penpot/2.18.3" or len(manifest.get("files", [])) != 1 or manifest.get("relations"):
            raise ValueError("Native archive version or external library unsupported")
        file_id = manifest["files"][0]["id"]
        if str(uuid.UUID(file_id)) != file_id:
            raise ValueError("Native archive file identity invalid")
        thumbnail_ids = set()
        for name in names:
            if name.startswith("objects/") and name.endswith(".json"):
                metadata = json.loads(archive.read(name))
                if metadata.get("bucket") != "file-object-thumbnail":
                    raise ValueError("External media storage object unsupported")
                thumbnail_ids.add(metadata.get("id"))
        shapes = 0

        def inspect(value):
            nonlocal shapes
            if isinstance(value, list):
                for child in value:
                    inspect(child)
            elif isinstance(value, dict):
                if value.get("type") in ["image", "svg-raw"]:
                    raise ValueError("External raster/raw SVG imports require a separate verified recovery path")
                if "type" in value and "id" in value:
                    shapes += 1
                for key, child in value.items():
                    if key == "mediaId" and set(value) == {"fileId", "pageId", "frameId", "tag", "mediaId"} and value.get("fileId") == file_id and value.get("tag") in ["frame", "component"] and isinstance(child, str) and child in thumbnail_ids:
                        continue
                    if key in ["fillImage", "fill-image", "mediaId", "media-id", "imageData", "image-data", "images", "media"] and child:
                        raise ValueError("External native media is unsupported by font-only recovery")
                    inspect(child)

        for entry in entries:
            name = entry.filename
            if name == "manifest.json":
                continue
            if name.startswith("files/" + file_id + "/") and name.endswith(".json") or name == "files/" + file_id + ".json":
                if entry.file_size > 2 * 1024 * 1024:
                    raise ValueError("Native JSON record exceeds bound")
                inspect(json.loads(archive.read(name)))
            elif name.startswith("objects/") and name.endswith(".json"):
                record = json.loads(archive.read(name))
                if record.get("bucket") != "file-object-thumbnail":
                    raise ValueError("External media storage object unsupported")
            elif name.startswith("objects/") and name.endswith(".png"):
                metadata = json.loads(archive.read(name[:-4] + ".json"))
                if metadata.get("bucket") != "file-object-thumbnail":
                    raise ValueError("Only generated native thumbnails are allowed")
            else:
                raise ValueError("Unknown native archive entry")
        return {"archiveType": manifest["type"], "archiveVersion": 1, "generatedBy": manifest["generatedBy"], "entries": len(entries), "shapeRecords": shapes, "externalMedia": "rejected"}
