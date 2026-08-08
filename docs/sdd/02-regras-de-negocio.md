# Regras de negocio

## Agenda

- a personal trabalha com dias configuraveis e aulas fixas de 1 hora
- o catalogo semanal possui inicios entre `00:00` e `22:30`, a cada 30 minutos
- `22:30` e o ultimo inicio porque a aula termina no mesmo dia; sessoes que atravessam a meia-noite nao fazem parte do MVP
- o padrao inicial abre segunda a sexta, das `05:00` as `20:00`, e mantem os demais horarios desligados
- todos os horarios do catalogo permanecem editaveis; desligar nao exclui o registro
- uma faixa recorrente pode ser aplicada a varios dias de uma vez
- horarios com alunos fixos nao podem ser desligados pela faixa ou pelo ajuste individual
- uma abertura por data libera um horario normalmente fechado sem alterar outras semanas
- um bloqueio por data impede encaixes sobrepostos e tem prioridade operacional
- aulas podem iniciar apenas em minuto `00` ou `30`
- intervalos que se cruzam sao indisponiveis, mesmo quando o horario de inicio e diferente
- uma aula `13:30-14:30` bloqueia inicios em `13:00`, `13:30` e `14:00`, liberando `14:30`
- a visao semanal e prioritaria e a visao mensal apoia planejamento
- aulas recorrentes sao materializadas por periodo de forma idempotente
- a agenda diferencia livre, ocupado, bloqueado, indisponivel e conflito

## Alunos e grupos

- um aluno pode treinar em um ou mais dias e horarios diferentes
- um aluno possui no maximo um horario recorrente em cada dia da semana
- escolher outro horario no mesmo dia substitui a selecao anterior antes de salvar
- apenas disponibilidade recorrente ativa e com vaga aparece para novo cadastro
- o cadastro revela um dia por vez e oculta horarios sem vaga ou com sobreposicao
- a selecao atual fica resumida durante todo o preenchimento do formulario
- selecionar uma rotina ocupa o horario de forma derivada, sem apagar o slot do catalogo
- ocupacoes mostram os nomes dos alunos na configuracao e nas aulas materializadas
- slots sobrepostos a outra rotina nao aparecem como opcao valida
- o primeiro aluno de um slot define o formato individual, dupla ou trio
- alunos seguintes respeitam a capacidade definida para o grupo
- a lotacao maxima absoluta e 3 alunos
- edicao cadastral comum nao altera a rotina do aluno
- mudanca permanente usa fluxo proprio com data de vigencia futura
- uma mudanca permanente pode usar a data atual para ser aplicada imediatamente
- a rotina atual permanece valida ate o dia anterior a nova vigencia
- mudancas aplicadas desativam a versao anterior sem excluir seus registros
- mudancas agendadas podem ser canceladas antes da data de vigencia
- a tela do aluno mostra inicialmente apenas as mudancas de rotina mais recentes
- o historico completo de rotina permanece preservado no banco para consulta futura
- aulas anteriores preservam o snapshot de participantes

## Dashboard

- `/painel` abre sempre no dia atual quando nenhuma data e informada
- o painel lista aulas em ordem cronologica e mantem horarios livres recolhidos
- dias anteriores e futuros da mesma semana podem ser consultados sem sair do painel
- a proxima aula, aulas restantes, horarios livres e reposicoes pendentes aparecem no resumo
- a organizacao ampla da semana e do mes permanece em `/agenda`
- reposicoes pendentes sao globais e ordenadas por aluno com maior quantidade

## Cancelamentos

- o cancelamento ocorre por aluno, sem cancelar automaticamente os colegas da dupla ou trio
- em dupla ou trio a personal pode selecionar um participante ou o grupo inteiro
- o motivo e opcional e limitado a 240 caracteres
- a aula inteira so recebe status cancelado quando nao restar participante confirmado
- aluno de segunda a sexta nao gera reposicao padrao e segue para ajuste financeiro
- cancelamentos comuns usam tipo `FALTA`; saidas por remanejamento usam `REMANEJAMENTO`

## Reposicoes

- cancelamentos elegiveis criam uma reposicao pendente automaticamente
- sugestoes consideram faixa semanal, aberturas por data, bloqueios, capacidade e conflito do aluno
- sugestoes eliminam qualquer sobreposicao parcial com aulas e bloqueios
- sao exibidas ate 8 sugestoes validas nos proximos 45 dias
- confirmar uma sugestao inclui o aluno na aula de destino e resolve a pendencia
- uma pendencia tambem pode ser dispensada e direcionada para ajuste financeiro

## Remanejamento pontual

- remanejamento pontual nao altera a rotina recorrente do aluno
- a personal pode mover um participante ou todos os participantes ativos da aula
- o destino deve ser futuro, estar disponivel e nao pode cruzar bloqueios ou outras aulas
- o destino precisa ter capacidade para todos os participantes selecionados
- nenhum aluno selecionado pode possuir conflito ou historico na aula de destino
- a origem registra cancelamento do tipo `REMANEJAMENTO`
- o destino registra uma reposicao `CONFIRMADA`, sem entrar na fila de pendencias
- alunos 5x nao recebem remanejamento padrao e continuam na regra financeira
- aulas concluidas aceitam cancelamento e remanejamento retroativo

## Finalizacao de aulas

- finalizar uma aula atua sobre o encontro inteiro, inclusive em dupla ou trio
- finalizar o dia conclui todas as aulas ainda agendadas ou repostas da data
- aulas de dias anteriores sao concluidas automaticamente na proxima abertura autenticada
- a finalizacao automatica nao depende de cron
- finalizacao manual e automatica ficam diferenciadas no historico da aula

## Financeiro

- o financeiro existe como apoio operacional
- o MVP precisa de mensalidade, vencimento, status, data de pagamento e observacao
- lancamentos podem ser filtrados como pendente, atrasado, pago ou ajuste
- pendencias vencidas passam para atrasado quando o financeiro e consultado
- marcar como pago registra a data do pagamento
- falta de aluno 5x gera uma oportunidade de ajuste financeiro vinculada ao cancelamento
- cada cancelamento pode originar no maximo um ajuste financeiro
