import { z } from "zod";

import { diasSemana } from "@/utils/agenda";

const horarioSchema = z
  .string()
  .regex(/^([01]\d|2[0-2]):(?:00|30)$/, "Escolha um horario com inicio em minuto 00 ou 30.");

export const excecaoAgendaSchema = z.object({
  tipo: z.enum(["ABRIR", "BLOQUEAR"]),
  data: z.iso.date("Informe uma data valida."),
  horario_inicio: horarioSchema,
  motivo: z.string().trim().max(240).optional().or(z.literal("")),
});

export const faixaDisponibilidadeSchema = z
  .object({
    dias: z.array(z.enum(diasSemana)).min(1, "Selecione pelo menos um dia."),
    horario_inicio: horarioSchema,
    ultimo_inicio: horarioSchema,
    desativar_dias: z.boolean(),
  })
  .refine(
    (dados) => dados.desativar_dias || dados.horario_inicio <= dados.ultimo_inicio,
    {
      message: "O primeiro horario deve ser anterior ao ultimo.",
      path: ["ultimo_inicio"],
    },
  );

export const identificadorAgendaSchema = z.uuid("Identificador invalido.");
