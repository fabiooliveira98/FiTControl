import { CalendarPlus2, CalendarX2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { excluirExcecaoAgendaAction } from "@/features/agenda/actions";
import { formatarDataCurta } from "@/features/agenda/datas";
import type {
  AberturaAgenda,
  BloqueioAgenda,
  TipoExcecaoAgenda,
} from "@/types/dominio";
import { formatarHorario } from "@/utils/agenda";

type ExcecaoLista = (AberturaAgenda | BloqueioAgenda) & {
  tipo: TipoExcecaoAgenda;
};

export function ListaExcecoesAgenda({
  aberturas,
  bloqueios,
}: {
  aberturas: AberturaAgenda[];
  bloqueios: BloqueioAgenda[];
}) {
  const excecoes: ExcecaoLista[] = [
    ...aberturas.map((item) => ({ ...item, tipo: "ABRIR" as const })),
    ...bloqueios.map((item) => ({ ...item, tipo: "BLOQUEAR" as const })),
  ].sort((a, b) =>
    `${a.data}|${a.horario_inicio}`.localeCompare(`${b.data}|${b.horario_inicio}`),
  );

  if (excecoes.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border-strong px-5 py-8 text-center">
        <CalendarX2 className="mx-auto text-primary" size={24} />
        <p className="mt-3 text-sm font-semibold">Nenhuma excecao futura</p>
        <p className="mt-1 text-sm text-foreground/55">
          A agenda segue somente a faixa semanal configurada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {excecoes.map((excecao) => {
        const abertura = excecao.tipo === "ABRIR";
        const Icone = abertura ? CalendarPlus2 : CalendarX2;

        return (
          <article
            key={`${excecao.tipo}|${excecao.id}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white px-4 py-3"
          >
            <div className="flex min-w-0 items-start gap-3">
              <Icone className="mt-0.5 shrink-0 text-primary" size={18} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold capitalize">
                    {formatarDataCurta(excecao.data)} - {formatarHorario(excecao.horario_inicio)}
                  </p>
                  <Badge>{abertura ? "Aberto" : "Bloqueado"}</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-foreground/55">
                  {excecao.motivo || "Sem motivo informado"}
                </p>
              </div>
            </div>
            <form action={excluirExcecaoAgendaAction}>
              <input type="hidden" name="id" value={excecao.id} />
              <input type="hidden" name="tipo" value={excecao.tipo} />
              <button
                type="submit"
                className="grid size-10 place-items-center rounded-xl text-danger transition hover:bg-[rgba(166,56,85,0.08)]"
                aria-label="Remover excecao"
              >
                <Trash2 size={17} />
              </button>
            </form>
          </article>
        );
      })}
    </div>
  );
}
