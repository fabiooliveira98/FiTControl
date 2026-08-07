import Link from "next/link";

import { CardReposicao } from "@/components/reposicoes/card-reposicao";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { buscarReposicoesPendentes } from "@/features/reposicoes/queries";

export default async function ReposicoesPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string }>;
}) {
  const { aluno } = await searchParams;
  const pendencias = await buscarReposicoesPendentes(aluno);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reposicoes"
        title="Pendencias com caminhos claros para resolver."
        description="Cada sugestao ja considera bloqueios, lotacao, conflito do aluno e a disponibilidade semanal da personal."
      />

      {aluno ? (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm">
          <span>Fila filtrada por aluno.</span>
          <Link href="/reposicoes" className="font-semibold text-primary">Limpar filtro</Link>
        </div>
      ) : null}

      {pendencias.length ? (
        <div className="space-y-4">
          {pendencias.map((item) => (
            <CardReposicao key={item.reposicao.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma reposicao pendente"
          description={
            aluno
              ? "Este aluno nao possui pendencias na fila."
              : "Todos os cancelamentos foram resolvidos ou direcionados para ajuste financeiro."
          }
        />
      )}
    </div>
  );
}
