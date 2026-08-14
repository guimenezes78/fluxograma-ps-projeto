# Protecao do conteudo oficial

Os blocos `DATA`, `CASOS_DUVIDA` e `PERGUNTAS` de `public/manchester.html`
reproduzem a matriz institucional fornecida pela chefia e sao tratados como
conteudo somente leitura.

Alteracoes de interface, acessibilidade, desempenho ou estrutura tecnica nao
podem modificar textos, ordem, campos, especialidades, discriminadores,
perguntas, observacoes ou regras presentes nesses blocos.

O comando `npm run verify:content` compara o conteudo com hashes SHA-256 e
interrompe testes e builds quando encontra qualquer divergencia. O arquivo
`content-lock.json` so deve ser atualizado quando houver uma solicitacao
explicita de alteracao da matriz oficial.

## Atualizacao autorizada em 14/08/2026

Foram incorporadas as linhas 76 a 79 da aba `Matriz_Fluxos` da planilha
`matriz_direcionamento_manchester 14-08.xlsx`, conforme validacao da chefia:

- dois registros de pos-colonoscopia ou pos-endoscopia, diferenciados entre
  sintomas relacionados ao procedimento e sintomas relacionados a sedacao ou
  sem relacao com o procedimento;
- pos-operatorio de cirurgia neurologica;
- pos-operatorio de cirurgia cardiaca;
- correcoes exclusivamente ortograficas nos quatro novos registros;
- perguntas adicionais autorizadas para sintomas respiratorios, urinarios,
  febre isolada e efeitos da sedacao.
