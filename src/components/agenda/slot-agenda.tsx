import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { SlotAgenda } from "@/features/agenda/models";
import { cn } from "@/lib/utils";

const estilos = {
  LIVRE: "border-success/20 bg-[rgba(31,111,95,0.06)]",
  OCUPADO: "border-primary/20 bg-white",
  BLOQUEADO: "border-danger/20 bg-[rgba(166,56,85,0.07)]",
  INDISPONIVEL: "border-warning/20 bg-[rgba(154,103,0,0.06)]",
  CONFLITO: "border-warning/30 bg-[rgba(154,103,0,0.08)]",
};

export function SlotAgendaCard({ slot }: { slot: SlotAgenda }) {
  const participantes = slot.aulas.flatMap((aula) => aula.participantes);
  const aulaPrincipal = slot.aulas[0];

  const conteudo = (
    <div className={cn("rounded-2xl border p-3 transition", estilos[slot.status])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{slot.horario_inicio}</p>
          <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.12em] text-foreground/48">
            ate {slot.horario_fim}
          </p>
        </div>
        <Badge
          tone={
            slot.status === "LIVRE"
              ? "success"
              : slot.status === "BLOQUEADO"
                ? "danger"
                : slot.status === "CONFLITO" || slot.status === "INDISPONIVEL"
                  ? "warning"
                  : "default"
          }
          className="px-2 py-1 text-[0.58rem]"
        >
          {slot.status === "OCUPADO" ? `${slot.ocupacao}/${slot.capacidade}` : slot.status}
        </Badge>
      </div>

      {participantes.length ? (
        <div className="mt-3 space-y-1.5">
          {participantes.map((participante) => (
            <p
              key={`${aulaPrincipal?.id}-${participante.aluno_id}`}
              className={cn(
                "truncate text-xs font-medium",
                participante.cancelado && "text-foreground/40 line-through",
              )}
            >
              {participante.nome}
            </p>
          ))}
        </div>
      ) : slot.bloqueio ? (
        <p className="mt-3 truncate text-xs text-danger">
          {slot.bloqueio.motivo || "Indisponivel nesta data"}
        </p>
      ) : slot.status === "INDISPONIVEL" ? (
        <p className="mt-3 text-xs text-warning">Sobreposicao com outra aula</p>
      ) : slot.abertura ? (
        <p className="mt-3 truncate text-xs text-success">
          {slot.abertura.motivo || "Abertura excepcional"}
        </p>
      ) : (
        <p className="mt-3 text-xs text-success">Disponivel para encaixe</p>
      )}
    </div>
  );

  return aulaPrincipal ? (
    <Link href={`/agenda/aulas/${aulaPrincipal.id}`} className="block hover:-translate-y-0.5">
      {conteudo}
    </Link>
  ) : (
    conteudo
  );
}
