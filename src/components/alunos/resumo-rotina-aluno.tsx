import { CalendarCheck2, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { HorarioRecorrenteAluno } from "@/types/dominio";
import {
  compararHorarios,
  diasSemana,
  formatarDiaSemana,
  formatarHorario,
} from "@/utils/agenda";

export function ResumoRotinaAluno({ rotinas }: { rotinas: HorarioRecorrenteAluno[] }) {
  const ordenadas = [...rotinas].sort((a, b) => {
    const ordemDia = diasSemana.indexOf(a.dia_semana) - diasSemana.indexOf(b.dia_semana);
    return ordemDia || compararHorarios(a.horario_inicio, b.horario_inicio);
  });

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-muted text-primary">
            <CalendarCheck2 size={19} />
          </div>
          <div>
            <p className="font-display text-2xl">Rotina ativa</p>
            <p className="mt-1 text-sm text-foreground/55">
              Estes horarios estao reservados na agenda semanal.
            </p>
          </div>
        </div>
        <Badge tone="success">{ordenadas.length} horarios</Badge>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ordenadas.map((rotina) => (
          <div
            key={rotina.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3"
          >
            <Clock3 className="shrink-0 text-primary" size={17} />
            <div>
              <p className="text-sm font-semibold">{formatarDiaSemana(rotina.dia_semana)}</p>
              <p className="mt-0.5 text-xs text-foreground/52">
                {formatarHorario(rotina.horario_inicio)} - {formatarHorario(rotina.horario_fim)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
