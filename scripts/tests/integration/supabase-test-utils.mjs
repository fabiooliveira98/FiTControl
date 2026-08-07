import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const DIRETORIO_REGISTRO = path.resolve(process.cwd(), ".fitcontrol-test-data");
export const CAMINHO_REGISTRO = path.join(DIRETORIO_REGISTRO, "cadastro-aluno.json");
export const PREFIXO_MARCADOR = "__FITCONTROL_TESTE_CADASTRO__";

const CHAVES_COLECOES = [
  "alunos",
  "grupos",
  "integrantes",
  "rotinas",
  "aulas",
  "alunos_aulas",
];

function obterVariavel(nome) {
  const valor = process.env[nome]?.trim();
  if (!valor) {
    throw new Error(
      `Defina ${nome} em .env.local. Consulte docs/sdd/10-testes-automatizados.md.`,
    );
  }
  return valor;
}

function garantirSemErro(error, contexto) {
  if (error) throw new Error(`${contexto}: ${error.message}`);
}

async function lerRegistro() {
  try {
    return JSON.parse(await readFile(CAMINHO_REGISTRO, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw new Error(`O registro de limpeza esta invalido: ${error.message}`);
  }
}

async function salvarRegistro(registro) {
  await mkdir(DIRETORIO_REGISTRO, { recursive: true });
  await writeFile(CAMINHO_REGISTRO, `${JSON.stringify(registro, null, 2)}\n`, "utf8");
}

function validarEstruturaRegistro(registro) {
  if (
    registro?.versao !== 1 ||
    typeof registro.marcador !== "string" ||
    !registro.marcador.startsWith(PREFIXO_MARCADOR)
  ) {
    throw new Error("Registro de limpeza recusado: marcador de teste invalido.");
  }

  for (const chave of CHAVES_COLECOES) {
    if (!Array.isArray(registro[chave])) {
      throw new Error(`Registro de limpeza recusado: colecao ${chave} invalida.`);
    }
  }
}

async function consultarPorIds(supabase, tabela, colunas, ids) {
  if (!ids.length) return [];
  const { data, error } = await supabase.from(tabela).select(colunas).in("id", ids);
  garantirSemErro(error, `Falha ao conferir ${tabela}`);
  return data ?? [];
}

function mapaPorId(registros) {
  return new Map(registros.map((registro) => [registro.id, registro]));
}

function validarEntidadesMarcadas(encontrados, esperados, campo, marcador, tabela) {
  const esperadosPorId = mapaPorId(esperados);
  for (const encontrado of encontrados) {
    const esperado = esperadosPorId.get(encontrado.id);
    if (
      !esperado ||
      encontrado[campo] !== esperado[campo] ||
      !encontrado[campo]?.includes(marcador)
    ) {
      throw new Error(`Limpeza de ${tabela} recusada: o ID nao pertence a este teste.`);
    }
  }
}

function validarVinculos(encontrados, esperados, campos, tabela) {
  const esperadosPorId = mapaPorId(esperados);
  for (const encontrado of encontrados) {
    const esperado = esperadosPorId.get(encontrado.id);
    const vinculoInvalido = !esperado || campos.some((campo) => encontrado[campo] !== esperado[campo]);
    if (vinculoInvalido) {
      throw new Error(`Limpeza de ${tabela} recusada: vinculo diferente do registrado.`);
    }
  }
}

async function excluirIds(supabase, tabela, ids) {
  if (!ids.length) return;
  const { error } = await supabase.from(tabela).delete().in("id", ids);
  garantirSemErro(error, `Falha ao limpar ${tabela}`);
}

export async function criarClienteTesteAutenticado() {
  const supabase = createClient(
    obterVariavel("NEXT_PUBLIC_SUPABASE_URL"),
    obterVariavel("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({
    email: obterVariavel("FITCONTROL_TEST_EMAIL"),
    password: obterVariavel("FITCONTROL_TEST_PASSWORD"),
  });
  garantirSemErro(error, "Falha ao autenticar o usuario exclusivo de teste");

  return supabase;
}

export function criarMarcadorTeste() {
  const instante = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return `${PREFIXO_MARCADOR}${instante}_${randomUUID().slice(0, 8)}`;
}

export async function iniciarRegistroTeste(marcador) {
  await salvarRegistro({
    versao: 1,
    marcador,
    criado_em: new Date().toISOString(),
    alunos: [],
    grupos: [],
    integrantes: [],
    rotinas: [],
    aulas: [],
    alunos_aulas: [],
  });
}

export async function registrarDadoTeste(colecao, dado) {
  if (!CHAVES_COLECOES.includes(colecao)) {
    throw new Error(`Colecao de teste desconhecida: ${colecao}.`);
  }

  const registro = await lerRegistro();
  if (!registro) throw new Error("O registro do teste ainda nao foi iniciado.");
  validarEstruturaRegistro(registro);
  registro[colecao].push(dado);
  await salvarRegistro(registro);
}

export async function limparDadosRegistrados(supabase) {
  const registro = await lerRegistro();
  if (!registro) return { encontrouRegistro: false, total: 0 };
  validarEstruturaRegistro(registro);

  const alunos = await consultarPorIds(
    supabase,
    "alunos",
    "id,nome",
    registro.alunos.map(({ id }) => id),
  );
  const grupos = await consultarPorIds(
    supabase,
    "grupos_aula",
    "id,nome_referencia",
    registro.grupos.map(({ id }) => id),
  );
  validarEntidadesMarcadas(alunos, registro.alunos, "nome", registro.marcador, "alunos");
  validarEntidadesMarcadas(
    grupos,
    registro.grupos,
    "nome_referencia",
    registro.marcador,
    "grupos_aula",
  );

  const integrantes = await consultarPorIds(
    supabase,
    "integrantes_grupos_aula",
    "id,grupo_aula_id,aluno_id",
    registro.integrantes.map(({ id }) => id),
  );
  const rotinas = await consultarPorIds(
    supabase,
    "horarios_recorrentes_alunos",
    "id,grupo_aula_id,aluno_id",
    registro.rotinas.map(({ id }) => id),
  );
  const aulas = await consultarPorIds(
    supabase,
    "aulas",
    "id,grupo_aula_id,observacoes",
    registro.aulas.map(({ id }) => id),
  );
  const alunosAulas = await consultarPorIds(
    supabase,
    "alunos_aulas",
    "id,aula_id,aluno_id",
    registro.alunos_aulas.map(({ id }) => id),
  );

  validarVinculos(
    integrantes,
    registro.integrantes,
    ["grupo_aula_id", "aluno_id"],
    "integrantes_grupos_aula",
  );
  validarVinculos(
    rotinas,
    registro.rotinas,
    ["grupo_aula_id", "aluno_id"],
    "horarios_recorrentes_alunos",
  );
  validarVinculos(alunosAulas, registro.alunos_aulas, ["aula_id", "aluno_id"], "alunos_aulas");

  const aulasEsperadas = mapaPorId(registro.aulas);
  for (const aula of aulas) {
    const esperada = aulasEsperadas.get(aula.id);
    const temVinculo = esperada && aula.grupo_aula_id === esperada.grupo_aula_id;
    const temMarcador = aula.observacoes?.includes(registro.marcador);
    if (!temVinculo && !temMarcador) {
      throw new Error("Limpeza de aulas recusada: aula sem vinculo ou marcador do teste.");
    }
  }

  await excluirIds(supabase, "alunos_aulas", registro.alunos_aulas.map(({ id }) => id));
  await excluirIds(supabase, "aulas", registro.aulas.map(({ id }) => id));
  await excluirIds(supabase, "horarios_recorrentes_alunos", registro.rotinas.map(({ id }) => id));
  await excluirIds(supabase, "integrantes_grupos_aula", registro.integrantes.map(({ id }) => id));
  await excluirIds(supabase, "alunos", registro.alunos.map(({ id }) => id));
  await excluirIds(supabase, "grupos_aula", registro.grupos.map(({ id }) => id));

  const total = CHAVES_COLECOES.reduce((soma, chave) => soma + registro[chave].length, 0);
  await rm(CAMINHO_REGISTRO, { force: true });
  return { encontrouRegistro: true, total };
}

function minutosDoHorario(horario) {
  const [hora, minuto] = horario.split(":").map(Number);
  return hora * 60 + minuto;
}

export function calcularHorarioFim(horarioInicio) {
  const total = minutosDoHorario(horarioInicio) + 60;
  const hora = Math.floor(total / 60) % 24;
  const minuto = total % 60;
  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}:00`;
}

function horariosSeSobrepoem(inicioA, fimA, inicioB, fimB) {
  return (
    minutosDoHorario(inicioA) < minutosDoHorario(fimB) &&
    minutosDoHorario(fimA) > minutosDoHorario(inicioB)
  );
}

export async function encontrarHorarioLivreAposMeioDia(supabase) {
  const { data: disponibilidades, error: erroDisponibilidades } = await supabase
    .from("disponibilidade_semanal")
    .select("id,dia_semana,horario_inicio,horario_fim")
    .eq("ativo", true)
    .gte("horario_inicio", "12:00:00")
    .lte("horario_inicio", "19:00:00")
    .order("horario_inicio")
    .order("dia_semana");
  garantirSemErro(erroDisponibilidades, "Falha ao consultar horarios disponiveis");

  const { data: rotinas, error: erroRotinas } = await supabase
    .from("horarios_recorrentes_alunos")
    .select("dia_semana,horario_inicio,horario_fim")
    .eq("ativo", true);
  garantirSemErro(erroRotinas, "Falha ao consultar horarios ocupados");

  const horarioLivre = (disponibilidades ?? []).find(
    (disponibilidade) =>
      !(rotinas ?? []).some(
        (rotina) =>
          rotina.dia_semana === disponibilidade.dia_semana &&
          horariosSeSobrepoem(
            disponibilidade.horario_inicio,
            disponibilidade.horario_fim,
            rotina.horario_inicio,
            rotina.horario_fim,
          ),
      ),
  );

  if (!horarioLivre) {
    throw new Error("Nao existe horario semanal livre entre 12:00 e 19:00 para executar o teste.");
  }

  return horarioLivre;
}

export function obterDataAtualSaoPaulo() {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).formatToParts(new Date());
  const valor = (tipo) => partes.find((parte) => parte.type === tipo)?.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

export function somarDias(data, quantidade) {
  const instante = new Date(`${data}T12:00:00.000Z`);
  instante.setUTCDate(instante.getUTCDate() + quantidade);
  return instante.toISOString().slice(0, 10);
}

export async function encerrarClienteTeste(supabase) {
  if (supabase) await supabase.auth.signOut();
}
