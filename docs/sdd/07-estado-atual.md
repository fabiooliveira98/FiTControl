# Estado atual

## Ultimo checkpoint

- data: 08/08/2026
- fase atual: planejamento de evolucao SaaS, UX e IA
- status geral: ciclo documentado; sem implementacao de codigo ou banco iniciada neste ciclo

## Produto implementado

- Fases 1 a 9 disponiveis no codigo
- cadastro de alunos, rotinas, grupos individual/dupla/trio e mudancas permanentes
- mudancas de rotina podem ser aplicadas no mesmo dia ou programadas para uma data futura
- agenda semanal e mensal com catalogo de 30 minutos, bloqueios e aberturas
- cancelamentos, reposicoes pendentes, sugestoes e ajustes para alunos 5x
- financeiro basico com mensalidades, pagamentos e ajustes
- painel diario com faixa semanal, proxima aula, restantes e horarios livres
- linha do tempo com acoes de remanejar, cancelar, finalizar e consultar detalhes
- selecao individual ou integral em dupla e trio
- remanejamento pontual confirmado sem entrar na fila de pendencias
- finalizacao manual, encerramento do dia e conclusao automatica de dias anteriores
- navegacao movel fixa e menu lateral completo no desktop
- landing comercial responsiva com proposta de valor e previa animada da agenda
- login integrado a identidade comercial, com formulario prioritario no mobile
- Fase B.1 iniciada com card de aula mais limpo e bottom sheet de acoes rapidas reorganizado
- Fase B.2 adicionada com historico recente de rotina e textos mais claros sobre vigencia

## Banco

- migrations `113000` ate `260000` aplicadas no Supabase
- migration `20260807270000_painel_diario_e_acoes_rapidas.sql` criada e pendente
- migration 270 adiciona tipo de cancelamento, finalizacao e cinco RPCs operacionais
- isolamento por `personal_id` planejado para fase futura, ainda nao implementado
- portal do aluno por convite planejado para fase futura, ainda nao implementado

## Validacao local concluida

- `npx tsc --noEmit`
- `npm run lint` sem erros ou avisos
- `npm run build` concluido com todas as rotas, incluindo `/mais` e `/agenda/aulas/[id]/remanejar`
- protecao local de `/painel` confirmou redirecionamento para `/entrar` sem sessao

## Pendente para homologacao

- aplicar a migration 270 no Supabase
- abrir `/painel` autenticado e validar dados reais do dia
- testar remanejamento individual e integral de dupla/trio
- confirmar que remanejamento direto nao aparece em reposicoes pendentes
- testar cancelamento individual e integral, incluindo aluno 5x
- testar finalizacao de aula, finalizacao do dia e correcao retroativa
- validar visualmente em 360px, 390px, tablet e desktop

## Proxima etapa

- escolher uma fase do roadmap `docs/sdd/roadmap/2026-08-evolucao-saas-ux-ia.md`
- recomendacao atual: continuar a Fase B com melhorias no painel diario, horarios livres e cadastro de rotina
- antes da Fase C, revisar com cuidado migration, RLS, RPCs e testes de isolamento
