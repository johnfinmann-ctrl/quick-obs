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

async function enableDark(page) {
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: /moerkt felttema|mørkt felttema/i }).click();
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(100);
}

async function run() {
  const browser = await chromium.launch();

  // 10. Mobil, lyst tema, forside
  let page = await browser.newPage({ viewport: VIEWPORTS.mobile });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot(page, "10-mobile-home-light");

  // 11. Mobil, moerkt tema, forside
  await enableDark(page);
  await shot(page, "11-mobile-home-dark");
  await page.close();

  // 12. iPad staaende
  page = await browser.newPage({ viewport: VIEWPORTS.ipadPortrait });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot(page, "12-ipad-portrait-home");
  await page.close();

  // 13. iPad liggende
  page = await browser.newPage({ viewport: VIEWPORTS.ipadLandscape });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot(page, "13-ipad-landscape-home");
  await page.close();

  // 14. Desktop
  page = await browser.newPage({ viewport: VIEWPORTS.desktop });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot(page, "14-desktop-home");

  // 15. Indstillingspanel (desktop-viewport, samme session)
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForTimeout(150);
  await shot(page, "15-settings-panel");
  await page.getByRole("button", { name: "Tilbage" }).click();
  await page.waitForTimeout(100);
  await page.close();

  // 16. Formularskal i moerkt tema (mobil, for at bekraefte badge-kontrast)
  page = await browser.newPage({ viewport: VIEWPORTS.mobile });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await enableDark(page);
  await page.getByRole("button", { name: /MIST/i }).click();
  await page.waitForTimeout(150);
  await shot(page, "16-formshell-dark");
  await page.close();

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
