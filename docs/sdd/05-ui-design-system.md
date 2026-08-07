# UI e design system

## Direcao visual

Design editorial minimalista com branco e preto como estrutura e a paleta roxa como identidade:

- `#370A42`
- `#662975`
- `#995DA8`
- `#D0A4DB`
- `#F7D9FF`

Os tokens em `src/app/globals.css` sao a fonte tecnica das cores ajustadas manualmente no projeto.

## Premissas

- mobile forte para uso frequente
- desktop robusto para visao gerencial
- alta legibilidade e alvos de toque confortaveis
- estados operacionais nao dependem apenas de cor
- cards e ritmo tipografico organizam a leitura editorial

## Componentes base

- `Button` e `ButtonLink`
- `Input`, `Select` e `Textarea`
- `Card`, `Badge` e `Alert`
- `PageHeader` e `EmptyState`
- `ResponsiveTable`, `DashboardShell` e `SearchForm`

## Componentes por feature

- agenda: navegacao de periodo, semana, mes, slots, faixa semanal e excecoes por data
- `FormularioFaixaDisponibilidade`: aplica uma faixa a varios dias e fecha dias sem expediente
- `GradeDisponibilidade`: editor compacto por dia, com slot ocupado protegido
- `FormularioExcecaoAgenda`: formulario reutilizado para abrir ou bloquear uma data
- `ListaExcecoesAgenda`: lista cronologica de aberturas e bloqueios
- alunos: formulario unico de criacao/edicao, lista pesquisavel e resumo da rotina ativa
- `SeletorRotinaSemanal`: navegacao horizontal por dia, horarios filtrados e resumo persistente
- `ResumoRotinaAluno`: confirmacao visual dos horarios reservados apos cadastro ou edicao
- painel: seletor de periodo e ranking de reposicoes
- reposicoes: cancelamento por participante e card de sugestoes

Componentes de dominio ficam em `src/components/<feature>`; somente pecas sem regra de negocio entram em `src/components/ui`.
