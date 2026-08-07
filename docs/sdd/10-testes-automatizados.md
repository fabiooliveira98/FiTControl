# Testes automatizados

## Objetivo

Os testes de integracao validam o fluxo real no Supabase sem usar ou remover alunos cadastrados manualmente.

## Configuracao

Crie um usuario exclusivo em `Supabase > Authentication > Users` e adicione em `.env.local`:

```env
FITCONTROL_TEST_EMAIL=email-do-usuario-de-teste
FITCONTROL_TEST_PASSWORD=senha-do-usuario-de-teste
```

O teste usa a URL e a chave publica ja configuradas no projeto. Nao use a senha da conta pessoal da personal.

## Cadastro de aluno

Executar os dois cenarios:

```bash
npm run test:integracao:cadastro
```

O comando:

1. remove os dados exatos de uma execucao anterior interrompida
2. encontra um horario livre entre `12:00` e `19:00`
3. cadastra aluno, grupo e rotina e confirma a materializacao na agenda
4. tenta inserir outro aluno no mesmo grupo individual lotado e espera a recusa do banco
5. remove apenas os IDs gerados nesta execucao

Para executar somente a limpeza segura antes de um novo teste:

```bash
npm run test:integracao:cadastro:limpar
```

Os IDs ficam temporariamente em `.fitcontrol-test-data/cadastro-aluno.json`. Antes de excluir, o utilitario confere os nomes marcados e os vinculos de cada registro. Divergencias interrompem a limpeza.

Para inspecionar os dados depois do teste, execute temporariamente:

```powershell
$env:FITCONTROL_TEST_KEEP_DATA="true"; npm run test:integracao:cadastro
```

Depois da inspecao, use o comando de limpeza. Nunca remova o arquivo de registro antes dessa limpeza.
