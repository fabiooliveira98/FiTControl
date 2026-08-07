# Painel diario mobile e acoes rapidas

## Motivo

O uso principal ocorre no celular durante o atendimento. O dashboard anterior priorizava metricas semanais e exigia navegacao demais para agir sobre a aula atual.

## Impacto no produto

- `/painel` passa a abrir no dia atual
- a personal consulta a semana sem sair do contexto diario
- tocar em uma aula permite remanejar, cancelar, finalizar ou abrir detalhes
- duplas e trios aceitam acao individual ou integral
- horarios livres permanecem ocultos ate serem solicitados
- semana e mes continuam organizados em `/agenda`

## Impacto tecnico

- novos contratos `DadosPainelHoje`, `AulaDoDia`, `TipoCancelamento` e estados de acao
- novo `BottomSheet` reutilizavel e navegacao inferior mobile
- migration 270 com colunas de finalizacao e RPCs atomicas
- remanejamento direto gera cancelamento `REMANEJAMENTO` e reposicao `CONFIRMADA`
- finalizacao atrasada ocorre na proxima abertura, sem cron

## Arquivos SDD atualizados

- `02-regras-de-negocio.md`
- `03-arquitetura-aplicacao.md`
- `04-modelagem-banco.md`
- `05-ui-design-system.md`
- `06-plano-de-fases.md`
- `07-estado-atual.md`

## Status

Implementado no codigo em 07/08/2026. Migration e homologacao autenticada pendentes.
