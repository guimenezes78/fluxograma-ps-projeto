import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(repositoryRoot, "public", "manchester.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(repositoryRoot, "public", "sw.js"), "utf8");
const triageRoutePath = path.join(repositoryRoot, "src", "routes", "api", "triage-route.ts");

test("remove o simulador da navegacao e da interface", () => {
  assert.doesNotMatch(html, /id="tab-sim"|id="view-sim"|>Simulador</);
  assert.doesNotMatch(html, /SIMULADOR|simPanel|simState|renderSim|\/api\/triage-route/);
  assert.doesNotMatch(html, /class="[^"]*sim-|\.sim-|\.re-btn/);
});

test("remove o endpoint exclusivo do simulador", () => {
  assert.equal(fs.existsSync(triageRoutePath), false);
});

test("preserva o mapa oficial e renova a versao do aplicativo", () => {
  assert.match(html, /id="tab-mapa"/);
  assert.match(html, /id="view-mapa"/);
  assert.match(html, /Interface v8/);
  assert.match(serviceWorker, /manchester-huvr-v8/);
});
