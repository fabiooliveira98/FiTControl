import { CalendarDays, Check, Clock3 } from "lucide-react";

import { cn } from "@/lib/utils";

const dias = [
  { nome: "SEG", numero: "03" },
  { nome: "TER", numero: "04" },
  { nome: "QUA", numero: "05" },
  { nome: "QUI", numero: "06" },
  { nome: "SEX", numero: "07", ativo: true },
];

const aulas = [
  { horario: "07:00", nome: "Carlos", detalhe: "Presente", status: "Treino feito" },
  { horario: "08:00", nome: "Mariana", detalhe: "Falta registrada", status: "Reposicao" },
  { horario: "09:00", nome: "Joana", detalhe: "Avaliacao hoje", status: "Proxima" },
];

export function AgendaPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[34rem] py-10 lg:py-4">
      <div className="motion-float-slow absolute -left-2 top-1 z-20 rounded-2xl border border-success/20 bg-white px-4 py-3 shadow-[0_16px_42px_rgba(33,14,44,0.14)] sm:-left-9 sm:top-8">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-[rgba(31,111,95,0.12)] text-success">
            <Check className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold">Falta virou reposicao</p>
            <p className="mt-0.5 text-[0.68rem] text-foreground/50">Sexta, 14:30 liberada</p>
          </div>
        </div>
      </div>

      <div className="motion-preview-tilt relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-4 shadow-[0_38px_100px_rgba(55,10,66,0.2)] sm:p-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-primary">
              Agenda da semana
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">Sexta, 07 de agosto</p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-2xl bg-accent-soft text-primary">
            <CalendarDays className="size-5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {dias.map((dia) => (
            <div
              key={dia.nome}
              className={cn(
                "rounded-2xl border px-2 py-2.5 text-center",
                dia.ativo
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface-muted text-foreground/55",
              )}
            >
              <p className="text-[0.55rem] font-semibold tracking-[0.12em]">{dia.nome}</p>
              <p className="mt-1 font-display text-lg font-semibold leading-none">{dia.numero}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2.5">
          {aulas.map((aula, indice) => (
            <div
              key={aula.horario}
              className={cn(
                "motion-agenda-item flex items-center gap-3 rounded-2xl border p-3",
                indice === 1 ? "border-success/25 bg-[rgba(31,111,95,0.07)]" : "border-border bg-white",
              )}
              style={{ animationDelay: `${700 + indice * 140}ms` }}
            >
              <p className="w-12 shrink-0 font-display text-lg font-semibold">{aula.horario}</p>
              <span className="h-9 w-px bg-border" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{aula.nome}</p>
                <p className="mt-0.5 text-[0.65rem] text-foreground/48">{aula.detalhe}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.08em]",
                  indice === 1 ? "bg-success text-white" : "bg-surface-strong text-foreground/55",
                )}
              >
                {aula.status}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface-muted p-3">
            <Clock3 className="size-4 text-success" aria-hidden="true" />
            <p className="mt-3 font-display text-2xl font-semibold">3</p>
            <p className="text-[0.65rem] text-foreground/50">horarios livres hoje</p>
          </div>
          <div className="rounded-2xl bg-accent-soft p-3">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-foreground/42">Agora</p>
            <p className="mt-3 font-display text-xl font-semibold">Mariana ainda pode repor</p>
            <p className="mt-1 text-[0.65rem] text-foreground/50">Encaixe sugerido para sexta as 14:30</p>
          </div>
        </div>
      </div>

      <div className="motion-float absolute -bottom-1 right-0 z-20 max-w-[13rem] rounded-2xl bg-action px-4 py-3 text-on-action shadow-[0_18px_46px_rgba(55,10,66,0.22)] sm:-right-8 sm:bottom-8">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-on-action/72">Pergunta do dia</p>
        <p className="mt-2 text-sm font-semibold">Quem faltou ainda tem reposicao?</p>
        <p className="mt-1 text-[0.65rem] leading-4 text-on-action/75">
          O sistema responde sem voce parar a aula.
        </p>
      </div>
    </div>
  );
}
