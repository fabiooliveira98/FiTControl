# Cadastro compacto de rotina

## Motivo

A exibicao simultanea de todos os dias e horarios tornava o cadastro de aluno longo e dificultava conferir o resultado da reserva.

## Impacto no produto

- um dia da semana e aberto por vez
- apenas horarios utilizaveis sao exibidos
- sobreposicoes escolhidas no formulario desaparecem imediatamente
- a rotina selecionada permanece resumida antes do envio
- o pos-cadastro confirma a reserva e mostra a rotina ativa
- configuracao da agenda identifica horarios ocupados pelo nome dos alunos

## Impacto tecnico

- selecao extraida para `SeletorRotinaSemanal`
- resumo extraido para `ResumoRotinaAluno`
- slots de cadastro agora carregam nomes dos ocupantes
- configuracao recebe ocupacoes recorrentes tipadas e calcula sobreposicoes
- falha de materializacao impede confirmacao silenciosa do cadastro

## Arquivos SDD atualizados

- `02-regras-de-negocio.md`
- `05-ui-design-system.md`
- `07-estado-atual.md`

## Status

Implementado e validado localmente em 07/08/2026.
