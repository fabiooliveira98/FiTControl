# Roadmap de evolucao SaaS, UX e IA

## Contexto

O FitControl ja possui a base operacional do MVP: agenda, alunos, rotinas, cancelamentos, reposicoes, painel diario e financeiro basico. O proximo ciclo nao deve comecar com uma mudanca grande de banco sem analise. A estrategia aprovada e melhorar primeiro a experiencia de uso e preparar, com calma, a arquitetura para uma evolucao SaaS segura.

## Principios do ciclo

- implementar em fases curtas e revisaveis
- documentar antes de alterar arquitetura sensivel
- priorizar reducao de atrito no uso diario
- manter mobile e desktop como prioridades reais
- proteger dados por dono antes de qualquer uso multiusuario real
- preservar nomes de negocio em portugues BR
- manter regras em `features`, componentes reutilizaveis em `components/ui` e contratos em `types`
- nao misturar portal do aluno com telas internas da personal

## Fase A. Documentacao da evolucao

Objetivo: registrar oficialmente a trilha de evolucao antes de mexer em codigo ou banco.

Entregas:

- atualizar arquitetura atual e arquitetura alvo
- documentar riscos do modelo atual mono-personal
- registrar estrategia de isolamento por `personal_id`
- documentar portal simples do aluno por convite
- registrar IA e WhatsApp como roadmap futuro
- atualizar o estado atual do SDD

Criterio de aceite:

- o SDD mostra claramente o que sera feito agora, depois e no futuro
- a mudanca SaaS fica registrada como futura e de alto cuidado
- existe um roteiro para escolher a proxima fase sem reabrir toda a discussao

## Fase B. Melhorias de UI e reducao de atrito

Objetivo: melhorar a operacao diaria com menor risco tecnico antes de alterar a estrutura de banco.

Entregas previstas:

- revisar o `/painel` como tela principal de uso no celular
- reduzir cliques nos fluxos de cancelar, remanejar e finalizar
- melhorar leitura dos cards de aula e estados operacionais
- refinar horarios livres recolhidos, resumo do dia e acoes rapidas
- revisar cadastro e edicao de rotina do aluno para diminuir esforco
- manter desktop com visao ampla de semana e mes

Criterio de aceite:

- a personal entende o dia rapidamente no celular
- as acoes mais frequentes ficam acessiveis com poucos toques
- agenda semanal e mensal continuam fortes no desktop
- componentes novos seguem a organizacao existente

## Fase C. Isolamento SaaS por personal

Objetivo: preparar o sistema para que cada personal tenha acesso somente aos proprios dados.

Entregas previstas:

- adicionar `personal_id` nas tabelas operacionais
- atribuir dados existentes ao usuario atual da personal
- trocar politicas RLS amplas por politicas baseadas em `auth.uid() = personal_id`
- revisar RPCs para validar dono dos dados internamente
- revisar queries e actions para criar registros ja vinculados ao usuario autenticado
- criar testes com duas personals para validar isolamento real

Tabelas afetadas:

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

Criterio de aceite:

- uma personal nao consegue listar, alterar ou inferir dados de outra personal
- rotinas, aulas e reposicoes continuam funcionando depois da migracao
- RPCs nao operam sobre registros de outro usuario
- dados atuais ficam associados a conta da personal atual

## Fase D. Portal simples do aluno por convite

Objetivo: permitir que o aluno consulte informacoes proprias sem acessar a operacao interna da personal.

Modelo planejado:

- criar uma tabela de vinculo, como `acessos_alunos`
- o aluno acessa por convite enviado pela personal
- o vinculo liga `usuario_id`, `aluno_id` e `personal_id`
- o portal do aluno e somente consulta na primeira versao

Informacoes visiveis ao aluno:

- proximas aulas
- reposicoes pendentes ou confirmadas
- cancelamentos registrados
- informacoes basicas autorizadas pela personal

Restricoes:

- aluno nao ve lista completa de alunos
- aluno nao ve agenda completa da personal
- aluno nao altera rotinas diretamente
- pedidos de mudanca podem virar uma fase futura

Criterio de aceite:

- aluno convidado acessa apenas os proprios dados
- tentativa de acessar outro aluno e barrada por RLS
- portal usa telas e queries proprias, separadas das telas da personal

## Fase E. IA e WhatsApp como visao futura

Objetivo: documentar uma direcao futura para tornar o sistema mais pratico sem antecipar complexidade agora.

Casos de uso iniciais:

- cancelar aula por mensagem
- consultar horarios livres
- pedir sugestao de reposicao
- confirmar remanejamento
- listar aulas do dia

Regras de seguranca:

- IA nao executa mudancas sensiveis sem confirmacao
- toda acao gera historico/auditoria
- integracao deve respeitar o isolamento por `personal_id`
- aluno e personal devem ter permissoes diferentes

Criterio de aceite futuro:

- mensagens simples viram intencoes compreensiveis
- a personal confirma antes de alterar agenda
- o sistema registra quem pediu, quem confirmou e o que foi alterado

## Ordem recomendada

1. Fase A: documentacao da evolucao.
2. Fase B: melhorias de UI e reducao de atrito.
3. Fase C: isolamento SaaS por personal.
4. Fase D: portal simples do aluno por convite.
5. Fase E: IA e WhatsApp como roadmap futuro.

## Riscos principais

- aplicar `personal_id` sem revisar todas as RPCs pode deixar brechas de acesso
- reaproveitar telas internas no portal do aluno pode expor dados demais
- mudar RLS sem testes com dois usuarios pode passar uma falsa sensacao de seguranca
- implementar IA antes do isolamento SaaS pode ampliar riscos de privacidade

## Decisao atual

O ciclo esta aprovado como planejamento. A primeira implementacao recomendada apos este registro e a Fase B, pois melhora a operacao real com menor risco enquanto a Fase C recebe analise mais cuidadosa.
