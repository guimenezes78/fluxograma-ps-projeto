import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(repositoryRoot, "public", "manchester.html"), "utf8");
const rootRoute = fs.readFileSync(path.join(repositoryRoot, "src", "routes", "__root.tsx"), "utf8");

test("declara portugues brasileiro nas duas camadas do documento", () => {
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(rootRoute, /<html lang="pt-BR">/);
});

test("oferece atalho para pular ao conteudo principal", () => {
  assert.match(html, /<a class="skip-link" href="#mainContent">/);
  assert.match(html, /<main id="mainContent" tabindex="-1">/);
});

test("relaciona todas as tabs aos respectivos paineis", () => {
  const views = ["leia", "mapa", "perguntas", "casos"];
  for (const view of views) {
    assert.match(
      html,
      new RegExp(`id="tab-${view}"[^>]+aria-controls="view-${view}"`),
      `tab ${view} deve controlar seu painel`,
    );
    assert.match(
      html,
      new RegExp(`id="view-${view}"[^>]+aria-labelledby="tab-${view}"`),
      `painel ${view} deve ser nomeado por sua tab`,
    );
  }
});

test("anuncia erros de configuracao e resultados da busca", () => {
  assert.match(html, /class="form-error" id="corteError" role="status" aria-live="polite"/);
  assert.match(html, /id="count" role="status" aria-live="polite"/);
});

test("respeita reducao de movimento e evita fonte externa bloqueante", () => {
  assert.match(html, /@media \(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
});
