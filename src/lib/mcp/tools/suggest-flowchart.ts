import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { FLOWCHARTS } from "../data/flowcharts";
import { AiConfigError, chatJson } from "../../ai/chat";

export default defineTool({
  name: "suggest_flowchart",
  title: "Sugerir fluxograma (IA)",
  description:
    "A partir de uma queixa inespecífica em texto livre, sugere o fluxograma Manchester mais adequado e a especialidade de encaminhamento. Não faz diagnóstico.",
  inputSchema: {
    symptoms: z.string().trim().min(3).describe("Queixa relatada pelo paciente, em texto livre."),
    age: z.number().int().min(0).max(120).optional().describe("Idade do paciente em anos."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ symptoms, age }) => {
    const list = FLOWCHARTS.map((c, i) => `${i + 1}. [${c.grupo}] ${c.flux} - discriminadores: ${c.disc}`).join("\n");
    const system =
      "Voce e enfermeira classificadora Manchester. Escolha o FLUXOGRAMA da lista. NAO diagnostique. JSON estrito: {flux,reason}.";
    const user = `Idade: ${age ?? "n/a"} anos. Queixa: "${symptoms}". Lista:
${list}`;
    let parsed: { flux?: string; reason?: string };
    try {
      parsed = await chatJson(system, user);
    } catch (e) {
      const msg = e instanceof AiConfigError
        ? e.message
        : (e instanceof Error ? e.message : String(e));
      return { content: [{ type: "text" as const, text: msg }], isError: true };
    }

    const match =
      FLOWCHARTS.find((c) => c.flux === parsed.flux) ??
      FLOWCHARTS.find((c) => parsed.flux && c.flux.toLowerCase().includes(parsed.flux.toLowerCase()));

    if (!match) {
      return { content: [{ type: "text" as const, text: "Não foi possível mapear a queixa a um fluxograma." }], isError: true };
    }

    const text = [
      `Fluxograma sugerido: ${match.flux} (${match.grupo})`,
      `Motivo: ${parsed.reason ?? "-"}`,
      `Discriminadores: ${match.disc}`,
      `Encaminhamento: ${match.esp}`,
      age !== undefined && age < 14 && match.ped ? `Pediatria: ${match.ped}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      content: [{ type: "text" as const, text }],
      structuredContent: { flux: match.flux, grupo: match.grupo, reason: parsed.reason ?? "", flowchart: match },
    };
  },
});
