# Reparo da materializacao da agenda

## Motivo

Rotinas legadas com mais de um horario ativo no mesmo dia podiam interromper a RPC inteira, impedindo novos cadastros e deixando painel e agenda sem aulas materializadas.

## Impacto no produto

- rotinas duplicadas antigas sao normalizadas mantendo a mais recente
- ocorrencias futuras sem rotina valida sao removidas e recriadas pela leitura da agenda
- erros de materializacao passam a informar a causa real
- o painel deixa de executar a mesma materializacao duas vezes em paralelo

## Impacto tecnico

- migration de reparo preserva historico e altera apenas rotina duplicada/futuro derivado
- action de cadastro limpa grupos criados quando precisa desfazer uma falha
- consultas de agenda passam a considerar erros de leitura, alem da RPC

## Arquivos SDD atualizados

- `04-modelagem-banco.md`
- `07-estado-atual.md`

## Status

Implementado e validado localmente. Migration remota pendente.
