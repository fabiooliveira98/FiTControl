import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import {
  calcularHorarioFim,
  criarClienteTesteAutenticado,
  criarMarcadorTeste,
  encerrarClienteTeste,
  encontrarHorarioLivreAposMeioDia,
  iniciarRegistroTeste,
  limparDadosRegistrados,
  obterDataAtualSaoPaulo,
  registrarDadoTeste,
  somarDias,
} from "./supabase-test-utils.mjs";

let supabase;
let marcador;
let cadastroCorreto;

function garantirSemErro(error, contexto) {
  if (error) throw new Error(`${contexto}: ${error.message}`);
}

before(async () => {
  supabase = await criarClienteTesteAutenticado();

  // Uma execucao interrompida deixa somente seus IDs neste registro local.
  await limparDadosRegistrados(supabase);
  marcador = criarMarcadorTeste();
  await iniciarRegistroTeste(marcador);
});

after(async () => {
  try {
    if (supabase && process.env.FITCONTROL_TEST_KEEP_DATA !== "true") {
      await limparDadosRegistrados(supabase);
    }
  } finally {
    await encerrarClienteTeste(supabase);
  }
});

test("cadastra aluno em horario livre depois do meio-dia e materializa a agenda", async () => {
  const horario = await encontrarHorarioLivreAposMeioDia(supabase);
  const horarioFim = calcularHorarioFim(horario.horario_inicio);
  const nomeAluno = `Cadastro correto ${marcador}`;
  const nomeGrupo = `${horario.dia_semana} ${horario.horario_inicio} ${marcador}`;

  const { data: aluno, error: erroAluno } = await supabase
    .from("alunos")
    .insert({
      nome: nomeAluno,
      status: "ATIVO",
      treina_segunda_a_sexta: false,
      observacoes: "Registro criado exclusivamente pelo teste automatizado.",
    })
    .select("id,nome")
    .single();
  garantirSemErro(erroAluno, "Cadastro correto recusado ao criar aluno");
  await registrarDadoTeste("alunos", aluno);

  const { data: grupo, error: erroGrupo } = await supabase
    .from("grupos_aula")
    .insert({
      nome_referencia: nomeGrupo,
      tipo: "INDIVIDUAL",
      capacidade_maxima: 1,
      ativo: true,
    })
    .select("id,nome_referencia")
    .single();
  garantirSemErro(erroGrupo, "Cadastro correto recusado ao criar grupo");
  await registrarDadoTeste("grupos", grupo);

  const { data: integrante, error: erroIntegrante } = await supabase
    .from("integrantes_grupos_aula")
    .insert({ grupo_aula_id: grupo.id, aluno_id: aluno.id })
    .select("id,grupo_aula_id,aluno_id")
    .single();
  garantirSemErro(erroIntegrante, "Cadastro correto recusado ao vincular aluno ao grupo");
  await registrarDadoTeste("integrantes", integrante);

  const { data: rotina, error: erroRotina } = await supabase
    .from("horarios_recorrentes_alunos")
    .insert({
      aluno_id: aluno.id,
      grupo_aula_id: grupo.id,
      dia_semana: horario.dia_semana,
      horario_inicio: horario.horario_inicio,
      horario_fim: horarioFim,
      ativo: true,
    })
    .select("id,grupo_aula_id,aluno_id")
    .single();
  garantirSemErro(erroRotina, "Cadastro correto recusado ao criar rotina");
  await registrarDadoTeste("rotinas", rotina);

  const dataInicio = obterDataAtualSaoPaulo();
  const dataFim = somarDias(dataInicio, 28);
  const { error: erroMaterializacao } = await supabase.rpc("materializar_aulas_periodo", {
    p_data_inicio: dataInicio,
    p_data_fim: dataFim,
  });
  garantirSemErro(erroMaterializacao, "Cadastro correto recusado ao materializar a agenda");

  const { data: aulas, error: erroAulas } = await supabase
    .from("aulas")
    .select("id,grupo_aula_id,observacoes")
    .eq("grupo_aula_id", grupo.id)
    .gte("data", dataInicio)
    .lte("data", dataFim);
  garantirSemErro(erroAulas, "Falha ao conferir aulas materializadas");
  assert.ok(aulas?.length, "O cadastro foi salvo, mas nenhuma aula apareceu na agenda.");

  for (const aula of aulas) {
    await registrarDadoTeste("aulas", {
      id: aula.id,
      grupo_aula_id: aula.grupo_aula_id,
    });
  }

  const { error: erroMarcacaoAulas } = await supabase
    .from("aulas")
    .update({ observacoes: `Aula criada por ${marcador}` })
    .in(
      "id",
      aulas.map(({ id }) => id),
    );
  garantirSemErro(erroMarcacaoAulas, "Falha ao marcar as aulas exclusivas do teste");

  const { data: participacoes, error: erroParticipacoes } = await supabase
    .from("alunos_aulas")
    .select("id,aula_id,aluno_id")
    .eq("aluno_id", aluno.id)
    .in(
      "aula_id",
      aulas.map(({ id }) => id),
    );
  garantirSemErro(erroParticipacoes, "Falha ao conferir o aluno na agenda");
  assert.equal(
    participacoes?.length,
    aulas.length,
    "Nem todas as aulas materializadas possuem o aluno cadastrado.",
  );

  for (const participacao of participacoes) {
    await registrarDadoTeste("alunos_aulas", participacao);
  }

  cadastroCorreto = { aluno, grupo, horario };
});

test("recusa cadastro no mesmo horario individual que ja esta ocupado", async () => {
  assert.ok(cadastroCorreto, "O primeiro cadastro precisa concluir antes do teste de ocupacao.");
  const nomeAluno = `Cadastro em horario ocupado ${marcador}`;

  const { data: aluno, error: erroAluno } = await supabase
    .from("alunos")
    .insert({
      nome: nomeAluno,
      status: "ATIVO",
      treina_segunda_a_sexta: false,
      observacoes: "Tentativa controlada em horario individual ja ocupado.",
    })
    .select("id,nome")
    .single();
  garantirSemErro(erroAluno, "Falha ao preparar a tentativa em horario ocupado");
  await registrarDadoTeste("alunos", aluno);

  const { data: integrante, error } = await supabase
    .from("integrantes_grupos_aula")
    .insert({
      grupo_aula_id: cadastroCorreto.grupo.id,
      aluno_id: aluno.id,
    })
    .select("id")
    .single();

  assert.equal(integrante, null, "O banco adicionou um segundo aluno ao grupo individual lotado.");
  assert.ok(error, "O banco deveria recusar o horario ocupado, mas nao retornou erro.");
  assert.match(
    error.message,
    /capacidade maxima|capacidade|lotado/i,
    `O banco recusou pelo motivo inesperado: ${error.message}`,
  );

  const { count, error: erroConferencia } = await supabase
    .from("integrantes_grupos_aula")
    .select("id", { count: "exact", head: true })
    .eq("grupo_aula_id", cadastroCorreto.grupo.id)
    .eq("aluno_id", aluno.id);
  garantirSemErro(erroConferencia, "Falha ao conferir a tentativa recusada");
  assert.equal(count, 0, "A tentativa recusada deixou um vinculo parcial no grupo.");
});
