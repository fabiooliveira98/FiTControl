export type DiaSemana =
  | "SEGUNDA"
  | "TERCA"
  | "QUARTA"
  | "QUINTA"
  | "SEXTA"
  | "SABADO"
  | "DOMINGO";

export type StatusAluno = "ATIVO" | "PAUSADO" | "INATIVO";
export type StatusMensalidade = "PENDENTE" | "PAGO" | "ATRASADO" | "AJUSTE";
export type StatusReposicao = "PENDENTE" | "CONFIRMADA" | "CONCLUIDA" | "DISPENSADA";
export type TipoAula = "INDIVIDUAL" | "DUPLA" | "TRIO";
export type StatusAula = "AGENDADA" | "CANCELADA" | "REPOSTA" | "CONCLUIDA";
export type StatusAlteracaoRotina = "AGENDADA" | "APLICADA" | "CANCELADA";
export type TipoCancelamento = "FALTA" | "REMANEJAMENTO";

export type Aluno = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  status: StatusAluno;
  treina_segunda_a_sexta: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type GrupoAula = {
  id: string;
  nome_referencia: string | null;
  tipo: TipoAula;
  capacidade_maxima: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type HorarioRecorrenteAluno = {
  id: string;
  aluno_id: string;
  grupo_aula_id: string | null;
  dia_semana: DiaSemana;
  horario_inicio: string;
  horario_fim: string;
  ativo: boolean;
  vigente_de: string;
  vigente_ate: string | null;
  alteracao_rotina_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AlteracaoRotinaAluno = {
  id: string;
  aluno_id: string;
  data_vigencia: string;
  status: StatusAlteracaoRotina;
  motivo: string | null;
  aplicada_em: string | null;
  created_at: string;
  updated_at: string;
};

export type ItemAlteracaoRotina = {
  id: string;
  alteracao_rotina_id: string;
  dia_semana: DiaSemana;
  horario_inicio: string;
  horario_fim: string;
  capacidade_maxima: number;
  created_at: string;
};

export type DisponibilidadeSemanal = {
  id: string;
  dia_semana: DiaSemana;
  horario_inicio: string;
  horario_fim: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type BloqueioAgenda = {
  id: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  motivo: string | null;
  created_at: string;
};

export type AberturaAgenda = {
  id: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  motivo: string | null;
  created_at: string;
};

export type TipoExcecaoAgenda = "ABRIR" | "BLOQUEAR";

export type Aula = {
  id: string;
  grupo_aula_id: string | null;
  horario_recorrente_id: string | null;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  status: StatusAula;
  origem: string;
  observacoes: string | null;
  finalizada_em: string | null;
  finalizacao_automatica: boolean;
  created_at: string;
  updated_at: string;
};

export type Cancelamento = {
  id: string;
  aula_id: string;
  aluno_id: string | null;
  motivo: string | null;
  ajustado_financeiro: boolean;
  tipo: TipoCancelamento;
  created_at: string;
};

export type Reposicao = {
  id: string;
  cancelamento_id: string;
  aula_reposicao_id: string | null;
  status: StatusReposicao;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type Mensalidade = {
  id: string;
  aluno_id: string;
  cancelamento_id: string | null;
  valor_cobrado: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: StatusMensalidade;
  observacao: string | null;
  created_at: string;
  updated_at: string;
};

export type ItemNavegacao = {
  href: string;
  label: string;
  descricao: string;
};
