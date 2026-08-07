"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { criarAjusteFinanceiroAction } from "@/features/mensalidades/actions";
import { estadoInicialMensalidade } from "@/features/mensalidades/types";

export function FormularioAjusteFinanceiro({
  cancelamentoId,
  dataVencimento,
}: {
  cancelamentoId: string;
  dataVencimento: string;
}) {
  const [estado, action, pendente] = useActionState(
    criarAjusteFinanceiroAction,
    estadoInicialMensalidade,
  );

  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="cancelamento_id" value={cancelamentoId} />
      <input type="hidden" name="data_vencimento" value={dataVencimento} />
      <input type="hidden" name="observacao" value="Falta de aluno 5x sem reposicao." />
      <div className="flex gap-2">
        <Input
          name="valor_cobrado"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="Valor do ajuste"
          required
          disabled={pendente}
        />
        <Button type="submit" size="sm" disabled={pendente} className="h-11 shrink-0">
          {pendente ? "Salvando" : "Registrar"}
        </Button>
      </div>
      {estado.status !== "inicial" ? (
        <Alert
          title={estado.status === "sucesso" ? "Ajuste registrado" : "Falha no ajuste"}
          tone={estado.status === "erro" ? "danger" : "info"}
          className="py-3"
        >
          {estado.mensagem}
        </Alert>
      ) : null}
    </form>
  );
}
