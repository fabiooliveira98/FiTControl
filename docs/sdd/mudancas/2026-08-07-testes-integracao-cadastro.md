# Mudanca: testes de integracao do cadastro

## Motivo

O cadastro de aluno continuou apresentando erro e precisava de uma verificacao reproduzivel contra o banco real, sem risco para os registros criados manualmente.

## Implementacao

- teste positivo de aluno individual em horario livre depois de `12:00`
- verificacao da materializacao das aulas e do vinculo do aluno na agenda
- teste negativo no mesmo grupo individual, validando a recusa por capacidade
- registro local de todos os IDs criados
- limpeza anterior, posterior e manual somente por IDs exatos
- validacao adicional dos marcadores e vinculos antes de qualquer exclusao

## Impacto

Nenhuma migration foi adicionada. Os testes usam as mesmas politicas RLS de um usuario autenticado e exigem uma conta exclusiva de teste no Supabase Auth.
