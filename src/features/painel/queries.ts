import { buscarAgendaOperacional } from "@/features/agenda/queries";
import {
  obterDataAtualSaoPaulo,
  obterDiaSemana,
  type VisualizacaoAgenda,
} from "@/features/agenda/datas";
import type {
  AulaDoDia,
  DadosDashboard,
  DadosPainelHoje,
  RankingReposicao,
  StatusOperacionalAula,
} from "@/features/painel/types";
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

function obterHorarioAtualSaoPaulo() {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hora = partes.find((parte) => parte.type === "hour")?.value ?? "00";
  const minuto = partes.find((parte) => parte.type === "minute")?.value ?? "00";

  return `${hora}:${minuto}`;
}

function obterStatusOperacional(
  aula: AulaDoDia,
  dataSelecionada: string,
  horarioAtual: string,
): StatusOperacionalAula {
  if (
    aula.status === "CANCELADA" &&
    aula.participantes.some(
      (participante) => participante.tipo_cancelamento === "REMANEJAMENTO",
    )
  ) {
    return "REMANEJADA";
  }
  if (aula.status === "CANCELADA") return "CANCELADA";
  if (aula.status === "CONCLUIDA") return "CONCLUIDA";
  const hoje = obterDataAtualSaoPaulo();
  if (dataSelecionada < hoje) return "PENDENTE_FINALIZACAO";
  if (dataSelecionada > hoje) return "AGENDADA";

  const inicio = aula.horario_inicio.slice(0, 5);
  const fim = aula.horario_fim.slice(0, 5);
  if (horarioAtual >= inicio && horarioAtual < fim) return "EM_ANDAMENTO";
  if (horarioAtual >= fim) return "PENDENTE_FINALIZACAO";

  return "AGENDADA";
}

export async function buscarDadosPainelHoje(
  dataSelecionada: string,
): Promise<DadosPainelHoje> {
  const [agenda, ranking] = await Promise.all([
    buscarAgendaOperacional(dataSelecionada, "semana"),
    buscarRanking(),
  ]);
  const horarioAtual = obterHorarioAtualSaoPaulo();
  const hoje = obterDataAtualSaoPaulo();
  const dia = agenda.dias.find((item) => item.data === dataSelecionada);
  const aulasBase = agenda.aulas
    .filter((aula) => aula.data === dataSelecionada && aula.participantes.length > 0)
    .sort((a, b) => a.horario_inicio.localeCompare(b.horario_inicio));
  const aulasSemProxima = aulasBase.map<AulaDoDia>((aula) => {
    const base = {
      ...aula,
      remanejada: aula.origem === "REMANEJAMENTO",
    } as AulaDoDia;

    return {
      ...base,
      status_operacional: obterStatusOperacional(base, dataSelecionada, horarioAtual),
    };
  });
  const indiceProxima = aulasSemProxima.findIndex(
    (aula) =>
      dataSelecionada >= hoje &&
      aula.status_operacional === "AGENDADA" &&
      (dataSelecionada > hoje || aula.horario_inicio.slice(0, 5) > horarioAtual) &&
      aula.participantes.some((participante) => !participante.cancelado),
  );
  const aulas = aulasSemProxima.map((aula, indice) => ({
    ...aula,
    status_operacional:
      indice === indiceProxima ? ("PROXIMA" as const) : aula.status_operacional,
  }));
  const proximaAula =
    aulas.find((aula) => aula.status_operacional === "EM_ANDAMENTO") ??
    aulas.find((aula) => aula.status_operacional === "PROXIMA") ??
    null;
  const aulasRestantes = aulas.filter(
    (aula) =>
      aula.participantes.some((participante) => !participante.cancelado) &&
      ["PROXIMA", "EM_ANDAMENTO", "AGENDADA"].includes(aula.status_operacional),
  ).length;

  return {
    data: dataSelecionada,
    dia_semana: dia?.dia_semana ?? obterDiaSemana(dataSelecionada),
    semana: agenda.dias.map((item) => ({
      data: item.data,
      dia_semana: item.dia_semana,
      total_aulas: item.total_aulas,
      total_livres: item.total_livres,
    })),
    aulas,
    horarios_livres: dia?.slots.filter((slot) => slot.status === "LIVRE") ?? [],
    total_aulas: aulas.filter((aula) => aula.status !== "CANCELADA").length,
    aulas_restantes: aulasRestantes,
    aulas_para_finalizar: aulas.filter((aula) =>
      ["AGENDADA", "REPOSTA"].includes(aula.status),
    ).length,
    proxima_aula: proximaAula,
    total_reposicoes_pendentes: ranking.reduce(
      (total, item) => total + item.quantidade,
      0,
    ),
    ranking,
    sincronizada: agenda.sincronizada,
    mensagem_erro: agenda.mensagemErro,
  };
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
