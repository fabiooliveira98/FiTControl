import { z } from "zod";

import { rotinasAlunoSchema } from "@/features/alunos/schemas";

export const alteracaoRotinaSchema = z.object({
  aluno_id: z.uuid("Aluno invalido."),
  data_vigencia: z.iso.date("Informe uma data de vigencia valida."),
  motivo: z.string().trim().max(240, "Use no maximo 240 caracteres.").optional().or(z.literal("")),
  rotinas: rotinasAlunoSchema,
});

export const alteracaoRotinaIdSchema = z.uuid("Alteracao de rotina invalida.");
