import {
  ArrowRight,
  CalendarDays,
  Clock3,
  RefreshCcw,
  UsersRound,
} from "lucide-react";

import { BotaoFinalizarDia } from "@/components/painel/botao-finalizar-dia";
import { FaixaSemana } from "@/components/painel/faixa-semana";
import { LinhaDoTempoDia } from "@/components/painel/linha-do-tempo-dia";
import { RankingReposicoes } from "@/components/painel/ranking-reposicoes";
import { ResumoHorariosLivres } from "@/components/painel/resumo-horarios-livres";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { obterDataAtualSaoPaulo } from "@/features/agenda/datas";
import { normalizarDataReferencia } from "@/features/agenda/queries";
import { buscarDadosPainelHoje } from "@/features/painel/queries";

function formatarDataCompleta(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${data}T12:00:00Z`));
}

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const parametros = await searchParams;
  const hoje = obterDataAtualSaoPaulo();
  const data = normalizarDataReferencia(parametros.data);
  const dados = await buscarDadosPainelHoje(data);
  const titulo = data === hoje ? "Hoje" : formatarDataCompleta(data);
  const proxima = dados.proxima_aula;

  return (
    <div className="space-y-7 sm:space-y-8">
      <PageHeader
        eyebrow="Painel diario"
        title={titulo}
        description={
          data === hoje
            ? formatarDataCompleta(data)
            : "Consulte e corrija o historico sem perder o contexto da semana."
        }
        actions={
          <ButtonLink href={`/agenda?data=${data}&visualizacao=semana`} variant="secondary">
            <CalendarDays className="size-4" aria-hidden="true" />
            Organizar semana
          </ButtonLink>
        }
      />

      {!dados.sincronizada ? (
        <Alert title="Nao foi possivel sincronizar todo o painel" tone="danger">
          {dados.mensagem_erro}
        </Alert>
      ) : null}

      <FaixaSemana dias={dados.semana} selecionado={data} hoje={hoje} />

      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="relative overflow-hidden bg-primary p-5 text-white sm:col-span-3 lg:col-span-1 lg:min-h-48">
          <div className="absolute -right-12 -top-16 size-40 rounded-full border border-white/15" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              {proxima?.status_operacional === "EM_ANDAMENTO" ? "Agora" : "Proxima aula"}
            </p>
            {proxima ? (
              <>
                <p className="mt-4 font-display text-5xl leading-none">
                  {proxima.horario_inicio.slice(0, 5)}
                </p>
                <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-white/90">
                  {proxima.participantes
                    .filter((participante) => !participante.cancelado)
                    .map((participante) => participante.nome)
                    .join(", ")}
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 font-display text-3xl leading-tight">Agenda tranquila</p>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Nenhuma proxima aula ativa para este dia.
                </p>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <UsersRound className="size-5 text-primary" aria-hidden="true" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/50">
            Aulas restantes
          </p>
          <p className="mt-2 font-display text-5xl leading-none">{dados.aulas_restantes}</p>
          <p className="mt-3 text-xs leading-5 text-foreground/55">de {dados.total_aulas} no dia</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <Clock3 className="size-5 text-success" aria-hidden="true" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/50">
            Horarios livres
          </p>
          <p className="mt-2 font-display text-5xl leading-none">{dados.horarios_livres.length}</p>
          <p className="mt-3 text-xs leading-5 text-foreground/55">possibilidades de encaixe</p>
        </Card>
      </section>

      <section className="grid gap-7 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.7fr)]">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Linha do tempo
              </p>
              <h2 className="mt-2 font-display text-4xl leading-none">Aulas do dia</h2>
            </div>
            <span className="text-xs text-foreground/50">Toque para agir</span>
          </div>
          <LinhaDoTempoDia aulas={dados.aulas} hoje={hoje} />
        </div>

        <aside className="space-y-4 xl:pt-10">
          <ResumoHorariosLivres horarios={dados.horarios_livres} />
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-accent-soft text-primary">
                <RefreshCcw className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Reposicoes pendentes</p>
                <p className="mt-1 font-display text-4xl">{dados.total_reposicoes_pendentes}</p>
              </div>
            </div>
            <ButtonLink href="/reposicoes" variant="ghost" size="sm" className="mt-4 w-full justify-between">
              Organizar fila <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </Card>
          {data <= hoje && dados.aulas_para_finalizar > 0 ? <BotaoFinalizarDia data={data} /> : null}
        </aside>
      </section>

      <Card className="p-5 sm:p-7">
        <RankingReposicoes ranking={dados.ranking} />
      </Card>
    </div>
  );
}
