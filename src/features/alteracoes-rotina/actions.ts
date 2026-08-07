"use server";

import { revalidatePath } from "next/cache";

import {
  alteracaoRotinaIdSchema,
  alteracaoRotinaSchema,
} from "@/features/alteracoes-rotina/schemas";
import type { EstadoAlteracaoRotina } from "@/features/alteracoes-rotina/types";
import { obterDataAtualSaoPaulo } from "@/features/agenda/datas";
import { buscarSlotsCadastroAluno } from "@/features/alunos/queries";
import { createSupabaseActionClient } from "@/lib/supabase/server";
import { calcularHorarioFim } from "@/utils/agenda";

function lerRotinas(formData: FormData) {
  const valor = formData.get("rotinas");
  if (typeof valor !== "string") return [];

  try {
    const rotinas = JSON.parse(valor);
    return Array.isArray(rotinas) ? rotinas : [];
  } catch {
    return [];
  }
}

async function obterClienteAutenticado() {
  const supabase = await createSupabaseActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

function revalidar(alunoId: string) {
  revalidatePath(`/alunos/${alunoId}`);
  revalidatePath("/alunos");
  revalidatePath("/agenda");
  revalidatePath("/painel");
}

export async function programarAlteracaoRotinaAction(
  alunoId: string,
  _estado: EstadoAlteracaoRotina,
  formData: FormData,
): Promise<EstadoAlteracaoRotina> {
  const dados = alteracaoRotinaSchema.safeParse({
    aluno_id: alunoId,
    data_vigencia: formData.get("data_vigencia"),
    motivo: formData.get("motivo"),
    rotinas: lerRotinas(formData),
  });
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  if (dados.data.data_vigencia <= obterDataAtualSaoPaulo()) {
    return {
      status: "erro",
      mensagem: "Para uma mudanca programada, escolha uma data futura.",
    };
  }

  const slots = await buscarSlotsCadastroAluno(alunoId);
  const slotPorChave = new Map(slots.map((slot) => [slot.chave, slot]));
  const horarioIndisponivel = dados.data.rotinas.find((rotina) => {
    const slot = slotPorChave.get(`${rotina.dia_semana}|${rotina.horario_inicio}`);
    return !slot?.disponivel;
  });
  if (horarioIndisponivel) {
    return {
      status: "erro",
      mensagem: `O horario de ${horarioIndisponivel.dia_semana.toLowerCase()} as ${horarioIndisponivel.horario_inicio} nao esta disponivel.`,
    };
  }

  const supabase = await obterClienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };

  const { data: alteracao, error: erroAlteracao } = await supabase
    .from("alteracoes_rotina_alunos")
    .insert({
      aluno_id: dados.data.aluno_id,
      data_vigencia: dados.data.data_vigencia,
      motivo: dados.data.motivo || null,
      status: "AGENDADA",
    })
    .select("id")
    .single();
  if (erroAlteracao || !alteracao) {
    return {
      status: "erro",
      mensagem: erroAlteracao?.message.includes("duplicate")
        ? "Ja existe uma mudanca programada para essa data."
        : erroAlteracao?.message ?? "Nao foi possivel programar a mudanca.",
    };
  }

  const { error: erroItens } = await supabase.from("itens_alteracao_rotina").insert(
    dados.data.rotinas.map((rotina) => ({
      alteracao_rotina_id: alteracao.id,
      dia_semana: rotina.dia_semana,
      horario_inicio: rotina.horario_inicio,
      horario_fim: calcularHorarioFim(rotina.horario_inicio),
      capacidade_maxima: rotina.capacidade_maxima,
    })),
  );
  if (erroItens) {
    await supabase.from("alteracoes_rotina_alunos").delete().eq("id", alteracao.id);
    return { status: "erro", mensagem: erroItens.message };
  }

  revalidar(alunoId);
  return {
    status: "sucesso",
    mensagem: `Nova rotina programada para ${dados.data.data_vigencia.split("-").reverse().join("/")}.`,
  };
}

export async function cancelarAlteracaoRotinaAction(formData: FormData) {
  const id = alteracaoRotinaIdSchema.safeParse(formData.get("alteracao_id"));
  const alunoId = alteracaoRotinaIdSchema.safeParse(formData.get("aluno_id"));
  if (!id.success || !alunoId.success) return;

  const supabase = await obterClienteAutenticado();
  if (!supabase) return;

  await supabase
    .from("alteracoes_rotina_alunos")
    .update({ status: "CANCELADA" })
    .eq("id", id.data)
    .eq("aluno_id", alunoId.data)
    .eq("status", "AGENDADA");
  revalidar(alunoId.data);
}
