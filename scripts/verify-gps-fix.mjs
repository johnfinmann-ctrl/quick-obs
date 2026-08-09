import { chromium } from "playwright";

const BASE_URL = "http://127.0.0.1:5174/quick-obs/";

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: ["geolocation"],
    geolocation: { latitude: 64.15, longitude: -21.9 },
  });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Dronemelding/i }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: /Hent GPS-position/i }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/home/claude/quick-obs/screenshots/pc-10b-gps-accuracy-fixed.png" });
  console.log("saved pc-10b-gps-accuracy-fixed");
  await browser.close();
}
run();
