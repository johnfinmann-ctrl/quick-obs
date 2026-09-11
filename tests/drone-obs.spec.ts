import { test, expect } from "@playwright/test";

/**
 * Fase 2.2: Hurtig/Grundig Drone-Obs, udvidede felter, tilknyttede
 * observationer, haendelsesoversigt, overfoersel til SITREP og
 * radiovisning.
 */
test.describe("Drone-Obs - Hurtig observation", () => {
  test("kan gemmes med meget faa oplysninger og tilbyder at fortsaette som grundig", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dronemelding", exact: true }).click();
    await expect(page.getByText("Droner skal ikke alene registreres")).not.toBeVisible(); // sammenklappet som standard

    await page.getByRole("button", { name: "Hurtig observation" }).click();
    await page.locator("#dtg").fill("2026-08-04T10:00");
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Gem", exact: true }).click();

    await expect(page.getByRole("button", { name: /Fortsaet som grundig observation/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Vis til oplaesning/ })).toBeVisible();
  });

  test("medieoptagelse venter ikke paa udfyldte formularfelter", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dronemelding", exact: true }).click();
    await page.getByRole("button", { name: "Hurtig observation" }).click();
    // Ingen felter udfyldt endnu - "Dokumentér haendelsen"-kortet skal vaere klar med det samme.
    await expect(page.getByText("Dokumentér hændelsen")).toBeVisible();
    await expect(page.getByRole("button", { name: "Tag foto" })).toBeEnabled();
  });

  test("hurtig observation kan fortsaettes som grundig observation med data bevaret", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dronemelding", exact: true }).click();
    await page.getByRole("button", { name: "Hurtig observation" }).click();
    await page.locator("#dtg").fill("2026-08-04T10:00");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Gem", exact: true }).click();

    await page.getByRole("button", { name: /Fortsaet som grundig observation/ }).click();
    await expect(page.getByText("Selve dronen (uddybende)")).toBeVisible();
    await expect(page.locator("#dtg")).toHaveValue("2026-08-04T10:00");
  });
});

test.describe("Drone-Obs - Grundig observation", () => {
  test("udvidede felter tillader 'Ukendt'/'Kan ikke vurderes' i stedet for at tvinge et gaet", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dronemelding", exact: true }).click();
    await page.getByRole("button", { name: "Grundig observation" }).click();

    await page.getByText("Selve dronen (uddybende)").click(); // fold sektionen ud
    const classSelect = page.locator("#droneClass");
    await expect(classSelect.locator("option", { hasText: "Ukendt" })).toHaveCount(1);
    await expect(classSelect.locator("option", { hasText: "Kan ikke vurderes" })).toHaveCount(1);
  });

  test("mulige tilknyttede observationer kan tilfoejes og skelner mellem observeret/oplyst/mulig/ukendt", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dronemelding", exact: true }).click();
    await page.getByRole("button", { name: "Grundig observation" }).click();
    await page.getByRole("button", { name: /Tilfoej observation/ }).click();
    await expect(page.locator("option", { hasText: "Direkte observeret" })).toHaveCount(1);
  });

  test("gemning genererer haendelses-ID og tilbyder overfoersel til SITREP samt radiovisning", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dronemelding", exact: true }).click();
    await page.getByRole("button", { name: "Grundig observation" }).click();
    await page.locator("#dtg").fill("2026-08-04T10:00");
    await page.locator("#observer").fill("OBS-1");
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Gem", exact: true }).click();

    await expect(page.getByRole("button", { name: /Tilfoej endnu en observation til denne haendelse/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Se haendelsesoversigt/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Overfoer til SITREP/ })).toBeVisible();

    await page.getByRole("button", { name: /Vis til oplaesning/ }).click();
    await expect(page.getByText("DTG", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hoejkontrast" })).toBeVisible();
  });

  test("overfoersel til SITREP forudfylder vaesentlige haendelser uden automatisk trusselsklassifikation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dronemelding", exact: true }).click();
    await page.getByRole("button", { name: "Grundig observation" }).click();
    await page.locator("#dtg").fill("2026-08-04T10:00");
    await page.locator("#observer").fill("OBS-2");
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Gem", exact: true }).click();
    await page.getByRole("button", { name: /Overfoer til SITREP/ }).click();

    await expect(page.getByRole("heading", { name: "SITREP" })).toBeVisible();
    const keyEvents = await page.locator("#keyEvents").inputValue();
    expect(keyEvents).toContain("Ingen automatisk trusselsvurdering");
    expect(keyEvents).toContain("Haendelses-ID");
  });
});

test.describe("MGRS-felt i Drone-Obs", () => {
  test("kan genereres lokalt fra GPS-position", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 64.15, longitude: -21.9 });
    await page.goto("/");
    await page.getByRole("button", { name: "Dronemelding", exact: true }).click();
    await page.getByRole("button", { name: "Grundig observation" }).click();
    await page.getByRole("button", { name: /Hent GPS-position/ }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Generér MGRS" }).click();
    const mgrsValue = await page.locator("#mgrs").inputValue();
    expect(mgrsValue.length).toBeGreaterThan(8);
  });
});
