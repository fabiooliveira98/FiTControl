import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { DiaAgenda } from "@/features/agenda/models";
import { formatarDiaSemana } from "@/utils/agenda";

const ordemDia = {
  SEGUNDA: 1,
  TERCA: 2,
  QUARTA: 3,
  QUINTA: 4,
  SEXTA: 5,
  SABADO: 6,
  DOMINGO: 7,
};

export function AgendaMensal({ dias }: { dias: DiaAgenda[] }) {
  const espacosIniciais = dias.length ? ordemDia[dias[0].dia_semana] - 1 : 0;

  return (
    <div>
      <div className="mb-2 hidden grid-cols-7 gap-2 px-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-foreground/45 md:grid">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((dia) => (
          <span key={dia}>{dia}</span>
        ))}
      </div>
      <div className="grid gap-2 md:grid-cols-7">
        {Array.from({ length: espacosIniciais }, (_, indice) => (
          <div key={`vazio-${indice}`} className="hidden md:block" />
        ))}
        {dias.map((dia) => (
          <Link
            key={dia.data}
            href={`/agenda?data=${dia.data}&visualizacao=semana`}
            className="min-h-28 rounded-2xl border border-border bg-white p-3 transition hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-2xl">{Number(dia.data.slice(-2))}</p>
                <p className="text-[0.65rem] text-foreground/45 md:hidden">
                  {formatarDiaSemana(dia.dia_semana)}
                </p>
              </div>
              {dia.total_bloqueados ? <Badge tone="danger">{dia.total_bloqueados}</Badge> : null}
            </div>
            <div className="mt-4 space-y-1 text-xs">
              <p className="font-semibold">{dia.total_aulas} aulas</p>
              <p className="text-success">{dia.total_livres} livres</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
