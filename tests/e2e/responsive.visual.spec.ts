import { expect, test } from "@playwright/test";

const expectedTabs = [
  "Leia primeiro",
  "Mapa de encaminhamento",
  "Perguntas-chave",
  "Casos de dúvida",
];

test("mantem o mapa utilizavel e sem overflow", async ({ page }, testInfo) => {
  await page.goto("/");

  const app = page.frameLocator('iframe[title="Sistema Manchester · Encaminhamento"]');
  const status = app.getByRole("status").filter({ hasText: "fluxogramas" });
  const tabs = app.getByRole("tab");

  await expect(app.getByRole("heading", { name: "Sistema Manchester" })).toBeVisible();
  await expect(status).toHaveText("77 de 77 fluxogramas");
  await expect(tabs).toHaveCount(expectedTabs.length);
  expect(await tabs.allTextContents()).toEqual(expectedTabs);
  await expect(app.getByRole("tab", { name: "Simulador" })).toHaveCount(0);

  const outerLayout = await page.locator("html").evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  const appLayout = await app.locator("html").evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));

  expect(outerLayout.scrollWidth).toBeLessThanOrEqual(outerLayout.clientWidth + 1);
  expect(appLayout.scrollWidth).toBeLessThanOrEqual(appLayout.clientWidth + 1);

  if (testInfo.project.name === "mobile-chromium") {
    await expect(app.getByRole("button", { name: "Configurações" })).toBeVisible();
  } else {
    await expect(app.getByRole("spinbutton", { name: /Idade de corte pediátrico/ })).toBeVisible();
  }

  await app.getByRole("searchbox", { name: "Buscar" }).fill("colonoscopia");
  await expect(status).toHaveText("2 de 77 fluxogramas");
  await expect(
    app.getByText("Sintomas relacionados ao procedimento", { exact: true }),
  ).toBeVisible();
  await expect(
    app.getByText("Sintomas relacionados à sedação ou sem relação com o procedimento", {
      exact: true,
    }),
  ).toBeVisible();

  const screenshotPath = testInfo.outputPath(`manchester-${testInfo.project.name}.png`);
  await page.screenshot({ animations: "disabled", path: screenshotPath });
  await testInfo.attach(`interface-${testInfo.project.name}`, {
    contentType: "image/png",
    path: screenshotPath,
  });
});
