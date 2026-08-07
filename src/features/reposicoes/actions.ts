"use server";

import { revalidatePath } from "next/cache";

import {
  cancelamentoSchema,
  confirmacaoReposicaoSchema,
  finalizacaoAulaSchema,
  finalizacaoDiaSchema,
  participantesAulaSchema,
  remanejamentoAulaSchema,
  reposicaoIdSchema,
} from "@/features/reposicoes/schemas";
import type {
  EstadoAcaoAula,
  EstadoAcaoReposicao,
} from "@/features/reposicoes/types";
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

export async function cancelarParticipacoesAction(
  aulaId: string,
  alunoIds: string[],
  _estado: EstadoAcaoAula,
  formData: FormData,
): Promise<EstadoAcaoAula> {
  const dados = participantesAulaSchema.safeParse({
    aula_id: aulaId,
    aluno_ids: alunoIds,
    motivo: formData.get("motivo"),
  });
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await clienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };

  const { error } = await supabase.rpc("cancelar_participacoes_aula", {
    p_aula_id: dados.data.aula_id,
    p_aluno_ids: dados.data.aluno_ids,
    p_motivo: dados.data.motivo || null,
  });
  if (error) return { status: "erro", mensagem: traduzirErro(error.message) };

  revalidarOperacao();
  revalidatePath(`/agenda/aulas/${aulaId}`);
  return {
    status: "sucesso",
    mensagem:
      alunoIds.length > 1 ? "Cancelamentos registrados." : "Cancelamento registrado.",
  };
}

export async function remanejarParticipacoesAction(
  aulaId: string,
  alunoIds: string[],
  _estado: EstadoAcaoAula,
  formData: FormData,
): Promise<EstadoAcaoAula> {
  const dados = remanejamentoAulaSchema.safeParse({
    aula_id: aulaId,
    aluno_ids: alunoIds,
    data: formData.get("data"),
    horario_inicio: formData.get("horario_inicio"),
    motivo: formData.get("motivo"),
  });
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await clienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };

  const { error } = await supabase.rpc("remanejar_participacoes_aula", {
    p_aula_origem_id: dados.data.aula_id,
    p_aluno_ids: dados.data.aluno_ids,
    p_data: dados.data.data,
    p_horario_inicio: dados.data.horario_inicio,
    p_motivo: dados.data.motivo || null,
  });
  if (error) return { status: "erro", mensagem: traduzirErro(error.message) };

  revalidarOperacao();
  revalidatePath(`/agenda/aulas/${aulaId}`);
  return { status: "sucesso", mensagem: "Aula remanejada e confirmada na agenda." };
}

export async function finalizarAulaAction(
  aulaId: string,
  _estado: EstadoAcaoAula,
  _formData: FormData,
): Promise<EstadoAcaoAula> {
  void _estado;
  void _formData;
  const dados = finalizacaoAulaSchema.safeParse({ aula_id: aulaId });
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await clienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };

  const { data, error } = await supabase.rpc("finalizar_aula", {
    p_aula_id: dados.data.aula_id,
  });
  if (error) return { status: "erro", mensagem: traduzirErro(error.message) };
  if (!data) return { status: "erro", mensagem: "A aula nao pode ser finalizada agora." };

  revalidarOperacao();
  revalidatePath(`/agenda/aulas/${aulaId}`);
  return { status: "sucesso", mensagem: "Aula finalizada." };
}

export async function finalizarDiaAction(
  data: string,
  _estado: EstadoAcaoAula,
  _formData: FormData,
): Promise<EstadoAcaoAula> {
  void _estado;
  void _formData;
  const dados = finalizacaoDiaSchema.safeParse({ data });
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await clienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };

  const { data: total, error } = await supabase.rpc("finalizar_dia", {
    p_data: dados.data.data,
  });
  if (error) return { status: "erro", mensagem: traduzirErro(error.message) };

  revalidarOperacao();
  return {
    status: "sucesso",
    mensagem: total
      ? `${total} aula(s) finalizada(s).`
      : "Todas as aulas desse dia ja estavam finalizadas.",
  };
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
