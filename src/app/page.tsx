import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const destaques = [
  "Agenda semanal e mensal com leitura rápida de lotação, bloqueios e espaços livres.",
  "Fluxo pensado para cancelar e remarcar aulas com poucos toques.",
  "Documentação SDD integrada ao código para manter produto, banco e implementação alinhados.",
];

export default function HomePage() {
  return (
    <main className="grade-editorial min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col justify-between rounded-[2rem] border border-border bg-white/85 p-6 shadow-[0_30px_90px_rgba(55,10,66,0.08)] sm:p-8 lg:p-12">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-border bg-surface-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              FitControl • MVP operacional
            </div>

            <PageHeader
              eyebrow="Sistema para personal trainer"
              title="Organize agenda, reposições e decisões diárias com clareza editorial."
              description="O FitControl nasce com foco em uso real: mobile forte, desktop robusto, agenda semanal prioritária e visão mensal para planejar encaixes, faltas e ocupação."
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/entrar">Entrar no sistema</ButtonLink>
              <ButtonLink href="/painel" variant="secondary">
                Ver shell inicial
              </ButtonLink>
            </div>
          </div>

          <Card className="p-6 sm:p-7">
            <CardTitle className="text-3xl sm:text-4xl">Primeira entrega</CardTitle>
            <CardDescription className="mt-3">
              Fundação técnica, base visual, documentação SDD e modelagem inicial do banco prontas para sustentar as próximas fases.
            </CardDescription>

            <ul className="mt-8 space-y-4 text-sm leading-7 text-foreground/78">
              {destaques.map((item) => (
                <li
                  key={item}
                  className="rounded-[1.25rem] border border-border bg-surface-muted px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm text-foreground/60">
              A documentação viva do projeto fica em{" "}
              <code className="rounded bg-surface-strong px-2 py-1 text-xs">
                docs/sdd
              </code>
              .
            </p>
          </Card>
        </section>

        <footer className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Design editorial minimalista com preto e branco como base estrutural.</p>
          <Link href="/entrar" className="font-semibold text-primary transition hover:text-primary-strong">
            Ir para autenticação
          </Link>
        </footer>
      </div>
    </main>
  );
}
