"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cancelarParticipacaoAction } from "@/features/reposicoes/actions";
import { estadoInicialReposicao } from "@/features/reposicoes/types";

export function FormularioCancelamento({
  aulaId,
  alunoId,
  alunoCincoVezes,
}: {
  aulaId: string;
  alunoId: string;
  alunoCincoVezes: boolean;
}) {
  const action = cancelarParticipacaoAction.bind(null, aulaId, alunoId);
  const [estado, formAction, pendente] = useActionState(action, estadoInicialReposicao);

  if (estado.status === "sucesso") {
    return (
      <Alert title="Cancelamento registrado">
        {alunoCincoVezes
          ? "A falta foi marcada para ajuste financeiro, sem reposicao automatica."
          : "A reposicao ja entrou na fila de encaixes."}
      </Alert>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-4 border-t border-border pt-4">
      <Field label="Motivo do cancelamento" hint="Opcional.">
        <Textarea
          name="motivo"
          maxLength={240}
          placeholder="Ex.: viagem, consulta ou imprevisto"
          className="min-h-20"
          disabled={pendente}
        />
      </Field>
      {alunoCincoVezes ? (
        <p className="text-xs leading-5 text-warning">
          Este aluno treina de segunda a sexta. O cancelamento sera direcionado para ajuste financeiro.
        </p>
      ) : null}
      {estado.status === "erro" ? (
        <Alert title="Nao foi possivel cancelar" tone="danger">
          {estado.mensagem}
        </Alert>
      ) : null}
      <Button type="submit" variant="secondary" disabled={pendente}>
        {pendente ? "Cancelando..." : "Confirmar cancelamento"}
      </Button>
    </form>
  );
}
