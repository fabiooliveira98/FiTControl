import {
  obterDataAtualSaoPaulo,
  obterDiaSemana,
  somarDias,
} from "@/features/agenda/datas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AberturaAgenda,
  Aluno,
  Aula,
  BloqueioAgenda,
  Cancelamento,
  DisponibilidadeSemanal,
  GrupoAula,
  Reposicao,
} from "@/types/dominio";
import type {
  DetalheAula,
  OpcoesRemanejamento,
  ReposicaoPendente,
  SugestaoReposicao,
} from "@/features/reposicoes/types";
import {
  compararHorarios,
  formatarHorario,
  horariosSeSobrepoem,
} from "@/utils/agenda";

export async function buscarDetalheAula(id: string): Promise<DetalheAula | null> {
  const supabase = await createSupabaseServerClient();
  const { data: aula } = await supabase.from("aulas").select("*").eq("id", id).maybeSingle();
  if (!aula) return null;

  const { data: participacoes } = await supabase
    .from("alunos_aulas")
    .select("aluno_id")
    .eq("aula_id", id);
  const alunoIds = (participacoes ?? []).map((item) => item.aluno_id);
  if (!alunoIds.length) return { ...(aula as Aula), participantes: [] };

  const [{ data: alunos }, { data: cancelamentos }] = await Promise.all([
    supabase.from("alunos").select("*").in("id", alunoIds),
    supabase.from("cancelamentos").select("*").eq("aula_id", id),
  ]);
  const cancelamentosBase = (cancelamentos ?? []) as Cancelamento[];
  const cancelamentoIds = cancelamentosBase.map((item) => item.id);
  const { data: reposicoes } = cancelamentoIds.length
    ? await supabase.from("reposicoes").select("*").in("cancelamento_id", cancelamentoIds)
    : { data: [] };
  const reposicoesBase = (reposicoes ?? []) as Reposicao[];

  return {
    ...(aula as Aula),
    participantes: ((alunos ?? []) as Aluno[]).map((aluno) => {
      const cancelamento =
        cancelamentosBase.find((item) => item.aluno_id === aluno.id) ?? null;
      return {
        ...aluno,
        cancelamento,
        reposicao: cancelamento
          ? reposicoesBase.find((item) => item.cancelamento_id === cancelamento.id) ?? null
          : null,
      };
    }),
  };
}

type ContextoSugestoes = {
  disponibilidades: DisponibilidadeSemanal[];
  bloqueios: BloqueioAgenda[];
  aberturas: AberturaAgenda[];
  aulas: Aula[];
  grupos: GrupoAula[];
  participacoes: Array<{ aula_id: string; aluno_id: string }>;
  cancelamentos: Cancelamento[];
  inicio: string;
  fim: string;
};

async function buscarContextoSugestoes(): Promise<ContextoSugestoes> {
  const supabase = await createSupabaseServerClient();
  const inicio = obterDataAtualSaoPaulo();
  const fim = somarDias(inicio, 45);
  await supabase.rpc("materializar_aulas_periodo", {
    p_data_inicio: inicio,
    p_data_fim: fim,
  });
  const [disponibilidades, bloqueios, aberturas, aulas, grupos] = await Promise.all([
    supabase.from("disponibilidade_semanal").select("*").eq("ativo", true),
    supabase
      .from("bloqueios_agenda")
      .select("*")
      .gte("data", inicio)
      .lte("data", fim),
    supabase
      .from("aberturas_agenda")
      .select("*")
      .gte("data", inicio)
      .lte("data", fim),
    supabase
      .from("aulas")
      .select("*")
      .gte("data", inicio)
      .lte("data", fim)
      .neq("status", "CANCELADA"),
    supabase.from("grupos_aula").select("*").eq("ativo", true),
  ]);
  const aulasBase = (aulas.data ?? []) as Aula[];
  const idsAulas = aulasBase.map((aula) => aula.id);
  const [participacoes, cancelamentos] = await Promise.all([
    idsAulas.length
      ? supabase.from("alunos_aulas").select("aula_id,aluno_id").in("aula_id", idsAulas)
      : Promise.resolve({ data: [] }),
    idsAulas.length
      ? supabase.from("cancelamentos").select("*").in("aula_id", idsAulas)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    disponibilidades: (disponibilidades.data ?? []) as DisponibilidadeSemanal[],
    bloqueios: (bloqueios.data ?? []) as BloqueioAgenda[],
    aberturas: (aberturas.data ?? []) as AberturaAgenda[],
    aulas: aulasBase,
    grupos: (grupos.data ?? []) as GrupoAula[],
    participacoes: (participacoes.data ?? []) as Array<{ aula_id: string; aluno_id: string }>,
    cancelamentos: (cancelamentos.data ?? []) as Cancelamento[],
    inicio,
    fim,
  };
}

function gerarSugestoes(
  contexto: ContextoSugestoes,
  alunoIds: string[],
  aulaOriginal: Aula,
): SugestaoReposicao[] {
  const sugestoes: SugestaoReposicao[] = [];
  const grupoPorId = new Map(contexto.grupos.map((grupo) => [grupo.id, grupo]));
  const quantidade = alunoIds.length;
  const capacidadeNova = aulaOriginal.grupo_aula_id
    ? grupoPorId.get(aulaOriginal.grupo_aula_id)?.capacidade_maxima ?? 3
    : 3;
  const horarioAtual = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

  for (let data = contexto.inicio; data <= contexto.fim; data = somarDias(data, 1)) {
    const diaSemana = obterDiaSemana(data);
    const candidatos = [
      ...contexto.disponibilidades.filter((item) => item.dia_semana === diaSemana),
      ...contexto.aberturas.filter((item) => item.data === data),
    ];
    const disponibilidadesDia = Array.from(
      new Map(
        candidatos.map((item) => [formatarHorario(item.horario_inicio), item]),
      ).values(),
    ).sort((a, b) => compararHorarios(a.horario_inicio, b.horario_inicio));

    for (const disponibilidade of disponibilidadesDia) {
      const horario = formatarHorario(disponibilidade.horario_inicio);
      const horarioFim = formatarHorario(disponibilidade.horario_fim);
      if (data === contexto.inicio && horario <= horarioAtual) continue;
      if (data === aulaOriginal.data && horario === formatarHorario(aulaOriginal.horario_inicio)) {
        continue;
      }
      if (
        contexto.bloqueios.some(
          (item) =>
            item.data === data &&
            horariosSeSobrepoem(
              horario,
              horarioFim,
              item.horario_inicio,
              item.horario_fim,
            ),
        )
      ) {
        continue;
      }

      const aulasSobrepostas = contexto.aulas.filter(
        (aula) =>
          aula.data === data &&
          horariosSeSobrepoem(
            horario,
            horarioFim,
            aula.horario_inicio,
            aula.horario_fim,
          ),
      );
      const alunoTemConflito = aulasSobrepostas.some((aula) =>
        contexto.participacoes.some(
          (participacao) =>
            participacao.aula_id === aula.id &&
            alunoIds.includes(participacao.aluno_id) &&
            !contexto.cancelamentos.some(
              (cancelamento) =>
                cancelamento.aula_id === aula.id &&
                cancelamento.aluno_id === participacao.aluno_id,
            ),
        ),
      );
      if (alunoTemConflito) continue;

      const aulasDoSlot = aulasSobrepostas.filter(
        (aula) => formatarHorario(aula.horario_inicio) === horario,
      );

      const alunoJaParticipouDoSlot = aulasDoSlot.some((aula) =>
        contexto.participacoes.some(
          (participacao) =>
            participacao.aula_id === aula.id &&
            alunoIds.includes(participacao.aluno_id),
        ),
      );
      if (alunoJaParticipouDoSlot) continue;

      if (aulasSobrepostas.length > 0 && aulasDoSlot.length === 0) continue;

      if (!aulasDoSlot.length && quantidade <= capacidadeNova) {
        sugestoes.push({
          chave: `${data}|${horario}`,
          data,
          horario_inicio: horario,
          horario_fim: horarioFim,
          ocupacao: 0,
          capacidade: capacidadeNova,
        });
        if (sugestoes.length >= 8) return sugestoes;
        continue;
      }

      const aulaComVaga = aulasDoSlot
        .map((aula) => {
          const ocupacao = contexto.participacoes.filter(
            (participacao) =>
              participacao.aula_id === aula.id &&
              !contexto.cancelamentos.some(
                (cancelamento) =>
                  cancelamento.aula_id === aula.id &&
                  cancelamento.aluno_id === participacao.aluno_id,
              ),
          ).length;
          const capacidade = aula.grupo_aula_id
            ? grupoPorId.get(aula.grupo_aula_id)?.capacidade_maxima ?? 3
            : 3;
          return { aula, ocupacao, capacidade };
        })
        .find((item) => item.ocupacao + quantidade <= item.capacidade);

      if (aulaComVaga) {
        sugestoes.push({
          chave: `${data}|${horario}`,
          data,
          horario_inicio: horario,
          horario_fim: horarioFim,
          ocupacao: aulaComVaga.ocupacao,
          capacidade: aulaComVaga.capacidade,
        });
        if (sugestoes.length >= 8) return sugestoes;
      }
    }
  }

  return sugestoes;
}

export async function buscarOpcoesRemanejamento(
  aulaId: string,
  alunoIds: string[],
): Promise<OpcoesRemanejamento | null> {
  const aula = await buscarDetalheAula(aulaId);
  if (!aula) return null;

  const idsUnicos = Array.from(new Set(alunoIds));
  const participantes = aula.participantes.filter((participante) =>
    idsUnicos.includes(participante.id),
  );
  if (!idsUnicos.length || participantes.length !== idsUnicos.length) {
    return {
      aula,
      aluno_ids: idsUnicos,
      sugestoes: [],
      impedimento: "Selecione participantes validos desta aula.",
    };
  }
  if (participantes.some((participante) => participante.cancelamento)) {
    return {
      aula,
      aluno_ids: idsUnicos,
      sugestoes: [],
      impedimento: "Um dos participantes selecionados ja saiu desta aula.",
    };
  }
  if (participantes.some((participante) => participante.treina_segunda_a_sexta)) {
    return {
      aula,
      aluno_ids: idsUnicos,
      sugestoes: [],
      impedimento:
        "Aluno 5x segue a regra de ajuste financeiro e nao possui remanejamento padrao.",
    };
  }

  const contexto = await buscarContextoSugestoes();
  return {
    aula,
    aluno_ids: idsUnicos,
    sugestoes: gerarSugestoes(contexto, idsUnicos, aula),
  };
}

export async function buscarReposicoesPendentes(
  alunoFiltro?: string,
): Promise<ReposicaoPendente[]> {
  const supabase = await createSupabaseServerClient();
  const { data: reposicoes } = await supabase
    .from("reposicoes")
    .select("*")
    .eq("status", "PENDENTE")
    .order("created_at");
  if (!reposicoes?.length) return [];

  const reposicoesBase = reposicoes as Reposicao[];
  const { data: cancelamentos } = await supabase
    .from("cancelamentos")
    .select("*")
    .in(
      "id",
      reposicoesBase.map((item) => item.cancelamento_id),
    );
  let cancelamentosBase = (cancelamentos ?? []) as Cancelamento[];
  if (alunoFiltro) {
    cancelamentosBase = cancelamentosBase.filter((item) => item.aluno_id === alunoFiltro);
  }
  const alunoIds = Array.from(
    new Set(cancelamentosBase.map((item) => item.aluno_id).filter(Boolean)),
  ) as string[];
  const aulaIds = Array.from(new Set(cancelamentosBase.map((item) => item.aula_id)));
  if (!alunoIds.length || !aulaIds.length) return [];

  const [{ data: alunos }, { data: aulas }, contexto] = await Promise.all([
    supabase.from("alunos").select("*").in("id", alunoIds),
    supabase.from("aulas").select("*").in("id", aulaIds),
    buscarContextoSugestoes(),
  ]);
  const alunoPorId = new Map(((alunos ?? []) as Aluno[]).map((aluno) => [aluno.id, aluno]));
  const aulaPorId = new Map(((aulas ?? []) as Aula[]).map((aula) => [aula.id, aula]));
  const cancelamentoPorId = new Map(cancelamentosBase.map((item) => [item.id, item]));

  return reposicoesBase.flatMap((reposicao) => {
    const cancelamento = cancelamentoPorId.get(reposicao.cancelamento_id);
    if (!cancelamento?.aluno_id) return [];
    const aluno = alunoPorId.get(cancelamento.aluno_id);
    const aulaOriginal = aulaPorId.get(cancelamento.aula_id);
    if (!aluno || !aulaOriginal) return [];

    return [
      {
        reposicao,
        cancelamento,
        aula_original: aulaOriginal,
        aluno,
        sugestoes: gerarSugestoes(contexto, [aluno.id], aulaOriginal),
      },
    ];
  });
}
