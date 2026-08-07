import type { VisualizacaoAgenda } from "@/features/agenda/datas";
import type {
  AberturaAgenda,
  Aula,
  BloqueioAgenda,
  DiaSemana,
  DisponibilidadeSemanal,
} from "@/types/dominio";

export type ParticipanteAgenda = {
  aluno_id: string;
  nome: string;
  treina_segunda_a_sexta: boolean;
  cancelado: boolean;
  motivo_cancelamento: string | null;
};

export type AulaAgenda = Aula & {
  participantes: ParticipanteAgenda[];
  capacidade: number;
};

export type StatusSlotAgenda =
  | "LIVRE"
  | "OCUPADO"
  | "BLOQUEADO"
  | "INDISPONIVEL"
  | "CONFLITO";

export type SlotAgenda = {
  chave: string;
  data: string;
  dia_semana: DiaSemana;
  horario_inicio: string;
  horario_fim: string;
  status: StatusSlotAgenda;
  capacidade: number;
  ocupacao: number;
  bloqueio: BloqueioAgenda | null;
  abertura: AberturaAgenda | null;
  aulas: AulaAgenda[];
};

export type DiaAgenda = {
  data: string;
  dia_semana: DiaSemana;
  slots: SlotAgenda[];
  total_aulas: number;
  total_livres: number;
  total_bloqueados: number;
};

export type AgendaOperacional = {
  data_referencia: string;
  visualizacao: VisualizacaoAgenda;
  inicio: string;
  fim: string;
  dias: DiaAgenda[];
  aulas: AulaAgenda[];
  disponibilidades: DisponibilidadeSemanal[];
  bloqueios: BloqueioAgenda[];
  aberturas: AberturaAgenda[];
  total_aulas: number;
  total_livres: number;
  total_bloqueados: number;
  sincronizada: boolean;
  mensagemErro?: string;
};
