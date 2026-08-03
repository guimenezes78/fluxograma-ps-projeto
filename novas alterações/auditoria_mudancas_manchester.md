# Auditoria do site atual + Solicitações de mudança da chefia

**Status:** documento de revisão — nenhuma alteração foi aplicada no projeto Lovable ainda.
Objetivo: alinhar o que existe hoje com o que a planilha institucional pede, antes de tocar no código.

---

## 1. O que existe hoje no site (`fluxograma ps` / manchester.html)

- App único (HTML/CSS/JS, sem banco de dados), embutido via iframe em `public/manchester.html`.
- **49 fluxogramas** cadastrados no array `DATA`, cada um com os campos: `flux` (nome), `spec` (1 categoria fixa, define cor/filtro), `disc` (discriminadores), `esp` (texto de especialidade — às vezes já cita mais de uma, mas só 1 chip aparece), `just` (justificativa clínica), `obs` (observações), `ped` (nota pediátrica específica do fluxo).
- Regra pediátrica é **global**: idade < corte etário (padrão 14 anos, configurável no topo) → Pediatra em 1ª linha, independente do fluxo.
- 4 abas: Leia primeiro · Mapa de encaminhamento · Simulador (com IA para queixa inespecífica) · Perguntas-chave.
- Não existem hoje: aba/seção de "Casos de dúvida", coluna de sinalização tipo "Atenção", nem múltiplos chips de especialidade por card.

## 2. O que a planilha da chefia traz (`matriz_direcionamento_manchester.xlsx`)

5 abas: Orientações · **Matriz_Fluxos** (74 linhas com conteúdo) · **Casos_Duvida** (14 situações específicas, ex.: "ferida no pé diabético", "dor testicular aguda") · Regras_Gerais · Listas (vocabulário padrão de especialidade/prioridade/status).

Colunas da Matriz_Fluxos: Fluxograma/Queixa · DUVIDAS (marcador ATENÇÃO) · Discriminador/dado crítico · Perguntas estratégicas na classificação · Especialidade inicial sugerida · Quando mudar/acionar outra especialidade · Contingência · Observações institucionais.

## 3. Mapeamento de campos pedido pela chefia (mensagem + print)

| Campo final no card | Fonte na planilha | Hoje no site | O que muda |
|---|---|---|---|
| Discriminador | "Discriminador / dado crítico a registrar" | `disc` | Conteúdo trocado pelo da planilha |
| Especialidade | "Especialidade inicial sugerida" | `esp` | **Mostrar todas as especialidades**, não só 1 chip (ver print: hoje só aparece "Cirurgião Geral" mesmo quando o texto cita 2) |
| Justificativa | "Perguntas estratégicas na classificação" | `just` | Muda de natureza: hoje é texto explicativo clínico → passa a ser as perguntas estratégicas |
| Observação | "Observações institucionais" | `obs` | Conteúdo trocado pelo da planilha |
| Se pediátrico | "Contingência" | `ped` | Conteúdo trocado pelo da planilha — **ver ressalva abaixo** |

## 4. Decisões já confirmadas

- ✅ Coluna **DUVIDAS/ATENÇÃO** da planilha → vira **badge visual** no card (mesmo padrão do badge "Novo" que já existe hoje).
- ✅ Filtro de especialidade passa a ser **multi-especialidade**: um card com "Cirurgia + Ortopedia" deve aparecer tanto no filtro de Cirurgia quanto no de Ortopedia (muda a lógica atual, que hoje usa 1 categoria fixa por fluxo).

## 5. Pontos em aberto — aguardando decisão antes de implementar

Estes dois pontos você pediu para deixar só registrados por ora, sem decidir:

1. **"Se pediátrico" ← "Contingência":** na planilha, "Contingência" parece funcionar como uma especialidade alternativa geral (não necessariamente pediátrica) — não tenho certeza de que o conteúdo dessa coluna sempre faz sentido como "nota pediátrica". Precisa de confirmação antes de aplicar essa troca 1:1.
2. **Coluna "Quando mudar/acionar outra especialidade":** não está nos 5 campos finais listados. Opções em aberto: juntar em Observação, virar campo próprio, ou descartar por enquanto.

## 6. Escopo de conteúdo ainda não decidido

- A planilha tem **74 fluxogramas** (vs. 49 no site atual) — inclui itens novos (ex.: Flebite, Bexigoma, Caroço, Trauma peniano, Epistaxe, Curativos, Drenos/sondas/ostomias, entre outros) e reformula vários já existentes com discriminadores/perguntas mais detalhados.
- Aba **Casos_Duvida** (14 situações, ex.: "Ferida aberta no pé em diabético", "Pós-operatório com dor na ferida") não tem equivalente no site — precisa decidir se vira uma 5ª aba, uma seção dentro do Mapa, ou fica de fora desta rodada.
- Abas **Regras_Gerais** e **Listas** trazem vocabulário padronizado (ex.: "Clínica Médica" em vez de "Clínico Geral", "Cirurgia Geral" em vez de "Cirurgião Geral") — impacta a nomenclatura de especialidades usada em todo o site, incluindo o `SPEC_META` e os filtros.

## 7. Ressalvas de precisão

- Nº de fluxogramas do Manchester varia por fonte (GBCR cita 53; a planilha institucional tem 74 linhas — é um protocolo institucional próprio, não uma contagem oficial do MTS).
- Os textos de discriminadores/perguntas da planilha são conteúdo fornecido pela sua chefia — não os validei contra o manual GBCR 2ª edição; a validação institucional segue sendo necessária antes de uso assistencial, como já consta no site atual.

---

**Próximo passo sugerido:** decidir os itens da seção 5 e 6, e então eu aplico as mudanças no Lovable em blocos (nomenclatura → especialidades múltiplas → badge Atenção → conteúdo novo dos 74 fluxogramas → Casos_Duvida), para você revisar incrementalmente.
