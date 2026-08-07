# Arquitetura da aplicação

## Stack oficial

- Next.js App Router
- TypeScript
- Tailwind CSS 4
- Supabase
- Server Actions
- Zod

## Organização de pastas

- `src/app`: rotas, layouts e páginas
- `src/components/ui`: componentes base reutilizáveis
- `src/components/<feature>`: composição visual por domínio
- `src/features/<feature>`: actions, queries, schemas, tipos e regras
- `src/types`: contratos centrais das entidades do banco
- `src/lib`: integrações e utilidades base
- `src/utils`: funções reutilizáveis entre features

## Convenções

- actions e banco usam nomes de negócio em português BR
- tipos compartilhados ficam centralizados
- páginas apenas orquestram dados e componentes
- componentes de UI não carregam regra de negócio
- mutações relevantes são validadas por Zod

## Autenticação

- Supabase Auth com e-mail e senha
- usuários e credenciais permanecem em `auth.users`
- middleware protege rotas internas e renova sessão
- Server Components usam cliente sem escrita de cookies
- Server Actions usam cliente autorizado a atualizar cookies

## Features implementadas

- `features/alunos`: CRUD, slots válidos, grupos e rotinas recorrentes
- `features/agenda`: catalogo recorrente, excecoes por data, materializacao e visoes semana/mes
- `features/painel`: métricas agregadas e ranking de reposições
- `features/reposicoes`: cancelamento, fila, sugestões e confirmação
- `features/alteracoes-rotina`: programação, histórico e aplicação de mudanças permanentes
- `features/mensalidades`: lançamentos, pagamentos, filtros e ajustes financeiros

## Operações atômicas no banco

- `materializar_aulas_periodo`
- `cancelar_aula_aluno`
- `confirmar_reposicao`
- `aplicar_alteracao_rotina`
- `aplicar_alteracoes_rotina_pendentes`

Essas funções concentram operações que atravessam várias tabelas e evitam estados parciais.

## Sincronizacao da agenda

- abrir agenda ou dashboard aplica mudanças de rotina cuja vigencia ja chegou
- depois das mudanças, `materializar_aulas_periodo` sincroniza ocorrencias e participantes
- falha de materializacao nao apaga um aluno que ja foi cadastrado corretamente
- a migration de estabilizacao repara duplicidades legadas antes de redefinir a materializacao
