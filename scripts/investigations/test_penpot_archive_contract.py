import io
import json
import unittest
import zipfile
from penpot_archive_contract import validate_native_archive

FILE = "11111111-1111-4111-8111-111111111111"


def fixture(shape=None, version=1, extra=None):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w") as archive:
        archive.writestr("manifest.json", json.dumps({"type": "penpot/export-files", "version": version, "generatedBy": "penpot/2.18.3", "files": [{"id": FILE}], "relations": []}))
        archive.writestr("files/" + FILE + ".json", "{}")
        archive.writestr("files/" + FILE + "/pages/page/text.json", json.dumps(shape or {"id": FILE, "type": "text", "content": {"text": "Original fixture"}}))
        for key, value in (extra or {}).items():
            archive.writestr(key, value)
    return stream.getvalue()


class ArchiveContract(unittest.TestCase):
    def test_native_text_pinned_version(self):
        self.assertEqual(validate_native_archive(fixture())["archiveVersion"], 1)

    def test_unsupported_media_raw_svg_versions_and_paths_fail_before_import(self):
        cases = [fixture(version=True), fixture(version=2), fixture({"type": "svg-raw"}), fixture({"type": "image"}), fixture({"type": "rect", "fills": [{"fillImage": {"id": FILE}}]}), fixture(extra={"../credential.json": "{}"}), fixture(extra={"objects/media.json": '{"bucket":"file-media-object"}'})]
        for data in cases:
            with self.assertRaises(ValueError):
                validate_native_archive(data)


if __name__ == "__main__":
    unittest.main()
