# Catalogo de horarios e excecoes por data

## Motivo

Evitar o cadastro manual de dezenas de horarios por personal e permitir ajustes pontuais sem alterar a rotina semanal.

## Impacto no produto

- catalogo pronto entre `00:00` e `22:30`, em intervalos de 30 minutos
- padrao ativo de segunda a sexta, das `05:00` as `20:00`
- aplicacao de faixa em varios dias
- ajuste individual de cada inicio
- abertura ou bloqueio valido somente para uma data
- horarios de alunos fixos protegidos contra desativacao acidental

## Impacto tecnico

- nova tabela `aberturas_agenda`
- nova RPC `aplicar_faixa_disponibilidade`
- `confirmar_reposicao` passa a aceitar abertura pontual
- agenda, dashboard e sugestoes combinam disponibilidade recorrente e aberturas
- componentes antigos de inclusao individual foram substituidos por componentes de faixa e excecao

## Arquivos SDD atualizados

- `02-regras-de-negocio.md`
- `03-arquitetura-aplicacao.md`
- `04-modelagem-banco.md`
- `05-ui-design-system.md`
- `06-plano-de-fases.md`
- `07-estado-atual.md`
- `08-decisoes-arquiteturais.md`

## Status

Implementado, validado localmente e aplicado no Supabase em 07/08/2026.
