import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright-konfiguration for Quick-Obs' end-to-end-tests.
 *
 * Testene koerer mod et lokalt production-build (`vite preview`), serveret
 * under samme undermappe-base som GitHub Pages (`/quick-obs/`), saa
 * testene ogsaa fungerer som en reel GitHub Pages-simulering.
 *
 * Foerste gang: `npm ci` og dernaest `npx playwright install chromium`
 * (browser-binarer downloades IKKE automatisk af npm ci). Koer derefter
 * `npm run test:e2e`, som bygger appen og starter preview-serveren
 * automatisk foer testene koeres.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173/quick-obs/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run preview -- --port 4173 --host 127.0.0.1",
    url: "http://127.0.0.1:4173/quick-obs/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
