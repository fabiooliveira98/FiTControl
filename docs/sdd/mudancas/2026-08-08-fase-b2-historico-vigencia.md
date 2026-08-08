# Fase B.2: historico de rotina e vigencia

## Contexto

O historico de mudancas permanentes podia crescer demais na tela do aluno e a regra de vigencia ainda exigia explicacao fora da interface.

## Mudanca

- a busca de historico de rotina passou a limitar a leitura inicial as duas mudancas mais recentes
- a query retorna tambem o total de mudancas preservadas no banco
- o componente de historico informa quantos registros estao visiveis
- o formulario explica que a rotina atual vale ate o dia anterior da nova vigencia
- um alerta reforca que a mudanca cria uma nova versao sem apagar o historico antigo

## Impacto

A tela do aluno fica mais leve e a regra de mudanca permanente fica mais compreensivel para a personal. O historico completo continua preservado no banco, mas a paginacao completa fica para uma etapa futura.

## Validacao esperada

- `npx tsc --noEmit`
- `npm run lint`
- abrir a tela de um aluno com zero, uma, duas e mais de duas mudancas registradas
