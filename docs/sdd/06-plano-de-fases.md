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

## Novo ciclo. Evolucao SaaS, UX e IA

Status: planejado e documentado; sem implementacao de codigo ou banco iniciada.

Roteiro central: `docs/sdd/roadmap/2026-08-evolucao-saas-ux-ia.md`.

### Fase A. Documentacao da evolucao

Objetivo: registrar a trilha aprovada antes de alterar codigo ou banco.

- atualizar SDD com arquitetura atual, arquitetura alvo e riscos
- documentar isolamento por `personal_id`
- documentar portal simples do aluno por convite
- registrar IA e WhatsApp como visao futura

### Fase B. Melhorias de UI e reducao de atrito

Objetivo: melhorar o uso diario com menor risco tecnico.

- refinar `/painel` como tela principal no celular
- reduzir cliques para cancelar, remanejar e finalizar aulas
- melhorar leitura dos cards, estados e horarios livres
- revisar cadastro e edicao de rotina do aluno
- preservar desktop robusto para semana e mes

### Fase C. Isolamento SaaS por personal

Objetivo: preparar o sistema para que cada personal acesse somente os proprios dados.

- adicionar `personal_id` nas tabelas operacionais
- atribuir dados existentes ao usuario atual da personal
- trocar RLS ampla por RLS baseada em `auth.uid() = personal_id`
- revisar RPCs, queries e actions para respeitar o dono dos dados
- testar isolamento com duas contas de personal

### Fase D. Portal simples do aluno por convite

Objetivo: permitir consulta limitada pelo aluno sem expor a agenda interna da personal.

- criar vinculo de acesso entre usuario autenticado e aluno
- usar convite/link como entrada inicial
- permitir somente leitura das proprias aulas, reposicoes e cancelamentos
- manter queries e telas separadas das telas internas da personal

### Fase E. IA e WhatsApp como roadmap futuro

Objetivo: registrar possibilidades de automacao antes de implementar integracoes externas.

- interpretar mensagens para cancelar, consultar e reagendar aulas
- exigir confirmacao antes de mudancas sensiveis
- registrar auditoria de toda acao feita por assistente
- executar somente depois do isolamento SaaS estar seguro
