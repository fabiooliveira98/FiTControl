import type { HistoricoAlteracoesRotinaResumo } from "@/features/alteracoes-rotina/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AlteracaoRotinaAluno, ItemAlteracaoRotina } from "@/types/dominio";

export async function buscarAlteracoesRotinaAluno(
  alunoId: string,
  limite = 2,
): Promise<HistoricoAlteracoesRotinaResumo> {
  const supabase = await createSupabaseServerClient();
  const { data: alteracoes, error, count } = await supabase
    .from("alteracoes_rotina_alunos")
    .select("*", { count: "exact" })
    .eq("aluno_id", alunoId)
    .order("data_vigencia", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error || !alteracoes?.length) {
    return { alteracoes: [], total: count ?? 0, limite };
  }

  const alteracoesBase = alteracoes as AlteracaoRotinaAluno[];
  const { data: itens } = await supabase
    .from("itens_alteracao_rotina")
    .select("*")
    .in(
      "alteracao_rotina_id",
      alteracoesBase.map((alteracao) => alteracao.id),
    )
    .order("dia_semana")
    .order("horario_inicio");

  return {
    alteracoes: alteracoesBase.map((alteracao) => ({
      ...alteracao,
      itens: ((itens ?? []) as ItemAlteracaoRotina[]).filter(
        (item) => item.alteracao_rotina_id === alteracao.id,
      ),
    })),
    total: count ?? alteracoesBase.length,
    limite,
  };
}
