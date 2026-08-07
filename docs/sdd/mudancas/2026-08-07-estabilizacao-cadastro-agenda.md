# Mudanca: estabilizacao do cadastro e da agenda

## Motivo

O cadastro dependia de uma materializacao global. Qualquer conflito legado fazia a RPC falhar e o codigo removia o aluno recem-criado; a agenda usava a mesma operacao e deixava de exibir as aulas.

## Implementacao

- reparo idempotente das rotinas ativas duplicadas
- materializacao por vigencia com sincronizacao de participantes
- aluno valido permanece salvo quando apenas a materializacao falha
- agenda tenta sincronizar novamente ao ser aberta
- mudancas futuras invalidas nao bloqueiam outras mudancas nem a agenda inteira

## Impacto

A agenda passa a compartilhar uma unica fonte de verdade versionada com o cadastro e com as alteracoes permanentes da Fase 8.
