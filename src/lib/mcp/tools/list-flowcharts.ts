import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { FLOWCHARTS } from "../data/flowcharts";

export default defineTool({
  name: "list_flowcharts",
  title: "Listar fluxogramas",
  description:
    "Lista os fluxogramas do Sistema Manchester com o grupo e a especialidade de encaminhamento. Aceita busca por texto livre e filtro por grupo ou especialidade.",
  inputSchema: {
    search: z.string().trim().optional().describe("Texto livre buscado no nome do fluxograma, discriminadores e especialidade."),
    grupo: z.string().trim().optional().describe("Filtra por grupo, ex.: 'Cardio', 'Neuro', 'Trauma'."),
    spec: z.string().trim().optional().describe("Filtra pela chave de especialidade, ex.: 'cirurgia', 'cardiologista'."),
    limit: z.number().int().min(1).max(100).optional().describe("Máximo de resultados (padrão 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ search, grupo, spec, limit }) => {
    const q = search?.toLowerCase();
    const rows = FLOWCHARTS.filter((f) => {
      if (grupo && !f.grupo.toLowerCase().includes(grupo.toLowerCase())) return false;
      if (spec && !f.spec.toLowerCase().includes(spec.toLowerCase())) return false;
      if (q && !`${f.flux} ${f.grupo} ${f.disc} ${f.esp}`.toLowerCase().includes(q)) return false;
      return true;
    }).slice(0, limit ?? 50);

    const items = rows.map((f) => ({ grupo: f.grupo, flux: f.flux, especialidade: f.esp, spec: f.spec }));
    return {
      content: [
        {
          type: "text" as const,
          text: items.length
            ? items.map((i) => `[${i.grupo}] ${i.flux} → ${i.especialidade}`).join("\n")
            : "Nenhum fluxograma encontrado para esse filtro.",
        },
      ],
      structuredContent: { count: items.length, items },
    };
  },
});
