# FitControl

Agenda inteligente para personal trainers que precisam reorganizar aulas, controlar reposições e enxergar a semana com clareza.

FitControl foi pensado para um problema muito específico da rotina de atendimento: cancelamentos espalhados em conversas, horários vagos difíceis de aproveitar e reposições que acabam ficando para depois. Em vez de depender de memória, anotações soltas ou planilhas paralelas, a personal passa a operar a agenda em um único sistema.

## O que o FitControl resolve

- Mostra a agenda do dia com foco em ação rápida.
- Ajuda a encontrar encaixes válidos para remarcação.
- Controla faltas, cancelamentos e reposições sem bagunçar a semana.
- Organiza alunos com rotina fixa, histórico e visão operacional.
- Dá leitura semanal e mensal da ocupação da agenda.

## Principais fluxos do produto

### 1. Cadastro de alunos

Registre nome, modalidade, horários recorrentes, duração da aula e data de início sem espalhar informação entre formulários e mensagens.

### 2. Cancelamentos e reposições

Ao cancelar uma aula, o sistema ajuda a entender o impacto na agenda e encontrar rapidamente o melhor espaço livre para remarcar.

### 3. Leitura da agenda

O uso no celular prioriza o que precisa ser resolvido hoje. No desktop, a visão semanal e mensal amplia a leitura da operação.

### 4. Apoio gerencial

Além da agenda, o FitControl já estrutura informações importantes para evolução do produto, como histórico do aluno, disponibilidade e leitura básica de ocupação.

## Para quem é

FitControl é voltado para personal trainers que atendem vários alunos ao longo da semana e precisam de mais clareza operacional no dia a dia.

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Supabase
- Zod

## Primeiros passos

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env.local`.
3. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. No SQL Editor do Supabase, execute as migrations na ordem indicada abaixo.
5. Crie o primeiro usuário em `Authentication > Users`.
6. Rode o projeto com `npm run dev`.

## Migrations

1. `supabase/migrations/20260807113000_modelagem_inicial_fitcontrol.sql`
2. `supabase/migrations/20260807170000_fases_4_a_7_operacao_agenda.sql`
3. `supabase/migrations/20260807200000_intervalos_30_minutos.sql`

O Supabase gerencia os usuários em `auth.users`. O FitControl não duplica senha nem credenciais em tabelas públicas.

## Desenvolvimento

### Scripts úteis

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run test:integracao:cadastro`

### Estrutura importante

- `src/app`: rotas e páginas
- `src/components`: componentes de interface
- `src/features`: regras por domínio
- `src/lib/supabase`: integração com Supabase
- `docs/sdd`: visão de produto, arquitetura, regras e estado atual

## Documentação viva

Toda a especificação funcional e técnica do projeto fica em `docs/sdd`.

## Status

O projeto está em desenvolvimento ativo, com foco principal em agenda, remanejamento e leitura operacional da rotina da personal.
