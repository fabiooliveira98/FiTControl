# FitControl

MVP para personal trainer com foco em agenda, cancelamentos, reposições e leitura gerencial da ocupação semanal e mensal.

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Supabase
- Zod

## Primeiros passos

1. Copie `.env.example` para `.env.local`.
2. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. No SQL Editor do Supabase, execute as migrations na ordem indicada abaixo.
4. Crie o primeiro usuário em Authentication > Users.
5. Instale as dependências com `npm install`.
6. Inicie o projeto com `npm run dev`.

## Migrations

1. `supabase/migrations/20260807113000_modelagem_inicial_fitcontrol.sql`
2. `supabase/migrations/20260807170000_fases_4_a_7_operacao_agenda.sql`
3. `supabase/migrations/20260807200000_intervalos_30_minutos.sql`

O Supabase gerencia os usuários em `auth.users`. O FitControl não duplica senha ou credenciais em tabelas públicas.

## Documentação viva

Toda a especificação, as regras e o estado real do projeto ficam em `docs/sdd`.

## Verificação

```bash
npm run lint
npm run build
```
