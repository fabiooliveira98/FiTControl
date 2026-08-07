# Arquitetura da aplicacao

## Stack oficial

- Next.js App Router
- TypeScript
- Tailwind CSS 4
- Supabase
- Server Actions
- Zod

## Organizacao de pastas

- `src/app`: rotas, layouts e paginas
- `src/components/ui`: componentes base reutilizaveis
- `src/components/<feature>`: composicao visual por dominio
- `src/features/<feature>`: actions, queries, schemas, tipos e regras
- `src/types`: contratos centrais das entidades do banco
- `src/lib`: integracoes e utilidades base
- `src/utils`: funcoes reutilizaveis entre features

## Convencoes

- actions e banco usam nomes de negocio em portugues BR
- tipos compartilhados ficam centralizados
- paginas apenas orquestram dados e componentes
- componentes de UI nao carregam regra de negocio
- mutacoes relevantes sao validadas por Zod
- operacoes que atravessam tabelas usam RPCs atomicas

## Autenticacao

- Supabase Auth com e-mail e senha
- usuarios e credenciais permanecem em `auth.users`
- middleware protege rotas internas e renova sessao
- Server Components usam cliente sem escrita de cookies
- Server Actions usam cliente autorizado a atualizar cookies

## Features implementadas

- `features/alunos`: CRUD, slots validos, grupos e rotinas recorrentes
- `features/agenda`: catalogo recorrente, excecoes, materializacao e visoes semana/mes
- `features/painel`: consulta agregada do dia, estados temporais e ranking
- `features/reposicoes`: cancelamento, fila, sugestoes, remanejamento e finalizacao
- `features/alteracoes-rotina`: programacao, historico e mudancas permanentes
- `features/mensalidades`: lancamentos, pagamentos, filtros e ajustes financeiros

## Painel diario e acoes rapidas

- `features/painel` entrega `DadosPainelHoje` em uma consulta agregada por dia
- status temporal da aula e derivado na query, sem regra dentro do card
- `components/painel` separa faixa semanal, linha do tempo, card, livres e finalizacao
- `components/ui/BottomSheet` fornece a superficie acessivel reutilizavel das acoes
- `features/reposicoes` valida cancelamento em lote e remanejamento com Zod
- remanejamento e finalizacao atravessam tabelas por RPC para manter atomicidade
- o periodo de 45 dias e materializado antes de calcular sugestoes de encaixe
- a RPC materializa novamente a data escolhida antes da validacao definitiva
- o layout protegido dispara finalizacao de dias anteriores ao reabrir o app
- a agenda repete a finalizacao depois de materializar o periodo
- `/mais` concentra financeiro, configuracoes e saida na navegacao movel
- desktop preserva o menu lateral; mobile usa `MobileBottomNav` fixo

## Operacoes atomicas no banco

- `materializar_aulas_periodo`
- `cancelar_aula_aluno`
- `cancelar_participacoes_aula`
- `confirmar_reposicao`
- `remanejar_participacoes_aula`
- `finalizar_aula`
- `finalizar_dia`
- `finalizar_aulas_anteriores`
- `aplicar_alteracao_rotina`
- `aplicar_alteracoes_rotina_pendentes`

## Sincronizacao da agenda

- abrir agenda ou painel aplica mudancas de rotina cuja vigencia ja chegou
- depois das mudancas, `materializar_aulas_periodo` sincroniza ocorrencias e participantes
- a finalizacao automatica roda novamente depois da materializacao
- falha de materializacao nao apaga um aluno ja cadastrado
- a migration de estabilizacao repara duplicidades legadas antes da materializacao
