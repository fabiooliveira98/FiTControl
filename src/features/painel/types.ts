import type { AgendaOperacional, SlotAgenda } from "@/features/agenda/models";
import type { HorarioRecorrenteAluno } from "@/types/dominio";

export type RankingReposicao = {
  aluno_id: string;
  nome: string;
  quantidade: number;
  rotinas: HorarioRecorrenteAluno[];
};

export type DadosDashboard = {
  agenda_periodo: AgendaOperacional;
  agenda_semana: AgendaOperacional;
  total_reposicoes_pendentes: number;
  ranking: RankingReposicao[];
  proximos_livres: SlotAgenda[];
};
