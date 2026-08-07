# Modelagem do banco

## Tabelas do MVP

- `alunos`
- `disponibilidade_semanal`
- `bloqueios_agenda`
- `aberturas_agenda`
- `grupos_aula`
- `integrantes_grupos_aula`
- `horarios_recorrentes_alunos`
- `aulas`
- `alunos_aulas`
- `cancelamentos`
- `reposicoes`
- `mensalidades`
- `alteracoes_rotina_alunos`
- `itens_alteracao_rotina`

## Relacoes operacionais

- `disponibilidade_semanal` e um catalogo recorrente editavel, nao uma lista descartavel
- `aberturas_agenda` registra disponibilidade extra valida somente em uma data
- `bloqueios_agenda` registra indisponibilidade valida somente em uma data
- aluno possui uma ou mais rotinas em `horarios_recorrentes_alunos`
- cada rotina pertence a um `grupos_aula`
- integrantes atuais do grupo ficam em `integrantes_grupos_aula`
- `aulas` representa ocorrencias concretas das rotinas
- `alunos_aulas` preserva o snapshot de participantes por ocorrencia
- cancelamento aponta para aula e aluno
- reposicao aponta para o cancelamento e, quando confirmada, para a aula de destino
- alteracao de rotina aponta para o aluno, a data de vigencia e seu status
- itens de alteracao guardam o snapshot completo da nova semana
- rotina recorrente registra inicio, fim de vigencia e alteracao que a originou
- mensalidade pode apontar para o cancelamento que gerou um ajuste financeiro

## Regras protegidas no banco

- slots de disponibilidade, abertura, rotina e aula duram 1 hora
- horarios podem iniciar apenas em minuto `00` ou `30`
- rotinas de grupos diferentes nao podem se sobrepor no mesmo dia
- um aluno nao pode participar de aulas sobrepostas na mesma data
- grupo aceita entre 1 e 3 integrantes, conforme formato
- aula nunca aceita mais participantes confirmados que sua capacidade
- rotina ativa nao pode repetir aluno, dia e horario
- aluno nao pode possuir duas rotinas ativas no mesmo dia da semana
- cancelamento possui no maximo uma reposicao
- materializacao e idempotente por data, horario e grupo
- confirmacao de reposicao aceita faixa recorrente ativa ou abertura na data
- RLS permite operacoes somente para usuarios autenticados no MVP
- apenas uma mudanca agendada por aluno e data e permitida
- cada mudanca possui no maximo um horario por dia da semana
- cada cancelamento possui no maximo um lancamento de ajuste financeiro

## Funcoes

- `atualizar_updated_at`: mantem timestamps
- `validar_horario_uma_hora`: valida duracao
- `validar_capacidade_grupo`: bloqueia integrante acima da capacidade
- `validar_capacidade_aula`: bloqueia participante acima da capacidade
- `validar_inicio_meia_hora`: restringe inicios a minuto `00` ou `30`
- `validar_sobreposicao_rotina`: impede conflito entre rotinas fixas
- `validar_uma_rotina_aluno_por_dia`: limita cada aluno a uma rotina ativa por dia
- `validar_conflito_aluno_aula`: impede conflito de agenda do aluno
- `aplicar_faixa_disponibilidade`: atualiza varios dias e preserva slots ocupados
- `materializar_aulas_periodo`: cria ocorrencias e snapshots
- `cancelar_aula_aluno`: cancela participacao e cria pendencia quando aplicavel
- `confirmar_reposicao`: valida destino recorrente ou excepcional e agenda a reposicao
- `aplicar_alteracao_rotina`: troca a rotina na data correta e preserva a versao anterior
- `aplicar_alteracoes_rotina_pendentes`: processa mudancas vencidas sem bloquear as demais

## Migrations

1. `20260807113000_modelagem_inicial_fitcontrol.sql`: aplicada no Supabase
2. `20260807170000_fases_4_a_7_operacao_agenda.sql`: aplicada no Supabase em 07/08/2026
3. `20260807200000_intervalos_30_minutos.sql`: aplicada no Supabase em 07/08/2026
4. `20260807210000_catalogo_horarios_padrao.sql`: aplicada no Supabase em 07/08/2026
5. `20260807220000_uma_rotina_por_dia.sql`: regra incorporada pela migration de reparo
6. `20260807230000_reparar_materializacao_agenda.sql`: regra incorporada pela migration consolidada
7. `20260807240000_remover_trigger_profiles_legado.sql`: aplicada no Supabase em 07/08/2026
8. `20260807250000_fases_8_9_e_estabilizacao_agenda.sql`: aplicada no Supabase em 07/08/2026
9. `20260807260000_corrigir_selecao_uuid_materializacao.sql`: criada; aplicacao remota pendente

## Catalogo inicial

- 46 inicios por dia, de `00:00` a `22:30`
- 322 registros no total para os sete dias
- segunda a sexta ativos de `05:00` a `20:00`
- antes de `05:00`, depois de `20:00` e fins de semana inicialmente inativos
- `on conflict do nothing` preserva configuracoes ja existentes

## Autenticacao

- `auth.users` e mantida pelo Supabase Auth
- o MVP de uma unica personal nao precisa duplicar usuarios no schema publico
- triggers legados de `auth.users` que dependam de `public.profiles` devem ser removidos
