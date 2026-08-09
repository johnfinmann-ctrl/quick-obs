import { chromium } from "playwright";
import path from "node:path";

const OUT_DIR = "/home/claude/quick-obs/screenshots";
const BASE_URL = "http://127.0.0.1:5174/quick-obs/";

const consoleErrors = [];
const failedRequests = [];
function attach(page) {
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`[${page.url()}] ${m.text()}`); });
  page.on("requestfailed", (r) => failedRequests.push(`${r.url()} -> ${r.failure()?.errorText}`));
  page.on("response", (r) => { if (r.status() >= 400) failedRequests.push(`${r.url()} -> HTTP ${r.status()}`); });
}
async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  console.log("saved", name);
}

async function run() {
  const browser = await chromium.launch();

  // ---- FO sprogskift ----
  let page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  attach(page);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Foroyskt" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Aftur" }).click(); // FO for "Tilbage"/close settings
  await page.waitForTimeout(150);
  await shot(page, "p2-16-fo-home");
  const foTitle = await page.locator("h1").first().textContent();
  console.log("FO forside titel synlig:", foTitle);
  await page.close();

  // ---- Media capture: upload test file ----
  page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  attach(page);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Meldingsblanket/i }).click();
  await page.waitForTimeout(200);
  const fileInput = page.locator('input[type="file"][accept="image/*,video/*"]');
  const testImgPath = "/tmp/test-photo.jpg";
  await fileInput.setInputFiles(testImgPath);
  await page.waitForTimeout(800);
  await shot(page, "p2-17-media-attached");
  const mediaItemCount = await page.locator("text=KB").count();
  console.log("Medie vedhaeftet og vist:", mediaItemCount > 0);
  await page.close();

  // ---- iPad / desktop for a filled form ----
  page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  attach(page);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /9-Liner/i }).click();
  await page.waitForTimeout(200);
  await shot(page, "p2-18-nineliner-ipad-landscape");
  await page.close();

  page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  attach(page);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Dronemelding/i }).click();
  await page.waitForTimeout(200);
  await shot(page, "p2-19-dronemelding-desktop");
  await page.close();

  await browser.close();

  console.log("\n=== KONSOL-FEJL ===", consoleErrors.length ? consoleErrors : "ingen");
  console.log("=== FEJLEDE REQUESTS ===", failedRequests.length ? failedRequests : "ingen");
}
run().catch((e) => { console.error("FEJL:", e); process.exit(1); });
