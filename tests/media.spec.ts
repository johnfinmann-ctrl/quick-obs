import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_IMAGE = path.join(__dirname, "fixtures", "test-photo.jpg");

test.describe("Medier: foto, video, tale", () => {
  test("importeret foto vises i medielisten med 'Importeret'-taeg", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Meldingsblanket", exact: true }).click();
    await page.locator('input[type="file"][accept="image/*,video/*,audio/*"]').setInputFiles(TEST_IMAGE);
    await expect(page.getByText("Importeret")).toBeVisible();
  });

  test("video optages med fake kamera/mikrofon, gennemses og gemmes", async ({ page, context }) => {
    await context.grantPermissions(["camera", "microphone"]);
    await page.goto("/");
    await page.getByRole("button", { name: "Meldingsblanket", exact: true }).click();
    await page.getByRole("button", { name: /Optag video med lyd/ }).click();
    await expect(page.getByText("Mikrofon aktiv")).toBeVisible();
    await page.getByRole("button", { name: /Start optagelse/ }).click();
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: /Stop optagelse/ }).click();
    await expect(page.getByRole("button", { name: /Gem optagelse/ })).toBeVisible();
    await page.getByRole("button", { name: /Gem optagelse/ }).click();
    await expect(page.getByText("Mikrofon aktiv").last()).toBeVisible();
  });

  test("taleoptagelse kan startes, pauses/fortsaettes og stoppes", async ({ page, context }) => {
    await context.grantPermissions(["microphone"]);
    await page.goto("/");
    await page.getByRole("button", { name: "Meldingsblanket", exact: true }).click();
    await page.getByRole("button", { name: "Start taleoptagelse", exact: true }).click();
    await page.waitForTimeout(1000);
    const pauseBtn = page.getByRole("button", { name: /Pause/ });
    if (await pauseBtn.count() > 0) {
      await pauseBtn.click();
      await expect(page.getByRole("button", { name: /Fortsaet/ })).toBeVisible();
      await page.getByRole("button", { name: /Fortsaet/ }).click();
    }
    await page.getByRole("button", { name: /Stop optagelse/ }).click();
    await page.waitForTimeout(500);
    await expect(page.locator("audio")).toBeVisible();
  });

  test("medier bevares efter sidegenindlaesning", async ({ page, context }) => {
    await context.grantPermissions(["microphone", "geolocation"]);
    await context.setGeolocation({ latitude: 64.15, longitude: -21.9 });
    await page.goto("/");
    await page.getByRole("button", { name: "Meldingsblanket", exact: true }).click();
    await page.getByRole("button", { name: "Start taleoptagelse", exact: true }).click();
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: /Stop optagelse/ }).click();
    await expect(page.locator("audio")).toBeVisible();
    // Vent forbi den debounced autosave (600ms), saa kladden er skrevet til IndexedDB foer genindlaesning.
    await page.waitForTimeout(1000);

    await page.reload();
    await page.getByRole("button", { name: "Meldingsblanket", exact: true }).click();
    await expect(page.locator("audio")).toBeVisible();
  });
});
