import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT_DIR = "/home/claude/quick-obs/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });
const BASE_URL = "http://127.0.0.1:5174/quick-obs/";

const consoleErrors = [];
const failedRequests = [];

function attachDiagnostics(page) {
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[${page.url()}] ${msg.text()}`);
  });
  page.on("requestfailed", (req) => {
    failedRequests.push(`${req.url()} -> ${req.failure()?.errorText}`);
  });
  page.on("response", (res) => {
    if (res.status() >= 400) failedRequests.push(`${res.url()} -> HTTP ${res.status()}`);
  });
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  console.log("saved", name);
}

async function run() {
  const browser = await chromium.launch();

  // ---- Test 1: udfyld og gem Meldingsblanket ----
  let page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  attachDiagnostics(page);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot(page, "p2-01-home");

  await page.getByRole("button", { name: /Meldingsblanket/i }).click();
  await page.waitForTimeout(200);
  await shot(page, "p2-02-meldingsblanket-empty");

  await page.locator("#senderCallsign").fill("ALFA-1");
  await page.locator("#dtg").fill("2026-08-04T10:00");
  await page.locator("textarea").first().fill("Test-observation");
  await page.waitForTimeout(1000); // autosave debounce
  await shot(page, "p2-03-meldingsblanket-filled");

  await page.getByRole("button", { name: "Gem", exact: true }).click();
  await page.waitForTimeout(300);
  await shot(page, "p2-04-meldingsblanket-saved");

  const savedBanner = await page.locator("text=Rapporten er gemt").count();
  console.log("Meldingsblanket gemt-banner synligt:", savedBanner > 0);

  // Tilbage til forside, tjek historik
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await page.getByText("Historik", { exact: true }).click();
  await page.waitForTimeout(300);
  await shot(page, "p2-05-history");
  const historyCount = await page.locator("text=Meldingsblanket").count();
  console.log("Historik viser Meldingsblanket-post:", historyCount > 0);

  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ---- Test 2: 9-Liner -> opret tilknyttet MIST ----
  await page.getByRole("button", { name: /9-Liner/i }).click();
  await page.waitForTimeout(200);
  await page.getByRole("radio", { name: "Fredstid" }).click();
  await page.locator("#senderCallsign").fill("BRAVO-2");
  await page.locator("#dtg").fill("2026-08-04T10:15");
  const precedenceSelect = page.locator("select").first();
  await precedenceSelect.selectOption({ index: 1 });
  await page.waitForTimeout(600);
  await shot(page, "p2-06-nineliner-peacetime-fields");

  await page.getByRole("button", { name: "Gem", exact: true }).click();
  await page.waitForTimeout(300);
  const createMistBtn = page.getByRole("button", { name: /Opret tilknyttet MIST/i });
  const hasCreateMist = await createMistBtn.count();
  console.log("Knap 'Opret tilknyttet MIST' vist efter gem:", hasCreateMist > 0);
  if (hasCreateMist > 0) {
    await createMistBtn.click();
    await page.waitForTimeout(300);
    await shot(page, "p2-07-mist-linked");
    const linkedSelectValue = await page.locator("#linkedNineLiner").inputValue();
    console.log("MIST linkedNineLiner forudfyldt:", linkedSelectValue.length > 0);
  }
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ---- Test 3: Dronemelding felter ----
  await page.getByRole("button", { name: /Dronemelding/i }).click();
  await page.waitForTimeout(200);
  await shot(page, "p2-08-dronemelding");
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ---- Test 4: SAR-melding + MIPRE generator + kontakter ----
  await page.getByRole("button", { name: /SAR-melding/i }).click();
  await page.waitForTimeout(200);
  await page.getByRole("radio", { name: "Maritim" }).click();
  await page.getByRole("radio", { name: "MAYDAY", exact: true }).click();
  await page.locator("#whoInDistress").fill("Fiskefartoej med 3 ombord");
  await page.locator("#whatHappened").fill("Motorstop, tager vand ind");
  await page.locator("#assistanceRequested").fill("Assistance oenskes hurtigst muligt");
  await page.getByRole("button", { name: /Generér radiotekst/i }).click();
  await page.waitForTimeout(200);
  await shot(page, "p2-09-sar-mipre");

  const mipreValue = await page.locator("textarea").last();
  console.log("MIPRE-tekst indeholder MAYDAY:", (await mipreValue.inputValue()).includes("MAYDAY"));

  // Kontakter i SAR-formularen + RING NU-bekraeftelse
  await page.getByRole("button", { name: /RING NU/i }).first().click();
  await page.waitForTimeout(200);
  await shot(page, "p2-10-sar-ringnu-confirm");
  await page.getByRole("button", { name: "Annullér" }).click();

  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ---- Test 5: Sprogskift til KL og dansk fallback ----
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Kalaallisut" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: /Meldingsblanket/i }).click();
  await page.waitForTimeout(200);
  await shot(page, "p2-11-kl-fallback");
  const pendingNoteCount = await page.locator("text=Oversættelse afventer godkendelse").count();
  console.log("KL fallback-noter vist:", pendingNoteCount);
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Dansk" }).click();
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(150);

  // ---- Test 6: Moerkt tema ----
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await page.getByText(/moerkt felttema|mørkt felttema/i).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(150);
  await shot(page, "p2-12-home-dark");

  // ---- Test 7: Admin PIN-flow ----
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await page.getByText("Administration", { exact: true }).click();
  await page.waitForTimeout(300);
  await shot(page, "p2-13-admin-pin-dialog");
  await page.locator('input[type="password"]').fill("1234");
  await page.getByRole("button", { name: "Laas op" }).click();
  await page.waitForTimeout(300);
  await shot(page, "p2-14-admin-unlocked");
  const adminTitle = await page.locator("text=Administration").count();
  console.log("Admin-panel aabnet:", adminTitle > 0);

  // Scroll ned for at se flere sektioner
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(200);
  await shot(page, "p2-15-admin-scrolled");

  await browser.close();

  console.log("\n=== KONSOL-FEJL ===");
  console.log(consoleErrors.length ? consoleErrors : "ingen");
  console.log("=== FEJLEDE REQUESTS ===");
  console.log(failedRequests.length ? failedRequests : "ingen");
}

run().catch((err) => {
  console.error("TEST FEJLEDE:", err);
  process.exit(1);
});
