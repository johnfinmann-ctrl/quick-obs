import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT_DIR = "/home/claude/quick-obs/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });
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
  const browser = await chromium.launch({
    permissions: [],
  });

  // ============ 1. Forside (ny opbygning) ============
  let context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  let page = await context.newPage();
  attach(page);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot(page, "pc-01-home-mobile");

  // ============ 2. Hurtig rapport + udvid til Meldingsblanket ============
  await page.getByRole("button", { name: /Hurtig rapport/i }).click();
  await page.waitForTimeout(200);
  await shot(page, "pc-02-hurtigrapport-empty");
  await page.locator("select").first().selectOption({ index: 1 });
  await page.locator("#whatHappened").fill("Ukendt fartoej observeret ved kysten");
  await page.locator("#dtg").fill("2026-08-04T11:00");
  await page.locator("#observer").fill("OP-7");
  await page.getByRole("radio", { name: "Normal" }).click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Gem", exact: true }).click();
  await page.waitForTimeout(300);
  await shot(page, "pc-03-hurtigrapport-saved-expand");
  const expandBtn = page.getByRole("button", { name: /Meldingsblanket/i }).first();
  await expandBtn.click();
  await page.waitForTimeout(300);
  await shot(page, "pc-04-expanded-meldingsblanket");
  const senderVal = await page.locator("#senderCallsign").inputValue();
  console.log("Hurtig rapport -> Meldingsblanket, observer overfoert til senderCallsign:", senderVal === "OP-7");
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ============ 3. SITREP ============
  await page.getByRole("button", { name: /SITREP/i }).click();
  await page.waitForTimeout(200);
  await page.locator("#unit").fill("Delta-Kompagni");
  await page.locator("#overallSituation").fill("Roligt omraade, ingen aktivitet af betydning.");
  await page.waitForTimeout(700);
  await shot(page, "pc-05-sitrep-filled");
  const linkedCheckbox = page.locator('input[type="checkbox"]').first();
  if (await linkedCheckbox.count() > 0) {
    await linkedCheckbox.check();
  }
  await page.getByRole("button", { name: "Gem", exact: true }).click();
  await page.waitForTimeout(300);
  await shot(page, "pc-06-sitrep-saved");
  const sitrepSaved = await page.locator("text=Rapporten er gemt").count();
  console.log("SITREP gemt:", sitrepSaved > 0);
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ============ 4. Taleoptagelse (mikrofon TILLADT) ============
  await context.grantPermissions(["microphone"], { origin: BASE_URL });
  await page.getByRole("button", { name: /Meldingsblanket/i }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: /Start taleoptagelse/i }).click();
  await page.waitForTimeout(1500);
  await shot(page, "pc-07-voice-recording");
  await page.getByRole("button", { name: /Stop optagelse/i }).click();
  await page.waitForTimeout(800);
  await shot(page, "pc-08-voice-recorded");
  const audioCount = await page.locator("audio").count();
  console.log("Lydoptagelse gemt og afspilningskontrol vist:", audioCount > 0);
  await page.close();

  // ============ 5. Mikrofon AFVIST (ny context uden tilladelse) ============
  let context2 = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: [] });
  await context2.route("**/*", (route) => route.continue());
  let page2 = await context2.newPage();
  attach(page2);
  // Override getUserMedia to simulate denial (Playwright's default is prompt->auto-deny w/o grant)
  await page2.goto(BASE_URL, { waitUntil: "networkidle" });
  await page2.getByRole("button", { name: /Meldingsblanket/i }).click();
  await page2.waitForTimeout(200);
  await page2.getByRole("button", { name: /Start taleoptagelse/i }).click();
  await page2.waitForTimeout(500);
  await shot(page2, "pc-09-voice-permission-denied");
  const micErrorShown = await page2.locator("text=Mikrofontilladelse").count();
  console.log("Mikrofon-afvist fejlbesked vist:", micErrorShown > 0);
  await page2.close();
  await context2.close();

  await browser.close();
  console.log("\n=== KONSOL-FEJL (foerste del) ===", consoleErrors.length ? consoleErrors : "ingen");
  console.log("=== FEJLEDE REQUESTS (foerste del) ===", failedRequests.length ? failedRequests : "ingen");
}
run().catch((e) => { console.error("FEJL:", e); process.exit(1); });
