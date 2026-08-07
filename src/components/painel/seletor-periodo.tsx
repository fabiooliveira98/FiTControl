import Link from "next/link";

import type { VisualizacaoAgenda } from "@/features/agenda/datas";
import { cn } from "@/lib/utils";

export function SeletorPeriodo({
  periodo,
  data,
}: {
  periodo: VisualizacaoAgenda;
  data: string;
}) {
  return (
    <div className="grid grid-cols-2 rounded-xl border border-border bg-surface-muted p-1">
      {(["semana", "mes"] as VisualizacaoAgenda[]).map((opcao) => (
        <Link
          key={opcao}
          href={`/painel?periodo=${opcao}&data=${data}`}
          className={cn(
            "rounded-lg px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em]",
            periodo === opcao ? "bg-white shadow-sm" : "text-foreground/50",
          )}
        >
          {opcao}
        </Link>
      ))}
    </div>
  );
}
