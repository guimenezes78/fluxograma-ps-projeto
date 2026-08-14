import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = path.join(repositoryRoot, "content-lock.json");

const definitions = [
  ["DATA", "const DATA = [", "const CASOS_DUVIDA = ["],
  ["CASOS_DUVIDA", "const CASOS_DUVIDA = [", "const PERGUNTAS = ["],
  ["PERGUNTAS", "const PERGUNTAS = [", "/* ---------- Render ---------- */"],
];

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function extractBlocks(html) {
  return Object.fromEntries(
    definitions.map(([name, startMarker, endMarker]) => {
      const start = html.indexOf(startMarker);
      const end = html.indexOf(endMarker, start + startMarker.length);
      if (start < 0 || end < 0) {
        throw new Error(`Nao foi possivel localizar o bloco protegido ${name}.`);
      }
      return [name, html.slice(start, end)];
    }),
  );
}

function evaluateProtectedContent(blocks) {
  const context = {};
  vm.createContext(context);
  const source = definitions
    .map(([name]) => blocks[name].replace(`const ${name} =`, `globalThis.${name} =`))
    .join("\n");
  vm.runInContext(source, context, { timeout: 1_000 });
  return context;
}

export function verifyContentLock() {
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  const sourcePath = path.join(repositoryRoot, lock.source);
  const html = fs.readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");
  const blocks = extractBlocks(html);
  const protectedContent = evaluateProtectedContent(blocks);
  const failures = [];

  for (const [name] of definitions) {
    const actualHash = sha256(blocks[name]);
    const actualCount = protectedContent[name]?.length;
    if (actualHash !== lock.sha256[name]) {
      failures.push(`${name}: hash esperado ${lock.sha256[name]}, encontrado ${actualHash}`);
    }
    if (actualCount !== lock.counts[name]) {
      failures.push(`${name}: quantidade esperada ${lock.counts[name]}, encontrada ${actualCount}`);
    }
  }

  const combinedHash = sha256(definitions.map(([name]) => blocks[name]).join("\n"));
  if (combinedHash !== lock.sha256.combined) {
    failures.push(`combined: hash esperado ${lock.sha256.combined}, encontrado ${combinedHash}`);
  }

  const requiredFlowchartFields = ["grupo", "flux", "disc", "esp", "just"];
  protectedContent.DATA.forEach((item, index) => {
    for (const field of requiredFlowchartFields) {
      if (typeof item[field] !== "string") {
        failures.push(`DATA[${index}].${field}: campo obrigatorio ausente ou invalido`);
      }
    }
  });

  if (failures.length > 0) {
    throw new Error(
      `Conteudo oficial alterado sem atualizacao autorizada do lock:\n- ${failures.join("\n- ")}`,
    );
  }

  return {
    counts: Object.fromEntries(definitions.map(([name]) => [name, protectedContent[name].length])),
    combinedHash,
  };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = verifyContentLock();
  console.log(
    `Conteudo oficial preservado: ${result.counts.DATA} fluxogramas, ` +
      `${result.counts.CASOS_DUVIDA} casos de duvida e ${result.counts.PERGUNTAS} secoes de perguntas.`,
  );
}
