# Plano de fases

## Fases 1 a 3

Status: implementadas. Migration inicial aplicada; validação operacional contínua.

- fundação, SDD, autenticação e UI base
- banco inicial e contratos
- catalogo semanal, aplicacao de faixa e excecoes por data

## Fase 4. Cadastro de alunos e rotina recorrente

Status: implementada; migration aplicada e homologação funcional pendente.

- CRUD e pesquisa de alunos
- múltiplos dias e horários
- individual, dupla e trio com capacidade

## Fase 5. Agenda operacional

Status: implementada; migration aplicada e homologação funcional pendente.

- materialização idempotente
- visão semanal e mensal
- livres, ocupados, bloqueados e conflitos

## Fase 6. Dashboard operacional

Status: implementada; migration aplicada e homologação funcional pendente.

- período semana/mês
- métricas reais
- ranking e atalhos de reposição

## Fase 7. Cancelamentos e reposições

Status: implementada; migration aplicada e homologação funcional pendente.

- cancelamento individual com motivo opcional
- regra automática de aluno 5x
- sugestões válidas e confirmação
- resolução financeira alternativa

## Fase 8. Alterações permanentes de rotina

Status: implementada no código; migration e homologação pendentes.

- vigência futura configurável
- histórico preservado
- cancelamento de mudança antes da vigência
- aplicação automática ao abrir agenda ou dashboard

## Fase 9. Financeiro básico

Status: implementada no código; migration e homologação pendentes.

- mensalidades, pagamentos e ajustes
- filtros por status e identificação automática de atrasos
- resumo financeiro no cadastro do aluno
- ajuste vinculado a falta de aluno 5x
