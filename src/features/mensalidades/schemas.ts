import { z } from "zod";

import { statusMensalidadeOptions } from "@/utils/agenda";

const dataOpcionalSchema = z.preprocess(
  (valor) => (valor === "" || valor === null ? undefined : valor),
  z.iso.date("Informe uma data valida.").optional(),
);

export const mensalidadeSchema = z.object({
  aluno_id: z.string().uuid("Aluno inválido."),
  valor_cobrado: z.coerce.number().positive("Informe um valor válido."),
  data_vencimento: z.iso.date("Informe uma data válida."),
  data_pagamento: dataOpcionalSchema,
  status: z.enum(statusMensalidadeOptions),
  observacao: z.string().max(500).optional().or(z.literal("")),
});

export const ajusteFinanceiroSchema = z.object({
  cancelamento_id: z.uuid("Cancelamento invalido."),
  valor_cobrado: z.coerce.number().positive("Informe um valor valido."),
  data_vencimento: z.iso.date("Informe uma data valida."),
  observacao: z.string().trim().max(500).optional().or(z.literal("")),
});

export const mensalidadeIdSchema = z.uuid("Lancamento financeiro invalido.");

export const filtroStatusMensalidadeSchema = z
  .enum(statusMensalidadeOptions)
  .optional()
  .catch(undefined);
