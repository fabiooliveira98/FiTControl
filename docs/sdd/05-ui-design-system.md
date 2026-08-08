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

## Proximo ciclo de UX

- reduzir atrito nas acoes de maior frequencia: cancelar, remanejar, finalizar e consultar detalhes
- tratar `/painel` como superficie principal de operacao no celular
- manter `/agenda` como superficie ampla para organizar semana e mes
- revisar cadastro e edicao de rotina para diminuir listas longas e decisoes repetidas
- preferir componentes reutilizaveis e pequenos, sem duplicar padroes visuais por tela
- estados de aula devem ser compreensiveis por texto, hierarquia, contraste e posicao, nao apenas por cor
- qualquer novo componente base relevante deve atualizar este documento

## Fase B.1: card da aula e acoes rapidas

- `CartaoAulaDia` prioriza leitura rapida: horario, status, participantes ativos, ocupacao e proxima acao
- estados `Proxima`, `Em andamento` e `Finalizacao pendente` recebem maior destaque visual no painel
- participantes cancelados aparecem de forma secundaria para nao poluir a linha do tempo
- `AcoesAulaBottomSheet` concentra o menu de acoes da aula e reduz etapas em aulas individuais
- aulas em andamento ou pendentes priorizam finalizacao; aulas futuras priorizam remanejamento e cancelamento
- dupla e trio continuam exigindo escolha de participante ou grupo inteiro antes de cancelar/remanejar

## Fase B.2: historico e clareza de vigencia

- historico de mudancas de rotina mostra inicialmente apenas as duas mudancas mais recentes
- a tela informa quantos registros foram exibidos em relacao ao total preservado
- textos de vigencia explicam que a rotina atual vale ate o dia anterior da nova data
- formulario de alteracao permanente reforca que a mudanca cria uma nova versao da rotina
- paginacao completa do historico fica planejada para uma evolucao futura

## Interface publica

- `components/marketing` concentra cabecalho, previa da agenda, beneficios e rodape
- a landing apresenta problema, solucao e uso pratico sem mencionar implementacao interna
- a previa animada da agenda demonstra remanejamento, andamento e horarios livres
- o login aparece primeiro no mobile e usa composicao dividida no desktop
- movimentos usam entrada escalonada e flutuacao leve, respeitando `prefers-reduced-motion`
- botoes lilases usam texto escuro para manter contraste

Componentes de dominio ficam em `src/components/<feature>`; somente pecas sem regra de negocio entram em `src/components/ui`.
