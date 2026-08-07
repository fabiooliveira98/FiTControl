import { CalendarRange, RefreshCcw, UsersRound } from "lucide-react";

const beneficios = [
  {
    numero: "01",
    titulo: "Remaneje sem caçar mensagens",
    descricao:
      "Cancele uma aula, encontre os encaixes válidos e confirme o novo horário no mesmo fluxo.",
    icon: RefreshCcw,
  },
  {
    numero: "02",
    titulo: "Enxergue o hoje e planeje a semana",
    descricao:
      "Acompanhe a agenda do dia no celular e abra a visão semanal ou mensal quando precisar organizar mais longe.",
    icon: CalendarRange,
  },
  {
    numero: "03",
    titulo: "Cuide de cada formato de aula",
    descricao:
      "Controle alunos individuais, duplas e trios com capacidade clara e ações por participante ou grupo.",
    icon: UsersRound,
  },
];

export function BenefitGrid() {
  return (
    <div className="grid gap-px overflow-hidden rounded-[2rem] border border-border bg-border lg:grid-cols-3">
      {beneficios.map((beneficio) => (
        <article key={beneficio.numero} className="group bg-white p-6 transition hover:bg-accent-soft/35 sm:p-8">
          <div className="flex items-start justify-between">
            <span className="font-display text-2xl text-foreground/25">{beneficio.numero}</span>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-surface-muted text-primary transition group-hover:bg-primary group-hover:text-white">
              <beneficio.icon className="size-5" aria-hidden="true" />
            </span>
          </div>
          <h3 className="mt-12 max-w-xs font-display text-3xl font-semibold leading-[1.05]">
            {beneficio.titulo}
          </h3>
          <p className="mt-4 max-w-sm text-sm leading-7 text-foreground/62">
            {beneficio.descricao}
          </p>
        </article>
      ))}
    </div>
  );
}
