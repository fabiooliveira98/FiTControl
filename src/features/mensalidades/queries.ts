import { obterDataAtualSaoPaulo } from "@/features/agenda/datas";
import type {
  AjusteFinanceiroPendente,
  MensalidadeComAluno,
} from "@/features/mensalidades/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Aluno, Aula, Cancelamento, Mensalidade, StatusMensalidade } from "@/types/dominio";

export async function buscarAlunosParaFinanceiro() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("alunos")
    .select("id,nome")
    .neq("status", "INATIVO")
    .order("nome");
  return (data ?? []) as Pick<Aluno, "id" | "nome">[];
}

export async function buscarMensalidades({
  status,
  alunoId,
  limite = 100,
}: {
  status?: StatusMensalidade;
  alunoId?: string;
  limite?: number;
} = {}): Promise<MensalidadeComAluno[]> {
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("mensalidades")
    .update({ status: "ATRASADO" })
    .eq("status", "PENDENTE")
    .lt("data_vencimento", obterDataAtualSaoPaulo());

  let consulta = supabase
    .from("mensalidades")
    .select("*")
    .order("data_vencimento", { ascending: false })
    .limit(limite);
  if (status) consulta = consulta.eq("status", status);
  if (alunoId) consulta = consulta.eq("aluno_id", alunoId);

  const { data: mensalidades, error } = await consulta;
  if (error || !mensalidades?.length) return [];

  const mensalidadesBase = mensalidades as Mensalidade[];
  const alunoIds = Array.from(new Set(mensalidadesBase.map((item) => item.aluno_id)));
  const { data: alunos } = await supabase
    .from("alunos")
    .select("id,nome")
    .in("id", alunoIds);
  const alunoPorId = new Map(
    ((alunos ?? []) as Pick<Aluno, "id" | "nome">[]).map((aluno) => [aluno.id, aluno]),
  );

  return mensalidadesBase.flatMap((mensalidade) => {
    const aluno = alunoPorId.get(mensalidade.aluno_id);
    return aluno ? [{ ...mensalidade, aluno }] : [];
  });
}

export async function buscarAjustesFinanceirosPendentes(): Promise<AjusteFinanceiroPendente[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: cancelamentos }, { data: mensalidades }] = await Promise.all([
    supabase
      .from("cancelamentos")
      .select("*")
      .eq("ajustado_financeiro", true)
      .not("aluno_id", "is", null)
      .order("created_at", { ascending: false }),
    supabase.from("mensalidades").select("cancelamento_id").not("cancelamento_id", "is", null),
  ]);
  const cancelamentosLancados = new Set(
    (mensalidades ?? []).map((mensalidade) => mensalidade.cancelamento_id),
  );
  const pendentes = ((cancelamentos ?? []) as Cancelamento[]).filter(
    (cancelamento) => !cancelamentosLancados.has(cancelamento.id),
  );
  if (!pendentes.length) return [];

  const alunoIds = Array.from(
    new Set(pendentes.map((cancelamento) => cancelamento.aluno_id).filter(Boolean)),
  ) as string[];
  const aulaIds = Array.from(new Set(pendentes.map((cancelamento) => cancelamento.aula_id)));
  const [{ data: alunos }, { data: aulas }] = await Promise.all([
    supabase.from("alunos").select("id,nome").in("id", alunoIds),
    supabase.from("aulas").select("id,data,horario_inicio").in("id", aulaIds),
  ]);
  const alunoPorId = new Map(
    ((alunos ?? []) as Pick<Aluno, "id" | "nome">[]).map((aluno) => [aluno.id, aluno]),
  );
  const aulaPorId = new Map(
    ((aulas ?? []) as Pick<Aula, "id" | "data" | "horario_inicio">[]).map((aula) => [aula.id, aula]),
  );

  return pendentes.flatMap((cancelamento) => {
    const aluno = cancelamento.aluno_id ? alunoPorId.get(cancelamento.aluno_id) : null;
    const aula = aulaPorId.get(cancelamento.aula_id);
    return aluno && aula ? [{ cancelamento, aluno, aula }] : [];
  });
}
