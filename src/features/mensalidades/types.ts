import type { Aluno, Aula, Cancelamento, Mensalidade } from "@/types/dominio";

export type EstadoMensalidade = {
  status: "inicial" | "sucesso" | "erro";
  mensagem?: string;
};

export const estadoInicialMensalidade: EstadoMensalidade = { status: "inicial" };

export type MensalidadeComAluno = Mensalidade & {
  aluno: Pick<Aluno, "id" | "nome">;
};

export type AjusteFinanceiroPendente = {
  cancelamento: Cancelamento;
  aluno: Pick<Aluno, "id" | "nome">;
  aula: Pick<Aula, "id" | "data" | "horario_inicio">;
};
