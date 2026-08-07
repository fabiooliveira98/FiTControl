import Link from "next/link";
import { CalendarDays, ChevronRight, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AlunoResumo } from "@/features/alunos/types";
import { formatarDiaSemana, formatarHorario } from "@/utils/agenda";

function tomStatus(status: AlunoResumo["status"]): "success" | "warning" | "danger" {
  if (status === "ATIVO") return "success";
  if (status === "PAUSADO") return "warning";
  return "danger";
}

export function ListaAlunos({ alunos }: { alunos: AlunoResumo[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {alunos.map((aluno) => (
        <Link
          key={aluno.id}
          href={`/alunos/${aluno.id}`}
          className="group rounded-[1.6rem] border border-border bg-white p-5 transition hover:border-primary/30 hover:shadow-[0_14px_36px_rgba(33,14,44,0.08)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate font-display text-3xl">{aluno.nome}</h2>
              <p className="mt-1 truncate text-sm text-foreground/55">
                {aluno.telefone || aluno.email || "Sem contato informado"}
              </p>
            </div>
            <ChevronRight className="mt-1 shrink-0 text-foreground/35 transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone={tomStatus(aluno.status)}>{aluno.status}</Badge>
            {aluno.treina_segunda_a_sexta ? <Badge tone="warning">5x na semana</Badge> : null}
          </div>

          <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex gap-2 text-foreground/68">
              <CalendarDays className="mt-0.5 shrink-0" size={16} />
              <span>
                {aluno.rotinas.length
                  ? aluno.rotinas
                      .map(
                        (rotina) =>
                          `${formatarDiaSemana(rotina.dia_semana).slice(0, 3)} ${formatarHorario(rotina.horario_inicio)}`,
                      )
                      .join(" · ")
                  : "Sem rotina ativa"}
              </span>
            </div>
            {aluno.reposicoes_pendentes > 0 ? (
              <div className="flex items-center gap-2 font-semibold text-warning">
                <RotateCcw size={16} />
                {aluno.reposicoes_pendentes} reposicao(oes) pendente(s)
              </div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
