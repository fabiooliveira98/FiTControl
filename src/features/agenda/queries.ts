import {
  obterDataAtualSaoPaulo,
  obterIntervaloAgenda,
  type VisualizacaoAgenda,
} from "@/features/agenda/datas";
import type {
  AgendaOperacional,
  AulaAgenda,
  DiaAgenda,
  ParticipanteAgenda,
  SlotAgenda,
} from "@/features/agenda/models";
import type {
  ConfiguracaoAgenda,
  OcupacaoHorarioRecorrente,
} from "@/features/agenda/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AberturaAgenda,
  Aluno,
  Aula,
  BloqueioAgenda,
  DisponibilidadeSemanal,
  GrupoAula,
} from "@/types/dominio";
import {
  compararHorarios,
  diasSemana,
  formatarHorario,
  horariosSeSobrepoem,
  montarIntervalosPadrao,
} from "@/utils/agenda";

function mensagemBancoIndisponivel() {
  return "Verifique a conexao com o Supabase e tente novamente.";
}

export async function buscarConfiguracaoAgenda(): Promise<ConfiguracaoAgenda> {
  const supabase = await createSupabaseServerClient();
  const [disponibilidades, bloqueios, aberturas, rotinas] = await Promise.all([
    supabase
      .from("disponibilidade_semanal")
      .select("id,dia_semana,horario_inicio,horario_fim,ativo,created_at,updated_at")
      .order("dia_semana")
      .order("horario_inicio"),
    supabase
      .from("bloqueios_agenda")
      .select("id,data,horario_inicio,horario_fim,motivo,created_at")
      .gte("data", obterDataAtualSaoPaulo())
      .order("data")
      .order("horario_inicio")
      .limit(50),
    supabase
      .from("aberturas_agenda")
      .select("id,data,horario_inicio,horario_fim,motivo,created_at")
      .gte("data", obterDataAtualSaoPaulo())
      .order("data")
      .order("horario_inicio")
      .limit(50),
    supabase
      .from("horarios_recorrentes_alunos")
      .select("dia_semana,horario_inicio,horario_fim,alunos(nome)")
      .eq("ativo", true),
  ]);

  const erro = disponibilidades.error ?? bloqueios.error ?? rotinas.error;

  if (erro) {
    return {
      disponibilidades: [],
      bloqueios: [],
      aberturas: [],
      bancoPreparado: false,
      catalogoCompleto: false,
      excecoesPreparadas: false,
      horariosOcupados: [],
      mensagemErro: mensagemBancoIndisponivel(),
    };
  }

  const disponibilidadesBase = (disponibilidades.data ?? []) as DisponibilidadeSemanal[];
  const chavesCatalogo = new Set(
    disponibilidadesBase.map(
      (item) => `${item.dia_semana}|${formatarHorario(item.horario_inicio)}`,
    ),
  );
  const catalogoCompleto = diasSemana.every((dia) =>
    montarIntervalosPadrao().every((horario) => chavesCatalogo.has(`${dia}|${horario}`)),
  );
  const ocupacoesPorChave = new Map<string, OcupacaoHorarioRecorrente>();
  (
    (rotinas.data ?? []) as Array<{
      dia_semana: OcupacaoHorarioRecorrente["dia_semana"];
      horario_inicio: string;
      horario_fim: string;
      alunos: { nome: string } | Array<{ nome: string }> | null;
    }>
  ).forEach((rotina) => {
    const horario = formatarHorario(rotina.horario_inicio);
    const chave = `${rotina.dia_semana}|${horario}`;
    const relacaoAlunos = Array.isArray(rotina.alunos) ? rotina.alunos : [rotina.alunos];
    const nomes = relacaoAlunos
      .map((aluno) => aluno?.nome)
      .filter((nome): nome is string => Boolean(nome));
    const ocupacaoAtual = ocupacoesPorChave.get(chave);

    if (ocupacaoAtual) {
      ocupacaoAtual.alunos = Array.from(new Set([...ocupacaoAtual.alunos, ...nomes]));
      return;
    }

    ocupacoesPorChave.set(chave, {
      chave,
      dia_semana: rotina.dia_semana,
      horario_inicio: horario,
      horario_fim: formatarHorario(rotina.horario_fim),
      alunos: nomes,
    });
  });

  return {
    disponibilidades: disponibilidadesBase,
    bloqueios: (bloqueios.data ?? []) as BloqueioAgenda[],
    aberturas: (aberturas.data ?? []) as AberturaAgenda[],
    bancoPreparado: true,
    catalogoCompleto,
    excecoesPreparadas: !aberturas.error,
    horariosOcupados: Array.from(ocupacoesPorChave.values()),
  };
}

export function normalizarVisualizacao(valor?: string): VisualizacaoAgenda {
  return valor === "mes" ? "mes" : "semana";
}

export function normalizarDataReferencia(valor?: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor ?? "")
    ? (valor as string)
    : obterDataAtualSaoPaulo();
}

export async function buscarAgendaOperacional(
  dataReferencia: string,
  visualizacao: VisualizacaoAgenda,
): Promise<AgendaOperacional> {
  const supabase = await createSupabaseServerClient();
  const intervalo = obterIntervaloAgenda(dataReferencia, visualizacao);
  const { error: erroAlteracoes } = await supabase.rpc(
    "aplicar_alteracoes_rotina_pendentes",
    { p_ate_data: obterDataAtualSaoPaulo() },
  );
  const { error: erroSincronizacao } = await supabase.rpc("materializar_aulas_periodo", {
    p_data_inicio: intervalo.inicio,
    p_data_fim: intervalo.fim,
  });
  const { error: erroFinalizacao } = await supabase.rpc("finalizar_aulas_anteriores");

  const [disponibilidades, bloqueios, aberturas, aulas, grupos] = await Promise.all([
    supabase
      .from("disponibilidade_semanal")
      .select("*")
      .eq("ativo", true)
      .order("horario_inicio"),
    supabase
      .from("bloqueios_agenda")
      .select("*")
      .gte("data", intervalo.inicio)
      .lte("data", intervalo.fim)
      .order("data")
      .order("horario_inicio"),
    supabase
      .from("aberturas_agenda")
      .select("*")
      .gte("data", intervalo.inicio)
      .lte("data", intervalo.fim)
      .order("data")
      .order("horario_inicio"),
    supabase
      .from("aulas")
      .select("*")
      .gte("data", intervalo.inicio)
      .lte("data", intervalo.fim)
      .order("data")
      .order("horario_inicio"),
    supabase.from("grupos_aula").select("*").eq("ativo", true),
  ]);
  const erroLeitura =
    disponibilidades.error ??
    bloqueios.error ??
    aberturas.error ??
    aulas.error ??
    grupos.error;

  const aulasBase = (aulas.data ?? []) as Aula[];
  const idsAulas = aulasBase.map((aula) => aula.id);
  const participacoes = idsAulas.length
    ? await supabase.from("alunos_aulas").select("aula_id,aluno_id").in("aula_id", idsAulas)
    : { data: [], error: null };
  const idsAlunos = Array.from(
    new Set((participacoes.data ?? []).map((item) => item.aluno_id)),
  );
  const [alunos, cancelamentos] = await Promise.all([
    idsAlunos.length
      ? supabase
          .from("alunos")
          .select("id,nome,treina_segunda_a_sexta")
          .in("id", idsAlunos)
      : Promise.resolve({ data: [], error: null }),
    idsAulas.length
      ? supabase
          .from("cancelamentos")
          .select("aula_id,aluno_id,motivo,tipo")
          .in("aula_id", idsAulas)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const alunoPorId = new Map(
    ((alunos.data ?? []) as Pick<Aluno, "id" | "nome" | "treina_segunda_a_sexta">[]).map(
      (aluno) => [aluno.id, aluno],
    ),
  );
  const grupoPorId = new Map(
    ((grupos.data ?? []) as GrupoAula[]).map((grupo) => [grupo.id, grupo]),
  );
  const cancelamentoPorParticipacao = new Map(
    (cancelamentos.data ?? []).map((item) => [
      `${item.aula_id}|${item.aluno_id}`,
      {
        motivo: item.motivo as string | null,
        tipo: item.tipo as ParticipanteAgenda["tipo_cancelamento"],
      },
    ]),
  );

  const aulasComParticipantes: AulaAgenda[] = aulasBase.map((aula) => {
    const participantes: ParticipanteAgenda[] = (participacoes.data ?? [])
      .filter((item) => item.aula_id === aula.id)
      .map((item) => {
        const aluno = alunoPorId.get(item.aluno_id);
        const chaveCancelamento = `${aula.id}|${item.aluno_id}`;
        return {
          aluno_id: item.aluno_id,
          nome: aluno?.nome ?? "Aluno removido",
          treina_segunda_a_sexta: aluno?.treina_segunda_a_sexta ?? false,
          cancelado: cancelamentoPorParticipacao.has(chaveCancelamento),
          motivo_cancelamento:
            cancelamentoPorParticipacao.get(chaveCancelamento)?.motivo ?? null,
          tipo_cancelamento:
            cancelamentoPorParticipacao.get(chaveCancelamento)?.tipo ?? null,
        };
      });

    return {
      ...aula,
      participantes,
      capacidade: aula.grupo_aula_id
        ? grupoPorId.get(aula.grupo_aula_id)?.capacidade_maxima ?? 3
        : 3,
    };
  });

  const disponibilidadesBase = (disponibilidades.data ?? []) as DisponibilidadeSemanal[];
  const bloqueiosBase = (bloqueios.data ?? []) as BloqueioAgenda[];
  const aberturasBase = (aberturas.data ?? []) as AberturaAgenda[];
  const dias: DiaAgenda[] = intervalo.dias.map(({ dia, data }) => {
    const aberturasDoDia = aberturasBase.filter((item) => item.data === data);
    const candidatos = [
      ...disponibilidadesBase.filter((item) => item.dia_semana === dia),
      ...aberturasDoDia.map((item) => ({
        ...item,
        dia_semana: dia,
        ativo: true,
        updated_at: item.created_at,
      })),
    ];
    const disponibilidadesDoDia = Array.from(
      new Map(
        candidatos.map((item) => [formatarHorario(item.horario_inicio), item]),
      ).values(),
    ).sort((a, b) => compararHorarios(a.horario_inicio, b.horario_inicio));
    const slots: SlotAgenda[] = disponibilidadesDoDia
      .map((disponibilidade) => {
        const horario = formatarHorario(disponibilidade.horario_inicio);
        const abertura =
          aberturasDoDia.find(
            (item) => formatarHorario(item.horario_inicio) === horario,
          ) ?? null;
        const bloqueiosSobrepostos = bloqueiosBase.filter(
          (item) =>
            item.data === data &&
            horariosSeSobrepoem(
              disponibilidade.horario_inicio,
              disponibilidade.horario_fim,
              item.horario_inicio,
              item.horario_fim,
            ),
        );
        const bloqueioExato =
          bloqueiosSobrepostos.find(
            (item) => formatarHorario(item.horario_inicio) === horario,
          ) ?? null;
        const bloqueio = bloqueioExato ?? bloqueiosSobrepostos[0] ?? null;
        const aulasSobrepostas = aulasComParticipantes.filter(
          (aula) =>
            aula.data === data &&
            aula.status !== "CANCELADA" &&
            horariosSeSobrepoem(
              disponibilidade.horario_inicio,
              disponibilidade.horario_fim,
              aula.horario_inicio,
              aula.horario_fim,
            ),
        );
        const aulasDoSlot = aulasSobrepostas.filter(
          (aula) => formatarHorario(aula.horario_inicio) === horario,
        );
        const ocupacao = aulasDoSlot.reduce(
          (total, aula) =>
            total + aula.participantes.filter((participante) => !participante.cancelado).length,
          0,
        );
        const existeOcupacaoSobreposta = aulasSobrepostas.some((aula) =>
          aula.participantes.some((participante) => !participante.cancelado),
        );
        const capacidade = aulasDoSlot[0]?.capacidade ?? 3;
        const status = bloqueioExato
          ? existeOcupacaoSobreposta
            ? "CONFLITO"
            : "BLOQUEADO"
          : bloqueio
            ? "INDISPONIVEL"
          : ocupacao > 0
            ? "OCUPADO"
            : existeOcupacaoSobreposta
              ? "INDISPONIVEL"
            : "LIVRE";

        return {
          chave: `${data}|${horario}`,
          data,
          dia_semana: dia,
          horario_inicio: horario,
          horario_fim: formatarHorario(disponibilidade.horario_fim),
          status,
          capacidade,
          ocupacao,
          bloqueio,
          abertura,
          aulas: aulasDoSlot,
        };
      });

    return {
      data,
      dia_semana: dia,
      slots,
      total_aulas: slots.filter((slot) => slot.ocupacao > 0).length,
      total_livres: slots.filter((slot) => slot.status === "LIVRE").length,
      total_bloqueados: slots.filter(
        (slot) => slot.status === "BLOQUEADO" || slot.status === "CONFLITO",
      ).length,
    };
  });

  return {
    data_referencia: dataReferencia,
    visualizacao,
    inicio: intervalo.inicio,
    fim: intervalo.fim,
    dias,
    aulas: aulasComParticipantes,
    disponibilidades: disponibilidadesBase,
    bloqueios: bloqueiosBase,
    aberturas: aberturasBase,
    total_aulas: dias.reduce((total, dia) => total + dia.total_aulas, 0),
    total_livres: dias.reduce((total, dia) => total + dia.total_livres, 0),
    total_bloqueados: dias.reduce((total, dia) => total + dia.total_bloqueados, 0),
    sincronizada:
      !erroAlteracoes && !erroSincronizacao && !erroFinalizacao && !erroLeitura,
    mensagemErro: erroAlteracoes
      ? erroAlteracoes.message.includes("schema cache") || erroAlteracoes.message.includes("function")
        ? "A migration das Fases 8 e 9 ainda precisa ser aplicada no Supabase."
        : `Uma mudanca de rotina nao pode ser aplicada: ${erroAlteracoes.message}`
      : erroSincronizacao
      ? erroSincronizacao.message.includes("sobrepoe") ||
        erroSincronizacao.message.includes("outra aula")
        ? "Existem rotinas antigas em conflito. Execute a migration de reparo da agenda."
        : `As aulas recorrentes nao puderam ser atualizadas: ${erroSincronizacao.message}`
      : erroFinalizacao
        ? erroFinalizacao.message.includes("schema cache") ||
          erroFinalizacao.message.includes("function")
          ? "A migration do painel diario ainda precisa ser aplicada no Supabase."
          : `As aulas anteriores nao puderam ser finalizadas: ${erroFinalizacao.message}`
      : erroLeitura
        ? `Nao foi possivel ler a agenda: ${erroLeitura.message}`
        : undefined,
  };
}
