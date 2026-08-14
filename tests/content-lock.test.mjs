import assert from "node:assert/strict";
import test from "node:test";

import { verifyContentLock } from "../scripts/verify-content-lock.mjs";

test("preserva integralmente o conteudo oficial da matriz", () => {
  const result = verifyContentLock();

  assert.deepEqual(result.counts, {
    DATA: 77,
    CASOS_DUVIDA: 14,
    PERGUNTAS: 6,
  });
});
