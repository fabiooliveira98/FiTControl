# UI e design system

## Direcao visual

Design editorial minimalista com branco e preto como estrutura e a paleta roxa como identidade:

- `#370A42`
- `#662975`
- `#995DA8`
- `#D0A4DB`
- `#F7D9FF`

Os tokens em `src/app/globals.css` sao a fonte tecnica das cores ajustadas no projeto.

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
- `BottomSheet`: dialogo acessivel na base no mobile e centralizado no desktop

## Componentes por feature

- agenda: navegacao de periodo, semana, mes, slots, faixa semanal e excecoes
- `FormularioFaixaDisponibilidade`: aplica uma faixa a varios dias
- `GradeDisponibilidade`: editor compacto por dia com slot ocupado protegido
- `FormularioExcecaoAgenda`: abre ou bloqueia uma data
- alunos: formulario de criacao/edicao, pesquisa e resumo da rotina
- `SeletorRotinaSemanal`: navegacao por dia e horarios filtrados
- painel: faixa semanal, resumo diario, linha do tempo, livres expansivel e ranking
- `CartaoAulaDia`: entrada para remanejar, cancelar, finalizar e ver detalhes
- `FormularioCancelamentoRapido`: escolha individual ou integral para grupos
- `FormularioRemanejamento`: sugestoes validas e selecao manual de destino
- layout: `MobileBottomNav` com Hoje, Agenda, Alunos, Reposicoes e Mais
- reposicoes: cancelamento por participante e cards de sugestoes

## Comportamento responsivo

- mobile mantem navegacao fixa no rodape com area segura do aparelho
- desktop preserva menu lateral e amplia a linha do tempo com painel auxiliar
- horarios livres ficam recolhidos por padrao para reduzir ruido visual
- o toque no cartao abre acoes em `BottomSheet`, sem drag-and-drop
- alvos interativos principais possuem pelo menos 44px de altura

Componentes de dominio ficam em `src/components/<feature>`; somente pecas sem regra de negocio entram em `src/components/ui`.
