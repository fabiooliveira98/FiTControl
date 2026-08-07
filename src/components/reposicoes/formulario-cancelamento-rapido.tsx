"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cancelarParticipacoesAction } from "@/features/reposicoes/actions";
import { estadoInicialAcaoAula } from "@/features/reposicoes/types";

type FormularioCancelamentoRapidoProps = {
  aulaId: string;
  alunoIds: string[];
  nomes: string[];
  possuiAlunoCincoVezes: boolean;
};

export function FormularioCancelamentoRapido({
  aulaId,
  alunoIds,
  nomes,
  possuiAlunoCincoVezes,
}: FormularioCancelamentoRapidoProps) {
  const action = cancelarParticipacoesAction.bind(null, aulaId, alunoIds);
  const [estado, formAction, pendente] = useActionState(action, estadoInicialAcaoAula);

  if (estado.status === "sucesso") {
    return <Alert title="Cancelamento registrado">{estado.mensagem}</Alert>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="rounded-2xl bg-surface-muted px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
          Cancelar para
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">{nomes.join(", ")}</p>
      </div>
      <Field label="Motivo" hint="Opcional.">
        <Textarea
          name="motivo"
          maxLength={240}
          placeholder="Ex.: viagem, consulta ou imprevisto"
          className="min-h-20"
          disabled={pendente}
        />
      </Field>
      {possuiAlunoCincoVezes ? (
        <p className="text-xs leading-5 text-warning">
          Participantes 5x seguem para ajuste financeiro, sem reposicao pendente.
        </p>
      ) : null}
      {estado.status === "erro" ? (
        <Alert title="Nao foi possivel cancelar" tone="danger">
          {estado.mensagem}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" disabled={pendente}>
        {pendente ? "Cancelando..." : "Confirmar cancelamento"}
      </Button>
    </form>
  );
}
