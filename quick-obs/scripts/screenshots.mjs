import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT_DIR = "/home/claude/quick-obs/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = "http://127.0.0.1:5174";

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  ipadPortrait: { width: 768, height: 1024 },
  ipadLandscape: { width: 1024, height: 768 },
  desktop: { width: 1440, height: 900 },
};

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  console.log("saved", name);
}

async function run() {
  const browser = await chromium.launch();

  // ---- Mobil, lys tilstand, dansk ----
  let page = await browser.newPage({ viewport: VIEWPORTS.mobile });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot(page, "01-mobile-home-light-da");

  await page.getByRole("button", { name: /MIST/i }).click();
  await page.waitForTimeout(150);
  await shot(page, "02-mobile-formshell-mist");

  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(100);

  // ---- Indstillingspanel ----
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await shot(page, "03-mobile-settings-panel");

  // ---- Skift til KL -> dansk fallback ----
  await page.getByRole("button", { name: "Kalaallisut" }).click();
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: "Tilbage" }).click(); // luk settings (X-knap har label "Tilbage")
  await page.waitForTimeout(100);
  await shot(page, "04-mobile-home-kl");

  await page.getByRole("button", { name: /9-Liner/i }).click();
  await page.waitForTimeout(150);
  await shot(page, "05-mobile-formshell-kl-fallback");

  await page.close();

  // ---- Moerk tilstand - mobil, forside ----
  page = await browser.newPage({ viewport: VIEWPORTS.mobile });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: /moerkt felttema|mørkt felttema/i }).click();
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(100);
  await shot(page, "06-mobile-home-dark-da");
  await page.close();

  // ---- iPad staaende ----
  page = await browser.newPage({ viewport: VIEWPORTS.ipadPortrait });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot(page, "07-ipad-portrait-home");
  await page.close();

  // ---- iPad liggende ----
  page = await browser.newPage({ viewport: VIEWPORTS.ipadLandscape });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot(page, "08-ipad-landscape-home");
  await page.close();

  // ---- Desktop ----
  page = await browser.newPage({ viewport: VIEWPORTS.desktop });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot(page, "09-desktop-home");
  await page.close();

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
