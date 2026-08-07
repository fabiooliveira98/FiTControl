# Aplicacao imediata de rotina

## Motivo

O fluxo de alteracao aceitava somente datas futuras. A interface confirmava a mudanca, mas a rotina ativa continuava igual ate a vigencia, causando a impressao de que o banco nao havia salvo.

## Impacto no produto

- a data atual passa a ser a opcao padrao
- salvar com a data atual aplica a nova rotina imediatamente
- escolher uma data futura continua programando a mudanca
- dados cadastrais nao exibem mais uma confirmacao incorreta de rotina atualizada

## Impacto tecnico

- a Server Action chama `aplicar_alteracao_rotina` quando a vigencia e hoje
- ocorrencias antigas do horario anterior sao removidas pela RPC conforme a vigencia
- as proximas aulas sao materializadas novamente por 90 dias
- falha de aplicacao remove o registro agendado para evitar estado enganoso

## Arquivos SDD atualizados

- `02-regras-de-negocio.md`
- `07-estado-atual.md`

## Status

Implementado e validado localmente em 07/08/2026.
