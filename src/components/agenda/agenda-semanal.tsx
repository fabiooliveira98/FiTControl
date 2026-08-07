import { SlotAgendaCard } from "@/components/agenda/slot-agenda";
import { Badge } from "@/components/ui/badge";
import type { DiaAgenda } from "@/features/agenda/models";
import { formatarDataCurta } from "@/features/agenda/datas";
import { formatarDiaSemana } from "@/utils/agenda";

export function AgendaSemanal({ dias }: { dias: DiaAgenda[] }) {
  return (
    <div className="grid gap-3 xl:grid-cols-7">
      {dias.map((dia) => (
        <section key={dia.data} className="rounded-[1.6rem] border border-border bg-surface-muted/55 p-3">
          <div className="flex items-start justify-between gap-2 xl:block">
            <div>
              <h2 className="font-display text-2xl">{formatarDiaSemana(dia.dia_semana)}</h2>
              <p className="mt-1 text-xs capitalize text-foreground/50">
                {formatarDataCurta(dia.data)}
              </p>
            </div>
            <Badge className="xl:mt-3">{dia.total_aulas} aulas</Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-1">
            {dia.slots.length ? (
              dia.slots.map((slot) => <SlotAgendaCard key={slot.chave} slot={slot} />)
            ) : (
              <p className="col-span-full rounded-2xl border border-dashed border-border px-3 py-5 text-center text-xs text-foreground/45">
                Sem expediente
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
