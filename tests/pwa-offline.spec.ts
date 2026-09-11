import { test, expect } from "@playwright/test";

/**
 * Verificerer, at Quick-Obs faktisk fungerer som en offline-PWA:
 * service workeren installeres, precacher app-shell'et, og appen kan
 * genindlaeses og bruges helt uden netvaerksforbindelse.
 */
test.describe("PWA / offline app-shell", () => {
  test("service worker registreres og naar 'activated'-tilstand", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect
      .poll(async () => {
        return page.evaluate(async () => {
          const reg = await navigator.serviceWorker.getRegistration();
          return reg?.active?.state ?? null;
        });
      }, { timeout: 5000 })
      .toBe("activated");
  });

  test("appen genindlaeses og virker helt offline efter foerste besoeg", async ({ page, context }) => {
    await page.goto("/");
    // Vent til service workeren har overtaget kontrollen over siden.
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Sluk for netvaerket og genindlaes - app-shell'et skal komme fra cachen.
    await context.setOffline(true);
    await page.reload();

    await expect(page.getByRole("heading", { name: "Quick-Obs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hurtig rapport" })).toBeVisible();

    // Grundlaeggende navigation skal ogsaa virke offline (kun app-shell, ingen serverkald).
    await page.getByRole("button", { name: "Meldingsblanket", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Meldingsblanket" })).toBeVisible();

    await context.setOffline(false);
  });

  test("manifest.webmanifest er tilgaengelig offline (installerbarhed)", async ({ page, context }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    await context.setOffline(true);
    const manifestResponse = await page.evaluate(async () => {
      const res = await fetch("/quick-obs/manifest.webmanifest");
      return { ok: res.ok, status: res.status };
    });
    expect(manifestResponse.ok).toBe(true);
    await context.setOffline(false);
  });
});
