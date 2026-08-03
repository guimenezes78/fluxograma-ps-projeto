import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { FLOWCHARTS } from "../data/flowcharts";

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
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return { content: [{ type: "text" as const, text: "IA indisponível: LOVABLE_API_KEY não configurada." }], isError: true };
    }

    const list = FLOWCHARTS.map((c, i) => `${i + 1}. [${c.grupo}] ${c.flux} — discriminadores: ${c.disc}`).join("\n");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "raw-fetch" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              'Você é uma enfermeira classificadora do Sistema Manchester (MTS/GBCR). Escolha o FLUXOGRAMA mais adequado a partir de uma queixa inespecífica, dentro de uma lista fixa. NÃO faça diagnóstico. Responda APENAS JSON estrito: {"flux":"<nome exato da lista>","reason":"<1-2 frases em português>"}',
          },
          {
            role: "user",
            content: `Idade do paciente: ${age ?? "não informada"} anos.\nQueixa: "${symptoms}"\n\nEscolha UM fluxograma da lista (copie o nome exatamente):\n${list}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      return { content: [{ type: "text" as const, text: `Erro na IA (${resp.status}).` }], isError: true };
    }

    const data = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
    let parsed: { flux?: string; reason?: string } = {};
    try {
      parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
    } catch {
      parsed = {};
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
