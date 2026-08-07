# Uma rotina por dia para cada aluno

## Motivo

O seletor permitia cadastrar dois horarios diferentes no mesmo dia para o mesmo aluno, contrariando a rotina prevista para o produto.

## Impacto no produto

- cada aluno pode escolher no maximo um horario por dia
- tocar em outro horario substitui automaticamente a selecao anterior
- dias diferentes continuam aceitando horarios diferentes

## Impacto tecnico

- seletor remove a selecao anterior do mesmo dia
- schema Zod rejeita rotinas duplicadas por dia
- trigger PostgreSQL protege insercoes e atualizacoes diretas

## Arquivos SDD atualizados

- `02-regras-de-negocio.md`
- `04-modelagem-banco.md`
- `07-estado-atual.md`

## Status

Implementado e validado localmente. Regra consolidada em `20260807230000_reparar_materializacao_agenda.sql`.
