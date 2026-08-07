"use client";

import { useActionState, useState } from "react";

import { MensagemAcaoAgenda } from "@/components/agenda/mensagem-acao-agenda";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { aplicarFaixaDisponibilidadeAction } from "@/features/agenda/actions";
import { estadoInicialAgenda } from "@/features/agenda/types";
import { diasSemana, formatarDiaSemana, montarIntervalosPadrao } from "@/utils/agenda";

export function FormularioFaixaDisponibilidade({ habilitado }: { habilitado: boolean }) {
  const [estado, action, pendente] = useActionState(
    aplicarFaixaDisponibilidadeAction,
    estadoInicialAgenda,
  );
  const [desativarDias, setDesativarDias] = useState(false);
  const horarios = montarIntervalosPadrao();

  return (
    <form action={action} className="space-y-5">
      <fieldset>
        <legend className="text-sm font-semibold">Aplicar aos dias</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {diasSemana.map((dia, indice) => (
            <label
              key={dia}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
            >
              <input
                type="checkbox"
                name="dias"
                value={dia}
                defaultChecked={indice < 5}
                disabled={!habilitado || pendente}
                className="size-4 accent-primary"
              />
              {formatarDiaSemana(dia)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Primeiro inicio">
          <Select
            name="horario_inicio"
            defaultValue="05:00"
            disabled={!habilitado || pendente}
          >
            {horarios.map((horario) => (
              <option key={horario} value={horario}>
                {horario}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ultimo inicio" hint="A aula termina uma hora depois.">
          <Select
            name="ultimo_inicio"
            defaultValue="20:00"
            disabled={!habilitado || pendente}
          >
            {horarios.map((horario) => (
              <option key={horario} value={horario}>
                {horario}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3">
        <input
          type="checkbox"
          name="desativar_dias"
          value="true"
          checked={desativarDias}
          onChange={(evento) => setDesativarDias(evento.target.checked)}
          disabled={!habilitado || pendente}
          className="mt-0.5 size-4 accent-primary"
        />
        <span>
          <span className="block text-sm font-semibold">Dias sem expediente recorrente</span>
          <span className="mt-1 block text-xs leading-5 text-foreground/55">
            Desativa a faixa inteira nos dias selecionados. Horarios com alunos fixos sao preservados.
          </span>
        </span>
      </label>

      <Alert title="Faixa recorrente">
        Horarios com alunos fixos sao preservados. Use excecoes por data para abrir um
        almoco ou bloquear um compromisso sem alterar todas as semanas.
      </Alert>
      <MensagemAcaoAgenda estado={estado} />
      <Button type="submit" disabled={!habilitado || pendente} className="w-full sm:w-auto">
        {pendente
          ? "Aplicando..."
          : desativarDias
            ? "Fechar dias selecionados"
            : "Aplicar faixa"}
      </Button>
    </form>
  );
}
