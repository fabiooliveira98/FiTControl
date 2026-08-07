"use client";

import { useActionState } from "react";
import { CalendarClock, CircleDollarSign } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  confirmarReposicaoAction,
  dispensarReposicaoAction,
} from "@/features/reposicoes/actions";
import { estadoInicialReposicao, type ReposicaoPendente } from "@/features/reposicoes/types";
import { formatarDataCurta } from "@/features/agenda/datas";

export function CardReposicao({ item }: { item: ReposicaoPendente }) {
  const [estado, action, pendente] = useActionState(
    confirmarReposicaoAction,
    estadoInicialReposicao,
  );

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-3xl">{item.aluno.nome}</h2>
            <Badge tone="warning">Pendente</Badge>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            Aula cancelada: <span className="capitalize">{formatarDataCurta(item.aula_original.data)}</span>
            {" · "}{item.aula_original.horario_inicio.slice(0, 5)}
          </p>
          {item.cancelamento.motivo ? (
            <p className="mt-2 text-sm text-foreground/68">Motivo: {item.cancelamento.motivo}</p>
          ) : null}
        </div>
        <form action={dispensarReposicaoAction}>
          <input type="hidden" name="reposicao_id" value={item.reposicao.id} />
          <Button type="submit" variant="ghost" size="sm">
            <CircleDollarSign size={16} />
            Resolver financeiramente
          </Button>
        </form>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2">
          <CalendarClock className="text-primary" size={18} />
          <h3 className="text-sm font-semibold">Proximos horarios validos</h3>
        </div>

        {item.sugestoes.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {item.sugestoes.map((sugestao) => (
              <form
                key={sugestao.chave}
                action={action}
                className="rounded-2xl border border-success/20 bg-[rgba(31,111,95,0.06)] p-3"
              >
                <input type="hidden" name="reposicao_id" value={item.reposicao.id} />
                <input type="hidden" name="data" value={sugestao.data} />
                <input type="hidden" name="horario_inicio" value={sugestao.horario_inicio} />
                <p className="text-sm font-semibold capitalize">{formatarDataCurta(sugestao.data)}</p>
                <p className="mt-1 text-xs text-foreground/58">
                  {sugestao.horario_inicio} · {sugestao.ocupacao}/{sugestao.capacidade} ocupados
                </p>
                <Button type="submit" size="sm" className="mt-3 w-full" disabled={pendente}>
                  {pendente ? "Confirmando..." : "Escolher"}
                </Button>
              </form>
            ))}
          </div>
        ) : (
          <Alert title="Sem encaixe automatico" tone="warning" className="mt-4">
            Nao encontramos horario valido nos proximos 45 dias. Ajuste a disponibilidade ou resolva financeiramente.
          </Alert>
        )}
      </div>

      {estado.status === "erro" ? (
        <Alert title="Nao foi possivel confirmar" tone="danger" className="mt-5">
          {estado.mensagem}
        </Alert>
      ) : null}
      {estado.status === "sucesso" ? (
        <Alert title="Reposicao confirmada" className="mt-5">
          O novo horario ja foi incluído na agenda.
        </Alert>
      ) : null}
    </Card>
  );
}
