import type { AlteracaoRotinaComItens } from "@/features/alteracoes-rotina/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AlteracaoRotinaAluno, ItemAlteracaoRotina } from "@/types/dominio";

export async function buscarAlteracoesRotinaAluno(
  alunoId: string,
): Promise<AlteracaoRotinaComItens[]> {
  const supabase = await createSupabaseServerClient();
  const { data: alteracoes, error } = await supabase
    .from("alteracoes_rotina_alunos")
    .select("*")
    .eq("aluno_id", alunoId)
    .order("data_vigencia", { ascending: false });

  if (error || !alteracoes?.length) return [];

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

  return alteracoesBase.map((alteracao) => ({
    ...alteracao,
    itens: ((itens ?? []) as ItemAlteracaoRotina[]).filter(
      (item) => item.alteracao_rotina_id === alteracao.id,
    ),
  }));
}
