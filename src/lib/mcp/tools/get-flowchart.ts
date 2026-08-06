import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { FLOWCHARTS } from "../data/flowcharts";

export default defineTool({
  name: "get_flowchart",
  title: "Detalhar fluxograma",
  description:
    "Retorna o detalhe completo de um fluxograma do Sistema Manchester: discriminadores, especialidade de encaminhamento, perguntas estratégicas, observação institucional e contingência.",
  inputSchema: {
    flux: z.string().trim().min(1).describe("Nome (ou parte do nome) do fluxograma, ex.: 'Dor torácica'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ flux }) => {
    const needle = flux.toLowerCase();
    const f =
      FLOWCHARTS.find((x) => x.flux.toLowerCase() === needle) ??
      FLOWCHARTS.find((x) => x.flux.toLowerCase().includes(needle));

    if (!f) {
      return {
        content: [{ type: "text" as const, text: `Fluxograma "${flux}" não encontrado. Use list_flowcharts para ver as opções.` }],
        isError: true,
      };
    }

    const text = [
      `Fluxograma: ${f.flux}`,
      `Grupo: ${f.grupo}`,
      `Discriminadores: ${f.disc}`,
      `Encaminhamento: ${f.esp}`,
      `Perguntas estratégicas: ${f.just}`,
      f.obs ? `Observação institucional: ${f.obs}` : null,
      f.ped ? `Contingência: ${f.ped}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return { content: [{ type: "text" as const, text }], structuredContent: { flowchart: f } };
  },
});
