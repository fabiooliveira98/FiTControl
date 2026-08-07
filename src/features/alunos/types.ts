import type {
  Aluno,
  DiaSemana,
  HorarioRecorrenteAluno,
  TipoAula,
} from "@/types/dominio";

export type EstadoAcaoAluno = {
  status: "inicial" | "erro";
  mensagem?: string;
};

export const estadoInicialAluno: EstadoAcaoAluno = { status: "inicial" };

export type SelecaoRotina = Record<string, number>;

export type RotinaAlunoFormulario = {
  dia_semana: DiaSemana;
  horario_inicio: string;
  capacidade_maxima: number;
  grupo_aula_id?: string | null;
};

export type SlotCadastroAluno = {
  chave: string;
  dia_semana: DiaSemana;
  horario_inicio: string;
  horario_fim: string;
  grupo_aula_id: string | null;
  tipo: TipoAula | null;
  capacidade_maxima: number;
  ocupacao: number;
  nomes_ocupantes: string[];
  disponivel: boolean;
  conflito_sobreposicao: boolean;
};

export type AlunoComRotinas = Aluno & {
  rotinas: HorarioRecorrenteAluno[];
};

export type AlunoResumo = Aluno & {
  rotinas: HorarioRecorrenteAluno[];
  reposicoes_pendentes: number;
};
