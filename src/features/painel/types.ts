import type {
  AgendaOperacional,
  AulaAgenda,
  DiaAgenda,
  SlotAgenda,
} from "@/features/agenda/models";
import type { DiaSemana, HorarioRecorrenteAluno } from "@/types/dominio";

export type StatusOperacionalAula =
  | "PROXIMA"
  | "EM_ANDAMENTO"
  | "AGENDADA"
  | "PENDENTE_FINALIZACAO"
  | "CONCLUIDA"
  | "CANCELADA"
  | "REMANEJADA";

export type AulaDoDia = AulaAgenda & {
  status_operacional: StatusOperacionalAula;
  remanejada: boolean;
};

export type DiaDaSemanaPainel = Pick<
  DiaAgenda,
  "data" | "dia_semana" | "total_aulas" | "total_livres"
>;

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

export type DadosPainelHoje = {
  data: string;
  dia_semana: DiaSemana;
  semana: DiaDaSemanaPainel[];
  aulas: AulaDoDia[];
  horarios_livres: SlotAgenda[];
  total_aulas: number;
  aulas_restantes: number;
  aulas_para_finalizar: number;
  proxima_aula: AulaDoDia | null;
  total_reposicoes_pendentes: number;
  ranking: RankingReposicao[];
  sincronizada: boolean;
  mensagem_erro?: string;
};
