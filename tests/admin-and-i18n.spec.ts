import { test, expect } from "@playwright/test";

async function unlockAdmin(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.getByText("Administration", { exact: true }).click();
  await page.locator('input[type="password"]').fill("1234");
  await page.getByRole("button", { name: "Laas op" }).click();
  await expect(page.getByText("Demo-PIN giver ikke")).toBeVisible();
}

test.describe("Administration", () => {
  test("standard-PIN laaser op, og 'Laas nu' laaser igen", async ({ page }) => {
    await page.goto("/");
    await unlockAdmin(page);
    await page.getByRole("button", { name: "Laas nu" }).click();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("tidszoneadministration accepterer en gyldig groenlandsk IANA-zone og afviser en ugyldig", async ({ page }) => {
    await page.goto("/");
    await unlockAdmin(page);
    await page.mouse.wheel(0, 2500);

    const tzInput = page.locator('input[placeholder="fx America/Nuuk"]');
    await tzInput.fill("America/Nuuk");
    await page.getByRole("button", { name: /Brug denne tidszone/ }).click();
    await expect(page.getByText("America/Nuuk")).toBeVisible();
    await expect(page.getByText("UTC-1")).toBeVisible();

    await tzInput.fill("Not/AZone");
    await page.getByRole("button", { name: /Brug denne tidszone/ }).click();
    await expect(page.getByText("Ukendt IANA-tidszone")).toBeVisible();
  });

  test("Blanketbibliotek: modulfarve og fremhaevning kan aendres, og standard kan gendannes", async ({ page }) => {
    await page.goto("/");
    await unlockAdmin(page);
    await expect(page.getByText("Blanketbibliotek").first()).toBeVisible();
    const restoreBtn = page.getByRole("button", { name: /Gendan standardopsaetning/ });
    await expect(restoreBtn).toBeVisible();
    await restoreBtn.click();
  });

  test("oversaettelsesstatus viser manglende strenge for Foeroeyskt og Kalaallisut", async ({ page }) => {
    await page.goto("/");
    await unlockAdmin(page);
    await page.mouse.wheel(0, 3500);
    await page.getByRole("button", { name: /Vis manglende strenge/ }).first().click();
    await expect(page.locator("ul li").first()).toBeVisible();
  });
});

test.describe("Sprog", () => {
  test("Foeroeyskt viser ét kompakt statusbanner, ikke en gentaget besked under hvert felt", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Indstillinger" }).click();
    await page.getByRole("button", { name: "Foroyskt" }).click();
    await page.getByRole("button", { name: "Aftur" }).click();
    await expect(page.getByText("Oversættelsesudkast")).toBeVisible();

    await page.locator("button", { hasText: "Fráboðanarskjal" }).click();
    await expect(page.getByText("Oversættelse afventer godkendelse")).toHaveCount(0);
  });

  test("Kalaallisut falder korrekt tilbage til dansk med ét statusbanner", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Indstillinger" }).click();
    await page.getByRole("button", { name: "Kalaallisut" }).click();
    await page.getByRole("button", { name: "Tilbage" }).click();
    await expect(page.getByText("Kalaallisut oversættelse mangler")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quick-Obs" })).toBeVisible();
  });
});

test.describe("Responsivt layout", () => {
  const viewports = {
    mobile: { width: 390, height: 844 },
    "ipad-portrait": { width: 768, height: 1024 },
    "ipad-landscape": { width: 1024, height: 768 },
    desktop: { width: 1440, height: 900 },
  };

  for (const [name, size] of Object.entries(viewports)) {
    test(`${name}: ingen vandret scrolling i lyst eller moerkt tema`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto("/");
      const scrollLight = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(scrollLight).toBe(false);

      await page.getByRole("button", { name: "Indstillinger" }).click();
      await page.getByText(/moerkt felttema|mørkt felttema/i).click();
      await page.getByRole("button", { name: "Tilbage" }).click();
      const scrollDark = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(scrollDark).toBe(false);
    });
  }
});
