import { createFileRoute } from "@tanstack/react-router";
import { AiConfigError, chatJson } from "../../lib/ai/chat";

type Body = {
  age?: number;
  symptoms?: string;
  catalog?: { grupo: string; flux: string; disc: string }[];
};

export const Route = createFileRoute("/api/triage-route")({
  server: {
    handlers: {
      POST: async ({ request }) => {

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const { age, symptoms, catalog } = body;
        if (!symptoms || !Array.isArray(catalog) || catalog.length === 0) {
          return new Response("Missing symptoms or catalog", { status: 400 });
        }

        const list = catalog
          .map((c, i) => `${i + 1}. [${c.grupo}] ${c.flux} — discriminadores: ${c.disc}`)
          .join("\n");

        const system = `Você é uma enfermeira classificadora do Sistema Manchester (MTS/GBCR). Sua tarefa é escolher o FLUXOGRAMA mais adequado a partir de uma queixa inespecífica do paciente, dentro de uma lista fixa. NÃO faça diagnóstico. Responda APENAS em JSON estrito, sem markdown, no formato:
{"flux":"<nome exato do fluxograma da lista>","reason":"<1-2 frases curtas justificando a escolha em português>"}`;

        const user = `Idade do paciente: ${age ?? "não informada"} anos.
Queixa relatada: "${symptoms}"

Escolha UM fluxograma da lista abaixo (copie o nome exatamente como aparece após o grupo):
${list}

Regra: se a queixa envolver risco de vida óbvio (via aérea, hemorragia grave, rebaixamento), prefira o fluxograma correspondente. Se for algo geral/vago em adulto, use "Estado geral do adulto doente / indisposição"; em criança use "Estado geral da criança doente / indisposição".`;

        try {
          let parsed: { flux?: string; reason?: string };
          try {
            parsed = await chatJson(system, user);
          } catch (e) {
            if (e instanceof AiConfigError) {
              return Response.json({ error: "NO_AI_KEY", fallback: true, message: e.message }, { status: 503 });
            }
            throw e;
          }

          // Match against catalog to guarantee a valid flux
          const match =
            catalog.find((c) => c.flux === parsed.flux) ||
            catalog.find(
              (c) => parsed.flux && c.flux.toLowerCase().includes(parsed.flux.toLowerCase()),
            );

          if (!match) {
            return Response.json({
              error: "Não foi possível mapear a resposta da IA a um fluxograma.",
              raw: parsed,
            }, { status: 200 });
          }

          return Response.json({
            grupo: match.grupo,
            flux: match.flux,
            reason: parsed.reason ?? "",
          });
        } catch (e) {
          return new Response(
            "Falha ao consultar IA: " + (e instanceof Error ? e.message : String(e)),
            { status: 500 },
          );
        }
      },
    },
  },
});