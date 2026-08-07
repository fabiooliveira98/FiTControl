import { ChevronDown, Clock3 } from "lucide-react";

import type { SlotAgenda } from "@/features/agenda/models";

export function ResumoHorariosLivres({ horarios }: { horarios: SlotAgenda[] }) {
  return (
    <details className="group rounded-[1.5rem] border border-border bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-4 p-4 sm:p-5">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[rgba(31,111,95,0.1)] text-success">
          <Clock3 className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{horarios.length} horario(s) livre(s)</span>
          <span className="mt-0.5 block text-xs text-foreground/55">
            Toque para consultar possibilidades de encaixe.
          </span>
        </span>
        <ChevronDown className="size-5 text-foreground/40 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="grid gap-2 border-t border-border px-4 pb-4 pt-4 sm:grid-cols-2 sm:px-5 sm:pb-5 lg:grid-cols-3">
        {horarios.length ? (
          horarios.map((horario) => (
            <div key={horario.chave} className="rounded-2xl border border-success/20 bg-[rgba(31,111,95,0.06)] px-4 py-3">
              <p className="text-sm font-semibold">{horario.horario_inicio}</p>
              <p className="mt-1 text-xs text-success">Livre ate {horario.horario_fim}</p>
            </div>
          ))
        ) : (
          <p className="col-span-full py-4 text-center text-sm text-foreground/55">
            Nao ha horarios livres nesta data.
          </p>
        )}
      </div>
    </details>
  );
}
