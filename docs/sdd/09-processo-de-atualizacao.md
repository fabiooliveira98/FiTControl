# Processo de atualização

## Regra principal

Nenhuma entrega é considerada pronta sem checkpoint documental.

## Checklist pós-implementação

1. atualizar `07-estado-atual.md`
2. revisar `06-plano-de-fases.md` se a fase mudou de status
3. atualizar o documento temático afetado:
   - regra de negócio → `02-regras-de-negocio.md`
   - arquitetura → `03-arquitetura-aplicacao.md`
   - banco → `04-modelagem-banco.md`
   - UI base → `05-ui-design-system.md`
4. registrar decisão importante em `08-decisoes-arquiteturais.md`
5. se algo saiu do plano original, registrar usando `templates/template-mudanca.md`
6. executar os testes automatizados relacionados em `10-testes-automatizados.md`
7. só encerrar a tarefa depois de conferir se código e documentação dizem a mesma coisa

## Regras objetivas

- migration nova exige atualização de `04-modelagem-banco.md`
- novo componente base exige atualização de `05-ui-design-system.md`
- alteração de comportamento exige revisão de `02-regras-de-negocio.md`
- mudança estrutural exige revisão de `03-arquitetura-aplicacao.md`
- novo fluxo crítico exige teste automatizado ou justificativa registrada no checkpoint
