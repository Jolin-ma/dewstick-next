import { defineConfig, devices } from "@playwright/test";

// E2E runs against a production build (`next build && next start`), since Partial Prefetching
// and the proxy behave differently in `next dev`. Set PLAYWRIGHT_BASE_URL to test a deployment
// instead, e.g. PLAYWRIGHT_BASE_URL=https://dewstick.vercel.app npm run test:e2e
const PORT = 3100;
const deployed = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: deployed ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile\.spec/ },
    // the smallest phone width still in use, with touch and a mobile user agent
    { name: "mobile", use: { ...devices["iPhone SE"], defaultBrowserType: "chromium", viewport: { width: 320, height: 568 } }, testMatch: /mobile\.spec/ },
  ],
  webServer: deployed
    ? undefined
    : {
        command: `npm run build && npm run start -- -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
      },
});
