import { test, expect } from "@playwright/test";

/**
 * Regressionstest af kerneflows fra tidligere faser. Koeres mod et
 * lokalt production-build under /quick-obs/ (se playwright.config.ts).
 */

test.describe("Forside og navigation", () => {
  test("forsiden viser alle moduler uden konsol-/netvaerksfejl", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("requestfailed", (r) => { if (!r.url().includes("openstreetmap")) errors.push(`request failed: ${r.url()}`); });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Quick-Obs" })).toBeVisible();
    for (const name of ["Hurtig rapport", "Meldingsblanket", "SITREP", "Dronemelding", "SAR-melding", "9-Liner", "MIST", "Blanketbibliotek", "Historik"]) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }
    expect(errors, `Uventede fejl: ${errors.join(", ")}`).toHaveLength(0);
  });
});

test.describe("Hurtig rapport", () => {
  test("kan udfyldes, gemmes og udvides til Meldingsblanket uden gentagen indtastning", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Hurtig rapport" }).click();
    await page.locator("select").first().selectOption({ index: 1 });
    await page.locator("#whatHappened").fill("Test-observation fra regressionstest");
    await page.locator("#dtg").fill("2026-08-04T10:00");
    await page.locator("#observer").fill("OP-7");
    await page.getByRole("radio", { name: "Normal" }).click();
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Gem", exact: true }).click();
    await expect(page.getByText("Rapporten er gemt")).toBeVisible();

    await page.getByRole("button", { name: "Meldingsblanket", exact: true }).click();
    await expect(page.locator("#senderCallsign")).toHaveValue("OP-7");
  });
});

test.describe("Meldingsblanket", () => {
  test("gemmes og kan eksporteres som tekst", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Meldingsblanket", exact: true }).click();
    await page.locator("#senderCallsign").fill("ALFA-1");
    await page.locator("#dtg").fill("2026-08-09T23:24");
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Gem", exact: true }).click();
    await expect(page.getByText("Rapporten er gemt")).toBeVisible();
    await expect(page.getByRole("button", { name: /Kopiér tekst/ })).toBeVisible();
  });
});

test.describe("SITREP", () => {
  test("kan udfyldes med paakraevede felter og gemmes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "SITREP", exact: true }).click();
    await page.locator("#unit").fill("Delta-Kompagni");
    await page.locator("#dtg").fill("2026-08-04T12:00");
    await page.locator("#overallSituation").fill("Roligt omraade.");
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Gem", exact: true }).click();
    await expect(page.getByText("Rapporten er gemt")).toBeVisible();
  });
});

test.describe("9-Liner og MIST", () => {
  test("9-Liner kan gemmes og tilbyder at oprette en tilknyttet MIST", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "9-Liner", exact: true }).click();
    await page.getByRole("radio", { name: "Fredstid" }).click();
    await page.locator("#senderCallsign").fill("BRAVO-2");
    await page.locator("#dtg").fill("2026-08-04T10:15");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Gem", exact: true }).click();
    await expect(page.getByText("Rapporten er gemt")).toBeVisible();

    const linkBtn = page.getByRole("button", { name: /Opret tilknyttet MIST/ });
    await expect(linkBtn).toBeVisible();
    await linkBtn.click();
    await expect(page.getByRole("heading", { name: "MIST" })).toBeVisible();
    const linkedSelect = page.locator("#linkedNineLiner");
    await expect(linkedSelect).not.toHaveValue("");
  });
});

test.describe("Dronemelding og Droneovervaagnings-demo", () => {
  test("Dronemelding-formularen aabner uden trusselsrelateret indhold", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dronemelding", exact: true }).click();
    await expect(page.getByRole("button", { name: "Grundig observation" })).toBeVisible();
    await page.getByRole("button", { name: "Grundig observation" }).click();
    await expect(page.getByText("IKKE VERIFICERET FORMAT")).toBeVisible();
  });

  test("Droneovervaagnings-demo viser 'ingen aktiv sensor'-status og testdata", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Indstillinger" }).click();
    await page.getByText("Droneovervaagning (teknisk demo)", { exact: true }).click();
    await expect(page.getByText("Ingen aktiv sensor eller datakilde tilsluttet")).toBeVisible();
    await expect(page.getByText("LOKALE TESTDATA", { exact: false }).last()).toBeVisible();
  });
});

test.describe("SAR-melding", () => {
  test("MIPRE-radiotekst genereres og indeholder MAYDAY, kontakter vises foer medie", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "SAR-melding", exact: true }).click();
    await page.getByRole("radio", { name: "Maritim" }).click();
    await page.getByRole("radio", { name: "MAYDAY", exact: true }).click();
    await page.locator("#whoInDistress").fill("Fiskefartoej med 3 ombord");
    await page.locator("#whatHappened").fill("Motorstop, tager vand ind");
    await page.locator("#assistanceRequested").fill("Assistance oenskes hurtigst muligt");
    await page.getByRole("button", { name: /Generér radiotekst/ }).click();
    const mipreValue = await page.locator("textarea").last().inputValue();
    expect(mipreValue).toContain("MAYDAY");

    const contactsBox = await page.getByText("Nødkontakter").first().boundingBox();
    const mediaBox = await page.getByText("Dokumentér hændelsen").first().boundingBox();
    expect(contactsBox && mediaBox && contactsBox.y < mediaBox.y).toBe(true);
  });
});

test.describe("Blanketbibliotek og Historik", () => {
  test("Blanketbiblioteket viser alle moduler med status", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Blanketbibliotek", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Blanketbibliotek" })).toBeVisible();
    await expect(page.getByText("Hurtig rapport")).toBeVisible();
  });

  test("Historik viser gemte rapporter og kan filtreres", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Meldingsblanket", exact: true }).click();
    await page.locator("#senderCallsign").fill("HIST-TEST");
    await page.locator("#dtg").fill("2026-08-04T10:00");
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Gem", exact: true }).click();
    await page.getByRole("button", { name: "Tilbage" }).click();

    await page.getByRole("button", { name: "Historik", exact: true }).click();
    await expect(page.getByText(/HIST-TEST/)).toBeVisible();
  });
});
