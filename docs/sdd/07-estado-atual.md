# Estado atual

## Ultimo checkpoint

- data: 07/08/2026
- fase atual: Fases 1 a 9 implementadas no codigo
- status geral: Fases 8 e 9 aguardam migration consolidada e homologacao funcional

## Implementado

- cadastro, edicao, pesquisa e arquivamento logico de alunos
- multiplas rotinas por aluno com slots disponiveis
- grupos individual, dupla e trio com limite de capacidade
- agenda semanal e mensal navegavel
- materializacao de aulas recorrentes
- dashboard com metricas, livres, bloqueios e ranking real
- cancelamento por participante com motivo opcional
- regra 5x direcionada para ajuste financeiro
- fila, sugestoes e confirmacao de reposicoes
- catalogo semanal completo com inicios a cada 30 minutos
- faixa configuravel para varios dias com padrao `05:00-20:00`
- ajuste individual sem exclusao de registros e protecao de horarios ocupados
- abertura ou bloqueio excepcional por data
- deteccao de sobreposicao aplicada a cadastro, agenda e reposicoes
- cadastro de rotina otimizado por dia, com apenas horarios utilizaveis visiveis
- confirmacao pos-cadastro e identificacao dos alunos nos horarios ocupados
- limite de um horario recorrente por dia aplicado na interface e no Zod
- testes de integracao do cadastro com horario livre e recusa de grupo individual lotado
- limpeza segura baseada somente nos IDs e marcadores criados pelos testes
- migration segura para remover trigger legado de `auth.users` dependente de `public.profiles`
- cadastro de aluno preservado mesmo quando a sincronizacao da agenda falha
- materializacao estabilizada e autocorrecao de duplicidades legadas
- alteracoes permanentes com vigencia futura, cancelamento e historico
- aplicacao automatica de mudancas vencidas ao abrir agenda ou dashboard
- financeiro com lancamentos, filtros, pagamentos e identificacao de atrasos
- ajustes financeiros vinculados a faltas de alunos 5x
- resumo financeiro dentro do cadastro do aluno

## Validacao concluida

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- rotas e contratos TypeScript sem erros
- migrations de intervalos e catalogo confirmadas como aplicadas no Supabase
- protecao de rota validada no navegador local sem erros de console
- scripts de teste validados estaticamente; execucao no Supabase depende do usuario exclusivo de teste

## Pendente para homologacao

- executar `supabase/migrations/20260807260000_corrigir_selecao_uuid_materializacao.sql`
- cadastrar um aluno e confirmar suas aulas na semana e no painel
- programar uma mudanca de rotina futura e validar a aplicacao na data
- criar mensalidade, marcar pagamento e registrar ajuste de aluno 5x
- confirmar que rotinas duplicadas antigas foram desativadas e a agenda voltou a materializar
- confirmar 322 registros em `disponibilidade_semanal`
- validar segunda a sexta `05:00-20:00` ativos e demais inativos
- aplicar nova faixa a varios dias e testar fechamento de um dia
- abrir um almoco em uma data e confirmar que aparece na agenda/reposicoes
- bloquear um compromisso e confirmar prioridade sobre encaixes
- validar `13:30-14:30`: `13:00` e `14:00` indisponiveis; `14:30` livre
- cadastrar aluno individual, dupla e trio e validar limite de capacidade
- configurar `FITCONTROL_TEST_EMAIL` e `FITCONTROL_TEST_PASSWORD` e executar o teste de integracao

## Proxima etapa

- homologacao das Fases 1 a 9 e ciclo de otimizacao de experiencia e desempenho
