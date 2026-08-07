import { ArrowDown, ArrowRight, CheckCircle2 } from "lucide-react";

import { AgendaPreview } from "@/components/marketing/agenda-preview";
import { BenefitGrid } from "@/components/marketing/benefit-grid";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ButtonLink } from "@/components/ui/button";

const dores = [
  "Cancelamentos espalhados em conversas",
  "Horários livres difíceis de encontrar",
  "Reposições que ficam para depois",
];

const ganhos = [
  "Agenda do dia pronta para agir",
  "Encaixes válidos em poucos toques",
  "Histórico organizado sem planilhas paralelas",
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <div className="relative border-b border-border bg-[linear-gradient(135deg,#fffdfd_0%,#f7d9ff_52%,#ffffff_100%)]">
        <div className="landing-orb landing-orb-one" />
        <div className="landing-orb landing-orb-two" />
        <MarketingHeader />

        <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pb-20 lg:pt-10">
          <div className="relative z-10 max-w-3xl">
            <div className="motion-reveal inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/65 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur">
              <span className="size-1.5 rounded-full bg-action-hover" />
              Agenda inteligente para personal trainers
            </div>

            <h1 className="motion-reveal reveal-delay-1 mt-7 font-display text-[3.45rem] font-semibold leading-[0.88] tracking-[-0.045em] sm:text-7xl lg:text-[5.8rem]">
              Sua agenda muda.
              <span className="mt-2 block italic text-primary">Seu controle não precisa.</span>
            </h1>

            <p className="motion-reveal reveal-delay-2 mt-7 max-w-xl text-base leading-8 text-foreground/66 sm:text-lg">
              O FitControl transforma cancelamentos, horários vagos e reposições em uma rotina simples de organizar. Menos mensagens cruzadas, mais clareza para cuidar de cada aluno.
            </p>

            <div className="motion-reveal reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/entrar" className="sm:min-w-44">
                Entrar no FitControl <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#solucao" variant="secondary" className="sm:min-w-44">
                Ver como funciona <ArrowDown className="size-4" aria-hidden="true" />
              </ButtonLink>
            </div>

            <div className="motion-reveal reveal-delay-4 mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-primary/10 pt-5 text-xs font-semibold text-foreground/55">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-success" /> Mobile no dia a dia</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-success" /> Semana sob controle</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-success" /> Reposições organizadas</span>
            </div>
          </div>

          <div className="motion-reveal reveal-delay-2 relative z-10">
            <AgendaPreview />
          </div>
        </section>
      </div>

      <section id="problema" className="bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">O problema real</p>
            <h2 className="mt-5 max-w-lg font-display text-5xl font-semibold leading-[0.95] sm:text-6xl">
              O imprevisto de uma aula não pode bagunçar a semana inteira.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/62 sm:text-base">
              Quando a agenda vive entre memória, mensagens e anotações, cada falta exige mais energia do que deveria.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[2rem] border border-white/12 bg-white/6 p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">Sem controle central</p>
              <ul className="mt-10 space-y-5">
                {dores.map((dor) => (
                  <li key={dor} className="flex gap-3 text-sm leading-6 text-white/72">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-danger" />
                    {dor}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[2rem] bg-accent-soft p-6 text-foreground sm:translate-y-10 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Com FitControl</p>
              <ul className="mt-10 space-y-5">
                {ganhos.map((ganho) => (
                  <li key={ganho} className="flex gap-3 text-sm font-semibold leading-6">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    {ganho}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="solucao" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Uma operação mais leve</p>
            <h2 className="max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.025em] sm:text-6xl">
              Da primeira aula ao último encaixe, tudo no lugar certo.
            </h2>
          </div>
          <BenefitGrid />
        </div>
      </section>

      <section id="rotina" className="relative overflow-hidden border-y border-border bg-surface-muted">
        <div className="absolute inset-y-0 left-1/2 hidden w-px bg-border lg:block" />
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28 lg:pr-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">No ritmo da personal</p>
            <h2 className="mt-5 font-display text-5xl font-semibold leading-[0.95] sm:text-6xl">
              Hoje para agir. Semana para organizar.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-foreground/62">
              No celular, as aulas do dia aparecem primeiro. Quando for hora de planejar, a agenda semanal e mensal amplia a visão sem complicar a operação.
            </p>
          </div>
          <div className="flex items-center px-5 pb-20 sm:px-8 lg:px-16 lg:py-28">
            <blockquote className="border-l-2 border-action-hover pl-6 sm:pl-8">
              <p className="font-display text-3xl leading-[1.15] sm:text-4xl">
                &ldquo;A tecnologia deve acompanhar a aula, não interromper o atendimento.&rdquo;
              </p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
                Princípio de experiência FitControl
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-primary px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-16">
          <div className="landing-cta-orb" />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Sua agenda pode ser mais simples</p>
              <h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[0.92] sm:text-6xl">
                Transforme espaços vazios em decisões rápidas.
              </h2>
            </div>
            <ButtonLink
              href="/entrar"
              variant="secondary"
              className="shrink-0 border-white bg-white hover:bg-accent-soft sm:min-w-48"
              style={{ color: "#370a42" }}
            >
              Acessar FitControl <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
