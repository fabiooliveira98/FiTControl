import { z } from "zod";

import { diasSemana, statusAlunoOptions } from "@/utils/agenda";

const horarioSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horario valido.");

export const alunoSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo do aluno."),
  email: z.email("Informe um e-mail valido.").optional().or(z.literal("")),
  telefone: z.string().trim().min(8, "Informe um telefone valido.").optional().or(z.literal("")),
  status: z.enum(statusAlunoOptions),
  observacoes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const rotinaAlunoSchema = z.object({
  dia_semana: z.enum(diasSemana),
  horario_inicio: horarioSchema,
  capacidade_maxima: z.number().int().min(1).max(3),
  grupo_aula_id: z.uuid().nullable().optional(),
});

export const rotinasAlunoSchema = z
  .array(rotinaAlunoSchema)
  .min(1, "Selecione pelo menos um horario de treino.")
  .superRefine((rotinas, contexto) => {
    const diasSelecionados = new Set<string>();

    rotinas.forEach((rotina, indice) => {
      if (diasSelecionados.has(rotina.dia_semana)) {
        contexto.addIssue({
          code: "custom",
          message: "Selecione apenas um horario por dia para o aluno.",
          path: [indice, "dia_semana"],
        });
      }
      diasSelecionados.add(rotina.dia_semana);
    });
  });

export const alunoComRotinasSchema = alunoSchema.extend({
  rotinas: rotinasAlunoSchema,
});

export const alunoIdSchema = z.uuid("Aluno invalido.");
