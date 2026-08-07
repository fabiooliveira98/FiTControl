import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import type { RankingReposicao } from "@/features/painel/types";
import { formatarDiaSemana, formatarHorario } from "@/utils/agenda";

export function RankingReposicoes({ ranking }: { ranking: RankingReposicao[] }) {
  if (!ranking.length) {
    return (
      <div>
        <CardTitle>Rank de reposicoes</CardTitle>
        <EmptyState
          title="Fila zerada"
          description="Nenhum aluno possui reposicao pendente neste momento."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Rank de reposicoes</CardTitle>
          <CardDescription className="mt-3">
            Alunos com mais pendencias aparecem primeiro.
          </CardDescription>
        </div>
        <ButtonLink href="/reposicoes" variant="secondary" size="sm">
          Expandir fila
        </ButtonLink>
      </div>

      <div className="mt-6">
        <ResponsiveTable headers={["Aluno", "Pendencias", "Rotina", "Acao"]}>
          {ranking.slice(0, 6).map((item) => (
            <Link
              key={item.aluno_id}
              href={`/reposicoes?aluno=${item.aluno_id}`}
              className="grid gap-2 border-t border-border px-4 py-4 text-sm first:border-t-0 md:grid-cols-[1.3fr_repeat(2,0.9fr)_0.7fr] md:gap-4 md:px-5"
            >
              <span className="font-semibold">{item.nome}</span>
              <span>{item.quantidade}</span>
              <span className="text-foreground/65">
                {item.rotinas
                  .map(
                    (rotina) =>
                      `${formatarDiaSemana(rotina.dia_semana).slice(0, 3)} ${formatarHorario(rotina.horario_inicio)}`,
                  )
                  .join(" · ") || "Sem rotina"}
              </span>
              <span className="font-semibold text-primary">Organizar</span>
            </Link>
          ))}
        </ResponsiveTable>
      </div>
    </div>
  );
}
