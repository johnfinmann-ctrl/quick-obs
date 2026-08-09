import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT_DIR = "/home/claude/quick-obs/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });
const BASE_URL = "http://127.0.0.1:5174/quick-obs/";

const consoleErrors = [];
const failedRequests = [];
const results = [];
function attach(page) {
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`[${page.url()}] ${m.text()}`); });
  page.on("requestfailed", (r) => { if (!r.url().includes("tile.openstreetmap.org")) failedRequests.push(`${r.url()} -> ${r.failure()?.errorText}`); });
  page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("openstreetmap")) failedRequests.push(`${r.url()} -> HTTP ${r.status()}`); });
}
async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  console.log("saved", name);
}
function check(label, ok) {
  results.push({ label, ok });
  console.log(ok ? "PASS" : "FAIL", "-", label);
}

async function run() {
  const browser = await chromium.launch({
    args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
  });

  // ============ SITREP (rettet test - inkl. DTG) ============
  let context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ["geolocation"], geolocation: { latitude: 64.15, longitude: -21.9 } });
  let page = await context.newPage();
  attach(page);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  await page.getByRole("button", { name: /SITREP/i }).click();
  await page.waitForTimeout(200);
  await page.locator("#unit").fill("Delta-Kompagni");
  await page.locator("#dtg").fill("2026-08-04T12:00");
  await page.locator("#overallSituation").fill("Roligt omraade, ingen aktivitet af betydning.");
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Gem", exact: true }).click();
  await page.waitForTimeout(300);
  await shot(page, "pc-06b-sitrep-saved");
  check("SITREP gemmes korrekt med DTG udfyldt", (await page.locator("text=Rapporten er gemt").count()) > 0);
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ============ Taleoptagelse med fake mikrofon ============
  await page.getByRole("button", { name: /Meldingsblanket/i }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: /Start taleoptagelse/i }).click();
  await page.waitForTimeout(1200);
  const stopVisible = await page.getByRole("button", { name: /Stop optagelse/i }).count();
  check("Taleoptagelse starter (Stop-knap vises) med fake mikrofon", stopVisible > 0);
  if (stopVisible > 0) {
    await shot(page, "pc-07b-voice-recording");
    await page.getByRole("button", { name: /Stop optagelse/i }).click();
    await page.waitForTimeout(800);
    await shot(page, "pc-08b-voice-recorded");
    check("Lydoptagelse vist med afspilningskontrol efter stop", (await page.locator("audio").count()) > 0);
  }

  // ============ GPS godkendt ============
  await page.getByRole("button", { name: /Hent GPS-position/i }).first().click();
  await page.waitForTimeout(500);
  await shot(page, "pc-10-gps-granted");
  const gpsVal = await page.locator("#gpsPosition").inputValue();
  check("GPS-position hentet ved godkendt tilladelse", gpsVal.includes("64.15") || gpsVal.length > 3);

  // ============ Kort (online) ============
  await page.getByRole("button", { name: /Vis kort/i }).first().click();
  await page.waitForTimeout(1500);
  await shot(page, "pc-11-map-online");

  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ============ Kort offline ============
  await context.setOffline(true);
  await page.getByRole("button", { name: /Dronemelding/i }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: /Vis kort/i }).first().click();
  await page.waitForTimeout(500);
  await shot(page, "pc-12-map-offline");
  check("Offline-besked vist i kort naar contexten er offline", (await page.locator("text=Offline").count()) > 0);
  await context.setOffline(false);
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ============ Blanketbibliotek ============
  await page.getByRole("button", { name: /Blanketbibliotek/i }).click();
  await page.waitForTimeout(300);
  await shot(page, "pc-13-form-library");
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ============ Drone-overvaagning demo ============
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await page.getByText("Droneovervaagning (teknisk demo)", { exact: true }).click();
  await page.waitForTimeout(1500);
  await shot(page, "pc-14-drone-surveillance");
  check("Drone-demo viser 'Ingen aktiv sensor'-status", (await page.locator("text=Ingen aktiv sensor").count()) > 0);
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(200);

  // ============ Medier efter genindlæsning ============
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Meldingsblanket/i }).click();
  await page.waitForTimeout(500);
  await shot(page, "pc-15-media-after-reload");
  const mediaAfterReload = await page.locator("audio, img[src^='blob:'], video").count();
  check("Medier (lyd) bevaret efter genindlaesning af siden", mediaAfterReload > 0);

  // ============ Eksport med medier (kopiér tekst inkl. medieantal) ============
  await page.getByRole("button", { name: "Gem", exact: true }).click();
  await page.waitForTimeout(300);
  const copyBtn = page.getByRole("button", { name: /Kopiér tekst/i });
  if (await copyBtn.count() > 0) {
    await copyBtn.click();
    await page.waitForTimeout(200);
    check("Kopiér tekst-knap virker efter gemning med medie vedhaeftet", (await page.locator("text=Kopieret").count()) > 0);
  }
  await page.close();
  await context.close();

  // ============ Admin PIN + timeout ============
  context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await context.newPage();
  attach(page);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await page.getByText("Administration", { exact: true }).click();
  await page.waitForTimeout(300);
  await page.locator('input[type="password"]').fill("1234");
  await page.getByRole("button", { name: "Laas op" }).click();
  await page.waitForTimeout(300);
  check("Admin-PIN 1234 laaser op", (await page.locator("text=Demo-PIN giver ikke").count()) > 0);
  await shot(page, "pc-16-admin-unlocked-full");
  await page.getByRole("button", { name: "Laas nu" }).click();
  await page.waitForTimeout(200);
  check("'Laas nu' laaser admin manuelt", (await page.locator('input[type="password"]').count()) > 0);
  await page.close();
  await context.close();

  // ============ Sprog: FO og KL statusbannere ============
  context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await context.newPage();
  attach(page);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Foroyskt" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Aftur" }).click();
  await page.waitForTimeout(150);
  await shot(page, "pc-17-fo-status-banner");
  check("FO statusbanner (udkast) vist", (await page.locator("text=OVERSÆTTELSESUDKAST").count()) > 0);

  await page.getByRole("button", { name: "Stillingar" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Kalaallisut" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Aftur" }).click();
  await page.waitForTimeout(150);
  await shot(page, "pc-18-kl-status-banner");
  check("KL statusbanner (dansk fallback) vist", (await page.locator("text=Kalaallisut oversættelse mangler").count()) > 0);
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
  console.log("=== FEJLEDE REQUESTS (ekskl. OSM-fliser) ===", failedRequests.length ? failedRequests : "ingen");
}
run().catch((e) => { console.error("FEJL:", e); process.exit(1); });
