import type {
  AlteracaoRotinaAluno,
  ItemAlteracaoRotina,
} from "@/types/dominio";

export type EstadoAlteracaoRotina = {
  status: "inicial" | "sucesso" | "erro";
  mensagem?: string;
};

export const estadoInicialAlteracaoRotina: EstadoAlteracaoRotina = {
  status: "inicial",
};

export type AlteracaoRotinaComItens = AlteracaoRotinaAluno & {
  itens: ItemAlteracaoRotina[];
};
