# Decisões arquiteturais

## DA-001 — SDD como fonte oficial

- data: 07/08/2026
- contexto: evitar que planejamento, implementação e banco sigam caminhos diferentes
- decisão: centralizar a verdade do projeto em `docs/sdd`
- impacto: toda entrega deve atualizar os documentos afetados

## DA-002 — Banco e actions em português BR

- data: 07/08/2026
- contexto: alinhar domínio técnico com a linguagem operacional da personal
- decisão: tabelas, colunas principais e actions de negócio em português BR
- impacto: melhora legibilidade do domínio e exige consistência de nomenclatura

## DA-003 — Mobile forte sem rebaixar desktop

- data: 07/08/2026
- contexto: sistema será usado com frequência em celular, mas também exigirá visão ampla no desktop
- decisão: interface responsiva com prioridade real para ambos os contextos
- impacto: componentes e layout precisam nascer adaptáveis desde a base

## DA-004 — Aulas materializadas por período

- data: 07/08/2026
- contexto: cancelamentos e reposições precisam apontar para ocorrências concretas
- decisão: materializar rotinas com função idempotente antes da leitura operacional
- impacto: histórico fica estável e semana/mês compartilham a mesma fonte

## DA-005 — Operações críticas atômicas no banco

- data: 07/08/2026
- contexto: cancelar e remarcar alteram várias tabelas relacionadas
- decisão: usar funções PostgreSQL transacionais para cancelamento, materialização e confirmação
- impacto: evita pendências ou aulas parcialmente gravadas

## DA-006 — Grupo definido no primeiro uso do slot

- data: 07/08/2026
- contexto: um horário pode ser individual, dupla ou trio
- decisão: o primeiro aluno define a capacidade; os próximos apenas ocupam vagas existentes
- impacto: cadastro continua rápido e a lotação fica previsível

## DA-007 — Inícios em intervalos de 30 minutos

- data: 07/08/2026
- contexto: a personal possui aulas como `13:30–14:30`, além de horários em hora cheia
- decisão: manter duração de 1 hora e permitir inícios em minuto `00` ou `30`
- impacto: disponibilidade deixa de ser comparada apenas pelo início e passa a usar sobreposição de intervalos

## DA-008 - Catalogo recorrente e excecoes por data

- data: 07/08/2026
- contexto: cadastrar cada horario manualmente e desgastante e nao escala para um produto SaaS
- decisao: semear todos os inicios validos, aplicar uma faixa semanal em lote e separar aberturas/bloqueios pontuais da rotina
- impacto: o onboarding fica rapido, horarios nunca precisam ser recriados e um almoco pode ser aberto em uma unica data
- limite do MVP: o catalogo termina em `22:30` para que sessoes de uma hora nao atravessem a meia-noite

## DA-009 - Painel diario e remanejamento resolvido

- data: 07/08/2026
- contexto: durante o atendimento, a personal precisa agir sobre a aula atual com poucos toques
- decisao: `/painel` prioriza o dia; semana/mes ficam em `/agenda`; remanejamento pontual registra origem e destino no mesmo fluxo
- impacto: a operacao movel fica direta e remanejamentos confirmados nao poluem a fila de pendencias

## DA-010 - Finalizacao tardia sem cron

- data: 07/08/2026
- contexto: a personal pode esquecer de finalizar aulas ou encerrar o dia
- decisao: concluir aulas anteriores na proxima abertura autenticada e manter botao manual para o dia atual
- impacto: o historico converge sem infraestrutura de agendamento e continua aceitando correcoes retroativas
