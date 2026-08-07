import type {
  AberturaAgenda,
  BloqueioAgenda,
  DiaSemana,
  DisponibilidadeSemanal,
} from "@/types/dominio";

export type EstadoAcaoAgenda = {
  status: "inicial" | "sucesso" | "erro";
  mensagem?: string;
};

export type OcupacaoHorarioRecorrente = {
  chave: string;
  dia_semana: DiaSemana;
  horario_inicio: string;
  horario_fim: string;
  alunos: string[];
};

export type ConfiguracaoAgenda = {
  disponibilidades: DisponibilidadeSemanal[];
  bloqueios: BloqueioAgenda[];
  aberturas: AberturaAgenda[];
  bancoPreparado: boolean;
  catalogoCompleto: boolean;
  excecoesPreparadas: boolean;
  horariosOcupados: OcupacaoHorarioRecorrente[];
  mensagemErro?: string;
};

export const estadoInicialAgenda: EstadoAcaoAgenda = {
  status: "inicial",
};
