import { createFileRoute } from "@tanstack/react-router";

type Body = {
  age?: number;
  symptoms?: string;
  catalog?: { grupo: string; flux: string; disc: string }[];
};

export const Route = createFileRoute("/api/triage-route")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return Response.json({ error: "NO_AI_KEY", fallback: true }, { status: 503 });

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
          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": key,
              "X-Lovable-AIG-SDK": "raw-fetch",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: system },
                { role: "user", content: user },
              ],
              response_format: { type: "json_object" },
            }),
          });

          if (!resp.ok) {
            const t = await resp.text();
            return new Response(t || "Gateway error", { status: resp.status });
          }
          const data = (await resp.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const content = data.choices?.[0]?.message?.content ?? "{}";
          let parsed: { flux?: string; reason?: string } = {};
          try {
            parsed = JSON.parse(content);
          } catch {
            parsed = {};
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
              raw: content,
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