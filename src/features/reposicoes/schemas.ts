import { z } from "zod";

export const cancelamentoSchema = z.object({
  aula_id: z.uuid("Aula invalida."),
  aluno_id: z.uuid("Aluno invalido."),
  motivo: z.string().trim().max(240, "Use no maximo 240 caracteres.").optional().or(z.literal("")),
});

export const confirmacaoReposicaoSchema = z.object({
  reposicao_id: z.uuid("Reposicao invalida."),
  data: z.iso.date("Data invalida."),
  horario_inicio: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horario invalido."),
});

export const reposicaoIdSchema = z.uuid("Reposicao invalida.");
export const aulaIdSchema = z.uuid("Aula invalida.");
