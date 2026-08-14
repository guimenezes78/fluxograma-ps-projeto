import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(repositoryRoot, "public", "manchester.html"), "utf8");
const dataStart = html.indexOf("const DATA = [");
const dataEnd = html.indexOf("const CASOS_DUVIDA = [", dataStart);

assert.notEqual(dataStart, -1, "bloco DATA deve existir");
assert.notEqual(dataEnd, -1, "fim do bloco DATA deve existir");

const context = {};
vm.createContext(context);
vm.runInContext(
  html.slice(dataStart, dataEnd).replace("const DATA =", "globalThis.DATA ="),
  context,
  { timeout: 1_000 },
);

const data = context.DATA;

test("inclui os quatro registros autorizados da matriz de 14-08", () => {
  assert.equal(data.length, 77);

  const newNames = data.slice(-4).map((item) => item.flux);
  assert.deepEqual(Array.from(newNames), [
    "Pós-colonoscopia ou pós-endoscopia",
    "Pós-colonoscopia ou pós-endoscopia",
    "Pós-operatório de cirurgia neurológica",
    "Pós-operatório de cirurgia cardíaca",
  ]);
});

test("distingue procedimento de sedacao sem duplicidade ambigua", () => {
  const postEndoscopy = data.filter((item) => item.flux === "Pós-colonoscopia ou pós-endoscopia");

  assert.equal(postEndoscopy.length, 2);
  assert.deepEqual(
    Array.from(postEndoscopy, ({ grupo, contexto, esp }) => ({ grupo, contexto, esp })),
    [
      {
        grupo: "Cirurgia Geral",
        contexto: "Sintomas relacionados ao procedimento",
        esp: "Cirurgia",
      },
      {
        grupo: "Clínica Médica",
        contexto: "Sintomas relacionados à sedação ou sem relação com o procedimento",
        esp: "Clínica Médica",
      },
    ],
  );

  assert.match(postEndoscopy[1].disc, /sintomas respiratórios/i);
  assert.match(postEndoscopy[1].disc, /sintomas urinários/i);
  assert.match(postEndoscopy[1].disc, /febre isolada/i);
  assert.match(postEndoscopy[1].just, /broncoaspiração/i);
});

test("mantem a regra validada para os pos-operatorios neuro e cardiaco", () => {
  for (const flow of [
    "Pós-operatório de cirurgia neurológica",
    "Pós-operatório de cirurgia cardíaca",
  ]) {
    const item = data.find((candidate) => candidate.flux === flow);
    assert.ok(item, `${flow} deve existir`);
    assert.equal(item.grupo, "Clínica Médica");
    assert.equal(item.esp, "Clínica/Pediatria/Cirurgia");
    assert.equal(item.ped, "Clínica/Pediatria");
    assert.match(item.obs, /Cirurgia se houver qualquer alteração na ferida operatória/i);
    assert.match(item.obs, /demais sintomas serão direcionados para Clínica ou Pediatria/i);
  }
});

test("corrige somente a ortografia dos quatro registros novos", () => {
  const serialized = JSON.stringify(data.slice(-4));
  assert.doesNotMatch(serialized, /distenção|peditria|\bClinica\b|Pós operatório/i);
});

test("exibe e pesquisa o contexto que diferencia os dois registros", () => {
  assert.match(html, /Interface v8/);
  assert.match(html, /class="flux-context"/);
  assert.match(html, /\(d\.contexto\|\|""\)/);
});
