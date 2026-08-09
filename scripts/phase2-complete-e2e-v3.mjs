import { chromium } from "playwright";
import path from "node:path";

const OUT_DIR = "/home/claude/quick-obs/screenshots";
const BASE_URL = "http://127.0.0.1:5174/quick-obs/";
const consoleErrors = [];
const failedRequests = [];
const results = [];
function attach(page) {
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`[${page.url()}] ${m.text()}`); });
  page.on("requestfailed", (r) => { if (!r.url().includes("openstreetmap")) failedRequests.push(`${r.url()} -> ${r.failure()?.errorText}`); });
  page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("openstreetmap")) failedRequests.push(`${r.url()} -> HTTP ${r.status()}`); });
}
async function shot(page, name) { await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) }); console.log("saved", name); }
function check(label, ok) { results.push({ label, ok }); console.log(ok ? "PASS" : "FAIL", "-", label); }

async function run() {
  const browser = await chromium.launch();

  // ============ KL statusbanner (rettet: 'Tilbage' er korrekt fallback-label, ikke 'Aftur') ============
  let context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  let page = await context.newPage();
  attach(page);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Kalaallisut" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Tilbage" }).click(); // dansk fallback, da kl.ts er tom
  await page.waitForTimeout(150);
  await shot(page, "pc-18-kl-status-banner");
  check("KL statusbanner (dansk fallback) vist, og lukkeknap falder korrekt tilbage til dansk 'Tilbage'", (await page.locator("text=Kalaallisut oversættelse mangler").count()) > 0);
  await page.close();
  await context.close();

  // ============ Viewports + temaer ============
  for (const [name, vp] of Object.entries({
    "mobile": { width: 390, height: 844 },
    "ipad-portrait": { width: 768, height: 1024 },
    "ipad-landscape": { width: 1024, height: 768 },
    "desktop": { width: 1440, height: 900 },
  })) {
    context = await browser.newContext({ viewport: vp });
    page = await context.newPage();
    attach(page);
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await shot(page, `pc-19-home-${name}-light`);
    await page.getByRole("button", { name: "Indstillinger" }).click();
    await page.waitForTimeout(150);
    await page.getByText(/moerkt felttema|mørkt felttema/i).click();
    await page.waitForTimeout(150);
    await page.getByRole("button", { name: "Tilbage" }).click();
    await page.waitForTimeout(150);
    await shot(page, `pc-20-home-${name}-dark`);
    await page.close();
    await context.close();
  }

  await browser.close();
  console.log("\n=== RESULTATER ===");
  results.forEach((r) => console.log(r.ok ? "PASS" : "FAIL", "-", r.label));
  console.log("\n=== KONSOL-FEJL ===", consoleErrors.length ? consoleErrors : "ingen");
  console.log("=== FEJLEDE REQUESTS (ekskl. OSM) ===", failedRequests.length ? failedRequests : "ingen");
}
run().catch((e) => { console.error("FEJL:", e); process.exit(1); });
