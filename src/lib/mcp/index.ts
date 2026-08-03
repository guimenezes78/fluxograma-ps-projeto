import { defineMcp } from "@lovable.dev/mcp-js";
import listFlowcharts from "./tools/list-flowcharts";
import getFlowchart from "./tools/get-flowchart";
import suggestFlowchart from "./tools/suggest-flowchart";

export default defineMcp({
  name: "manchester-triagem-mcp",
  title: "Sistema Manchester · Encaminhamento",
  version: "0.1.0",
  instructions:
    "Ferramentas de consulta ao Sistema Manchester de classificação de risco e encaminhamento por especialidade. Use `list_flowcharts` para navegar/buscar fluxogramas, `get_flowchart` para o detalhe completo (discriminadores, especialidade, conduta pediátrica) e `suggest_flowchart` para mapear uma queixa em texto livre a um fluxograma. Material de apoio — não substitui avaliação clínica presencial.",
  tools: [listFlowcharts, getFlowchart, suggestFlowchart],
});
