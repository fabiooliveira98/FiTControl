# Plano de fases

## Fases 1 a 3

Status: implementadas e migrations aplicadas.

- fundacao, SDD, autenticacao e UI base
- banco inicial e contratos
- catalogo semanal, faixa e excecoes por data

## Fase 4. Cadastro de alunos e rotina recorrente

Status: implementada e em homologacao continua.

- CRUD e pesquisa de alunos
- varios dias com um horario por dia
- individual, dupla e trio com capacidade

## Fase 5. Agenda operacional

Status: implementada e em homologacao continua.

- materializacao idempotente
- visao semanal e mensal
- livres, ocupados, bloqueados e conflitos

## Fase 6. Dashboard operacional

Status: implementada e evoluida para painel diario.

- metricas reais
- ranking e atalhos de reposicao
- visao diaria como entrada principal

## Fase 7. Cancelamentos e reposicoes

Status: implementada; acoes rapidas aguardam migration 270.

- cancelamento individual ou integral com motivo opcional
- regra automatica de aluno 5x
- sugestoes validas, confirmacao e remanejamento direto
- resolucao financeira alternativa

## Fase 8. Alteracoes permanentes de rotina

Status: implementada e migration aplicada.

- vigencia futura configuravel
- historico preservado
- cancelamento antes da vigencia
- aplicacao automatica de mudancas vencidas

## Fase 9. Financeiro basico

Status: implementada e migration aplicada.

- mensalidades, pagamentos e ajustes
- filtros e identificacao de atrasos
- resumo financeiro no cadastro do aluno
- ajuste vinculado a falta de aluno 5x

## Ciclo de otimizacao. Painel diario mobile

Status: implementado no codigo; migration e homologacao autenticada pendentes.

- `/painel` orientado ao dia atual e faixa navegavel da semana
- linha do tempo somente com aulas e horarios livres expansiveis
- acoes rapidas por bottom sheet para grupos e participantes
- remanejamento pontual resolvido sem criar pendencia
- finalizacao manual, por dia e automatica para datas anteriores
- navegacao movel fixa e pagina `/mais`
