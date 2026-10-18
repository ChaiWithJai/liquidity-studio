// Local source preparation only. This does not authorize source/binary redistribution.
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const source = process.argv[2];
if (!source || process.argv.length !== 3)
  throw new Error("Pass the local pinned Doory checkout path");
const pin = "27b6f68221fdbf1ef1bedc182e303210ca9e39f5";
const checkout = path.resolve(source);
const head = execFileSync("git", ["-C", checkout, "rev-parse", "HEAD"], {
  encoding: "utf8",
  timeout: 10000,
}).trim();
if (head !== pin)
  throw new Error("Doory checkout does not match the pinned commit");
const manifest = JSON.parse(
  await fs.readFile(
    path.resolve(project, "../docs/specs/doory-host-source-inventory.json"),
    "utf8",
  ),
);
const destination = path.join(project, ".native-editor-source");
for (const file of manifest.files) {
  const bytes = await fs.readFile(
    path.join(checkout, "frontend/src", file.path),
  );
  if (createHash("sha256").update(bytes).digest("hex") !== file.sha256)
    throw new Error(`Pinned source mismatch: ${file.path}`);
}
await fs.mkdir(destination, { recursive: true });
for (const file of manifest.files) {
  const target = path.join(destination, file.path);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(path.join(checkout, "frontend/src", file.path), target);
}
await fs.mkdir(path.join(destination, "styles"), { recursive: true });
for (const relative of ["LICENSE", "frontend/src/styles/tokens.css"]) {
  const bytes = execFileSync(
    "git",
    ["-C", checkout, "show", `${pin}:${relative}`],
    { maxBuffer: 1024 * 1024, timeout: 10000 },
  );
  await fs.writeFile(
    path.join(
      destination,
      relative === "LICENSE" ? "LICENSE" : "styles/tokens.css",
    ),
    bytes,
  );
}
await fs.writeFile(
  path.join(destination, "PIN.json"),
  JSON.stringify(
    {
      sourceCommit: pin,
      files: manifest.files.length,
      distributionStatus: "unresolved_GPG_license_text_condition",
    },
    null,
    2,
  ),
);
console.log(
  `Prepared ${manifest.files.length} verified editor source files locally. Distribution condition remains unresolved.`,
);
