import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  formatarTituloPeriodo,
  navegarPeriodo,
  obterDataAtualSaoPaulo,
  type VisualizacaoAgenda,
} from "@/features/agenda/datas";
import { cn } from "@/lib/utils";

function hrefAgenda(data: string, visualizacao: VisualizacaoAgenda) {
  return `/agenda?data=${data}&visualizacao=${visualizacao}`;
}

export function NavegacaoAgenda({
  dataReferencia,
  visualizacao,
  inicio,
  fim,
}: {
  dataReferencia: string;
  visualizacao: VisualizacaoAgenda;
  inicio: string;
  fim: string;
}) {
  const anterior = navegarPeriodo(dataReferencia, visualizacao, -1);
  const proximo = navegarPeriodo(dataReferencia, visualizacao, 1);

  return (
    <div className="flex flex-col gap-4 rounded-[1.6rem] border border-border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Link
          href={hrefAgenda(anterior, visualizacao)}
          aria-label="Periodo anterior"
          className="grid size-10 place-items-center rounded-xl border border-border bg-surface-muted"
        >
          <ChevronLeft size={18} />
        </Link>
        <Link
          href={hrefAgenda(obterDataAtualSaoPaulo(), visualizacao)}
          className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold"
        >
          Hoje
        </Link>
        <Link
          href={hrefAgenda(proximo, visualizacao)}
          aria-label="Proximo periodo"
          className="grid size-10 place-items-center rounded-xl border border-border bg-surface-muted"
        >
          <ChevronRight size={18} />
        </Link>
        <p className="ml-2 text-sm font-semibold capitalize sm:text-base">
          {formatarTituloPeriodo(inicio, fim, visualizacao)}
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-xl bg-surface-muted p-1">
        {(["semana", "mes"] as VisualizacaoAgenda[]).map((modo) => (
          <Link
            key={modo}
            href={hrefAgenda(dataReferencia, modo)}
            className={cn(
              "rounded-lg px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] transition",
              visualizacao === modo ? "bg-white text-foreground shadow-sm" : "text-foreground/55",
            )}
          >
            {modo}
          </Link>
        ))}
      </div>
    </div>
  );
}
