import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "package.json"), "utf8"));
const playwrightConfig = fs.readFileSync(path.join(repositoryRoot, "playwright.config.ts"), "utf8");
const responsiveSpec = fs.readFileSync(
  path.join(repositoryRoot, "tests", "e2e", "responsive.visual.spec.ts"),
  "utf8",
);
const workflowPath = path.join(repositoryRoot, ".github", "workflows", "responsive.yml");

test("oferece um comando reproduzivel para a verificacao responsiva", () => {
  assert.equal(packageJson.scripts["test:responsive"], "playwright test");
  assert.equal(packageJson.devDependencies["@playwright/test"], "1.62.1");
});

test("fixa os breakpoints desktop e mobile no Chromium", () => {
  assert.match(playwrightConfig, /name: "desktop-chromium"/);
  assert.match(playwrightConfig, /width: 1440, height: 1000/);
  assert.match(playwrightConfig, /name: "mobile-chromium"/);
  assert.match(playwrightConfig, /width: 390, height: 844/);
  assert.match(playwrightConfig, /serviceWorkers: "block"/);
  assert.match(playwrightConfig, /screenshot: "only-on-failure"/);
});

test("verifica overflow e produz evidencia visual", () => {
  assert.match(responsiveSpec, /scrollWidth/);
  assert.match(responsiveSpec, /page\.screenshot/);
  assert.match(responsiveSpec, /testInfo\.attach/);
});

test("executa no CI e preserva os artefatos mesmo quando houver falha", () => {
  assert.equal(fs.existsSync(workflowPath), true, "workflow responsivo deve existir");
  const workflow = fs.readFileSync(workflowPath, "utf8");

  assert.match(workflow, /bun install --frozen-lockfile/);
  assert.match(workflow, /playwright install --with-deps chromium/);
  assert.match(workflow, /bun run test:responsive/);
  assert.match(workflow, /if: always\(\)/);
  assert.match(workflow, /playwright-report\//);
  assert.match(workflow, /test-results\//);
});
