import type {
  Aluno,
  Aula,
  Cancelamento,
  Reposicao,
} from "@/types/dominio";

export type EstadoAcaoReposicao = {
  status: "inicial" | "sucesso" | "erro";
  mensagem?: string;
};

export const estadoInicialReposicao: EstadoAcaoReposicao = { status: "inicial" };

export type ParticipanteDetalheAula = Aluno & {
  cancelamento: Cancelamento | null;
  reposicao: Reposicao | null;
};

export type DetalheAula = Aula & {
  participantes: ParticipanteDetalheAula[];
};

export type SugestaoReposicao = {
  chave: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  ocupacao: number;
  capacidade: number;
};

export type ReposicaoPendente = {
  reposicao: Reposicao;
  cancelamento: Cancelamento;
  aula_original: Aula;
  aluno: Aluno;
  sugestoes: SugestaoReposicao[];
};
