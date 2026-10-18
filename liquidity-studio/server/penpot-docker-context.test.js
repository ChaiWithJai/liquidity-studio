import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// Docker's context starts excluded; every static bridge asset must be explicitly
// admitted along with its parent directories. Keep private operator files excluded.
test("runtime Penpot COPY source survives the narrow Docker context allowlist", () => {
  const root = new URL("../", import.meta.url);
  const rules = readFileSync(new URL(".dockerignore", root), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  assert.equal(rules[0], "**");
  assert.ok(rules.includes("!tools/"));
  assert.ok(rules.includes("!tools/penpot-token-plugin/"));
  const assets = readdirSync(new URL("tools/penpot-token-plugin/", root));
  assert.deepEqual(assets.sort(), [
    "action.js",
    "index.html",
    "plugin-tail.js",
    "style.css",
    "ui.js",
  ]);
  for (const asset of assets)
    assert.ok(
      rules.includes(`!tools/penpot-token-plugin/${asset}`),
      `${asset} is absent from Docker context`,
    );
  assert.equal(rules.includes("!tools/**"), false);
  assert.equal(
    rules.some((rule) => rule.includes("operator.json")),
    false,
  );
  assert.match(
    readFileSync(new URL("Dockerfile", root), "utf8"),
    /COPY --chown=node:node tools\/penpot-token-plugin \.\/tools\/penpot-token-plugin/,
  );
});
