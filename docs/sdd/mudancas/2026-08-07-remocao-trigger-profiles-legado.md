# Mudanca: remocao de trigger legado de profiles

## Motivo

A criacao de usuarios pelo Supabase Auth retornava HTTP `500` porque um trigger antigo de `auth.users` tentava acessar `public.profiles`, tabela inexistente e fora da modelagem atual do FitControl.

## Implementacao

- busca apenas triggers nao internos vinculados a `auth.users`
- confere se a funcao executada pelo trigger menciona `profiles`
- remove somente os triggers encontrados
- preserva usuarios, tabelas e funcoes existentes
- pode ser executada novamente sem efeito colateral

## Impacto

O Supabase Auth volta a criar usuarios sem exigir uma tabela publica de perfis. Credenciais continuam armazenadas exclusivamente em `auth.users`.
