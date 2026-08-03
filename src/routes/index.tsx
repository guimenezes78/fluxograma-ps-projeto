import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Manchester · Encaminhamento por Especialidade" },
      {
        name: "description",
        content:
          "Protocolo institucional interativo de apoio à classificação de risco Manchester, com mapa de encaminhamento por especialidade e perguntas-chave.",
      },
      { property: "og:title", content: "Manchester · Encaminhamento por Especialidade" },
      {
        property: "og:description",
        content:
          "Mapa interativo de encaminhamento baseado no Sistema Manchester (GBCR).",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/manchester.html"
      title="Sistema Manchester · Encaminhamento"
      className="fixed inset-0 h-screen w-screen border-0"
    />
  );
}
