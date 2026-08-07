# Mudanca: correcao da selecao de UUID na materializacao

## Motivo

O PostgreSQL retornava `function min(uuid) does not exist` ao sincronizar a agenda.

## Implementacao

- substituida a agregacao `min(h.id)` por selecao ordenada com `order by` e `limit 1`
- mantida a escolha deterministica de uma rotina representativa do grupo
- criada migration curta para bancos que ja aplicaram a migration consolidada

## Impacto

Nenhum dado e alterado diretamente. A funcao de materializacao volta a criar e sincronizar as aulas recorrentes.
