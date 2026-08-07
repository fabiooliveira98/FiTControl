import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Aluno,
  DisponibilidadeSemanal,
  GrupoAula,
  HorarioRecorrenteAluno,
} from "@/types/dominio";
import type {
  AlunoComRotinas,
  AlunoResumo,
  SlotCadastroAluno,
} from "@/features/alunos/types";
import { formatarHorario, horariosSeSobrepoem } from "@/utils/agenda";

export async function buscarAlunos(busca = ""): Promise<AlunoResumo[]> {
  const supabase = await createSupabaseServerClient();
  let consulta = supabase.from("alunos").select("*").order("nome");

  if (busca.trim()) {
    consulta = consulta.ilike("nome", `%${busca.trim()}%`);
  }

  const { data: alunos, error } = await consulta;
  if (error || !alunos?.length) return [];

  const ids = alunos.map((aluno) => aluno.id);
  const [{ data: rotinas }, { data: cancelamentos }, { data: reposicoes }] = await Promise.all([
    supabase
      .from("horarios_recorrentes_alunos")
      .select("*")
      .in("aluno_id", ids)
      .eq("ativo", true),
    supabase.from("cancelamentos").select("id,aluno_id").in("aluno_id", ids),
    supabase.from("reposicoes").select("cancelamento_id,status").eq("status", "PENDENTE"),
  ]);

  const cancelamentoPorId = new Map(
    (cancelamentos ?? []).map((item) => [item.id, item.aluno_id]),
  );
  const pendenciasPorAluno = new Map<string, number>();
  (reposicoes ?? []).forEach((reposicao) => {
    const alunoId = cancelamentoPorId.get(reposicao.cancelamento_id);
    if (alunoId) pendenciasPorAluno.set(alunoId, (pendenciasPorAluno.get(alunoId) ?? 0) + 1);
  });

  return (alunos as Aluno[]).map((aluno) => ({
    ...aluno,
    rotinas: ((rotinas ?? []) as HorarioRecorrenteAluno[]).filter(
      (rotina) => rotina.aluno_id === aluno.id,
    ),
    reposicoes_pendentes: pendenciasPorAluno.get(aluno.id) ?? 0,
  }));
}

export async function buscarAlunoPorId(id: string): Promise<AlunoComRotinas | null> {
  const supabase = await createSupabaseServerClient();
  const [{ data: aluno }, { data: rotinas }] = await Promise.all([
    supabase.from("alunos").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("horarios_recorrentes_alunos")
      .select("*")
      .eq("aluno_id", id)
      .eq("ativo", true),
  ]);

  if (!aluno) return null;
  return { ...(aluno as Aluno), rotinas: (rotinas ?? []) as HorarioRecorrenteAluno[] };
}

export async function buscarSlotsCadastroAluno(alunoId?: string): Promise<SlotCadastroAluno[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: disponibilidades }, { data: rotinas }, { data: grupos }, { data: alunos }] = await Promise.all([
    supabase
      .from("disponibilidade_semanal")
      .select("*")
      .eq("ativo", true)
      .order("horario_inicio"),
    supabase
      .from("horarios_recorrentes_alunos")
      .select("*")
      .eq("ativo", true),
    supabase.from("grupos_aula").select("*").eq("ativo", true),
    supabase.from("alunos").select("id,nome").eq("status", "ATIVO"),
  ]);

  const rotinasAtivas = (rotinas ?? []) as HorarioRecorrenteAluno[];
  const grupoPorId = new Map(((grupos ?? []) as GrupoAula[]).map((grupo) => [grupo.id, grupo]));
  const nomeAlunoPorId = new Map((alunos ?? []).map((aluno) => [aluno.id, aluno.nome]));

  return ((disponibilidades ?? []) as DisponibilidadeSemanal[]).map((slot) => {
    const rotinasDia = rotinasAtivas.filter(
      (rotina) => rotina.dia_semana === slot.dia_semana,
    );
    const rotinasSlot = rotinasDia.filter(
      (rotina) =>
        formatarHorario(rotina.horario_inicio) === formatarHorario(slot.horario_inicio),
    );
    const rotinasSobrepostas = rotinasDia.filter(
      (rotina) =>
        formatarHorario(rotina.horario_inicio) !== formatarHorario(slot.horario_inicio) &&
        horariosSeSobrepoem(
          slot.horario_inicio,
          slot.horario_fim,
          rotina.horario_inicio,
          rotina.horario_fim,
        ),
    );
    const grupoId = rotinasSlot.find((rotina) => rotina.grupo_aula_id)?.grupo_aula_id ?? null;
    const grupo = grupoId ? grupoPorId.get(grupoId) : null;
    const alunosNoSlot = new Set(rotinasSlot.map((rotina) => rotina.aluno_id));
    const alunoJaEstaNoSlot = alunoId ? alunosNoSlot.has(alunoId) : false;
    const capacidade = grupo?.capacidade_maxima ?? 3;

    return {
      chave: `${slot.dia_semana}|${formatarHorario(slot.horario_inicio)}`,
      dia_semana: slot.dia_semana,
      horario_inicio: formatarHorario(slot.horario_inicio),
      horario_fim: formatarHorario(slot.horario_fim),
      grupo_aula_id: grupoId,
      tipo: grupo?.tipo ?? null,
      capacidade_maxima: capacidade,
      ocupacao: alunosNoSlot.size,
      nomes_ocupantes: Array.from(alunosNoSlot)
        .map((id) => nomeAlunoPorId.get(id))
        .filter((nome): nome is string => Boolean(nome)),
      disponivel:
        alunoJaEstaNoSlot || (rotinasSobrepostas.length === 0 && alunosNoSlot.size < capacidade),
      conflito_sobreposicao: rotinasSobrepostas.length > 0,
    };
  });
}
