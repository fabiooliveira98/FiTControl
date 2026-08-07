"use server";

import { revalidatePath } from "next/cache";

import { obterDataAtualSaoPaulo } from "@/features/agenda/datas";
import {
  ajusteFinanceiroSchema,
  mensalidadeIdSchema,
  mensalidadeSchema,
} from "@/features/mensalidades/schemas";
import type { EstadoMensalidade } from "@/features/mensalidades/types";
import { createSupabaseActionClient } from "@/lib/supabase/server";

async function obterClienteAutenticado() {
  const supabase = await createSupabaseActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

function revalidarFinanceiro(alunoId?: string) {
  revalidatePath("/financeiro");
  revalidatePath("/painel");
  if (alunoId) revalidatePath(`/alunos/${alunoId}`);
}

export async function criarMensalidadeAction(
  _estado: EstadoMensalidade,
  formData: FormData,
): Promise<EstadoMensalidade> {
  const dados = mensalidadeSchema.safeParse({
    aluno_id: formData.get("aluno_id"),
    valor_cobrado: formData.get("valor_cobrado"),
    data_vencimento: formData.get("data_vencimento"),
    data_pagamento: formData.get("data_pagamento"),
    status: formData.get("status"),
    observacao: formData.get("observacao"),
  });
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await obterClienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };

  const dataPagamento =
    dados.data.status === "PAGO"
      ? dados.data.data_pagamento ?? obterDataAtualSaoPaulo()
      : dados.data.data_pagamento ?? null;
  const { error } = await supabase.from("mensalidades").insert({
    aluno_id: dados.data.aluno_id,
    valor_cobrado: dados.data.valor_cobrado,
    data_vencimento: dados.data.data_vencimento,
    data_pagamento: dataPagamento,
    status: dados.data.status,
    observacao: dados.data.observacao || null,
  });
  if (error) return { status: "erro", mensagem: error.message };

  revalidarFinanceiro(dados.data.aluno_id);
  return { status: "sucesso", mensagem: "Lancamento financeiro criado." };
}

export async function criarAjusteFinanceiroAction(
  _estado: EstadoMensalidade,
  formData: FormData,
): Promise<EstadoMensalidade> {
  const dados = ajusteFinanceiroSchema.safeParse({
    cancelamento_id: formData.get("cancelamento_id"),
    valor_cobrado: formData.get("valor_cobrado"),
    data_vencimento: formData.get("data_vencimento"),
    observacao: formData.get("observacao"),
  });
  if (!dados.success) {
    return { status: "erro", mensagem: dados.error.issues[0]?.message };
  }

  const supabase = await obterClienteAutenticado();
  if (!supabase) return { status: "erro", mensagem: "Sua sessao expirou." };
  const { data: cancelamento } = await supabase
    .from("cancelamentos")
    .select("aluno_id")
    .eq("id", dados.data.cancelamento_id)
    .eq("ajustado_financeiro", true)
    .maybeSingle();
  if (!cancelamento?.aluno_id) {
    return { status: "erro", mensagem: "Cancelamento para ajuste nao encontrado." };
  }

  const { error } = await supabase.from("mensalidades").insert({
    aluno_id: cancelamento.aluno_id,
    cancelamento_id: dados.data.cancelamento_id,
    valor_cobrado: dados.data.valor_cobrado,
    data_vencimento: dados.data.data_vencimento,
    status: "AJUSTE",
    observacao: dados.data.observacao || "Ajuste financeiro por falta sem reposicao.",
  });
  if (error) {
    return {
      status: "erro",
      mensagem: error.message.includes("duplicate")
        ? "Esse cancelamento ja possui ajuste financeiro."
        : error.message,
    };
  }

  revalidarFinanceiro(cancelamento.aluno_id);
  return { status: "sucesso", mensagem: "Ajuste financeiro registrado." };
}

export async function marcarMensalidadePagaAction(formData: FormData) {
  const id = mensalidadeIdSchema.safeParse(formData.get("mensalidade_id"));
  if (!id.success) return;
  const supabase = await obterClienteAutenticado();
  if (!supabase) return;

  const { data } = await supabase
    .from("mensalidades")
    .update({ status: "PAGO", data_pagamento: obterDataAtualSaoPaulo() })
    .eq("id", id.data)
    .select("aluno_id")
    .maybeSingle();
  revalidarFinanceiro(data?.aluno_id);
}

export async function excluirMensalidadeAction(formData: FormData) {
  const id = mensalidadeIdSchema.safeParse(formData.get("mensalidade_id"));
  if (!id.success) return;
  const supabase = await obterClienteAutenticado();
  if (!supabase) return;

  const { data } = await supabase
    .from("mensalidades")
    .delete()
    .eq("id", id.data)
    .select("aluno_id")
    .maybeSingle();
  revalidarFinanceiro(data?.aluno_id);
}
