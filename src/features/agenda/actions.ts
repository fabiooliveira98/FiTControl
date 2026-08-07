"use server";

import { revalidatePath } from "next/cache";

import {
  excecaoAgendaSchema,
  faixaDisponibilidadeSchema,
  identificadorAgendaSchema,
} from "@/features/agenda/schemas";
import type { EstadoAcaoAgenda } from "@/features/agenda/types";
import { obterDiaSemana } from "@/features/agenda/datas";
import { createSupabaseActionClient } from "@/lib/supabase/server";
import { calcularHorarioFim, horariosSeSobrepoem } from "@/utils/agenda";

function revalidarAgenda() {
  revalidatePath("/agenda");
  revalidatePath("/configuracoes");
  revalidatePath("/painel");
}

function mensagemErroBanco(codigo?: string) {
  if (codigo === "23505") {
    return "Esse horario ja esta cadastrado.";
  }

  if (codigo === "PGRST202" || codigo === "PGRST205" || codigo === "42P01") {
    return "O banco nao esta disponivel para esta operacao.";
  }

  return "Nao foi possivel salvar. Tente novamente.";
}

async function obterSupabaseAutenticado() {
  const supabase = await createSupabaseActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? supabase : null;
}

export async function criarExcecaoAgendaAction(
  _estado: EstadoAcaoAgenda,
  formData: FormData,
): Promise<EstadoAcaoAgenda> {
  const dados = excecaoAgendaSchema.safeParse({
    tipo: formData.get("tipo"),
    data: formData.get("data"),
    horario_inicio: formData.get("horario_inicio"),
    motivo: formData.get("motivo"),
  });

  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await obterSupabaseAutenticado();
  if (!supabase) {
    return { status: "erro", mensagem: "Sua sessao expirou. Entre novamente." };
  }

  const horarioFim = calcularHorarioFim(dados.data.horario_inicio);
  const tabelaAtual =
    dados.data.tipo === "ABRIR" ? "aberturas_agenda" : "bloqueios_agenda";
  const tabelaOposta =
    dados.data.tipo === "ABRIR" ? "bloqueios_agenda" : "aberturas_agenda";
  const { data: excecoesOpostas } = await supabase
    .from(tabelaOposta)
    .select("horario_inicio,horario_fim")
    .eq("data", dados.data.data);

  const existeConflito = (excecoesOpostas ?? []).some((item) =>
    horariosSeSobrepoem(
      dados.data.horario_inicio,
      horarioFim,
      item.horario_inicio,
      item.horario_fim,
    ),
  );
  if (existeConflito) {
    return {
      status: "erro",
      mensagem: "Remova a excecao oposta que se sobrepoe a este horario.",
    };
  }

  if (dados.data.tipo === "ABRIR") {
    const { data: disponibilidade } = await supabase
      .from("disponibilidade_semanal")
      .select("id")
      .eq("dia_semana", obterDiaSemana(dados.data.data))
      .eq("horario_inicio", dados.data.horario_inicio)
      .eq("ativo", true)
      .maybeSingle();
    if (disponibilidade) {
      return {
        status: "erro",
        mensagem: "Esse horario ja esta aberto pela faixa semanal.",
      };
    }
  }

  const { error } = await supabase.from(tabelaAtual).insert({
    data: dados.data.data,
    horario_inicio: dados.data.horario_inicio,
    motivo: dados.data.motivo || null,
    horario_fim: horarioFim,
  });

  if (error) {
    return {
      status: "erro",
      mensagem:
        error.code === "23505"
          ? "Essa excecao ja esta cadastrada."
          : mensagemErroBanco(error.code),
    };
  }

  revalidarAgenda();
  return {
    status: "sucesso",
    mensagem:
      dados.data.tipo === "ABRIR"
        ? "Horario aberto nesta data."
        : "Horario bloqueado nesta data.",
  };
}

export async function aplicarFaixaDisponibilidadeAction(
  _estado: EstadoAcaoAgenda,
  formData: FormData,
): Promise<EstadoAcaoAgenda> {
  const dados = faixaDisponibilidadeSchema.safeParse({
    dias: formData.getAll("dias"),
    horario_inicio: formData.get("horario_inicio"),
    ultimo_inicio: formData.get("ultimo_inicio"),
    desativar_dias: formData.get("desativar_dias") === "true",
  });
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await obterSupabaseAutenticado();
  if (!supabase) {
    return { status: "erro", mensagem: "Sua sessao expirou. Entre novamente." };
  }

  const { error } = await supabase.rpc("aplicar_faixa_disponibilidade", {
    p_dias: dados.data.dias,
    p_horario_inicio: dados.data.horario_inicio,
    p_ultimo_inicio: dados.data.ultimo_inicio,
    p_desativar_dias: dados.data.desativar_dias,
  });
  if (error) {
    return { status: "erro", mensagem: mensagemErroBanco(error.code) };
  }

  revalidarAgenda();
  return { status: "sucesso", mensagem: "Faixa semanal atualizada." };
}

export async function alternarDisponibilidadeAction(formData: FormData) {
  const id = identificadorAgendaSchema.safeParse(formData.get("id"));
  const ativo = formData.get("ativo") === "true";
  if (!id.success) return;

  const supabase = await obterSupabaseAutenticado();
  if (!supabase) return;

  if (ativo) {
    const { data: disponibilidade } = await supabase
      .from("disponibilidade_semanal")
      .select("dia_semana,horario_inicio,horario_fim")
      .eq("id", id.data)
      .maybeSingle();
    if (!disponibilidade) return;

    const { data: rotinas } = await supabase
      .from("horarios_recorrentes_alunos")
      .select("horario_inicio,horario_fim")
      .eq("dia_semana", disponibilidade.dia_semana)
      .eq("ativo", true);
    if (
      (rotinas ?? []).some((rotina) =>
        horariosSeSobrepoem(
          disponibilidade.horario_inicio,
          disponibilidade.horario_fim,
          rotina.horario_inicio,
          rotina.horario_fim,
        ),
      )
    ) {
      return;
    }
  }

  await supabase.from("disponibilidade_semanal").update({ ativo: !ativo }).eq("id", id.data);
  revalidarAgenda();
}

export async function excluirExcecaoAgendaAction(formData: FormData) {
  const id = identificadorAgendaSchema.safeParse(formData.get("id"));
  const tipo = formData.get("tipo");
  if (!id.success || (tipo !== "ABRIR" && tipo !== "BLOQUEAR")) return;

  const supabase = await obterSupabaseAutenticado();
  if (!supabase) return;

  const tabela = tipo === "ABRIR" ? "aberturas_agenda" : "bloqueios_agenda";
  await supabase.from(tabela).delete().eq("id", id.data);
  revalidarAgenda();
}
