"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { useActionState, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { remanejarParticipacoesAction } from "@/features/reposicoes/actions";
import type { OpcoesRemanejamento } from "@/features/reposicoes/types";
import { estadoInicialAcaoAula } from "@/features/reposicoes/types";
import { cn } from "@/lib/utils";

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${data}T12:00:00Z`));
}

export function FormularioRemanejamento({
  opcoes,
  dataMinima,
}: {
  opcoes: OpcoesRemanejamento;
  dataMinima: string;
}) {
  const primeiraSugestao = opcoes.sugestoes[0];
  const [data, setData] = useState(primeiraSugestao?.data ?? dataMinima);
  const [horario, setHorario] = useState(primeiraSugestao?.horario_inicio ?? "");
  const action = remanejarParticipacoesAction.bind(
    null,
    opcoes.aula.id,
    opcoes.aluno_ids,
  );
  const [estado, formAction, pendente] = useActionState(action, estadoInicialAcaoAula);

  if (opcoes.impedimento) {
    return (
      <Alert title="Remanejamento indisponivel" tone="warning">
        {opcoes.impedimento}
      </Alert>
    );
  }

  if (estado.status === "sucesso") {
    return (
      <div className="space-y-4">
        <Alert title="Remanejamento confirmado">{estado.mensagem}</Alert>
        <ButtonLink href={`/painel?data=${data}`} className="w-full">
          Ver dia de destino
        </ButtonLink>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Encaixes sugeridos
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Proximos horarios livres</h2>
          </div>
          <span className="text-xs text-foreground/55">Ate 45 dias</span>
        </div>
        {opcoes.sugestoes.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {opcoes.sugestoes.map((sugestao) => {
              const selecionada = data === sugestao.data && horario === sugestao.horario_inicio;
              return (
                <button
                  key={sugestao.chave}
                  type="button"
                  onClick={() => {
                    setData(sugestao.data);
                    setHorario(sugestao.horario_inicio);
                  }}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                    selecionada
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white hover:border-primary/30 hover:bg-surface-muted",
                  )}
                >
                  <span className="block text-sm font-semibold capitalize">
                    {formatarData(sugestao.data)}
                  </span>
                  <span className={cn("mt-1 block text-xs", selecionada ? "text-white/75" : "text-foreground/55")}>
                    {sugestao.horario_inicio} · {sugestao.capacidade - sugestao.ocupacao} vaga(s)
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <Alert title="Nenhuma sugestao imediata" tone="warning" className="mt-4">
            Escolha outra data e horario abaixo. O banco fara todas as validacoes antes de confirmar.
          </Alert>
        )}
      </section>

      <section className="rounded-[1.5rem] border border-border bg-surface-muted p-4 sm:p-5">
        <p className="text-sm font-semibold">Escolher outro horario</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Data">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-3.5 size-4 text-foreground/45" />
              <Input
                type="date"
                name="data"
                min={dataMinima}
                value={data}
                onChange={(evento) => setData(evento.target.value)}
                className="pl-11"
                required
                disabled={pendente}
              />
            </div>
          </Field>
          <Field label="Horario">
            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-4 top-3.5 size-4 text-foreground/45" />
              <Input
                type="time"
                name="horario_inicio"
                step={1800}
                value={horario}
                onChange={(evento) => setHorario(evento.target.value)}
                className="pl-11"
                required
                disabled={pendente}
              />
            </div>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Motivo" hint="Opcional.">
            <Textarea
              name="motivo"
              maxLength={240}
              placeholder="Ex.: ajuste pontual solicitado pela aluna"
              className="min-h-20"
              disabled={pendente}
            />
          </Field>
        </div>
      </section>

      {estado.status === "erro" ? (
        <Alert title="Nao foi possivel remanejar" tone="danger">
          {estado.mensagem}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" disabled={pendente || !data || !horario}>
        {pendente ? "Validando encaixe..." : "Confirmar remanejamento"}
      </Button>
    </form>
  );
}
