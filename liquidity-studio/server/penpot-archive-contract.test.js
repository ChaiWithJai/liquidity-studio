import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test(
  "font-recovery archive gate rejects unsupported native versions/media and unsafe ZIP entries before import",
  { timeout: 10000 },
  () => {
    const result = spawnSync(
      "python3",
      [
        "-m",
        "unittest",
        "discover",
        "-s",
        fileURLToPath(
          new URL("../../scripts/investigations/", import.meta.url),
        ),
        "-p",
        "test_penpot_archive_contract.py",
      ],
      { encoding: "utf8", timeout: 8000 },
    );
    assert.equal(
      result.status,
      0,
      result.error?.message || result.stderr || result.stdout,
    );
  },
);
