"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { criarMensalidadeAction } from "@/features/mensalidades/actions";
import { estadoInicialMensalidade } from "@/features/mensalidades/types";
import type { Aluno } from "@/types/dominio";

export function FormularioMensalidade({
  alunos,
  dataPadrao,
}: {
  alunos: Pick<Aluno, "id" | "nome">[];
  dataPadrao: string;
}) {
  const [estado, action, pendente] = useActionState(
    criarMensalidadeAction,
    estadoInicialMensalidade,
  );

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Aluno">
          <Select name="aluno_id" required disabled={pendente} defaultValue="">
            <option value="" disabled>Selecione o aluno</option>
            {alunos.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
            ))}
          </Select>
        </Field>
        <Field label="Valor">
          <Input
            name="valor_cobrado"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            required
            disabled={pendente}
          />
        </Field>
        <Field label="Vencimento">
          <Input
            name="data_vencimento"
            type="date"
            defaultValue={dataPadrao}
            required
            disabled={pendente}
          />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue="PENDENTE" disabled={pendente}>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="ATRASADO">Atrasado</option>
            <option value="AJUSTE">Ajuste</option>
          </Select>
        </Field>
        <Field label="Data do pagamento" hint="Opcional; ao marcar como pago, hoje sera usado se ficar vazio.">
          <Input name="data_pagamento" type="date" disabled={pendente} />
        </Field>
        <Field label="Observacao">
          <Textarea name="observacao" className="min-h-24" disabled={pendente} />
        </Field>
      </div>

      {estado.status !== "inicial" ? (
        <Alert
          title={estado.status === "sucesso" ? "Lancamento criado" : "Nao foi possivel criar"}
          tone={estado.status === "erro" ? "danger" : "info"}
        >
          {estado.mensagem}
        </Alert>
      ) : null}

      <div className="flex justify-end border-t border-border pt-5">
        <Button type="submit" disabled={pendente || !alunos.length}>
          {pendente ? "Salvando..." : "Criar lancamento"}
        </Button>
      </div>
    </form>
  );
}
