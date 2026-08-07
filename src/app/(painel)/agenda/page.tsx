import { AgendaMensal } from "@/components/agenda/agenda-mensal";
import { AgendaSemanal } from "@/components/agenda/agenda-semanal";
import { NavegacaoAgenda } from "@/components/agenda/navegacao-agenda";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  buscarAgendaOperacional,
  normalizarDataReferencia,
  normalizarVisualizacao,
} from "@/features/agenda/queries";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; visualizacao?: string }>;
}) {
  const parametros = await searchParams;
  const data = normalizarDataReferencia(parametros.data);
  const visualizacao = normalizarVisualizacao(parametros.visualizacao);
  const agenda = await buscarAgendaOperacional(data, visualizacao);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Agenda operacional"
        title="A semana para agir. O mes para planejar."
        description="Leia ocupacao, espacos livres e bloqueios; toque em uma aula para cancelar ou organizar uma reposicao."
        actions={<ButtonLink href="/configuracoes">Configurar agenda</ButtonLink>}
      />

      {!agenda.sincronizada ? (
        <Alert title="Nao foi possivel sincronizar a agenda" tone="danger">
          {agenda.mensagemErro}
        </Alert>
      ) : null}

      <NavegacaoAgenda
        dataReferencia={data}
        visualizacao={visualizacao}
        inicio={agenda.inicio}
        fim={agenda.fim}
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          ["Aulas", agenda.total_aulas],
          ["Livres", agenda.total_livres],
          ["Bloqueados", agenda.total_bloqueados],
        ].map(([rotulo, valor]) => (
          <Card key={rotulo} className="p-3 text-center sm:p-5">
            <p className="font-display text-3xl sm:text-4xl">{valor}</p>
            <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-foreground/48 sm:text-xs">
              {rotulo}
            </p>
          </Card>
        ))}
      </div>

      {visualizacao === "semana" ? (
        <AgendaSemanal dias={agenda.dias} />
      ) : (
        <AgendaMensal dias={agenda.dias} />
      )}
    </div>
  );
}
