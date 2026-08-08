# Fase B.1: card da aula e acoes rapidas

## Contexto

O painel diario e a principal superficie de uso no celular. A personal precisa tocar em uma aula e resolver rapidamente finalizacao, cancelamento, remanejamento ou consulta de detalhes.

## Mudanca

- `CartaoAulaDia` foi simplificado para leitura rapida na linha do tempo
- o menu de acoes foi separado em `AcoesAulaBottomSheet`
- aulas em andamento, proximas e pendentes de finalizacao ganharam destaque operacional
- o bottom sheet prioriza finalizacao quando a aula ja exige encerramento
- aulas individuais pulam a selecao de participante para cancelamento e remanejamento quando aplicavel
- dupla e trio preservam a escolha de participante ou grupo inteiro
- mensagens de aluno 5x indicam tratamento financeiro

## Impacto

A Fase B comeca por reduzir atrito no fluxo principal do dia sem alterar banco, migrations ou regras de negocio. A organizacao em componentes menores deixa a proxima melhoria do painel mais simples de revisar.

## Validacao esperada

- `npx tsc --noEmit`
- `npm run lint`
- homologacao visual no painel com aula individual, dupla/trio, aluno 5x e aula pendente de finalizacao
