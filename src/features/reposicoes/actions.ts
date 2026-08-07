"use server";

import { revalidatePath } from "next/cache";

import {
  cancelamentoSchema,
  confirmacaoReposicaoSchema,
  reposicaoIdSchema,
} from "@/features/reposicoes/schemas";
import type { EstadoAcaoReposicao } from "@/features/reposicoes/types";
import { createSupabaseActionClient } from "@/lib/supabase/server";

async function clienteAutenticado() {
  const supabase = await createSupabaseActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

function revalidarOperacao() {
  revalidatePath("/agenda");
  revalidatePath("/painel");
  revalidatePath("/reposicoes");
}

function traduzirErro(mensagem?: string) {
  if (!mensagem) return "Nao foi possivel concluir a operacao.";
  if (mensagem.includes("already exists") || mensagem.includes("duplicate")) {
    return "Esse cancelamento ja foi registrado.";
  }
  if (mensagem.includes("materializar") || mensagem.includes("schema cache")) {
    return "O banco nao esta disponivel para concluir esta operacao.";
  }
  return mensagem;
}

export async function cancelarParticipacaoAction(
  aulaId: string,
  alunoId: string,
  _estado: EstadoAcaoReposicao,
  formData: FormData,
): Promise<EstadoAcaoReposicao> {
  const dados = cancelamentoSchema.safeParse({
    aula_id: aulaId,
    aluno_id: alunoId,
    motivo: formData.get("motivo"),
  });
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await clienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };

  const { error } = await supabase.rpc("cancelar_aula_aluno", {
    p_aula_id: dados.data.aula_id,
    p_aluno_id: dados.data.aluno_id,
    p_motivo: dados.data.motivo || null,
  });
  if (error) return { status: "erro", mensagem: traduzirErro(error.message) };

  revalidarOperacao();
  revalidatePath(`/agenda/aulas/${aulaId}`);
  return { status: "sucesso", mensagem: "Cancelamento registrado." };
}

export async function confirmarReposicaoAction(
  _estado: EstadoAcaoReposicao,
  formData: FormData,
): Promise<EstadoAcaoReposicao> {
  const dados = confirmacaoReposicaoSchema.safeParse({
    reposicao_id: formData.get("reposicao_id"),
    data: formData.get("data"),
    horario_inicio: formData.get("horario_inicio"),
  });
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await clienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };

  const { error } = await supabase.rpc("confirmar_reposicao", {
    p_reposicao_id: dados.data.reposicao_id,
    p_data: dados.data.data,
    p_horario_inicio: dados.data.horario_inicio,
  });
  if (error) return { status: "erro", mensagem: traduzirErro(error.message) };

  revalidarOperacao();
  return { status: "sucesso", mensagem: "Reposicao confirmada na agenda." };
}

export async function dispensarReposicaoAction(formData: FormData) {
  const id = reposicaoIdSchema.safeParse(formData.get("reposicao_id"));
  if (!id.success) return;

  const supabase = await clienteAutenticado();
  if (!supabase) return;

  const { data: reposicao } = await supabase
    .from("reposicoes")
    .select("cancelamento_id")
    .eq("id", id.data)
    .eq("status", "PENDENTE")
    .maybeSingle();
  if (!reposicao) return;

  await Promise.all([
    supabase.from("reposicoes").update({ status: "DISPENSADA" }).eq("id", id.data),
    supabase
      .from("cancelamentos")
      .update({ ajustado_financeiro: true })
      .eq("id", reposicao.cancelamento_id),
  ]);
  revalidarOperacao();
}
