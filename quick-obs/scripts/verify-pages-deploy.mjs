import { chromium } from "playwright";

const BASE = "http://127.0.0.1:8099/quick-obs/";

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const consoleErrors = [];
  const failedRequests = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("requestfailed", (req) => {
    failedRequests.push(`${req.url()} -> ${req.failure()?.errorText}`);
  });
  page.on("response", (res) => {
    if (res.status() >= 400) failedRequests.push(`${res.url()} -> HTTP ${res.status()}`);
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.screenshot({ path: "/home/claude/quick-obs/screenshots/17-github-pages-simulated.png" });

  const title = await page.title();
  const heading = await page.locator("h1").first().textContent();

  console.log("Titel:", title);
  console.log("H1:", heading);
  console.log("Console-fejl:", consoleErrors.length ? consoleErrors : "ingen");
  console.log("Fejlede requests:", failedRequests.length ? failedRequests : "ingen");

  await browser.close();

  if (consoleErrors.length || failedRequests.length) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
