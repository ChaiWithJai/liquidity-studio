import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  use: {
    headless: true,
    actionTimeout: 10000,
    navigationTimeout: 10000,
    viewport: { width: 1440, height: 1100 },
    trace: "retain-on-failure",
  },
  reporter: "list",
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
