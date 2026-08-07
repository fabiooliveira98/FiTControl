# Mudança — Inícios a cada 30 minutos

## Motivo

A operação real possui aulas iniciadas em meia hora, como `13:30`, que não eram representadas pela grade inicial de horas cheias.

## Impacto no produto

- seletores oferecem horários em intervalos de 30 minutos
- duração da aula permanece em 1 hora
- horários parcialmente sobrepostos deixam de ser exibidos como livres
- sugestões de reposição respeitam sobreposição parcial

## Impacto técnico

- helper central converte horários para minutos e compara intervalos
- cadastro de alunos valida conflitos no formulário e no banco
- agenda diferencia slots indisponíveis por sobreposição
- confirmação de reposição valida todo o intervalo
- nova migration adiciona gatilhos de precisão e conflito

## Arquivos SDD atualizados

- `02-regras-de-negocio.md`
- `04-modelagem-banco.md`
- `07-estado-atual.md`
- `08-decisoes-arquiteturais.md`

## Status

- implementação local concluída
- migration aplicada no Supabase em 07/08/2026
- lint, build e cenário de sobreposição aprovados
