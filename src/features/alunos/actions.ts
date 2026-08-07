"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { obterDataAtualSaoPaulo } from "@/features/agenda/datas";
import { alunoComRotinasSchema, alunoIdSchema } from "@/features/alunos/schemas";
import type {
  EstadoAcaoAluno,
  RotinaAlunoFormulario,
} from "@/features/alunos/types";
import { createSupabaseActionClient } from "@/lib/supabase/server";
import type { DiaSemana, TipoAula } from "@/types/dominio";
import {
  calcularHorarioFim,
  formatarHorario,
  horariosSeSobrepoem,
} from "@/utils/agenda";

function tipoPorCapacidade(capacidade: number): TipoAula {
  if (capacidade === 1) return "INDIVIDUAL";
  if (capacidade === 2) return "DUPLA";
  return "TRIO";
}

function dataAposDias(dataIso: string, dias: number) {
  const data = new Date(`${dataIso}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

function lerRotinas(formData: FormData): unknown[] {
  const valor = formData.get("rotinas");
  if (typeof valor !== "string") return [];

  try {
    const rotinas = JSON.parse(valor);
    return Array.isArray(rotinas) ? rotinas : [];
  } catch {
    return [];
  }
}

function extrairDados(formData: FormData) {
  return alunoComRotinasSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    status: formData.get("status"),
    observacoes: formData.get("observacoes"),
    rotinas: lerRotinas(formData),
  });
}

function treinaDeSegundaASexta(rotinas: RotinaAlunoFormulario[]) {
  const dias = new Set(rotinas.map((rotina) => rotina.dia_semana));
  return (["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA"] as DiaSemana[]).every(
    (dia) => dias.has(dia),
  );
}

async function obterClienteAutenticado() {
  const supabase = await createSupabaseActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

async function validarRotinas(
  supabase: NonNullable<Awaited<ReturnType<typeof obterClienteAutenticado>>>,
  rotinas: RotinaAlunoFormulario[],
  alunoId?: string,
) {
  for (let indice = 0; indice < rotinas.length; indice += 1) {
    const rotina = rotinas[indice];
    const fimRotina = calcularHorarioFim(rotina.horario_inicio);

    for (let comparacao = indice + 1; comparacao < rotinas.length; comparacao += 1) {
      const outra = rotinas[comparacao];
      if (
        rotina.dia_semana === outra.dia_semana &&
        horariosSeSobrepoem(
          rotina.horario_inicio,
          fimRotina,
          outra.horario_inicio,
          calcularHorarioFim(outra.horario_inicio),
        )
      ) {
        return `Os horarios de ${rotina.dia_semana.toLowerCase()} se sobrepoem.`;
      }
    }
  }

  for (const rotina of rotinas) {
    const { data: disponibilidade, error: erroDisponibilidade } = await supabase
      .from("disponibilidade_semanal")
      .select("id")
      .eq("dia_semana", rotina.dia_semana)
      .eq("horario_inicio", rotina.horario_inicio)
      .eq("ativo", true)
      .maybeSingle();

    if (erroDisponibilidade) {
      return `Nao foi possivel verificar a disponibilidade: ${erroDisponibilidade.message}`;
    }

    if (!disponibilidade) {
      return `O horario de ${rotina.dia_semana.toLowerCase()} as ${rotina.horario_inicio} nao esta disponivel.`;
    }

    const { data: ocupantes, error: erroOcupantes } = await supabase
      .from("horarios_recorrentes_alunos")
      .select("aluno_id,grupo_aula_id,horario_inicio,horario_fim")
      .eq("dia_semana", rotina.dia_semana)
      .eq("ativo", true);

    if (erroOcupantes) {
      return `Nao foi possivel verificar os horarios ocupados: ${erroOcupantes.message}`;
    }

    const rotinasDeOutros = (ocupantes ?? []).filter((item) => item.aluno_id !== alunoId);
    const horarioFim = calcularHorarioFim(rotina.horario_inicio);
    const conflitos = rotinasDeOutros.filter(
      (item) =>
        formatarHorario(item.horario_inicio) !== formatarHorario(rotina.horario_inicio) &&
        horariosSeSobrepoem(
          rotina.horario_inicio,
          horarioFim,
          item.horario_inicio,
          item.horario_fim,
        ),
    );

    if (conflitos.length) {
      return `O horario de ${rotina.dia_semana.toLowerCase()} as ${rotina.horario_inicio} se sobrepoe a uma aula existente.`;
    }

    const ocupantesMesmoInicio = rotinasDeOutros.filter(
      (item) =>
        formatarHorario(item.horario_inicio) === formatarHorario(rotina.horario_inicio),
    );

    const outrosAlunos = new Set(
      ocupantesMesmoInicio.map((item) => item.aluno_id),
    );
    const grupoId = ocupantesMesmoInicio.find((item) => item.grupo_aula_id)?.grupo_aula_id;
    let capacidade = rotina.capacidade_maxima;

    if (grupoId) {
      const { data: grupo } = await supabase
        .from("grupos_aula")
        .select("capacidade_maxima")
        .eq("id", grupoId)
        .single();
      capacidade = grupo?.capacidade_maxima ?? capacidade;
    }

    if (outrosAlunos.size >= capacidade) {
      return `O horario de ${rotina.dia_semana.toLowerCase()} as ${rotina.horario_inicio} esta lotado.`;
    }
  }

  return null;
}

async function salvarRotinas(
  supabase: NonNullable<Awaited<ReturnType<typeof obterClienteAutenticado>>>,
  alunoId: string,
  nomeAluno: string,
  rotinas: RotinaAlunoFormulario[],
) {
  const gruposCriados: string[] = [];

  for (const rotina of rotinas) {
    const { data: existente } = await supabase
      .from("horarios_recorrentes_alunos")
      .select("grupo_aula_id")
      .eq("dia_semana", rotina.dia_semana)
      .eq("horario_inicio", rotina.horario_inicio)
      .eq("ativo", true)
      .not("grupo_aula_id", "is", null)
      .limit(1)
      .maybeSingle();

    let grupoId = existente?.grupo_aula_id ?? null;
    if (!grupoId) {
      const { data: grupo, error } = await supabase
        .from("grupos_aula")
        .insert({
          nome_referencia: `${rotina.dia_semana} ${rotina.horario_inicio} - ${nomeAluno}`,
          tipo: tipoPorCapacidade(rotina.capacidade_maxima),
          capacidade_maxima: rotina.capacidade_maxima,
          ativo: true,
        })
        .select("id")
        .single();

      if (error || !grupo) throw new Error(error?.message ?? "Nao foi possivel criar o grupo.");
      grupoId = grupo.id;
      gruposCriados.push(grupoId);
    }

    const { error: erroIntegrante } = await supabase
      .from("integrantes_grupos_aula")
      .upsert(
        { grupo_aula_id: grupoId, aluno_id: alunoId },
        { onConflict: "grupo_aula_id,aluno_id" },
      );
    if (erroIntegrante) throw new Error(erroIntegrante.message);

    const { error: erroRotina } = await supabase.from("horarios_recorrentes_alunos").insert({
      aluno_id: alunoId,
      grupo_aula_id: grupoId,
      dia_semana: rotina.dia_semana,
      horario_inicio: rotina.horario_inicio,
      horario_fim: calcularHorarioFim(rotina.horario_inicio),
      ativo: true,
    });
    if (erroRotina) throw new Error(erroRotina.message);
  }

  return gruposCriados;
}

async function materializarProximasAulas(
  supabase: NonNullable<Awaited<ReturnType<typeof obterClienteAutenticado>>>,
) {
  const inicio = obterDataAtualSaoPaulo();
  const { error } = await supabase.rpc("materializar_aulas_periodo", {
    p_data_inicio: inicio,
    p_data_fim: dataAposDias(inicio, 90),
  });

  return error?.message ?? null;
}

function mensagemFalha(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Nao foi possivel salvar o aluno. Tente novamente.";
}

export async function criarAlunoAction(
  _estado: EstadoAcaoAluno,
  formData: FormData,
): Promise<EstadoAcaoAluno> {
  const dados = extrairDados(formData);
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await obterClienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };

  const erroRotinas = await validarRotinas(supabase, dados.data.rotinas);
  if (erroRotinas) return { status: "erro", mensagem: erroRotinas };

  const { data: aluno, error } = await supabase
    .from("alunos")
    .insert({
      nome: dados.data.nome,
      email: dados.data.email || null,
      telefone: dados.data.telefone || null,
      status: dados.data.status,
      observacoes: dados.data.observacoes || null,
      treina_segunda_a_sexta: treinaDeSegundaASexta(dados.data.rotinas),
    })
    .select("id")
    .single();

  if (error || !aluno) {
    return { status: "erro", mensagem: error?.message ?? "Nao foi possivel criar o aluno." };
  }

  let gruposCriados: string[] = [];
  try {
    gruposCriados = await salvarRotinas(supabase, aluno.id, dados.data.nome, dados.data.rotinas);
  } catch (erro) {
    await supabase.from("alunos").delete().eq("id", aluno.id);
    if (gruposCriados.length) {
      await supabase.from("grupos_aula").delete().in("id", gruposCriados);
    }
    return { status: "erro", mensagem: mensagemFalha(erro) };
  }

  const erroSincronizacao = await materializarProximasAulas(supabase);

  revalidatePath("/alunos");
  revalidatePath(`/alunos/${aluno.id}`);
  revalidatePath("/agenda");
  revalidatePath("/painel");
  redirect(
    `/alunos/${aluno.id}?criado=1${erroSincronizacao ? "&sincronizacao=pendente" : ""}`,
  );
}

export async function atualizarAlunoAction(
  alunoId: string,
  _estado: EstadoAcaoAluno,
  formData: FormData,
): Promise<EstadoAcaoAluno> {
  const id = alunoIdSchema.safeParse(alunoId);
  const dados = extrairDados(formData);
  if (!id.success || !dados.success) {
    return {
      status: "erro",
      mensagem: dados.success ? "Aluno invalido." : dados.error.issues[0]?.message,
    };
  }

  const supabase = await obterClienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };

  const { error: erroAluno } = await supabase
    .from("alunos")
    .update({
      nome: dados.data.nome,
      email: dados.data.email || null,
      telefone: dados.data.telefone || null,
      status: dados.data.status,
      observacoes: dados.data.observacoes || null,
      treina_segunda_a_sexta: treinaDeSegundaASexta(dados.data.rotinas),
    })
    .eq("id", id.data);

  if (erroAluno) return { status: "erro", mensagem: erroAluno.message };

  revalidatePath("/alunos");
  revalidatePath(`/alunos/${id.data}`);
  revalidatePath("/agenda");
  revalidatePath("/painel");
  redirect(`/alunos/${id.data}?atualizado=1`);
}

export async function arquivarAlunoAction(formData: FormData) {
  const id = alunoIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;

  const supabase = await obterClienteAutenticado();
  if (!supabase) return;

  await supabase.from("alunos").update({ status: "INATIVO" }).eq("id", id.data);
  await supabase
    .from("horarios_recorrentes_alunos")
    .update({ ativo: false })
    .eq("aluno_id", id.data);

  revalidatePath("/alunos");
  revalidatePath(`/alunos/${id.data}`);
  revalidatePath("/agenda");
}
