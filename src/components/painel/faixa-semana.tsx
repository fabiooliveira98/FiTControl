import Link from "next/link";

import type { DiaDaSemanaPainel } from "@/features/painel/types";
import { cn } from "@/lib/utils";

const nomesDias: Record<DiaDaSemanaPainel["dia_semana"], string> = {
  SEGUNDA: "Seg",
  TERCA: "Ter",
  QUARTA: "Qua",
  QUINTA: "Qui",
  SEXTA: "Sex",
  SABADO: "Sab",
  DOMINGO: "Dom",
};

export function FaixaSemana({
  dias,
  selecionado,
  hoje,
}: {
  dias: DiaDaSemanaPainel[];
  selecionado: string;
  hoje: string;
}) {
  return (
    <nav aria-label="Dias da semana" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <div className="grid min-w-[35rem] grid-cols-7 gap-2">
        {dias.map((dia) => {
          const ativo = dia.data === selecionado;
          return (
            <Link
              key={dia.data}
              href={`/painel?data=${dia.data}`}
              aria-current={ativo ? "date" : undefined}
              className={cn(
                "relative flex min-h-20 flex-col items-center justify-center rounded-2xl border px-2 py-3 text-center transition",
                ativo
                  ? "border-primary bg-primary text-white shadow-[0_10px_24px_rgba(55,10,66,0.2)]"
                  : "border-border bg-white hover:border-primary/25 hover:bg-surface-muted",
              )}
            >
              <span className={cn("text-[0.68rem] font-semibold uppercase tracking-[0.12em]", ativo ? "text-white/70" : "text-foreground/50")}>
                {nomesDias[dia.dia_semana]}
              </span>
              <span className="mt-1 font-display text-2xl font-semibold leading-none">
                {dia.data.slice(8, 10)}
              </span>
              <span className={cn("mt-1 text-[0.65rem]", ativo ? "text-white/70" : "text-foreground/45")}>
                {dia.total_aulas} aula(s)
              </span>
              {dia.data === hoje ? (
                <span className={cn("absolute right-2 top-2 size-1.5 rounded-full", ativo ? "bg-white" : "bg-action-hover")} />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
