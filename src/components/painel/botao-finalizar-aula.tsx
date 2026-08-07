"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { finalizarAulaAction } from "@/features/reposicoes/actions";
import { estadoInicialAcaoAula } from "@/features/reposicoes/types";

export function BotaoFinalizarAula({ aulaId }: { aulaId: string }) {
  const action = finalizarAulaAction.bind(null, aulaId);
  const [estado, formAction, pendente] = useActionState(action, estadoInicialAcaoAula);

  if (estado.status === "sucesso") {
    return <Alert title="Aula finalizada">O historico do dia foi atualizado.</Alert>;
  }

  return (
    <form action={formAction} className="space-y-3">
      {estado.status === "erro" ? (
        <Alert title="Nao foi possivel finalizar" tone="danger">
          {estado.mensagem}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" disabled={pendente}>
        <Check className="size-4" aria-hidden="true" />
        {pendente ? "Finalizando..." : "Finalizar aula"}
      </Button>
    </form>
  );
}
