import { ArrowDown, ArrowRight } from "lucide-react";

import { AgendaPreview } from "@/components/marketing/agenda-preview";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ButtonLink } from "@/components/ui/button";

const cenas = [
  {
    id: "cadastro",
    etapa: "01",
    titulo: "Um aluno novo chegou.",
    descricao:
      "Cadastre nome, modalidade, duracao da aula, data de inicio e os horarios fixos sem montar planilha paralela.",
    acao: "Criar meu primeiro aluno",
  },
  {
    id: "reposicao",
    etapa: "02",
    titulo: "Mariana faltou hoje.",
    descricao:
      "Registre a falta, veja se ela ainda tem reposicao e encaixe um novo horario sem voltar para o WhatsApp.",
    acao: "Ver reposicoes",
  },
  {
    id: "avaliacao",
    etapa: "03",
    titulo: "Chegou o dia da avaliacao.",
    descricao:
      "Abra o historico do aluno e consulte rapidamente a ultima avaliacao antes de começar a aula.",
    acao: "Consultar historico",
  },
  {
    id: "agenda",
    etapa: "04",
    titulo: "Como esta minha agenda hoje?",
    descricao:
      "Veja a distribuicao do dia, encontre horarios livres e entenda o que precisa de acao antes da proxima aula.",
    acao: "Ver a agenda",
  },
] as const;

const agendaHoje = [
  { hora: "07:00", aluno: "Carlos", status: "Presente", detalhe: "Treino funcional" },
  { hora: "08:00", aluno: "Mariana", status: "Falta", detalhe: "Reposicao pendente" },
  { hora: "09:00", aluno: "Joana", status: "Presente", detalhe: "Avaliacao agendada" },
  { hora: "10:00", aluno: "Livre", status: "Disponivel", detalhe: "Encaixe possivel" },
] as const;

const horariosFixos = [
  { dia: "Seg", horario: "07:00", turma: "Funcional" },
  { dia: "Qua", horario: "07:00", turma: "Funcional" },
  { dia: "Sex", horario: "07:00", turma: "Funcional" },
] as const;

const reposicoes = [
  { data: "Hoje", evento: "Falta registrada", estado: "1 reposicao liberada" },
  { data: "Sex, 14:30", evento: "Horario valido encontrado", estado: "Aguardando confirmacao" },
  { data: "Seg, 08:00", evento: "Novo treino reservado", estado: "Reposicao confirmada" },
] as const;

const avaliacoes = [
  { data: "06 ago", titulo: "Avaliacao atual", detalhe: "Mobilidade do ombro e carga revisadas" },
  { data: "22 jul", titulo: "Ultima avaliacao", detalhe: "Evolucao de resistencia registrada" },
  { data: "08 jul", titulo: "Inicio do acompanhamento", detalhe: "Medidas e objetivo definidos" },
] as const;

const visaoDia = [
  { hora: "06:30", nome: "Clara", tipo: "Individual" },
  { hora: "07:30", nome: "Marina + Luiza", tipo: "Dupla" },
  { hora: "09:00", nome: "Rafael", tipo: "Individual" },
  { hora: "11:00", nome: "Livre", tipo: "Encaixe aberto" },
  { hora: "14:30", nome: "Reposicao", tipo: "Mariana" },
] as const;

function SceneIntro({
  etapa,
  titulo,
  descricao,
  acao,
  href,
}: {
  etapa: string;
  titulo: string;
  descricao: string;
  acao: string;
  href: string;
}) {
  return (
    <div className="max-w-md">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary/62">
        Cena {etapa}
      </p>
      <h2 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-5xl">
        {titulo}
      </h2>
      <p className="mt-5 text-sm leading-7 text-foreground/66 sm:text-base">{descricao}</p>
      <ButtonLink href={href} variant="secondary" className="mt-7">
        {acao} <ArrowRight className="size-4" aria-hidden="true" />
      </ButtonLink>
    </div>
  );
}

function CadastroScene() {
  return (
    <section id="cadastro" className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-18 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10 lg:py-24">
        <SceneIntro
          etapa={cenas[0].etapa}
          titulo={cenas[0].titulo}
          descricao={cenas[0].descricao}
          acao={cenas[0].acao}
          href="/entrar"
        />

        <div className="painel motion-reveal overflow-hidden rounded-[2rem]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border-b border-border px-5 py-5 sm:px-7 lg:border-b-0 lg:border-r lg:py-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/62">
                    Cadastro do aluno
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold">Bruno Ferreira</p>
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 text-[0.65rem] font-semibold text-success">
                  Inicio em 12 ago
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Modalidade", "Funcional"],
                  ["Duracao da aula", "50 min"],
                  ["Plano", "2x por semana"],
                  ["Observacao", "Dor leve no joelho"],
                ].map(([label, value]) => (
                  <div key={label} className="border-t border-border pt-3">
                    <p className="text-[0.65rem] uppercase tracking-[0.16em] text-foreground/45">{label}</p>
                    <p className="mt-2 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-muted px-5 py-5 sm:px-7 lg:py-7">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/62">
                Horarios fixos
              </p>
              <div className="mt-5 space-y-3">
                {horariosFixos.map((item) => (
                  <div
                    key={`${item.dia}-${item.horario}`}
                    className="flex items-center justify-between border-b border-border/80 pb-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{item.dia}</p>
                      <p className="text-[0.72rem] text-foreground/48">{item.turma}</p>
                    </div>
                    <p className="font-display text-xl font-semibold">{item.horario}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-6 text-foreground/52">
                O FitControl salva a rotina do aluno junto com o restante do cadastro. Nao sobra parte critica
                da agenda perdida em anotacao.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReposicaoScene() {
  return (
    <section id="reposicao" className="border-t border-border bg-surface-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-18 sm:px-8 lg:grid-cols-[0.84fr_1.16fr] lg:px-10 lg:py-24">
        <SceneIntro
          etapa={cenas[1].etapa}
          titulo={cenas[1].titulo}
          descricao={cenas[1].descricao}
          acao={cenas[1].acao}
          href="/reposicoes"
        />

        <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="painel motion-reveal rounded-[2rem] px-5 py-5 sm:px-7 sm:py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/62">
                  Aula das 08:00
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">Mariana Costa</p>
              </div>
              <span className="rounded-full bg-danger/10 px-3 py-1 text-[0.65rem] font-semibold text-danger">
                Falta registrada
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {[
                ["Status da aula", "Ausente sem atendimento"],
                ["Reposicao disponivel", "Sim, 1 aula"],
                ["Prazo sugerido", "Ate a proxima semana"],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-border pt-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.16em] text-foreground/45">{label}</p>
                  <p className="mt-2 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="painel motion-reveal reveal-delay-2 rounded-[2rem] px-5 py-5 sm:px-7 sm:py-7">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/62">
              Fluxo da reposicao
            </p>
            <div className="mt-6 space-y-5">
              {reposicoes.map((item, indice) => (
                <div key={item.evento} className="grid grid-cols-[4.5rem_1fr] gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/42">{item.data}</p>
                  <div className="relative border-l border-border pl-4">
                    <span className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-action-hover" />
                    <p className="text-sm font-semibold">{item.evento}</p>
                    <p className="mt-1 text-xs leading-5 text-foreground/55">{item.estado}</p>
                    {indice === 1 ? (
                      <div className="mt-3 inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-[0.68rem] font-semibold text-success">
                        Sexta as 14:30 ainda cabe na agenda
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function AvaliacaoScene() {
  return (
    <section id="avaliacao" className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-18 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-24">
        <SceneIntro
          etapa={cenas[2].etapa}
          titulo={cenas[2].titulo}
          descricao={cenas[2].descricao}
          acao={cenas[2].acao}
          href="/alunos"
        />

        <div className="painel motion-reveal overflow-hidden rounded-[2rem]">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-border px-5 py-5 sm:px-7 lg:border-b-0 lg:border-r lg:py-7">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/62">
                Historico de avaliacao
              </p>
              <div className="mt-6 space-y-4">
                {avaliacoes.map((item, indice) => (
                  <div key={item.data} className={indice === 0 ? "border-b border-border pb-4" : ""}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{item.titulo}</p>
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-foreground/42">{item.data}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-foreground/58">{item.detalhe}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary px-5 py-5 text-white sm:px-7 lg:py-7">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-accent">
                Antes da aula
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold leading-tight">
                Abra a ultima avaliacao sem sair do contexto do aluno.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/72">
                O historico mostra o que mudou desde a ultima revisao e evita repetir perguntas que ja fazem parte
                do acompanhamento.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  ["Objetivo atual", "Ganhar resistencia"],
                  ["Ultima revisao", "06 ago"],
                  ["Ponto de atencao", "Ombro direito"],
                  ["Proxima checagem", "20 ago"],
                ].map(([label, value]) => (
                  <div key={label} className="border-t border-white/14 pt-3">
                    <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/42">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AgendaScene() {
  return (
    <section id="agenda" className="border-y border-border bg-surface-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-18 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-10 lg:py-24">
        <SceneIntro
          etapa={cenas[3].etapa}
          titulo={cenas[3].titulo}
          descricao={cenas[3].descricao}
          acao={cenas[3].acao}
          href="/agenda"
        />

        <div className="painel motion-reveal overflow-hidden rounded-[2rem]">
          <div className="border-b border-border px-5 py-5 sm:px-7 lg:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/62">
                  Agenda de hoje
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">Sabado, 08 de agosto</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:w-[20rem]">
                <div className="rounded-2xl bg-surface-muted px-4 py-3">
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-foreground/42">Horarios livres</p>
                  <p className="mt-2 font-display text-2xl font-semibold">3</p>
                </div>
                <div className="rounded-2xl bg-accent-soft px-4 py-3">
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-foreground/42">Acoes pendentes</p>
                  <p className="mt-2 font-display text-2xl font-semibold">2</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 sm:px-7 sm:py-6">
            <div className="space-y-3">
              {visaoDia.map((item, indice) => (
                <div
                  key={`${item.hora}-${item.nome}`}
                  className="motion-agenda-item grid items-center gap-3 rounded-[1.4rem] border border-border bg-white px-4 py-3 sm:grid-cols-[5.5rem_1fr_auto]"
                  style={{ animationDelay: `${240 + indice * 120}ms` }}
                >
                  <p className="font-display text-2xl font-semibold leading-none">{item.hora}</p>
                  <div>
                    <p className="text-sm font-semibold">{item.nome}</p>
                    <p className="mt-1 text-[0.72rem] text-foreground/48">{item.tipo}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[0.62rem] uppercase tracking-[0.16em] text-foreground/42">
                      {item.nome === "Livre" ? "Status" : "Proxima acao"}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {item.nome === "Livre" ? "Pronto para encaixe" : item.nome === "Reposicao" ? "Confirmar com aluna" : "Aula prevista"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <div className="relative border-b border-border bg-[linear-gradient(180deg,#fffdfd_0%,#f9f4f8_100%)]">
        <div className="landing-orb landing-orb-one" />
        <div className="landing-orb landing-orb-two" />
        <MarketingHeader />

        <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:pb-20 lg:pt-10">
          <div className="relative z-10 flex flex-col justify-center">
            <p className="motion-reveal text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/58">
              Rotina real de personal trainer
            </p>
            <h1 className="motion-reveal reveal-delay-1 mt-5 max-w-3xl font-display text-[3rem] font-semibold leading-[0.9] tracking-[-0.05em] sm:text-[4.6rem] lg:text-[5.35rem]">
              Quem faltou ainda tem reposicao?
            </h1>
            <p className="motion-reveal reveal-delay-2 mt-6 max-w-xl text-base leading-8 text-foreground/66 sm:text-lg">
              O FitControl foi feito para responder perguntas operacionais do seu dia. Veja quem treina hoje,
              registre uma falta e encontre um novo horario sem improvisar no meio da aula.
            </p>

            <div className="motion-reveal reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/entrar" className="sm:min-w-48">
                Organizar meus alunos <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#cadastro" variant="secondary" className="sm:min-w-44">
                Ver a rotina <ArrowDown className="size-4" aria-hidden="true" />
              </ButtonLink>
            </div>

            <div className="motion-reveal reveal-delay-4 mt-10 border-t border-border pt-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {agendaHoje.map((item) => (
                  <div key={`${item.hora}-${item.aluno}`} className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 text-sm">
                    <div>
                      <p className="font-semibold">{item.hora}</p>
                      <p className="mt-1 text-foreground/52">{item.aluno}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.status}</p>
                      <p className="mt-1 text-[0.72rem] text-foreground/48">{item.detalhe}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center">
            <AgendaPreview />
          </div>
        </section>
      </div>

      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-10 lg:py-14">
          <p className="text-sm leading-7 text-foreground/64">
            Em vez de prometer produtividade de forma abstrata, a landing agora acompanha a rotina de quem atende
            aluno por aluno, horario por horario.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cenas.map((cena) => (
              <a
                key={cena.id}
                href={`#${cena.id}`}
                className="group rounded-[1.6rem] border border-border bg-surface px-4 py-4 transition hover:border-primary/28 hover:bg-surface-muted"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/56">{cena.etapa}</p>
                <p className="mt-3 font-display text-2xl font-semibold leading-tight">{cena.titulo}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/56">{cena.acao}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <CadastroScene />
      <ReposicaoScene />
      <AvaliacaoScene />
      <AgendaScene />

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 border border-border bg-primary px-6 py-10 text-white sm:px-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-end lg:px-14">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-accent">
              Para a rotina que realmente acontece
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.03em] sm:text-5xl">
              Veja sua agenda, cadastre alunos e resolva reposicoes no mesmo sistema.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              O FitControl nao se apresenta como uma vitrine de funcionalidades. Ele acompanha o que voce precisa
              decidir ao longo do dia.
            </p>
          </div>
          <ButtonLink
            href="/entrar"
            variant="secondary"
            className="shrink-0 border-white bg-white hover:bg-accent-soft sm:min-w-52"
            style={{ color: "#370a42" }}
          >
            Conhecer o FitControl <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
