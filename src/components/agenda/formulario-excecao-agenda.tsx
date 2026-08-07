"use client";

import { useActionState } from "react";

import { MensagemAcaoAgenda } from "@/components/agenda/mensagem-acao-agenda";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { criarExcecaoAgendaAction } from "@/features/agenda/actions";
import { estadoInicialAgenda } from "@/features/agenda/types";
import { montarIntervalosPadrao } from "@/utils/agenda";

export function FormularioExcecaoAgenda({
  habilitado,
  dataMinima,
}: {
  habilitado: boolean;
  dataMinima: string;
}) {
  const [estado, action, pendente] = useActionState(
    criarExcecaoAgendaAction,
    estadoInicialAgenda,
  );

  return (
    <form action={action} className="space-y-5">
      <Field label="O que deseja fazer?">
        <Select name="tipo" defaultValue="BLOQUEAR" disabled={!habilitado || pendente}>
          <option value="BLOQUEAR">Bloquear um horario</option>
          <option value="ABRIR">Abrir um horario indisponivel</option>
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Data">
          <Input
            name="data"
            type="date"
            min={dataMinima}
            required
            disabled={!habilitado || pendente}
          />
        </Field>

        <Field label="Inicio">
          <Select name="horario_inicio" defaultValue="12:00" disabled={!habilitado || pendente}>
            {montarIntervalosPadrao().map((horario) => (
              <option key={horario} value={horario}>
                {horario}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Motivo" hint="Opcional. Exemplo: almoco liberado ou compromisso.">
        <Input
          name="motivo"
          maxLength={240}
          placeholder="Motivo da excecao"
          disabled={!habilitado || pendente}
        />
      </Field>

      <Alert title="Vale somente para a data escolhida">
        Abrir cria uma oportunidade extra para reposicao. Bloquear impede qualquer encaixe
        sobreposto naquele periodo.
      </Alert>
      <MensagemAcaoAgenda estado={estado} />
      <Button type="submit" disabled={!habilitado || pendente} className="w-full sm:w-auto">
        {pendente ? "Salvando..." : "Salvar excecao"}
      </Button>
    </form>
  );
}
