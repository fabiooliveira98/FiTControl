"use client";

import { CheckCheck } from "lucide-react";
import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { finalizarDiaAction } from "@/features/reposicoes/actions";
import { estadoInicialAcaoAula } from "@/features/reposicoes/types";

export function BotaoFinalizarDia({ data }: { data: string }) {
  const action = finalizarDiaAction.bind(null, data);
  const [estado, formAction, pendente] = useActionState(action, estadoInicialAcaoAula);

  return (
    <form action={formAction} className="space-y-3">
      {estado.status !== "inicial" ? (
        <Alert
          title={estado.status === "sucesso" ? "Dia encerrado" : "Nao foi possivel encerrar"}
          tone={estado.status === "erro" ? "danger" : "info"}
        >
          {estado.mensagem}
        </Alert>
      ) : null}
      <Button type="submit" variant="secondary" className="w-full sm:w-auto" disabled={pendente}>
        <CheckCheck className="size-4" aria-hidden="true" />
        {pendente ? "Finalizando..." : "Finalizar o dia"}
      </Button>
    </form>
  );
}
