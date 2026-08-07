import { CalendarRange, Clock3, RefreshCcw, ShieldBan } from "lucide-react";

import { RankingReposicoes } from "@/components/painel/ranking-reposicoes";
import { SeletorPeriodo } from "@/components/painel/seletor-periodo";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/ui/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { formatarDataCurta } from "@/features/agenda/datas";
import {
  normalizarDataReferencia,
  normalizarVisualizacao,
} from "@/features/agenda/queries";
import { buscarDadosDashboard } from "@/features/painel/queries";

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; data?: string }>;
}) {
  const parametros = await searchParams;
  const periodo = normalizarVisualizacao(parametros.periodo);
  const data = normalizarDataReferencia(parametros.data);
  const dados = await buscarDadosDashboard(data, periodo);
  const indicadores = [
    {
      label: `Aulas no ${periodo === "mes" ? "mes" : "semana"}`,
      valor: dados.agenda_periodo.total_aulas,
      detalhe: "Encontros com pelo menos um aluno confirmado.",
      icon: CalendarRange,
    },
    {
      label: "Reposicoes pendentes",
      valor: dados.total_reposicoes_pendentes,
      detalhe: "Aulas canceladas que ainda precisam de encaixe.",
      icon: RefreshCcw,
    },
    {
      label: "Livres na semana",
      valor: dados.agenda_semana.total_livres,
      detalhe: "Slots sem alunos e sem bloqueio na semana de referencia.",
      icon: Clock3,
    },
    {
      label: "Bloqueados na semana",
      valor: dados.agenda_semana.total_bloqueados,
      detalhe: "Excecoes que retiram horarios da disponibilidade.",
      icon: ShieldBan,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Painel operacional"
        title="O que exige atencao aparece primeiro."
        description="Acompanhe carga de aulas, espacos para encaixe e a fila real de reposicoes."
        actions={<SeletorPeriodo periodo={periodo} data={data} />}
      />

      <DashboardShell
        metrics={
          <div className="grid gap-4 sm:grid-cols-2">
            {indicadores.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-border bg-white p-4">
                <item.icon className="size-5 text-primary" />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
                  {item.label}
                </p>
                <p className="mt-2 font-display text-5xl leading-none">{item.valor}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/64">{item.detalhe}</p>
              </div>
            ))}
          </div>
        }
        content={<RankingReposicoes ranking={dados.ranking} />}
      />

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Proximos espacos livres</CardTitle>
            <CardDescription className="mt-3">
              Atalhos da semana de referencia para decidir onde uma reposicao pode entrar.
            </CardDescription>
          </div>
          <ButtonLink href={`/agenda?data=${data}&visualizacao=semana`} variant="secondary" size="sm">
            Abrir agenda
          </ButtonLink>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dados.proximos_livres.length ? (
            dados.proximos_livres.map((slot) => (
              <div key={slot.chave} className="rounded-2xl border border-success/20 bg-[rgba(31,111,95,0.06)] px-4 py-3">
                <p className="text-sm font-semibold capitalize">{formatarDataCurta(slot.data)}</p>
                <p className="mt-1 text-xs text-success">
                  {slot.horario_inicio} - {slot.horario_fim}
                </p>
              </div>
            ))
          ) : (
            <p className="col-span-full rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-foreground/55">
              Nenhum slot livre nesta semana.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
