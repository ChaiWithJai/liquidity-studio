import { test, expect } from "@playwright/test";
import { build } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createServer } from "node:http";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
let server, directory, base;
test.beforeAll(async () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  directory = mkdtempSync(path.join(tmpdir(), "native-brand-panel-"));
  await build({
    root,
    configFile: false,
    plugins: [svelte()],
    logLevel: "error",
    build: {
      outDir: directory,
      emptyOutDir: true,
      rollupOptions: {
        input: path.join(
          root,
          "tests/fixtures/native-brand-refresh-panel.html",
        ),
      },
    },
  });
  server = createServer((req, res) => {
    const file = path.resolve(
      directory,
      "." + new URL(req.url, "http://fixture").pathname,
    );
    if (!file.startsWith(directory + path.sep)) {
      res.writeHead(404).end();
      return;
    }
    try {
      res.setHeader(
        "Content-Type",
        file.endsWith(".js")
          ? "text/javascript"
          : file.endsWith(".css")
            ? "text/css"
            : "text/html",
      );
      res.end(readFileSync(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}/tests/fixtures/native-brand-refresh-panel.html`;
});
test.afterAll(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (directory) rmSync(directory, { recursive: true, force: true });
});
test("a newer native version never falsely claims the open layout matches its Brand Kit", async ({
  page,
}) => {
  await page.goto(base);
  await page.getByRole("button", { name: "Check saved Brand Kit" }).click();
  await page.evaluate(() =>
    window.fixture.resolve({
      id: "original-document",
      revision: 2,
      currentBrandRevision: "b".repeat(64),
    }),
  );
  await expect(page.getByRole("status")).toContainText(
    "A newer saved layout exists",
  );
  await expect(
    page.getByText("Saved styles match the current Brand Kit."),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Refresh saved brand styles",
      exact: true,
    }),
  ).toHaveCount(0);
});
test("ordinary pending refresh and unconfirmed retry have distinct truthful labels", async ({
  page,
}) => {
  await page.goto(base);
  await page.getByRole("button", { name: "Check saved Brand Kit" }).click();
  await page.evaluate(() =>
    window.fixture.resolve({
      id: "original-document",
      revision: 1,
      currentBrandRevision: "b".repeat(64),
    }),
  );
  await page
    .getByRole("button", { name: "Refresh saved brand styles", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Refreshing styles…", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: "Retry saved brand refresh",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.evaluate(() => window.fixture.reject());
  await page
    .getByRole("button", { name: "Retry saved brand refresh", exact: true })
    .click();
  const inputs = await page.evaluate(() =>
    window.fixture.requests
      .filter((row) => row.options?.method === "POST")
      .map((row) => row.options.body),
  );
  expect(inputs).toHaveLength(2);
  expect(inputs[1]).toBe(inputs[0]);
  await expect(
    page.getByRole("button", { name: "Refreshing styles…", exact: true }),
  ).toBeDisabled();
});
