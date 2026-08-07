import { buscarAgendaOperacional } from "@/features/agenda/queries";
import type { VisualizacaoAgenda } from "@/features/agenda/datas";
import type { DadosDashboard, RankingReposicao } from "@/features/painel/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Aluno, HorarioRecorrenteAluno } from "@/types/dominio";

async function buscarRanking(): Promise<RankingReposicao[]> {
  const supabase = await createSupabaseServerClient();
  const { data: reposicoes } = await supabase
    .from("reposicoes")
    .select("cancelamento_id")
    .eq("status", "PENDENTE");
  if (!reposicoes?.length) return [];

  const cancelamentoIds = reposicoes.map((item) => item.cancelamento_id);
  const { data: cancelamentos } = await supabase
    .from("cancelamentos")
    .select("id,aluno_id")
    .in("id", cancelamentoIds);
  const alunoIds = Array.from(
    new Set((cancelamentos ?? []).map((item) => item.aluno_id).filter(Boolean)),
  ) as string[];
  if (!alunoIds.length) return [];

  const [{ data: alunos }, { data: rotinas }] = await Promise.all([
    supabase.from("alunos").select("*").in("id", alunoIds),
    supabase
      .from("horarios_recorrentes_alunos")
      .select("*")
      .in("aluno_id", alunoIds)
      .eq("ativo", true),
  ]);
  const cancelamentoPorId = new Map(
    (cancelamentos ?? []).map((item) => [item.id, item.aluno_id as string]),
  );
  const quantidadePorAluno = new Map<string, number>();
  reposicoes.forEach((reposicao) => {
    const alunoId = cancelamentoPorId.get(reposicao.cancelamento_id);
    if (alunoId) quantidadePorAluno.set(alunoId, (quantidadePorAluno.get(alunoId) ?? 0) + 1);
  });

  return ((alunos ?? []) as Aluno[])
    .map((aluno) => ({
      aluno_id: aluno.id,
      nome: aluno.nome,
      quantidade: quantidadePorAluno.get(aluno.id) ?? 0,
      rotinas: ((rotinas ?? []) as HorarioRecorrenteAluno[]).filter(
        (rotina) => rotina.aluno_id === aluno.id,
      ),
    }))
    .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome));
}

export async function buscarDadosDashboard(
  dataReferencia: string,
  periodo: VisualizacaoAgenda,
): Promise<DadosDashboard> {
  const agendaPeriodo = await buscarAgendaOperacional(dataReferencia, periodo);
  const [agendaSemana, ranking] = await Promise.all([
    periodo === "semana"
      ? Promise.resolve(agendaPeriodo)
      : buscarAgendaOperacional(dataReferencia, "semana"),
    buscarRanking(),
  ]);
  const proximosLivres = agendaSemana.dias
    .flatMap((dia) => dia.slots)
    .filter((slot) => slot.status === "LIVRE")
    .slice(0, 6);

  return {
    agenda_periodo: agendaPeriodo,
    agenda_semana: agendaSemana,
    total_reposicoes_pendentes: ranking.reduce((total, item) => total + item.quantidade, 0),
    ranking,
    proximos_livres: proximosLivres,
  };
}
